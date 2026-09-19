from datetime import datetime, timedelta

from server import (
    BASIC_AI_GENERATION_DAILY_LIMIT,
    BASIC_CHAT_DAILY_LIMIT,
    FREE_AI_GENERATION_DAILY_LIMIT,
    FREE_CHAT_DAILY_LIMIT,
    PRO_AI_GENERATION_DAILY_LIMIT,
    PRO_CHAT_DAILY_LIMIT,
    compute_streak,
    compute_xp,
    env_bool,
    generate_test_variant,
    get_ai_generation_daily_limit,
    get_chat_daily_limit,
    get_level,
    get_subscription_tier,
    get_variant_index,
    parse_accept_language,
)


def test_env_bool_respects_default_and_truthy_values(monkeypatch):
    monkeypatch.delenv("FEATURE_FLAG", raising=False)
    assert env_bool("FEATURE_FLAG", default=True) is True

    monkeypatch.setenv("FEATURE_FLAG", "yes")
    assert env_bool("FEATURE_FLAG") is True

    monkeypatch.setenv("FEATURE_FLAG", "off")
    assert env_bool("FEATURE_FLAG", default=True) is False


def test_parse_accept_language_prefers_supported_languages():
    assert parse_accept_language("kk-KZ,ru;q=0.8,en;q=0.6") == "kk"
    assert parse_accept_language("en-US,en;q=0.9,ru;q=0.8") == "en"
    assert parse_accept_language("de-DE,de;q=0.9") == "ru"
    assert parse_accept_language(None) == "ru"


def test_compute_streak_returns_current_and_max_streaks():
    today = datetime.utcnow().date()
    dates = [
      str(today - timedelta(days=4)),
      str(today - timedelta(days=3)),
      str(today - timedelta(days=2)),
      str(today - timedelta(days=1)),
      str(today),
    ]

    streak = compute_streak({"activity_dates": dates})

    assert streak["current"] == 5
    assert streak["max"] == 5
    assert streak["last_active"] == str(today)


def test_compute_xp_counts_only_perfect_tests_without_bonus():
    user = {
      "progress": {
        "completed_tests": ["t1", "t2"],
        "completed_tasks": ["task1", "task2", "task3"],
        "completed_lessons": ["lesson1"],
      }
    }
    test_results = [
      {"test_id": "t1", "score": 100},
      {"test_id": "t2", "score_final": 75},
    ]

    xp = compute_xp(user, test_results)
    level = get_level(xp, lang="en")

    assert xp == 140
    assert level["name"] in {"Beginner", "Student", "Explorer", "Expert", "Master", "Physicist"}
    assert 0 <= level["progress"] <= 100


def test_generate_test_variant_keeps_correct_answer_mapping():
    questions = [
      {
        "question": "2 + 2 = ?",
        "options": ["3", "4", "5"],
        "correctIndex": 1,
      },
      {
        "question": "3 + 3 = ?",
        "options": ["6", "7", "8"],
        "correctIndex": 0,
      },
    ]

    variant = generate_test_variant(questions, seed=42)

    assert len(variant) == 2
    for item in variant:
        assert item["correct_index"] is not None
        assert item["options"][item["correct_index"]] in {"4", "6"}


def test_get_variant_index_is_deterministic():
    first = get_variant_index("session-1", "student-1", 4)
    second = get_variant_index("session-1", "student-1", 4)

    assert first == second
    assert 0 <= first < 4


def test_subscription_tiers_have_expected_daily_ai_limits():
    users = {
        "free": {},
        "basic": {"subscription": {"tier": "basic"}},
        "pro": {"subscription": {"tier": "pro"}},
    }

    assert [get_subscription_tier(user) for user in users.values()] == ["free", "basic", "pro"]
    assert [get_chat_daily_limit(user) for user in users.values()] == [
        FREE_CHAT_DAILY_LIMIT,
        BASIC_CHAT_DAILY_LIMIT,
        PRO_CHAT_DAILY_LIMIT,
    ]
    assert [get_ai_generation_daily_limit(user) for user in users.values()] == [
        FREE_AI_GENERATION_DAILY_LIMIT,
        BASIC_AI_GENERATION_DAILY_LIMIT,
        PRO_AI_GENERATION_DAILY_LIMIT,
    ]


def test_default_daily_ai_limits_match_the_mobile_plan_table():
    assert (FREE_CHAT_DAILY_LIMIT, BASIC_CHAT_DAILY_LIMIT, PRO_CHAT_DAILY_LIMIT) == (5, 20, 60)
    assert (
        FREE_AI_GENERATION_DAILY_LIMIT,
        BASIC_AI_GENERATION_DAILY_LIMIT,
        PRO_AI_GENERATION_DAILY_LIMIT,
    ) == (1, 5, 15)
