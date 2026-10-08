import asyncio
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
import server
from ozp_exams import FREE_OZP_SESSION_ID, load_ozp_exams


@pytest.mark.parametrize('tier', ['free', 'basic', 'pro'])
@pytest.mark.parametrize('session_id', ['2026-03-11', '2026-05-25', 'nnt-50'])
def test_direct_exam_requests_enforce_premium_not_basic(tier, session_id):
    user = {'id': 'student', 'subscription': {'tier': tier}}
    if tier == 'pro' or session_id == FREE_OZP_SESSION_ID:
        exam = asyncio.run(server.get_ozp_exam(session_id, user))
        assert exam['id'] == session_id and len(exam['questions']) == 50
    else:
        with pytest.raises(HTTPException) as error:
            asyncio.run(server.get_ozp_exam(session_id, user))
        assert error.value.status_code == 403
        assert error.value.detail['code'] == 'OZP_PREMIUM_REQUIRED'


def test_unknown_exam_is_not_silently_replaced_with_free_exam():
    with pytest.raises(HTTPException) as error:
        asyncio.run(server.get_ozp_exam('unknown', {'subscription_tier': 'pro'}))
    assert error.value.status_code == 404


def test_http_routes_require_auth_and_reject_basic_without_leaking_questions():
    client = TestClient(server.app)
    assert client.get('/api/exams/ozp/2026-05-25').status_code in (401, 403)
    async def basic_user(): return {'id': 'student', 'subscription_tier': 'basic'}
    server.app.dependency_overrides[server.get_current_user] = basic_user
    try:
        locked = client.get('/api/exams/ozp/2026-05-25')
        assert locked.status_code == 403
        assert 'questions' not in locked.json()
        free = client.get('/api/exams/ozp/2026-03-11')
        assert free.status_code == 200 and len(free.json()['questions']) == 50
    finally:
        server.app.dependency_overrides.clear()


def test_content_structure_answers_and_contexts_are_preserved_on_server():
    exams = load_ozp_exams()
    assert list(exams) == [FREE_OZP_SESSION_ID, '2026-05-25', 'nnt-50']
    for exam in exams.values():
        assert len(exam['questions']) == 50
        assert exam['durationSeconds'] == 125 * 60 and exam['contextStart'] == 40
        assert exam['passingCount'] == 25
        assert all(not q.get('contextId') for q in exam['questions'][:40])
        assert all(q.get('contextId') in exam['contexts'] for q in exam['questions'][40:])
        for question in exam['questions']:
            assert len(question['options']) == 4 and question['explanation']
            assert 'correct' not in question or 0 <= question['correct'] < 4
    assert [sum('correct' not in q for q in exam['questions']) for exam in exams.values()] == [4, 2, 5]
