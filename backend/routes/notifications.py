from fastapi import APIRouter, Depends, Header, Request
from datetime import datetime, timedelta

from server import (
    db,
    get_current_user,
    parse_accept_language,
    compute_streak,
    compute_xp,
    compute_achievements,
)

router = APIRouter()

# ==================== Notifications ====================

@router.get("/notifications")
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    accept_language: str | None = Header(default=None, alias="Accept-Language"),
):
    """Generate smart notifications based on user activity."""
    lang = parse_accept_language(accept_language)
    user_id = current_user["id"]
    now = datetime.utcnow()
    today = now.strftime("%Y-%m-%d")
    yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")

    notifications = []

    # --- 1. Streak notifications ---
    activity_dates = current_user.get("activity_dates", [])
    sorted_dates = sorted(set(d if isinstance(d, str) else d.strftime("%Y-%m-%d") for d in activity_dates))
    streak = compute_streak(current_user)
    current_streak = streak.get("current", 0)
    last_active = sorted_dates[-1] if sorted_dates else None

    if last_active and last_active < today:
        # User hasn't been active today — remind
        if current_streak > 0:
            texts = {
                "ru": {"title": "🔥 Не потеряй свой стрик!", "body": f"У тебя {current_streak} дней подряд. Зайди сегодня, чтобы не сбросить!"},
                "en": {"title": "🔥 Don't lose your streak!", "body": f"You have {current_streak} days in a row. Come back today!"},
                "kk": {"title": "🔥 Стригіңді жоғалтпа!", "body": f"Сенде {current_streak} күн қатарынан. Бүгін кір!"},
            }
            t = texts.get(lang, texts["ru"])
            notifications.append({
                "id": f"streak-remind-{today}",
                "type": "streak",
                "icon": "flame",
                "color": "#F59E0B",
                "title": t["title"],
                "body": t["body"],
                "time": now.isoformat(),
                "read": False,
            })
    elif current_streak >= 3:
        texts = {
            "ru": {"title": "🔥 Стрик продолжается!", "body": f"Отлично! {current_streak} дней подряд. Так держать!"},
            "en": {"title": "🔥 Streak continues!", "body": f"Great! {current_streak} days in a row. Keep it up!"},
            "kk": {"title": "🔥 Стрик жалғасуда!", "body": f"Керемет! {current_streak} күн қатарынан. Жалғастыр!"},
        }
        t = texts.get(lang, texts["ru"])
        notifications.append({
            "id": f"streak-congrats-{today}",
            "type": "streak",
            "icon": "flame",
            "color": "#10B981",
            "title": t["title"],
            "body": t["body"],
            "time": now.isoformat(),
            "read": False,
        })

    # --- 2. Daily challenge ---
    daily_done = await db.daily_challenges.find_one({
        "user_id": user_id, "date": today, "completed": True
    })
    if not daily_done:
        texts = {
            "ru": {"title": "🎯 Новый челлендж дня!", "body": "Выполни задание дня и получи бонусные XP"},
            "en": {"title": "🎯 New daily challenge!", "body": "Complete today's challenge for bonus XP"},
            "kk": {"title": "🎯 Жаңа күнделікті тапсырма!", "body": "Бүгінгі тапсырманы орында, бонус XP ал"},
        }
        t = texts.get(lang, texts["ru"])
        notifications.append({
            "id": f"daily-{today}",
            "type": "daily_challenge",
            "icon": "trophy",
            "color": "#8B5CF6",
            "title": t["title"],
            "body": t["body"],
            "time": now.isoformat(),
            "read": False,
        })

    # --- 3. New achievements ---
    test_results = await db.test_results.find({"user_id": user_id}).to_list(500)
    xp = compute_xp(current_user, test_results)
    achievements = compute_achievements(current_user, test_results, xp, streak, lang)
    new_achievements = [a for a in achievements if a.get("is_new")]
    for ach in new_achievements[:3]:
        notifications.append({
            "id": f"ach-{ach['id']}",
            "type": "achievement",
            "icon": "medal",
            "color": "#F59E0B",
            "title": f"{ach['icon']} {ach['name']}",
            "body": ach["description"],
            "time": now.isoformat(),
            "read": False,
        })

    # --- 4. Assigned tests from teacher (for students) ---
    if current_user.get("role") == "student":
        class_id = current_user.get("class_id")
        if class_id:
            recent_tests = await db.assigned_tests.find({
                "class_id": class_id,
                "created_at": {"$gte": now - timedelta(days=7)}
            }).sort("created_at", -1).limit(5).to_list(5)

            completed_test_ids = set(current_user.get("progress", {}).get("completed_tests", []))
            for at in recent_tests:
                if at["id"] not in completed_test_ids:
                    texts = {
                        "ru": {"title": "📋 Новый тест от учителя", "body": f"Назначен тест: {at.get('title', 'Тест')}"},
                        "en": {"title": "📋 New test from teacher", "body": f"Assigned test: {at.get('title', 'Test')}"},
                        "kk": {"title": "📋 Мұғалімнен жаңа тест", "body": f"Тест тағайындалды: {at.get('title', 'Тест')}"},
                    }
                    t = texts.get(lang, texts["ru"])
                    notifications.append({
                        "id": f"assigned-{at['id']}",
                        "type": "assigned_test",
                        "icon": "document-text",
                        "color": "#3B82F6",
                        "title": t["title"],
                        "body": t["body"],
                        "time": at.get("created_at", now).isoformat(),
                        "read": False,
                    })

    # --- 5. Recent test results ---
    recent_results = test_results[:5]
    for r in recent_results:
        score = r.get("score_final") or r.get("score", 0)
        created = r.get("created_at", now)
        # Only show results from last 3 days
        if (now - created).days > 3:
            continue
        emoji = "💯" if score == 100 else "📊"
        texts = {
            "ru": {"title": f"{emoji} Результат теста", "body": f"Вы набрали {score}% на тесте"},
            "en": {"title": f"{emoji} Test result", "body": f"You scored {score}% on a test"},
            "kk": {"title": f"{emoji} Тест нәтижесі", "body": f"Сіз тестте {score}% алдыңыз"},
        }
        t = texts.get(lang, texts["ru"])
        notifications.append({
            "id": f"result-{r.get('id', r.get('test_id', ''))}",
            "type": "test_result",
            "icon": "stats-chart",
            "color": "#10B981" if score >= 70 else "#EF4444",
            "title": t["title"],
            "body": t["body"],
            "time": created.isoformat(),
            "read": False,
        })

    # --- 6. Learning reminder (if inactive 2+ days) ---
    if last_active and last_active < yesterday:
        days_inactive = (now - datetime.strptime(last_active, "%Y-%m-%d")).days
        if days_inactive >= 2:
            texts = {
                "ru": {"title": "💡 Вернись к учёбе!", "body": f"Тебя не было {days_inactive} дней. Физика ждёт!"},
                "en": {"title": "💡 Come back to study!", "body": f"You've been away for {days_inactive} days. Physics awaits!"},
                "kk": {"title": "💡 Оқуға оралыңыз!", "body": f"Сіз {days_inactive} күн болмадыңыз. Физика күтеді!"},
            }
            t = texts.get(lang, texts["ru"])
            notifications.append({
                "id": f"inactive-{today}",
                "type": "reminder",
                "icon": "bulb",
                "color": "#6366F1",
                "title": t["title"],
                "body": t["body"],
                "time": now.isoformat(),
                "read": False,
            })

    # Sort by time desc
    notifications.sort(key=lambda n: n.get("time", ""), reverse=True)

    # Mark read status from DB
    read_ids_doc = await db.notification_reads.find_one({"user_id": user_id})
    read_ids = set(read_ids_doc.get("read_ids", [])) if read_ids_doc else set()
    for n in notifications:
        if n["id"] in read_ids:
            n["read"] = True

    unread_count = sum(1 for n in notifications if not n["read"])

    return {
        "notifications": notifications,
        "unread_count": unread_count,
    }


@router.post("/notifications/read")
async def mark_notifications_read(request: Request, current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read."""
    user_id = current_user["id"]
    body = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
    ids = body.get("ids", [])
    if ids:
        await db.notification_reads.update_one(
            {"user_id": user_id},
            {"$addToSet": {"read_ids": {"$each": ids}}, "$set": {"last_read_at": datetime.utcnow()}},
            upsert=True,
        )
    return {"success": True}


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a specific notification as read."""
    await db.notification_reads.update_one(
        {"user_id": current_user["id"]},
        {"$addToSet": {"read_ids": notification_id}},
        upsert=True,
    )
    return {"success": True}
