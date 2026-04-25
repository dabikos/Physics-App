from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import HTMLResponse
from datetime import datetime, timedelta
import uuid
import httpx

from server import (
    db,
    UserCreate,
    VerifyEmailRequest,
    TokenResponse,
    ResendCodeRequest,
    GoogleAuthRequest,
    GoogleCodeRequest,
    UserResponse,
    ResetPasswordRequest,
    ResetPasswordConfirm,
    UserLogin,
    generate_verification_code,
    hash_password,
    send_verification_email,
    create_token,
    verify_google_id_token,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    send_reset_password_email,
    verify_password,
    get_current_user,
)

router = APIRouter()

# ==================== Auth Routes ====================

@router.post("/auth/register")
async def register(user_data: UserCreate):
    """Register — saves user as unverified, sends 6-digit code to email."""
    existing = await db.users.find_one({"email": user_data.email})
    if user_data.role == "student" and not user_data.class_id:
        raise HTTPException(status_code=400, detail="Для ученика нужно указать класс")
    if existing:
        # If user exists but not verified, allow re-register (overwrite)
        if not existing.get("email_verified", False):
            await db.users.delete_one({"email": user_data.email})
        else:
            raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
    
    user_id = str(uuid.uuid4())
    verification_code = generate_verification_code()
    
    user = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "role": user_data.role,
        "class_id": user_data.class_id if user_data.role == "student" else None,
        "manual_adjustment": 0,
        "email_verified": False,
        "verification_code": verification_code,
        "verification_code_expires": datetime.utcnow() + timedelta(minutes=10),
        "auth_provider": "email",
        "progress": {
            "completed_lessons": [],
            "completed_tasks": [],
            "completed_tests": [],
            "scores": {}
        },
        "created_at": datetime.utcnow()
    }
    await db.users.insert_one(user)
    
    # Send verification code
    email_sent = await send_verification_email(user_data.email, verification_code)
    
    return {
        "status": "verification_required",
        "email": user_data.email,
        "email_sent": email_sent,
        "message": "Код подтверждения отправлен на email" if email_sent else "Email сервис не настроен или письмо не отправлено — код: " + verification_code,
    }


@router.post("/auth/verify-email", response_model=TokenResponse)
async def verify_email(request: VerifyEmailRequest):
    """Verify 6-digit code and activate account."""
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    if user.get("email_verified"):
        raise HTTPException(status_code=400, detail="Email уже подтверждён")
    
    stored_code = user.get("verification_code")
    expires = user.get("verification_code_expires")
    
    if not stored_code or stored_code != request.code:
        raise HTTPException(status_code=400, detail="Неверный код")
    
    if expires and datetime.utcnow() > expires:
        raise HTTPException(status_code=400, detail="Код истёк. Запросите новый")
    
    # Activate account
    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {"email_verified": True},
            "$unset": {"verification_code": "", "verification_code_expires": ""}
        }
    )
    
    token = create_token(user["id"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user.get("role", "student"),
            class_id=user.get("class_id"),
            progress=user.get("progress", {}),
            created_at=user["created_at"]
        )
    )


@router.post("/auth/resend-code")
async def resend_verification_code(request: ResendCodeRequest):
    """Resend a new 6-digit verification code."""
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    if user.get("email_verified"):
        raise HTTPException(status_code=400, detail="Email уже подтверждён")
    
    new_code = generate_verification_code()
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "verification_code": new_code,
            "verification_code_expires": datetime.utcnow() + timedelta(minutes=10),
        }}
    )
    
    email_sent = await send_verification_email(request.email, new_code)
    return {
        "success": True,
        "email_sent": email_sent,
        "message": "Новый код отправлен" if email_sent else "Email сервис не настроен или письмо не отправлено — код: " + new_code,
    }


@router.post("/auth/google", response_model=TokenResponse)
async def google_auth(request: GoogleAuthRequest):
    """Sign in or register with Google. Verifies the Google ID token."""
    google_info = await verify_google_id_token(request.id_token)
    email = google_info["email"]
    
    # Check if user already exists
    user = await db.users.find_one({"email": email})
    
    if user:
        # Existing user — just sign in
        # Update google_id if missing
        if not user.get("google_id"):
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"google_id": google_info["google_id"], "email_verified": True}}
            )
        token = create_token(user["id"])
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                name=user["name"],
                role=user.get("role", "student"),
                class_id=user.get("class_id"),
                progress=user.get("progress", {}),
                created_at=user["created_at"]
            )
        )
    
    # New user — create account (no password, email auto-verified)
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": email,
        "password": None,  # Google users have no password
        "name": request.name or google_info["name"],
        "role": request.role,
        "class_id": request.class_id if request.role == "student" else None,
        "manual_adjustment": 0,
        "email_verified": True,
        "auth_provider": "google",
        "google_id": google_info["google_id"],
        "progress": {
            "completed_lessons": [],
            "completed_tasks": [],
            "completed_tests": [],
            "scores": {}
        },
        "created_at": datetime.utcnow()
    }
    await db.users.insert_one(user)
    
    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=email,
            name=user["name"],
            role=user["role"],
            class_id=user.get("class_id"),
            progress=user["progress"],
            created_at=user["created_at"]
        )
    )


