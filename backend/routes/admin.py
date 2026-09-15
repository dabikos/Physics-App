import os
import json
from datetime import date, datetime, timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from server import db, get_current_user
from postgres import (
    clear_postgres_content_cache,
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

JSON_COLUMNS = {"translations", "formulas", "variables", "questions", "video"}


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


class PracticeTestUpsert(BaseModel):
    id: Optional[str] = Field(default=None, min_length=1, max_length=200)
    section_id: str = Field(min_length=1, max_length=120)
    subsection_id: str = Field(min_length=1, max_length=160)
    topic_id: Optional[str] = Field(default=None, max_length=200)
    title: str = Field(min_length=1, max_length=300)
    difficulty: str = Field(default="basic", min_length=1, max_length=60)
    questions: list[dict[str, Any]] = Field(default_factory=list)
    translations: dict[str, Any] = Field(default_factory=dict)
    time_limit: int = Field(default=300, ge=0)
    order_index: int = 0
    is_published: bool = True


class PracticeTaskUpsert(BaseModel):
    id: Optional[str] = Field(default=None, min_length=1, max_length=200)
    section_id: str = Field(min_length=1, max_length=120)
    subsection_id: str = Field(min_length=1, max_length=160)
    topic_id: Optional[str] = Field(default=None, max_length=200)
    topic_title: Optional[str] = Field(default=None, max_length=300)
    title: str = Field(min_length=1, max_length=300)
    problem_text: str = Field(min_length=1)
    given_data: str = ""
    find_text: str = ""
    solution: str = ""
    answer: str = ""
    difficulty: str = Field(default="medium", min_length=1, max_length=60)
    translations: dict[str, Any] = Field(default_factory=dict)
    order_index: int = 0
    is_published: bool = True


class FormulaUpsert(BaseModel):
    id: Optional[str] = Field(default=None, min_length=1, max_length=200)
    section_id: str = Field(min_length=1, max_length=120)
    name: str = Field(min_length=1, max_length=300)
    formula: str = Field(min_length=1)
    description: str = ""
    variables: dict[str, Any] = Field(default_factory=dict)
    unit: str = ""
    translations: dict[str, Any] = Field(default_factory=dict)
    order_index: int = 0
    is_published: bool = True


class LessonSectionUpsert(BaseModel):
    id: Optional[str] = Field(default=None, min_length=1, max_length=120)
    name: str = Field(min_length=1, max_length=300)
    translations: dict[str, Any] = Field(default_factory=dict)
    icon: Optional[str] = None
    color: Optional[str] = None
    order_index: int = 0
    is_published: bool = True


class LessonSubsectionUpsert(BaseModel):
    id: Optional[str] = Field(default=None, min_length=1, max_length=160)
    section_id: str = Field(min_length=1, max_length=120)
    name: str = Field(min_length=1, max_length=300)
    translations: dict[str, Any] = Field(default_factory=dict)
    order_index: int = 0
    is_published: bool = True


class LessonTopicUpsert(BaseModel):
    id: Optional[str] = Field(default=None, min_length=1, max_length=200)
    section_id: str = Field(min_length=1, max_length=120)
    subsection_id: str = Field(min_length=1, max_length=160)
    title: str = Field(min_length=1, max_length=300)
    brief_info: str = ""
    example_problem: str = ""
    formulas: list[Any] = Field(default_factory=list)
    translations: dict[str, Any] = Field(default_factory=dict)
    video: Optional[dict[str, Any]] = None
    order_index: int = 0
    is_published: bool = True


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


def _jsonb(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False)


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
    try:
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
                WITH
                    subsection_counts AS (
                        SELECT section_id, COUNT(*) AS count
                        FROM lesson_subsections
                        GROUP BY section_id
                    ),
                    topic_counts AS (
                        SELECT section_id, COUNT(*) AS count
                        FROM lesson_topics
                        GROUP BY section_id
                    ),
                    test_counts AS (
                        SELECT section_id, COUNT(*) AS count
                        FROM practice_tests
                        GROUP BY section_id
                    ),
                    task_counts AS (
                        SELECT section_id, COUNT(*) AS count
                        FROM practice_tasks
                        GROUP BY section_id
                    ),
                    formula_counts AS (
                        SELECT section_id, COUNT(*) AS count
                        FROM physics_formulas
                        GROUP BY section_id
                    )
                SELECT
                    s.id,
                    s.name,
                    s.icon,
                    s.color,
                    s.is_published,
                    COALESCE(sc.count, 0) AS subsection_count,
                    COALESCE(tc.count, 0) AS topic_count,
                    COALESCE(ptc.count, 0) AS test_count,
                    COALESCE(ptaskc.count, 0) AS task_count,
                    COALESCE(fc.count, 0) AS formula_count
                FROM lesson_sections s
                LEFT JOIN subsection_counts sc ON sc.section_id = s.id
                LEFT JOIN topic_counts tc ON tc.section_id = s.id
                LEFT JOIN test_counts ptc ON ptc.section_id = s.id
                LEFT JOIN task_counts ptaskc ON ptaskc.section_id = s.id
                LEFT JOIN formula_counts fc ON fc.section_id = s.id
                ORDER BY s.order_index, s.id
                """
            )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Admin overview failed: {type(exc).__name__}: {exc!r}",
        ) from exc

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
            SELECT
                id, section_id, subsection_id, title, brief_info, example_problem, formulas,
                translations, video, order_index, is_published, source, updated_at
            FROM lesson_topics
            ORDER BY section_id, subsection_id, order_index, id
            """
        )

    return {
        "sections": [_serialize_record(item) for item in sections],
        "subsections": [_serialize_record(item) for item in subsections],
        "topics": [_serialize_record(item) for item in topics],
    }


