import re
import random
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel

from server import (
    FREE_TASKS_PER_SUBSECTION,
    FREE_TESTS_PER_SUBSECTION,
    apply_group_access_locks,
    db,
    get_current_user,
    get_optional_current_user,
    is_item_locked,
    is_user_pro,
    parse_accept_language,
    pro_required_detail,
    record_daily_activity,
    strip_locked_task,
    strip_locked_test,
)

from postgres import (
    get_practice_task,
    get_practice_test,
    is_postgres_configured,
    list_practice_tasks,
    list_practice_tests,
    list_random_practice_questions,
)

router = APIRouter()
_rng = random.SystemRandom()


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


def shuffle_question_options(question: dict) -> dict:
    options = list(question.get("options") or [])
    correct_index = int(question.get("correct", 0) or 0)
    if not options or correct_index < 0 or correct_index >= len(options):
        return question

    correct_value = options[correct_index]
    indexed_options = list(enumerate(options))
    _rng.shuffle(indexed_options)

    shuffled_options = [option for _, option in indexed_options]
    shuffled_correct_index = shuffled_options.index(correct_value)

    return {
        **question,
        "options": shuffled_options,
        "correct": shuffled_correct_index,
    }


@router.get("/practice/tests")
async def get_practice_tests(
    section: str | None = Query(default=None),
    subsection: str | None = Query(default=None),
    topic: str | None = Query(default=None),
    accept_language: str | None = Header(default=None, alias="Accept-Language"),
    current_user: dict | None = Depends(get_optional_current_user),
):
    ensure_postgres_configured()
    try:
        items = await list_practice_tests(
            section_id=section,
            subsection_id=subsection,
            topic_id=topic,
            lang=parse_accept_language(accept_language),
        )
        return {
            "items": apply_group_access_locks(
                items,
                "subsection_id",
                FREE_TESTS_PER_SUBSECTION,
                is_user_pro(current_user),
                strip_locked=strip_locked_test,
            )
        }
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Practice tests unavailable: {exc}") from exc


@router.post("/practice/tests/random")
async def create_random_practice_test(
    payload: RandomPracticeTestRequest,
    current_user: dict = Depends(get_current_user),
    accept_language: str | None = Header(default=None, alias="Accept-Language"),
):
    ensure_postgres_configured()
    allowed_counts = {5, 10, 15, 20, 30}
    if payload.question_count not in allowed_counts:
        raise HTTPException(status_code=400, detail="Question count must be one of 5, 10, 15, 20, 30")

    section_ids = [section.strip() for section in payload.section_ids if section.strip()]
    if not section_ids:
        raise HTTPException(status_code=400, detail="Select at least one section")

    try:
        questions = await list_random_practice_questions(
            section_ids=section_ids,
            limit=payload.question_count,
            lang=parse_accept_language(accept_language),
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Random practice test unavailable: {exc}") from exc

    if len(questions) < payload.question_count:
        raise HTTPException(
            status_code=400,
            detail=f"Only {len(questions)} questions are available for selected sections",
        )

    test_id = f"random-practice-{uuid.uuid4().hex[:12]}"
    section = section_ids[0] if len(section_ids) == 1 else "mixed"
    shuffled_questions = [
        shuffle_question_options({
            "question": item["question"],
            "options": item["options"],
            "correct": item["correct"],
            "explanation": item.get("explanation") or "",
        })
        for item in questions
    ]

    test = {
        "id": test_id,
        "title": "Случайный тест",
        "section": section,
        "section_ids": section_ids,
        "difficulty": "standard",
        "questions": shuffled_questions,
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
async def get_practice_test_by_id(
    test_id: str,
    accept_language: str | None = Header(default=None, alias="Accept-Language"),
    current_user: dict | None = Depends(get_optional_current_user),
):
    ensure_postgres_configured()
    try:
        item = await get_practice_test(test_id, lang=parse_accept_language(accept_language))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Practice test unavailable: {exc}") from exc

    if not item:
        raise HTTPException(status_code=404, detail="Practice test not found")
    sibling_items = await list_practice_tests(
        section_id=item.get("section_id") or item.get("section"),
        subsection_id=item.get("subsection_id"),
        lang=parse_accept_language(accept_language),
    )
    if is_item_locked(
        sibling_items,
        test_id,
        "subsection_id",
        FREE_TESTS_PER_SUBSECTION,
        is_user_pro(current_user),
    ):
        raise HTTPException(status_code=403, detail=pro_required_detail("practice_test"))
    return {"item": item}


@router.get("/practice/tasks")
async def get_practice_tasks(
    section: str | None = Query(default=None),
    subsection: str | None = Query(default=None),
    topic: str | None = Query(default=None),
    accept_language: str | None = Header(default=None, alias="Accept-Language"),
    current_user: dict | None = Depends(get_optional_current_user),
):
    ensure_postgres_configured()
    try:
        items = await list_practice_tasks(
            section_id=section,
            subsection_id=subsection,
            topic_id=topic,
            lang=parse_accept_language(accept_language),
        )
        return {
            "items": apply_group_access_locks(
                items,
                "subsection_id",
                FREE_TASKS_PER_SUBSECTION,
                is_user_pro(current_user),
                strip_locked=strip_locked_task,
            )
        }
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Practice tasks unavailable: {exc}") from exc


@router.get("/practice/tasks/{task_id}")
async def get_practice_task_by_id(
    task_id: str,
    accept_language: str | None = Header(default=None, alias="Accept-Language"),
    current_user: dict | None = Depends(get_optional_current_user),
):
    ensure_postgres_configured()
    try:
        item = await get_practice_task(task_id, lang=parse_accept_language(accept_language))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Practice task unavailable: {exc}") from exc

    if not item:
        raise HTTPException(status_code=404, detail="Practice task not found")
    sibling_items = await list_practice_tasks(
        section_id=item.get("section_id") or item.get("section"),
        subsection_id=item.get("subsection_id"),
        lang=parse_accept_language(accept_language),
    )
    if is_item_locked(
        sibling_items,
        task_id,
        "subsection_id",
        FREE_TASKS_PER_SUBSECTION,
        is_user_pro(current_user),
    ):
        raise HTTPException(status_code=403, detail=pro_required_detail("practice_task"))
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
    sibling_items = await list_practice_tasks(
        section_id=item.get("section_id") or item.get("section"),
        subsection_id=item.get("subsection_id"),
    )
    if is_item_locked(sibling_items, task_id, "subsection_id", FREE_TASKS_PER_SUBSECTION, is_user_pro(current_user)):
        raise HTTPException(status_code=403, detail=pro_required_detail("practice_task"))

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
