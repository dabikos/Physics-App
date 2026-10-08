"""Noon reminders, with durable at-most-once dispatch per user/local day."""

from datetime import datetime, timedelta, timezone
from pymongo.errors import DuplicateKeyError

from push_notifications import is_expo_push_token

KAZAKHSTAN = timezone(timedelta(hours=5), "Kazakhstan")


async def dispatch_daily_push(db, send_push, *, now=None, dry_run=False):
    now = now or datetime.now(timezone.utc)
    local = now.astimezone(KAZAKHSTAN)
    day = local.date().isoformat()
    report = {"date": day, "timezone": "UTC+05:00", "sent": 0, "total_users": 0, "already_processed": 0, "failed": 0, "dry_run": dry_run}
    if not dry_run and local.hour != 12:
        return {**report, "skipped": "outside_noon_window"}

    # No activity filter: every user with a registered, enabled Expo token is eligible.
    recipients = set()
    async for token in db.push_tokens.find({}, {"user_id": 1, "token": 1, "enabled": 1}):
        if token.get("user_id") and token.get("enabled") is not False and is_expo_push_token(token.get("token")):
            recipients.add(token["user_id"])
    for uid in sorted(recipients):
        if not await db.users.find_one({"id": uid}, {"id": 1}):
            continue
        report["total_users"] += 1
        if dry_run:
            continue
        dispatch_id = f"daily-noon:{day}:{uid}"
        try:
            claimed = await db.push_dispatches.update_one(
                {"_id": dispatch_id},
                {"$setOnInsert": {"user_id": uid, "local_date": day, "type": "daily_reminder", "status": "claimed", "created_at": now}},
                upsert=True,
            )
        except DuplicateKeyError:
            report["already_processed"] += 1
            continue
        if claimed.upserted_id is None:
            report["already_processed"] += 1
            continue
        # Claim BEFORE the external request. Ambiguous network failures are not retried
        # the same day, avoiding duplicate notifications after timeouts/restarts.
        accepted = await send_push(uid, "Продолжим изучать физику?", "Короткий тест поможет закрепить знания.", {"type": "daily_reminder"})
        await db.push_dispatches.update_one({"_id": dispatch_id}, {"$set": {"status": "accepted" if accepted else "failed", "expo_accepted": accepted}})
        report["sent" if accepted else "failed"] += 1
    return report
