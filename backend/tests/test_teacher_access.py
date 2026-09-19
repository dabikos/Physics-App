from fastapi.testclient import TestClient

from server import app, get_current_user
from routes import teacher as teacher_routes


class AsyncCursor:
    def __init__(self, items):
        self.items = items

    def sort(self, *_args, **_kwargs):
        return self

    def limit(self, *_args, **_kwargs):
        return self

    async def to_list(self, _limit):
        return list(self.items)


class FakeUsers:
    def __init__(self, users):
        self.users = users

    async def distinct(self, field, query):
        values = []
        for user in self.users:
            if user.get("role") != query.get("role"):
                continue
            teacher_id = query.get("teacher_ids")
            if teacher_id and teacher_id not in user.get("teacher_ids", []):
                continue
            value = user.get(field)
            if value and value not in values:
                values.append(value)
        return values

    async def find_one(self, query):
        for user in self.users:
            if user.get("id") != query.get("id"):
                continue
            teacher_id = query.get("teacher_ids")
            if teacher_id and teacher_id not in user.get("teacher_ids", []):
                continue
            return dict(user)
        return None


class FakeResults:
    def find(self, query):
        return AsyncCursor([{"id": "foreign-result", "user_id": query["user_id"], "score": 100}])


class FakeAssignedTests:
    def __init__(self):
        self.last_query = None

    def find(self, query):
        self.last_query = query
        return AsyncCursor([])


class FakeDb:
    def __init__(self):
        self.users = FakeUsers(
            [
                {"id": "connected", "role": "student", "class_id": "7A", "teacher_ids": ["teacher-1"]},
                {"id": "foreign", "role": "student", "class_id": "9B", "teacher_ids": ["teacher-2"]},
            ]
        )
        self.test_results = FakeResults()
        self.assigned_tests = FakeAssignedTests()


def teacher_user():
    return {"id": "teacher-1", "role": "teacher", "email": "teacher@example.com"}


def connected_student_user():
    return {
        "id": "connected",
        "role": "student",
        "class_id": "7A",
        "teacher_ids": ["teacher-1"],
    }


def test_teacher_classes_only_include_qr_connected_students(monkeypatch):
    monkeypatch.setattr(teacher_routes, "db", FakeDb())
    app.dependency_overrides[get_current_user] = teacher_user
    try:
        response = TestClient(app).get("/api/teacher/classes")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {"classes": ["7A"]}


def test_teacher_cannot_read_results_for_unconnected_student(monkeypatch):
    monkeypatch.setattr(teacher_routes, "db", FakeDb())
    app.dependency_overrides[get_current_user] = teacher_user
    try:
        response = TestClient(app).get("/api/teacher/students/foreign/results")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404


def test_student_only_receives_tests_from_qr_connected_teachers(monkeypatch):
    fake_db = FakeDb()
    monkeypatch.setattr(teacher_routes, "db", fake_db)
    app.dependency_overrides[get_current_user] = connected_student_user
    try:
        response = TestClient(app).get("/api/assigned-tests")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert fake_db.assigned_tests.last_query == {
        "class_id": "7A",
        "created_by": {"$in": ["teacher-1"]},
    }