@router.post("/admin/content/lessons/sections")
async def create_admin_lesson_section(payload: LessonSectionUpsert, _: dict = Depends(require_admin)):
    item_id = payload.id or payload.name.lower().strip().replace(" ", "-")
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO lesson_sections (
                id, name, translations, icon, color, order_index, is_published, source
            ) VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, 'admin')
            RETURNING id, name, translations, icon, color, order_index, is_published, source, updated_at
            """,
            item_id,
            payload.name,
            _jsonb(payload.translations),
            payload.icon,
            payload.color,
            payload.order_index,
            payload.is_published,
        )
    clear_postgres_content_cache()
    return {"item": _serialize_record(row)}


@router.put("/admin/content/lessons/sections/{section_id}")
async def update_admin_lesson_section(section_id: str, payload: LessonSectionUpsert, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE lesson_sections
            SET name = $2,
                translations = $3::jsonb,
                icon = $4,
                color = $5,
                order_index = $6,
                is_published = $7,
                source = 'admin',
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, name, translations, icon, color, order_index, is_published, source, updated_at
            """,
            section_id,
            payload.name,
            _jsonb(payload.translations),
            payload.icon,
            payload.color,
            payload.order_index,
            payload.is_published,
        )
    if not row:
        raise HTTPException(status_code=404, detail="Lesson section not found")
    clear_postgres_content_cache()
    return {"item": _serialize_record(row)}


@router.delete("/admin/content/lessons/sections/{section_id}")
async def delete_admin_lesson_section(section_id: str, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM lesson_sections WHERE id = $1", section_id)
    clear_postgres_content_cache()
    return {"deleted": result.endswith("1")}


@router.post("/admin/content/lessons/subsections")
async def create_admin_lesson_subsection(payload: LessonSubsectionUpsert, _: dict = Depends(require_admin)):
    item_id = payload.id or payload.name.lower().strip().replace(" ", "-")
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO lesson_subsections (
                id, section_id, name, translations, order_index, is_published, source
            ) VALUES ($1, $2, $3, $4::jsonb, $5, $6, 'admin')
            RETURNING id, section_id, name, translations, order_index, is_published, source, updated_at
            """,
            item_id,
            payload.section_id,
            payload.name,
            _jsonb(payload.translations),
            payload.order_index,
            payload.is_published,
        )
    clear_postgres_content_cache()
    return {"item": _serialize_record(row)}


@router.put("/admin/content/lessons/subsections/{subsection_id}")
async def update_admin_lesson_subsection(subsection_id: str, payload: LessonSubsectionUpsert, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE lesson_subsections
            SET section_id = $2,
                name = $3,
                translations = $4::jsonb,
                order_index = $5,
                is_published = $6,
                source = 'admin',
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, section_id, name, translations, order_index, is_published, source, updated_at
            """,
            subsection_id,
            payload.section_id,
            payload.name,
            _jsonb(payload.translations),
            payload.order_index,
            payload.is_published,
        )
    if not row:
        raise HTTPException(status_code=404, detail="Lesson subsection not found")
    clear_postgres_content_cache()
    return {"item": _serialize_record(row)}


