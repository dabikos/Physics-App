import json
import logging
import os
from pathlib import Path
from string import Formatter
from typing import Any, Optional

import asyncpg

logger = logging.getLogger(__name__)
ROOT_DIR = Path(__file__).parent

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
_pool: Optional[asyncpg.Pool] = None


def is_postgres_configured() -> bool:
    return bool(DATABASE_URL)


async def get_postgres_pool() -> asyncpg.Pool:
    global _pool

    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not configured")

    if _pool is None:
        _pool = await asyncpg.create_pool(
            dsn=DATABASE_URL,
            min_size=1,
            max_size=int(os.environ.get("POSTGRES_POOL_MAX_SIZE", "5")),
            command_timeout=30,
            ssl="require",
        )
    return _pool


async def close_postgres_pool() -> None:
    global _pool

    if _pool is not None:
        await _pool.close()
        _pool = None


def _decode_jsonb(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, str):
        return json.loads(value)
    return value


async def init_postgres_schema() -> None:
    if not DATABASE_URL:
        logger.info("DATABASE_URL is not configured; skipping PostgreSQL schema initialization")
        return

    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            CREATE EXTENSION IF NOT EXISTS pgcrypto;

            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value JSONB NOT NULL DEFAULT '{}'::jsonb,
                description TEXT,
                updated_by TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS ai_prompts (
                key TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                prompt TEXT NOT NULL,
                user_template TEXT,
                model TEXT,
                temperature NUMERIC(3, 2),
                max_tokens INTEGER,
                enabled BOOLEAN NOT NULL DEFAULT TRUE,
                updated_by TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS notification_campaigns (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                target JSONB NOT NULL DEFAULT '{}'::jsonb,
                data JSONB NOT NULL DEFAULT '{}'::jsonb,
                scheduled_at TIMESTAMPTZ,
                sent_at TIMESTAMPTZ,
                status TEXT NOT NULL DEFAULT 'draft',
                created_by TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS notification_deliveries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                campaign_id UUID REFERENCES notification_campaigns(id) ON DELETE CASCADE,
                user_id TEXT,
                push_token TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                error TEXT,
                sent_at TIMESTAMPTZ,
                opened_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_notification_campaigns_status_scheduled
                ON notification_campaigns(status, scheduled_at);

            CREATE INDEX IF NOT EXISTS idx_notification_deliveries_campaign
                ON notification_deliveries(campaign_id);

            CREATE TABLE IF NOT EXISTS lesson_sections (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                icon TEXT,
                color TEXT,
                order_index INTEGER NOT NULL DEFAULT 0,
                is_published BOOLEAN NOT NULL DEFAULT TRUE,
                source TEXT NOT NULL DEFAULT 'seed',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS lesson_subsections (
                id TEXT PRIMARY KEY,
                section_id TEXT NOT NULL REFERENCES lesson_sections(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                order_index INTEGER NOT NULL DEFAULT 0,
                is_published BOOLEAN NOT NULL DEFAULT TRUE,
                source TEXT NOT NULL DEFAULT 'seed',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS lesson_topics (
                id TEXT PRIMARY KEY,
                section_id TEXT NOT NULL REFERENCES lesson_sections(id) ON DELETE CASCADE,
                subsection_id TEXT NOT NULL REFERENCES lesson_subsections(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                brief_info TEXT NOT NULL DEFAULT '',
                example_problem TEXT NOT NULL DEFAULT '',
                formulas JSONB NOT NULL DEFAULT '[]'::jsonb,
                video JSONB,
                order_index INTEGER NOT NULL DEFAULT 0,
                is_published BOOLEAN NOT NULL DEFAULT TRUE,
                source TEXT NOT NULL DEFAULT 'seed',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_lesson_subsections_section_order
                ON lesson_subsections(section_id, order_index);

            CREATE INDEX IF NOT EXISTS idx_lesson_topics_section_subsection_order
                ON lesson_topics(section_id, subsection_id, order_index);
            """
        )
        await conn.execute("ALTER TABLE ai_prompts ADD COLUMN IF NOT EXISTS user_template TEXT")
        await seed_default_ai_prompts(conn)
        await seed_mechanics_lessons(conn)


async def seed_default_ai_prompts(conn: asyncpg.Connection) -> None:
    defaults = [
        {
            "key": "ai_chat",
            "name": "AI Chat Physics Tutor",
            "prompt": (
                "You are an AI physics tutor for school and university students.\n"
                "Answer in {language}. If the user's message clearly asks for another language, follow the user's request.\n\n"
                "Answer quality rules:\n"
                "- Explain in simple words, but keep physics accurate.\n"
                "- Write every formula and mathematical expression only in LaTeX.\n"
                "- Use inline math like $v = v_0 + at$ and important formulas on separate lines like $$F = ma$$.\n"
                "- Do not write formulas as plain text like F=ma when LaTeX is possible.\n"
                "- After a formula, briefly explain symbols and units.\n"
                "- When solving a problem, use this structure: given data, find, formula, substitution, answer.\n"
                "- If data is missing, ask a clarifying question instead of inventing numbers.\n"
                "- If the question is not about physics, politely bring the conversation back to physics.\n"
                "- Keep the answer compact unless the user asks for a detailed explanation."
            ),
            "temperature": 0.65,
            "max_tokens": 2048,
        },
        {
            "key": "learn_more",
            "name": "Learn More Topic Expansion",
            "prompt": (
                "You are an experienced physics teacher for school and university students.\n"
                "Always write the final answer in {language}. Be clear, accurate, and focused on the topic.\n\n"
                "Formula and math rules:\n"
                "- Write every formula and mathematical expression only in LaTeX.\n"
                "- Use inline math like $v = v_0 + at$.\n"
                "- Put important formulas on separate lines like $$F = ma$$.\n"
                "- Do not write plain-text formulas like F=ma when it is a mathematical formula.\n"
                "- After every important formula, explain each symbol and its units.\n"
                "- Structure the answer with short Markdown headings.\n"
                "- For calculations, use: given data, formula, substitution, final answer."
            ),
            "user_template": (
                "Create an expanded explanation in {language} for the physics topic: {topic_title}.\n\n"
                "Key formulas for the topic: {formulas}.\n"
                "Content type: {content_type}.\n\n"
                "Use this structure in {language}:\n"
                "1. Short overview: what the topic means and why it matters.\n"
                "2. Physical meaning: explain the idea in simple words.\n"
                "3. Main formulas: only LaTeX, with explanations of every symbol.\n"
                "4. How to apply it: a step-by-step method for solving problems.\n"
                "5. Calculation example: a small problem with given data, formula, substitution, and answer.\n"
                "6. Common mistakes: 3-5 frequent student mistakes.\n"
                "7. Summary: a compact final recap.\n\n"
                "The text must help the student understand the material, not just memorize it."
            ),
            "temperature": 0.55,
            "max_tokens": 4096,
        },
        {
            "key": "test_generator",
            "name": "AI Test Generator",
            "prompt": (
                "You are a physics test generator.\n"
                "Return only valid JSON. Do not use Markdown, code fences, comments, or extra text.\n"
                "Questions, options, and title must be in {language}.\n"
                "Use LaTeX for formulas inside strings when formulas are needed.\n"
                "Each question must have exactly four options and one correct answer index."
            ),
            "user_template": (
                "Create a physics test with exactly {num_questions} questions for the topic: {section_name}.\n"
                "Language: {language}.\n"
                "Difficulty: {difficulty}.\n\n"
                "Return JSON in exactly this shape:\n"
                "{{\n"
                "  \"title\": \"Тест по {section_name}\",\n"
                "  \"questions\": [\n"
                "    {{\n"
                "      \"question\": \"Текст вопроса?\",\n"
                "      \"options\": [\"вариант A\", \"вариант B\", \"вариант C\", \"вариант D\"],\n"
                "      \"correct\": 0\n"
                "    }}\n"
                "  ]\n"
                "}}\n\n"
                "\"correct\" is the zero-based index of the right option: 0, 1, 2, or 3."
            ),
            "temperature": 0.5,
            "max_tokens": 4096,
        },
    ]

    for item in defaults:
        await conn.execute(
            """
            INSERT INTO ai_prompts (key, name, prompt, user_template, temperature, max_tokens)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (key) DO UPDATE SET
                name = EXCLUDED.name,
                prompt = EXCLUDED.prompt,
                user_template = EXCLUDED.user_template,
                temperature = EXCLUDED.temperature,
                max_tokens = EXCLUDED.max_tokens,
                updated_at = NOW()
            WHERE ai_prompts.updated_by IS NULL
            """,
            item["key"],
            item["name"],
            item["prompt"],
            item.get("user_template"),
            item["temperature"],
            item["max_tokens"],
        )


async def seed_mechanics_lessons(conn: asyncpg.Connection) -> None:
    seed_path = ROOT_DIR / "content" / "mechanics_lessons.json"
    if not seed_path.exists():
        logger.warning("Mechanics lesson seed file is missing: %s", seed_path)
        return

    payload = json.loads(seed_path.read_text(encoding="utf-8"))
    section = payload["section"]
    await conn.execute(
        """
        INSERT INTO lesson_sections (id, name, icon, color, order_index, source)
        VALUES ($1, $2, $3, $4, $5, 'seed')
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            icon = EXCLUDED.icon,
            color = EXCLUDED.color,
            order_index = EXCLUDED.order_index,
            updated_at = NOW()
        WHERE lesson_sections.source = 'seed'
        """,
        section["id"],
        section["name"],
        section.get("icon"),
        section.get("color"),
        0,
    )

    for subsection in payload["subsections"]:
        await conn.execute(
            """
            INSERT INTO lesson_subsections (id, section_id, name, order_index, source)
            VALUES ($1, $2, $3, $4, 'seed')
            ON CONFLICT (id) DO UPDATE SET
                section_id = EXCLUDED.section_id,
                name = EXCLUDED.name,
                order_index = EXCLUDED.order_index,
                updated_at = NOW()
            WHERE lesson_subsections.source = 'seed'
            """,
            subsection["id"],
            subsection["section_id"],
            subsection["name"],
            subsection["order_index"],
        )

    for topic in payload["topics"]:
        await conn.execute(
            """
            INSERT INTO lesson_topics (
                id, section_id, subsection_id, title, brief_info,
                example_problem, formulas, video, order_index, source
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, 'seed')
            ON CONFLICT (id) DO UPDATE SET
                section_id = EXCLUDED.section_id,
                subsection_id = EXCLUDED.subsection_id,
                title = EXCLUDED.title,
                brief_info = EXCLUDED.brief_info,
                example_problem = EXCLUDED.example_problem,
                formulas = EXCLUDED.formulas,
                video = EXCLUDED.video,
                order_index = EXCLUDED.order_index,
                updated_at = NOW()
            WHERE lesson_topics.source = 'seed'
            """,
            topic["id"],
            topic["section_id"],
            topic["subsection_id"],
            topic["title"],
            topic["brief_info"],
            topic["example_problem"],
            json.dumps(topic.get("formulas") or []),
            json.dumps(topic.get("video")) if topic.get("video") is not None else None,
            topic["order_index"],
        )


def render_prompt_template(template: str, variables: dict[str, Any]) -> str:
    allowed = {name for _, name, _, _ in Formatter().parse(template) if name}
    values = {key: variables.get(key, "") for key in allowed}
    return template.format(**values)


async def get_ai_prompt(key: str) -> Optional[dict[str, Any]]:
    if not DATABASE_URL:
        return None

    try:
        pool = await get_postgres_pool()
        row = await pool.fetchrow(
            """
            SELECT key, name, prompt, user_template, model, temperature, max_tokens, enabled
            FROM ai_prompts
            WHERE key = $1 AND enabled = TRUE
            """,
            key,
        )
        if not row:
            return None
        return {
            **dict(row),
            "temperature": float(row["temperature"]) if row["temperature"] is not None else None,
        }
    except Exception as exc:
        logger.warning("Failed to load AI prompt '%s' from PostgreSQL: %s", key, exc)
        return None


async def postgres_health() -> dict[str, Any]:
    if not DATABASE_URL:
        return {"configured": False, "ok": False}

    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        result = await conn.fetchrow("SELECT NOW() AS now, current_database() AS database")
        lesson_counts = await conn.fetchrow(
            """
            SELECT
                (SELECT COUNT(*) FROM lesson_sections) AS sections,
                (SELECT COUNT(*) FROM lesson_subsections) AS subsections,
                (SELECT COUNT(*) FROM lesson_topics) AS topics
            """
        )
        return {
            "configured": True,
            "ok": True,
            "database": result["database"],
            "server_time": result["now"].isoformat(),
            "lessons": {
                "sections": lesson_counts["sections"],
                "subsections": lesson_counts["subsections"],
                "topics": lesson_counts["topics"],
            },
        }


async def list_app_settings() -> list[dict[str, Any]]:
    pool = await get_postgres_pool()
    rows = await pool.fetch("SELECT * FROM app_settings ORDER BY key")
    return [
        {
            **dict(row),
            "value": _decode_jsonb(row["value"]),
            "created_at": row["created_at"].isoformat(),
            "updated_at": row["updated_at"].isoformat(),
        }
        for row in rows
    ]


async def upsert_app_setting(key: str, value: Any, description: str | None, updated_by: str) -> dict[str, Any]:
    pool = await get_postgres_pool()
    row = await pool.fetchrow(
        """
        INSERT INTO app_settings (key, value, description, updated_by)
        VALUES ($1, $2::jsonb, $3, $4)
        ON CONFLICT (key) DO UPDATE SET
            value = EXCLUDED.value,
            description = EXCLUDED.description,
            updated_by = EXCLUDED.updated_by,
            updated_at = NOW()
        RETURNING *
        """,
        key,
        json.dumps(value),
        description,
        updated_by,
    )
    return {
        **dict(row),
        "value": _decode_jsonb(row["value"]),
        "created_at": row["created_at"].isoformat(),
        "updated_at": row["updated_at"].isoformat(),
    }


async def list_ai_prompts() -> list[dict[str, Any]]:
    pool = await get_postgres_pool()
    rows = await pool.fetch("SELECT * FROM ai_prompts ORDER BY key")
    return [
        {
            **dict(row),
            "temperature": float(row["temperature"]) if row["temperature"] is not None else None,
            "created_at": row["created_at"].isoformat(),
            "updated_at": row["updated_at"].isoformat(),
        }
        for row in rows
    ]


async def upsert_ai_prompt(payload: dict[str, Any], updated_by: str) -> dict[str, Any]:
    pool = await get_postgres_pool()
    row = await pool.fetchrow(
        """
        INSERT INTO ai_prompts (key, name, prompt, user_template, model, temperature, max_tokens, enabled, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, TRUE), $9)
        ON CONFLICT (key) DO UPDATE SET
            name = EXCLUDED.name,
            prompt = EXCLUDED.prompt,
            user_template = EXCLUDED.user_template,
            model = EXCLUDED.model,
            temperature = EXCLUDED.temperature,
            max_tokens = EXCLUDED.max_tokens,
            enabled = EXCLUDED.enabled,
            updated_by = EXCLUDED.updated_by,
            updated_at = NOW()
        RETURNING *
        """,
        payload["key"],
        payload["name"],
        payload["prompt"],
        payload.get("user_template"),
        payload.get("model"),
        payload.get("temperature"),
        payload.get("max_tokens"),
        payload.get("enabled"),
        updated_by,
    )
    return {
        **dict(row),
        "temperature": float(row["temperature"]) if row["temperature"] is not None else None,
        "created_at": row["created_at"].isoformat(),
        "updated_at": row["updated_at"].isoformat(),
    }


async def list_notification_campaigns() -> list[dict[str, Any]]:
    pool = await get_postgres_pool()
    rows = await pool.fetch("SELECT * FROM notification_campaigns ORDER BY created_at DESC LIMIT 200")
    return [
        {
            **dict(row),
            "id": str(row["id"]),
            "target": _decode_jsonb(row["target"]),
            "data": _decode_jsonb(row["data"]),
            "scheduled_at": row["scheduled_at"].isoformat() if row["scheduled_at"] else None,
            "sent_at": row["sent_at"].isoformat() if row["sent_at"] else None,
            "created_at": row["created_at"].isoformat(),
            "updated_at": row["updated_at"].isoformat(),
        }
        for row in rows
    ]


async def create_notification_campaign(payload: dict[str, Any], created_by: str) -> dict[str, Any]:
    pool = await get_postgres_pool()
    row = await pool.fetchrow(
        """
        INSERT INTO notification_campaigns (title, body, target, data, scheduled_at, status, created_by)
        VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, COALESCE($6, 'draft'), $7)
        RETURNING *
        """,
        payload["title"],
        payload["body"],
        json.dumps(payload.get("target") or {}),
        json.dumps(payload.get("data") or {}),
        payload.get("scheduled_at"),
        payload.get("status"),
        created_by,
    )
    return {
        **dict(row),
        "id": str(row["id"]),
        "target": _decode_jsonb(row["target"]),
        "data": _decode_jsonb(row["data"]),
        "scheduled_at": row["scheduled_at"].isoformat() if row["scheduled_at"] else None,
        "sent_at": row["sent_at"].isoformat() if row["sent_at"] else None,
        "created_at": row["created_at"].isoformat(),
        "updated_at": row["updated_at"].isoformat(),
    }
