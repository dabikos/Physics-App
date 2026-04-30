from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from pymongo import ReturnDocument

from server import (
    db,
    logger,
    ChatRewardClaimRequest,
    ChatRequest,
    get_current_user,
    _get_chat_quota,
    _consume_chat_credit,
    _utc_day_key,
    call_ai,
)
from postgres import get_ai_prompt

router = APIRouter()

# ==================== Chat Routes ====================

@router.get("/chat/quota")
async def get_chat_quota(current_user: dict = Depends(get_current_user)):
    return await _get_chat_quota(current_user["id"])

@router.post("/chat/rewarded/claim")
async def claim_chat_rewarded_credit(
    request: ChatRewardClaimRequest,
    current_user: dict = Depends(get_current_user),
):
    now = datetime.utcnow()
    day_key = _utc_day_key()
    await db.chat_usage.find_one_and_update(
        {"user_id": current_user["id"], "day": day_key},
        {
            "$setOnInsert": {"created_at": now, "free_used": 0},
            "$set": {"updated_at": now},
            "$inc": {"rewarded_credits": 1},
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    quota = await _get_chat_quota(current_user["id"])
    return {"success": True, "quota": quota}

@router.post("/chat")
async def chat_with_ai(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    try:
        allowance = await _consume_chat_credit(current_user["id"])
        if not allowance["allowed"]:
            raise HTTPException(
                status_code=429,
                detail={
                    "code": "CHAT_LIMIT_REACHED",
                    "message": "Бесплатный лимит AI-чата исчерпан. Посмотрите рекламу, чтобы отправить ещё одно сообщение.",
                    "quota": allowance["quota"],
                },
            )

        session_id = request.session_id or f"chat-{current_user['id']}-{datetime.utcnow().timestamp()}"
        
        fallback_system_msg = """You are an AI physics tutor for school and university students.
Answer in Russian unless the user explicitly asks for another language.

Answer quality rules:
- Explain in simple words, but keep physics accurate.
- Write every formula and mathematical expression only in LaTeX.
- Use inline math like $v = v_0 + at$ and important formulas on separate lines like $$F = ma$$.
- Do not write formulas as plain text like F=ma when LaTeX is possible.
- After a formula, briefly explain symbols and units.
- When solving a problem, use this structure: given data, find, formula, substitution, answer.
- If data is missing, ask a clarifying question instead of inventing numbers.
- If the question is not about physics, politely bring the conversation back to physics.
- Keep the answer compact unless the user asks for a detailed explanation."""
        prompt_config = await get_ai_prompt("ai_chat")
        system_msg = prompt_config.get("prompt") if prompt_config else fallback_system_msg
        max_tokens = prompt_config.get("max_tokens") if prompt_config else None
        temperature = prompt_config.get("temperature") if prompt_config else None
        
        response = await call_ai(
            request.message,
            system_message=system_msg,
            max_tokens=max_tokens or 4096,
            temperature=temperature if temperature is not None else 0.7,
        )
        
        # Save to chat history
        await db.chat_history.insert_one({
            "user_id": current_user["id"],
            "session_id": session_id,
            "user_message": request.message,
            "ai_response": response,
            "timestamp": datetime.utcnow(),
            "credit_source": allowance["source"],
        })
        
        return {"response": response, "session_id": session_id, "quota": allowance["quota"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail="Ошибка AI чата")

@router.get("/chat/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    history = await db.chat_history.find(
        {"user_id": current_user["id"]}
    ).sort("timestamp", -1).limit(50).to_list(50)
    return history