@router.delete("/admin/content/lessons/subsections/{subsection_id}")
async def delete_admin_lesson_subsection(subsection_id: str, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM lesson_subsections WHERE id = $1", subsection_id)
    clear_postgres_content_cache()
    return {"deleted": result.endswith("1")}


@router.post("/admin/content/lessons/topics")
async def create_admin_lesson_topic(payload: LessonTopicUpsert, _: dict = Depends(require_admin)):
    item_id = payload.id or payload.title.lower().strip().replace(" ", "-")
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO lesson_topics (
                id, section_id, subsection_id, title, brief_info, example_problem,
                formulas, translations, video, order_index, is_published, source
            ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10, $11, 'admin')
            RETURNING
                id, section_id, subsection_id, title, brief_info, example_problem, formulas,
                translations, video, order_index, is_published, source, updated_at
            """,
            item_id,
            payload.section_id,
            payload.subsection_id,
            payload.title,
            payload.brief_info,
            payload.example_problem,
            _jsonb(payload.formulas),
            _jsonb(payload.translations),
            _jsonb(payload.video) if payload.video is not None else None,
            payload.order_index,
            payload.is_published,
        )
    clear_postgres_content_cache()
    return {"item": _serialize_record(row)}


@router.put("/admin/content/lessons/topics/{topic_id}")
async def update_admin_lesson_topic(topic_id: str, payload: LessonTopicUpsert, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE lesson_topics
            SET section_id = $2,
                subsection_id = $3,
                title = $4,
                brief_info = $5,
                example_problem = $6,
                formulas = $7::jsonb,
                translations = $8::jsonb,
                video = $9::jsonb,
                order_index = $10,
                is_published = $11,
                source = 'admin',
                updated_at = NOW()
            WHERE id = $1
            RETURNING
                id, section_id, subsection_id, title, brief_info, example_problem, formulas,
                translations, video, order_index, is_published, source, updated_at
            """,
            topic_id,
            payload.section_id,
            payload.subsection_id,
            payload.title,
            payload.brief_info,
            payload.example_problem,
            _jsonb(payload.formulas),
            _jsonb(payload.translations),
            _jsonb(payload.video) if payload.video is not None else None,
            payload.order_index,
            payload.is_published,
        )
    if not row:
        raise HTTPException(status_code=404, detail="Lesson topic not found")
    clear_postgres_content_cache()
    return {"item": _serialize_record(row)}


@router.delete("/admin/content/lessons/topics/{topic_id}")
async def delete_admin_lesson_topic(topic_id: str, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM lesson_topics WHERE id = $1", topic_id)
    clear_postgres_content_cache()
    return {"deleted": result.endswith("1")}


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


@router.post("/admin/content/tests")
async def create_admin_test(payload: PracticeTestUpsert, _: dict = Depends(require_admin)):
    item_id = payload.id or payload.title.lower().strip().replace(" ", "-")
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO practice_tests (
                id, section_id, subsection_id, topic_id, title, difficulty, questions,
                translations, time_limit, order_index, is_published, source
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10, $11, 'admin')
            RETURNING *
            """,
            item_id,
            payload.section_id,
            payload.subsection_id,
            payload.topic_id,
            payload.title,
            payload.difficulty,
            _jsonb(payload.questions),
            _jsonb(payload.translations),
            payload.time_limit,
            payload.order_index,
            payload.is_published,
        )
    clear_postgres_content_cache()
    return {"item": _serialize_record(row)}


@router.put("/admin/content/tests/{test_id}")
async def update_admin_test(
    test_id: str,
    payload: PracticeTestUpsert,
    _: dict = Depends(require_admin),
):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE practice_tests
            SET
                section_id = $2,
                subsection_id = $3,
                topic_id = $4,
                title = $5,
                difficulty = $6,
                questions = $7::jsonb,
                translations = $8::jsonb,
                time_limit = $9,
                order_index = $10,
                is_published = $11,
                source = CASE WHEN source = 'seed' THEN source ELSE 'admin' END,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            """,
            test_id,
            payload.section_id,
            payload.subsection_id,
            payload.topic_id,
            payload.title,
            payload.difficulty,
            _jsonb(payload.questions),
            _jsonb(payload.translations),
            payload.time_limit,
            payload.order_index,
            payload.is_published,
        )
    if row is None:
        raise HTTPException(status_code=404, detail="Test not found")
    clear_postgres_content_cache()
    return {"item": _serialize_record(row)}


