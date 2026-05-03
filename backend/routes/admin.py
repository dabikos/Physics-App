import os
import json
from datetime import date, datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from server import get_current_user
from postgres import (
    create_notification_campaign,
    get_postgres_pool,
    list_ai_prompts,
    list_app_settings,
    list_notification_campaigns,
    postgres_health,
    upsert_ai_prompt,
    upsert_app_setting,
)

router = APIRouter()

JSON_COLUMNS = {"translations", "formulas", "variables", "questions"}


class AppSettingUpsert(BaseModel):
    key: str = Field(min_length=1, max_length=120)
    value: Any = Field(default_factory=dict)
    description: Optional[str] = None


class AIPromptUpsert(BaseModel):
    key: str = Field(min_length=1, max_length=120)
    name: str = Field(min_length=1, max_length=200)
    prompt: str = Field(min_length=1)
    user_template: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = Field(default=None, ge=0, le=2)
    max_tokens: Optional[int] = Field(default=None, ge=1, le=20000)
    enabled: Optional[bool] = True


class NotificationCampaignCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=1000)
    target: dict[str, Any] = Field(default_factory=dict)
    data: dict[str, Any] = Field(default_factory=dict)
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = Field(default="draft", pattern="^(draft|scheduled)$")


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    admin_emails = {
        email.strip().lower()
        for email in os.environ.get("ADMIN_EMAILS", "").split(",")
        if email.strip()
    }

    user_email = str(current_user.get("email", "")).lower()
    if current_user.get("role") == "admin" or user_email in admin_emails:
        return current_user

    raise HTTPException(status_code=403, detail="Admin access required")


def _serialize_record(record: Any) -> dict[str, Any]:
    item = dict(record)
    for key, value in item.items():
        if key in JSON_COLUMNS and isinstance(value, str):
            item[key] = json.loads(value)
        elif isinstance(value, (datetime, date)):
            item[key] = value.isoformat()
    return item


@router.get("/health/postgres")
async def check_postgres_health():
    try:
        return await postgres_health()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"PostgreSQL unavailable: {exc}") from exc


@router.get("/admin/settings")
async def get_admin_settings(_: dict = Depends(require_admin)):
    return {"items": await list_app_settings()}