@router.post("/auth/google-code", response_model=TokenResponse)
async def google_auth_code(request: GoogleCodeRequest):
    """Exchange Google authorization code for tokens, then sign in or register."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured")
    
    # Exchange auth code for tokens via Google's token endpoint
    exchange_data = {
        "client_id": GOOGLE_CLIENT_ID,
        "code": request.code,
        "code_verifier": request.code_verifier,
        "grant_type": "authorization_code",
        "redirect_uri": request.redirect_uri,
    }
    # Add client_secret if available (required for Web client type)
    if GOOGLE_CLIENT_SECRET:
        exchange_data["client_secret"] = GOOGLE_CLIENT_SECRET
    
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data=exchange_data,
        )
    
    if token_resp.status_code != 200:
        error_detail = token_resp.json().get("error_description", "Failed to exchange auth code")
        raise HTTPException(status_code=400, detail=error_detail)
    
    tokens = token_resp.json()
    id_token_str = tokens.get("id_token")
    
    if not id_token_str:
        raise HTTPException(status_code=400, detail="No id_token in Google response")
    
    # Verify the id_token and get user info
    google_info = await verify_google_id_token(id_token_str)
    email = google_info["email"]
    
    # Check if user already exists
    user = await db.users.find_one({"email": email})
    
    if user:
        if not user.get("google_id"):
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"google_id": google_info["google_id"], "email_verified": True}}
            )
        token = create_token(user["id"])
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                name=user["name"],
                role=user.get("role", "student"),
                class_id=user.get("class_id"),
                progress=user.get("progress", {}),
                created_at=user["created_at"]
            )
        )
    
    # New user
    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "email": email,
        "password": None,
        "name": request.name or google_info["name"],
        "role": request.role,
        "class_id": request.class_id if request.role == "student" else None,
        "manual_adjustment": 0,
        "email_verified": True,
        "auth_provider": "google",
        "google_id": google_info["google_id"],
        "progress": {
            "completed_lessons": [],
            "completed_tasks": [],
            "completed_tests": [],
            "scores": {}
        },
        "created_at": datetime.utcnow()
    }
    await db.users.insert_one(new_user)
    
    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=email,
            name=new_user["name"],
            role=new_user["role"],
            class_id=new_user.get("class_id"),
            progress=new_user["progress"],
            created_at=new_user["created_at"]
        )
    )


@router.get("/auth/google/callback", response_class=HTMLResponse)
async def google_oauth_callback(
    code: str = Query(None),
    state: str = Query(None),
    error: str = Query(None),
):
    """OAuth redirect proxy: receives code from Google, redirects back to mobile app."""
    import urllib.parse
    
    if not state:
        return HTMLResponse("<h1>Error: missing state parameter</h1>", status_code=400)
    
    # state contains the app return URI (e.g. exp://192.168.1.241:8081/--/auth or physics-ai://auth)
    return_uri = state
    
    if error:
        redirect_url = f"{return_uri}?error={urllib.parse.quote(error)}"
    elif code:
        redirect_url = f"{return_uri}?code={urllib.parse.quote(code)}"
    else:
        redirect_url = f"{return_uri}?error=no_code"
    
    # Return HTML that redirects to the app deep link
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><title>Redirecting...</title></head>
    <body>
        <p>Redirecting to app...</p>
        <script>window.location.href = "{redirect_url}";</script>
        <noscript><a href="{redirect_url}">Click here to continue</a></noscript>
    </body>
    </html>
    """
    return HTMLResponse(html)


@router.post("/auth/reset-password/request")
async def request_password_reset(request: ResetPasswordRequest):
    """Send a 6-digit password reset code to email."""
    user = await db.users.find_one({"email": request.email})
    if not user:
        # Don't reveal if email exists or not
        return {"success": True, "message": "Если аккаунт существует, код отправлен на email"}
    
    if user.get("auth_provider") == "google" and not user.get("password"):
        raise HTTPException(
            status_code=400,
            detail="Этот аккаунт использует Google вход. Сброс пароля невозможен."
        )
    
    reset_code = generate_verification_code()
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "reset_code": reset_code,
            "reset_code_expires": datetime.utcnow() + timedelta(minutes=10),
        }}
    )
    
    email_sent = await send_reset_password_email(request.email, reset_code)
    return {
        "success": True,
        "email_sent": email_sent,
        "message": "Код сброса пароля отправлен на email" if email_sent else "Email сервис не настроен или письмо не отправлено — код: " + reset_code,
    }


@router.post("/auth/reset-password/confirm")
async def confirm_password_reset(request: ResetPasswordConfirm):
    """Verify reset code and set a new password."""
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    stored_code = user.get("reset_code")
    expires = user.get("reset_code_expires")
    
    if not stored_code or stored_code != request.code:
        raise HTTPException(status_code=400, detail="Неверный код")
    
    if expires and datetime.utcnow() > expires:
        raise HTTPException(status_code=400, detail="Код истёк. Запросите новый")
    
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="Пароль должен быть не менее 6 символов")
    
    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {"password": hash_password(request.new_password)},
            "$unset": {"reset_code": "", "reset_code_expires": ""}
        }
    )
    
    return {"success": True, "message": "Пароль успешно изменён"}


@router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not user.get("password") or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    
    if not user.get("email_verified", False):
        raise HTTPException(status_code=403, detail="Email не подтверждён. Проверьте почту.")
    
    token = create_token(user["id"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user.get("role", "student"),
            class_id=user.get("class_id"),
            progress=user.get("progress", {}),
            created_at=user["created_at"]
        )
    )

@router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user.get("role", "student"),
        class_id=current_user.get("class_id"),
        progress=current_user.get("progress", {}),
        created_at=current_user["created_at"]
    )
