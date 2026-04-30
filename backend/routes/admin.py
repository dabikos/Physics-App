import os
from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from server import get_current_user
from postgres import (
    create_notification_campaign,
    list_ai_prompts,
    list_app_settings,
    list_notification_campaigns,
    postgres_health,
    upsert_ai_prompt,
    upsert_app_setting,
)

router = APIRouter()


class AppSettingUpsert(BaseModel):
    key: str = Field(min_length=1, max_length=120)
    value: Any = Field(default_factory=dict)
    description: Optional[str] = None


class AIPromptUpsert(BaseModel):
    key: str = Field(min_length=1, max_length=120)
    name: str = Field(min_length=1, max_length=200)
    prompt: str = Field(min_length=1)
    model: Optional[str] = None
    temperature: Optional[float] = Field(default=None, ge=0, le=2)
    max_tokens: Optional[int] = Field(default=None, ge=1, le=20000)
    enabled: Optional[bool] = True


class NotificationCampaignCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=1000)
    target: dict[str, Any] = Field(default_factory=dict)
    data: dict[str, Any] = Field(default_factory=dict)
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = Field(default="draft", pattern="^(draft|scheduled)$")


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    admin_emails = {
        email.strip().lower()
        for email in os.environ.get("ADMIN_EMAILS", "").split(",")
        if email.strip()
    }

    user_email = str(current_user.get("email", "")).lower()
    if current_user.get("role") == "admin" or user_email in admin_emails:
        return current_user

    raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/health/postgres")
async def check_postgres_health():
    try:
        return await postgres_health()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"PostgreSQL unavailable: {exc}") from exc


@router.get("/admin/settings")
async def get_admin_settings(_: dict = Depends(require_admin)):
    return {"items": await list_app_settings()}


@router.put("/admin/settings/{key}")
async def put_admin_setting(
    key: str,
    payload: AppSettingUpsert,
    current_user: dict = Depends(require_admin),
):
    if payload.key != key:
        raise HTTPException(status_code=400, detail="Path key and payload key must match")

    item = await upsert_app_setting(
        key=payload.key,
        value=payload.value,
        description=payload.description,
        updated_by=current_user["id"],
    )
    return {"item": item}


@router.get("/admin/ai-prompts")
async def get_admin_ai_prompts(_: dict = Depends(require_admin)):
    return {"items": await list_ai_prompts()}


@router.put("/admin/ai-prompts/{key}")
async def put_admin_ai_prompt(
    key: str,
    payload: AIPromptUpsert,
    current_user: dict = Depends(require_admin),
):
    if payload.key != key:
        raise HTTPException(status_code=400, detail="Path key and payload key must match")

    item = await upsert_ai_prompt(payload.model_dump(), updated_by=current_user["id"])
    return {"item": item}


@router.get("/admin/notification-campaigns")
async def get_admin_notification_campaigns(_: dict = Depends(require_admin)):
    return {"items": await list_notification_campaigns()}


@router.post("/admin/notification-campaigns")
async def post_admin_notification_campaign(
    payload: NotificationCampaignCreate,
    current_user: dict = Depends(require_admin),
):
    item = await create_notification_campaign(payload.model_dump(), created_by=current_user["id"])
    return {"item": item}
