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
                translations JSONB NOT NULL DEFAULT '{}'::jsonb,
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
                translations JSONB NOT NULL DEFAULT '{}'::jsonb,
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
                translations JSONB NOT NULL DEFAULT '{}'::jsonb,
                video JSONB,
                order_index INTEGER NOT NULL DEFAULT 0,
                is_published BOOLEAN NOT NULL DEFAULT TRUE,
                source TEXT NOT NULL DEFAULT 'seed',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS physics_formulas (
                id TEXT PRIMARY KEY,
                section_id TEXT NOT NULL REFERENCES lesson_sections(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                formula TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                variables JSONB NOT NULL DEFAULT '{}'::jsonb,
                unit TEXT NOT NULL DEFAULT '',
                translations JSONB NOT NULL DEFAULT '{}'::jsonb,
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

            CREATE INDEX IF NOT EXISTS idx_physics_formulas_section_order
                ON physics_formulas(section_id, order_index);

            CREATE TABLE IF NOT EXISTS practice_tests (
                id TEXT PRIMARY KEY,
                section_id TEXT NOT NULL REFERENCES lesson_sections(id) ON DELETE CASCADE,
                subsection_id TEXT NOT NULL REFERENCES lesson_subsections(id) ON DELETE CASCADE,
                topic_id TEXT,
                title TEXT NOT NULL,
                difficulty TEXT NOT NULL DEFAULT 'basic',
                questions JSONB NOT NULL DEFAULT '[]'::jsonb,
                translations JSONB NOT NULL DEFAULT '{}'::jsonb,
                time_limit INTEGER NOT NULL DEFAULT 300,
                order_index INTEGER NOT NULL DEFAULT 0,
                is_published BOOLEAN NOT NULL DEFAULT TRUE,
                source TEXT NOT NULL DEFAULT 'seed',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS practice_tasks (
                id TEXT PRIMARY KEY,
                section_id TEXT NOT NULL REFERENCES lesson_sections(id) ON DELETE CASCADE,
                subsection_id TEXT NOT NULL REFERENCES lesson_subsections(id) ON DELETE CASCADE,
                topic_id TEXT,
                topic_title TEXT,
                title TEXT NOT NULL,
                problem_text TEXT NOT NULL,
                given_data TEXT NOT NULL DEFAULT '',
                find_text TEXT NOT NULL DEFAULT '',
                solution TEXT NOT NULL DEFAULT '',
                answer TEXT NOT NULL DEFAULT '',
                difficulty TEXT NOT NULL DEFAULT 'medium',
                translations JSONB NOT NULL DEFAULT '{}'::jsonb,
                raw_text TEXT NOT NULL DEFAULT '',
                order_index INTEGER NOT NULL DEFAULT 0,
                is_published BOOLEAN NOT NULL DEFAULT TRUE,
                source TEXT NOT NULL DEFAULT 'seed',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_practice_tests_section_subsection_order
                ON practice_tests(section_id, subsection_id, order_index);

            CREATE INDEX IF NOT EXISTS idx_practice_tasks_section_subsection_order
                ON practice_tasks(section_id, subsection_id, order_index);
            """
        )
        await conn.execute("ALTER TABLE lesson_sections ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb")
        await conn.execute("ALTER TABLE lesson_subsections ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb")
        await conn.execute("ALTER TABLE lesson_topics ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb")
        await conn.execute("ALTER TABLE physics_formulas ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb")
        await conn.execute("ALTER TABLE practice_tests ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb")
        await conn.execute("ALTER TABLE practice_tasks ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb")
        await conn.execute("ALTER TABLE physics_formulas ENABLE ROW LEVEL SECURITY")
        await conn.execute("ALTER TABLE ai_prompts ADD COLUMN IF NOT EXISTS user_template TEXT")
        await seed_default_ai_prompts(conn)
        await seed_lesson_content(conn)
        await seed_lesson_translations(conn)
        await seed_formula_content(conn)
        await seed_formula_translations(conn)
        await seed_practice_content(conn)
        await seed_practice_translations(conn)


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


async def seed_lesson_content(conn: asyncpg.Connection) -> None:
    seed_paths = sorted((ROOT_DIR / "content").glob("*_lessons.json"))
    if not seed_paths:
        logger.warning("Lesson seed files are missing in %s", ROOT_DIR / "content")
        return

    for seed_path in seed_paths:
        await seed_lesson_file(conn, seed_path)


async def seed_lesson_file(conn: asyncpg.Connection, seed_path: Path) -> None:
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
        section.get("order_index", 0),
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


async def seed_lesson_translations(conn: asyncpg.Connection) -> None:
    seed_path = ROOT_DIR / "content" / "lesson_translations.json"
    if not seed_path.exists():
        logger.warning("Lesson translation seed file is missing: %s", seed_path)
        return

    payload = json.loads(seed_path.read_text(encoding="utf-8"))
    section_translations: dict[str, dict[str, Any]] = {}
    subsection_translations: dict[str, dict[str, Any]] = {}
    topic_translations: dict[str, dict[str, Any]] = {}

    for lang, lang_payload in payload.items():
        for section_id, section in lang_payload.get("sections", {}).items():
            section_translations.setdefault(section_id, {})[lang] = {
                "name": section.get("name", "")
            }
            for subsection_id, subsection in section.get("subsections", {}).items():
                subsection_translations.setdefault(subsection_id, {})[lang] = {
                    "name": subsection.get("name", "")
                }

        for topic_id, topic in lang_payload.get("topics", {}).items():
            topic_translations.setdefault(topic_id, {})[lang] = {
                "title": topic.get("title", ""),
                "brief_info": topic.get("brief_info", ""),
                "example_problem": topic.get("example_problem", ""),
            }

    for section_id, translations in section_translations.items():
        await conn.execute(
            """
            UPDATE lesson_sections
            SET translations = $2::jsonb, updated_at = NOW()
            WHERE id = $1 AND source = 'seed'
            """,
            section_id,
            json.dumps(translations, ensure_ascii=False),
        )

    for subsection_id, translations in subsection_translations.items():
        await conn.execute(
            """
            UPDATE lesson_subsections
            SET translations = $2::jsonb, updated_at = NOW()
            WHERE id = $1 AND source = 'seed'
            """,
            subsection_id,
            json.dumps(translations, ensure_ascii=False),
        )

    for topic_id, translations in topic_translations.items():
        await conn.execute(
            """
            UPDATE lesson_topics
            SET translations = $2::jsonb, updated_at = NOW()
            WHERE id = $1 AND source = 'seed'
            """,
            topic_id,
            json.dumps(translations, ensure_ascii=False),
        )


async def seed_formula_content(conn: asyncpg.Connection) -> None:
    seed_path = ROOT_DIR / "content" / "formulas.json"
    if not seed_path.exists():
        logger.warning("Formula seed file is missing: %s", seed_path)
        return

    payload = json.loads(seed_path.read_text(encoding="utf-8"))
    for index, formula in enumerate(payload.get("formulas", [])):
        await conn.execute(
            """
            INSERT INTO physics_formulas (
                id, section_id, name, formula, description, variables,
                unit, order_index, source
            )
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, 'seed')
            ON CONFLICT (id) DO UPDATE SET
                section_id = EXCLUDED.section_id,
                name = EXCLUDED.name,
                formula = EXCLUDED.formula,
                description = EXCLUDED.description,
                variables = EXCLUDED.variables,
                unit = EXCLUDED.unit,
                order_index = EXCLUDED.order_index,
                updated_at = NOW()
            WHERE physics_formulas.source = 'seed'
            """,
            formula["id"],
            formula["section"],
            formula["name"],
            formula["formula"],
            formula.get("description", ""),
            json.dumps(formula.get("variables") or {}),
            formula.get("unit", ""),
            formula.get("order_index", index),
        )


async def seed_formula_translations(conn: asyncpg.Connection) -> None:
    seed_path = ROOT_DIR / "content" / "formula_translations.json"
    if not seed_path.exists():
        logger.warning("Formula translation seed file is missing: %s", seed_path)
        return

    payload = json.loads(seed_path.read_text(encoding="utf-8"))
    formula_translations: dict[str, dict[str, Any]] = {}

    for lang, lang_payload in payload.items():
        for formula_id, formula in lang_payload.get("formulas", {}).items():
            formula_translations.setdefault(formula_id, {})[lang] = {
                "name": formula.get("name", ""),
                "description": formula.get("description", ""),
                "variables": formula.get("variables") or {},
                "unit": formula.get("unit", ""),
            }

    for formula_id, translations in formula_translations.items():
        await conn.execute(
            """
            UPDATE physics_formulas
            SET translations = $2::jsonb, updated_at = NOW()
            WHERE id = $1 AND source = 'seed'
            """,
            formula_id,
            json.dumps(translations, ensure_ascii=False),
        )


async def seed_practice_content(conn: asyncpg.Connection) -> None:
    content_dir = ROOT_DIR / "content"

    for seed_path in sorted(content_dir.glob("*_tests.json")):
        await seed_practice_tests_file(conn, seed_path)

    for seed_path in sorted(content_dir.glob("*_tasks.json")):
        await seed_practice_tasks_file(conn, seed_path)


async def seed_practice_tests_file(conn: asyncpg.Connection, seed_path: Path) -> None:
    payload = json.loads(seed_path.read_text(encoding="utf-8"))

    for test in payload.get("tests", []):
        await conn.execute(
            """
            INSERT INTO practice_tests (
                id, section_id, subsection_id, topic_id, title, difficulty,
                questions, time_limit, order_index, source
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, 'seed')
            ON CONFLICT (id) DO UPDATE SET
                section_id = EXCLUDED.section_id,
                subsection_id = EXCLUDED.subsection_id,
                topic_id = EXCLUDED.topic_id,
                title = EXCLUDED.title,
                difficulty = EXCLUDED.difficulty,
                questions = EXCLUDED.questions,
                time_limit = EXCLUDED.time_limit,
                order_index = EXCLUDED.order_index,
                updated_at = NOW()
            WHERE practice_tests.source = 'seed'
            """,
            test["id"],
            test["section_id"],
            test["subsection_id"],
            test.get("topic_id"),
            test["title"],
            test.get("difficulty", "basic"),
            json.dumps(test.get("questions") or []),
            test.get("time_limit", 300),
            test["order_index"],
        )


async def seed_practice_tasks_file(conn: asyncpg.Connection, seed_path: Path) -> None:
    payload = json.loads(seed_path.read_text(encoding="utf-8"))

    for task in payload.get("tasks", []):
        await conn.execute(
            """
            INSERT INTO practice_tasks (
                id, section_id, subsection_id, topic_id, topic_title, title,
                problem_text, given_data, find_text, solution, answer,
                difficulty, raw_text, order_index, source
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'seed')
            ON CONFLICT (id) DO UPDATE SET
                section_id = EXCLUDED.section_id,
                subsection_id = EXCLUDED.subsection_id,
                topic_id = EXCLUDED.topic_id,
                topic_title = EXCLUDED.topic_title,
                title = EXCLUDED.title,
                problem_text = EXCLUDED.problem_text,
                given_data = EXCLUDED.given_data,
                find_text = EXCLUDED.find_text,
                solution = EXCLUDED.solution,
                answer = EXCLUDED.answer,
                difficulty = EXCLUDED.difficulty,
                raw_text = EXCLUDED.raw_text,
                order_index = EXCLUDED.order_index,
                updated_at = NOW()
            WHERE practice_tasks.source = 'seed'
            """,
            task["id"],
            task["section_id"],
            task["subsection_id"],
            task.get("topic_id"),
            task.get("topic_title"),
            task["title"],
            task["problem_text"],
            task.get("given_data", ""),
            task.get("find_text", ""),
            task.get("solution", ""),
            task.get("answer", ""),
            task.get("difficulty", "medium"),
            task.get("raw_text", ""),
            task["order_index"],
        )


async def seed_practice_translations(conn: asyncpg.Connection) -> None:
    seed_paths = sorted((ROOT_DIR / "content").glob("*_practice_translations.json"))
    if not seed_paths:
        logger.warning("Practice translation seed files are missing in %s", ROOT_DIR / "content")
        return

    for seed_path in seed_paths:
        payload = json.loads(seed_path.read_text(encoding="utf-8"))
        test_translations: dict[str, dict[str, Any]] = {}
        task_translations: dict[str, dict[str, Any]] = {}

        for lang, lang_payload in payload.items():
            for test_id, test in lang_payload.get("tests", {}).items():
                test_translations.setdefault(test_id, {})[lang] = {
                    "title": test.get("title", ""),
                    "questions": test.get("questions") or [],
                }

            for task_id, task in lang_payload.get("tasks", {}).items():
                task_translations.setdefault(task_id, {})[lang] = {
                    "topic_title": task.get("topic_title", ""),
                    "title": task.get("title", ""),
                    "problem_text": task.get("problem_text", ""),
                    "given_data": task.get("given_data", ""),
                    "find_text": task.get("find_text", ""),
                    "solution": task.get("solution", ""),
                    "answer": task.get("answer", ""),
                }

        for test_id, translations in test_translations.items():
            await conn.execute(
                """
                UPDATE practice_tests
                SET translations = $2::jsonb, updated_at = NOW()
                WHERE id = $1 AND source = 'seed'
                """,
                test_id,
                json.dumps(translations, ensure_ascii=False),
            )

        for task_id, translations in task_translations.items():
            await conn.execute(
                """
                UPDATE practice_tasks
                SET translations = $2::jsonb, updated_at = NOW()
                WHERE id = $1 AND source = 'seed'
                """,
                task_id,
                json.dumps(translations, ensure_ascii=False),
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


def _localized_dict(translations: Any, lang: str | None) -> dict[str, Any]:
    if not lang or lang == "ru":
        return {}
    values = _decode_jsonb(translations) or {}
    return values.get(lang, {}) or {}


def _practice_test_row(row: asyncpg.Record, lang: str | None = None) -> dict[str, Any]:
    localized = _localized_dict(row["translations"], lang)
    return {
        **dict(row),
        "section": row["section_id"],
        "title": localized.get("title") or row["title"],
        "questions": localized.get("questions") or _decode_jsonb(row["questions"]) or [],
        "created_at": row["created_at"].isoformat(),
        "updated_at": row["updated_at"].isoformat(),
    }


def _practice_task_row(row: asyncpg.Record, lang: str | None = None) -> dict[str, Any]:
    localized = _localized_dict(row["translations"], lang)
    return {
        **dict(row),
        "section": row["section_id"],
        "topic_title": localized.get("topic_title") or row["topic_title"],
        "title": localized.get("title") or row["title"],
        "problem_text": localized.get("problem_text") or row["problem_text"],
        "given_data": localized.get("given_data") or row["given_data"],
        "find_text": localized.get("find_text") or row["find_text"],
        "solution": localized.get("solution") or row["solution"],
        "answer": localized.get("answer") or row["answer"],
        "created_at": row["created_at"].isoformat(),
        "updated_at": row["updated_at"].isoformat(),
    }


def _formula_row(row: asyncpg.Record, lang: str | None = None) -> dict[str, Any]:
    translations = _decode_jsonb(row["translations"]) or {}
    localized = translations.get(lang or "", {}) if lang and lang != "ru" else {}
    return {
        "id": row["id"],
        "section": row["section_id"],
        "name": localized.get("name") or row["name"],
        "formula": row["formula"],
        "description": localized.get("description") or row["description"],
        "variables": localized.get("variables") or _decode_jsonb(row["variables"]) or {},
        "unit": localized.get("unit") or row["unit"],
        "created_at": row["created_at"].isoformat(),
        "updated_at": row["updated_at"].isoformat(),
    }


def _localized_value(translations: Any, lang: str | None, field: str, fallback: str) -> str:
    if not lang or lang == "ru":
        return fallback
    values = _decode_jsonb(translations) or {}
    localized = values.get(lang, {}).get(field)
    return localized or fallback


def _topic_row(row: asyncpg.Record, lang: str | None = None) -> dict[str, Any]:
    video = _decode_jsonb(row["video"])
    return {
        "id": row["id"],
        "section": row["section_id"],
        "subsection": row["subsection_id"],
        "title": _localized_value(row["translations"], lang, "title", row["title"]),
        "brief_info": _localized_value(row["translations"], lang, "brief_info", row["brief_info"]),
        "example_problem": _localized_value(row["translations"], lang, "example_problem", row["example_problem"]),
        "formulas": _decode_jsonb(row["formulas"]) or [],
        "video": video,
        "created_at": row["created_at"].isoformat(),
        "updated_at": row["updated_at"].isoformat(),
    }


def _topic_summary_row(row: asyncpg.Record, lang: str | None = None) -> dict[str, Any]:
    return {
        "id": row["id"],
        "section": row["section_id"],
        "subsection": row["subsection_id"],
        "title": _localized_value(row["translations"], lang, "title", row["title"]),
        "brief_info": _localized_value(row["translations"], lang, "brief_info", row["brief_info"]),
        "example_problem": "",
        "formulas": [],
        "video": None,
    }


async def list_lesson_sections(lang: str | None = None) -> dict[str, Any]:
    pool = await get_postgres_pool()
    rows = await pool.fetch(
        """
        SELECT
            s.id AS section_id,
            s.name AS section_name,
            s.translations AS section_translations,
            s.icon AS section_icon,
            s.color AS section_color,
            s.order_index AS section_order,
            ss.id AS subsection_id,
            ss.name AS subsection_name,
            ss.translations AS subsection_translations,
            ss.order_index AS subsection_order,
            t.id AS topic_id,
            t.title AS topic_title,
            t.translations AS topic_translations,
            t.order_index AS topic_order
        FROM lesson_sections s
        LEFT JOIN lesson_subsections ss
            ON ss.section_id = s.id AND ss.is_published = TRUE
        LEFT JOIN lesson_topics t
            ON t.subsection_id = ss.id AND t.is_published = TRUE
        WHERE s.is_published = TRUE
        ORDER BY s.order_index, s.id, ss.order_index, ss.id, t.order_index, t.id
        """
    )

    sections: dict[str, Any] = {}
    subsection_indexes: dict[str, dict[str, int]] = {}

    for row in rows:
        section_id = row["section_id"]
        if section_id not in sections:
            sections[section_id] = {
                "name": _localized_value(row["section_translations"], lang, "name", row["section_name"]),
                "icon": row["section_icon"] or "book",
                "color": row["section_color"] or "#6366F1",
                "subsections": [],
            }
            subsection_indexes[section_id] = {}

        subsection_id = row["subsection_id"]
        if not subsection_id:
            continue

        sub_index = subsection_indexes[section_id].get(subsection_id)
        if sub_index is None:
            sub_index = len(sections[section_id]["subsections"])
            subsection_indexes[section_id][subsection_id] = sub_index
            sections[section_id]["subsections"].append(
                {
                    "id": subsection_id,
                    "name": _localized_value(row["subsection_translations"], lang, "name", row["subsection_name"]),
                    "topics": [],
                }
            )

        topic_id = row["topic_id"]
        if topic_id:
            sections[section_id]["subsections"][sub_index]["topics"].append(
                {
                    "id": topic_id,
                    "name": _localized_value(row["topic_translations"], lang, "title", row["topic_title"]),
                }
            )

    return sections


async def list_lesson_topics(
    section_id: str | None = None,
    subsection_id: str | None = None,
    lang: str | None = None,
    summary: bool = False,
) -> list[dict[str, Any]]:
    pool = await get_postgres_pool()
    if summary:
        rows = await pool.fetch(
            """
            SELECT id, section_id, subsection_id, title, brief_info, translations
            FROM lesson_topics
            WHERE is_published = TRUE
                AND ($1::text IS NULL OR section_id = $1)
                AND ($2::text IS NULL OR subsection_id = $2)
            ORDER BY section_id, subsection_id, order_index, id
            """,
            section_id,
            subsection_id,
        )
        return [_topic_summary_row(row, lang) for row in rows]

    rows = await pool.fetch(
        """
        SELECT *
        FROM lesson_topics
        WHERE is_published = TRUE
            AND ($1::text IS NULL OR section_id = $1)
            AND ($2::text IS NULL OR subsection_id = $2)
        ORDER BY section_id, subsection_id, order_index, id
        """,
        section_id,
        subsection_id,
    )
    return [_topic_row(row, lang) for row in rows]


async def get_lesson_topic(topic_id: str, lang: str | None = None) -> Optional[dict[str, Any]]:
    pool = await get_postgres_pool()
    row = await pool.fetchrow(
        """
        SELECT *
        FROM lesson_topics
        WHERE id = $1 AND is_published = TRUE
        """,
        topic_id,
    )
    return _topic_row(row, lang) if row else None


async def list_physics_formulas(section_id: str | None = None, lang: str | None = None, summary: bool = False) -> list[dict[str, Any]]:
    pool = await get_postgres_pool()
    if summary:
        rows = await pool.fetch(
            """
            SELECT id, section_id, name, formula, description, '{}'::jsonb AS variables, unit, translations, created_at, updated_at
            FROM physics_formulas
            WHERE is_published = TRUE
                AND ($1::text IS NULL OR section_id = $1)
            ORDER BY section_id, order_index, id
            """,
            section_id,
        )
        items = [_formula_row(row, lang) for row in rows]
        for item in items:
            item["variables"] = {}
        return items

    rows = await pool.fetch(
        """
        SELECT *
        FROM physics_formulas
        WHERE is_published = TRUE
            AND ($1::text IS NULL OR section_id = $1)
        ORDER BY section_id, order_index, id
        """,
        section_id,
    )
    return [_formula_row(row, lang) for row in rows]


async def get_physics_formula(formula_id: str, lang: str | None = None) -> Optional[dict[str, Any]]:
    pool = await get_postgres_pool()
    row = await pool.fetchrow(
        """
        SELECT *
        FROM physics_formulas
        WHERE id = $1 AND is_published = TRUE
        """,
        formula_id,
    )
    return _formula_row(row, lang) if row else None


async def list_practice_tests(
    section_id: str | None = None,
    subsection_id: str | None = None,
    topic_id: str | None = None,
    lang: str | None = None,
) -> list[dict[str, Any]]:
    pool = await get_postgres_pool()
    rows = await pool.fetch(
        """
        SELECT *
        FROM practice_tests
        WHERE is_published = TRUE
            AND ($1::text IS NULL OR section_id = $1)
            AND ($2::text IS NULL OR subsection_id = $2)
            AND ($3::text IS NULL OR topic_id = $3)
        ORDER BY section_id, subsection_id, order_index, id
        """,
        section_id,
        subsection_id,
        topic_id,
    )
    return [_practice_test_row(row, lang) for row in rows]


async def list_random_practice_questions(
    section_ids: list[str] | None = None,
    limit: int = 10,
    lang: str | None = None,
) -> list[dict[str, Any]]:
    pool = await get_postgres_pool()
    rows = await pool.fetch(
        """
        SELECT
            pt.id AS source_test_id,
            pt.title AS source_test_title,
            pt.section_id,
            pt.subsection_id,
            pt.topic_id,
            pt.difficulty,
            q.ordinality AS question_index,
            q.question AS question,
            pt.translations AS translations
        FROM practice_tests pt
        CROSS JOIN LATERAL jsonb_array_elements(pt.questions) WITH ORDINALITY AS q(question, ordinality)
        WHERE pt.is_published = TRUE
            AND jsonb_typeof(q.question) = 'object'
            AND (
                COALESCE(array_length($1::text[], 1), 0) = 0
                OR pt.section_id = ANY($1::text[])
            )
        ORDER BY random()
        LIMIT $2
        """,
        section_ids or [],
        limit,
    )

    questions: list[dict[str, Any]] = []
    for row in rows:
        question = _decode_jsonb(row["question"]) or {}
        localized_questions = _localized_dict(row["translations"], lang).get("questions") or []
        localized_question = {}
        question_index = int(row["question_index"] or 1) - 1
        if 0 <= question_index < len(localized_questions):
            localized_question = localized_questions[question_index] or {}
        if localized_question:
            question = {**question, **localized_question}
        options = question.get("options") or []
        if not question.get("question") or len(options) < 2:
            continue

        questions.append({
            "question": question.get("question", ""),
            "options": options,
            "correct": int(question.get("correct", 0) or 0),
            "explanation": question.get("explanation", ""),
            "source_test_id": row["source_test_id"],
            "source_test_title": row["source_test_title"],
            "section_id": row["section_id"],
            "subsection_id": row["subsection_id"],
            "topic_id": row["topic_id"],
            "difficulty": row["difficulty"],
        })

    return questions


async def get_practice_test(test_id: str, lang: str | None = None) -> Optional[dict[str, Any]]:
    pool = await get_postgres_pool()
    row = await pool.fetchrow(
        """
        SELECT *
        FROM practice_tests
        WHERE id = $1 AND is_published = TRUE
        """,
        test_id,
    )
    return _practice_test_row(row, lang) if row else None


async def list_practice_tasks(
    section_id: str | None = None,
    subsection_id: str | None = None,
    topic_id: str | None = None,
    lang: str | None = None,
) -> list[dict[str, Any]]:
    pool = await get_postgres_pool()
    rows = await pool.fetch(
        """
        SELECT *
        FROM practice_tasks
        WHERE is_published = TRUE
            AND ($1::text IS NULL OR section_id = $1)
            AND ($2::text IS NULL OR subsection_id = $2)
            AND ($3::text IS NULL OR topic_id = $3)
        ORDER BY section_id, subsection_id, order_index, id
        """,
        section_id,
        subsection_id,
        topic_id,
    )
    return [_practice_task_row(row, lang) for row in rows]


async def get_practice_task(task_id: str, lang: str | None = None) -> Optional[dict[str, Any]]:
    pool = await get_postgres_pool()
    row = await pool.fetchrow(
        """
        SELECT *
        FROM practice_tasks
        WHERE id = $1 AND is_published = TRUE
        """,
        task_id,
    )
    return _practice_task_row(row, lang) if row else None


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
                (SELECT COUNT(*) FROM lesson_topics) AS topics,
                (SELECT COUNT(*) FROM physics_formulas) AS formulas
            """
        )
        practice_counts = await conn.fetchrow(
            """
            SELECT
                (SELECT COUNT(*) FROM practice_tests) AS tests,
                (SELECT COALESCE(SUM(jsonb_array_length(questions)), 0) FROM practice_tests) AS test_questions,
                (SELECT COUNT(*) FROM practice_tasks) AS tasks
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
                "formulas": lesson_counts["formulas"],
            },
            "practice": {
                "tests": practice_counts["tests"],
                "test_questions": practice_counts["test_questions"],
                "tasks": practice_counts["tasks"],
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
