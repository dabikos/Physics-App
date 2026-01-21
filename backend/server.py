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
            {"id": "kinematics", "name": "Кинематика"},
            {"id": "dynamics", "name": "Динамика"},
            {"id": "statics", "name": "Статика"}
        ]
    },
    "thermodynamics": {
        "name": "Термодинамика",
        "icon": "thermometer",
        "color": "#E74C3C",
        "subsections": [
            {"id": "heat", "name": "Теплота и температура"},
            {"id": "laws", "name": "Законы термодинамики"},
            {"id": "gases", "name": "Идеальный газ"}
        ]
    },
    "electromagnetism": {
        "name": "Электричество и магнетизм",
        "icon": "flash",
        "color": "#F39C12",
        "subsections": [
            {"id": "electrostatics", "name": "Электростатика"},
            {"id": "current", "name": "Постоянный ток"},
            {"id": "magnetism", "name": "Магнетизм"}
        ]
    },
    "optics": {
        "name": "Оптика",
        "icon": "eye",
        "color": "#9B59B6",
        "subsections": [
            {"id": "geometric", "name": "Геометрическая оптика"},
            {"id": "wave", "name": "Волновая оптика"},
            {"id": "quantum", "name": "Квантовая оптика"}
        ]
    },
    "atomic": {
        "name": "Атомная физика",
        "icon": "planet",
        "color": "#1ABC9C",
        "subsections": [
            {"id": "structure", "name": "Строение атома"},
            {"id": "nuclear", "name": "Ядерная физика"},
            {"id": "radioactivity", "name": "Радиоактивность"}
        ]
    }
}

# Initial topics data
INITIAL_TOPICS = [
    {
        "id": "kinematics-1",
        "section": "mechanics",
        "subsection": "kinematics",
        "title": "Прямолинейное равномерное движение",
        "brief_info": "Прямолинейное равномерное движение — это движение тела по прямой линии с постоянной скоростью. При таком движении тело проходит равные расстояния за равные промежутки времени.",
        "example_problem": "Автомобиль движется со скоростью 72 км/ч. Какое расстояние он пройдёт за 2,5 часа?\n\nРешение:\nv = 72 км/ч\nt = 2,5 ч\nS = v × t = 72 × 2,5 = 180 км\n\nОтвет: 180 км",
        "formulas": ["S = v × t", "v = S / t", "t = S / v"]
    },
    {
        "id": "kinematics-2",
        "section": "mechanics",
        "subsection": "kinematics",
        "title": "Равноускоренное движение",
        "brief_info": "Равноускоренное движение — это движение с постоянным ускорением. Скорость тела изменяется равномерно со временем.",
        "example_problem": "Тело начинает движение из состояния покоя с ускорением 2 м/с². Какую скорость оно приобретёт через 5 секунд?\n\nРешение:\nv₀ = 0 м/с\na = 2 м/с²\nt = 5 с\nv = v₀ + at = 0 + 2×5 = 10 м/с\n\nОтвет: 10 м/с",
        "formulas": ["v = v₀ + at", "S = v₀t + at²/2", "v² = v₀² + 2aS"]
    },
    {
        "id": "dynamics-1",
        "section": "mechanics",
        "subsection": "dynamics",
        "title": "Первый закон Ньютона",
        "brief_info": "Первый закон Ньютона (закон инерции): тело сохраняет состояние покоя или равномерного прямолинейного движения, пока на него не действуют внешние силы или их равнодействующая равна нулю.",
        "example_problem": "Шайба скользит по льду с постоянной скоростью. Какие силы действуют на шайбу? Почему она не останавливается мгновенно?\n\nРешение:\nНа шайбу действуют: сила тяжести (вниз), сила реакции опоры (вверх) и сила трения (против движения). Вертикальные силы компенсируют друг друга. Сила трения о лёд очень мала, поэтому шайба долго сохраняет движение по инерции.",
        "formulas": ["∑F = 0 → v = const"]
    },
    {
        "id": "dynamics-2",
        "section": "mechanics",
        "subsection": "dynamics",
        "title": "Второй закон Ньютона",
        "brief_info": "Второй закон Ньютона: ускорение тела прямо пропорционально равнодействующей всех сил и обратно пропорционально массе тела.",
        "example_problem": "На тело массой 5 кг действует сила 20 Н. Найти ускорение тела.\n\nРешение:\nm = 5 кг\nF = 20 Н\na = F/m = 20/5 = 4 м/с²\n\nОтвет: 4 м/с²",
        "formulas": ["F = ma", "a = F/m", "m = F/a"]
    },
    {
        "id": "thermo-1",
        "section": "thermodynamics",
        "subsection": "heat",
        "title": "Количество теплоты",
        "brief_info": "Количество теплоты — это энергия, которую тело получает или отдаёт при теплообмене. Измеряется в джоулях (Дж).",
        "example_problem": "Какое количество теплоты необходимо для нагревания 2 кг воды от 20°C до 80°C? Удельная теплоёмкость воды 4200 Дж/(кг·°C).\n\nРешение:\nm = 2 кг\nc = 4200 Дж/(кг·°C)\nΔt = 80 - 20 = 60°C\nQ = cmΔt = 4200 × 2 × 60 = 504000 Дж = 504 кДж\n\nОтвет: 504 кДж",
        "formulas": ["Q = cmΔt", "Q = λm", "Q = rm"]
    },
    {
        "id": "electro-1",
        "section": "electromagnetism",
        "subsection": "current",
        "title": "Закон Ома",
        "brief_info": "Закон Ома для участка цепи: сила тока прямо пропорциональна напряжению и обратно пропорциональна сопротивлению.",
        "example_problem": "Найти силу тока в проводнике сопротивлением 10 Ом при напряжении 220 В.\n\nРешение:\nU = 220 В\nR = 10 Ом\nI = U/R = 220/10 = 22 А\n\nОтвет: 22 А",
        "formulas": ["I = U/R", "U = IR", "R = U/I"]
    },
    {
        "id": "optics-1",
        "section": "optics",
        "subsection": "geometric",
        "title": "Закон отражения света",
        "brief_info": "Закон отражения: угол падения равен углу отражения. Падающий луч, отражённый луч и перпендикуляр к поверхности лежат в одной плоскости.",
        "example_problem": "Луч света падает на плоское зеркало под углом 30° к поверхности. Определить угол между падающим и отражённым лучами.\n\nРешение:\nУгол падения к нормали: α = 90° - 30° = 60°\nУгол отражения: β = α = 60°\nУгол между лучами = α + β = 60° + 60° = 120°\n\nОтвет: 120°",
        "formulas": ["α = β", "n = sin(α)/sin(β)"]
    },
    {
        "id": "atomic-1",
        "section": "atomic",
        "subsection": "structure",
        "title": "Модель атома Бора",
        "brief_info": "Модель Бора: электроны движутся по стационарным орбитам, не излучая энергию. Излучение происходит при переходе между орбитами.",
        "example_problem": "Электрон в атоме водорода переходит с третьего на второй энергетический уровень. Определить длину волны излучённого фотона.\n\nРешение:\nИспользуем формулу Ридберга:\n1/λ = R(1/n₁² - 1/n₂²)\n1/λ = 1.097×10⁷(1/4 - 1/9)\n1/λ = 1.097×10⁷ × 5/36\nλ ≈ 656 нм (красная линия водорода)\n\nОтвет: 656 нм",
        "formulas": ["E = hν", "λ = h/p", "En = -13.6/n² эВ"]
    }
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
