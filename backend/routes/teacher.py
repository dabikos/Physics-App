from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import uuid
import hashlib

from server import (
    db,
    get_current_user,
    require_teacher,
    TeacherScoreAdjustment,
    TestScoreOverride,
    AssignedTestCreate,
    PairingSessionCreate,
    DemoStateUpdate,
    PairingJoinRequest,
    DemoTestSubmit,
    WorksheetSubmit,
    generate_pairing_code,
    send_push_to_class,
    get_variant_index,
    generate_test_variant,
)

router = APIRouter()

# ==================== Teacher / Pairing Routes ====================

@router.get("/teacher/classes")
async def get_teacher_classes(current_user: dict = Depends(get_current_user)):
    require_teacher(current_user)
    classes = await db.users.distinct("class_id", {"role": "student", "class_id": {"$ne": None}})
    return {"classes": sorted([c for c in classes if c])}

@router.get("/teacher/students")
async def get_teacher_students(class_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    require_teacher(current_user)
    # Only show students who connected to this teacher's pairing sessions
    query = {"role": "student", "teacher_ids": current_user["id"]}
    if class_id:
        query["class_id"] = class_id

    students = await db.users.find(query).to_list(1000)
    if not students:
        return []

    student_ids = [s["id"] for s in students]
    scores = await db.test_results.aggregate([
        {"$match": {"user_id": {"$in": student_ids}}},
        {"$group": {"_id": "$user_id", "total_score": {"$sum": "$score_final"}, "last_test_at": {"$max": "$created_at"}}}
    ]).to_list(1000)
    score_map = {s["_id"]: s for s in scores}

    result = []
    for s in students:
        score_info = score_map.get(s["id"], {})
        total_score = int(score_info.get("total_score", 0))
        manual_adjustment = int(s.get("manual_adjustment", 0))
        result.append({
            "id": s["id"],
            "name": s.get("name"),
            "email": s.get("email"),
            "class_id": s.get("class_id"),
            "total_score": total_score,
            "manual_adjustment": manual_adjustment,
            "total_with_adjustment": total_score + manual_adjustment,
            "last_test_at": score_info.get("last_test_at")
        })

    return result

@router.get("/teacher/students/{student_id}/results")
async def get_student_results(student_id: str, current_user: dict = Depends(get_current_user)):
    require_teacher(current_user)
    results = await db.test_results.find({"user_id": student_id}).sort("created_at", -1).limit(200).to_list(200)
    return results

@router.patch("/teacher/students/{student_id}/adjustment")
async def update_student_adjustment(student_id: str, payload: TeacherScoreAdjustment, current_user: dict = Depends(get_current_user)):
    require_teacher(current_user)
    await db.users.update_one(
        {"id": student_id},
        {"$set": {"manual_adjustment": payload.manual_adjustment}}
    )
    return {"success": True}

@router.patch("/teacher/test-results/{result_id}/override")
async def override_test_score(result_id: str, payload: TestScoreOverride, current_user: dict = Depends(get_current_user)):
    require_teacher(current_user)
    await db.test_results.update_one(
        {"id": result_id},
        {"$set": {"score_override": payload.score_override, "score_final": payload.score_override}}
    )
    return {"success": True}

@router.post("/teacher/tests")
async def create_assigned_test(payload: AssignedTestCreate, current_user: dict = Depends(get_current_user)):
    require_teacher(current_user)
    test_id = f"assigned-test-{uuid.uuid4().hex[:12]}"
    doc = {
        "id": test_id,
        "title": payload.title,
        "class_id": payload.class_id,
        "scheduled_for": payload.scheduled_for,
        "section": payload.section,
        "difficulty": payload.difficulty,
        "questions": payload.questions,
        "time_limit": payload.time_limit,
        "created_by": current_user["id"],
        "created_at": datetime.utcnow()
    }
    await db.assigned_tests.insert_one(doc)

    # Push-уведомление ученикам класса
    await send_push_to_class(
        class_id=payload.class_id,
        title="📋 Новый тест от учителя",
        body=f"Назначен тест: {payload.title}",
        data={"type": "assigned_test", "test_id": test_id},
        exclude_user_id=current_user["id"],
    )

    return doc

@router.get("/teacher/tests")
async def list_assigned_tests(class_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    require_teacher(current_user)
    query: Dict[str, Any] = {}
    if class_id:
        query["class_id"] = class_id
    tests = await db.assigned_tests.find(query).sort("created_at", -1).to_list(200)
    return tests

@router.post("/teacher/pairing-sessions")
async def create_pairing_session(payload: PairingSessionCreate, current_user: dict = Depends(get_current_user)):
    require_teacher(current_user)
    expires_in = max(5, min(payload.expires_in_minutes, 240))
    code = await generate_pairing_code()
    session_id = f"pair-{uuid.uuid4().hex[:12]}"
    expires_at = datetime.utcnow() + timedelta(minutes=expires_in)
    doc = {
        "id": session_id,
        "code": code,
        "teacher_id": current_user["id"],
        "class_id": payload.class_id,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at,
        "active": True,
        "student_ids": [],
        "last_joined_at": None,
        "demo_state": {
            "mode": "idle",
            "title": "Экран демонстрации",
            "subtitle": "Ожидайте материал от учителя",
            "payload": {},
            "updated_at": datetime.utcnow()
        }
    }
    await db.pairing_sessions.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.get("/teacher/pairing-sessions/active")
async def get_active_pairing_session(current_user: dict = Depends(get_current_user)):
    require_teacher(current_user)
    now = datetime.utcnow()
    session = await db.pairing_sessions.find_one(
        {"teacher_id": current_user["id"], "active": True, "expires_at": {"$gt": now}},
        sort=[("created_at", -1)]
    )
    if not session:
        return {"session": None, "students": []}
    session.pop("_id", None)

    student_ids = session.get("student_ids", [])
    students = []
    if student_ids:
        students = await db.users.find({"id": {"$in": student_ids}}).to_list(500)
        students = [
            {
                "id": s["id"],
                "name": s.get("name"),
                "email": s.get("email"),
                "class_id": s.get("class_id")
            }
            for s in students
        ]
    return {"session": session, "students": students}

@router.post("/teacher/pairing-sessions/{session_id}/close")
async def close_pairing_session(session_id: str, current_user: dict = Depends(get_current_user)):
    require_teacher(current_user)
    await db.pairing_sessions.update_one(
        {"id": session_id, "teacher_id": current_user["id"]},
        {"$set": {"active": False}}
    )
    return {"success": True}

@router.post("/teacher/pairing-sessions/{session_id}/demo")
async def update_demo_state(session_id: str, payload: DemoStateUpdate, current_user: dict = Depends(get_current_user)):
    require_teacher(current_user)
    demo_state = {
        "mode": payload.mode,
        "title": payload.title,
        "subtitle": payload.subtitle,
        "payload": payload.payload or {},
        "updated_at": datetime.utcnow()
    }
    await db.pairing_sessions.update_one(
        {"id": session_id, "teacher_id": current_user["id"]},
        {"$set": {"demo_state": demo_state}}
    )
    return {"success": True, "demo_state": demo_state}

@router.post("/student/join-session")
async def join_pairing_session(payload: PairingJoinRequest, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    now = datetime.utcnow()
    session = await db.pairing_sessions.find_one(
        {"code": payload.code, "active": True, "expires_at": {"$gt": now}}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    if session.get("class_id") and current_user.get("class_id") != session.get("class_id"):
        raise HTTPException(status_code=400, detail="Session class mismatch")

    await db.pairing_sessions.update_one(
        {"id": session["id"]},
        {"$addToSet": {"student_ids": current_user["id"]}, "$set": {"last_joined_at": now}}
    )

    # Save persistent teacher-student relationship
    teacher_id = session["teacher_id"]
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$addToSet": {"teacher_ids": teacher_id}}
    )

    return {
        "session_id": session["id"],
        "teacher_id": teacher_id,
        "class_id": session.get("class_id"),
        "joined_at": now
    }

@router.get("/student/pairing-sessions/{session_id}")
async def get_student_pairing_session(session_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    now = datetime.utcnow()
    session = await db.pairing_sessions.find_one(
        {"id": session_id, "active": True, "expires_at": {"$gt": now}}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    if session.get("class_id") and current_user.get("class_id") != session.get("class_id"):
        raise HTTPException(status_code=400, detail="Session class mismatch")
    session.pop("_id", None)
    demo_state = session.get("demo_state", {"mode": "idle", "payload": {}})
    payload = demo_state.get("payload", {}) or {}

    if demo_state.get("mode") == "test":
        base_questions = payload.get("questions", [])
        variant_count = int(payload.get("variant_count", 3) or 3)
        variant_index = get_variant_index(session_id, current_user["id"], variant_count)
        variant = await db.demo_test_variants.find_one({
            "session_id": session_id,
            "student_id": current_user["id"]
        })
        if not variant and base_questions:
            seed = int(hashlib.sha256(f"{session_id}:{current_user['id']}:{variant_index}".encode("utf-8")).hexdigest(), 16) % (2**31)
            variant_questions = generate_test_variant(base_questions, seed)
            variant_doc = {
                "session_id": session_id,
                "student_id": current_user["id"],
                "variant_index": variant_index,
                "questions": variant_questions,
                "created_at": datetime.utcnow()
            }
            await db.demo_test_variants.insert_one(variant_doc)
            variant = variant_doc

        sanitized_questions = []
        if variant:
            sanitized_questions = [
                {"question": q.get("question"), "options": q.get("options", [])}
                for q in variant.get("questions", [])
            ]

        payload = {
            **payload,
            "questions": sanitized_questions,
            "variant_index": variant_index,
            "variant_count": variant_count
        }
        demo_state = {**demo_state, "payload": payload}

    result = await db.demo_test_results.find_one({
        "session_id": session_id,
        "student_id": current_user["id"]
    })
    if result:
        result.pop("_id", None)

    return {
        "session": {
            "id": session.get("id"),
            "code": session.get("code"),
            "class_id": session.get("class_id"),
            "teacher_id": session.get("teacher_id"),
            "expires_at": session.get("expires_at")
        },
        "demo_state": demo_state,
        "result": result
    }

@router.post("/student/pairing-sessions/{session_id}/submit-test")
async def submit_demo_test(session_id: str, payload: DemoTestSubmit, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    session = await db.pairing_sessions.find_one({"id": session_id, "active": True})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    demo_state = session.get("demo_state", {})
    base_questions = (demo_state.get("payload") or {}).get("questions", [])
    variant_count = int((demo_state.get("payload") or {}).get("variant_count", 3) or 3)
    variant = await db.demo_test_variants.find_one({
        "session_id": session_id,
        "student_id": current_user["id"]
    })
    if not variant and base_questions:
        variant_index = get_variant_index(session_id, current_user["id"], variant_count)
        seed = int(hashlib.sha256(f"{session_id}:{current_user['id']}:{variant_index}".encode("utf-8")).hexdigest(), 16) % (2**31)
        variant_questions = generate_test_variant(base_questions, seed)
        variant_doc = {
            "session_id": session_id,
            "student_id": current_user["id"],
            "variant_index": variant_index,
            "questions": variant_questions,
            "created_at": datetime.utcnow()
        }
        await db.demo_test_variants.insert_one(variant_doc)
        variant = variant_doc

    if not variant:
        raise HTTPException(status_code=400, detail="No test available")

    questions = variant.get("questions", [])
    answers = payload.answers
    correct = 0
    for idx, question in enumerate(questions):
        correct_index = question.get("correct_index")
        if correct_index is None:
            continue
        if idx < len(answers) and answers[idx] == correct_index:
            correct += 1
    total = len(questions)
    score = int(round((correct / total) * 100)) if total > 0 else 0

    result_doc = {
        "session_id": session_id,
        "student_id": current_user["id"],
        "variant_index": variant.get("variant_index"),
        "answers": answers,
        "correct": correct,
        "total": total,
        "score": score,
        "created_at": datetime.utcnow()
    }
    await db.demo_test_results.update_one(
        {"session_id": session_id, "student_id": current_user["id"]},
        {"$set": result_doc},
        upsert=True
    )
    return result_doc

@router.get("/teacher/pairing-sessions/{session_id}/results")
async def get_demo_results(session_id: str, current_user: dict = Depends(get_current_user)):
    require_teacher(current_user)
    session = await db.pairing_sessions.find_one({"id": session_id, "teacher_id": current_user["id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    results = await db.demo_test_results.find({"session_id": session_id}).to_list(1000)
    for r in results:
        r.pop("_id", None)
    if not results:
        return {"results": [], "summary": {"count": 0, "average": 0}}

    student_ids = [r["student_id"] for r in results]
    students = await db.users.find({"id": {"$in": student_ids}}).to_list(1000)
    student_map = {s["id"]: s for s in students}
    enriched = []
    for r in results:
        s = student_map.get(r["student_id"], {})
        enriched.append({
            "student_id": r["student_id"],
            "name": s.get("name"),
            "email": s.get("email"),
            "class_id": s.get("class_id"),
            "score": r.get("score", 0),
            "correct": r.get("correct", 0),
            "total": r.get("total", 0),
            "variant_index": r.get("variant_index")
        })
    avg = int(sum(r["score"] for r in enriched) / len(enriched)) if enriched else 0
    return {
        "results": enriched,
        "summary": {
            "count": len(enriched),
            "average": avg
        }
    }

@router.get("/assigned-tests")
async def get_assigned_tests(class_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query: Dict[str, Any] = {}
    if class_id:
        query["class_id"] = class_id
    elif current_user.get("role") == "student":
        query["class_id"] = current_user.get("class_id")

    tests = await db.assigned_tests.find(query).sort("created_at", -1).to_list(200)
    return tests

@router.post("/student/pairing-sessions/{session_id}/submit-worksheet")
async def submit_worksheet(session_id: str, payload: WorksheetSubmit, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    session = await db.pairing_sessions.find_one({"id": session_id, "active": True})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    demo_state = session.get("demo_state", {})
    if demo_state.get("mode") != "worksheet":
        raise HTTPException(status_code=400, detail="No worksheet active")

    tasks = (demo_state.get("payload") or {}).get("tasks", [])
    task_map = {t["id"]: t for t in tasks if "id" in t}

    graded = {}
    auto_score = 0
    auto_total = 0
    for task_id, student_answer in payload.answers.items():
        task = task_map.get(task_id)
        if not task:
            graded[task_id] = {"answer": student_answer, "correct": None, "auto": False}
            continue

        task_type = task.get("type", "")
        is_correct = None

        if task_type == "multiple-choice":
            correct_idx = task.get("correctIndex")
            if correct_idx is not None and isinstance(student_answer, (int, float)):
                is_correct = int(student_answer) == int(correct_idx)
                auto_total += 1
                if is_correct:
                    auto_score += 1

        elif task_type == "true-false":
            expected = task.get("isTrue")
            if expected is not None:
                student_bool = student_answer == "true" if isinstance(student_answer, str) else bool(student_answer)
                is_correct = student_bool == expected
                auto_total += 1
                if is_correct:
                    auto_score += 1

        elif task_type == "short-answer":
            expected = (task.get("answerText") or "").strip().lower()
            given = (str(student_answer) if student_answer else "").strip().lower()
            if expected:
                is_correct = given == expected
                auto_total += 1
                if is_correct:
                    auto_score += 1

        elif task_type == "fill-blanks":
            expected = task.get("blankAnswers", [])
            given = student_answer if isinstance(student_answer, list) else []
            if expected:
                correct_count = sum(
                    1 for e, g in zip(expected, given)
                    if str(e).strip().lower() == str(g).strip().lower()
                )
                auto_total += len(expected)
                auto_score += correct_count
                is_correct = correct_count == len(expected)

        elif task_type == "find-extra":
            expected = task.get("correctItem", "")
            if expected:
                is_correct = str(student_answer).strip().lower() == expected.strip().lower()
                auto_total += 1
                if is_correct:
                    auto_score += 1

        elif task_type == "insert-letter":
            expected = (task.get("correctWord") or "").strip().lower()
            if expected and student_answer is not None:
                # Mobile sends array of letters for each blank, e.g. ["и"] for "ф_зика"
                if isinstance(student_answer, list):
                    word_with_blanks = task.get("wordWithBlanks", "")
                    parts = word_with_blanks.split("_")
                    reconstructed = ""
                    for idx_p, part in enumerate(parts):
                        reconstructed += part
                        if idx_p < len(parts) - 1:
                            letter = student_answer[idx_p] if idx_p < len(student_answer) else ""
                            reconstructed += str(letter)
                    given = reconstructed.strip().lower()
                else:
                    given = str(student_answer).strip().lower()
                is_correct = given == expected
                auto_total += 1
                if is_correct:
                    auto_score += 1

        elif task_type == "compare-numbers":
            expected_pairs = task.get("comparePairs", [])
            given = student_answer if isinstance(student_answer, dict) else {}
            if expected_pairs:
                correct_count = 0
                for i, pair in enumerate(expected_pairs):
                    if given.get(str(i)) == pair.get("operator"):
                        correct_count += 1
                auto_total += len(expected_pairs)
                auto_score += correct_count
                is_correct = correct_count == len(expected_pairs)

        elif task_type == "sequence":
            expected_seq = task.get("correctSequence", [])
            given = student_answer if isinstance(student_answer, list) else []
            if expected_seq:
                is_correct = given == expected_seq
                auto_total += 1
                if is_correct:
                    auto_score += 1

        elif task_type == "anagram":
            expected = (task.get("anagramAnswer") or "").strip().lower()
            given = (str(student_answer) if student_answer else "").strip().lower()
            if expected:
                is_correct = given == expected
                auto_total += 1
                if is_correct:
                    auto_score += 1

        elif task_type == "continue-sequence":
            expected = task.get("sequenceAnswer", [])
            given = student_answer if isinstance(student_answer, list) else []
            if expected:
                correct_count = sum(
                    1 for e, g in zip(expected, given)
                    if str(e).strip().lower() == str(g).strip().lower()
                )
                auto_total += len(expected)
                auto_score += correct_count
                is_correct = correct_count == len(expected)

        elif task_type == "match-columns":
            expected_pairs = task.get("pairs", {})
            given = student_answer if isinstance(student_answer, dict) else {}
            if expected_pairs:
                # Mobile sends {leftIndex: rightIndex}, convert to text-based matching
                left_col = task.get("leftColumn", [])
                right_col = task.get("rightColumn", [])
                correct_count = 0
                for k, v in given.items():
                    try:
                        left_text = left_col[int(k)] if int(k) < len(left_col) else None
                        right_text = right_col[int(v)] if int(v) < len(right_col) else None
                    except (ValueError, TypeError):
                        # Keys are already text (web or future format)
                        left_text = k
                        right_text = v
                    if left_text and right_text and expected_pairs.get(left_text) == right_text:
                        correct_count += 1
                auto_total += len(expected_pairs)
                auto_score += correct_count
                is_correct = correct_count == len(expected_pairs)

        graded[task_id] = {
            "answer": student_answer,
            "correct": is_correct,
            "auto": is_correct is not None,
        }

    score_percent = int(round((auto_score / auto_total) * 100)) if auto_total > 0 else None

    result_doc = {
        "session_id": session_id,
        "student_id": current_user["id"],
        "answers": payload.answers,
        "graded": graded,
        "auto_score": auto_score,
        "auto_total": auto_total,
        "score_percent": score_percent,
        "task_count": len(tasks),
        "answered_count": len(payload.answers),
        "created_at": datetime.utcnow(),
    }
    await db.worksheet_results.update_one(
        {"session_id": session_id, "student_id": current_user["id"]},
        {"$set": result_doc},
        upsert=True,
    )
    return result_doc


@router.get("/teacher/pairing-sessions/{session_id}/worksheet-results")
async def get_worksheet_results(session_id: str, current_user: dict = Depends(get_current_user)):
    require_teacher(current_user)
    session = await db.pairing_sessions.find_one({"id": session_id, "teacher_id": current_user["id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    results = await db.worksheet_results.find({"session_id": session_id}).to_list(1000)
    for r in results:
        r.pop("_id", None)
    if not results:
        return {"results": [], "summary": {"count": 0, "average": None}}

    student_ids = [r["student_id"] for r in results]
    students = await db.users.find({"id": {"$in": student_ids}}).to_list(1000)
    student_map = {s["id"]: s for s in students}

    enriched = []
    for r in results:
        s = student_map.get(r["student_id"], {})
        enriched.append({
            "student_id": r["student_id"],
            "name": s.get("name"),
            "email": s.get("email"),
            "class_id": s.get("class_id"),
            "answers": r.get("answers", {}),
            "graded": r.get("graded", {}),
            "auto_score": r.get("auto_score", 0),
            "auto_total": r.get("auto_total", 0),
            "score_percent": r.get("score_percent"),
            "task_count": r.get("task_count", 0),
            "answered_count": r.get("answered_count", 0),
            "created_at": r.get("created_at"),
        })

    scored = [r["score_percent"] for r in enriched if r["score_percent"] is not None]
    avg = int(sum(scored) / len(scored)) if scored else None

    return {
        "results": enriched,
        "summary": {
            "count": len(enriched),
            "average": avg,
        },
    }
