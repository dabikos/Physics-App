from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'physics-ai-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

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

# ==================== Models ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
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

class TaskWithSolution(BaseModel):
    id: str
    section: str
    title: str
    question: str
    options: List[str]
    correct_answer: int
    difficulty: str
    solution: Dict[str, Any]  # given, si_units, solution_steps, answer

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

# ==================== Auth Routes ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
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
            email=user_data.email,
            name=user_data.name,
            progress=user["progress"],
            created_at=user["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    
    token = create_token(user["id"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            progress=user.get("progress", {}),
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        progress=current_user.get("progress", {}),
        created_at=current_user["created_at"]
    )

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
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"topic-{topic_id}-{current_user['id']}",
            system_message="Ты - опытный преподаватель физики. Объясняй материал понятно и с примерами. Используй формулы и конкретные числовые примеры. Отвечай на русском языке."
        ).with_model("openai", "gpt-5.2")
        
        if request.content_type == "detailed":
            prompt = f"Расскажи подробно о теме '{topic['title']}'. Включи теоретические основы, физический смысл, историю открытия и практическое применение. Используй формулы: {', '.join(topic.get('formulas', []))}."
        elif request.content_type == "examples":
            prompt = f"Приведи 3 подробных примера решения задач по теме '{topic['title']}' с использованием формул: {', '.join(topic.get('formulas', []))}. Каждый пример должен быть с подробным решением."
        else:
            prompt = f"Создай 5 практических задач по теме '{topic['title']}' разной сложности. Для каждой задачи укажи условие и ответ (без решения)."
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
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
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"task-gen-{current_user['id']}-{datetime.utcnow().timestamp()}",
            system_message="""Ты - генератор задач по физике. Создавай задачи в формате JSON.
            
ВАЖНО: Отвечай ТОЛЬКО валидным JSON без markdown разметки, без ```json```, просто чистый JSON."""
        ).with_model("openai", "gpt-5.2")
        
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

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
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
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"test-gen-{current_user['id']}-{datetime.utcnow().timestamp()}",
            system_message="""Ты - генератор тестов по физике. Создавай тесты в формате JSON.
            
ВАЖНО: Отвечай ТОЛЬКО валидным JSON без markdown разметки, без ```json```, просто чистый JSON."""
        ).with_model("openai", "gpt-5.2")
        
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

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
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
async def submit_test(test_id: str, answers: Dict[str, List[int]], current_user: dict = Depends(get_current_user)):
    test = await db.tests.find_one({"id": test_id})
    if not test:
        for t in INITIAL_TESTS:
            if t["id"] == test_id:
                test = t
                break
    
    if not test:
        raise HTTPException(status_code=404, detail="Тест не найден")
    
    user_answers = answers.get("answers", [])
    correct_count = 0
    results = []
    
    for i, question in enumerate(test["questions"]):
        is_correct = i < len(user_answers) and user_answers[i] == question["correct"]
        if is_correct:
            correct_count += 1
        results.append({
            "question": question["question"],
            "correct": is_correct,
            "correct_answer": question["correct"],
            "user_answer": user_answers[i] if i < len(user_answers) else None
        })
    
    score = int((correct_count / len(test["questions"])) * 100)
    
    # Update user progress
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$addToSet": {"progress.completed_tests": test_id},
            "$set": {f"progress.scores.{test_id}": score}
        }
    )
    
    return {
        "score": score,
        "correct_count": correct_count,
        "total": len(test["questions"]),
        "results": results
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

@api_router.post("/chat")
async def chat_with_ai(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    try:
        session_id = request.session_id or f"chat-{current_user['id']}-{datetime.utcnow().timestamp()}"
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message="Ты - AI-помощник по физике. Помогай ученикам понять физические концепции, решать задачи и объяснять формулы. Отвечай на русском языке. Будь дружелюбным и терпеливым."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        # Save to chat history
        await db.chat_history.insert_one({
            "user_id": current_user["id"],
            "session_id": session_id,
            "user_message": request.message,
            "ai_response": response,
            "timestamp": datetime.utcnow()
        })
        
        return {"response": response, "session_id": session_id}
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail="Ошибка AI чата")

@api_router.get("/chat/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    history = await db.chat_history.find(
        {"user_id": current_user["id"]}
    ).sort("timestamp", -1).limit(50).to_list(50)
    return history

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

# ==================== Root ====================

@api_router.get("/")
async def root():
    return {"message": "Physics AI API", "version": "1.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