@router.get("/admin/content/overview")
async def get_admin_content_overview(_: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT
                (SELECT COUNT(*) FROM lesson_sections) AS sections,
                (SELECT COUNT(*) FROM lesson_subsections) AS subsections,
                (SELECT COUNT(*) FROM lesson_topics) AS topics,
                (SELECT COUNT(*) FROM practice_tests) AS tests,
                (SELECT COALESCE(SUM(jsonb_array_length(questions)), 0) FROM practice_tests) AS test_questions,
                (SELECT COUNT(*) FROM practice_tasks) AS tasks,
                (SELECT COUNT(*) FROM physics_formulas) AS formulas,
                (SELECT COUNT(*) FROM app_settings) AS settings,
                (SELECT COUNT(*) FROM ai_prompts) AS ai_prompts,
                (SELECT COUNT(*) FROM notification_campaigns) AS notification_campaigns
            """
        )

        sections = await conn.fetch(
            """
            SELECT
                s.id,
                s.name,
                s.icon,
                s.color,
                s.is_published,
                COUNT(DISTINCT ss.id) AS subsection_count,
                COUNT(DISTINCT lt.id) AS topic_count,
                COUNT(DISTINCT pt.id) AS test_count,
                COUNT(DISTINCT ptask.id) AS task_count,
                COUNT(DISTINCT pf.id) AS formula_count
            FROM lesson_sections s
            LEFT JOIN lesson_subsections ss ON ss.section_id = s.id
            LEFT JOIN lesson_topics lt ON lt.section_id = s.id
            LEFT JOIN practice_tests pt ON pt.section_id = s.id
            LEFT JOIN practice_tasks ptask ON ptask.section_id = s.id
            LEFT JOIN physics_formulas pf ON pf.section_id = s.id
            GROUP BY s.id
            ORDER BY s.order_index, s.id
            """
        )

    return {
        "totals": _serialize_record(row),
        "sections": [_serialize_record(section) for section in sections],
    }


@router.get("/admin/content/lessons")
async def get_admin_lessons(_: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        sections = await conn.fetch(
            """
            SELECT id, name, translations, icon, color, order_index, is_published, source, updated_at
            FROM lesson_sections
            ORDER BY order_index, id
            """
        )
        subsections = await conn.fetch(
            """
            SELECT id, section_id, name, translations, order_index, is_published, source, updated_at
            FROM lesson_subsections
            ORDER BY section_id, order_index, id
            """
        )
        topics = await conn.fetch(
            """
            SELECT id, section_id, subsection_id, title, translations, order_index, is_published, source, updated_at
            FROM lesson_topics
            ORDER BY section_id, subsection_id, order_index, id
            """
        )

    return {
        "sections": [_serialize_record(item) for item in sections],
        "subsections": [_serialize_record(item) for item in subsections],
        "topics": [_serialize_record(item) for item in topics],
    }


@router.get("/admin/content/tests")
async def get_admin_tests(
    section_id: Optional[str] = None,
    subsection_id: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    _: dict = Depends(require_admin),
):
    conditions = []
    values: list[Any] = []
    if section_id:
        values.append(section_id)
        conditions.append(f"section_id = ${len(values)}")
    if subsection_id:
        values.append(subsection_id)
        conditions.append(f"subsection_id = ${len(values)}")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    values.extend([limit, offset])
    limit_index = len(values) - 1
    offset_index = len(values)

    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        total = await conn.fetchval(
            f"SELECT COUNT(*) FROM practice_tests {where_clause}",
            *values[:-2],
        )
        rows = await conn.fetch(
            f"""
            SELECT
                id, section_id, subsection_id, topic_id, title, difficulty, questions,
                translations, time_limit, order_index, is_published, source, updated_at
            FROM practice_tests
            {where_clause}
            ORDER BY section_id, subsection_id, order_index, id
            LIMIT ${limit_index} OFFSET ${offset_index}
            """,
            *values,
        )

    items = [_serialize_record(row) for row in rows]
    for item in items:
        item["question_count"] = len(item.get("questions") or [])
    return {"total": int(total or 0), "items": items}


@router.get("/admin/content/tasks")
async def get_admin_tasks(
    section_id: Optional[str] = None,
    subsection_id: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    _: dict = Depends(require_admin),
):
    conditions = []
    values: list[Any] = []
    if section_id:
        values.append(section_id)
        conditions.append(f"section_id = ${len(values)}")
    if subsection_id:
        values.append(subsection_id)
        conditions.append(f"subsection_id = ${len(values)}")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    values.extend([limit, offset])
    limit_index = len(values) - 1
    offset_index = len(values)

    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        total = await conn.fetchval(
            f"SELECT COUNT(*) FROM practice_tasks {where_clause}",
            *values[:-2],
        )
        rows = await conn.fetch(
            f"""
            SELECT
                id, section_id, subsection_id, topic_id, topic_title, title,
                problem_text, given_data, find_text, solution, answer, difficulty,
                translations, order_index, is_published, source, updated_at
            FROM practice_tasks
            {where_clause}
            ORDER BY section_id, subsection_id, order_index, id
            LIMIT ${limit_index} OFFSET ${offset_index}
            """,
            *values,
        )

    return {"total": int(total or 0), "items": [_serialize_record(row) for row in rows]}


@router.get("/admin/content/formulas")
async def get_admin_formulas(
    section_id: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    _: dict = Depends(require_admin),
):
    values: list[Any] = []
    where_clause = ""
    if section_id:
        values.append(section_id)
        where_clause = "WHERE section_id = $1"

    values.extend([limit, offset])
    limit_index = len(values) - 1
    offset_index = len(values)

    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        total = await conn.fetchval(
            f"SELECT COUNT(*) FROM physics_formulas {where_clause}",
            *values[:-2],
        )
        rows = await conn.fetch(
            f"""
            SELECT
                id, section_id, name, formula, description, variables, unit,
                translations, order_index, is_published, source, updated_at
            FROM physics_formulas
            {where_clause}
            ORDER BY section_id, order_index, id
            LIMIT ${limit_index} OFFSET ${offset_index}
            """,
            *values,
        )

    return {"total": int(total or 0), "items": [_serialize_record(row) for row in rows]}


@router.put("/admin/settings/{key}")
async def put_admin_setting(
    key: str,
    payload: AppSettingUpsert,
    current_user: dict = Depends(require_admin),
):
    if payload.key != key:
        raise HTTPException(status_code=400, detail="Path key and payload key must match")

    item = await upsert_app_setting(
        key=payload.key,
        value=payload.value,
        description=payload.description,
        updated_by=current_user["id"],
    )
    return {"item": item}


@router.get("/admin/ai-prompts")
async def get_admin_ai_prompts(_: dict = Depends(require_admin)):
    return {"items": await list_ai_prompts()}


@router.put("/admin/ai-prompts/{key}")
async def put_admin_ai_prompt(
    key: str,
    payload: AIPromptUpsert,
    current_user: dict = Depends(require_admin),
):
    if payload.key != key:
        raise HTTPException(status_code=400, detail="Path key and payload key must match")

    item = await upsert_ai_prompt(payload.model_dump(), updated_by=current_user["id"])
    return {"item": item}


@router.get("/admin/notification-campaigns")
async def get_admin_notification_campaigns(_: dict = Depends(require_admin)):
    return {"items": await list_notification_campaigns()}


@router.post("/admin/notification-campaigns")
async def post_admin_notification_campaign(
    payload: NotificationCampaignCreate,
    current_user: dict = Depends(require_admin),
):
    item = await create_notification_campaign(payload.model_dump(), created_by=current_user["id"])
    return {"item": item}
