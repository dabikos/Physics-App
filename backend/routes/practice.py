import re
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from server import db, get_current_user, record_daily_activity

from postgres import (
    get_practice_task,
    get_practice_test,
    is_postgres_configured,
    list_practice_tasks,
    list_practice_tests,
    list_random_practice_questions,
)

router = APIRouter()


class PracticeTaskSubmit(BaseModel):
    answer: str


class RandomPracticeTestRequest(BaseModel):
    section_ids: list[str] = []
    question_count: int = 10


def ensure_postgres_configured() -> None:
    if not is_postgres_configured():
        raise HTTPException(status_code=503, detail="PostgreSQL is not configured")


def normalize_answer(value: str) -> str:
    return re.sub(r"[^0-9a-zа-яё.,\-+*/^]", "", value.lower()).replace(",", ".").strip()


def extract_numbers(value: str) -> list[str]:
    return re.findall(r"-?\d+(?:\.\d+)?(?:e[+-]?\d+)?", value.replace(",", "."), flags=re.IGNORECASE)


def is_answer_correct(user_answer: str, expected_answer: str) -> bool:
    expected = normalize_answer(expected_answer)
    actual = normalize_answer(user_answer)
    expected_numbers = extract_numbers(expected_answer)
    actual_numbers = extract_numbers(user_answer)

    if actual and len(actual) >= 2 and (expected in actual or actual in expected):
        return True
    return any(num in expected_numbers for num in actual_numbers)


@router.get("/practice/tests")
async def get_practice_tests(
    section: str | None = Query(default=None),
    subsection: str | None = Query(default=None),
    topic: str | None = Query(default=None),
):
    ensure_postgres_configured()
    try:
        items = await list_practice_tests(
            section_id=section,
            subsection_id=subsection,
            topic_id=topic,
        )
        return {"items": items}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Practice tests unavailable: {exc}") from exc


@router.post("/practice/tests/random")
async def create_random_practice_test(
    payload: RandomPracticeTestRequest,
    current_user: dict = Depends(get_current_user),
):
    ensure_postgres_configured()
    allowed_counts = {5, 10, 15, 20, 30}
    if payload.question_count not in allowed_counts:
        raise HTTPException(status_code=400, detail="Question count must be one of 5, 10, 15, 20, 30")

    section_ids = [section.strip() for section in payload.section_ids if section.strip()]
    if not section_ids:
        raise HTTPException(status_code=400, detail="Select at least one section")

    try:
        questions = await list_random_practice_questions(section_ids=section_ids, limit=payload.question_count)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Random practice test unavailable: {exc}") from exc

    if len(questions) < payload.question_count:
        raise HTTPException(
            status_code=400,
            detail=f"Only {len(questions)} questions are available for selected sections",
        )

    test_id = f"random-practice-{uuid.uuid4().hex[:12]}"
    section = section_ids[0] if len(section_ids) == 1 else "mixed"
    test = {
        "id": test_id,
        "title": "Случайный тест",
        "section": section,
        "section_ids": section_ids,
        "difficulty": "standard",
        "questions": [
            {
                "question": item["question"],
                "options": item["options"],
                "correct": item["correct"],
                "explanation": item.get("explanation") or "",
            }
            for item in questions
        ],
        "time_limit": max(300, payload.question_count * 60),
        "generated": True,
        "source": "practice_random",
        "created_by": current_user["id"],
        "created_at": datetime.utcnow(),
    }
    await db.generated_tests.insert_one(test)
    test.pop("_id", None)

    return {"item": test}


@router.get("/practice/tests/{test_id}")
async def get_practice_test_by_id(test_id: str):
    ensure_postgres_configured()
    try:
        item = await get_practice_test(test_id)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Practice test unavailable: {exc}") from exc

    if not item:
        raise HTTPException(status_code=404, detail="Practice test not found")
    return {"item": item}


@router.get("/practice/tasks")
async def get_practice_tasks(
    section: str | None = Query(default=None),
    subsection: str | None = Query(default=None),
    topic: str | None = Query(default=None),
):
    ensure_postgres_configured()
    try:
        items = await list_practice_tasks(
            section_id=section,
            subsection_id=subsection,
            topic_id=topic,
        )
        return {"items": items}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Practice tasks unavailable: {exc}") from exc


@router.get("/practice/tasks/{task_id}")
async def get_practice_task_by_id(task_id: str):
    ensure_postgres_configured()
    try:
        item = await get_practice_task(task_id)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Practice task unavailable: {exc}") from exc

    if not item:
        raise HTTPException(status_code=404, detail="Practice task not found")
    return {"item": item}


@router.post("/practice/tasks/{task_id}/submit")
async def submit_practice_task(
    task_id: str,
    payload: PracticeTaskSubmit,
    current_user: dict = Depends(get_current_user),
):
    ensure_postgres_configured()
    try:
        item = await get_practice_task(task_id)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Practice task unavailable: {exc}") from exc

    if not item:
        raise HTTPException(status_code=404, detail="Practice task not found")

    correct = is_answer_correct(payload.answer, item.get("answer", ""))
    if correct:
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$addToSet": {"progress.completed_tasks": task_id}},
        )
        await record_daily_activity(current_user["id"], "solve", task_id, item.get("section_id") or item.get("section"))

    return {
        "correct": correct,
        "correct_answer": item.get("answer", ""),
        "explanation": item.get("solution", ""),
    }
