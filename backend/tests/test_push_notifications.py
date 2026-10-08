import asyncio
from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from starlette.requests import Request

import server
from push_notifications import build_push_presentation, is_expo_push_token, normalize_push_language
from routes import teacher


@pytest.mark.parametrize("value,expected", [("en-US,en;q=0.9", "en"), ("kk,en;q=0.8", "kk"), ("kz", "kk"), (None, "ru"), ("de", "ru")])
def test_language_fallback(value, expected):
    assert normalize_push_language(value) == expected


@pytest.mark.parametrize("language", ["ru", "en", "kk"])
def test_assigned_push_has_matching_native_category_and_seconds_converted_to_minutes(language):
    message = build_push_presentation(language, {
        "type": "assigned_test", "test_title": "Newton", "question_count": 10, "time_limit": 900,
    }, "old title", "old body")
    assert message["categoryId"] == f"physics-assigned-{language}"
    assert message["channelId"] == "learning"
    assert "Newton" in message["body"]
    assert "10" in message["body"] and "15" in message["body"]
    assert "900" not in message["body"]
    assert "old" not in message["title"]


def test_streak_copy_has_correct_russian_plural_and_result_can_be_zero():
    assert "21 день подряд" in build_push_presentation("ru", {"type": "daily_reminder", "streak": 21}, "", "")["body"]
    assert "12 дней подряд" in build_push_presentation("ru", {"type": "daily_reminder", "streak": 12}, "", "")["body"]
    result = build_push_presentation("en", {"type": "test_result", "student_name": "Aliya", "score": 0, "correct_count": 0, "total": 10}, "", "")
    assert result["body"] == "Aliya — 0% · 0 of 10"
    assert result["categoryId"] == "physics-result-en"


def test_only_expo_tokens_are_accepted():
    assert is_expo_push_token("ExponentPushToken[abc-123]")
    assert is_expo_push_token("ExpoPushToken[abc-123]")
    assert not is_expo_push_token("abc")
    assert not is_expo_push_token("ExpoPushToken[bad token]")


class FakeTokens:
    def __init__(self, items):
        self.items = items
        self.deleted = []
        self.saved = None

    def find(self, _query):
        return self

    async def to_list(self, _limit):
        return self.items

    async def delete_one(self, query):
        self.deleted.append(query)

    async def update_one(self, query, update, upsert=False):
        self.saved = {"query": query, "update": update, "upsert": upsert}


def test_dispatch_localizes_per_device_preserves_legacy_channel_and_does_not_delete_credential_errors(monkeypatch):
    tokens = FakeTokens([
        {"token": "ExpoPushToken[a]", "language": "en", "notification_version": 2},
        {"token": "ExpoPushToken[b]", "language": "kk"},
        {"token": "ExpoPushToken[c]", "language": "ru", "notification_version": 2},
    ])
    monkeypatch.setattr(server, "db", SimpleNamespace(push_tokens=tokens))
    captured = {}

    class FakeClient:
        async def __aenter__(self): return self
        async def __aexit__(self, *_args): pass
        async def post(self, _url, **kwargs):
            captured.update(kwargs)
            return SimpleNamespace(raise_for_status=lambda: None, json=lambda: {"data": [
                {"status": "ok", "id": "ticket-1"},
                {"status": "error", "details": {"error": "InvalidCredentials"}},
                {"status": "error", "details": {"error": "DeviceNotRegistered"}},
            ]})

    monkeypatch.setattr(server.httpx, "AsyncClient", FakeClient)
    accepted = asyncio.run(server.send_push_notification("user-1", "old", "old", {
        "type": "assigned_test", "test_title": "Newton", "question_count": 10, "time_limit": 900,
    }))
    assert accepted == 1
    messages = captured["json"]
    assert messages[0]["title"] == "New test from your teacher"
    assert messages[0]["categoryId"] == "physics-assigned-en"
    assert messages[0]["data"]["recipient_user_id"] == "user-1"
    assert messages[1]["channelId"] == "default" and "categoryId" not in messages[1]
    assert tokens.deleted == [{"token": "ExpoPushToken[c]"}]