@router.delete("/admin/content/tests/{test_id}")
async def delete_admin_test(test_id: str, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        status = await conn.execute("DELETE FROM practice_tests WHERE id = $1", test_id)
    clear_postgres_content_cache()
    return {"success": status.endswith("1")}


@router.post("/admin/content/tasks")
async def create_admin_task(payload: PracticeTaskUpsert, _: dict = Depends(require_admin)):
    item_id = payload.id or payload.title.lower().strip().replace(" ", "-")
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO practice_tasks (
                id, section_id, subsection_id, topic_id, topic_title, title,
                problem_text, given_data, find_text, solution, answer, difficulty,
                translations, order_index, is_published, source
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14, $15, 'admin')
            RETURNING *
            """,
            item_id,
            payload.section_id,
            payload.subsection_id,
            payload.topic_id,
            payload.topic_title,
            payload.title,
            payload.problem_text,
            payload.given_data,
            payload.find_text,
            payload.solution,
            payload.answer,
            payload.difficulty,
            _jsonb(payload.translations),
            payload.order_index,
            payload.is_published,
        )
    clear_postgres_content_cache()
    return {"item": _serialize_record(row)}


@router.put("/admin/content/tasks/{task_id}")
async def update_admin_task(
    task_id: str,
    payload: PracticeTaskUpsert,
    _: dict = Depends(require_admin),
):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE practice_tasks
            SET
                section_id = $2,
                subsection_id = $3,
                topic_id = $4,
                topic_title = $5,
                title = $6,
                problem_text = $7,
                given_data = $8,
                find_text = $9,
                solution = $10,
                answer = $11,
                difficulty = $12,
                translations = $13::jsonb,
                order_index = $14,
                is_published = $15,
                source = CASE WHEN source = 'seed' THEN source ELSE 'admin' END,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            """,
            task_id,
            payload.section_id,
            payload.subsection_id,
            payload.topic_id,
            payload.topic_title,
            payload.title,
            payload.problem_text,
            payload.given_data,
            payload.find_text,
            payload.solution,
            payload.answer,
            payload.difficulty,
            _jsonb(payload.translations),
            payload.order_index,
            payload.is_published,
        )
    if row is None:
        raise HTTPException(status_code=404, detail="Task not found")
    clear_postgres_content_cache()
    return {"item": _serialize_record(row)}


@router.delete("/admin/content/tasks/{task_id}")
async def delete_admin_task(task_id: str, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        status = await conn.execute("DELETE FROM practice_tasks WHERE id = $1", task_id)
    clear_postgres_content_cache()
    return {"success": status.endswith("1")}


@router.post("/admin/content/formulas")
async def create_admin_formula(payload: FormulaUpsert, _: dict = Depends(require_admin)):
    item_id = payload.id or payload.name.lower().strip().replace(" ", "-")
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO physics_formulas (
                id, section_id, name, formula, description, variables, unit,
                translations, order_index, is_published, source
            )
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, $9, $10, 'admin')
            RETURNING *
            """,
            item_id,
            payload.section_id,
            payload.name,
            payload.formula,
            payload.description,
            _jsonb(payload.variables),
            payload.unit,
            _jsonb(payload.translations),
            payload.order_index,
            payload.is_published,
        )
    clear_postgres_content_cache()
    return {"item": _serialize_record(row)}


@router.put("/admin/content/formulas/{formula_id}")
async def update_admin_formula(
    formula_id: str,
    payload: FormulaUpsert,
    _: dict = Depends(require_admin),
):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE physics_formulas
            SET
                section_id = $2,
                name = $3,
                formula = $4,
                description = $5,
                variables = $6::jsonb,
                unit = $7,
                translations = $8::jsonb,
                order_index = $9,
                is_published = $10,
                source = CASE WHEN source = 'seed' THEN source ELSE 'admin' END,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            """,
            formula_id,
            payload.section_id,
            payload.name,
            payload.formula,
            payload.description,
            _jsonb(payload.variables),
            payload.unit,
            _jsonb(payload.translations),
            payload.order_index,
            payload.is_published,
        )
    if row is None:
        raise HTTPException(status_code=404, detail="Formula not found")
    clear_postgres_content_cache()
    return {"item": _serialize_record(row)}


