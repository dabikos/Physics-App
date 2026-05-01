from fastapi import APIRouter, HTTPException, Query

from postgres import (
    get_practice_task,
    get_practice_test,
    is_postgres_configured,
    list_practice_tasks,
    list_practice_tests,
)

router = APIRouter()


def ensure_postgres_configured() -> None:
    if not is_postgres_configured():
        raise HTTPException(status_code=503, detail="PostgreSQL is not configured")


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
