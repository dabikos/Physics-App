import json
import logging
import os
from typing import Any, Optional

import asyncpg

logger = logging.getLogger(__name__)

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
            """
        )
        await seed_default_ai_prompts(conn)


async def seed_default_ai_prompts(conn: asyncpg.Connection) -> None:
    defaults = [
        {
            "key": "ai_chat",
            "name": "AI Chat Physics Tutor",
            "prompt": (
                "You are an AI physics tutor. Answer in Russian by default. "
                "Use LaTeX for every formula and solve problems step by step."
            ),
            "temperature": 0.65,
            "max_tokens": 2048,
        },
        {
            "key": "learn_more",
            "name": "Learn More Topic Expansion",
            "prompt": (
                "Create a clear Russian physics explanation. Use Markdown sections, "
                "LaTeX formulas, symbol explanations, and one calculation example."
            ),
            "temperature": 0.55,
            "max_tokens": 4096,
        },
    ]

    for item in defaults:
        await conn.execute(
            """
            INSERT INTO ai_prompts (key, name, prompt, temperature, max_tokens)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (key) DO NOTHING
            """,
            item["key"],
            item["name"],
            item["prompt"],
            item["temperature"],
            item["max_tokens"],
        )


async def postgres_health() -> dict[str, Any]:
    if not DATABASE_URL:
        return {"configured": False, "ok": False}

    pool = await get_postgres_pool()
    async with pool.acquire() as conn:
        result = await conn.fetchrow("SELECT NOW() AS now, current_database() AS database")
        return {
            "configured": True,
            "ok": True,
            "database": result["database"],
            "server_time": result["now"].isoformat(),
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
        INSERT INTO ai_prompts (key, name, prompt, model, temperature, max_tokens, enabled, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, TRUE), $8)
        ON CONFLICT (key) DO UPDATE SET
            name = EXCLUDED.name,
            prompt = EXCLUDED.prompt,
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