@router.delete("/admin/content/formulas/{formula_id}")
async def delete_admin_formula(formula_id: str, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        status = await conn.execute("DELETE FROM physics_formulas WHERE id = $1", formula_id)
    clear_postgres_content_cache()
    return {"success": status.endswith("1")}


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


# ==================== User Analytics & Statistics ====================

@router.get("/admin/analytics/overview")
async def get_admin_analytics_overview(_: dict = Depends(require_admin)):
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)

    # 1. Total counts
    total_users = await db.users.count_documents({})
    students_count = await db.users.count_documents({"role": "student"})
    teachers_count = await db.users.count_documents({"role": "teacher"})
    new_users_7d = await db.users.count_documents({"created_at": {"$gte": seven_days_ago}})
    new_users_30d = await db.users.count_documents({"created_at": {"$gte": thirty_days_ago}})

    # 2. Test results stats
    total_tests_completed = await db.test_results.count_documents({})
    score_pipeline = [
        {
            "$group": {
                "_id": None,
                "avg_score": {"$avg": "$score"},
                "avg_percentage": {
                    "$avg": {
                        "$cond": [
                            {"$gt": ["$total_questions", 0]},
                            {"$multiply": [{"$divide": ["$score", "$total_questions"]}, 100]},
                            0,
                        ]
                    }
                },
            }
        }
    ]
    score_res = await db.test_results.aggregate(score_pipeline).to_list(1)
    avg_accuracy = round(float(score_res[0]["avg_percentage"]), 1) if score_res and score_res[0].get("avg_percentage") is not None else 0.0

    # 3. Timeline (last 30 days)
    timeline_days: dict[str, dict[str, Any]] = {}
    for i in range(29, -1, -1):
        day_date = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        timeline_days[day_date] = {"date": day_date, "users": 0, "tests": 0}

    user_timeline_pipeline = [
        {"$match": {"created_at": {"$gte": thirty_days_ago}}},
        {"$project": {"day": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}}}},
        {"$group": {"_id": "$day", "count": {"$sum": 1}}},
    ]
    user_timeline_res = await db.users.aggregate(user_timeline_pipeline).to_list(100)
    for item in user_timeline_res:
        day = item["_id"]
        if day in timeline_days:
            timeline_days[day]["users"] = item["count"]

    test_timeline_pipeline = [
        {"$match": {"completed_at": {"$gte": thirty_days_ago}}},
        {"$project": {"day": {"$dateToString": {"format": "%Y-%m-%d", "date": "$completed_at"}}}},
        {"$group": {"_id": "$day", "count": {"$sum": 1}}},
    ]
    test_timeline_res = await db.test_results.aggregate(test_timeline_pipeline).to_list(100)
    for item in test_timeline_res:
        day = item["_id"]
        if day in timeline_days:
            timeline_days[day]["tests"] = item["count"]

    timeline = list(timeline_days.values())

    # 4. Class / Grade distribution
    class_pipeline = [
        {"$match": {"class_id": {"$ne": None, "$ne": ""}}},
        {"$group": {"_id": "$class_id", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    class_res = await db.users.aggregate(class_pipeline).to_list(20)
    class_distribution = [
        {"name": f"{item['_id']} класс" if str(item['_id']).isdigit() else str(item['_id']), "value": item["count"], "grade": str(item["_id"]), "count": item["count"]}
        for item in class_res
    ]

    # 5. Section performance
    section_pipeline = [
        {"$match": {"section": {"$ne": None, "$ne": ""}}},
        {
            "$group": {
                "_id": "$section",
                "tests_count": {"$sum": 1},
                "avg_percentage": {
                    "$avg": {
                        "$cond": [
                            {"$gt": ["$total_questions", 0]},
                            {"$multiply": [{"$divide": ["$score", "$total_questions"]}, 100]},
                            0,
                        ]
                    }
                },
            }
        },
        {"$sort": {"tests_count": -1}},
    ]
    section_res = await db.test_results.aggregate(section_pipeline).to_list(20)
    section_stats = [
        {
            "section": str(item["_id"]),
            "tests_count": item["tests_count"],
            "avg_score": round(float(item["avg_percentage"]), 1) if item.get("avg_percentage") is not None else 0.0,
        }
        for item in section_res
    ]

    # 6. Score distribution brackets
    score_brackets = [
        {"name": "Отлично (>85%)", "bracket": "Отличный (>85%)", "value": 0, "count": 0, "color": "#10B981"},
        {"name": "Хорошо (70-85%)", "bracket": "Хороший (70-85%)", "value": 0, "count": 0, "color": "#3B82F6"},
        {"name": "Удовлетворительно (50-69%)", "bracket": "Базовый (50-69%)", "value": 0, "count": 0, "color": "#F59E0B"},
        {"name": "Требует внимания (<50%)", "bracket": "Низкий (<50%)", "value": 0, "count": 0, "color": "#EF4444"},
    ]
    bracket_pipeline = [
        {
            "$project": {
                "pct": {
                    "$cond": [
                        {"$gt": ["$total_questions", 0]},
                        {"$multiply": [{"$divide": ["$score", "$total_questions"]}, 100]},
                        0,
                    ]
                }
            }
        },
        {"$bucket": {
            "groupBy": "$pct",
            "boundaries": [0, 50, 70, 86, 101],
            "default": "other",
            "output": {"count": {"$sum": 1}},
        }},
    ]
    try:
        bracket_res = await db.test_results.aggregate(bracket_pipeline).to_list(10)
        bracket_map = {
            0: "Низкий (<50%)",
            50: "Базовый (50-69%)",
            70: "Хороший (70-85%)",
            86: "Отличный (>85%)",
        }
        bracket_name_map = {
            0: "Требует внимания (<50%)",
            50: "Удовлетворительно (50-69%)",
            70: "Хорошо (70-85%)",
            86: "Отлично (>85%)",
        }
        bracket_color_map = {
            0: "#EF4444",
            50: "#F59E0B",
            70: "#3B82F6",
            86: "#10B981",
        }
        mapped_counts = {item["_id"]: item["count"] for item in bracket_res if item["_id"] in bracket_map}
        score_brackets = [
            {
                "name": bracket_name_map[k],
                "bracket": bracket_map[k],
                "value": mapped_counts.get(k, 0),
                "count": mapped_counts.get(k, 0),
                "color": bracket_color_map[k],
            }
            for k in [86, 70, 50, 0]
        ]
    except Exception:
        pass

    return {
        "totals": {
            "total_users": total_users,
            "students_count": students_count,
            "teachers_count": teachers_count,
            "new_users_7d": new_users_7d,
            "new_users_30d": new_users_30d,
            "total_test_attempts": total_tests_completed,
            "total_tests_completed": total_tests_completed,
            "avg_platform_score": avg_accuracy,
            "avg_accuracy": avg_accuracy,
        },
        "timeline": timeline,
        "class_distribution": class_distribution,
        "section_performance": section_stats,
        "section_stats": section_stats,
        "score_brackets": score_brackets,
    }


@router.get("/admin/analytics/users")
async def get_admin_analytics_users(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    role: Optional[str] = Query(default=None),
    class_id: Optional[str] = Query(default=None),
    _: dict = Depends(require_admin),
):
    query: dict[str, Any] = {}
    if role and role != "all":
        query["role"] = role
    if class_id and class_id != "all":
        query["class_id"] = class_id
    if search:
        s = search.strip()
        query["$or"] = [
            {"name": {"$regex": s, "$options": "i"}},
            {"email": {"$regex": s, "$options": "i"}},
            {"school": {"$regex": s, "$options": "i"}},
        ]

    total = await db.users.count_documents(query)
    skip = (page - 1) * limit
    cursor = db.users.find(query).sort("created_at", -1).skip(skip).limit(limit)
    users_raw = await cursor.to_list(limit)

    users = []
    for u in users_raw:
        progress = u.get("progress", {}) or {}
        completed_lessons = len(progress.get("completed_lessons", []) or [])
        completed_tasks = len(progress.get("completed_tasks", []) or [])
        completed_tests = len(progress.get("completed_tests", []) or [])

        scores = progress.get("scores", {}) or {}
        score_values = [float(v) for v in scores.values() if isinstance(v, (int, float))]
        avg_score = round(sum(score_values) / len(score_values), 1) if score_values else 0.0

        created_at = u.get("created_at")
        if isinstance(created_at, datetime):
            created_at_str = created_at.isoformat()
        else:
            created_at_str = str(created_at or "")

        users.append({
            "id": str(u.get("id", u.get("_id", ""))),
            "email": str(u.get("email", "")),
            "name": str(u.get("name") or "Пользователь"),
            "role": str(u.get("role", "student")),
            "class_id": u.get("class_id"),
            "school": u.get("school"),
            "classroom": u.get("classroom"),
            "created_at": created_at_str,
            "completed_lessons_count": completed_lessons,
            "completed_tasks_count": completed_tasks,
            "completed_tests_count": completed_tests,
            "avg_score": avg_score,
        })

    return {
        "users": users,
        "items": users,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1,
    }


@router.get("/admin/analytics/users/{user_id}")
async def get_admin_analytics_user_detail(
    user_id: str,
    _: dict = Depends(require_admin),
):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    test_results_cursor = db.test_results.find({"user_id": user_id}).sort("completed_at", -1)
    test_results_raw = await test_results_cursor.to_list(100)

    test_results = []
    for tr in test_results_raw:
        completed_at = tr.get("completed_at")
        if isinstance(completed_at, datetime):
            completed_at_str = completed_at.isoformat()
        else:
            completed_at_str = str(completed_at or "")

        score = tr.get("score", 0)
        total_q = tr.get("total_questions", 0)
        pct = round((score / total_q) * 100, 1) if total_q > 0 else 0.0

        test_results.append({
            "id": str(tr.get("id", tr.get("_id", ""))),
            "test_id": str(tr.get("test_id", "")),
            "test_title": str(tr.get("test_title") or tr.get("title") or tr.get("test_id", "")),
            "section": tr.get("section"),
            "score": score,
            "total_questions": total_q,
            "percentage": pct,
            "time_spent": tr.get("time_spent", 0),
            "completed_at": completed_at_str,
        })

    progress = user.get("progress", {}) or {}
    created_at = user.get("created_at")
    created_at_str = created_at.isoformat() if isinstance(created_at, datetime) else str(created_at or "")

    scores = progress.get("scores", {}) or {}
    score_values = [float(v) for v in scores.values() if isinstance(v, (int, float))]
    avg_score = round(sum(score_values) / len(score_values), 1) if score_values else 0.0

    section_breakdown_dict = {}
    for tr in test_results:
        sec = tr.get("section") or "Общий"
        if sec not in section_breakdown_dict:
            section_breakdown_dict[sec] = {"scores": [], "count": 0}
        section_breakdown_dict[sec]["scores"].append(tr["percentage"])
        section_breakdown_dict[sec]["count"] += 1

    section_breakdown = [
        {
            "section": sec,
            "avg_score": round(sum(d["scores"]) / len(d["scores"]), 1) if d["scores"] else 0.0,
            "tests_taken": d["count"],
        }
        for sec, d in section_breakdown_dict.items()
    ]

    return {
        "user": {
            "id": str(user.get("id", user.get("_id", ""))),
            "email": str(user.get("email", "")),
            "name": str(user.get("name") or "Пользователь"),
            "role": str(user.get("role", "student")),
            "class_id": user.get("class_id"),
            "school": user.get("school"),
            "classroom": user.get("classroom"),
            "created_at": created_at_str,
            "stats": {
                "completed_lessons_count": len(progress.get("completed_lessons", []) or []),
                "completed_tasks_count": len(progress.get("completed_tasks", []) or []),
                "completed_tests_count": len(progress.get("completed_tests", []) or []),
                "avg_score": avg_score,
            },
            "completed_lessons_count": len(progress.get("completed_lessons", []) or []),
            "completed_tasks_count": len(progress.get("completed_tasks", []) or []),
            "completed_tests_count": len(progress.get("completed_tests", []) or []),
            "avg_score": avg_score,
            "completed_lessons": progress.get("completed_lessons", []) or [],
            "completed_tasks": progress.get("completed_tasks", []) or [],
            "completed_tests": progress.get("completed_tests", []) or [],
            "scores": scores,
        },
        "recent_tests": test_results,
        "test_results": test_results,
        "section_breakdown": section_breakdown,
    }
