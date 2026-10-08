import asyncio
from datetime import datetime, timezone
from types import SimpleNamespace

from daily_push import dispatch_daily_push
from fastapi.testclient import TestClient
import server


class Cursor:
    def __init__(self, rows): self.rows = rows
    def __aiter__(self):
        async def iterate():
            for row in self.rows: yield row
        return iterate()


class Claims:
    def __init__(self): self.rows = {}
    async def update_one(self, query, update, upsert=False):
        key = query['_id']
        if upsert:
            if key in self.rows: return SimpleNamespace(upserted_id=None)
            self.rows[key] = update['$setOnInsert'].copy()
            return SimpleNamespace(upserted_id=key)
        self.rows[key].update(update['$set'])


def database():
    users = {
        'active': {'id': 'active', 'activity_dates': ['2026-10-09']},
        'inactive': {'id': 'inactive'}, 'disabled': {'id': 'disabled'},
    }
    async def find_user(query, _projection): return users.get(query['id'])
    tokens = [
        {'user_id': 'active', 'token': 'ExpoPushToken[a]'},
        {'user_id': 'active', 'token': 'ExponentPushToken[b]'},
        {'user_id': 'inactive', 'token': 'ExpoPushToken[c]'},
        {'user_id': 'disabled', 'token': 'ExpoPushToken[d]', 'enabled': False},
        {'user_id': 'invalid', 'token': 'bad'},
        {'user_id': 'deleted', 'token': 'ExpoPushToken[e]'},
    ]
    return SimpleNamespace(push_tokens=SimpleNamespace(find=lambda *_args: Cursor(tokens)), users=SimpleNamespace(find_one=find_user), push_dispatches=Claims())


NOON = datetime(2026, 10, 9, 7, 0, tzinfo=timezone.utc)


def test_every_opted_in_user_including_active_users_gets_one_dispatch_per_local_day():
    db = database()
    sent = []
    async def send(uid, _title, _body, data):
        sent.append((uid, data))
        await asyncio.sleep(0)
        return 1
    async def run():
        first, simultaneous = await asyncio.gather(dispatch_daily_push(db, send, now=NOON), dispatch_daily_push(db, send, now=NOON))
        again = await dispatch_daily_push(db, send, now=NOON)
        next_day = await dispatch_daily_push(db, send, now=NOON.replace(day=10))
        assert first['sent'] + simultaneous['sent'] == 2
        assert again['sent'] == 0 and again['already_processed'] == 2
        assert next_day['sent'] == 2
    asyncio.run(run())
    assert [uid for uid, _ in sent].count('active') == 2
    assert [uid for uid, _ in sent].count('inactive') == 2
    assert all(data == {'type': 'daily_reminder'} for _, data in sent)


def test_dry_run_counts_recipients_without_sending_or_claiming_and_uses_kazakhstan_date():
    db = database()
    async def never_send(*_args): raise AssertionError('Dry run must not send')
    result = asyncio.run(dispatch_daily_push(db, never_send, now=datetime(2026, 10, 8, 22, 0, tzinfo=timezone.utc), dry_run=True))
    assert result['date'] == '2026-10-09'
    assert result['total_users'] == 2 and result['sent'] == 0
    assert db.push_dispatches.rows == {}


def test_deploy_or_manual_trigger_outside_noon_does_not_send():
    db = database()
    async def never_send(*_args): raise AssertionError('Not noon')
    for hour in [0, 6, 8, 18, 23]:
        result = asyncio.run(dispatch_daily_push(db, never_send, now=NOON.replace(hour=hour)))
        assert result['skipped'] == 'outside_noon_window' and result['sent'] == 0
    assert not db.push_dispatches.rows


def test_ambiguous_failure_is_not_retried_to_avoid_duplicate_delivery():
    db = database()
    async def failed(*_args): return 0
    async def never_retry(*_args): raise AssertionError('Already attempted today')
    first = asyncio.run(dispatch_daily_push(db, failed, now=NOON))
    second = asyncio.run(dispatch_daily_push(db, never_retry, now=NOON))
    assert first['failed'] == 2 and second['already_processed'] == 2


def test_cron_auth_and_safe_http_dry_run(monkeypatch):
    db = database()
    monkeypatch.setattr(server, 'db', db)
    monkeypatch.setattr(server, 'CRON_SECRET', 'test-scheduled-secret')
    client = TestClient(server.app)
    assert client.post('/api/cron/daily-push?dry_run=true').status_code == 403
    response = client.post('/api/cron/daily-push?dry_run=true', headers={'X-Cron-Secret': 'test-scheduled-secret'})
    assert response.status_code == 200
    assert response.json()['total_users'] == 2 and response.json()['sent'] == 0
    assert not db.push_dispatches.rows