def test_token_registration_stores_device_language_and_ui_version(monkeypatch):
    tokens = FakeTokens([])
    monkeypatch.setattr(server, "db", SimpleNamespace(push_tokens=tokens))
    async def receive():
        return {"type": "http.request", "body": b'{"token":"ExpoPushToken[abc]","platform":"android","language":"en-US","notification_version":2}'}
    request = Request({"type": "http", "headers": []}, receive)
    asyncio.run(server.save_push_token(request, {"id": "user-1"}))
    saved = tokens.saved["update"]["$set"]
    assert saved["language"] == "en"
    assert saved["notification_version"] == 2
    assert saved["user_id"] == "user-1"


def test_old_app_token_registration_still_works_without_new_metadata(monkeypatch):
    tokens = FakeTokens([])
    monkeypatch.setattr(server, "db", SimpleNamespace(push_tokens=tokens))
    async def receive():
        return {"type": "http.request", "body": b'{"token":"ExponentPushToken[legacy]","platform":"android"}'}
    request = Request({"type": "http", "headers": []}, receive)
    result = asyncio.run(server.save_push_token(request, {"id": "legacy-user"}))
    assert result['success']
    assert tokens.saved['update']['$set']['notification_version'] == 1
    assert tokens.saved['update']['$set']['language'] == 'ru'


@pytest.mark.parametrize("connected", [True, False])
def test_assigned_test_submission_checks_membership_and_builds_teacher_push(monkeypatch, connected):
    inserted = []
    pushed = []
    class EmptyTests:
        async def find_one(self, _query): return None
    class AssignedTests:
        async def find_one(self, _query):
            return {
                "id": "assigned-push-test", "class_id": "7A", "created_by": "teacher-1",
                "questions": [{"question": "Q1", "correct": 0}, {"question": "Q2", "correct": 1}],
            }
    class Results:
        async def insert_one(self, document): inserted.append(document)
    class Users:
        async def update_one(self, *_args): pass
    async def capture_push(user_id, title, body, data):
        pushed.append({"recipient": user_id, "data": data})
        return 1
    monkeypatch.setattr(server, "db", SimpleNamespace(tests=EmptyTests(), assigned_tests=AssignedTests(), test_results=Results(), users=Users()))
    monkeypatch.setattr(server, "INITIAL_TESTS", [])
    monkeypatch.setattr(server, "send_push_notification", capture_push)
    current_user = {"id": "student-1", "name": "Aliya", "role": "student", "class_id": "7A", "teacher_ids": ["teacher-1"] if connected else []}
    request = server.TestSubmitRequest(answers=[0, 0], source="assigned_test")
    if not connected:
        with pytest.raises(HTTPException) as error:
            asyncio.run(server.submit_test("assigned-push-test", request, current_user))
        assert error.value.status_code == 404
        assert not inserted and not pushed
        return
    result = asyncio.run(server.submit_test("assigned-push-test", request, current_user))
    assert result["score"] == 50 and result["correct_count"] == 1
    assert inserted[0]["assigned_test_id"] == "assigned-push-test"
    assert pushed[0]["recipient"] == "teacher-1"
    assert pushed[0]["data"] == {
        "type": "test_result", "result_id": result["result_id"], "student_id": "student-1",
        "student_name": "Aliya", "score": 50, "correct_count": 1, "total": 2,
    }


@pytest.mark.parametrize("class_id,teacher_ids,allowed", [("7A", ["teacher-1"], True), ("7A", ["other-teacher"], False), ("9B", ["teacher-1"], False)])
def test_push_link_only_opens_a_test_from_the_students_connected_teacher(monkeypatch, class_id, teacher_ids, allowed):
    class AssignedTests:
        async def find_one(self, _query):
            return {"_id": "private-mongo-id", "id": "assigned-1", "class_id": "7A", "created_by": "teacher-1", "questions": []}
    monkeypatch.setattr(teacher, "db", SimpleNamespace(assigned_tests=AssignedTests()))
    current_user = {"id": "student-1", "role": "student", "class_id": class_id, "teacher_ids": teacher_ids}
    if allowed:
        result = asyncio.run(teacher.get_assigned_student_test("assigned-1", current_user))
        assert result["id"] == "assigned-1" and "_id" not in result
    else:
        with pytest.raises(HTTPException) as error:
            asyncio.run(teacher.get_assigned_student_test("assigned-1", current_user))
        assert error.value.status_code == 404
