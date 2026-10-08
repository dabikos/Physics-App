"""Localized content and native presentation for Physics AI push notifications."""

import math
import re


def normalize_push_language(value) -> str:
    language = str(value or "ru").strip().lower().split(",")[0].split(";")[0].split("-")[0].split("_")[0]
    return "kk" if language == "kz" else language if language in {"ru", "en", "kk"} else "ru"


def is_expo_push_token(value) -> bool:
    return isinstance(value, str) and bool(re.fullmatch(r"(?:ExponentPushToken|ExpoPushToken)\[[^\]\s]{1,256}\]", value))


def _short_text(value, fallback: str) -> str:
    return " ".join(str(value or fallback).split())[:120]


def _number(value) -> int:
    try:
        return max(0, int(value))
    except (TypeError, ValueError, OverflowError):
        return 0


def _ru_plural(value: int, forms: tuple[str, str, str]) -> str:
    if 11 <= value % 100 <= 14:
        return forms[2]
    return forms[0] if value % 10 == 1 else forms[1] if 2 <= value % 10 <= 4 else forms[2]


def build_push_presentation(language, data: dict, title: str, body: str) -> dict:
    """Return Expo presentation fields; IDs are shared with the mobile categories."""
    lang = normalize_push_language(language)
    kind = data.get("type")
    channel = "default"
    category = None

    if kind == "assigned_test":
        test_title = _short_text(data.get("test_title"), {"ru": "Тест", "en": "Test", "kk": "Тест"}[lang])
        count = _number(data.get("question_count"))
        minutes = math.ceil(_number(data.get("time_limit")) / 60)
        title = {"ru": "Новый тест от учителя", "en": "New test from your teacher", "kk": "Мұғалімнен жаңа тест"}[lang]
        body = {"ru": f"Назначен тест «{test_title}».", "en": f"Assigned test: {test_title}.", "kk": f"«{test_title}» тесті тағайындалды."}[lang]
        if count and minutes:
            detail = {
                "ru": f"{count} {_ru_plural(count, ('вопрос', 'вопроса', 'вопросов'))} · {minutes} мин",
                "en": f"{count} {'question' if count == 1 else 'questions'} · {minutes} min",
                "kk": f"{count} сұрақ · {minutes} мин",
            }[lang]
            body += "\n" + detail
        channel, category = "learning", "assigned"
    elif kind == "test_result":
        name = _short_text(data.get("student_name"), {"ru": "Ученик", "en": "Student", "kk": "Оқушы"}[lang])
        score, correct, total = (_number(data.get(key)) for key in ("score", "correct_count", "total"))
        title = {"ru": "Результат теста готов", "en": "Test result is ready", "kk": "Тест нәтижесі дайын"}[lang]
        body = {
            "ru": f"{name} — {score}% · {correct} из {total}",
            "en": f"{name} — {score}% · {correct} of {total}",
            "kk": f"{name} — {score}% · {total} сұрақтың {correct}-і дұрыс",
        }[lang]
        channel, category = "results", "result"
    elif kind == "daily_reminder":
        streak = _number(data.get("streak"))
        if streak:
            title = {"ru": "Сохрани серию занятий", "en": "Keep your learning streak", "kk": "Оқу сериясын жалғастыр"}[lang]
            body = {
                "ru": f"Ты занимаешься {streak} {_ru_plural(streak, ('день', 'дня', 'дней'))} подряд. Продолжим?",
                "en": f"You've studied {streak} {'day' if streak == 1 else 'days'} in a row. Keep going?",
                "kk": f"Сен {streak} күн қатарынан оқып жүрсің. Жалғастырамыз ба?",
            }[lang]
        else:
            title = {"ru": "Продолжим изучать физику?", "en": "Ready for some physics?", "kk": "Физиканы оқуды жалғастырамыз ба?"}[lang]
            body = {"ru": "Короткий тест поможет закрепить знания.", "en": "A short test can help you practise.", "kk": "Қысқа тест біліміңді бекітуге көмектеседі."}[lang]
        channel, category = "reminders", "continue"

    fields = {"title": title, "body": body, "channelId": channel}
    if category:
        fields["categoryId"] = f"physics-{category}-{lang}"
    return fields
