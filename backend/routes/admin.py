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
    return {"item": _serialize_record(row)}


@router.delete("/admin/content/lessons/sections/{section_id}")
async def delete_admin_lesson_section(section_id: str, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM lesson_sections WHERE id = $1", section_id)
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
    return {"item": _serialize_record(row)}


@router.delete("/admin/content/lessons/subsections/{subsection_id}")
async def delete_admin_lesson_subsection(subsection_id: str, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM lesson_subsections WHERE id = $1", subsection_id)
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
    return {"item": _serialize_record(row)}


@router.delete("/admin/content/lessons/topics/{topic_id}")
async def delete_admin_lesson_topic(topic_id: str, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM lesson_topics WHERE id = $1", topic_id)
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
    return {"item": _serialize_record(row)}


@router.delete("/admin/content/tests/{test_id}")
async def delete_admin_test(test_id: str, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        status = await conn.execute("DELETE FROM practice_tests WHERE id = $1", test_id)
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
    return {"item": _serialize_record(row)}


@router.delete("/admin/content/tasks/{task_id}")
async def delete_admin_task(task_id: str, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        status = await conn.execute("DELETE FROM practice_tasks WHERE id = $1", task_id)
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
    return {"item": _serialize_record(row)}


@router.delete("/admin/content/formulas/{formula_id}")
async def delete_admin_formula(formula_id: str, _: dict = Depends(require_admin)):
    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        status = await conn.execute("DELETE FROM physics_formulas WHERE id = $1", formula_id)
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
