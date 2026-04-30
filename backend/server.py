from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Query, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any, Literal
import uuid
import hashlib
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import bcrypt
import jwt
import json as json_module
import httpx
from openai import AsyncOpenAI
from postgres import get_ai_prompt, render_prompt_template

ROOT_DIR = Path(__file__).parent
env_path = ROOT_DIR / '.env'
load_dotenv(env_path, override=False)

APP_ENV = os.environ.get("APP_ENV", os.environ.get("ENVIRONMENT", "development")).strip().lower()
IS_PRODUCTION = APP_ENV in {"production", "prod"}

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'physics_ai')]

# JWT Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', '').strip()
SECRET_KEY_FALLBACK_USED = False
if not SECRET_KEY:
    if IS_PRODUCTION:
        raise RuntimeError("SECRET_KEY must be set when APP_ENV=production")
    SECRET_KEY = os.urandom(32).hex()
    SECRET_KEY_FALLBACK_USED = True

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 10000

# Cron secret configuration
CRON_SECRET = os.environ.get("CRON_SECRET", "").strip()
if IS_PRODUCTION and not CRON_SECRET:
    raise RuntimeError("CRON_SECRET must be set when APP_ENV=production")

# Email Configuration
def env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}

EMAIL_PROVIDER = os.environ.get('EMAIL_PROVIDER', 'auto').strip().lower()
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
RESEND_API_URL = os.environ.get('RESEND_API_URL', 'https://api.resend.com/emails').strip()

# SMTP Configuration (fallback or primary if EMAIL_PROVIDER=smtp)
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER', '')  # your-email@gmail.com
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')  # App Password from Google
SMTP_FROM = os.environ.get('SMTP_FROM', SMTP_USER if os.environ.get('SMTP_USER') else 'noreply@physicsai.app')
SMTP_USE_TLS = env_bool('SMTP_USE_TLS', True)
SMTP_USE_SSL = env_bool('SMTP_USE_SSL', False)
SMTP_TIMEOUT = float(os.environ.get('SMTP_TIMEOUT', '20'))

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')

# OpenAI API settings (берутся только из ENV переменных)
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY, timeout=60.0)
FREE_CHAT_DAILY_LIMIT = int(os.environ.get('FREE_CHAT_DAILY_LIMIT', '3'))

async def call_ai(prompt: str, system_message: str = '', max_tokens: int = 4096, temperature: float = 0.7) -> str:
    """OpenAI chat completion (gpt-5-nano by default)."""
    if not OPENAI_API_KEY:
        raise Exception("OPENAI_API_KEY is not configured")

    messages = []
    if system_message:
        messages.append({"role": "system", "content": system_message})
    messages.append({"role": "user", "content": prompt})

    try:
        completion = await openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_completion_tokens=max_tokens,
        )
        content = completion.choices[0].message.content
        if not content:
            raise Exception("OpenAI returned empty content")
        return content.strip()
    except Exception as e:
        raise Exception(f"OpenAI request failed: {e}") from e

# Create the main app
app = FastAPI(title="Physics AI App")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
logger.info(
    "Email service initialized: provider=%s resend_api=%s smtp_host=%s smtp_port=%s smtp_from=%s",
    EMAIL_PROVIDER,
    bool(RESEND_API_KEY),
    SMTP_HOST,
    SMTP_PORT,
    SMTP_FROM,
)
logger.info("App environment: %s", APP_ENV)
if SECRET_KEY_FALLBACK_USED:
    logger.warning(
        "SECRET_KEY is not set; generated ephemeral key for non-production environment. "
        "Set SECRET_KEY to keep tokens valid across restarts."
    )

# ==================== Models ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Literal["student", "teacher"]
    class_id: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    id_token: str
    name: Optional[str] = None
    role: Literal["student", "teacher"] = "student"
    class_id: Optional[str] = None

class GoogleCodeRequest(BaseModel):
    code: str
    code_verifier: str
    redirect_uri: str
    name: Optional[str] = None
    role: Literal["student", "teacher"] = "student"
    class_id: Optional[str] = None

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str

class ResendCodeRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordConfirm(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: Literal["student", "teacher"]
    class_id: Optional[str] = None
    progress: Dict[str, Any] = {}
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class Topic(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section: str
    subsection: str
    title: str
    brief_info: str
    example_problem: str
    formulas: List[str]
    full_content: Optional[str] = None

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section: str
    title: str
    question: str
    options: List[str]
    correct_answer: int
    explanation: str
    difficulty: str = "medium"

class Test(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section: str
    title: str
    questions: List[Dict[str, Any]]
    time_limit: int = 600  # seconds

class Formula(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section: str
    name: str
    formula: str
    description: str
    variables: Dict[str, str]
    unit: str

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatRewardClaimRequest(BaseModel):
    ad_unit: Optional[str] = None
    platform: Optional[str] = "android"

class ProgressUpdate(BaseModel):
    section: str
    subsection: Optional[str] = None
    completed: bool
    score: Optional[int] = None

class GenerateContentRequest(BaseModel):
    topic_id: str
    content_type: str = "detailed"  # detailed, examples, practice

class GenerateTaskRequest(BaseModel):
    section: str
    difficulty: str = "medium"  # easy, medium, hard
    topic: Optional[str] = None

class GenerateTestRequest(BaseModel):
    section: str
    num_questions: int = 5
    difficulty: str = "medium"

class TestSubmitRequest(BaseModel):
    answers: List[int]
    source: Optional[str] = "mobile"
    assigned_test_id: Optional[str] = None

class AssignedTestCreate(BaseModel):
    title: str
    class_id: str
    scheduled_for: Optional[str] = None
    section: Optional[str] = None
    difficulty: Optional[str] = None
    questions: List[Dict[str, Any]]
    time_limit: int = 600

class TeacherScoreAdjustment(BaseModel):
    manual_adjustment: int

class TestScoreOverride(BaseModel):
    score_override: int

class PairingSessionCreate(BaseModel):
    class_id: Optional[str] = None
    expires_in_minutes: int = 90

class PairingJoinRequest(BaseModel):
    code: str

class DemoStateUpdate(BaseModel):
    mode: Literal["idle", "theory", "problems", "simulations", "formulas", "test", "ai-explain", "worksheet"]
    title: Optional[str] = None
    subtitle: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None  # emoji or identifier
    grade: Optional[str] = None  # class/grade

class DemoTestSubmit(BaseModel):
    answers: List[int]

class WorksheetSubmit(BaseModel):
    answers: Dict[str, Any]  # taskId -> student answer

class TaskWithSolution(BaseModel):
    id: str
    section: str
    title: str
    question: str
    options: List[str]
    correct_answer: int
    difficulty: str
    solution: Dict[str, Any]  # given, si_units, solution_steps, answer

# ==================== Email Helper ====================

def generate_verification_code() -> str:
    """Generate a 6-digit verification code."""
    return str(random.randint(100000, 999999))

async def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send an email via Resend API or SMTP. Returns True on success."""
    provider = EMAIL_PROVIDER if EMAIL_PROVIDER in {"auto", "resend_api", "smtp"} else "auto"

    if provider in {"auto", "resend_api"} and RESEND_API_KEY:
        if await send_email_via_resend_api(to_email, subject, html_body):
            return True
        if provider == "resend_api":
            return False

    if provider in {"auto", "smtp"}:
        return await asyncio.to_thread(send_email_via_smtp_sync, to_email, subject, html_body)

    logger.warning("Email provider misconfigured: EMAIL_PROVIDER=%s", EMAIL_PROVIDER)
    return False

async def send_email_via_resend_api(to_email: str, subject: str, html_body: str) -> bool:
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY is empty — Resend API send skipped")
        return False

    payload = {
        "from": SMTP_FROM,
        "to": [to_email],
        "subject": subject,
        "html": html_body,
    }
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as http:
            response = await http.post(RESEND_API_URL, headers=headers, json=payload)
        if response.status_code in {200, 201, 202}:
            return True
        logger.error(
            "Resend API error for %s: status=%s body=%s",
            to_email,
            response.status_code,
            response.text[:500],
        )
        return False
    except Exception as e:
        logger.error("Resend API send failed for %s: %s", to_email, e)
        return False

def send_email_via_smtp_sync(to_email: str, subject: str, html_body: str) -> bool:
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured — SMTP send skipped")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        smtp_cls = smtplib.SMTP_SSL if SMTP_USE_SSL else smtplib.SMTP
        with smtp_cls(SMTP_HOST, SMTP_PORT, timeout=SMTP_TIMEOUT) as server:
            server.ehlo()
            if SMTP_USE_TLS and not SMTP_USE_SSL:
                server.starttls()
                server.ehlo()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, [to_email], msg.as_string())
        return True
    except Exception as e:
        logger.error("SMTP send failed for %s via %s:%s: %s", to_email, SMTP_HOST, SMTP_PORT, e)
        return False

async def send_verification_email(to_email: str, code: str) -> bool:
    """Send a 6-digit verification code to the user."""
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#1a1a2e;border-radius:16px;color:#fff">
        <h2 style="text-align:center;color:#667EEA">Физика AI</h2>
        <p style="text-align:center;font-size:16px">Ваш код подтверждения:</p>
        <div style="text-align:center;font-size:36px;font-weight:bold;letter-spacing:8px;color:#667EEA;padding:24px 0">{code}</div>
        <p style="text-align:center;color:#999;font-size:13px">Код действителен 10 минут. Если вы не запрашивали это письмо — проигнорируйте его.</p>
    </div>
    """
    return await send_email(to_email, f"Код подтверждения: {code}", html)

async def send_reset_password_email(to_email: str, code: str) -> bool:
    """Send a password reset code to the user."""
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#1a1a2e;border-radius:16px;color:#fff">
        <h2 style="text-align:center;color:#F59E0B">Физика AI</h2>
        <p style="text-align:center;font-size:16px">Код для сброса пароля:</p>
        <div style="text-align:center;font-size:36px;font-weight:bold;letter-spacing:8px;color:#F59E0B;padding:24px 0">{code}</div>
        <p style="text-align:center;color:#999;font-size:13px">Код действителен 10 минут. Если вы не запрашивали сброс пароля — проигнорируйте это письмо.</p>
    </div>
    """
    return await send_email(to_email, f"Сброс пароля — код: {code}", html)

async def verify_google_id_token(id_token: str) -> dict:
    """Verify a Google ID token and return user info."""
    async with httpx.AsyncClient(timeout=10.0) as http:
        resp = await http.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": id_token},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Неверный Google токен")
        data = resp.json()
        # Optionally verify audience
        if GOOGLE_CLIENT_ID and data.get("aud") != GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=401, detail="Неверный Google Client ID")
        return {
            "email": data["email"],
            "name": data.get("name", data.get("email", "").split("@")[0]),
            "email_verified": data.get("email_verified", "false") == "true",
            "google_id": data.get("sub"),
        }

# ==================== Auth Helpers ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== Physics Data ====================

PHYSICS_SECTIONS = {
    "mechanics": {
        "name": "Механика",
        "icon": "speedometer",
        "color": "#4A90D9",
        "subsections": [
            {
                "id": "kinematics", 
                "name": "Кинематика",
                "topics": [
                    {"id": "linear-motion", "name": "Прямолинейное движение"},
                    {"id": "uniform-accelerated", "name": "Равномерное и равноускоренное движение"},
                    {"id": "circular-motion", "name": "Движение по окружности"},
                    {"id": "relative-motion", "name": "Относительность движения"},
                    {"id": "motion-graphs", "name": "Графики движения"}
                ]
            },
            {
                "id": "dynamics", 
                "name": "Динамика",
                "topics": [
                    {"id": "newton-laws", "name": "Законы Ньютона"},
                    {"id": "forces", "name": "Силы в механике"},
                    {"id": "multiple-forces", "name": "Движение под действием нескольких сил"},
                    {"id": "inclined-plane", "name": "Наклонная плоскость"},
                    {"id": "momentum", "name": "Импульс и закон сохранения импульса"}
                ]
            },
            {
                "id": "statics", 
                "name": "Статика",
                "topics": [
                    {"id": "equilibrium", "name": "Условия равновесия"},
                    {"id": "torque", "name": "Момент силы"},
                    {"id": "center-mass", "name": "Центр масс"},
                    {"id": "simple-machines", "name": "Простые механизмы"}
                ]
            },
            {
                "id": "conservation-laws", 
                "name": "Законы сохранения",
                "topics": [
                    {"id": "work", "name": "Работа"},
                    {"id": "kinetic-energy", "name": "Кинетическая энергия"},
                    {"id": "potential-energy", "name": "Потенциальная энергия"},
                    {"id": "energy-conservation", "name": "Закон сохранения энергии"}
                ]
            },
            {
                "id": "oscillations-waves", 
                "name": "Механические колебания и волны",
                "topics": [
                    {"id": "harmonic-oscillations", "name": "Гармонические колебания"},
                    {"id": "pendulums", "name": "Маятники"},
                    {"id": "mechanical-waves", "name": "Механические волны"},
                    {"id": "resonance", "name": "Резонанс"}
                ]
            }
        ]
    },
    "thermodynamics": {
        "name": "Термодинамика",
        "icon": "thermometer",
        "color": "#E74C3C",
        "subsections": [
            {
                "id": "molecular-kinetic", 
                "name": "Молекулярно-кинетическая теория",
                "topics": [
                    {"id": "matter-structure", "name": "Строение вещества"},
                    {"id": "temperature", "name": "Температура"},
                    {"id": "gas-pressure", "name": "Давление газа"}
                ]
            },
            {
                "id": "heat-processes", 
                "name": "Тепловые процессы",
                "topics": [
                    {"id": "thermal-conductivity", "name": "Теплопроводность"},
                    {"id": "convection", "name": "Конвекция"},
                    {"id": "radiation", "name": "Излучение"},
                    {"id": "heat-quantity", "name": "Количество теплоты"}
                ]
            },
            {
                "id": "ideal-gas", 
                "name": "Идеальный газ",
                "topics": [
                    {"id": "state-equation", "name": "Уравнение состояния"},
                    {"id": "isoprocesses", "name": "Изопроцессы"},
                    {"id": "gas-laws", "name": "Газовые законы"}
                ]
            },
            {
                "id": "thermodynamics-laws", 
                "name": "Законы термодинамики",
                "topics": [
                    {"id": "first-law", "name": "Первый закон"},
                    {"id": "second-law", "name": "Второй закон"},
                    {"id": "heat-engines", "name": "Тепловые машины"},
                    {"id": "efficiency", "name": "КПД"}
                ]
            },
            {
                "id": "phase-transitions", 
                "name": "Фазовые переходы",
                "topics": [
                    {"id": "melting", "name": "Плавление"},
                    {"id": "evaporation", "name": "Испарение"},
                    {"id": "boiling", "name": "Кипение"},
                    {"id": "phase-diagrams", "name": "Диаграммы состояния"}
                ]
            }
        ]
    },
    "electromagnetism": {
        "name": "Электричество и магнетизм",
        "icon": "flash",
        "color": "#F39C12",
        "subsections": [
            {
                "id": "electrostatics", 
                "name": "Электростатика",
                "topics": [
                    {"id": "electric-charge", "name": "Электрический заряд"},
                    {"id": "coulomb-law", "name": "Закон Кулона"},
                    {"id": "electric-field", "name": "Электрическое поле"},
                    {"id": "potential-voltage", "name": "Потенциал и напряжение"},
                    {"id": "capacitors", "name": "Конденсаторы"}
                ]
            },
            {
                "id": "direct-current", 
                "name": "Постоянный ток",
                "topics": [
                    {"id": "current-strength", "name": "Сила тока"},
                    {"id": "ohm-law", "name": "Закон Ома"},
                    {"id": "work-power", "name": "Работа и мощность тока"},
                    {"id": "conductor-connections", "name": "Соединение проводников"}
                ]
            },
            {
                "id": "magnetism", 
                "name": "Магнетизм",
                "topics": [
                    {"id": "magnetic-field", "name": "Магнитное поле"},
                    {"id": "ampere-force", "name": "Сила Ампера"},
                    {"id": "lorentz-force", "name": "Сила Лоренца"}
                ]
            },
            {
                "id": "electromagnetic-induction", 
                "name": "Электромагнитная индукция",
                "topics": [
                    {"id": "faraday-law", "name": "Закон Фарадея"},
                    {"id": "lenz-rule", "name": "Правило Ленца"},
                    {"id": "inductance", "name": "Индуктивность"},
                    {"id": "eddy-currents", "name": "Вихревые токи"}
                ]
            },
            {
                "id": "alternating-current", 
                "name": "Переменный ток",
                "topics": [
                    {"id": "sinusoidal-current", "name": "Синусоидальный ток"},
                    {"id": "reactive-resistance", "name": "Реактивное сопротивление"},
                    {"id": "transformers", "name": "Трансформаторы"},
                    {"id": "power-transmission", "name": "Передача электроэнергии"}
                ]
            }
        ]
    },
    "optics": {
        "name": "Оптика",
        "icon": "eye",
        "color": "#9B59B6",
        "subsections": [
            {
                "id": "geometric-optics", 
                "name": "Геометрическая оптика",
                "topics": [
                    {"id": "light-propagation", "name": "Распространение света"},
                    {"id": "reflection", "name": "Отражение"},
                    {"id": "refraction", "name": "Преломление"},
                    {"id": "lenses-mirrors", "name": "Линзы и зеркала"},
                    {"id": "optical-devices", "name": "Оптические приборы"}
                ]
            },
            {
                "id": "wave-optics", 
                "name": "Волновая оптика",
                "topics": [
                    {"id": "interference", "name": "Интерференция"},
                    {"id": "diffraction", "name": "Дифракция"},
                    {"id": "polarization", "name": "Поляризация"}
                ]
            },
            {
                "id": "quantum-optics", 
                "name": "Квантовая оптика",
                "topics": [
                    {"id": "photoelectric-effect", "name": "Фотоэффект"},
                    {"id": "light-dualism", "name": "Дуализм света"},
                    {"id": "emission-spectra", "name": "Спектры излучения"},
                    {"id": "lasers", "name": "Лазеры"}
                ]
            }
        ]
    },
    "atomic": {
        "name": "Атомная и ядерная физика",
        "icon": "planet",
        "color": "#1ABC9C",
        "subsections": [
            {
                "id": "atom-structure", 
                "name": "Строение атома",
                "topics": [
                    {"id": "atom-models", "name": "Модели атома"},
                    {"id": "energy-levels", "name": "Энергетические уровни"},
                    {"id": "electron-shells", "name": "Электронные оболочки"}
                ]
            },
            {
                "id": "quantum-physics", 
                "name": "Квантовая физика",
                "topics": [
                    {"id": "de-broglie-waves", "name": "Волны де Бройля"},
                    {"id": "heisenberg-uncertainty", "name": "Неопределённость Гейзенберга"}
                ]
            },
            {
                "id": "nuclear-physics", 
                "name": "Ядерная физика",
                "topics": [
                    {"id": "nucleus-structure", "name": "Строение ядра"},
                    {"id": "nuclear-forces", "name": "Ядерные силы"},
                    {"id": "binding-energy", "name": "Энергия связи"}
                ]
            },
            {
                "id": "radioactivity", 
                "name": "Радиоактивность",
                "topics": [
                    {"id": "decay-types", "name": "Виды распада"},
                    {"id": "decay-law", "name": "Закон радиоактивного распада"},
                    {"id": "radiation-doses", "name": "Дозы излучения"}
                ]
            },
            {
                "id": "nuclear-reactions", 
                "name": "Ядерные реакции",
                "topics": [
                    {"id": "fission", "name": "Деление ядер"},
                    {"id": "fusion", "name": "Термоядерный синтез"},
                    {"id": "nuclear-energy-use", "name": "Применение ядерной энергии"}
                ]
            }
        ]
    }
}

# Initial topics data
INITIAL_TOPICS = [
    # ==================== МЕХАНИКА ====================
    # Кинематика
    {"id": "linear-motion", "section": "mechanics", "subsection": "kinematics", "topic": "linear-motion",
     "title": "Прямолинейное движение", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "uniform-accelerated", "section": "mechanics", "subsection": "kinematics", "topic": "uniform-accelerated",
     "title": "Равномерное и равноускоренное движение", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "circular-motion", "section": "mechanics", "subsection": "kinematics", "topic": "circular-motion",
     "title": "Движение по окружности", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "relative-motion", "section": "mechanics", "subsection": "kinematics", "topic": "relative-motion",
     "title": "Относительность движения", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "motion-graphs", "section": "mechanics", "subsection": "kinematics", "topic": "motion-graphs",
     "title": "Графики движения", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Динамика
    {"id": "newton-laws", "section": "mechanics", "subsection": "dynamics", "topic": "newton-laws",
     "title": "Законы Ньютона", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "forces", "section": "mechanics", "subsection": "dynamics", "topic": "forces",
     "title": "Силы в механике", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "multiple-forces", "section": "mechanics", "subsection": "dynamics", "topic": "multiple-forces",
     "title": "Движение под действием нескольких сил", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "inclined-plane", "section": "mechanics", "subsection": "dynamics", "topic": "inclined-plane",
     "title": "Наклонная плоскость", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "momentum", "section": "mechanics", "subsection": "dynamics", "topic": "momentum",
     "title": "Импульс и закон сохранения импульса", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Статика
    {"id": "equilibrium", "section": "mechanics", "subsection": "statics", "topic": "equilibrium",
     "title": "Условия равновесия", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "torque", "section": "mechanics", "subsection": "statics", "topic": "torque",
     "title": "Момент силы", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "center-mass", "section": "mechanics", "subsection": "statics", "topic": "center-mass",
     "title": "Центр масс", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "simple-machines", "section": "mechanics", "subsection": "statics", "topic": "simple-machines",
     "title": "Простые механизмы", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Законы сохранения
    {"id": "work", "section": "mechanics", "subsection": "conservation-laws", "topic": "work",
     "title": "Работа", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "kinetic-energy", "section": "mechanics", "subsection": "conservation-laws", "topic": "kinetic-energy",
     "title": "Кинетическая энергия", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "potential-energy", "section": "mechanics", "subsection": "conservation-laws", "topic": "potential-energy",
     "title": "Потенциальная энергия", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "energy-conservation", "section": "mechanics", "subsection": "conservation-laws", "topic": "energy-conservation",
     "title": "Закон сохранения энергии", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Механические колебания и волны
    {"id": "harmonic-oscillations", "section": "mechanics", "subsection": "oscillations-waves", "topic": "harmonic-oscillations",
     "title": "Гармонические колебания", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "pendulums", "section": "mechanics", "subsection": "oscillations-waves", "topic": "pendulums",
     "title": "Маятники", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "mechanical-waves", "section": "mechanics", "subsection": "oscillations-waves", "topic": "mechanical-waves",
     "title": "Механические волны", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "resonance", "section": "mechanics", "subsection": "oscillations-waves", "topic": "resonance",
     "title": "Резонанс", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # ==================== ТЕРМОДИНАМИКА ====================
    # Молекулярно-кинетическая теория
    {"id": "matter-structure", "section": "thermodynamics", "subsection": "molecular-kinetic", "topic": "matter-structure",
     "title": "Строение вещества", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "temperature", "section": "thermodynamics", "subsection": "molecular-kinetic", "topic": "temperature",
     "title": "Температура", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "gas-pressure", "section": "thermodynamics", "subsection": "molecular-kinetic", "topic": "gas-pressure",
     "title": "Давление газа", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Тепловые процессы
    {"id": "thermal-conductivity", "section": "thermodynamics", "subsection": "heat-processes", "topic": "thermal-conductivity",
     "title": "Теплопроводность", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "convection", "section": "thermodynamics", "subsection": "heat-processes", "topic": "convection",
     "title": "Конвекция", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "radiation", "section": "thermodynamics", "subsection": "heat-processes", "topic": "radiation",
     "title": "Излучение", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "heat-quantity", "section": "thermodynamics", "subsection": "heat-processes", "topic": "heat-quantity",
     "title": "Количество теплоты", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Идеальный газ
    {"id": "state-equation", "section": "thermodynamics", "subsection": "ideal-gas", "topic": "state-equation",
     "title": "Уравнение состояния", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "isoprocesses", "section": "thermodynamics", "subsection": "ideal-gas", "topic": "isoprocesses",
     "title": "Изопроцессы", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "gas-laws", "section": "thermodynamics", "subsection": "ideal-gas", "topic": "gas-laws",
     "title": "Газовые законы", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Законы термодинамики
    {"id": "first-law", "section": "thermodynamics", "subsection": "thermodynamics-laws", "topic": "first-law",
     "title": "Первый закон", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "second-law", "section": "thermodynamics", "subsection": "thermodynamics-laws", "topic": "second-law",
     "title": "Второй закон", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "heat-engines", "section": "thermodynamics", "subsection": "thermodynamics-laws", "topic": "heat-engines",
     "title": "Тепловые машины", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "efficiency", "section": "thermodynamics", "subsection": "thermodynamics-laws", "topic": "efficiency",
     "title": "КПД", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Фазовые переходы
    {"id": "melting", "section": "thermodynamics", "subsection": "phase-transitions", "topic": "melting",
     "title": "Плавление", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "evaporation", "section": "thermodynamics", "subsection": "phase-transitions", "topic": "evaporation",
     "title": "Испарение", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "boiling", "section": "thermodynamics", "subsection": "phase-transitions", "topic": "boiling",
     "title": "Кипение", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "phase-diagrams", "section": "thermodynamics", "subsection": "phase-transitions", "topic": "phase-diagrams",
     "title": "Диаграммы состояния", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # ==================== ЭЛЕКТРИЧЕСТВО И МАГНЕТИЗМ ====================
    # Электростатика
    {"id": "electric-charge", "section": "electromagnetism", "subsection": "electrostatics", "topic": "electric-charge",
     "title": "Электрический заряд", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "coulomb-law", "section": "electromagnetism", "subsection": "electrostatics", "topic": "coulomb-law",
     "title": "Закон Кулона", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "electric-field", "section": "electromagnetism", "subsection": "electrostatics", "topic": "electric-field",
     "title": "Электрическое поле", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "potential-voltage", "section": "electromagnetism", "subsection": "electrostatics", "topic": "potential-voltage",
     "title": "Потенциал и напряжение", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "capacitors", "section": "electromagnetism", "subsection": "electrostatics", "topic": "capacitors",
     "title": "Конденсаторы", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Постоянный ток
    {"id": "current-strength", "section": "electromagnetism", "subsection": "direct-current", "topic": "current-strength",
     "title": "Сила тока", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "ohm-law", "section": "electromagnetism", "subsection": "direct-current", "topic": "ohm-law",
     "title": "Закон Ома", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "work-power", "section": "electromagnetism", "subsection": "direct-current", "topic": "work-power",
     "title": "Работа и мощность тока", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "conductor-connections", "section": "electromagnetism", "subsection": "direct-current", "topic": "conductor-connections",
     "title": "Соединение проводников", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Магнетизм
    {"id": "magnetic-field", "section": "electromagnetism", "subsection": "magnetism", "topic": "magnetic-field",
     "title": "Магнитное поле", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "ampere-force", "section": "electromagnetism", "subsection": "magnetism", "topic": "ampere-force",
     "title": "Сила Ампера", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "lorentz-force", "section": "electromagnetism", "subsection": "magnetism", "topic": "lorentz-force",
     "title": "Сила Лоренца", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Электромагнитная индукция
    {"id": "faraday-law", "section": "electromagnetism", "subsection": "electromagnetic-induction", "topic": "faraday-law",
     "title": "Закон Фарадея", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "lenz-rule", "section": "electromagnetism", "subsection": "electromagnetic-induction", "topic": "lenz-rule",
     "title": "Правило Ленца", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "inductance", "section": "electromagnetism", "subsection": "electromagnetic-induction", "topic": "inductance",
     "title": "Индуктивность", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "eddy-currents", "section": "electromagnetism", "subsection": "electromagnetic-induction", "topic": "eddy-currents",
     "title": "Вихревые токи", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Переменный ток
    {"id": "sinusoidal-current", "section": "electromagnetism", "subsection": "alternating-current", "topic": "sinusoidal-current",
     "title": "Синусоидальный ток", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "reactive-resistance", "section": "electromagnetism", "subsection": "alternating-current", "topic": "reactive-resistance",
     "title": "Реактивное сопротивление", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "transformers", "section": "electromagnetism", "subsection": "alternating-current", "topic": "transformers",
     "title": "Трансформаторы", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "power-transmission", "section": "electromagnetism", "subsection": "alternating-current", "topic": "power-transmission",
     "title": "Передача электроэнергии", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # ==================== ОПТИКА ====================
    # Геометрическая оптика
    {"id": "light-propagation", "section": "optics", "subsection": "geometric-optics", "topic": "light-propagation",
     "title": "Распространение света", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "reflection", "section": "optics", "subsection": "geometric-optics", "topic": "reflection",
     "title": "Отражение", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "refraction", "section": "optics", "subsection": "geometric-optics", "topic": "refraction",
     "title": "Преломление", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "lenses-mirrors", "section": "optics", "subsection": "geometric-optics", "topic": "lenses-mirrors",
     "title": "Линзы и зеркала", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "optical-devices", "section": "optics", "subsection": "geometric-optics", "topic": "optical-devices",
     "title": "Оптические приборы", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Волновая оптика
    {"id": "interference", "section": "optics", "subsection": "wave-optics", "topic": "interference",
     "title": "Интерференция", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "diffraction", "section": "optics", "subsection": "wave-optics", "topic": "diffraction",
     "title": "Дифракция", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "polarization", "section": "optics", "subsection": "wave-optics", "topic": "polarization",
     "title": "Поляризация", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Квантовая оптика
    {"id": "photoelectric-effect", "section": "optics", "subsection": "quantum-optics", "topic": "photoelectric-effect",
     "title": "Фотоэффект", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "light-dualism", "section": "optics", "subsection": "quantum-optics", "topic": "light-dualism",
     "title": "Дуализм света", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "emission-spectra", "section": "optics", "subsection": "quantum-optics", "topic": "emission-spectra",
     "title": "Спектры излучения", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "lasers", "section": "optics", "subsection": "quantum-optics", "topic": "lasers",
     "title": "Лазеры", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # ==================== АТОМНАЯ И ЯДЕРНАЯ ФИЗИКА ====================
    # Строение атома
    {"id": "atom-models", "section": "atomic", "subsection": "atom-structure", "topic": "atom-models",
     "title": "Модели атома", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "energy-levels", "section": "atomic", "subsection": "atom-structure", "topic": "energy-levels",
     "title": "Энергетические уровни", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "electron-shells", "section": "atomic", "subsection": "atom-structure", "topic": "electron-shells",
     "title": "Электронные оболочки", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Квантовая физика
    {"id": "de-broglie-waves", "section": "atomic", "subsection": "quantum-physics", "topic": "de-broglie-waves",
     "title": "Волны де Бройля", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "heisenberg-uncertainty", "section": "atomic", "subsection": "quantum-physics", "topic": "heisenberg-uncertainty",
     "title": "Неопределённость Гейзенберга", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Ядерная физика
    {"id": "nucleus-structure", "section": "atomic", "subsection": "nuclear-physics", "topic": "nucleus-structure",
     "title": "Строение ядра", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "nuclear-forces", "section": "atomic", "subsection": "nuclear-physics", "topic": "nuclear-forces",
     "title": "Ядерные силы", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "binding-energy", "section": "atomic", "subsection": "nuclear-physics", "topic": "binding-energy",
     "title": "Энергия связи", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Радиоактивность
    {"id": "decay-types", "section": "atomic", "subsection": "radioactivity", "topic": "decay-types",
     "title": "Виды распада", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "decay-law", "section": "atomic", "subsection": "radioactivity", "topic": "decay-law",
     "title": "Закон радиоактивного распада", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "radiation-doses", "section": "atomic", "subsection": "radioactivity", "topic": "radiation-doses",
     "title": "Дозы излучения", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    
    # Ядерные реакции
    {"id": "fission", "section": "atomic", "subsection": "nuclear-reactions", "topic": "fission",
     "title": "Деление ядер", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "fusion", "section": "atomic", "subsection": "nuclear-reactions", "topic": "fusion",
     "title": "Термоядерный синтез", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []},
    {"id": "nuclear-energy-use", "section": "atomic", "subsection": "nuclear-reactions", "topic": "nuclear-energy-use",
     "title": "Применение ядерной энергии", "brief_info": "Раздел в разработке", "example_problem": "", "formulas": []}
]

# Initial tasks data
INITIAL_TASKS = [
    {
        "id": "task-mech-1",
        "section": "mechanics",
        "title": "Скорость и путь",
        "question": "Велосипедист проехал 15 км за 30 минут. Чему равна его средняя скорость?",
        "options": ["15 км/ч", "30 км/ч", "45 км/ч", "60 км/ч"],
        "correct_answer": 1,
        "explanation": "v = S/t = 15 км / 0.5 ч = 30 км/ч",
        "difficulty": "easy"
    },
    {
        "id": "task-mech-2",
        "section": "mechanics",
        "title": "Второй закон Ньютона",
        "question": "Какую силу нужно приложить к телу массой 2 кг, чтобы сообщить ему ускорение 5 м/с²?",
        "options": ["2.5 Н", "5 Н", "10 Н", "20 Н"],
        "correct_answer": 2,
        "explanation": "F = ma = 2 кг × 5 м/с² = 10 Н",
        "difficulty": "easy"
    },
    {
        "id": "task-mech-3",
        "section": "mechanics",
        "title": "Свободное падение",
        "question": "С какой высоты упало тело, если время падения составило 3 секунды? (g = 10 м/с²)",
        "options": ["15 м", "30 м", "45 м", "90 м"],
        "correct_answer": 2,
        "explanation": "h = gt²/2 = 10 × 9 / 2 = 45 м",
        "difficulty": "medium"
    },
    {
        "id": "task-thermo-1",
        "section": "thermodynamics",
        "title": "Теплоёмкость",
        "question": "Для нагревания 1 кг вещества на 10°C потребовалось 5000 Дж. Чему равна удельная теплоёмкость вещества?",
        "options": ["50 Дж/(кг·°C)", "500 Дж/(кг·°C)", "5000 Дж/(кг·°C)", "50000 Дж/(кг·°C)"],
        "correct_answer": 1,
        "explanation": "c = Q/(mΔt) = 5000/(1×10) = 500 Дж/(кг·°C)",
        "difficulty": "medium"
    },
    {
        "id": "task-electro-1",
        "section": "electromagnetism",
        "title": "Закон Ома",
        "question": "Чему равно сопротивление проводника, если при напряжении 12 В сила тока равна 2 А?",
        "options": ["3 Ом", "6 Ом", "12 Ом", "24 Ом"],
        "correct_answer": 1,
        "explanation": "R = U/I = 12 В / 2 А = 6 Ом",
        "difficulty": "easy"
    },
    {
        "id": "task-optics-1",
        "section": "optics",
        "title": "Отражение света",
        "question": "Под каким углом к зеркалу нужно направить луч света, чтобы отражённый луч был перпендикулярен падающему?",
        "options": ["30°", "45°", "60°", "90°"],
        "correct_answer": 1,
        "explanation": "Если угол между лучами 90°, то α + β = 90°. Так как α = β, то 2α = 90°, α = 45°",
        "difficulty": "medium"
    },
    {
        "id": "task-atomic-1",
        "section": "atomic",
        "title": "Энергия фотона",
        "question": "Какова энергия фотона с частотой 5×10¹⁴ Гц? (h = 6.6×10⁻³⁴ Дж·с)",
        "options": ["3.3×10⁻¹⁹ Дж", "3.3×10⁻²⁰ Дж", "6.6×10⁻¹⁹ Дж", "6.6×10⁻²⁰ Дж"],
        "correct_answer": 0,
        "explanation": "E = hν = 6.6×10⁻³⁴ × 5×10¹⁴ = 3.3×10⁻¹⁹ Дж",
        "difficulty": "hard"
    }
]

# Initial formulas data
INITIAL_FORMULAS = [
    {
        "id": "formula-1",
        "section": "mechanics",
        "name": "Первый закон Ньютона",
        "formula": "∑F = 0 ⟹ v = const",
        "description": "Тело сохраняет состояние покоя или равномерного прямолинейного движения, если на него не действуют силы или равнодействующая сил равна нулю.",
        "variables": {"F": "Сила (Н)", "v": "Скорость (м/с)"},
        "unit": "—"
    },
    {
        "id": "formula-2",
        "section": "mechanics",
        "name": "Второй закон Ньютона",
        "formula": "F = ma",
        "description": "Ускорение тела прямо пропорционально силе и обратно пропорционально массе.",
        "variables": {"F": "Сила (Н)", "m": "Масса (кг)", "a": "Ускорение (м/с²)"},
        "unit": "Н (ньютон)"
    },
    {
        "id": "formula-3",
        "section": "mechanics",
        "name": "Третий закон Ньютона",
        "formula": "F₁ = -F₂",
        "description": "Силы, с которыми два тела действуют друг на друга, равны по модулю и противоположны по направлению.",
        "variables": {"F₁": "Сила действия (Н)", "F₂": "Сила противодействия (Н)"},
        "unit": "Н (ньютон)"
    },
    {
        "id": "formula-4",
        "section": "mechanics",
        "name": "Скорость равномерного движения",
        "formula": "v = S/t",
        "description": "Скорость равна отношению пройденного пути ко времени.",
        "variables": {"v": "Скорость (м/с)", "S": "Путь (м)", "t": "Время (с)"},
        "unit": "м/с"
    },
    {
        "id": "formula-5",
        "section": "mechanics",
        "name": "Ускорение",
        "formula": "a = (v - v₀)/t",
        "description": "Ускорение равно изменению скорости за единицу времени.",
        "variables": {"a": "Ускорение (м/с²)", "v": "Конечная скорость (м/с)", "v₀": "Начальная скорость (м/с)", "t": "Время (с)"},
        "unit": "м/с²"
    },
    {
        "id": "formula-6",
        "section": "thermodynamics",
        "name": "Количество теплоты",
        "formula": "Q = cmΔt",
        "description": "Количество теплоты, необходимое для нагревания тела.",
        "variables": {"Q": "Количество теплоты (Дж)", "c": "Удельная теплоёмкость (Дж/(кг·°C))", "m": "Масса (кг)", "Δt": "Изменение температуры (°C)"},
        "unit": "Дж (джоуль)"
    },
    {
        "id": "formula-7",
        "section": "thermodynamics",
        "name": "Уравнение Менделеева-Клапейрона",
        "formula": "PV = νRT",
        "description": "Уравнение состояния идеального газа.",
        "variables": {"P": "Давление (Па)", "V": "Объём (м³)", "ν": "Количество вещества (моль)", "R": "Газовая постоянная (8.31 Дж/(моль·К))", "T": "Температура (К)"},
        "unit": "Па·м³"
    },
    {
        "id": "formula-8",
        "section": "electromagnetism",
        "name": "Закон Ома",
        "formula": "I = U/R",
        "description": "Сила тока прямо пропорциональна напряжению и обратно пропорциональна сопротивлению.",
        "variables": {"I": "Сила тока (А)", "U": "Напряжение (В)", "R": "Сопротивление (Ом)"},
        "unit": "А (ампер)"
    },
    {
        "id": "formula-9",
        "section": "electromagnetism",
        "name": "Закон Кулона",
        "formula": "F = k·q₁q₂/r²",
        "description": "Сила взаимодействия двух точечных зарядов.",
        "variables": {"F": "Сила (Н)", "k": "Коэффициент (9×10⁹ Н·м²/Кл²)", "q₁, q₂": "Заряды (Кл)", "r": "Расстояние (м)"},
        "unit": "Н (ньютон)"
    },
    {
        "id": "formula-10",
        "section": "optics",
        "name": "Закон отражения",
        "formula": "α = β",
        "description": "Угол падения равен углу отражения.",
        "variables": {"α": "Угол падения (°)", "β": "Угол отражения (°)"},
        "unit": "градусы"
    },
    {
        "id": "formula-11",
        "section": "optics",
        "name": "Закон преломления",
        "formula": "n₁sin(α) = n₂sin(β)",
        "description": "Закон Снеллиуса для преломления света.",
        "variables": {"n₁, n₂": "Показатели преломления", "α": "Угол падения (°)", "β": "Угол преломления (°)"},
        "unit": "—"
    },
    {
        "id": "formula-12",
        "section": "atomic",
        "name": "Энергия фотона",
        "formula": "E = hν",
        "description": "Энергия фотона пропорциональна частоте излучения.",
        "variables": {"E": "Энергия (Дж)", "h": "Постоянная Планка (6.63×10⁻³⁴ Дж·с)", "ν": "Частота (Гц)"},
        "unit": "Дж (джоуль)"
    },
    {
        "id": "formula-13",
        "section": "atomic",
        "name": "Формула Эйнштейна",
        "formula": "E = mc²",
        "description": "Эквивалентность массы и энергии.",
        "variables": {"E": "Энергия (Дж)", "m": "Масса (кг)", "c": "Скорость света (3×10⁸ м/с)"},
        "unit": "Дж (джоуль)"
    }
]

# Initial tests data
INITIAL_TESTS = [
    {
        "id": "test-mech-1",
        "section": "mechanics",
        "title": "Тест по кинематике",
        "questions": [
            {
                "question": "Что такое траектория?",
                "options": ["Длина пути", "Линия движения тела", "Изменение положения", "Скорость движения"],
                "correct": 1
            },
            {
                "question": "Единица измерения ускорения в СИ:",
                "options": ["м/с", "м/с²", "Н", "кг"],
                "correct": 1
            },
            {
                "question": "При равномерном движении ускорение равно:",
                "options": ["Скорости", "Нулю", "Пути", "Времени"],
                "correct": 1
            },
            {
                "question": "Формула пути при равноускоренном движении:",
                "options": ["S = vt", "S = v₀t + at²/2", "S = at", "S = v/t"],
                "correct": 1
            },
            {
                "question": "Свободное падение — это движение под действием:",
                "options": ["Силы трения", "Силы тяжести", "Силы упругости", "Магнитной силы"],
                "correct": 1
            }
        ],
        "time_limit": 300
    },
    {
        "id": "test-thermo-1",
        "section": "thermodynamics",
        "title": "Тест по термодинамике",
        "questions": [
            {
                "question": "Что такое температура?",
                "options": ["Количество теплоты", "Мера средней кинетической энергии молекул", "Давление газа", "Объём тела"],
                "correct": 1
            },
            {
                "question": "Единица измерения количества теплоты:",
                "options": ["Ватт", "Джоуль", "Кельвин", "Паскаль"],
                "correct": 1
            },
            {
                "question": "Первый закон термодинамики выражает закон сохранения:",
                "options": ["Массы", "Импульса", "Энергии", "Заряда"],
                "correct": 2
            },
            {
                "question": "При изотермическом процессе постоянна:",
                "options": ["Давление", "Объём", "Температура", "Масса"],
                "correct": 2
            },
            {
                "question": "Абсолютный ноль температуры равен:",
                "options": ["0°C", "-100°C", "-273°C", "-373°C"],
                "correct": 2
            }
        ],
        "time_limit": 300
    },
    {
        "id": "test-electro-1",
        "section": "electromagnetism",
        "title": "Тест по электричеству",
        "questions": [
            {
                "question": "Единица измерения силы тока:",
                "options": ["Вольт", "Ом", "Ампер", "Ватт"],
                "correct": 2
            },
            {
                "question": "Закон Ома устанавливает связь между:",
                "options": ["Массой и силой", "Током, напряжением и сопротивлением", "Зарядом и временем", "Мощностью и работой"],
                "correct": 1
            },
            {
                "question": "При последовательном соединении сопротивления:",
                "options": ["Складываются", "Делятся", "Умножаются", "Не изменяются"],
                "correct": 0
            },
            {
                "question": "Направление электрического тока совпадает с направлением движения:",
                "options": ["Электронов", "Положительных зарядов", "Нейтронов", "Протонов"],
                "correct": 1
            },
            {
                "question": "Единица измерения электрического заряда:",
                "options": ["Ампер", "Вольт", "Кулон", "Ом"],
                "correct": 2
            }
        ],
        "time_limit": 300
    }
]

# Auth routes moved to routes/auth.py

# ==================== Sections Routes ====================

@api_router.get("/sections")
async def get_sections():
    return PHYSICS_SECTIONS

@api_router.get("/sections/{section_id}")
async def get_section(section_id: str):
    if section_id not in PHYSICS_SECTIONS:
        raise HTTPException(status_code=404, detail="Раздел не найден")
    return PHYSICS_SECTIONS[section_id]

# ==================== Topics/Lessons Routes ====================

@api_router.get("/topics")
async def get_topics(section: Optional[str] = None, subsection: Optional[str] = None):
    query = {}
    if section:
        query["section"] = section
    if subsection:
        query["subsection"] = subsection
    
    topics = await db.topics.find(query).to_list(100)
    if not topics:
        # Return initial data if database is empty
        filtered = INITIAL_TOPICS
        if section:
            filtered = [t for t in filtered if t["section"] == section]
        if subsection:
            filtered = [t for t in filtered if t["subsection"] == subsection]
        return filtered
    return topics

@api_router.get("/topics/{topic_id}")
async def get_topic(topic_id: str):
    topic = await db.topics.find_one({"id": topic_id})
    if not topic:
        # Check in initial data
        for t in INITIAL_TOPICS:
            if t["id"] == topic_id:
                return t
        raise HTTPException(status_code=404, detail="Тема не найдена")
    return topic

@api_router.post("/topics/{topic_id}/generate")
async def generate_topic_content(topic_id: str, request: GenerateContentRequest, current_user: dict = Depends(get_current_user)):
    topic = await db.topics.find_one({"id": topic_id})
    if not topic:
        for t in INITIAL_TOPICS:
            if t["id"] == topic_id:
                topic = t
                break
    
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")
    
    try:
        formulas = ', '.join(topic.get('formulas', [])) or 'choose the key formulas for this topic yourself'
        fallback_system_msg = """You are an experienced physics teacher for school and university students.
Always write the final answer in Russian. Be clear, accurate, and focused on the topic.

Formula and math rules:
- Write every formula and mathematical expression only in LaTeX.
- Use inline math like $v = v_0 + at$.
- Put important formulas on separate lines like $$F = ma$$.
- Do not write plain-text formulas like F=ma when it is a mathematical formula.
- After every important formula, explain each symbol and its units.
- Structure the answer with short Markdown headings.
- For calculations, use: given data, formula, substitution, final answer."""
        prompt_config = await get_ai_prompt("learn_more")
        system_msg = prompt_config.get("prompt") if prompt_config else fallback_system_msg
        user_template = prompt_config.get("user_template") if prompt_config else None
        
        if user_template:
            prompt = render_prompt_template(
                user_template,
                {
                    "topic_title": topic["title"],
                    "formulas": formulas,
                    "content_type": request.content_type,
                },
            )
        elif request.content_type == "detailed":
            prompt = f"""Create an expanded Russian explanation for the physics topic: {topic['title']}.

Key formulas for the topic: {formulas}.

Use this structure in Russian:
1. Short overview: what the topic means and why it matters.
2. Physical meaning: explain the idea in simple words.
3. Main formulas: only LaTeX, with explanations of every symbol.
4. How to apply it: a step-by-step method for solving problems.
5. Calculation example: a small problem with given data, formula, substitution, and answer.
6. Common mistakes: 3-5 frequent student mistakes.
7. Summary: a compact final recap.

The text must help the student understand the material, not just memorize it. Avoid unnecessary complexity, but keep enough detail."""
        elif request.content_type == "examples":
            prompt = f"""Give 3 detailed Russian worked examples for the physics topic: {topic['title']}.

Key formulas: {formulas}.

For each example use this structure in Russian:
- Problem statement
- Given data
- Find
- Formula, necessarily in LaTeX
- Solution
- Short explanation of the result

All formulas must be in LaTeX."""
        else:
            prompt = f"""Create 5 Russian practice problems for the physics topic: {topic['title']} with different difficulty levels.

Key formulas: {formulas}.

For each problem include:
- problem statement;
- difficulty level;
- short answer;
- main formula in LaTeX.

Do not provide full solutions, only the problem and answer."""
        
        response = await call_ai(
            prompt,
            system_message=system_msg,
            max_tokens=(prompt_config or {}).get("max_tokens") or 4096,
            temperature=(prompt_config or {}).get("temperature") if (prompt_config or {}).get("temperature") is not None else 0.55,
        )
        
        return {"content": response, "type": request.content_type}
    except Exception as e:
        logger.error(f"Error generating content: {e}")
        raise HTTPException(status_code=500, detail="Ошибка генерации контента")

# ==================== Tasks Routes ====================

@api_router.get("/tasks")
async def get_tasks(section: Optional[str] = None):
    query = {}
    if section:
        query["section"] = section
    
    tasks = await db.tasks.find(query).to_list(100)
    if not tasks:
        filtered = INITIAL_TASKS
        if section:
            filtered = [t for t in filtered if t["section"] == section]
        return filtered
    return tasks

@api_router.get("/tasks/{task_id}")
async def get_task(task_id: str):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        for t in INITIAL_TASKS:
            if t["id"] == task_id:
                return t
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return task

@api_router.post("/tasks/{task_id}/submit")
async def submit_task_answer(task_id: str, answer: Dict[str, int], current_user: dict = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        for t in INITIAL_TASKS:
            if t["id"] == task_id:
                task = t
                break
    
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    is_correct = answer.get("answer") == task["correct_answer"]
    
    # Update user progress
    if is_correct and task_id not in current_user.get("progress", {}).get("completed_tasks", []):
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$addToSet": {"progress.completed_tasks": task_id}}
        )
    
    return {
        "correct": is_correct,
        "correct_answer": task["correct_answer"],
        "explanation": task["explanation"]
    }

@api_router.post("/tasks/generate")
async def generate_task(request: GenerateTaskRequest, current_user: dict = Depends(get_current_user)):
    """Generate a new task using AI"""
    section_names = {
        "mechanics": "Механика",
        "thermodynamics": "Термодинамика", 
        "electromagnetism": "Электричество и магнетизм",
        "optics": "Оптика",
        "atomic": "Атомная физика"
    }
    
    difficulty_ru = {
        "easy": "лёгкая",
        "medium": "средняя",
        "hard": "сложная"
    }
    
    section_name = section_names.get(request.section, request.section)
    diff_name = difficulty_ru.get(request.difficulty, "средняя")
    
    try:
        system_msg = """Ты - генератор задач по физике. Создавай задачи в формате JSON.
            
ВАЖНО: Отвечай ТОЛЬКО валидным JSON без markdown разметки, без ```json```, просто чистый JSON."""
        
        prompt = f"""Создай задачу по физике на тему "{section_name}" сложности "{diff_name}".

Верни JSON в ТОЧНОМ формате (без markdown):
{{
    "title": "Название задачи",
    "question": "Текст задачи с конкретными числами",
    "options": ["вариант A", "вариант B", "вариант C", "вариант D"],
    "correct_answer": 0,
    "solution": {{
        "given": [
            {{"symbol": "m", "value": "5", "unit": "кг", "name": "масса тела"}},
            {{"symbol": "a", "value": "2", "unit": "м/с²", "name": "ускорение"}}
        ],
        "si_conversion": "Все величины уже в СИ",
        "formulas": ["F = ma"],
        "steps": [
            "Запишем второй закон Ньютона: F = ma",
            "Подставим значения: F = 5 кг × 2 м/с²",
            "Вычислим: F = 10 Н"
        ],
        "answer": "10 Н"
    }}
}}

correct_answer - это индекс правильного ответа (0, 1, 2 или 3)."""

        response = await call_ai(prompt, system_message=system_msg)
        
        # Parse JSON response
        import json
        # Clean response from potential markdown
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        cleaned = cleaned.strip()
        
        task_data = json.loads(cleaned)
        
        # Create task with unique ID
        task_id = f"gen-task-{uuid.uuid4().hex[:8]}"
        task = {
            "id": task_id,
            "section": request.section,
            "title": task_data.get("title", "Сгенерированная задача"),
            "question": task_data.get("question", ""),
            "options": task_data.get("options", []),
            "correct_answer": task_data.get("correct_answer", 0),
            "difficulty": request.difficulty,
            "solution": task_data.get("solution", {}),
            "generated": True,
            "created_at": datetime.utcnow()
        }
        
        # Save to database
        await db.generated_tasks.insert_one(task)
        
        return task
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}, response: {response[:500]}")
        raise HTTPException(status_code=500, detail="Ошибка парсинга ответа AI")
    except Exception as e:
        logger.error(f"Error generating task: {e}")
        raise HTTPException(status_code=500, detail="Ошибка генерации задачи")

@api_router.post("/tests/generate")
async def generate_test(request: GenerateTestRequest, current_user: dict = Depends(get_current_user)):
    """Generate a new test using AI"""
    section_names = {
        "mechanics": "Механика",
        "thermodynamics": "Термодинамика",
        "electromagnetism": "Электричество и магнетизм",
        "optics": "Оптика",
        "atomic": "Атомная физика"
    }
    
    section_name = section_names.get(request.section, request.section)
    
    try:
        fallback_system_msg = """Ты - генератор тестов по физике. Создавай тесты в формате JSON.
            
ВАЖНО: Отвечай ТОЛЬКО валидным JSON без markdown разметки, без ```json```, просто чистый JSON."""
        prompt_config = await get_ai_prompt("test_generator")
        system_msg = prompt_config.get("prompt") if prompt_config else fallback_system_msg
        user_template = prompt_config.get("user_template") if prompt_config else None
        
        if user_template:
            prompt = render_prompt_template(
                user_template,
                {
                    "num_questions": request.num_questions,
                    "section_name": section_name,
                    "difficulty": request.difficulty,
                },
            )
        else:
            prompt = f"""Создай тест из {request.num_questions} вопросов по теме "{section_name}".

Верни JSON в ТОЧНОМ формате (без markdown):
{{
    "title": "Тест по {section_name}",
    "questions": [
        {{
            "question": "Текст вопроса?",
            "options": ["вариант A", "вариант B", "вариант C", "вариант D"],
            "correct": 0
        }}
    ]
}}

correct - это индекс правильного ответа (0, 1, 2 или 3).
Создай ровно {request.num_questions} вопросов."""

        response = await call_ai(
            prompt,
            system_message=system_msg,
            max_tokens=(prompt_config or {}).get("max_tokens") or 4096,
            temperature=(prompt_config or {}).get("temperature") if (prompt_config or {}).get("temperature") is not None else 0.7,
        )
        
        # Parse JSON response
        import json
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        cleaned = cleaned.strip()
        
        test_data = json.loads(cleaned)
        
        # Create test with unique ID
        test_id = f"gen-test-{uuid.uuid4().hex[:8]}"
        test = {
            "id": test_id,
            "section": request.section,
            "title": test_data.get("title", f"Тест по {section_name}"),
            "questions": test_data.get("questions", []),
            "time_limit": request.num_questions * 60,  # 1 minute per question
            "generated": True,
            "created_at": datetime.utcnow()
        }
        
        # Save to database
        await db.generated_tests.insert_one(test)
        
        return test
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}")
        raise HTTPException(status_code=500, detail="Ошибка парсинга ответа AI")
    except Exception as e:
        logger.error(f"Error generating test: {e}")
        raise HTTPException(status_code=500, detail="Ошибка генерации теста")

# ==================== Tests Routes ====================

@api_router.get("/tests")
async def get_tests(section: Optional[str] = None):
    query = {}
    if section:
        query["section"] = section
    
    tests = await db.tests.find(query).to_list(100)
    if not tests:
        filtered = INITIAL_TESTS
        if section:
            filtered = [t for t in filtered if t["section"] == section]
        return filtered
    return tests

@api_router.get("/tests/{test_id}")
async def get_test(test_id: str):
    test = await db.tests.find_one({"id": test_id})
    if not test:
        for t in INITIAL_TESTS:
            if t["id"] == test_id:
                return t
        raise HTTPException(status_code=404, detail="Тест не найден")
    return test

@api_router.post("/tests/{test_id}/submit")
async def submit_test(test_id: str, request: TestSubmitRequest, current_user: dict = Depends(get_current_user)):
    test = await db.tests.find_one({"id": test_id})
    if not test:
        for t in INITIAL_TESTS:
            if t["id"] == test_id:
                test = t
                break

    assigned_test = None
    if not test:
        assigned_test = await db.assigned_tests.find_one({"id": test_id})
        if not assigned_test and request.assigned_test_id:
            assigned_test = await db.assigned_tests.find_one({"id": request.assigned_test_id})
        if assigned_test:
            test = assigned_test

    # Also check generated_tests collection
    if not test:
        gen_test = await db.generated_tests.find_one({"id": test_id})
        if gen_test:
            test = gen_test

    # If test is still not found, save the result anyway with the answers
    # (the frontend has the test data locally and validates there)
    if not test:
        num_answers = len(request.answers)
        result_id = f"test-result-{uuid.uuid4().hex[:12]}"
        result_doc = {
            "id": result_id,
            "user_id": current_user["id"],
            "class_id": current_user.get("class_id"),
            "test_id": test_id,
            "assigned_test_id": None,
            "source": request.source or "mobile",
            "score": 0,
            "score_override": None,
            "score_final": 0,
            "correct_count": 0,
            "total": num_answers,
            "answers": request.answers,
            "created_at": datetime.utcnow()
        }
        await db.test_results.insert_one(result_doc)

        await db.users.update_one(
            {"id": current_user["id"]},
            {"$addToSet": {"progress.completed_tests": test_id}}
        )

        return {
            "score": 0,
            "correct_count": 0,
            "total": num_answers,
            "results": [],
            "result_id": result_id
        }

    user_answers = request.answers
    correct_count = 0
    results = []
    questions = test.get("questions", [])

    for i, question in enumerate(questions):
        is_correct = i < len(user_answers) and user_answers[i] == question.get("correct")
        if is_correct:
            correct_count += 1
        results.append({
            "question": question.get("question"),
            "correct": is_correct,
            "correct_answer": question.get("correct"),
            "user_answer": user_answers[i] if i < len(user_answers) else None
        })

    score = int((correct_count / len(questions)) * 100) if questions else 0

    result_id = f"test-result-{uuid.uuid4().hex[:12]}"
    result_doc = {
        "id": result_id,
        "user_id": current_user["id"],
        "class_id": current_user.get("class_id"),
        "test_id": test_id,
        "assigned_test_id": assigned_test["id"] if assigned_test else None,
        "source": request.source or "mobile",
        "score": score,
        "score_override": None,
        "score_final": score,
        "correct_count": correct_count,
        "total": len(questions),
        "answers": user_answers,
        "created_at": datetime.utcnow()
    }
    await db.test_results.insert_one(result_doc)

    # Update user progress
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$addToSet": {"progress.completed_tests": test_id},
            "$set": {f"progress.scores.{test_id}": score}
        }
    )

    # Push-уведомление учителю, если это назначенный тест
    if assigned_test and assigned_test.get("created_by"):
        teacher_id = assigned_test["created_by"]
        emoji = "💯" if score == 100 else "📊"
        student_name = current_user.get("name", "Ученик")
        await send_push_notification(
            teacher_id,
            f"{emoji} {student_name} сдал тест",
            f"Результат: {score}% ({correct_count}/{len(questions)})",
            {"type": "test_result", "result_id": result_id},
        )

    return {
        "score": score,
        "correct_count": correct_count,
        "total": len(questions),
        "results": results,
        "result_id": result_id
    }

# ==================== Formulas Routes ====================

@api_router.get("/formulas")
async def get_formulas(section: Optional[str] = None):
    query = {}
    if section:
        query["section"] = section
    
    formulas = await db.formulas.find(query).to_list(100)
    if not formulas:
        filtered = INITIAL_FORMULAS
        if section:
            filtered = [f for f in filtered if f["section"] == section]
        return filtered
    return formulas

@api_router.get("/formulas/{formula_id}")
async def get_formula(formula_id: str):
    formula = await db.formulas.find_one({"id": formula_id})
    if not formula:
        for f in INITIAL_FORMULAS:
            if f["id"] == formula_id:
                return f
        raise HTTPException(status_code=404, detail="Формула не найдена")
    return formula

# ==================== AI Chat Routes ====================

def _utc_day_key() -> str:
    return datetime.utcnow().strftime("%Y-%m-%d")

async def _normalize_chat_usage_day(user_id: str, day_key: str) -> Dict[str, Any]:
    docs = await db.chat_usage.find({"user_id": user_id, "day": day_key}).sort("updated_at", -1).to_list(20)
    if not docs:
        return {}
    if len(docs) == 1:
        return docs[0]

    # Merge duplicates left from older buggy upserts.
    merged_free = sum(max(int(d.get("free_used", 0)), 0) for d in docs)
    merged_rewarded = sum(max(int(d.get("rewarded_credits", 0)), 0) for d in docs)
    primary = docs[0]
    now = datetime.utcnow()

    await db.chat_usage.update_one(
        {"_id": primary["_id"]},
        {
            "$set": {
                "free_used": merged_free,
                "rewarded_credits": merged_rewarded,
                "updated_at": now,
            }
        },
    )
    duplicate_ids = [d["_id"] for d in docs[1:]]
    if duplicate_ids:
        await db.chat_usage.delete_many({"_id": {"$in": duplicate_ids}})

    return await db.chat_usage.find_one({"_id": primary["_id"]}) or {}

async def _get_chat_quota(user_id: str) -> Dict[str, Any]:
    day_key = _utc_day_key()
    usage = await _normalize_chat_usage_day(user_id, day_key)
    free_used = int(usage.get("free_used", 0))
    rewarded_credits = int(usage.get("rewarded_credits", 0))
    return {
        "day": day_key,
        "free_limit": FREE_CHAT_DAILY_LIMIT,
        "free_used": free_used,
        "free_remaining": max(FREE_CHAT_DAILY_LIMIT - free_used, 0),
        "rewarded_credits": max(rewarded_credits, 0),
    }

async def _consume_chat_credit(user_id: str) -> Dict[str, Any]:
    now = datetime.utcnow()
    day_key = _utc_day_key()

    await _normalize_chat_usage_day(user_id, day_key)

    # Ensure a single day document exists before conditional updates.
    await db.chat_usage.update_one(
        {"user_id": user_id, "day": day_key},
        {
            "$setOnInsert": {
                "created_at": now,
                "free_used": 0,
                "rewarded_credits": 0,
            },
            "$set": {"updated_at": now},
        },
        upsert=True,
    )

    # 1) Try free daily quota first
    free_doc = await db.chat_usage.find_one_and_update(
        {
            "user_id": user_id,
            "day": day_key,
            "free_used": {"$lt": FREE_CHAT_DAILY_LIMIT},
        },
        {
            "$set": {"updated_at": now},
            "$inc": {"free_used": 1},
        },
        upsert=False,
        return_document=ReturnDocument.AFTER,
    )
    if free_doc:
        return {"allowed": True, "source": "free", "quota": await _get_chat_quota(user_id)}

    # 2) If free quota is exhausted, consume rewarded credit
    rewarded_doc = await db.chat_usage.find_one_and_update(
        {
            "user_id": user_id,
            "day": day_key,
            "rewarded_credits": {"$gt": 0},
        },
        {
            "$set": {"updated_at": now},
            "$inc": {"rewarded_credits": -1},
        },
        upsert=False,
        return_document=ReturnDocument.AFTER,
    )
    if rewarded_doc:
        return {"allowed": True, "source": "rewarded", "quota": await _get_chat_quota(user_id)}

    return {"allowed": False, "source": "none", "quota": await _get_chat_quota(user_id)}

# Chat routes moved to routes/chat.py

# ==================== Progress Routes ====================

@api_router.get("/progress")
async def get_progress(current_user: dict = Depends(get_current_user)):
    progress = current_user.get("progress", {})
    
    # Calculate overall progress
    total_lessons = len(INITIAL_TOPICS)
    total_tasks = len(INITIAL_TASKS)
    total_tests = len(INITIAL_TESTS)
    
    completed_lessons = len(progress.get("completed_lessons", []))
    completed_tasks = len(progress.get("completed_tasks", []))
    completed_tests = len(progress.get("completed_tests", []))
    
    overall_progress = 0
    if total_lessons + total_tasks + total_tests > 0:
        overall_progress = int(((completed_lessons + completed_tasks + completed_tests) / (total_lessons + total_tasks + total_tests)) * 100)
    
    return {
        "overall_progress": overall_progress,
        "completed_lessons": progress.get("completed_lessons", []),
        "completed_tasks": progress.get("completed_tasks", []),
        "completed_tests": progress.get("completed_tests", []),
        "lessons": {
            "completed": completed_lessons,
            "total": total_lessons,
            "percentage": int((completed_lessons / total_lessons) * 100) if total_lessons > 0 else 0
        },
        "tasks": {
            "completed": completed_tasks,
            "total": total_tasks,
            "percentage": int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0
        },
        "tests": {
            "completed": completed_tests,
            "total": total_tests,
            "percentage": int((completed_tests / total_tests) * 100) if total_tests > 0 else 0,
            "scores": progress.get("scores", {})
        }
    }

@api_router.post("/progress/lesson/{topic_id}")
async def mark_lesson_complete(topic_id: str, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$addToSet": {"progress.completed_lessons": topic_id}}
    )
    return {"success": True}

# ==================== Profile / Stats Routes ====================

XP_PER_TEST = 50
XP_PER_TASK = 20
XP_PER_LESSON = 30
XP_BONUS_PERFECT_TEST = 30

LEVELS = [
    {"name": "Новичок", "min_xp": 0, "icon": "🌱"},
    {"name": "Ученик", "min_xp": 100, "icon": "📚"},
    {"name": "Исследователь", "min_xp": 300, "icon": "🔬"},
    {"name": "Знаток", "min_xp": 600, "icon": "🧠"},
    {"name": "Мастер", "min_xp": 1000, "icon": "⚡"},
    {"name": "Физик", "min_xp": 1500, "icon": "🏆"},
]

ACHIEVEMENTS_DEFINITIONS = [
    {"id": "first_test", "name": "Первый тест", "description": "Пройдите первый тест", "icon": "🎯", "condition": "tests_completed >= 1"},
    {"id": "first_task", "name": "Первая задача", "description": "Решите первую задачу", "icon": "✅", "condition": "tasks_completed >= 1"},
    {"id": "first_lesson", "name": "Первый урок", "description": "Просмотрите первый урок", "icon": "📖", "condition": "lessons_completed >= 1"},
    {"id": "test_5", "name": "5 тестов", "description": "Пройдите 5 тестов", "icon": "📝", "condition": "tests_completed >= 5"},
    {"id": "test_10", "name": "10 тестов", "description": "Пройдите 10 тестов", "icon": "🏅", "condition": "tests_completed >= 10"},
    {"id": "task_10", "name": "10 задач", "description": "Решите 10 задач", "icon": "💪", "condition": "tasks_completed >= 10"},
    {"id": "task_50", "name": "50 задач", "description": "Решите 50 задач", "icon": "🔥", "condition": "tasks_completed >= 50"},
    {"id": "perfect_score", "name": "Отличник", "description": "Получите 100% на тесте", "icon": "💯", "condition": "has_perfect_test"},
    {"id": "streak_3", "name": "3 дня подряд", "description": "Заходите 3 дня подряд", "icon": "🔥", "condition": "streak >= 3"},
    {"id": "streak_5", "name": "5 дней подряд", "description": "Заходите 5 дней подряд", "icon": "🔥", "condition": "streak >= 5"},
    {"id": "streak_7", "name": "Неделя!", "description": "Заходите 7 дней подряд", "icon": "⭐", "condition": "streak >= 7"},
    {"id": "streak_30", "name": "Месяц!", "description": "Заходите 30 дней подряд", "icon": "👑", "condition": "streak >= 30"},
    {"id": "xp_100", "name": "100 XP", "description": "Наберите 100 XP", "icon": "⚡", "condition": "xp >= 100"},
    {"id": "xp_500", "name": "500 XP", "description": "Наберите 500 XP", "icon": "⚡", "condition": "xp >= 500"},
    {"id": "xp_1000", "name": "1000 XP", "description": "Наберите 1000 XP", "icon": "🚀", "condition": "xp >= 1000"},
    {"id": "mechanics_done", "name": "Механик", "description": "Изучите все темы механики", "icon": "⚙️", "condition": "section_mechanics_complete"},
    {"id": "thermo_done", "name": "Термодинамик", "description": "Изучите все темы термодинамики", "icon": "🌡️", "condition": "section_thermodynamics_complete"},
    {"id": "electro_done", "name": "Электрик", "description": "Изучите все темы электричества", "icon": "⚡", "condition": "section_electromagnetism_complete"},
]

# ==================== i18n Translations ====================

def parse_accept_language(accept_language: str | None) -> str:
    """Parse Accept-Language header and return language code (ru, en, kk)."""
    if not accept_language:
        return "ru"
    for part in accept_language.split(","):
        lang = part.split(";")[0].strip().lower()
        if lang.startswith("en"):
            return "en"
        if lang.startswith("kk") or lang.startswith("kz"):
            return "kk"
        if lang.startswith("ru"):
            return "ru"
    return "ru"

LEVELS_I18N = {
    "en": [
        {"name": "Beginner", "min_xp": 0, "icon": "🌱"},
        {"name": "Student", "min_xp": 100, "icon": "📚"},
        {"name": "Explorer", "min_xp": 300, "icon": "🔬"},
        {"name": "Expert", "min_xp": 600, "icon": "🧠"},
        {"name": "Master", "min_xp": 1000, "icon": "⚡"},
        {"name": "Physicist", "min_xp": 1500, "icon": "🏆"},
    ],
    "kk": [
        {"name": "Жаңадан бастаушы", "min_xp": 0, "icon": "🌱"},
        {"name": "Оқушы", "min_xp": 100, "icon": "📚"},
        {"name": "Зерттеуші", "min_xp": 300, "icon": "🔬"},
        {"name": "Білгір", "min_xp": 600, "icon": "🧠"},
        {"name": "Шебер", "min_xp": 1000, "icon": "⚡"},
        {"name": "Физик", "min_xp": 1500, "icon": "🏆"},
    ],
}

ACHIEVEMENTS_I18N = {
    "en": {
        "first_test": {"name": "First Test", "description": "Complete your first test"},
        "first_task": {"name": "First Problem", "description": "Solve your first problem"},
        "first_lesson": {"name": "First Lesson", "description": "View your first lesson"},
        "test_5": {"name": "5 Tests", "description": "Complete 5 tests"},
        "test_10": {"name": "10 Tests", "description": "Complete 10 tests"},
        "task_10": {"name": "10 Problems", "description": "Solve 10 problems"},
        "task_50": {"name": "50 Problems", "description": "Solve 50 problems"},
        "perfect_score": {"name": "Straight A", "description": "Score 100% on a test"},
        "streak_3": {"name": "3 Days Streak", "description": "Log in 3 days in a row"},
        "streak_5": {"name": "5 Days Streak", "description": "Log in 5 days in a row"},
        "streak_7": {"name": "One Week!", "description": "Log in 7 days in a row"},
        "streak_30": {"name": "One Month!", "description": "Log in 30 days in a row"},
        "xp_100": {"name": "100 XP", "description": "Earn 100 XP"},
        "xp_500": {"name": "500 XP", "description": "Earn 500 XP"},
        "xp_1000": {"name": "1000 XP", "description": "Earn 1000 XP"},
        "mechanics_done": {"name": "Mechanic", "description": "Study all mechanics topics"},
        "thermo_done": {"name": "Thermodynamicist", "description": "Study all thermodynamics topics"},
        "electro_done": {"name": "Electrician", "description": "Study all electricity topics"},
    },
    "kk": {
        "first_test": {"name": "Бірінші тест", "description": "Бірінші тестті тапсырыңыз"},
        "first_task": {"name": "Бірінші есеп", "description": "Бірінші есепті шешіңіз"},
        "first_lesson": {"name": "Бірінші сабақ", "description": "Бірінші сабақты қараңыз"},
        "test_5": {"name": "5 тест", "description": "5 тестті тапсырыңыз"},
        "test_10": {"name": "10 тест", "description": "10 тестті тапсырыңыз"},
        "task_10": {"name": "10 есеп", "description": "10 есепті шешіңіз"},
        "task_50": {"name": "50 есеп", "description": "50 есепті шешіңіз"},
        "perfect_score": {"name": "Үздік", "description": "Тестте 100% алыңыз"},
        "streak_3": {"name": "3 күн қатарынан", "description": "3 күн қатарынан кіріңіз"},
        "streak_5": {"name": "5 күн қатарынан", "description": "5 күн қатарынан кіріңіз"},
        "streak_7": {"name": "Бір апта!", "description": "7 күн қатарынан кіріңіз"},
        "streak_30": {"name": "Бір ай!", "description": "30 күн қатарынан кіріңіз"},
        "xp_100": {"name": "100 XP", "description": "100 XP жинаңыз"},
        "xp_500": {"name": "500 XP", "description": "500 XP жинаңыз"},
        "xp_1000": {"name": "1000 XP", "description": "1000 XP жинаңыз"},
        "mechanics_done": {"name": "Механик", "description": "Механиканың барлық тақырыптарын оқыңыз"},
        "thermo_done": {"name": "Термодинамик", "description": "Термодинамиканың барлық тақырыптарын оқыңыз"},
        "electro_done": {"name": "Электрик", "description": "Электр тақырыптарының барлығын оқыңыз"},
    },
}

DAILY_CHALLENGE_SECTION_NAMES_I18N = {
    "en": {
        "mechanics": "mechanics",
        "thermodynamics": "thermodynamics",
        "electromagnetism": "electricity",
        "optics": "optics",
        "atomic": "atomic physics",
    },
    "kk": {
        "mechanics": "механика",
        "thermodynamics": "термодинамика",
        "electromagnetism": "электр",
        "optics": "оптика",
        "atomic": "атом физикасы",
    },
}

DAILY_CHALLENGE_TEMPLATES_I18N = {
    "en": [
        {"type": "solve", "target": 3, "template": "Solve 3 problems on {section}", "xp": 50},
        {"type": "test", "target": 1, "template": "Pass a test on {section}", "xp": 40},
        {"type": "study", "target": 2, "template": "Study 2 topics on {section}", "xp": 30},
    ],
    "kk": [
        {"type": "solve", "target": 3, "template": "{section} бойынша 3 есеп шеш", "xp": 50},
        {"type": "test", "target": 1, "template": "{section} бойынша тест тапсыр", "xp": 40},
        {"type": "study", "target": 2, "template": "{section} бойынша 2 тақырып оқы", "xp": 30},
    ],
}

def compute_streak(user: dict) -> dict:
    """Compute current streak and max streak from user activity_dates."""
    activity_dates = user.get("activity_dates", [])
    if not activity_dates:
        return {"current": 0, "max": 0, "last_active": None}
    
    # Sort dates
    sorted_dates = sorted(set(d if isinstance(d, str) else d.strftime("%Y-%m-%d") for d in activity_dates))
    today = datetime.utcnow().strftime("%Y-%m-%d")
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    # Calculate current streak
    current_streak = 0
    if sorted_dates[-1] == today or sorted_dates[-1] == yesterday:
        current_streak = 1
        for i in range(len(sorted_dates) - 2, -1, -1):
            prev_date = datetime.strptime(sorted_dates[i + 1 if i + 1 < len(sorted_dates) else i], "%Y-%m-%d")
            curr_date = datetime.strptime(sorted_dates[i], "%Y-%m-%d")
            
            # Check back from the latest
            check_date = datetime.strptime(sorted_dates[-1], "%Y-%m-%d") - timedelta(days=current_streak)
            if sorted_dates[i] == check_date.strftime("%Y-%m-%d"):
                current_streak += 1
            else:
                break
    
    # Max streak
    max_streak = 1
    streak = 1
    for i in range(1, len(sorted_dates)):
        d1 = datetime.strptime(sorted_dates[i-1], "%Y-%m-%d")
        d2 = datetime.strptime(sorted_dates[i], "%Y-%m-%d")
        if (d2 - d1).days == 1:
            streak += 1
            max_streak = max(max_streak, streak)
        else:
            streak = 1
    
    if len(sorted_dates) == 1:
        max_streak = 1
    
    return {
        "current": current_streak,
        "max": max(max_streak, current_streak),
        "last_active": sorted_dates[-1] if sorted_dates else None
    }

def compute_xp(user: dict, test_results: list) -> int:
    """Compute total XP from user activity."""
    progress = user.get("progress", {})
    tests = len(progress.get("completed_tests", []))
    tasks = len(progress.get("completed_tasks", []))
    lessons = len(progress.get("completed_lessons", []))
    
    xp = tests * XP_PER_TEST + tasks * XP_PER_TASK + lessons * XP_PER_LESSON
    
    # Bonus for perfect tests
    for r in test_results:
        if r.get("score", 0) == 100 or r.get("score_final", 0) == 100:
            xp += XP_BONUS_PERFECT_TEST
    
    return xp

def get_level(xp: int, lang: str = "ru") -> dict:
    """Get current level based on XP."""
    current_level = LEVELS[0]
    next_level = LEVELS[1] if len(LEVELS) > 1 else None
    current_index = 0
    
    for i, level in enumerate(LEVELS):
        if xp >= level["min_xp"]:
            current_level = level
            current_index = i
            next_level = LEVELS[i + 1] if i + 1 < len(LEVELS) else None
        else:
            break
    
    xp_in_level = xp - current_level["min_xp"]
    xp_for_next = (next_level["min_xp"] - current_level["min_xp"]) if next_level else 0
    
    # Translate level names
    if lang != "ru" and lang in LEVELS_I18N:
        i18n_levels = LEVELS_I18N[lang]
        level_name = i18n_levels[current_index]["name"] if current_index < len(i18n_levels) else current_level["name"]
        next_index = current_index + 1
        next_level_name = i18n_levels[next_index]["name"] if next_level and next_index < len(i18n_levels) else (next_level["name"] if next_level else None)
    else:
        level_name = current_level["name"]
        next_level_name = next_level["name"] if next_level else None
    
    return {
        "name": level_name,
        "icon": current_level["icon"],
        "level_index": current_index,
        "total_levels": len(LEVELS),
        "xp_in_level": xp_in_level,
        "xp_for_next": xp_for_next,
        "progress": (xp_in_level / xp_for_next * 100) if xp_for_next > 0 else 100,
        "next_level": next_level_name,
    }

def compute_achievements(user: dict, test_results: list, xp: int, streak: dict, lang: str = "ru") -> list:
    """Check which achievements the user has earned."""
    progress = user.get("progress", {})
    tests_completed = len(progress.get("completed_tests", []))
    tasks_completed = len(progress.get("completed_tasks", []))
    lessons_completed = len(progress.get("completed_lessons", []))
    has_perfect = any(r.get("score", 0) == 100 or r.get("score_final", 0) == 100 for r in test_results)
    current_streak = streak.get("current", 0)
    max_streak = streak.get("max", 0)
    use_streak = max(current_streak, max_streak)
    
    # Check section completion
    sections_topics = {}
    for t in INITIAL_TOPICS:
        sec = t["section"]
        if sec not in sections_topics:
            sections_topics[sec] = set()
        sections_topics[sec].add(t["id"])
    
    completed_lessons_set = set(progress.get("completed_lessons", []))
    
    earned = []
    previously_earned = set(user.get("earned_achievements", []))
    
    for ach in ACHIEVEMENTS_DEFINITIONS:
        cond = ach["condition"]
        unlocked = False
        
        if cond.startswith("tests_completed"):
            val = int(cond.split(">=")[1].strip())
            unlocked = tests_completed >= val
        elif cond.startswith("tasks_completed"):
            val = int(cond.split(">=")[1].strip())
            unlocked = tasks_completed >= val
        elif cond.startswith("lessons_completed"):
            val = int(cond.split(">=")[1].strip())
            unlocked = lessons_completed >= val
        elif cond == "has_perfect_test":
            unlocked = has_perfect
        elif cond.startswith("streak"):
            val = int(cond.split(">=")[1].strip())
            unlocked = use_streak >= val
        elif cond.startswith("xp"):
            val = int(cond.split(">=")[1].strip())
            unlocked = xp >= val
        elif cond.startswith("section_"):
            sec_name = cond.replace("section_", "").replace("_complete", "")
            section_topics = sections_topics.get(sec_name, set())
            if section_topics:
                unlocked = section_topics.issubset(completed_lessons_set)
        
        # Translate name/description if needed
        if lang != "ru" and lang in ACHIEVEMENTS_I18N and ach["id"] in ACHIEVEMENTS_I18N[lang]:
            tr = ACHIEVEMENTS_I18N[lang][ach["id"]]
            a_name = tr["name"]
            a_desc = tr["description"]
        else:
            a_name = ach["name"]
            a_desc = ach["description"]
        
        earned.append({
            "id": ach["id"],
            "name": a_name,
            "description": a_desc,
            "icon": ach["icon"],
            "unlocked": unlocked,
            "is_new": unlocked and ach["id"] not in previously_earned,
        })
    
    return earned

def compute_section_progress(user: dict) -> list:
    """Compute progress per physics section."""
    progress = user.get("progress", {})
    completed = set(progress.get("completed_lessons", []))
    completed_tests = set(progress.get("completed_tests", []))
    completed_tasks = set(progress.get("completed_tasks", []))
    
    section_colors = {
        "mechanics": "#4A90D9",
        "thermodynamics": "#E74C3C",
        "electromagnetism": "#F39C12",
        "optics": "#9B59B6",
        "atomic": "#1ABC9C",
    }
    
    result = []
    for sec_key, sec_data in PHYSICS_SECTIONS.items():
        total_topics = 0
        completed_topics = 0
        for sub in sec_data.get("subsections", []):
            for topic in sub.get("topics", []):
                total_topics += 1
                if topic["id"] in completed:
                    completed_topics += 1
        
        percentage = int((completed_topics / total_topics) * 100) if total_topics > 0 else 0
        result.append({
            "section": sec_key,
            "name": sec_data["name"],
            "icon": sec_data.get("icon", "book"),
            "color": section_colors.get(sec_key, "#6366F1"),
            "completed": completed_topics,
            "total": total_topics,
            "percentage": percentage,
        })
    
    return result


@api_router.get("/profile/stats")
async def get_profile_stats(
    current_user: dict = Depends(get_current_user),
    accept_language: str | None = Header(default=None, alias="Accept-Language"),
):
    """Get comprehensive profile stats: stats, streak, XP, level, achievements, sections."""
    lang = parse_accept_language(accept_language)
    user_id = current_user["id"]
    
    # Record today's activity
    today = datetime.utcnow().strftime("%Y-%m-%d")
    await db.users.update_one(
        {"id": user_id},
        {"$addToSet": {"activity_dates": today}}
    )
    # Re-fetch to include updated activity_dates
    current_user = await db.users.find_one({"id": user_id})
    
    # Fetch test results
    test_results = await db.test_results.find({"user_id": user_id}).sort("created_at", -1).to_list(500)
    worksheet_results = await db.worksheet_results.find({"student_id": user_id}).sort("created_at", -1).to_list(500)
    
    progress = current_user.get("progress", {})
    tests_completed = len(progress.get("completed_tests", []))
    tasks_completed = len(progress.get("completed_tasks", []))
    lessons_completed = len(progress.get("completed_lessons", []))
    
    # Average test score
    scores = [r.get("score_final") or r.get("score", 0) for r in test_results]
    avg_score = int(sum(scores) / len(scores)) if scores else 0
    best_score = max(scores) if scores else 0
    
    # Streak
    streak = compute_streak(current_user)
    
    # XP & Level
    xp = compute_xp(current_user, test_results)
    level = get_level(xp, lang)
    
    # Achievements
    achievements = compute_achievements(current_user, test_results, xp, streak, lang)
    
    # Save newly earned achievements
    earned_ids = [a["id"] for a in achievements if a["unlocked"]]
    if earned_ids:
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"earned_achievements": earned_ids}}
        )
    
    # Section progress
    section_progress = compute_section_progress(current_user)
    
    # Activity history (last 10)
    history = []
    for r in test_results[:10]:
        test_title = "Тест"
        test = await db.tests.find_one({"id": r.get("test_id")})
        if test:
            test_title = test.get("title", "Тест")
        else:
            for t in INITIAL_TESTS:
                if t["id"] == r.get("test_id"):
                    test_title = t.get("title", "Тест")
                    break
        history.append({
            "type": "test",
            "title": test_title,
            "score": r.get("score_final") or r.get("score", 0),
            "date": r.get("created_at").isoformat() if r.get("created_at") else None,
            "icon": "checkbox",
        })
    
    worksheet_title_i18n = {"en": "Worksheet", "kk": "Жұмыс парағы"}
    for r in worksheet_results[:5]:
        history.append({
            "type": "worksheet",
            "title": worksheet_title_i18n.get(lang, "Рабочий лист"),
            "score": r.get("score_percent", 0),
            "date": r.get("created_at").isoformat() if r.get("created_at") else None,
            "icon": "document-text",
        })
    
    # Sort by date
    history.sort(key=lambda x: x.get("date") or "", reverse=True)
    history = history[:10]
    
    return {
        "user": {
            "id": current_user["id"],
            "email": current_user.get("email"),
            "name": current_user.get("name"),
            "avatar": current_user.get("avatar"),
            "grade": current_user.get("grade"),
            "role": current_user.get("role"),
        },
        "stats": {
            "tests_completed": tests_completed,
            "tasks_completed": tasks_completed,
            "lessons_completed": lessons_completed,
            "avg_score": avg_score,
            "best_score": best_score,
            "total_test_results": len(test_results),
            "total_worksheet_results": len(worksheet_results),
        },
        "streak": streak,
        "xp": xp,
        "level": level,
        "achievements": achievements,
        "section_progress": section_progress,
        "activity_history": history,
    }


@api_router.patch("/profile/update")
async def update_profile(payload: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile (name, avatar, grade)."""
    update_fields = {}
    if payload.name is not None:
        update_fields["name"] = payload.name
    if payload.avatar is not None:
        update_fields["avatar"] = payload.avatar
    if payload.grade is not None:
        update_fields["grade"] = payload.grade
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="Нет данных для обновления")
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": update_fields}
    )
    
    updated_user = await db.users.find_one({"id": current_user["id"]})
    return {
        "success": True,
        "user": {
            "id": updated_user["id"],
            "email": updated_user["email"],
            "name": updated_user.get("name"),
            "avatar": updated_user.get("avatar"),
            "grade": updated_user.get("grade"),
            "role": updated_user.get("role"),
        }
    }


# ==================== Favorites ====================

class FavoriteToggle(BaseModel):
    item_id: str         # topic id or formula id
    item_type: str       # "topic" or "formula"

@api_router.get("/favorites")
async def get_favorites(current_user: dict = Depends(get_current_user)):
    """Get user's favorites list."""
    favs = await db.favorites.find({"user_id": current_user["id"]}).to_list(500)
    return [{"item_id": f["item_id"], "item_type": f["item_type"]} for f in favs]

@api_router.post("/favorites/toggle")
async def toggle_favorite(payload: FavoriteToggle, current_user: dict = Depends(get_current_user)):
    """Add or remove a favorite."""
    existing = await db.favorites.find_one({
        "user_id": current_user["id"],
        "item_id": payload.item_id,
        "item_type": payload.item_type,
    })
    if existing:
        await db.favorites.delete_one({"_id": existing["_id"]})
        return {"favorited": False}
    else:
        await db.favorites.insert_one({
            "user_id": current_user["id"],
            "item_id": payload.item_id,
            "item_type": payload.item_type,
            "created_at": datetime.utcnow(),
        })
        return {"favorited": True}

# ==================== Notes ====================

class NoteUpsert(BaseModel):
    topic_id: str
    text: str

@api_router.get("/notes")
async def get_notes(current_user: dict = Depends(get_current_user)):
    """Get all user notes."""
    notes = await db.notes.find({"user_id": current_user["id"]}).to_list(500)
    return {n["topic_id"]: n["text"] for n in notes}

@api_router.put("/notes")
async def save_note(payload: NoteUpsert, current_user: dict = Depends(get_current_user)):
    """Create or update a note for a topic."""
    if not payload.text.strip():
        await db.notes.delete_one({"user_id": current_user["id"], "topic_id": payload.topic_id})
        return {"saved": True, "deleted": True}
    await db.notes.update_one(
        {"user_id": current_user["id"], "topic_id": payload.topic_id},
        {"$set": {"text": payload.text, "updated_at": datetime.utcnow()}},
        upsert=True,
    )
    return {"saved": True}

# ==================== Daily Challenge ====================

DAILY_CHALLENGE_SECTIONS = ["mechanics", "thermodynamics", "electromagnetism", "optics", "atomic"]

@api_router.get("/daily-challenge")
async def get_daily_challenge(
    current_user: dict = Depends(get_current_user),
    accept_language: str | None = Header(default=None, alias="Accept-Language"),
):
    """Get today's daily challenge. Deterministic based on date."""
    lang = parse_accept_language(accept_language)
    today = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Check if already completed today
    completed = await db.daily_challenges.find_one({
        "user_id": current_user["id"],
        "date": today,
        "completed": True,
    })
    
    # Generate deterministic challenge based on date hash
    day_hash = int(hashlib.md5(today.encode()).hexdigest(), 16)
    section_idx = day_hash % len(DAILY_CHALLENGE_SECTIONS)
    section = DAILY_CHALLENGE_SECTIONS[section_idx]
    
    section_names_ru = {
        "mechanics": "механике",
        "thermodynamics": "термодинамике",
        "electromagnetism": "электричеству",
        "optics": "оптике",
        "atomic": "атомной физике",
    }
    
    challenge_types_ru = [
        {"type": "solve", "target": 3, "title": f"Реши 3 задачи по {section_names_ru[section]}", "xp": 50},
        {"type": "test", "target": 1, "title": f"Пройди тест по {section_names_ru[section]}", "xp": 40},
        {"type": "study", "target": 2, "title": f"Изучи 2 темы по {section_names_ru[section]}", "xp": 30},
    ]
    challenge_idx = (day_hash // len(DAILY_CHALLENGE_SECTIONS)) % len(challenge_types_ru)
    challenge = challenge_types_ru[challenge_idx]
    
    # Apply i18n if not Russian
    if lang != "ru" and lang in DAILY_CHALLENGE_SECTION_NAMES_I18N and lang in DAILY_CHALLENGE_TEMPLATES_I18N:
        sec_name = DAILY_CHALLENGE_SECTION_NAMES_I18N[lang].get(section, section)
        templates = DAILY_CHALLENGE_TEMPLATES_I18N[lang]
        if challenge_idx < len(templates):
            tmpl = templates[challenge_idx]
            challenge = {
                "type": tmpl["type"],
                "target": tmpl["target"],
                "title": tmpl["template"].format(section=sec_name),
                "xp": tmpl["xp"],
            }
    
    # Count user's progress for today
    if challenge["type"] == "solve":
        today_tasks = await db.test_results.count_documents({
            "user_id": current_user["id"],
            "created_at": {"$gte": datetime.strptime(today, "%Y-%m-%d")},
        })
        progress = min(today_tasks, challenge["target"])
    elif challenge["type"] == "test":
        today_tests = await db.test_results.count_documents({
            "user_id": current_user["id"],
            "created_at": {"$gte": datetime.strptime(today, "%Y-%m-%d")},
        })
        progress = min(today_tests, challenge["target"])
    else:
        progress = 0
    
    return {
        "date": today,
        "section": section,
        "type": challenge["type"],
        "title": challenge["title"],
        "target": challenge["target"],
        "progress": progress,
        "xp_reward": challenge["xp"],
        "completed": completed is not None,
    }

@api_router.post("/daily-challenge/complete")
async def complete_daily_challenge(current_user: dict = Depends(get_current_user)):
    """Mark daily challenge as completed and award XP."""
    today = datetime.utcnow().strftime("%Y-%m-%d")
    
    existing = await db.daily_challenges.find_one({
        "user_id": current_user["id"],
        "date": today,
        "completed": True,
    })
    if existing:
        return {"already_completed": True, "xp_awarded": 0}
    
    await db.daily_challenges.insert_one({
        "user_id": current_user["id"],
        "date": today,
        "completed": True,
        "completed_at": datetime.utcnow(),
    })
    
    # Award bonus XP via activity record
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$addToSet": {"activity_dates": today}}
    )
    
    return {"completed": True, "xp_awarded": 50}

# ==================== Search ====================

@api_router.get("/search")
async def search_content(q: str, current_user: dict = Depends(get_current_user)):
    """Global search across topics, formulas, and tasks."""
    query_lower = q.lower().strip()
    if len(query_lower) < 2:
        return {"results": []}
    
    results = []
    
    # Search in topics
    for topic in INITIAL_TOPICS:
        if (query_lower in topic.get("title", "").lower() or
            query_lower in topic.get("brief_info", "").lower()):
            results.append({
                "type": "topic",
                "id": topic["id"],
                "title": topic["title"],
                "subtitle": topic.get("section", ""),
                "icon": "book",
            })
    
    # Search in formulas
    for formula in INITIAL_FORMULAS:
        if (query_lower in formula.get("name", "").lower() or
            query_lower in formula.get("formula", "").lower() or
            query_lower in formula.get("description", "").lower()):
            results.append({
                "type": "formula",
                "id": formula["id"],
                "title": formula["name"],
                "subtitle": formula.get("formula", ""),
                "icon": "flask",
            })
    
    # Search in sections
    for sec_key, sec_data in PHYSICS_SECTIONS.items():
        if query_lower in sec_data["name"].lower():
            results.append({
                "type": "section",
                "id": sec_key,
                "title": sec_data["name"],
                "subtitle": f"{len(sec_data.get('subsections', []))} подразделов",
                "icon": "folder",
            })
        # Search subsection names
        for sub in sec_data.get("subsections", []):
            if query_lower in sub["name"].lower():
                results.append({
                    "type": "subsection",
                    "id": f"{sec_key}/{sub['id']}",
                    "title": sub["name"],
                    "subtitle": sec_data["name"],
                    "icon": "list",
                })
    
    return {"results": results[:20]}


def require_teacher(user: dict):
    if user.get("role") != "teacher":
        raise HTTPException(status_code=403, detail="Teacher access required")

async def generate_pairing_code() -> str:
    for _ in range(10):
        code = f"{random.randint(0, 999999):06d}"
        existing = await db.pairing_sessions.find_one({
            "code": code,
            "active": True,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        if not existing:
            return code
    return f"{random.randint(0, 999999):06d}"

def _shuffle_with_seed(items: List[Any], seed: int) -> List[Any]:
    rng = random.Random(seed)
    result = list(items)
    rng.shuffle(result)
    return result

def generate_test_variant(base_questions: List[Dict[str, Any]], seed: int) -> List[Dict[str, Any]]:
    question_indices = _shuffle_with_seed(list(range(len(base_questions))), seed)
    variant_questions = []
    for q_index in question_indices:
        question = base_questions[q_index]
        options = list(question.get("options", []))
        option_indices = _shuffle_with_seed(list(range(len(options))), seed + q_index + 17)
        shuffled_options = [options[i] for i in option_indices] if options else []
        correct_index = question.get("correctIndex")
        if correct_index is None:
            correct_index = question.get("correct")
        if correct_index is None:
            correct_index = question.get("correct_answer")
        if correct_index is None or not options:
            new_correct = None
        else:
            try:
                new_correct = option_indices.index(int(correct_index))
            except ValueError:
                new_correct = None
        variant_questions.append({
            "question": question.get("question"),
            "options": shuffled_options,
            "correct_index": new_correct
        })
    return variant_questions

def get_variant_index(session_id: str, student_id: str, variant_count: int) -> int:
    base = f"{session_id}:{student_id}".encode("utf-8")
    digest = hashlib.sha256(base).hexdigest()
    return int(digest, 16) % max(1, variant_count)

# Teacher routes moved to routes/teacher.py

# ==================== Init Data ====================

@api_router.post("/init-data")
async def initialize_data():
    """Initialize database with sample data"""
    # Check if data already exists
    existing_topics = await db.topics.count_documents({})
    if existing_topics == 0:
        await db.topics.insert_many(INITIAL_TOPICS)
    
    existing_tasks = await db.tasks.count_documents({})
    if existing_tasks == 0:
        await db.tasks.insert_many(INITIAL_TASKS)
    
    existing_tests = await db.tests.count_documents({})
    if existing_tests == 0:
        await db.tests.insert_many(INITIAL_TESTS)
    
    existing_formulas = await db.formulas.count_documents({})
    if existing_formulas == 0:
        await db.formulas.insert_many(INITIAL_FORMULAS)
    
    return {"message": "Data initialized successfully"}

# ==================== Push Notifications ====================

async def send_push_notification(user_id: str, title: str, body: str, data: dict = None):
    """Send push notification to a user via Expo Push API."""
    tokens_docs = await db.push_tokens.find({"user_id": user_id}).to_list(10)
    tokens = [d["token"] for d in tokens_docs if d.get("token")]
    if not tokens:
        return

    messages = []
    for token in tokens:
        message = {
            "to": token,
            "sound": "default",
            "title": title,
            "body": body,
            "channelId": "default",
        }
        if data:
            message["data"] = data
        messages.append(message)

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://exp.host/--/api/v2/push/send",
                json=messages,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                timeout=10,
            )
            result = resp.json()
            # Удаляем невалидные токены
            if "data" in result:
                items = result["data"] if isinstance(result["data"], list) else [result["data"]]
                for i, item in enumerate(items):
                    if item.get("status") == "error" and item.get("details", {}).get("error") in (
                        "DeviceNotRegistered", "InvalidCredentials"
                    ):
                        if i < len(tokens):
                            await db.push_tokens.delete_one({"token": tokens[i]})
    except Exception as e:
        logging.error(f"Push notification error: {e}")


async def send_push_to_class(class_id: str, title: str, body: str, data: dict = None, exclude_user_id: str = None):
    """Send push notification to all students in a class."""
    query: Dict[str, Any] = {"role": "student"}
    if class_id:
        query["class_id"] = class_id
    students = await db.users.find(query, {"id": 1}).to_list(500)
    for student in students:
        sid = student.get("id")
        if sid and sid != exclude_user_id:
            await send_push_notification(sid, title, body, data)


@api_router.post("/cron/daily-push")
async def cron_daily_push(request: Request):
    """Cron endpoint: send daily reminders to inactive users.
    Call via external cron with header X-Cron-Secret.
    """
    secret = request.headers.get("X-Cron-Secret", "")
    expected = CRON_SECRET
    if not expected:
        raise HTTPException(status_code=503, detail="CRON_SECRET is not configured")
    if secret != expected:
        raise HTTPException(403, "Forbidden")

    now = datetime.utcnow()
    today = now.strftime("%Y-%m-%d")
    yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")

    # Находим пользователей с push-токенами
    all_tokens = await db.push_tokens.find({}).to_list(5000)
    user_ids = list(set(t["user_id"] for t in all_tokens))

    sent = 0
    for uid in user_ids:
        user = await db.users.find_one({"id": uid})
        if not user:
            continue
        activity = user.get("activity_dates", [])
        dates = sorted(set(d if isinstance(d, str) else d.strftime("%Y-%m-%d") for d in activity))
        last = dates[-1] if dates else None

        # Если не заходил сегодня
        if not last or last < today:
            streak = compute_streak(user)
            current = streak.get("current", 0)
            if current > 0:
                title = f"🔥 Не потеряй стрик {current} дней!"
                body = "Зайди сегодня, чтобы сохранить свою серию"
            else:
                title = "💡 Время учиться!"
                body = "Физика ждёт тебя. Зайди и проверь новые задания"

            await send_push_notification(uid, title, body, {"type": "daily_reminder"})
            sent += 1

    return {"sent": sent, "total_users": len(user_ids)}


@api_router.post("/push-token")
async def save_push_token(request: Request, current_user: dict = Depends(get_current_user)):
    """Save Expo push token for user."""
    body = await request.json()
    token = body.get("token")
    platform = body.get("platform", "unknown")
    if not token:
        raise HTTPException(400, "Token is required")

    # Upsert: один токен -> один пользователь
    await db.push_tokens.update_one(
        {"token": token},
        {"$set": {
            "user_id": current_user["id"],
            "token": token,
            "platform": platform,
            "updated_at": datetime.utcnow(),
        }},
        upsert=True,
    )
    return {"success": True}


@api_router.delete("/push-token")
async def delete_push_token(request: Request, current_user: dict = Depends(get_current_user)):
    """Remove push token on logout."""
    body = await request.json()
    token = body.get("token")
    if token:
        await db.push_tokens.delete_one({"token": token, "user_id": current_user["id"]})
    return {"success": True}


# ==================== Router Modules ====================

from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.teacher import router as teacher_router
from routes.notifications import router as notifications_router
from routes.admin import router as admin_router
from postgres import close_postgres_pool, init_postgres_schema

api_router.include_router(auth_router)
api_router.include_router(chat_router)
api_router.include_router(teacher_router)
api_router.include_router(notifications_router)
api_router.include_router(admin_router)

# ==================== Root ====================

@api_router.get("/")
async def root():
    return {"message": "Physics AI API", "version": "1.0"}

# Include the router in the main app
app.include_router(api_router)

cors_origins_env = os.environ.get("CORS_ORIGINS", "").strip()
if cors_origins_env:
    cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
else:
    if IS_PRODUCTION:
        raise RuntimeError("CORS_ORIGINS must be set when APP_ENV=production")
    cors_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
    ]
    logger.warning("CORS_ORIGINS is not set; using local development defaults: %s", cors_origins)

if IS_PRODUCTION and "*" in cors_origins:
    raise RuntimeError("Wildcard CORS origin is not allowed when APP_ENV=production")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False if "*" in cors_origins else True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_postgres():
    await init_postgres_schema()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_postgres_pool()
    client.close()
