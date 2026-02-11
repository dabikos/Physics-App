// Локальные данные физики - работает офлайн

export interface Topic {
  id: string;
  name: string;
}

export interface Subsection {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Section {
  name: string;
  icon: string;
  color: string;
  subsections: Subsection[];
}

export const PHYSICS_SECTIONS: Record<string, Section> = {
  mechanics: {
    name: "Механика",
    icon: "speedometer",
    color: "#4A90D9",
    subsections: [
      {
        id: "kinematics",
        name: "Кинематика",
        topics: [
          { id: "linear-motion", name: "Прямолинейное движение" },
          { id: "uniform-accelerated", name: "Равномерное и равноускоренное движение" },
          { id: "circular-motion", name: "Движение по окружности" },
          { id: "relative-motion", name: "Относительность движения" },
          { id: "motion-graphs", name: "Графики движения" }
        ]
      },
      {
        id: "dynamics",
        name: "Динамика",
        topics: [
          { id: "newton-laws", name: "Законы Ньютона" },
          { id: "forces", name: "Силы в механике" },
          { id: "multiple-forces", name: "Движение под действием нескольких сил" },
          { id: "inclined-plane", name: "Наклонная плоскость" },
          { id: "momentum", name: "Импульс и закон сохранения импульса" }
        ]
      },
      {
        id: "statics",
        name: "Статика",
        topics: [
          { id: "equilibrium", name: "Условия равновесия" },
          { id: "torque", name: "Момент силы" },
          { id: "center-mass", name: "Центр масс" },
          { id: "simple-machines", name: "Простые механизмы" }
        ]
      },
      {
        id: "conservation-laws",
        name: "Законы сохранения",
        topics: [
          { id: "work", name: "Работа" },
          { id: "kinetic-energy", name: "Кинетическая энергия" },
          { id: "potential-energy", name: "Потенциальная энергия" },
          { id: "energy-conservation", name: "Закон сохранения энергии" }
        ]
      },
      {
        id: "oscillations-waves",
        name: "Механические колебания и волны",
        topics: [
          { id: "harmonic-oscillations", name: "Гармонические колебания" },
          { id: "pendulums", name: "Маятники" },
          { id: "mechanical-waves", name: "Механические волны" },
          { id: "resonance", name: "Резонанс" }
        ]
      }
    ]
  },
  thermodynamics: {
    name: "Термодинамика",
    icon: "thermometer",
    color: "#E74C3C",
    subsections: [
      {
        id: "molecular-kinetic",
        name: "Молекулярно-кинетическая теория",
        topics: [
          { id: "matter-structure", name: "Строение вещества" },
          { id: "temperature", name: "Температура" },
          { id: "gas-pressure", name: "Давление газа" }
        ]
      },
      {
        id: "heat-processes",
        name: "Тепловые процессы",
        topics: [
          { id: "thermal-conductivity", name: "Теплопроводность" },
          { id: "convection", name: "Конвекция" },
          { id: "radiation", name: "Излучение" },
          { id: "heat-quantity", name: "Количество теплоты" }
        ]
      },
      {
        id: "ideal-gas",
        name: "Идеальный газ",
        topics: [
          { id: "state-equation", name: "Уравнение состояния" },
          { id: "isoprocesses", name: "Изопроцессы" },
          { id: "gas-laws", name: "Газовые законы" }
        ]
      },
      {
        id: "thermodynamics-laws",
        name: "Законы термодинамики",
        topics: [
          { id: "first-law", name: "Первый закон" },
          { id: "second-law", name: "Второй закон" },
          { id: "heat-engines", name: "Тепловые машины" },
          { id: "efficiency", name: "КПД" }
        ]
      },
      {
        id: "phase-transitions",
        name: "Фазовые переходы",
        topics: [
          { id: "melting", name: "Плавление" },
          { id: "evaporation", name: "Испарение" },
          { id: "boiling", name: "Кипение" },
          { id: "phase-diagrams", name: "Диаграммы состояния" }
        ]
      }
    ]
  },
  electromagnetism: {
    name: "Электричество и магнетизм",
    icon: "flash",
    color: "#F39C12",
    subsections: [
      {
        id: "electrostatics",
        name: "Электростатика",
        topics: [
          { id: "electric-charge", name: "Электрический заряд" },
          { id: "coulomb-law", name: "Закон Кулона" },
          { id: "electric-field", name: "Электрическое поле" },
          { id: "potential-voltage", name: "Потенциал и напряжение" },
          { id: "capacitors", name: "Конденсаторы" }
        ]
      },
      {
        id: "direct-current",
        name: "Постоянный ток",
        topics: [
          { id: "current-strength", name: "Сила тока" },
          { id: "ohm-law", name: "Закон Ома" },
          { id: "work-power", name: "Работа и мощность тока" },
          { id: "conductor-connections", name: "Соединение проводников" }
        ]
      },
      {
        id: "magnetism",
        name: "Магнетизм",
        topics: [
          { id: "magnetic-field", name: "Магнитное поле" },
          { id: "ampere-force", name: "Сила Ампера" },
          { id: "lorentz-force", name: "Сила Лоренца" }
        ]
      },
      {
        id: "electromagnetic-induction",
        name: "Электромагнитная индукция",
        topics: [
          { id: "faraday-law", name: "Закон Фарадея" },
          { id: "lenz-rule", name: "Правило Ленца" },
          { id: "inductance", name: "Индуктивность" },
          { id: "eddy-currents", name: "Вихревые токи" }
        ]
      },
      {
        id: "alternating-current",
        name: "Переменный ток",
        topics: [
          { id: "sinusoidal-current", name: "Синусоидальный ток" },
          { id: "reactive-resistance", name: "Реактивное сопротивление" },
          { id: "transformers", name: "Трансформаторы" },
          { id: "power-transmission", name: "Передача электроэнергии" }
        ]
      }
    ]
  },
  optics: {
    name: "Оптика",
    icon: "eye",
    color: "#9B59B6",
    subsections: [
      {
        id: "geometric-optics",
        name: "Геометрическая оптика",
        topics: [
          { id: "light-propagation", name: "Распространение света" },
          { id: "reflection", name: "Отражение" },
          { id: "refraction", name: "Преломление" },
          { id: "lenses-mirrors", name: "Линзы и зеркала" },
          { id: "optical-devices", name: "Оптические приборы" }
        ]
      },
      {
        id: "wave-optics",
        name: "Волновая оптика",
        topics: [
          { id: "interference", name: "Интерференция" },
          { id: "diffraction", name: "Дифракция" },
          { id: "polarization", name: "Поляризация" }
        ]
      },
      {
        id: "quantum-optics",
        name: "Квантовая оптика",
        topics: [
          { id: "photoelectric-effect", name: "Фотоэффект" },
          { id: "light-dualism", name: "Дуализм света" },
          { id: "emission-spectra", name: "Спектры излучения" },
          { id: "lasers", name: "Лазеры" }
        ]
      }
    ]
  },
  atomic: {
    name: "Атомная и ядерная физика",
    icon: "planet",
    color: "#1ABC9C",
    subsections: [
      {
        id: "atom-structure",
        name: "Строение атома",
        topics: [
          { id: "atom-models", name: "Модели атома" },
          { id: "energy-levels", name: "Энергетические уровни" },
          { id: "electron-shells", name: "Электронные оболочки" }
        ]
      },
      {
        id: "quantum-physics",
        name: "Квантовая физика",
        topics: [
          { id: "de-broglie-waves", name: "Волны де Бройля" },
          { id: "heisenberg-uncertainty", name: "Неопределённость Гейзенберга" }
        ]
      },
      {
        id: "nuclear-physics",
        name: "Ядерная физика",
        topics: [
          { id: "nucleus-structure", name: "Строение ядра" },
          { id: "nuclear-forces", name: "Ядерные силы" },
          { id: "binding-energy", name: "Энергия связи" }
        ]
      },
      {
        id: "radioactivity",
        name: "Радиоактивность",
        topics: [
          { id: "decay-types", name: "Виды распада" },
          { id: "decay-law", name: "Закон радиоактивного распада" },
          { id: "radiation-doses", name: "Дозы излучения" }
        ]
      },
      {
        id: "nuclear-reactions",
        name: "Ядерные реакции",
        topics: [
          { id: "fission", name: "Деление ядер" },
          { id: "fusion", name: "Термоядерный синтез" },
          { id: "nuclear-energy-use", name: "Применение ядерной энергии" }
        ]
      }
    ]
  }
};

// Данные тем (контент)
export interface TopicContent {
  id: string;
  section: string;
  subsection: string;
  title: string;
  brief_info: string;
  example_problem: string;
  formulas: string[];
  video?: string | number; // string для URL, number для require()
}

export const TOPICS_CONTENT: Record<string, TopicContent> = {
  // Кинематика
  "linear-motion": {
    id: "linear-motion",
    section: "mechanics",
    subsection: "kinematics",
    title: "Прямолинейное движение",
    brief_info: "Прямолинейное движение — это движение тела по прямой линии. При равномерном прямолинейном движении тело проходит равные расстояния за равные промежутки времени.",
    example_problem: "Автомобиль движется со скоростью 72 км/ч. Какое расстояние он пройдёт за 2,5 часа?\n\nРешение:\nv = 72 км/ч\nt = 2,5 ч\nS = v × t = 72 × 2,5 = 180 км\n\nОтвет: 180 км",
    formulas: ["S = v × t", "v = S / t", "t = S / v"]
  },
  "uniform-accelerated": {
    id: "uniform-accelerated",
    section: "mechanics",
    subsection: "kinematics",
    title: "Равномерное и равноускоренное движение",
    brief_info: "Равноускоренное движение — это движение с постоянным ускорением. Скорость тела изменяется равномерно со временем. При равномерном движении скорость постоянна, ускорение равно нулю.",
    example_problem: "Тело начинает движение из состояния покоя с ускорением 2 м/с². Какую скорость оно приобретёт через 5 секунд?\n\nРешение:\nv₀ = 0 м/с\na = 2 м/с²\nt = 5 с\nv = v₀ + at = 0 + 2×5 = 10 м/с\n\nОтвет: 10 м/с",
    formulas: ["v = v₀ + at", "S = v₀t + at²/2", "v² = v₀² + 2aS"]
  },
  "circular-motion": {
    id: "circular-motion",
    section: "mechanics",
    subsection: "kinematics",
    title: "Движение по окружности",
    brief_info: "Движение по окружности — это криволинейное движение, при котором траекторией является окружность. Характеризуется угловой скоростью, периодом и частотой обращения.",
    example_problem: "Колесо радиусом 0,5 м вращается с частотой 2 об/с. Найти линейную скорость точки на ободе колеса.\n\nРешение:\nR = 0,5 м\nν = 2 Гц\nv = 2πRν = 2 × 3,14 × 0,5 × 2 = 6,28 м/с\n\nОтвет: 6,28 м/с",
    formulas: ["v = ωR", "ω = 2πν", "T = 1/ν", "a = v²/R"]
  },
  "relative-motion": {
    id: "relative-motion",
    section: "mechanics",
    subsection: "kinematics",
    title: "Относительность движения",
    brief_info: "Движение тела относительно — его характеристики (скорость, траектория) зависят от выбора системы отсчёта. Скорость тела относительно неподвижной системы равна сумме скорости тела относительно подвижной системы и скорости подвижной системы.",
    example_problem: "Пассажир идёт по вагону поезда со скоростью 5 км/ч относительно вагона. Поезд движется со скоростью 60 км/ч. Найти скорость пассажира относительно земли, если он идёт в направлении движения поезда.\n\nРешение:\nv = v₁ + v₂ = 60 + 5 = 65 км/ч\n\nОтвет: 65 км/ч",
    formulas: ["v⃗ = v⃗₁ + v⃗₂", "S = S₁ + S₂"]
  },
  "motion-graphs": {
    id: "motion-graphs",
    section: "mechanics",
    subsection: "kinematics",
    title: "Графики движения",
    brief_info: "Графики движения позволяют наглядно представить зависимость координаты, скорости и ускорения от времени. По графику x(t) можно определить характер движения, по графику v(t) — найти путь как площадь под графиком.",
    example_problem: "По графику v(t) определить путь за 4 секунды, если график представляет прямую от v=0 при t=0 до v=8 м/с при t=4 с.\n\nРешение:\nПуть = площадь треугольника = ½ × основание × высота\nS = ½ × 4 × 8 = 16 м\n\nОтвет: 16 м",
    formulas: ["S = ∫v dt", "v = dx/dt", "a = dv/dt"]
  },

  // Динамика
  "newton-laws": {
    id: "newton-laws",
    section: "mechanics",
    subsection: "dynamics",
    title: "Законы Ньютона",
    brief_info: "Три закона Ньютона — основа классической механики. 1-й закон (инерции): тело сохраняет состояние покоя или равномерного движения. 2-й закон: F = ma. 3-й закон: силы действия и противодействия равны по модулю.",
    example_problem: "На тело массой 5 кг действует сила 20 Н. Найти ускорение тела.\n\nРешение:\nm = 5 кг\nF = 20 Н\na = F/m = 20/5 = 4 м/с²\n\nОтвет: 4 м/с²",
    formulas: ["F = ma", "F₁ = -F₂", "∑F = 0 → v = const"]
  },
  "forces": {
    id: "forces",
    section: "mechanics",
    subsection: "dynamics",
    title: "Силы в механике",
    brief_info: "Основные силы в механике: сила тяжести (F = mg), сила упругости (F = kx), сила трения (F = μN), сила реакции опоры. Все силы измеряются в ньютонах.",
    example_problem: "Найти силу тяжести, действующую на тело массой 10 кг.\n\nРешение:\nm = 10 кг\ng = 10 м/с²\nF = mg = 10 × 10 = 100 Н\n\nОтвет: 100 Н",
    formulas: ["F = mg", "F = kx", "F = μN"]
  },
  "multiple-forces": {
    id: "multiple-forces",
    section: "mechanics",
    subsection: "dynamics",
    title: "Движение под действием нескольких сил",
    brief_info: "Когда на тело действует несколько сил, его движение определяется равнодействующей — векторной суммой всех сил. Ускорение находится по второму закону Ньютона.",
    example_problem: "На тело массой 2 кг действуют две силы: F₁ = 6 Н вправо и F₂ = 2 Н влево. Найти ускорение.\n\nРешение:\nF = F₁ - F₂ = 6 - 2 = 4 Н\na = F/m = 4/2 = 2 м/с² (вправо)\n\nОтвет: 2 м/с²",
    formulas: ["F⃗ = ∑F⃗ᵢ", "a = F/m"]
  },
  "inclined-plane": {
    id: "inclined-plane",
    section: "mechanics",
    subsection: "dynamics",
    title: "Наклонная плоскость",
    brief_info: "Наклонная плоскость — простой механизм. Сила тяжести раскладывается на составляющие: параллельную плоскости (mgsinα) и перпендикулярную (mgcosα). Это определяет движение тела.",
    example_problem: "Тело массой 5 кг находится на наклонной плоскости с углом 30°. Найти силу, действующую вдоль плоскости.\n\nРешение:\nF = mg·sin(30°) = 5 × 10 × 0,5 = 25 Н\n\nОтвет: 25 Н",
    formulas: ["F∥ = mg·sinα", "N = mg·cosα", "a = g(sinα - μcosα)"]
  },
  "momentum": {
    id: "momentum",
    section: "mechanics",
    subsection: "dynamics",
    title: "Импульс и закон сохранения импульса",
    brief_info: "Импульс тела p = mv. Закон сохранения импульса: в замкнутой системе суммарный импульс остаётся постоянным. Применяется при анализе столкновений и взрывов.",
    example_problem: "Два шара массами 2 кг и 3 кг движутся навстречу со скоростями 4 м/с и 2 м/с. После столкновения они слипаются. Найти скорость после столкновения.\n\nРешение:\nm₁v₁ - m₂v₂ = (m₁+m₂)v\n2×4 - 3×2 = 5×v\nv = 2/5 = 0,4 м/с\n\nОтвет: 0,4 м/с",
    formulas: ["p = mv", "∑p = const", "F·Δt = Δp"]
  },

  // Статика
  "equilibrium": {
    id: "equilibrium",
    section: "mechanics",
    subsection: "statics",
    title: "Условия равновесия",
    brief_info: "Тело находится в равновесии, если сумма всех сил равна нулю (∑F = 0) и сумма моментов сил относительно любой оси равна нулю (∑M = 0).",
    example_problem: "Балка массой 20 кг лежит на двух опорах. Расстояние между опорами 4 м. Найти силы реакции опор, если центр масс балки посередине.\n\nРешение:\nN₁ + N₂ = mg = 200 Н\nПо симметрии: N₁ = N₂ = 100 Н\n\nОтвет: по 100 Н",
    formulas: ["∑F = 0", "∑M = 0"]
  },
  "torque": {
    id: "torque",
    section: "mechanics",
    subsection: "statics",
    title: "Момент силы",
    brief_info: "Момент силы M = F·d, где d — плечо силы (кратчайшее расстояние от оси вращения до линии действия силы). Момент вызывает вращение тела.",
    example_problem: "К концу рычага длиной 0,5 м приложена сила 40 Н перпендикулярно рычагу. Найти момент силы.\n\nРешение:\nM = F × d = 40 × 0,5 = 20 Н·м\n\nОтвет: 20 Н·м",
    formulas: ["M = F × d", "M = F × r × sinα"]
  },
  "center-mass": {
    id: "center-mass",
    section: "mechanics",
    subsection: "statics",
    title: "Центр масс",
    brief_info: "Центр масс — точка, в которой можно считать сосредоточенной всю массу тела. Для однородных тел совпадает с геометрическим центром. Тело находится в устойчивом равновесии, если центр масс находится над площадью опоры.",
    example_problem: "Два шара массами 1 кг и 3 кг соединены стержнем длиной 40 см. Найти положение центра масс.\n\nРешение:\nx = (m₁x₁ + m₂x₂)/(m₁+m₂)\nx = (1×0 + 3×40)/(1+3) = 30 см от первого шара\n\nОтвет: 30 см от первого шара",
    formulas: ["x_c = ∑mᵢxᵢ/∑mᵢ"]
  },
  "simple-machines": {
    id: "simple-machines",
    section: "mechanics",
    subsection: "statics",
    title: "Простые механизмы",
    brief_info: "Простые механизмы: рычаг, блок, ворот, клин, винт. Золотое правило механики: выигрывая в силе, проигрываем в расстоянии. КПД = полезная работа / затраченная работа.",
    example_problem: "Рычаг имеет плечи 20 см и 60 см. Какую силу нужно приложить к длинному плечу, чтобы поднять груз 30 кг?\n\nРешение:\nF₁l₁ = F₂l₂\nF × 60 = 300 × 20\nF = 100 Н\n\nОтвет: 100 Н",
    formulas: ["F₁l₁ = F₂l₂", "η = A_полезная/A_затраченная"]
  },

  // Законы сохранения
  "work": {
    id: "work",
    section: "mechanics",
    subsection: "conservation-laws",
    title: "Работа",
    brief_info: "Механическая работа A = F·S·cosα, где α — угол между силой и перемещением. Работа измеряется в джоулях. Работа силы тяжести: A = mgh.",
    example_problem: "Найти работу силы 50 Н, если тело переместилось на 4 м в направлении силы.\n\nРешение:\nA = F × S × cos(0°) = 50 × 4 × 1 = 200 Дж\n\nОтвет: 200 Дж",
    formulas: ["A = F·S·cosα", "A = mgh", "A = ΔE"]
  },
  "kinetic-energy": {
    id: "kinetic-energy",
    section: "mechanics",
    subsection: "conservation-laws",
    title: "Кинетическая энергия",
    brief_info: "Кинетическая энергия — энергия движения: E = mv²/2. Теорема о кинетической энергии: работа равнодействующей силы равна изменению кинетической энергии.",
    example_problem: "Найти кинетическую энергию автомобиля массой 1000 кг, движущегося со скоростью 20 м/с.\n\nРешение:\nE = mv²/2 = 1000 × 400 / 2 = 200000 Дж = 200 кДж\n\nОтвет: 200 кДж",
    formulas: ["E_к = mv²/2", "A = ΔE_к"]
  },
  "potential-energy": {
    id: "potential-energy",
    section: "mechanics",
    subsection: "conservation-laws",
    title: "Потенциальная энергия",
    brief_info: "Потенциальная энергия — энергия взаимодействия тел. В поле тяжести: E = mgh. Для пружины: E = kx²/2. Зависит от выбора нулевого уровня.",
    example_problem: "Найти потенциальную энергию тела массой 5 кг на высоте 10 м.\n\nРешение:\nE = mgh = 5 × 10 × 10 = 500 Дж\n\nОтвет: 500 Дж",
    formulas: ["E_п = mgh", "E_п = kx²/2"]
  },
  "energy-conservation": {
    id: "energy-conservation",
    section: "mechanics",
    subsection: "conservation-laws",
    title: "Закон сохранения энергии",
    brief_info: "В замкнутой системе полная механическая энергия сохраняется: E = E_к + E_п = const. При наличии трения механическая энергия переходит во внутреннюю.",
    example_problem: "Тело падает с высоты 20 м. Найти скорость у земли (без учёта сопротивления воздуха).\n\nРешение:\nmgh = mv²/2\nv = √(2gh) = √(2×10×20) = 20 м/с\n\nОтвет: 20 м/с",
    formulas: ["E_к + E_п = const", "mgh = mv²/2"]
  },

  // Колебания и волны
  "harmonic-oscillations": {
    id: "harmonic-oscillations",
    section: "mechanics",
    subsection: "oscillations-waves",
    title: "Гармонические колебания",
    brief_info: "Гармонические колебания описываются функцией x = A·cos(ωt + φ), где A — амплитуда, ω — циклическая частота, φ — начальная фаза. Период T = 2π/ω.",
    example_problem: "Тело совершает колебания с амплитудой 5 см и периодом 2 с. Найти максимальную скорость.\n\nРешение:\nv_max = ωA = (2π/T)A = (2π/2) × 0,05 = 0,157 м/с\n\nОтвет: 15,7 см/с",
    formulas: ["x = A·cos(ωt + φ)", "T = 2π/ω", "v_max = ωA"]
  },
  "pendulums": {
    id: "pendulums",
    section: "mechanics",
    subsection: "oscillations-waves",
    title: "Маятники",
    brief_info: "Математический маятник: T = 2π√(l/g). Пружинный маятник: T = 2π√(m/k). Период не зависит от амплитуды (при малых углах).",
    example_problem: "Найти период колебаний математического маятника длиной 1 м.\n\nРешение:\nT = 2π√(l/g) = 2π√(1/10) = 2π × 0,316 ≈ 2 с\n\nОтвет: ≈ 2 с",
    formulas: ["T = 2π√(l/g)", "T = 2π√(m/k)"]
  },
  "mechanical-waves": {
    id: "mechanical-waves",
    section: "mechanics",
    subsection: "oscillations-waves",
    title: "Механические волны",
    brief_info: "Механическая волна — распространение колебаний в среде. Характеристики: длина волны λ, скорость v, частота ν. Связь: v = λν. Волны бывают продольные и поперечные.",
    example_problem: "Скорость звука в воздухе 340 м/с. Найти длину волны при частоте 680 Гц.\n\nРешение:\nλ = v/ν = 340/680 = 0,5 м\n\nОтвет: 0,5 м",
    formulas: ["v = λν", "λ = vT"]
  },
  "resonance": {
    id: "resonance",
    section: "mechanics",
    subsection: "oscillations-waves",
    title: "Резонанс",
    brief_info: "Резонанс — резкое возрастание амплитуды вынужденных колебаний при совпадении частоты внешней силы с собственной частотой системы. Применяется в музыке, радиотехнике.",
    example_problem: "Собственная частота колебаний моста 2 Гц. При какой частоте шагов солдат возникнет резонанс?\n\nРешение:\nРезонанс возникает при ν_внешн = ν_собств = 2 Гц\n\nОтвет: 2 Гц (2 шага в секунду)",
    formulas: ["ν_рез = ν₀", "A_max при ν = ν₀"]
  },

  // Термодинамика - МКТ
  "matter-structure": {
    id: "matter-structure",
    section: "thermodynamics",
    subsection: "molecular-kinetic",
    title: "Строение вещества",
    brief_info: "Все вещества состоят из молекул (атомов), которые находятся в непрерывном хаотическом движении. Между молекулами действуют силы притяжения и отталкивания.",
    example_problem: "Сколько молекул содержится в 36 г воды?\n\nРешение:\nM(H₂O) = 18 г/моль\nν = m/M = 36/18 = 2 моль\nN = νNₐ = 2 × 6,02×10²³ = 1,2×10²⁴\n\nОтвет: 1,2×10²⁴ молекул",
    formulas: ["N = νNₐ", "Nₐ = 6,02×10²³"]
  },
  "temperature": {
    id: "temperature",
    section: "thermodynamics",
    subsection: "molecular-kinetic",
    title: "Температура",
    brief_info: "Температура — мера средней кинетической энергии молекул. Связь со средней энергией: E = (3/2)kT. Абсолютный ноль: T = 0 K = -273°C.",
    example_problem: "Найти среднюю кинетическую энергию молекулы газа при 27°C.\n\nРешение:\nT = 273 + 27 = 300 К\nE = (3/2)kT = 1,5 × 1,38×10⁻²³ × 300 = 6,21×10⁻²¹ Дж\n\nОтвет: 6,21×10⁻²¹ Дж",
    formulas: ["T(K) = t(°C) + 273", "E = (3/2)kT"]
  },
  "gas-pressure": {
    id: "gas-pressure",
    section: "thermodynamics",
    subsection: "molecular-kinetic",
    title: "Давление газа",
    brief_info: "Давление газа создаётся ударами молекул о стенки сосуда. Основное уравнение МКТ: p = (1/3)nm₀v². Давление зависит от концентрации и температуры.",
    example_problem: "Найти давление газа, если концентрация молекул 10²⁵ м⁻³, а средняя квадратичная скорость 500 м/с, масса молекулы 5×10⁻²⁶ кг.\n\nРешение:\np = (1/3)nm₀v² = (1/3)×10²⁵×5×10⁻²⁶×250000 ≈ 42 кПа\n\nОтвет: ≈ 42 кПа",
    formulas: ["p = (1/3)nm₀v²", "p = nkT"]
  },

  // Тепловые процессы
  "thermal-conductivity": {
    id: "thermal-conductivity",
    section: "thermodynamics",
    subsection: "heat-processes",
    title: "Теплопроводность",
    brief_info: "Теплопроводность — перенос тепла за счёт взаимодействия частиц без переноса вещества. Лучшие проводники — металлы, худшие — газы и пористые материалы.",
    example_problem: "Раздел в разработке",
    formulas: ["Q = λ·S·Δt·τ/d"]
  },
  "convection": {
    id: "convection",
    section: "thermodynamics",
    subsection: "heat-processes",
    title: "Конвекция",
    brief_info: "Конвекция — перенос тепла потоками жидкости или газа. Нагретые слои поднимаются вверх, холодные опускаются. Применяется в отоплении, вентиляции.",
    example_problem: "Раздел в разработке",
    formulas: []
  },
  "radiation": {
    id: "radiation",
    section: "thermodynamics",
    subsection: "heat-processes",
    title: "Излучение",
    brief_info: "Излучение — перенос энергии электромагнитными волнами. Не требует среды. Тёмные тела поглощают и излучают лучше светлых. Закон Стефана-Больцмана: P = σT⁴.",
    example_problem: "Раздел в разработке",
    formulas: ["P = σεST⁴"]
  },
  "heat-quantity": {
    id: "heat-quantity",
    section: "thermodynamics",
    subsection: "heat-processes",
    title: "Количество теплоты",
    brief_info: "Количество теплоты — энергия, переданная при теплообмене. Q = cmΔT для нагревания, Q = λm для плавления, Q = Lm для парообразования.",
    example_problem: "Сколько теплоты нужно для нагревания 2 кг воды от 20°C до 80°C?\n\nРешение:\nQ = cmΔT = 4200 × 2 × 60 = 504000 Дж = 504 кДж\n\nОтвет: 504 кДж",
    formulas: ["Q = cmΔT", "Q = λm", "Q = Lm"]
  },

  // Идеальный газ
  "state-equation": {
    id: "state-equation",
    section: "thermodynamics",
    subsection: "ideal-gas",
    title: "Уравнение состояния",
    brief_info: "Уравнение Менделеева-Клапейрона: pV = νRT связывает давление, объём и температуру газа. R = 8,31 Дж/(моль·К) — универсальная газовая постоянная.",
    example_problem: "Найти объём 2 моль газа при давлении 100 кПа и температуре 300 К.\n\nРешение:\nV = νRT/p = 2×8,31×300/100000 = 0,05 м³\n\nОтвет: 50 л",
    formulas: ["pV = νRT", "pV = NkT"]
  },
  "isoprocesses": {
    id: "isoprocesses",
    section: "thermodynamics",
    subsection: "ideal-gas",
    title: "Изопроцессы",
    brief_info: "Изопроцессы — процессы при постоянном параметре. Изотерма (T=const): pV=const. Изобара (p=const): V/T=const. Изохора (V=const): p/T=const.",
    example_problem: "Газ при 300 К занимает объём 10 л. Какой объём он займёт при 600 К (изобарно)?\n\nРешение:\nV₁/T₁ = V₂/T₂\nV₂ = V₁T₂/T₁ = 10×600/300 = 20 л\n\nОтвет: 20 л",
    formulas: ["pV = const (T=const)", "V/T = const (p=const)", "p/T = const (V=const)"]
  },
  "gas-laws": {
    id: "gas-laws",
    section: "thermodynamics",
    subsection: "ideal-gas",
    title: "Газовые законы",
    brief_info: "Закон Бойля-Мариотта (изотерма), закон Гей-Люссака (изобара), закон Шарля (изохора). Объединённый газовый закон: pV/T = const.",
    example_problem: "Газ сжали изотермически от 5 л до 2 л. Начальное давление 100 кПа. Найти конечное давление.\n\nРешение:\np₁V₁ = p₂V₂\np₂ = p₁V₁/V₂ = 100×5/2 = 250 кПа\n\nОтвет: 250 кПа",
    formulas: ["p₁V₁/T₁ = p₂V₂/T₂"]
  },

  // Законы термодинамики
  "first-law": {
    id: "first-law",
    section: "thermodynamics",
    subsection: "thermodynamics-laws",
    title: "Первый закон термодинамики",
    brief_info: "Первый закон: Q = ΔU + A — количество теплоты идёт на изменение внутренней энергии и совершение работы. Это закон сохранения энергии для тепловых процессов.",
    example_problem: "Газу передали 500 Дж теплоты, при этом он совершил работу 200 Дж. Как изменилась внутренняя энергия?\n\nРешение:\nΔU = Q - A = 500 - 200 = 300 Дж\n\nОтвет: увеличилась на 300 Дж",
    formulas: ["Q = ΔU + A", "A = p·ΔV"]
  },
  "second-law": {
    id: "second-law",
    section: "thermodynamics",
    subsection: "thermodynamics-laws",
    title: "Второй закон термодинамики",
    brief_info: "Второй закон определяет направление тепловых процессов. Теплота не может самопроизвольно переходить от холодного тела к горячему. Энтропия изолированной системы не убывает.",
    example_problem: "Раздел в разработке",
    formulas: ["ΔS ≥ 0"]
  },
  "heat-engines": {
    id: "heat-engines",
    section: "thermodynamics",
    subsection: "thermodynamics-laws",
    title: "Тепловые машины",
    brief_info: "Тепловая машина преобразует теплоту в работу. Состоит из нагревателя, рабочего тела и холодильника. Примеры: ДВС, паровая турбина, холодильник.",
    example_problem: "Раздел в разработке",
    formulas: ["A = Q₁ - Q₂"]
  },
  "efficiency": {
    id: "efficiency",
    section: "thermodynamics",
    subsection: "thermodynamics-laws",
    title: "КПД",
    brief_info: "КПД тепловой машины: η = A/Q₁ = (Q₁-Q₂)/Q₁. Максимальный КПД — у цикла Карно: η = (T₁-T₂)/T₁. КПД всегда меньше 100%.",
    example_problem: "Температура нагревателя 500 К, холодильника 300 К. Найти максимальный КПД.\n\nРешение:\nη = (T₁-T₂)/T₁ = (500-300)/500 = 0,4 = 40%\n\nОтвет: 40%",
    formulas: ["η = A/Q₁", "η_max = (T₁-T₂)/T₁"]
  },

  // Фазовые переходы
  "melting": {
    id: "melting",
    section: "thermodynamics",
    subsection: "phase-transitions",
    title: "Плавление",
    brief_info: "Плавление — переход из твёрдого состояния в жидкое при постоянной температуре. Требуется теплота плавления Q = λm. Обратный процесс — кристаллизация.",
    example_problem: "Сколько теплоты нужно для плавления 2 кг льда при 0°C? (λ = 330 кДж/кг)\n\nРешение:\nQ = λm = 330000 × 2 = 660000 Дж = 660 кДж\n\nОтвет: 660 кДж",
    formulas: ["Q = λm"]
  },
  "evaporation": {
    id: "evaporation",
    section: "thermodynamics",
    subsection: "phase-transitions",
    title: "Испарение",
    brief_info: "Испарение — переход из жидкости в пар с поверхности при любой температуре. Требует теплоты парообразования. Скорость зависит от температуры, площади, влажности.",
    example_problem: "Раздел в разработке",
    formulas: ["Q = Lm"]
  },
  "boiling": {
    id: "boiling",
    section: "thermodynamics",
    subsection: "phase-transitions",
    title: "Кипение",
    brief_info: "Кипение — интенсивное парообразование во всём объёме жидкости при определённой температуре. Температура кипения зависит от давления. Q = Lm.",
    example_problem: "Сколько теплоты нужно для обращения в пар 0,5 кг воды при 100°C? (L = 2,3 МДж/кг)\n\nРешение:\nQ = Lm = 2300000 × 0,5 = 1150000 Дж = 1,15 МДж\n\nОтвет: 1,15 МДж",
    formulas: ["Q = Lm"]
  },
  "phase-diagrams": {
    id: "phase-diagrams",
    section: "thermodynamics",
    subsection: "phase-transitions",
    title: "Диаграммы состояния",
    brief_info: "Диаграмма состояния показывает области существования фаз вещества в координатах p-T. Тройная точка — сосуществование всех трёх фаз. Критическая точка — исчезновение границы жидкость-газ.",
    example_problem: "Раздел в разработке",
    formulas: []
  },

  // Электростатика
  "electric-charge": {
    id: "electric-charge",
    section: "electromagnetism",
    subsection: "electrostatics",
    title: "Электрический заряд",
    brief_info: "Электрический заряд — свойство тел взаимодействовать электромагнитным полем. Заряд квантован: q = ne (e = 1,6×10⁻¹⁹ Кл). Заряд сохраняется.",
    example_problem: "Сколько электронов нужно удалить, чтобы тело получило заряд 3,2×10⁻¹⁸ Кл?\n\nРешение:\nn = q/e = 3,2×10⁻¹⁸ / 1,6×10⁻¹⁹ = 20 электронов\n\nОтвет: 20 электронов",
    formulas: ["q = ne", "e = 1,6×10⁻¹⁹ Кл"]
  },
  "coulomb-law": {
    id: "coulomb-law",
    section: "electromagnetism",
    subsection: "electrostatics",
    title: "Закон Кулона",
    brief_info: "Сила взаимодействия двух точечных зарядов: F = k|q₁q₂|/r², где k = 9×10⁹ Н·м²/Кл². Одноимённые заряды отталкиваются, разноимённые — притягиваются.",
    example_problem: "Найти силу взаимодействия двух зарядов по 1 мкКл на расстоянии 3 м.\n\nРешение:\nF = kq₁q₂/r² = 9×10⁹ × 10⁻⁶ × 10⁻⁶ / 9 = 0,001 Н = 1 мН\n\nОтвет: 1 мН",
    formulas: ["F = k|q₁q₂|/r²", "k = 9×10⁹ Н·м²/Кл²"]
  },
  "electric-field": {
    id: "electric-field",
    section: "electromagnetism",
    subsection: "electrostatics",
    title: "Электрическое поле",
    brief_info: "Электрическое поле — особая форма материи, через которую осуществляется взаимодействие зарядов. Характеризуется напряжённостью E = F/q. Силовые линии идут от + к -.",
    example_problem: "Найти напряжённость поля точечного заряда 2 мкКл на расстоянии 1 м.\n\nРешение:\nE = kq/r² = 9×10⁹ × 2×10⁻⁶ / 1 = 18000 В/м = 18 кВ/м\n\nОтвет: 18 кВ/м",
    formulas: ["E = F/q", "E = kq/r²"]
  },
  "potential-voltage": {
    id: "potential-voltage",
    section: "electromagnetism",
    subsection: "electrostatics",
    title: "Потенциал и напряжение",
    brief_info: "Потенциал φ = W/q — энергетическая характеристика поля. Напряжение U = φ₁ - φ₂ = A/q. Связь с напряжённостью: E = U/d (в однородном поле).",
    example_problem: "Найти работу по перемещению заряда 5 мкКл между точками с разностью потенциалов 100 В.\n\nРешение:\nA = qU = 5×10⁻⁶ × 100 = 5×10⁻⁴ Дж = 0,5 мДж\n\nОтвет: 0,5 мДж",
    formulas: ["U = φ₁ - φ₂", "A = qU", "E = U/d"]
  },
  "capacitors": {
    id: "capacitors",
    section: "electromagnetism",
    subsection: "electrostatics",
    title: "Конденсаторы",
    brief_info: "Конденсатор накапливает электрический заряд. Ёмкость C = q/U. Для плоского конденсатора: C = ε₀εS/d. Энергия: W = CU²/2 = q²/2C.",
    example_problem: "Найти ёмкость конденсатора, если при напряжении 100 В он накапливает заряд 5 мкКл.\n\nРешение:\nC = q/U = 5×10⁻⁶ / 100 = 5×10⁻⁸ Ф = 50 нФ\n\nОтвет: 50 нФ",
    formulas: ["C = q/U", "C = ε₀εS/d", "W = CU²/2"]
  },

  // Постоянный ток
  "current-strength": {
    id: "current-strength",
    section: "electromagnetism",
    subsection: "direct-current",
    title: "Сила тока",
    brief_info: "Сила тока I = q/t — заряд, проходящий через поперечное сечение проводника за единицу времени. Измеряется в амперах. Направление тока — направление движения положительных зарядов.",
    example_problem: "Через проводник за 10 с прошёл заряд 50 Кл. Найти силу тока.\n\nРешение:\nI = q/t = 50/10 = 5 А\n\nОтвет: 5 А",
    formulas: ["I = q/t", "I = neSv"]
  },
  "ohm-law": {
    id: "ohm-law",
    section: "electromagnetism",
    subsection: "direct-current",
    title: "Закон Ома",
    brief_info: "Закон Ома для участка цепи: I = U/R. Для полной цепи: I = ε/(R+r), где ε — ЭДС источника, r — его внутреннее сопротивление.",
    example_problem: "Найти силу тока при напряжении 12 В и сопротивлении 4 Ом.\n\nРешение:\nI = U/R = 12/4 = 3 А\n\nОтвет: 3 А",
    formulas: ["I = U/R", "I = ε/(R+r)"],
    video: require('../../assets/videos/ohm-law.mp4')
  },
  "work-power": {
    id: "work-power",
    section: "electromagnetism",
    subsection: "direct-current",
    title: "Работа и мощность тока",
    brief_info: "Работа тока A = UIt = I²Rt = U²t/R. Мощность P = UI = I²R = U²/R. Закон Джоуля-Ленца: Q = I²Rt — теплота, выделяемая проводником.",
    example_problem: "Найти мощность, потребляемую лампой при напряжении 220 В и силе тока 0,5 А.\n\nРешение:\nP = UI = 220 × 0,5 = 110 Вт\n\nОтвет: 110 Вт",
    formulas: ["P = UI", "A = UIt", "Q = I²Rt"]
  },
  "conductor-connections": {
    id: "conductor-connections",
    section: "electromagnetism",
    subsection: "direct-current",
    title: "Соединение проводников",
    brief_info: "Последовательное: R = R₁+R₂, I одинаков, U = U₁+U₂. Параллельное: 1/R = 1/R₁+1/R₂, U одинаково, I = I₁+I₂.",
    example_problem: "Найти общее сопротивление двух резисторов по 6 Ом при параллельном соединении.\n\nРешение:\n1/R = 1/6 + 1/6 = 2/6 = 1/3\nR = 3 Ом\n\nОтвет: 3 Ом",
    formulas: ["R = R₁+R₂ (послед.)", "1/R = 1/R₁+1/R₂ (парал.)"]
  },

  // Магнетизм
  "magnetic-field": {
    id: "magnetic-field",
    section: "electromagnetism",
    subsection: "magnetism",
    title: "Магнитное поле",
    brief_info: "Магнитное поле создаётся движущимися зарядами и действует на движущиеся заряды. Характеризуется индукцией B (Тл). Силовые линии замкнуты.",
    example_problem: "Раздел в разработке",
    formulas: ["B = μ₀I/2πr", "Ф = BS"]
  },
  "ampere-force": {
    id: "ampere-force",
    section: "electromagnetism",
    subsection: "magnetism",
    title: "Сила Ампера",
    brief_info: "Сила Ампера действует на проводник с током в магнитном поле: F = BILsinα. Направление определяется правилом левой руки.",
    example_problem: "Найти силу, действующую на проводник длиной 0,5 м с током 2 А в магнитном поле 0,1 Тл (перпендикулярно).\n\nРешение:\nF = BIL = 0,1 × 2 × 0,5 = 0,1 Н\n\nОтвет: 0,1 Н",
    formulas: ["F = BILsinα"]
  },
  "lorentz-force": {
    id: "lorentz-force",
    section: "electromagnetism",
    subsection: "magnetism",
    title: "Сила Лоренца",
    brief_info: "Сила Лоренца действует на движущийся заряд в магнитном поле: F = qvBsinα. Заставляет заряд двигаться по окружности или спирали.",
    example_problem: "Найти радиус движения электрона со скоростью 10⁶ м/с в магнитном поле 0,01 Тл.\n\nРешение:\nR = mv/(qB) = 9,1×10⁻³¹ × 10⁶ / (1,6×10⁻¹⁹ × 0,01) ≈ 0,57 мм\n\nОтвет: ≈ 0,57 мм",
    formulas: ["F = qvBsinα", "R = mv/(qB)"]
  },

  // ЭМ индукция
  "faraday-law": {
    id: "faraday-law",
    section: "electromagnetism",
    subsection: "electromagnetic-induction",
    title: "Закон Фарадея",
    brief_info: "ЭДС индукции равна скорости изменения магнитного потока: ε = -dФ/dt. Знак минус — правило Ленца. Это основа работы генераторов.",
    example_problem: "Магнитный поток через катушку изменился на 0,5 Вб за 0,1 с. Найти ЭДС индукции.\n\nРешение:\nε = ΔФ/Δt = 0,5/0,1 = 5 В\n\nОтвет: 5 В",
    formulas: ["ε = -dФ/dt", "ε = BLv"]
  },
  "lenz-rule": {
    id: "lenz-rule",
    section: "electromagnetism",
    subsection: "electromagnetic-induction",
    title: "Правило Ленца",
    brief_info: "Индукционный ток направлен так, чтобы противодействовать причине его вызвавшей. Это следствие закона сохранения энергии.",
    example_problem: "Раздел в разработке",
    formulas: ["ε = -dФ/dt"]
  },
  "inductance": {
    id: "inductance",
    section: "electromagnetism",
    subsection: "electromagnetic-induction",
    title: "Индуктивность",
    brief_info: "Индуктивность L характеризует способность катушки создавать магнитный поток: Ф = LI. ЭДС самоиндукции: ε = -L(dI/dt). Энергия магнитного поля: W = LI²/2.",
    example_problem: "Найти энергию магнитного поля катушки с индуктивностью 0,5 Гн при токе 2 А.\n\nРешение:\nW = LI²/2 = 0,5 × 4 / 2 = 1 Дж\n\nОтвет: 1 Дж",
    formulas: ["Ф = LI", "ε = -L(dI/dt)", "W = LI²/2"]
  },
  "eddy-currents": {
    id: "eddy-currents",
    section: "electromagnetism",
    subsection: "electromagnetic-induction",
    title: "Вихревые токи",
    brief_info: "Вихревые токи (токи Фуко) — индукционные токи в массивных проводниках. Вызывают нагрев. Используются в индукционных печах, демпферах.",
    example_problem: "Раздел в разработке",
    formulas: []
  },

  // Переменный ток
  "sinusoidal-current": {
    id: "sinusoidal-current",
    section: "electromagnetism",
    subsection: "alternating-current",
    title: "Синусоидальный ток",
    brief_info: "Переменный ток изменяется по синусоидальному закону: i = I₀sin(ωt). Характеризуется амплитудой, частотой, фазой. Действующее значение: I = I₀/√2.",
    example_problem: "Амплитуда переменного тока 10 А. Найти действующее значение.\n\nРешение:\nI = I₀/√2 = 10/1,41 ≈ 7,07 А\n\nОтвет: ≈ 7,07 А",
    formulas: ["i = I₀sin(ωt)", "I = I₀/√2", "U = U₀/√2"]
  },
  "reactive-resistance": {
    id: "reactive-resistance",
    section: "electromagnetism",
    subsection: "alternating-current",
    title: "Реактивное сопротивление",
    brief_info: "Индуктивное сопротивление: X_L = ωL. Ёмкостное: X_C = 1/(ωC). Полное сопротивление: Z = √(R² + (X_L - X_C)²).",
    example_problem: "Найти индуктивное сопротивление катушки 0,1 Гн при частоте 50 Гц.\n\nРешение:\nX_L = 2πfL = 2π × 50 × 0,1 ≈ 31,4 Ом\n\nОтвет: ≈ 31,4 Ом",
    formulas: ["X_L = ωL", "X_C = 1/(ωC)", "Z = √(R² + (X_L - X_C)²)"]
  },
  "transformers": {
    id: "transformers",
    section: "electromagnetism",
    subsection: "alternating-current",
    title: "Трансформаторы",
    brief_info: "Трансформатор изменяет напряжение переменного тока. Коэффициент трансформации: k = U₁/U₂ = n₁/n₂. При k>1 — понижающий, k<1 — повышающий.",
    example_problem: "Первичная обмотка 1000 витков, вторичная 50 витков. Найти напряжение на выходе при входном 220 В.\n\nРешение:\nU₂ = U₁n₂/n₁ = 220 × 50/1000 = 11 В\n\nОтвет: 11 В",
    formulas: ["U₁/U₂ = n₁/n₂", "P₁ ≈ P₂"]
  },
  "power-transmission": {
    id: "power-transmission",
    section: "electromagnetism",
    subsection: "alternating-current",
    title: "Передача электроэнергии",
    brief_info: "Для уменьшения потерь (P = I²R) электроэнергию передают при высоком напряжении. На электростанции напряжение повышают, у потребителя — понижают трансформаторами.",
    example_problem: "Раздел в разработке",
    formulas: ["P_потерь = I²R", "P = UI"]
  },

  // Геометрическая оптика
  "light-propagation": {
    id: "light-propagation",
    section: "optics",
    subsection: "geometric-optics",
    title: "Распространение света",
    brief_info: "Свет распространяется прямолинейно в однородной среде. Скорость света в вакууме c = 3×10⁸ м/с. В среде скорость меньше: v = c/n, где n — показатель преломления.",
    example_problem: "Найти скорость света в воде (n = 1,33).\n\nРешение:\nv = c/n = 3×10⁸/1,33 ≈ 2,26×10⁸ м/с\n\nОтвет: ≈ 2,26×10⁸ м/с",
    formulas: ["c = 3×10⁸ м/с", "v = c/n"]
  },
  "reflection": {
    id: "reflection",
    section: "optics",
    subsection: "geometric-optics",
    title: "Отражение",
    brief_info: "Закон отражения: угол падения равен углу отражения (α = β). Лучи лежат в одной плоскости с нормалью. Зеркальное отражение — от гладких поверхностей.",
    example_problem: "Луч падает на зеркало под углом 30° к поверхности. Найти угол между падающим и отражённым лучами.\n\nРешение:\nУгол падения к нормали: 90° - 30° = 60°\nУгол между лучами: 60° + 60° = 120°\n\nОтвет: 120°",
    formulas: ["α = β"]
  },
  "refraction": {
    id: "refraction",
    section: "optics",
    subsection: "geometric-optics",
    title: "Преломление",
    brief_info: "Закон преломления (Снеллиуса): n₁sinα = n₂sinβ. При переходе в более плотную среду луч отклоняется к нормали. Полное внутреннее отражение: sinα_кр = n₂/n₁.",
    example_problem: "Луч переходит из воздуха в воду (n=1,33) под углом 45°. Найти угол преломления.\n\nРешение:\nsinβ = sinα/n = sin45°/1,33 = 0,707/1,33 ≈ 0,53\nβ ≈ 32°\n\nОтвет: ≈ 32°",
    formulas: ["n₁sinα = n₂sinβ", "sinα_кр = n₂/n₁"]
  },
  "lenses-mirrors": {
    id: "lenses-mirrors",
    section: "optics",
    subsection: "geometric-optics",
    title: "Линзы и зеркала",
    brief_info: "Формула тонкой линзы: 1/F = 1/d + 1/f. Оптическая сила D = 1/F (диоптрии). Увеличение: Г = f/d = H/h. Собирающая линза: F>0, рассеивающая: F<0.",
    example_problem: "Фокусное расстояние линзы 20 см. Предмет на расстоянии 30 см. Найти расстояние до изображения.\n\nРешение:\n1/f = 1/F - 1/d = 1/20 - 1/30 = 1/60\nf = 60 см\n\nОтвет: 60 см",
    formulas: ["1/F = 1/d + 1/f", "D = 1/F", "Г = f/d"]
  },
  "optical-devices": {
    id: "optical-devices",
    section: "optics",
    subsection: "geometric-optics",
    title: "Оптические приборы",
    brief_info: "Глаз, лупа, микроскоп, телескоп, фотоаппарат — оптические приборы. Лупа: Г = 25/F см. Микроскоп: Г = Г_об × Г_ок. Телескоп: Г = F_об/F_ок.",
    example_problem: "Найти увеличение лупы с фокусным расстоянием 5 см.\n\nРешение:\nГ = 25/F = 25/5 = 5×\n\nОтвет: 5-кратное",
    formulas: ["Г_лупы = 25см/F"]
  },

  // Волновая оптика
  "interference": {
    id: "interference",
    section: "optics",
    subsection: "wave-optics",
    title: "Интерференция",
    brief_info: "Интерференция — сложение когерентных волн. Максимум при разности хода Δ = kλ, минимум при Δ = (2k+1)λ/2. Применяется в интерферометрах, просветлении оптики.",
    example_problem: "Раздел в разработке",
    formulas: ["Δ = kλ (max)", "Δ = (2k+1)λ/2 (min)"]
  },
  "diffraction": {
    id: "diffraction",
    section: "optics",
    subsection: "wave-optics",
    title: "Дифракция",
    brief_info: "Дифракция — огибание волнами препятствий. Дифракционная решётка: d·sinφ = kλ. Применяется в спектральном анализе.",
    example_problem: "Период решётки 0,01 мм. Найти угол дифракции для λ = 500 нм (1-й порядок).\n\nРешение:\nsinφ = λ/d = 500×10⁻⁹/10⁻⁵ = 0,05\nφ ≈ 2,9°\n\nОтвет: ≈ 2,9°",
    formulas: ["d·sinφ = kλ"]
  },
  "polarization": {
    id: "polarization",
    section: "optics",
    subsection: "wave-optics",
    title: "Поляризация",
    brief_info: "Поляризация — выделение колебаний в одной плоскости. Свет — поперечная волна. Закон Малюса: I = I₀cos²φ. Применяется в 3D-очках, ЖК-дисплеях.",
    example_problem: "Раздел в разработке",
    formulas: ["I = I₀cos²φ"]
  },

  // Квантовая оптика
  "photoelectric-effect": {
    id: "photoelectric-effect",
    section: "optics",
    subsection: "quantum-optics",
    title: "Фотоэффект",
    brief_info: "Фотоэффект — вырывание электронов светом. Уравнение Эйнштейна: hν = A + mv²/2. Красная граница: ν₀ = A/h. Законы фотоэффекта подтвердили квантовую природу света.",
    example_problem: "Работа выхода 2 эВ. Найти красную границу фотоэффекта.\n\nРешение:\nν₀ = A/h = 2×1,6×10⁻¹⁹/(6,63×10⁻³⁴) ≈ 4,8×10¹⁴ Гц\n\nОтвет: ≈ 4,8×10¹⁴ Гц",
    formulas: ["hν = A + E_к", "ν₀ = A/h"]
  },
  "light-dualism": {
    id: "light-dualism",
    section: "optics",
    subsection: "quantum-optics",
    title: "Дуализм света",
    brief_info: "Свет проявляет и волновые (интерференция, дифракция), и корпускулярные (фотоэффект) свойства. Фотон имеет энергию E = hν и импульс p = h/λ.",
    example_problem: "Найти импульс фотона с длиной волны 500 нм.\n\nРешение:\np = h/λ = 6,63×10⁻³⁴/500×10⁻⁹ = 1,33×10⁻²⁷ кг·м/с\n\nОтвет: 1,33×10⁻²⁷ кг·м/с",
    formulas: ["E = hν", "p = h/λ"]
  },
  "emission-spectra": {
    id: "emission-spectra",
    section: "optics",
    subsection: "quantum-optics",
    title: "Спектры излучения",
    brief_info: "Спектры: сплошные (нагретые твёрдые тела), линейчатые (атомы), полосатые (молекулы). Спектральный анализ определяет состав вещества.",
    example_problem: "Раздел в разработке",
    formulas: ["hν = E₂ - E₁"]
  },
  "lasers": {
    id: "lasers",
    section: "optics",
    subsection: "quantum-optics",
    title: "Лазеры",
    brief_info: "Лазер — источник когерентного монохроматического излучения. Основан на вынужденном излучении. Применяется в медицине, связи, технологиях.",
    example_problem: "Раздел в разработке",
    formulas: []
  },

  // Строение атома
  "atom-models": {
    id: "atom-models",
    section: "atomic",
    subsection: "atom-structure",
    title: "Модели атома",
    brief_info: "Модель Томсона (пудинг), планетарная модель Резерфорда, модель Бора с квантовыми орбитами. Современная квантово-механическая модель описывает электронные облака.",
    example_problem: "Раздел в разработке",
    formulas: []
  },
  "energy-levels": {
    id: "energy-levels",
    section: "atomic",
    subsection: "atom-structure",
    title: "Энергетические уровни",
    brief_info: "Энергия электрона в атоме квантована. Для водорода: E_n = -13,6/n² эВ. При переходе между уровнями излучается или поглощается фотон с энергией hν = E₂ - E₁.",
    example_problem: "Найти энергию фотона при переходе электрона в атоме водорода с 3-го на 2-й уровень.\n\nРешение:\nE₃ = -13,6/9 = -1,51 эВ\nE₂ = -13,6/4 = -3,4 эВ\nhν = E₃ - E₂ = 1,89 эВ\n\nОтвет: 1,89 эВ",
    formulas: ["E_n = -13,6/n² эВ", "hν = E₂ - E₁"]
  },
  "electron-shells": {
    id: "electron-shells",
    section: "atomic",
    subsection: "atom-structure",
    title: "Электронные оболочки",
    brief_info: "Электроны располагаются на оболочках (K, L, M...). Максимальное число электронов на оболочке: 2n². Принцип Паули запрещает одинаковые квантовые состояния.",
    example_problem: "Раздел в разработке",
    formulas: ["N_max = 2n²"]
  },

  // Квантовая физика
  "de-broglie-waves": {
    id: "de-broglie-waves",
    section: "atomic",
    subsection: "quantum-physics",
    title: "Волны де Бройля",
    brief_info: "Любая частица обладает волновыми свойствами. Длина волны де Бройля: λ = h/p = h/(mv). Волновые свойства проявляются у микрочастиц.",
    example_problem: "Найти длину волны электрона с энергией 100 эВ.\n\nРешение:\nλ = h/√(2mE) = 6,63×10⁻³⁴/√(2×9,1×10⁻³¹×1,6×10⁻¹⁷)\nλ ≈ 0,12 нм\n\nОтвет: ≈ 0,12 нм",
    formulas: ["λ = h/p = h/(mv)"]
  },
  "heisenberg-uncertainty": {
    id: "heisenberg-uncertainty",
    section: "atomic",
    subsection: "quantum-physics",
    title: "Неопределённость Гейзенберга",
    brief_info: "Невозможно одновременно точно измерить координату и импульс частицы: Δx·Δp ≥ ℏ/2. Аналогично для энергии и времени: ΔE·Δt ≥ ℏ/2.",
    example_problem: "Раздел в разработке",
    formulas: ["Δx·Δp ≥ ℏ/2", "ΔE·Δt ≥ ℏ/2"]
  },

  // Ядерная физика
  "nucleus-structure": {
    id: "nucleus-structure",
    section: "atomic",
    subsection: "nuclear-physics",
    title: "Строение ядра",
    brief_info: "Ядро состоит из протонов и нейтронов (нуклонов). Зарядовое число Z — число протонов. Массовое число A = Z + N. Изотопы — ядра с одинаковым Z, но разным N.",
    example_problem: "Сколько протонов и нейтронов в ядре ²³⁸U?\n\nРешение:\nZ = 92 (протонов)\nN = A - Z = 238 - 92 = 146 (нейтронов)\n\nОтвет: 92 протона, 146 нейтронов",
    formulas: ["A = Z + N"]
  },
  "nuclear-forces": {
    id: "nuclear-forces",
    section: "atomic",
    subsection: "nuclear-physics",
    title: "Ядерные силы",
    brief_info: "Ядерные силы — силы притяжения между нуклонами. Короткодействующие (≈10⁻¹⁵ м), не зависят от заряда, обладают насыщением. Значительно сильнее электромагнитных.",
    example_problem: "Раздел в разработке",
    formulas: []
  },
  "binding-energy": {
    id: "binding-energy",
    section: "atomic",
    subsection: "nuclear-physics",
    title: "Энергия связи",
    brief_info: "Энергия связи — энергия, необходимая для разделения ядра на нуклоны. E_св = Δm·c². Дефект массы: Δm = Zm_p + Nm_n - M_ядра. Удельная энергия связи максимальна у Fe.",
    example_problem: "Раздел в разработке",
    formulas: ["E_св = Δm·c²", "Δm = Zm_p + Nm_n - M"]
  },

  // Радиоактивность
  "decay-types": {
    id: "decay-types",
    section: "atomic",
    subsection: "radioactivity",
    title: "Виды распада",
    brief_info: "α-распад: вылетает ⁴He (Z→Z-2, A→A-4). β-распад: вылетает электрон (Z→Z+1, A=const). γ-излучение: электромагнитное излучение (Z, A не меняются).",
    example_problem: "Написать реакцию α-распада ²²⁶Ra.\n\nРешение:\n²²⁶Ra → ²²²Rn + ⁴He\n(88→86, 226→222)\n\nОтвет: ²²⁶Ra → ²²²Rn + ⁴He",
    formulas: []
  },
  "decay-law": {
    id: "decay-law",
    section: "atomic",
    subsection: "radioactivity",
    title: "Закон радиоактивного распада",
    brief_info: "N = N₀·2^(-t/T), где T — период полураспада. За время T распадается половина ядер. Активность A = λN убывает по тому же закону.",
    example_problem: "Период полураспада йода-131 равен 8 суток. Сколько останется через 24 суток?\n\nРешение:\nt/T = 24/8 = 3\nN = N₀/2³ = N₀/8 = 12,5%\n\nОтвет: 12,5% от начального",
    formulas: ["N = N₀·2^(-t/T)", "N = N₀·e^(-λt)"]
  },
  "radiation-doses": {
    id: "radiation-doses",
    section: "atomic",
    subsection: "radioactivity",
    title: "Дозы излучения",
    brief_info: "Поглощённая доза D (Гр) — энергия на единицу массы. Эквивалентная доза H (Зв) = D·k учитывает тип излучения. Предельная доза для населения ~1 мЗв/год.",
    example_problem: "Раздел в разработке",
    formulas: ["D = E/m (Гр)", "H = D·k (Зв)"]
  },

  // Ядерные реакции
  "fission": {
    id: "fission",
    section: "atomic",
    subsection: "nuclear-reactions",
    title: "Деление ядер",
    brief_info: "Деление тяжёлых ядер (U, Pu) при захвате нейтрона. Выделяется энергия ~200 МэВ и 2-3 нейтрона → цепная реакция. Основа работы АЭС и атомной бомбы.",
    example_problem: "Раздел в разработке",
    formulas: ["²³⁵U + n → осколки + 2-3n + E"]
  },
  "fusion": {
    id: "fusion",
    section: "atomic",
    subsection: "nuclear-reactions",
    title: "Термоядерный синтез",
    brief_info: "Синтез лёгких ядер (H, He) при высоких температурах. Источник энергии Солнца и звёзд. Условие: T > 10⁷ К. Перспективный источник энергии (токамак).",
    example_problem: "Раздел в разработке",
    formulas: ["²H + ³H → ⁴He + n + E"]
  },
  "nuclear-energy-use": {
    id: "nuclear-energy-use",
    section: "atomic",
    subsection: "nuclear-reactions",
    title: "Применение ядерной энергии",
    brief_info: "АЭС используют управляемую цепную реакцию. Преимущества: много энергии из малого количества топлива. Проблемы: радиоактивные отходы, безопасность.",
    example_problem: "Раздел в разработке",
    formulas: []
  }
};

// Данные формул для справочника
export interface Formula {
  id: string;
  section: string;
  name: string;
  formula: string;
  description: string;
  variables: Record<string, string>;
  unit: string;
}

export const FORMULAS_DATA: Formula[] = [
  // Механика
  { id: "f-1", section: "mechanics", name: "Скорость", formula: "v = S / t", description: "Скорость равна отношению пройденного пути ко времени", variables: { "v": "скорость (м/с)", "S": "путь (м)", "t": "время (с)" }, unit: "м/с" },
  { id: "f-2", section: "mechanics", name: "Ускорение", formula: "a = (v - v₀) / t", description: "Ускорение равно изменению скорости за единицу времени", variables: { "a": "ускорение (м/с²)", "v": "конечная скорость", "v₀": "начальная скорость", "t": "время" }, unit: "м/с²" },
  { id: "f-3", section: "mechanics", name: "Второй закон Ньютона", formula: "F = ma", description: "Сила равна произведению массы на ускорение", variables: { "F": "сила (Н)", "m": "масса (кг)", "a": "ускорение (м/с²)" }, unit: "Н" },
  { id: "f-4", section: "mechanics", name: "Сила тяжести", formula: "F = mg", description: "Сила тяжести равна произведению массы на ускорение свободного падения", variables: { "F": "сила (Н)", "m": "масса (кг)", "g": "ускорение свободного падения (≈10 м/с²)" }, unit: "Н" },
  { id: "f-5", section: "mechanics", name: "Импульс", formula: "p = mv", description: "Импульс равен произведению массы на скорость", variables: { "p": "импульс (кг·м/с)", "m": "масса (кг)", "v": "скорость (м/с)" }, unit: "кг·м/с" },
  { id: "f-6", section: "mechanics", name: "Кинетическая энергия", formula: "E = mv²/2", description: "Кинетическая энергия тела", variables: { "E": "энергия (Дж)", "m": "масса (кг)", "v": "скорость (м/с)" }, unit: "Дж" },
  { id: "f-7", section: "mechanics", name: "Потенциальная энергия", formula: "E = mgh", description: "Потенциальная энергия в поле тяжести", variables: { "E": "энергия (Дж)", "m": "масса (кг)", "g": "ускорение свободного падения", "h": "высота (м)" }, unit: "Дж" },
  { id: "f-8", section: "mechanics", name: "Работа", formula: "A = F·S·cosα", description: "Механическая работа", variables: { "A": "работа (Дж)", "F": "сила (Н)", "S": "перемещение (м)", "α": "угол" }, unit: "Дж" },
  { id: "f-9", section: "mechanics", name: "Период колебаний маятника", formula: "T = 2π√(l/g)", description: "Период математического маятника", variables: { "T": "период (с)", "l": "длина (м)", "g": "ускорение свободного падения" }, unit: "с" },
  { id: "f-10", section: "mechanics", name: "Центростремительное ускорение", formula: "a = v²/R", description: "Ускорение при движении по окружности", variables: { "a": "ускорение (м/с²)", "v": "скорость (м/с)", "R": "радиус (м)" }, unit: "м/с²" },
  
  // Термодинамика
  { id: "f-11", section: "thermodynamics", name: "Количество теплоты", formula: "Q = cmΔT", description: "Количество теплоты для нагревания", variables: { "Q": "теплота (Дж)", "c": "удельная теплоёмкость", "m": "масса (кг)", "ΔT": "изменение температуры (К)" }, unit: "Дж" },
  { id: "f-12", section: "thermodynamics", name: "Уравнение Менделеева-Клапейрона", formula: "pV = νRT", description: "Уравнение состояния идеального газа", variables: { "p": "давление (Па)", "V": "объём (м³)", "ν": "количество вещества (моль)", "R": "газовая постоянная", "T": "температура (К)" }, unit: "Дж" },
  { id: "f-13", section: "thermodynamics", name: "Средняя кинетическая энергия", formula: "E = (3/2)kT", description: "Средняя энергия молекулы", variables: { "E": "энергия (Дж)", "k": "постоянная Больцмана", "T": "температура (К)" }, unit: "Дж" },
  { id: "f-14", section: "thermodynamics", name: "Первый закон термодинамики", formula: "Q = ΔU + A", description: "Закон сохранения энергии для тепловых процессов", variables: { "Q": "теплота (Дж)", "ΔU": "изменение внутренней энергии", "A": "работа (Дж)" }, unit: "Дж" },
  { id: "f-15", section: "thermodynamics", name: "КПД теплового двигателя", formula: "η = (T₁-T₂)/T₁", description: "Максимальный КПД (цикл Карно)", variables: { "η": "КПД", "T₁": "температура нагревателя (К)", "T₂": "температура холодильника (К)" }, unit: "%" },
  { id: "f-16", section: "thermodynamics", name: "Теплота плавления", formula: "Q = λm", description: "Теплота для плавления", variables: { "Q": "теплота (Дж)", "λ": "удельная теплота плавления (Дж/кг)", "m": "масса (кг)" }, unit: "Дж" },
  { id: "f-17", section: "thermodynamics", name: "Теплота парообразования", formula: "Q = Lm", description: "Теплота для испарения", variables: { "Q": "теплота (Дж)", "L": "удельная теплота парообразования", "m": "масса (кг)" }, unit: "Дж" },
  
  // Электричество
  { id: "f-18", section: "electromagnetism", name: "Закон Кулона", formula: "F = k|q₁q₂|/r²", description: "Сила взаимодействия зарядов", variables: { "F": "сила (Н)", "k": "коэффициент (9×10⁹)", "q": "заряды (Кл)", "r": "расстояние (м)" }, unit: "Н" },
  { id: "f-19", section: "electromagnetism", name: "Напряжённость поля", formula: "E = F/q", description: "Напряжённость электрического поля", variables: { "E": "напряжённость (В/м)", "F": "сила (Н)", "q": "заряд (Кл)" }, unit: "В/м" },
  { id: "f-20", section: "electromagnetism", name: "Закон Ома", formula: "I = U/R", description: "Закон Ома для участка цепи", variables: { "I": "сила тока (А)", "U": "напряжение (В)", "R": "сопротивление (Ом)" }, unit: "А" },
  { id: "f-21", section: "electromagnetism", name: "Мощность тока", formula: "P = UI", description: "Мощность электрического тока", variables: { "P": "мощность (Вт)", "U": "напряжение (В)", "I": "сила тока (А)" }, unit: "Вт" },
  { id: "f-22", section: "electromagnetism", name: "Ёмкость конденсатора", formula: "C = q/U", description: "Электрическая ёмкость", variables: { "C": "ёмкость (Ф)", "q": "заряд (Кл)", "U": "напряжение (В)" }, unit: "Ф" },
  { id: "f-23", section: "electromagnetism", name: "Сила Ампера", formula: "F = BILsinα", description: "Сила, действующая на проводник с током", variables: { "F": "сила (Н)", "B": "индукция (Тл)", "I": "ток (А)", "L": "длина (м)" }, unit: "Н" },
  { id: "f-24", section: "electromagnetism", name: "Сила Лоренца", formula: "F = qvBsinα", description: "Сила, действующая на движущийся заряд", variables: { "F": "сила (Н)", "q": "заряд (Кл)", "v": "скорость (м/с)", "B": "индукция (Тл)" }, unit: "Н" },
  { id: "f-25", section: "electromagnetism", name: "ЭДС индукции", formula: "ε = -dФ/dt", description: "Закон электромагнитной индукции", variables: { "ε": "ЭДС (В)", "Ф": "магнитный поток (Вб)", "t": "время (с)" }, unit: "В" },
  { id: "f-26", section: "electromagnetism", name: "Энергия конденсатора", formula: "W = CU²/2", description: "Энергия заряженного конденсатора", variables: { "W": "энергия (Дж)", "C": "ёмкость (Ф)", "U": "напряжение (В)" }, unit: "Дж" },
  
  // Оптика
  { id: "f-27", section: "optics", name: "Закон отражения", formula: "α = β", description: "Угол падения равен углу отражения", variables: { "α": "угол падения", "β": "угол отражения" }, unit: "°" },
  { id: "f-28", section: "optics", name: "Закон преломления", formula: "n₁sinα = n₂sinβ", description: "Закон Снеллиуса", variables: { "n": "показатель преломления", "α": "угол падения", "β": "угол преломления" }, unit: "-" },
  { id: "f-29", section: "optics", name: "Формула линзы", formula: "1/F = 1/d + 1/f", description: "Формула тонкой линзы", variables: { "F": "фокусное расстояние (м)", "d": "расстояние до предмета", "f": "расстояние до изображения" }, unit: "м" },
  { id: "f-30", section: "optics", name: "Оптическая сила", formula: "D = 1/F", description: "Оптическая сила линзы", variables: { "D": "оптическая сила (дптр)", "F": "фокусное расстояние (м)" }, unit: "дптр" },
  { id: "f-31", section: "optics", name: "Дифракционная решётка", formula: "d·sinφ = kλ", description: "Условие максимумов дифракции", variables: { "d": "период решётки (м)", "φ": "угол дифракции", "k": "порядок", "λ": "длина волны (м)" }, unit: "м" },
  
  // Атомная физика
  { id: "f-32", section: "atomic", name: "Энергия фотона", formula: "E = hν", description: "Энергия кванта света", variables: { "E": "энергия (Дж)", "h": "постоянная Планка", "ν": "частота (Гц)" }, unit: "Дж" },
  { id: "f-33", section: "atomic", name: "Уравнение фотоэффекта", formula: "hν = A + mv²/2", description: "Уравнение Эйнштейна для фотоэффекта", variables: { "h": "постоянная Планка", "ν": "частота", "A": "работа выхода", "m": "масса электрона", "v": "скорость" }, unit: "Дж" },
  { id: "f-34", section: "atomic", name: "Длина волны де Бройля", formula: "λ = h/p", description: "Волна частицы", variables: { "λ": "длина волны (м)", "h": "постоянная Планка", "p": "импульс (кг·м/с)" }, unit: "м" },
  { id: "f-35", section: "atomic", name: "Энергия связи", formula: "E = Δm·c²", description: "Энергия связи ядра", variables: { "E": "энергия (Дж)", "Δm": "дефект массы (кг)", "c": "скорость света" }, unit: "Дж" },
  { id: "f-36", section: "atomic", name: "Закон радиоактивного распада", formula: "N = N₀·2^(-t/T)", description: "Число нераспавшихся ядер", variables: { "N": "число ядер", "N₀": "начальное число", "t": "время", "T": "период полураспада" }, unit: "-" },
  { id: "f-37", section: "atomic", name: "Формула Эйнштейна", formula: "E = mc²", description: "Эквивалентность массы и энергии", variables: { "E": "энергия (Дж)", "m": "масса (кг)", "c": "скорость света (3×10⁸ м/с)" }, unit: "Дж" },
];

// Функция получения формулы по ID
export function getFormulaById(formulaId: string): Formula | null {
  return FORMULAS_DATA.find(f => f.id === formulaId) || null;
}

// Данные задач
export interface Task {
  id: string;
  section: string;
  title: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const TASKS_DATA: Task[] = [
  // Механика
  { id: "task-1", section: "mechanics", title: "Скорость поезда", question: "Поезд прошёл 180 км за 2 часа. Какова средняя скорость поезда?", options: ["60 км/ч", "90 км/ч", "120 км/ч", "45 км/ч"], correct_answer: 1, explanation: "v = S/t = 180/2 = 90 км/ч", difficulty: "easy" },
  { id: "task-2", section: "mechanics", title: "Ускорение автомобиля", question: "Автомобиль разгоняется от 0 до 72 км/ч за 8 секунд. Найдите ускорение.", options: ["2,5 м/с²", "9 м/с²", "1,5 м/с²", "5 м/с²"], correct_answer: 0, explanation: "72 км/ч = 20 м/с. a = v/t = 20/8 = 2,5 м/с²", difficulty: "easy" },
  { id: "task-3", section: "mechanics", title: "Сила тяжести", question: "Какова сила тяжести, действующая на тело массой 5 кг?", options: ["5 Н", "50 Н", "0,5 Н", "500 Н"], correct_answer: 1, explanation: "F = mg = 5 × 10 = 50 Н", difficulty: "easy" },
  { id: "task-4", section: "mechanics", title: "Кинетическая энергия", question: "Найдите кинетическую энергию тела массой 2 кг, движущегося со скоростью 10 м/с.", options: ["20 Дж", "100 Дж", "200 Дж", "50 Дж"], correct_answer: 1, explanation: "E = mv²/2 = 2 × 100 / 2 = 100 Дж", difficulty: "medium" },
  { id: "task-5", section: "mechanics", title: "Потенциальная энергия", question: "Тело массой 4 кг поднято на высоту 5 м. Найдите его потенциальную энергию.", options: ["20 Дж", "200 Дж", "100 Дж", "400 Дж"], correct_answer: 1, explanation: "E = mgh = 4 × 10 × 5 = 200 Дж", difficulty: "easy" },
  { id: "task-6", section: "mechanics", title: "Импульс", question: "Чему равен импульс тела массой 3 кг, движущегося со скоростью 4 м/с?", options: ["7 кг·м/с", "12 кг·м/с", "1,3 кг·м/с", "0,75 кг·м/с"], correct_answer: 1, explanation: "p = mv = 3 × 4 = 12 кг·м/с", difficulty: "easy" },
  
  // Термодинамика
  { id: "task-7", section: "thermodynamics", title: "Количество теплоты", question: "Сколько теплоты нужно для нагревания 2 кг воды на 25°C? (c = 4200 Дж/кг·°C)", options: ["210 кДж", "105 кДж", "420 кДж", "52,5 кДж"], correct_answer: 0, explanation: "Q = cmΔT = 4200 × 2 × 25 = 210000 Дж = 210 кДж", difficulty: "medium" },
  { id: "task-8", section: "thermodynamics", title: "Идеальный газ", question: "При изотермическом сжатии объём газа уменьшился в 2 раза. Как изменилось давление?", options: ["Уменьшилось в 2 раза", "Увеличилось в 2 раза", "Не изменилось", "Увеличилось в 4 раза"], correct_answer: 1, explanation: "По закону Бойля-Мариотта pV = const, значит при уменьшении V в 2 раза, p увеличится в 2 раза", difficulty: "medium" },
  { id: "task-9", section: "thermodynamics", title: "КПД теплового двигателя", question: "Температура нагревателя 400 К, холодильника 300 К. Найти максимальный КПД.", options: ["75%", "25%", "50%", "33%"], correct_answer: 1, explanation: "η = (T₁-T₂)/T₁ = (400-300)/400 = 0,25 = 25%", difficulty: "medium" },
  { id: "task-10", section: "thermodynamics", title: "Температура в Кельвинах", question: "Чему равна температура 27°C по шкале Кельвина?", options: ["300 К", "246 К", "273 К", "27 К"], correct_answer: 0, explanation: "T = t + 273 = 27 + 273 = 300 К", difficulty: "easy" },
  
  // Электричество
  { id: "task-11", section: "electromagnetism", title: "Закон Ома", question: "Сила тока в цепи 2 А, сопротивление 10 Ом. Найдите напряжение.", options: ["5 В", "20 В", "0,2 В", "12 В"], correct_answer: 1, explanation: "U = IR = 2 × 10 = 20 В", difficulty: "easy" },
  { id: "task-12", section: "electromagnetism", title: "Мощность тока", question: "Какова мощность тока при напряжении 220 В и силе тока 5 А?", options: ["44 Вт", "1100 Вт", "225 Вт", "45 Вт"], correct_answer: 1, explanation: "P = UI = 220 × 5 = 1100 Вт", difficulty: "easy" },
  { id: "task-13", section: "electromagnetism", title: "Сопротивление проводников", question: "Два резистора по 6 Ом соединены параллельно. Чему равно общее сопротивление?", options: ["12 Ом", "3 Ом", "6 Ом", "0,33 Ом"], correct_answer: 1, explanation: "1/R = 1/6 + 1/6 = 1/3, R = 3 Ом", difficulty: "medium" },
  { id: "task-14", section: "electromagnetism", title: "Закон Кулона", question: "Как изменится сила взаимодействия двух зарядов, если расстояние между ними увеличить в 3 раза?", options: ["Уменьшится в 3 раза", "Уменьшится в 9 раз", "Увеличится в 9 раз", "Не изменится"], correct_answer: 1, explanation: "F ~ 1/r², при увеличении r в 3 раза, F уменьшится в 9 раз", difficulty: "medium" },
  
  // Оптика
  { id: "task-15", section: "optics", title: "Скорость света в воде", question: "Найдите скорость света в воде, если показатель преломления n = 1,33.", options: ["2,26×10⁸ м/с", "4×10⁸ м/с", "3×10⁸ м/с", "1,5×10⁸ м/с"], correct_answer: 0, explanation: "v = c/n = 3×10⁸/1,33 ≈ 2,26×10⁸ м/с", difficulty: "medium" },
  { id: "task-16", section: "optics", title: "Оптическая сила линзы", question: "Фокусное расстояние линзы 25 см. Найдите оптическую силу.", options: ["25 дптр", "0,04 дптр", "4 дптр", "2,5 дптр"], correct_answer: 2, explanation: "D = 1/F = 1/0,25 = 4 дптр", difficulty: "easy" },
  { id: "task-17", section: "optics", title: "Закон отражения", question: "Угол падения луча на плоское зеркало равен 30°. Чему равен угол между падающим и отражённым лучами?", options: ["30°", "60°", "90°", "15°"], correct_answer: 1, explanation: "Угол падения = угол отражения = 30°. Угол между лучами = 30° + 30° = 60°", difficulty: "easy" },
  
  // Атомная физика
  { id: "task-18", section: "atomic", title: "Энергия фотона", question: "Найдите энергию фотона с частотой 5×10¹⁴ Гц (h = 6,6×10⁻³⁴ Дж·с)", options: ["3,3×10⁻¹⁹ Дж", "3,3×10⁻²⁰ Дж", "7,5×10⁻⁴⁸ Дж", "1,3×10⁻¹⁹ Дж"], correct_answer: 0, explanation: "E = hν = 6,6×10⁻³⁴ × 5×10¹⁴ = 3,3×10⁻¹⁹ Дж", difficulty: "medium" },
  { id: "task-19", section: "atomic", title: "Период полураспада", question: "Период полураспада изотопа 8 суток. Какая часть останется через 24 суток?", options: ["1/2", "1/4", "1/8", "1/3"], correct_answer: 2, explanation: "24/8 = 3 периода. Осталось 1/2³ = 1/8", difficulty: "medium" },
  { id: "task-20", section: "atomic", title: "Строение ядра", question: "Сколько нейтронов в ядре ¹⁴N (азот, Z=7)?", options: ["7", "14", "21", "0"], correct_answer: 0, explanation: "N = A - Z = 14 - 7 = 7 нейтронов", difficulty: "easy" },
];

// Функция получения задач по разделу
export function getTasksBySection(sectionId: string): Task[] {
  return TASKS_DATA.filter(t => t.section === sectionId);
}

// Данные тестов
export interface TestQuestion {
  question: string;
  options: string[];
  correct: number;
}

export type TestDifficulty = 'basic' | 'standard' | 'advanced' | 'olympiad';

export interface Test {
  id: string;
  section: string;
  title: string;
  difficulty: TestDifficulty;
  questions: TestQuestion[];
  time_limit: number;
}

export const TESTS_DATA: Test[] = [
  // ==================== МЕХАНИКА ====================
  // Базовые (3)
  {
    id: "mech-basic-1",
    section: "mechanics",
    title: "Основы кинематики",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Что такое скорость?", options: ["Путь, пройденный за единицу времени", "Изменение скорости", "Сила на массу", "Энергия движения"], correct: 0 },
      { question: "Единица скорости в СИ?", options: ["км/ч", "м/с", "м/мин", "см/с"], correct: 1 },
      { question: "Формула пути при равномерном движении?", options: ["S = v/t", "S = vt", "S = at²", "S = v²/a"], correct: 1 },
      { question: "При свободном падении g ≈ ?", options: ["1 м/с²", "10 м/с²", "100 м/с²", "5 м/с²"], correct: 1 },
      { question: "Что такое траектория?", options: ["Длина пути", "Линия движения тела", "Скорость тела", "Время движения"], correct: 1 },
    ]
  },
  {
    id: "mech-basic-2",
    section: "mechanics",
    title: "Силы в природе",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Единица силы в СИ?", options: ["кг", "Ньютон", "Джоуль", "Паскаль"], correct: 1 },
      { question: "Сила тяжести направлена:", options: ["Вверх", "Вниз", "Горизонтально", "По движению"], correct: 1 },
      { question: "Формула силы тяжести?", options: ["F = ma", "F = mg", "F = mv", "F = m/g"], correct: 1 },
      { question: "Сила упругости возникает при:", options: ["Нагревании", "Деформации", "Охлаждении", "Покое"], correct: 1 },
      { question: "Сила трения препятствует:", options: ["Нагреванию", "Движению", "Деформации", "Вращению"], correct: 1 },
    ]
  },
  {
    id: "mech-basic-3",
    section: "mechanics",
    title: "Энергия и работа",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Единица энергии в СИ?", options: ["Ватт", "Ньютон", "Джоуль", "Паскаль"], correct: 2 },
      { question: "Кинетическая энергия — это энергия:", options: ["Положения", "Движения", "Взаимодействия", "Тепловая"], correct: 1 },
      { question: "Работа измеряется в:", options: ["Ваттах", "Джоулях", "Ньютонах", "Метрах"], correct: 1 },
      { question: "Формула кинетической энергии?", options: ["E = mgh", "E = mv²/2", "E = Fs", "E = pt"], correct: 1 },
      { question: "Потенциальная энергия зависит от:", options: ["Скорости", "Высоты", "Времени", "Ускорения"], correct: 1 },
    ]
  },
  // Стандартные (2)
  {
    id: "mech-standard-1",
    section: "mechanics",
    title: "Законы Ньютона",
    difficulty: "standard",
    time_limit: 420,
    questions: [
      { question: "Первый закон Ньютона описывает:", options: ["Инерцию тела", "Ускорение тела", "Действие и противодействие", "Энергию системы"], correct: 0 },
      { question: "Второй закон Ньютона: F = ?", options: ["mv", "mgh", "ma", "mv²/2"], correct: 2 },
      { question: "По третьему закону Ньютона F₁ и F₂:", options: ["Равны и сонаправлены", "Равны и противоположны", "Не равны", "Перпендикулярны"], correct: 1 },
      { question: "Тело массой 2 кг движется с ускорением 3 м/с². Сила равна:", options: ["1,5 Н", "5 Н", "6 Н", "0,67 Н"], correct: 2 },
      { question: "На тело действуют силы 5 Н и 3 Н в противоположные стороны. Равнодействующая:", options: ["8 Н", "2 Н", "15 Н", "1,67 Н"], correct: 1 },
      { question: "Инертность тела определяется его:", options: ["Скоростью", "Массой", "Объёмом", "Плотностью"], correct: 1 },
      { question: "Коэффициент трения — величина:", options: ["Всегда > 1", "Всегда < 1", "Безразмерная", "Имеет размерность Н"], correct: 2 },
    ]
  },
  {
    id: "mech-standard-2",
    section: "mechanics",
    title: "Импульс и законы сохранения",
    difficulty: "standard",
    time_limit: 420,
    questions: [
      { question: "Формула импульса тела?", options: ["p = mv", "p = ma", "p = Ft", "p = mgh"], correct: 0 },
      { question: "Единица импульса в СИ?", options: ["Н·с", "кг·м/с", "Оба варианта верны", "Дж/с"], correct: 2 },
      { question: "Закон сохранения импульса выполняется в:", options: ["Любой системе", "Замкнутой системе", "Открытой системе", "Только в покое"], correct: 1 },
      { question: "Импульс силы равен:", options: ["ma", "FΔt", "mv²", "mgh"], correct: 1 },
      { question: "Два тела после неупругого столкновения:", options: ["Разлетаются", "Движутся вместе", "Останавливаются", "Меняют массу"], correct: 1 },
      { question: "Шар массой 2 кг со скоростью 3 м/с имеет импульс:", options: ["1,5 кг·м/с", "5 кг·м/с", "6 кг·м/с", "9 кг·м/с"], correct: 2 },
      { question: "Реактивное движение основано на законе сохранения:", options: ["Энергии", "Импульса", "Массы", "Заряда"], correct: 1 },
    ]
  },
  // Продвинутые (2)
  {
    id: "mech-advanced-1",
    section: "mechanics",
    title: "Динамика сложных систем",
    difficulty: "advanced",
    time_limit: 600,
    questions: [
      { question: "Тело массой 5 кг на наклонной плоскости (угол 30°, μ=0,2). Ускорение скольжения:", options: ["≈3,3 м/с²", "≈5 м/с²", "≈1,7 м/с²", "≈2,5 м/с²"], correct: 0 },
      { question: "Груз на нити отклонили на 60° и отпустили. Скорость в нижней точке (l=1м):", options: ["√10 м/с", "√5 м/с", "√20 м/с", "10 м/с"], correct: 0 },
      { question: "Два тела связаны нитью через блок (m₁=3кг, m₂=2кг). Ускорение системы:", options: ["2 м/с²", "5 м/с²", "1 м/с²", "10 м/с²"], correct: 0 },
      { question: "Центростремительное ускорение при v=10 м/с и R=5м:", options: ["2 м/с²", "20 м/с²", "50 м/с²", "0,5 м/с²"], correct: 1 },
      { question: "Спутник на орбите h=R_земли. Первая космическая скорость:", options: ["≈5,6 км/с", "≈7,9 км/с", "≈11,2 км/с", "≈3,1 км/с"], correct: 0 },
      { question: "Момент инерции диска относительно оси:", options: ["MR²", "MR²/2", "2MR²/5", "MR²/4"], correct: 1 },
      { question: "Тело брошено под углом 45°. Дальность полёта максимальна при:", options: ["v₀ = max", "g = min", "Угол 45°", "Все ответы верны"], correct: 3 },
      { question: "Работа силы трения при движении по замкнутому пути:", options: ["= 0", "≠ 0", "Зависит от формы", "Всегда положительна"], correct: 1 },
    ]
  },
  {
    id: "mech-advanced-2",
    section: "mechanics",
    title: "Колебания и волны",
    difficulty: "advanced",
    time_limit: 600,
    questions: [
      { question: "Период математического маятника l=1м:", options: ["≈1 с", "≈2 с", "≈0,5 с", "≈3 с"], correct: 1 },
      { question: "Период пружинного маятника зависит от:", options: ["Амплитуды", "m и k", "Только k", "Только m"], correct: 1 },
      { question: "При резонансе частота вынуждающей силы:", options: ["= 0", "= собственной частоте", "> собственной", "< собственной"], correct: 1 },
      { question: "Длина волны λ при v=340 м/с и ν=170 Гц:", options: ["1 м", "2 м", "0,5 м", "4 м"], correct: 1 },
      { question: "Звук в воде распространяется:", options: ["Медленнее, чем в воздухе", "Быстрее, чем в воздухе", "С той же скоростью", "Не распространяется"], correct: 1 },
      { question: "Амплитуда затухающих колебаний:", options: ["Постоянна", "Растёт", "Убывает", "Колеблется"], correct: 2 },
      { question: "Стоячая волна образуется при:", options: ["Отражении волны", "Преломлении", "Дифракции", "Дисперсии"], correct: 0 },
      { question: "Уравнение гармонических колебаний:", options: ["x = A·sin(ωt)", "x = A·t²", "x = v·t", "x = A/t"], correct: 0 },
    ]
  },
  // Олимпиадные (3)
  {
    id: "mech-olympiad-1",
    section: "mechanics",
    title: "Олимпиадная механика I",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Шар скатывается с наклонной плоскости без проскальзывания. Какая доля энергии приходится на вращение?", options: ["1/7", "2/7", "2/5", "1/3"], correct: 1 },
      { question: "Клин массой M может двигаться по горизонтали без трения. С него соскальзывает тело m. Ускорение клина:", options: ["mg·sinα·cosα/(M+m·sin²α)", "mg·sinα/(M+m)", "g·sinα", "0"], correct: 0 },
      { question: "Цилиндр катится по горизонтали со скоростью v. Скорость верхней точки:", options: ["v", "2v", "0", "v√2"], correct: 1 },
      { question: "Тело на экваторе весит меньше, чем на полюсе из-за:", options: ["Сплюснутости Земли", "Вращения Земли", "Обоих факторов", "Атмосферного давления"], correct: 2 },
      { question: "Два спутника на круговых орбитах R и 4R. Отношение периодов T₂/T₁:", options: ["2", "4", "8", "16"], correct: 2 },
      { question: "Стержень длиной L вращается вокруг конца. Момент инерции:", options: ["ML²/3", "ML²/12", "ML²/2", "ML²"], correct: 0 },
      { question: "Абсолютно упругий удар двух одинаковых шаров приводит к:", options: ["Обмену скоростями", "Остановке обоих", "Движению вместе", "Разлёту под 90°"], correct: 0 },
      { question: "Гироскоп сохраняет направление оси из-за:", options: ["Трения", "Момента импульса", "Центробежной силы", "Силы тяжести"], correct: 1 },
      { question: "Эффект Кориолиса связан с:", options: ["Гравитацией", "Вращением системы отсчёта", "Трением", "Упругостью"], correct: 1 },
      { question: "Точка подвеса физического маятника, дающая минимальный период:", options: ["Центр масс", "Центр качаний", "Любая точка", "Не существует"], correct: 1 },
    ]
  },
  {
    id: "mech-olympiad-2",
    section: "mechanics",
    title: "Олимпиадная механика II",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Космонавт в открытом космосе бросает предмет. Что произойдёт?", options: ["Оба полетят в разные стороны", "Предмет улетит, космонавт останется", "Ничего", "Оба полетят в одну сторону"], correct: 0 },
      { question: "Тело брошено вертикально вверх. В верхней точке ускорение:", options: ["0", "g вниз", "g вверх", "Зависит от массы"], correct: 1 },
      { question: "Лифт падает с ускорением g/2. Вес тела массой m:", options: ["mg", "mg/2", "2mg", "0"], correct: 1 },
      { question: "Второй закон Ньютона в релятивистском случае:", options: ["F = ma", "F = dp/dt", "F = mv", "Не работает"], correct: 1 },
      { question: "Конькобежец, вращаясь, прижимает руки. Угловая скорость:", options: ["Уменьшится", "Увеличится", "Не изменится", "Станет нулевой"], correct: 1 },
      { question: "Маятник Фуко доказывает:", options: ["Шарообразность Земли", "Вращение Земли", "Закон тяготения", "Закон сохранения энергии"], correct: 1 },
      { question: "Приливы на Земле вызваны:", options: ["Вращением Земли", "Притяжением Луны", "Солнечным ветром", "Атмосферным давлением"], correct: 1 },
      { question: "При торможении машины пассажир наклоняется вперёд из-за:", options: ["Силы трения", "Инерции", "Силы тяжести", "Центробежной силы"], correct: 1 },
      { question: "Невесомость в МКС объясняется:", options: ["Отсутствием гравитации", "Свободным падением", "Большой высотой", "Вакуумом"], correct: 1 },
      { question: "Парадокс близнецов связан с:", options: ["Гравитацией", "Относительностью времени", "Квантовой механикой", "Термодинамикой"], correct: 1 },
    ]
  },
  {
    id: "mech-olympiad-3",
    section: "mechanics",
    title: "Олимпиадная механика III",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Теорема Штейнера связывает:", options: ["Момент импульса", "Моменты инерции относительно разных осей", "Энергию и работу", "Силу и ускорение"], correct: 1 },
      { question: "Принцип Даламбера вводит:", options: ["Силу инерции", "Силу тяжести", "Силу трения", "Упругую силу"], correct: 0 },
      { question: "Уравнения Лагранжа используют:", options: ["Декартовы координаты", "Обобщённые координаты", "Полярные координаты", "Только время"], correct: 1 },
      { question: "Связь между L и ω для твёрдого тела:", options: ["L = mω", "L = Iω", "L = ω/I", "L = I/ω"], correct: 1 },
      { question: "Частица в потенциальной яме U = kx². Движение:", options: ["Равномерное", "Гармоническое", "Равноускоренное", "Хаотическое"], correct: 1 },
      { question: "Орбита спутника — эллипс по:", options: ["Закону Гука", "Законам Кеплера", "Закону Архимеда", "Закону Паскаля"], correct: 1 },
      { question: "При упругом ударе сохраняется:", options: ["Только импульс", "Только энергия", "Импульс и кинетическая энергия", "Ничего"], correct: 2 },
      { question: "Фазовый портрет осциллятора — это:", options: ["Прямая", "Эллипс", "Парабола", "Гипербола"], correct: 1 },
      { question: "Точка Лагранжа L1 находится:", options: ["Между телами", "За малым телом", "За большим телом", "Перпендикулярно орбите"], correct: 0 },
      { question: "Число степеней свободы молекулы CO₂:", options: ["3", "5", "6", "9"], correct: 1 },
    ]
  },

  // ==================== ТЕРМОДИНАМИКА ====================
  // Базовые (3)
  {
    id: "therm-basic-1",
    section: "thermodynamics",
    title: "Температура и теплота",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Абсолютный ноль равен:", options: ["-273°C", "0°C", "273°C", "-100°C"], correct: 0 },
      { question: "Единица температуры в СИ?", options: ["Градус Цельсия", "Кельвин", "Фаренгейт", "Джоуль"], correct: 1 },
      { question: "Теплота передаётся от:", options: ["Холодного к горячему", "Горячего к холодному", "В любом направлении", "Не передаётся"], correct: 1 },
      { question: "Формула T(K) = ?", options: ["t - 273", "t + 273", "t × 273", "t / 273"], correct: 1 },
      { question: "27°C = ? К", options: ["300 К", "246 К", "27 К", "273 К"], correct: 0 },
    ]
  },
  {
    id: "therm-basic-2",
    section: "thermodynamics",
    title: "Агрегатные состояния",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "При плавлении температура:", options: ["Растёт", "Падает", "Постоянна", "Колеблется"], correct: 2 },
      { question: "Испарение происходит:", options: ["Только при кипении", "При любой температуре", "Только при 100°C", "Только в вакууме"], correct: 1 },
      { question: "При конденсации теплота:", options: ["Поглощается", "Выделяется", "Не изменяется", "Исчезает"], correct: 1 },
      { question: "Сублимация — это переход:", options: ["Твёрдое → жидкость", "Жидкость → газ", "Твёрдое → газ", "Газ → жидкость"], correct: 2 },
      { question: "Температура кипения воды при 1 атм:", options: ["0°C", "50°C", "100°C", "273°C"], correct: 2 },
    ]
  },
  {
    id: "therm-basic-3",
    section: "thermodynamics",
    title: "Тепловые явления",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Теплопроводность лучше у:", options: ["Дерева", "Металла", "Воздуха", "Пластика"], correct: 1 },
      { question: "Конвекция возможна в:", options: ["Твёрдых телах", "Жидкостях и газах", "Только в газах", "В вакууме"], correct: 1 },
      { question: "Излучение распространяется:", options: ["Только в веществе", "Только в вакууме", "В веществе и вакууме", "Не распространяется"], correct: 2 },
      { question: "Удельная теплоёмкость воды:", options: ["420 Дж/кг·К", "4200 Дж/кг·К", "42000 Дж/кг·К", "42 Дж/кг·К"], correct: 1 },
      { question: "Формула количества теплоты:", options: ["Q = mv²", "Q = cmΔT", "Q = mgh", "Q = Fs"], correct: 1 },
    ]
  },
  // Стандартные (2)
  {
    id: "therm-standard-1",
    section: "thermodynamics",
    title: "Газовые законы",
    difficulty: "standard",
    time_limit: 420,
    questions: [
      { question: "Уравнение Менделеева-Клапейрона:", options: ["pV = νRT", "pV = const", "p/T = const", "V/T = const"], correct: 0 },
      { question: "При изотермическом процессе:", options: ["T = const", "p = const", "V = const", "Q = 0"], correct: 0 },
      { question: "Закон Бойля-Мариотта:", options: ["pV = const (T = const)", "p/T = const", "V/T = const", "pT = const"], correct: 0 },
      { question: "При изобарном нагревании объём:", options: ["Уменьшается", "Увеличивается", "Не меняется", "Сначала растёт, потом падает"], correct: 1 },
      { question: "R (газовая постоянная) ≈", options: ["8,31 Дж/(моль·К)", "6,02×10²³", "1,38×10⁻²³ Дж/К", "3×10⁸ м/с"], correct: 0 },
      { question: "При изохорном нагревании давление:", options: ["Падает", "Растёт", "Не меняется", "Осциллирует"], correct: 1 },
      { question: "Адиабатный процесс — это процесс без:", options: ["Работы", "Теплообмена", "Изменения T", "Изменения p"], correct: 1 },
    ]
  },
  {
    id: "therm-standard-2",
    section: "thermodynamics",
    title: "Законы термодинамики",
    difficulty: "standard",
    time_limit: 420,
    questions: [
      { question: "Первый закон термодинамики:", options: ["Q = ΔU + A", "ΔS ≥ 0", "pV = νRT", "E = mc²"], correct: 0 },
      { question: "Второй закон запрещает:", options: ["Нагревание", "Вечный двигатель 2-го рода", "Теплопередачу", "Работу"], correct: 1 },
      { question: "КПД идеальной тепловой машины:", options: ["η = 1", "η = (T₁-T₂)/T₁", "η = T₂/T₁", "η = A/Q₂"], correct: 1 },
      { question: "Внутренняя энергия идеального газа зависит от:", options: ["Только V", "Только p", "Только T", "p и V"], correct: 2 },
      { question: "При адиабатном расширении газ:", options: ["Нагревается", "Охлаждается", "Не меняет T", "Конденсируется"], correct: 1 },
      { question: "Энтропия изолированной системы:", options: ["Убывает", "Возрастает или постоянна", "Всегда постоянна", "Колеблется"], correct: 1 },
      { question: "Цикл Карно состоит из:", options: ["2 изотерм и 2 адиабат", "4 изобар", "4 изохор", "2 изобар и 2 изохор"], correct: 0 },
    ]
  },
  // Продвинутые (2)
  {
    id: "therm-advanced-1",
    section: "thermodynamics",
    title: "МКТ и статистика",
    difficulty: "advanced",
    time_limit: 600,
    questions: [
      { question: "Средняя кинетическая энергия молекулы:", options: ["E = kT", "E = 3kT/2", "E = kT/2", "E = 2kT"], correct: 1 },
      { question: "Число Авогадро N_A ≈", options: ["6,02×10²³ моль⁻¹", "1,38×10⁻²³ Дж/К", "8,31 Дж/(моль·К)", "3×10⁸ м/с"], correct: 0 },
      { question: "Среднеквадратичная скорость молекул:", options: ["v = √(3kT/m)", "v = √(2kT/m)", "v = kT/m", "v = 3kT/m"], correct: 0 },
      { question: "Давление идеального газа p = ?", options: ["nkT", "nm<v²>/3", "Оба варианта верны", "NkT/V"], correct: 2 },
      { question: "Степени свободы двухатомного газа:", options: ["3", "5", "6", "7"], correct: 1 },
      { question: "Внутренняя энергия моля одноатомного газа:", options: ["3RT/2", "5RT/2", "RT", "7RT/2"], correct: 0 },
      { question: "Распределение Максвелла описывает:", options: ["Энергию", "Скорости молекул", "Давление", "Температуру"], correct: 1 },
      { question: "Средняя длина свободного пробега зависит от:", options: ["T и p", "Только p", "Только T", "m молекулы"], correct: 0 },
    ]
  },
  {
    id: "therm-advanced-2",
    section: "thermodynamics",
    title: "Реальные газы и фазовые переходы",
    difficulty: "advanced",
    time_limit: 600,
    questions: [
      { question: "Уравнение Ван-дер-Ваальса учитывает:", options: ["Объём молекул и взаимодействие", "Только объём", "Только взаимодействие", "Квантовые эффекты"], correct: 0 },
      { question: "Критическая точка — это точка, где:", options: ["Лёд тает", "Исчезает граница жидкость-газ", "Вода кипит", "Газ сжижается"], correct: 1 },
      { question: "Тройная точка воды:", options: ["0°C, 1 атм", "100°C, 1 атм", "0,01°C, 611 Па", "273 K, 0 Па"], correct: 2 },
      { question: "Теплота парообразования воды ≈", options: ["330 кДж/кг", "2260 кДж/кг", "4200 кДж/кг", "80 кДж/кг"], correct: 1 },
      { question: "При сжатии газа выше критической температуры:", options: ["Образуется жидкость", "Жидкость не образуется", "Образуется твёрдое тело", "Происходит взрыв"], correct: 1 },
      { question: "Насыщенный пар — это пар в:", options: ["Вакууме", "Равновесии с жидкостью", "Перегретом состоянии", "Переохлаждённом состоянии"], correct: 1 },
      { question: "Влажность воздуха измеряется:", options: ["Термометром", "Психрометром", "Барометром", "Манометром"], correct: 1 },
      { question: "Эффект Джоуля-Томсона — это:", options: ["Нагревание при сжатии", "Охлаждение при расширении через пористую перегородку", "Кипение", "Конденсация"], correct: 1 },
    ]
  },
  // Олимпиадные (3)
  {
    id: "therm-olympiad-1",
    section: "thermodynamics",
    title: "Олимпиадная термодинамика I",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Теплоёмкость при постоянном давлении C_p и при постоянном объёме C_v связаны:", options: ["C_p = C_v", "C_p > C_v", "C_p < C_v", "Не связаны"], correct: 1 },
      { question: "Для идеального газа C_p - C_v = ?", options: ["R", "R/2", "2R", "0"], correct: 0 },
      { question: "Показатель адиабаты γ = ?", options: ["C_v/C_p", "C_p/C_v", "C_p + C_v", "C_p - C_v"], correct: 1 },
      { question: "При адиабатном процессе TV^(γ-1) = ?", options: ["const", "T", "V", "p"], correct: 0 },
      { question: "Работа газа в изобарном процессе:", options: ["p(V₂-V₁)", "νRΔT", "Оба ответа верны", "pV"], correct: 2 },
      { question: "Политропный процесс — это процесс с:", options: ["Постоянной теплоёмкостью", "Постоянной T", "Постоянным p", "Постоянным V"], correct: 0 },
      { question: "Энтропия S = ?", options: ["Q/T", "∫dQ/T", "kln(W)", "Все ответы связаны"], correct: 3 },
      { question: "Третий закон термодинамики:", options: ["При T→0 S→0", "ΔS ≥ 0", "Q = ΔU + A", "pV = νRT"], correct: 0 },
      { question: "Свободная энергия Гельмгольца F = ?", options: ["U - TS", "U + pV", "H - TS", "U + TS"], correct: 0 },
      { question: "Энтальпия H = ?", options: ["U - pV", "U + pV", "U - TS", "U + TS"], correct: 1 },
    ]
  },
  {
    id: "therm-olympiad-2",
    section: "thermodynamics",
    title: "Олимпиадная термодинамика II",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Теплопроводность газа при низких давлениях:", options: ["Растёт с p", "Не зависит от p", "Падает с p", "Пропорциональна p²"], correct: 1 },
      { question: "Вязкость газа при нагревании:", options: ["Растёт", "Падает", "Не меняется", "Осциллирует"], correct: 0 },
      { question: "Диффузия — перенос:", options: ["Теплоты", "Массы", "Импульса", "Заряда"], correct: 1 },
      { question: "Число Кнудсена характеризует:", options: ["Турбулентность", "Разреженность газа", "Теплопроводность", "Вязкость"], correct: 1 },
      { question: "Броуновское движение доказывает:", options: ["Существование атомов", "Закон сохранения энергии", "Второй закон термодинамики", "Уравнение состояния"], correct: 0 },
      { question: "Флуктуации величины X ~ ?", options: ["√N", "N", "N²", "1/N"], correct: 0 },
      { question: "Статистический вес системы W — это:", options: ["Число микросостояний", "Энергия", "Энтропия", "Температура"], correct: 0 },
      { question: "Распределение Больцмана: n ~ exp(?)", options: ["-E/kT", "E/kT", "-kT/E", "kT/E"], correct: 0 },
      { question: "Теплоёмкость твёрдого тела при T→0:", options: ["Постоянна", "Стремится к 0", "Стремится к ∞", "Осциллирует"], correct: 1 },
      { question: "Закон Дюлонга-Пти:", options: ["C ≈ 3R для моля", "C = 0 при T = 0", "C ~ T³", "C ~ T"], correct: 0 },
    ]
  },
  {
    id: "therm-olympiad-3",
    section: "thermodynamics",
    title: "Олимпиадная термодинамика III",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Излучение абсолютно чёрного тела описывается:", options: ["Законом Стефана-Больцмана", "Формулой Планка", "Законом Вина", "Всеми перечисленными"], correct: 3 },
      { question: "Закон Стефана-Больцмана: P ~ ?", options: ["T", "T²", "T³", "T⁴"], correct: 3 },
      { question: "Закон смещения Вина: λ_max ~ ?", options: ["T", "1/T", "T²", "√T"], correct: 1 },
      { question: "Ультрафиолетовая катастрофа связана с:", options: ["Классической теорией излучения", "Квантовой механикой", "Термодинамикой", "Кинетической теорией"], correct: 0 },
      { question: "Фонон — это квант:", options: ["Света", "Колебаний решётки", "Электрического поля", "Магнитного поля"], correct: 1 },
      { question: "Бозе-газ при T→0:", options: ["Конденсируется", "Расширяется", "Нагревается", "Кристаллизуется"], correct: 0 },
      { question: "Ферми-газ характеризуется:", options: ["Принципом Паули", "Бозе-конденсацией", "Классическим распределением", "Распределением Максвелла"], correct: 0 },
      { question: "Сверхтекучесть гелия-4 — это проявление:", options: ["Бозе-конденсации", "Сверхпроводимости", "Ферми-жидкости", "Классической механики"], correct: 0 },
      { question: "Давление фотонного газа p = ?", options: ["u/3", "u", "3u", "u/2"], correct: 0 },
      { question: "Отрицательная абсолютная температура возможна в:", options: ["Равновесных системах", "Системах с инверсией населённостей", "Невозможна в принципе", "Любых системах"], correct: 1 },
    ]
  },

  // ==================== ЭЛЕКТРОМАГНЕТИЗМ ====================
  // Базовые (3)
  {
    id: "em-basic-1",
    section: "electromagnetism",
    title: "Электрический заряд",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Единица заряда в СИ:", options: ["Ампер", "Вольт", "Кулон", "Ом"], correct: 2 },
      { question: "Одноимённые заряды:", options: ["Притягиваются", "Отталкиваются", "Не взаимодействуют", "Нейтрализуются"], correct: 1 },
      { question: "Заряд электрона:", options: ["+1,6×10⁻¹⁹ Кл", "-1,6×10⁻¹⁹ Кл", "0", "1 Кл"], correct: 1 },
      { question: "Закон сохранения заряда гласит:", options: ["Заряд создаётся", "Заряд исчезает", "Заряд сохраняется", "Заряд меняется"], correct: 2 },
      { question: "Проводники отличаются от диэлектриков:", options: ["Массой", "Наличием свободных зарядов", "Цветом", "Формой"], correct: 1 },
    ]
  },
  {
    id: "em-basic-2",
    section: "electromagnetism",
    title: "Электрический ток",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Сила тока измеряется в:", options: ["Вольтах", "Омах", "Амперах", "Ваттах"], correct: 2 },
      { question: "Формула силы тока:", options: ["I = U/R", "I = q/t", "Оба ответа верны", "I = Rt"], correct: 2 },
      { question: "Напряжение измеряется в:", options: ["Амперах", "Вольтах", "Омах", "Джоулях"], correct: 1 },
      { question: "Сопротивление измеряется в:", options: ["Амперах", "Вольтах", "Омах", "Ваттах"], correct: 2 },
      { question: "Закон Ома: I = ?", options: ["UR", "U/R", "R/U", "U+R"], correct: 1 },
    ]
  },
  {
    id: "em-basic-3",
    section: "electromagnetism",
    title: "Магнитное поле",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Магнитное поле создаётся:", options: ["Покоящимися зарядами", "Движущимися зарядами", "Массой", "Теплом"], correct: 1 },
      { question: "Единица магнитной индукции:", options: ["Вольт", "Ампер", "Тесла", "Генри"], correct: 2 },
      { question: "Линии магнитного поля:", options: ["Разомкнуты", "Замкнуты", "Прямые", "Не существуют"], correct: 1 },
      { question: "Магнит имеет:", options: ["Один полюс", "Два полюса", "Три полюса", "Нет полюсов"], correct: 1 },
      { question: "Компас указывает на:", options: ["Юг", "Восток", "Север", "Запад"], correct: 2 },
    ]
  },
  // Стандартные (2)
  {
    id: "em-standard-1",
    section: "electromagnetism",
    title: "Электростатика",
    difficulty: "standard",
    time_limit: 420,
    questions: [
      { question: "Закон Кулона: F = ?", options: ["kq₁q₂/r", "kq₁q₂/r²", "kq₁q₂r", "kq₁q₂r²"], correct: 1 },
      { question: "Напряжённость поля E = ?", options: ["F/q", "Fq", "F+q", "F-q"], correct: 0 },
      { question: "Потенциал φ = ?", options: ["W/q", "Wq", "W+q", "W-q"], correct: 0 },
      { question: "Ёмкость конденсатора C = ?", options: ["q/U", "qU", "U/q", "q+U"], correct: 0 },
      { question: "Энергия конденсатора W = ?", options: ["CU²/2", "CU", "C/U", "C²U"], correct: 0 },
      { question: "При последовательном соединении конденсаторов:", options: ["C = C₁ + C₂", "1/C = 1/C₁ + 1/C₂", "C = C₁C₂", "C = C₁/C₂"], correct: 1 },
      { question: "Диэлектрическая проницаемость воды ≈", options: ["1", "80", "8", "800"], correct: 1 },
    ]
  },
  {
    id: "em-standard-2",
    section: "electromagnetism",
    title: "Постоянный ток",
    difficulty: "standard",
    time_limit: 420,
    questions: [
      { question: "Мощность тока P = ?", options: ["UI", "U/I", "I/U", "U+I"], correct: 0 },
      { question: "Работа тока A = ?", options: ["UIt", "UI/t", "Ut/I", "It/U"], correct: 0 },
      { question: "Закон Джоуля-Ленца: Q = ?", options: ["I²Rt", "IR²t", "IRt²", "I²R²t"], correct: 0 },
      { question: "При последовательном соединении:", options: ["R = R₁ + R₂", "1/R = 1/R₁ + 1/R₂", "R = R₁R₂", "R = R₁/R₂"], correct: 0 },
      { question: "При параллельном соединении:", options: ["R = R₁ + R₂", "1/R = 1/R₁ + 1/R₂", "R = R₁R₂", "R = R₁ - R₂"], correct: 1 },
      { question: "ЭДС источника — это:", options: ["Напряжение на нагрузке", "Работа по перемещению заряда", "Сопротивление", "Мощность"], correct: 1 },
      { question: "Закон Ома для полной цепи:", options: ["I = ε/(R+r)", "I = ε/R", "I = εR", "I = ε + R"], correct: 0 },
    ]
  },
  // Продвинутые (2)
  {
    id: "em-advanced-1",
    section: "electromagnetism",
    title: "Электромагнитная индукция",
    difficulty: "advanced",
    time_limit: 600,
    questions: [
      { question: "Закон Фарадея: ε = ?", options: ["-dΦ/dt", "dΦ/dt", "Φ/t", "Φt"], correct: 0 },
      { question: "Правило Ленца определяет:", options: ["Величину ЭДС", "Направление индукционного тока", "Сопротивление", "Мощность"], correct: 1 },
      { question: "Индуктивность измеряется в:", options: ["Фарадах", "Генри", "Теслах", "Веберах"], correct: 1 },
      { question: "Энергия магнитного поля катушки:", options: ["LI²/2", "LI", "L/I", "L²I"], correct: 0 },
      { question: "Вихревые токи (Фуко) возникают в:", options: ["Тонких проводах", "Массивных проводниках", "Диэлектриках", "Вакууме"], correct: 1 },
      { question: "Самоиндукция препятствует:", options: ["Изменению тока", "Постоянному току", "Напряжению", "Сопротивлению"], correct: 0 },
      { question: "Трансформатор работает на:", options: ["Постоянном токе", "Переменном токе", "Любом токе", "Не работает"], correct: 1 },
      { question: "Коэффициент трансформации K = ?", options: ["N₁/N₂", "N₂/N₁", "N₁N₂", "N₁+N₂"], correct: 0 },
    ]
  },
  {
    id: "em-advanced-2",
    section: "electromagnetism",
    title: "Переменный ток и колебания",
    difficulty: "advanced",
    time_limit: 600,
    questions: [
      { question: "Действующее значение тока I = ?", options: ["I₀", "I₀/√2", "I₀√2", "I₀/2"], correct: 1 },
      { question: "Резонанс в контуре при:", options: ["ω = 1/√LC", "ω = LC", "ω = √LC", "ω = L/C"], correct: 0 },
      { question: "Импеданс цепи Z = ?", options: ["√(R² + (XL-XC)²)", "R + XL + XC", "R × XL × XC", "R/(XL+XC)"], correct: 0 },
      { question: "Индуктивное сопротивление XL = ?", options: ["ωL", "1/ωL", "ωC", "1/ωC"], correct: 0 },
      { question: "Ёмкостное сопротивление XC = ?", options: ["ωC", "1/ωC", "ωL", "1/ωL"], correct: 1 },
      { question: "Коэффициент мощности cosφ:", options: ["= 1 при резонансе", "< 1 всегда", "> 1 возможен", "= 0 при резонансе"], correct: 0 },
      { question: "Частота сети в России:", options: ["60 Гц", "50 Гц", "100 Гц", "25 Гц"], correct: 1 },
      { question: "Добротность контура Q характеризует:", options: ["Затухание", "Мощность", "Напряжение", "Сопротивление"], correct: 0 },
    ]
  },
  // Олимпиадные (3)
  {
    id: "em-olympiad-1",
    section: "electromagnetism",
    title: "Олимпиадное электричество I",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Уравнения Максвелла описывают:", options: ["Только электростатику", "Только магнитостатику", "Всю классическую электродинамику", "Квантовую механику"], correct: 2 },
      { question: "Ток смещения введён для:", options: ["Красоты", "Сохранения заряда и непрерывности тока", "Упрощения", "Нет причины"], correct: 1 },
      { question: "Вектор Пойнтинга S = ?", options: ["E × H", "E · H", "E + H", "E - H"], correct: 0 },
      { question: "Скин-эффект — это:", options: ["Вытеснение тока к поверхности", "Усиление тока", "Ослабление магнитного поля", "Нагревание"], correct: 0 },
      { question: "Электромагнитная волна — волна:", options: ["Продольная", "Поперечная", "Смешанная", "Стоячая"], correct: 1 },
      { question: "Скорость света c = ?", options: ["1/√εμ", "1/√(ε₀μ₀)", "√(ε₀μ₀)", "ε₀μ₀"], correct: 1 },
      { question: "Поляризация света — это:", options: ["Поглощение", "Отражение", "Упорядочение колебаний E", "Дифракция"], correct: 2 },
      { question: "Закон Био-Савара-Лапласа описывает:", options: ["Магнитное поле тока", "Электрическое поле заряда", "Индукцию", "Сопротивление"], correct: 0 },
      { question: "Сила Лоренца F = ?", options: ["qvB", "q[v×B]", "qv×B sinα", "Все ответы связаны"], correct: 3 },
      { question: "Эффект Холла позволяет определить:", options: ["Знак носителей тока", "Массу электрона", "Заряд протона", "Скорость света"], correct: 0 },
    ]
  },
  {
    id: "em-olympiad-2",
    section: "electromagnetism",
    title: "Олимпиадное электричество II",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Теорема Гаусса связывает:", options: ["Поток E через поверхность и заряд внутри", "Циркуляцию E и магнитный поток", "E и B", "Ток и напряжение"], correct: 0 },
      { question: "Циркуляция E в электростатике:", options: ["= 0", "≠ 0", "= q/ε₀", "= ∞"], correct: 0 },
      { question: "Циркуляция B по закону Ампера:", options: ["= 0", "= μ₀I", "= q/ε₀", "= ∞"], correct: 1 },
      { question: "Граничные условия для нормальной компоненты D:", options: ["D₁n = D₂n", "D₁n ≠ D₂n", "D = 0", "D = ∞"], correct: 0 },
      { question: "Поле внутри проводника в статике:", options: ["Максимально", "= 0", "Постоянно", "Колеблется"], correct: 1 },
      { question: "Метод изображений применяется для:", options: ["Расчёта ёмкости", "Решения задач с границами", "Измерения тока", "Нагревания"], correct: 1 },
      { question: "Энергия электрического поля w = ?", options: ["ε₀E²/2", "E²/2ε₀", "εE/2", "ε₀E"], correct: 0 },
      { question: "Энергия магнитного поля w = ?", options: ["B²/2μ₀", "μ₀B²/2", "B/2μ₀", "μ₀B"], correct: 0 },
      { question: "Импульс электромагнитного поля p = ?", options: ["S/c²", "Sc²", "S/c", "Sc"], correct: 0 },
      { question: "Давление света на поверхность:", options: ["Существует", "Не существует", "Только при отражении", "Только при поглощении"], correct: 0 },
    ]
  },
  {
    id: "em-olympiad-3",
    section: "electromagnetism",
    title: "Олимпиадное электричество III",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Сверхпроводимость — это:", options: ["Очень малое сопротивление", "Нулевое сопротивление", "Отрицательное сопротивление", "Бесконечное сопротивление"], correct: 1 },
      { question: "Эффект Мейсснера — это:", options: ["Выталкивание магнитного поля из сверхпроводника", "Притяжение поля", "Усиление поля", "Ничего"], correct: 0 },
      { question: "Куперовские пары — это:", options: ["Пары электронов в сверхпроводнике", "Пары протонов", "Пары фотонов", "Пары магнитов"], correct: 0 },
      { question: "Квантование магнитного потока означает:", options: ["Φ = nΦ₀", "Φ = 0", "Φ = ∞", "Φ непрерывен"], correct: 0 },
      { question: "Эффект Джозефсона связан с:", options: ["Туннелированием куперовских пар", "Резонансом", "Индукцией", "Ёмкостью"], correct: 0 },
      { question: "Плазма — это:", options: ["Твёрдое тело", "Ионизированный газ", "Жидкость", "Сверхтекучий гелий"], correct: 1 },
      { question: "Частота плазменных колебаний зависит от:", options: ["Концентрации электронов", "Температуры", "Давления", "Объёма"], correct: 0 },
      { question: "Магнитное удержание плазмы используется в:", options: ["Токамаках", "Лампочках", "Конденсаторах", "Трансформаторах"], correct: 0 },
      { question: "Излучение Черенкова возникает при:", options: ["v > c в среде", "v < c", "v = 0", "v = c"], correct: 0 },
      { question: "Синхротронное излучение создаётся:", options: ["Ускоренными заряженными частицами", "Покоящимися зарядами", "Нейтронами", "Фотонами"], correct: 0 },
    ]
  },

  // ==================== ОПТИКА ====================
  // Базовые (3)
  {
    id: "opt-basic-1",
    section: "optics",
    title: "Свет и его свойства",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Скорость света в вакууме:", options: ["3×10⁶ м/с", "3×10⁸ м/с", "3×10¹⁰ м/с", "300 м/с"], correct: 1 },
      { question: "Свет распространяется:", options: ["Только в веществе", "Только в вакууме", "В веществе и вакууме", "Нигде"], correct: 2 },
      { question: "Белый свет состоит из:", options: ["Одного цвета", "Всех цветов спектра", "Только красного и синего", "Невидимых лучей"], correct: 1 },
      { question: "Тень образуется из-за:", options: ["Преломления", "Прямолинейного распространения", "Дифракции", "Интерференции"], correct: 1 },
      { question: "Источник света, который излучает сам:", options: ["Луна", "Солнце", "Зеркало", "Белая стена"], correct: 1 },
    ]
  },
  {
    id: "opt-basic-2",
    section: "optics",
    title: "Отражение и преломление",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Угол падения равен углу:", options: ["Преломления", "Отражения", "Рассеяния", "Дифракции"], correct: 1 },
      { question: "При переходе в более плотную среду свет:", options: ["Ускоряется", "Замедляется", "Не меняет скорость", "Исчезает"], correct: 1 },
      { question: "Зеркальное отражение происходит от:", options: ["Шероховатой поверхности", "Гладкой поверхности", "Любой поверхности", "Только от металла"], correct: 1 },
      { question: "Показатель преломления воды ≈", options: ["1", "1,33", "2", "0,5"], correct: 1 },
      { question: "Радуга возникает из-за:", options: ["Отражения", "Преломления и дисперсии", "Дифракции", "Интерференции"], correct: 1 },
    ]
  },
  {
    id: "opt-basic-3",
    section: "optics",
    title: "Линзы и оптические приборы",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Собирающая линза:", options: ["Тоньше по краям", "Толще по краям", "Одинаковой толщины", "Не имеет формы"], correct: 0 },
      { question: "Фокус линзы — это точка, где:", options: ["Лучи расходятся", "Параллельные лучи собираются", "Лучи исчезают", "Лучи меняют цвет"], correct: 1 },
      { question: "Оптическая сила измеряется в:", options: ["Метрах", "Диоптриях", "Джоулях", "Ваттах"], correct: 1 },
      { question: "Лупа — это линза:", options: ["Рассеивающая", "Собирающая", "Плоская", "Цилиндрическая"], correct: 1 },
      { question: "Глаз человека — это оптическая система с линзой:", options: ["Рассеивающей", "Собирающей", "Отсутствующей", "Плоской"], correct: 1 },
    ]
  },
  // Стандартные (2)
  {
    id: "opt-standard-1",
    section: "optics",
    title: "Геометрическая оптика",
    difficulty: "standard",
    time_limit: 420,
    questions: [
      { question: "Закон преломления (Снеллиуса):", options: ["n₁sinα = n₂sinβ", "n₁cosα = n₂cosβ", "n₁α = n₂β", "sinα = sinβ"], correct: 0 },
      { question: "Формула тонкой линзы:", options: ["1/F = 1/d + 1/f", "F = d + f", "F = df", "1/F = 1/d - 1/f"], correct: 0 },
      { question: "Полное внутреннее отражение происходит при:", options: ["Любом угле", "Угле больше критического", "Угле равном 0°", "Угле 90°"], correct: 1 },
      { question: "Критический угол для воды (n=1,33):", options: ["≈49°", "≈90°", "≈0°", "≈30°"], correct: 0 },
      { question: "Увеличение линзы Г = ?", options: ["f/d", "d/f", "d+f", "d-f"], correct: 0 },
      { question: "Микроскоп даёт увеличение:", options: ["Г = Г_об × Г_ок", "Г = Г_об + Г_ок", "Г = Г_об / Г_ок", "Г = Г_об - Г_ок"], correct: 0 },
      { question: "Аберрации линз — это:", options: ["Искажения изображения", "Улучшение качества", "Увеличение яркости", "Изменение цвета"], correct: 0 },
    ]
  },
  {
    id: "opt-standard-2",
    section: "optics",
    title: "Волновая оптика",
    difficulty: "standard",
    time_limit: 420,
    questions: [
      { question: "Интерференция — это:", options: ["Сложение волн", "Огибание препятствий", "Разложение в спектр", "Поляризация"], correct: 0 },
      { question: "Дифракция — это:", options: ["Сложение волн", "Огибание препятствий", "Разложение в спектр", "Отражение"], correct: 1 },
      { question: "Условие максимума интерференции:", options: ["Δ = kλ", "Δ = (k+1/2)λ", "Δ = 0", "Δ = ∞"], correct: 0 },
      { question: "Период дифракционной решётки d = 10 мкм. Максимум 1-го порядка для λ = 500 нм:", options: ["sinφ = 0,05", "sinφ = 0,5", "sinφ = 5", "sinφ = 0,005"], correct: 0 },
      { question: "Поляризация доказывает, что свет — волна:", options: ["Продольная", "Поперечная", "Стоячая", "Ударная"], correct: 1 },
      { question: "Закон Малюса: I = ?", options: ["I₀cos²φ", "I₀sinφ", "I₀/cosφ", "I₀cosφ"], correct: 0 },
      { question: "Голография использует:", options: ["Только интерференцию", "Интерференцию и дифракцию", "Только преломление", "Только отражение"], correct: 1 },
    ]
  },
  // Продвинутые (2)
  {
    id: "opt-advanced-1",
    section: "optics",
    title: "Квантовая оптика",
    difficulty: "advanced",
    time_limit: 600,
    questions: [
      { question: "Энергия фотона E = ?", options: ["hν", "hλ", "h/ν", "h/λ"], correct: 0 },
      { question: "Импульс фотона p = ?", options: ["h/λ", "hλ", "hν", "h/ν"], correct: 0 },
      { question: "Фотоэффект объясняется:", options: ["Волновой теорией", "Корпускулярной теорией", "Обеими", "Ни одной"], correct: 1 },
      { question: "Красная граница фотоэффекта:", options: ["νмин = A/h", "νмакс = A/h", "ν = 0", "ν = ∞"], correct: 0 },
      { question: "Уравнение Эйнштейна для фотоэффекта:", options: ["hν = A + mv²/2", "hν = A - mv²/2", "hν = A", "hν = mv²/2"], correct: 0 },
      { question: "Комптоновское рассеяние доказывает:", options: ["Волновую природу света", "Корпускулярную природу света", "Ничего", "Дисперсию"], correct: 1 },
      { question: "Давление света на поверхность:", options: ["p = (1+R)I/c", "p = I/c", "p = Ic", "p = 0"], correct: 0 },
      { question: "Лазерное излучение:", options: ["Некогерентное", "Когерентное и монохроматическое", "Белое", "Рассеянное"], correct: 1 },
    ]
  },
  {
    id: "opt-advanced-2",
    section: "optics",
    title: "Спектроскопия и излучение",
    difficulty: "advanced",
    time_limit: 600,
    questions: [
      { question: "Спектр излучения атома:", options: ["Непрерывный", "Линейчатый", "Полосатый", "Белый"], correct: 1 },
      { question: "Формула Бальмера описывает:", options: ["Спектр водорода", "Спектр гелия", "Рентгеновские лучи", "Радиоволны"], correct: 0 },
      { question: "Закон Кирхгофа связывает:", options: ["Поглощение и излучение", "Преломление и отражение", "Дифракцию и интерференцию", "Массу и энергию"], correct: 0 },
      { question: "Абсолютно чёрное тело:", options: ["Полностью поглощает свет", "Полностью отражает", "Прозрачно", "Белое"], correct: 0 },
      { question: "Закон Стефана-Больцмана: R ~ ?", options: ["T", "T²", "T⁴", "1/T"], correct: 2 },
      { question: "Закон смещения Вина: λмакс ~ ?", options: ["T", "1/T", "T²", "1/T²"], correct: 1 },
      { question: "Люминесценция — это:", options: ["Тепловое излучение", "Холодное свечение", "Отражение", "Преломление"], correct: 1 },
      { question: "Флуоресценция прекращается:", options: ["Сразу после возбуждения", "Через длительное время", "Никогда", "При нагревании"], correct: 0 },
    ]
  },
  // Олимпиадные (3)
  {
    id: "opt-olympiad-1",
    section: "optics",
    title: "Олимпиадная оптика I",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Принцип Ферма:", options: ["Свет идёт по кратчайшему пути", "Свет идёт по пути наименьшего времени", "Свет идёт по прямой", "Свет не распространяется"], correct: 1 },
      { question: "Принцип Гюйгенса-Френеля объясняет:", options: ["Только отражение", "Только преломление", "Дифракцию и интерференцию", "Только интерференцию"], correct: 2 },
      { question: "Зоны Френеля используются для:", options: ["Расчёта дифракции", "Измерения длины волны", "Создания линз", "Поляризации"], correct: 0 },
      { question: "Разрешающая способность телескопа:", options: ["~ D/λ", "~ λ/D", "~ Dλ", "~ D²/λ"], correct: 0 },
      { question: "Критерий Рэлея:", options: ["Минимум одной картины на максимум другой", "Совпадение максимумов", "Совпадение минимумов", "Отсутствие интерференции"], correct: 0 },
      { question: "Дисперсия — это зависимость n от:", options: ["λ", "Угла", "Интенсивности", "Температуры"], correct: 0 },
      { question: "Аномальная дисперсия наблюдается:", options: ["Везде", "Вблизи линий поглощения", "В вакууме", "Нигде"], correct: 1 },
      { question: "Групповая скорость света:", options: ["Всегда = c", "Может быть > c", "Всегда < c", "= 0"], correct: 1 },
      { question: "Фазовая скорость света:", options: ["Всегда ≤ c", "Может быть > c", "= c", "= 0"], correct: 1 },
      { question: "Оптическая длина пути:", options: ["L = nl", "L = l/n", "L = l", "L = n"], correct: 0 },
    ]
  },
  {
    id: "opt-olympiad-2",
    section: "optics",
    title: "Олимпиадная оптика II",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Формула Рэлея для рассеяния: I ~ ?", options: ["1/λ⁴", "λ⁴", "1/λ²", "λ²"], correct: 0 },
      { question: "Небо голубое из-за:", options: ["Поглощения", "Рассеяния", "Дифракции", "Интерференции"], correct: 1 },
      { question: "Эффект Доплера для света:", options: ["Δλ/λ = v/c", "Δλ = v", "λ = c/v", "Не существует"], correct: 0 },
      { question: "Красное смещение галактик означает:", options: ["Приближение", "Удаление", "Покой", "Вращение"], correct: 1 },
      { question: "Поляризация при отражении (угол Брюстера):", options: ["tgφ = n", "sinφ = n", "cosφ = n", "φ = n"], correct: 0 },
      { question: "Двойное лучепреломление — свойство:", options: ["Изотропных кристаллов", "Анизотропных кристаллов", "Всех веществ", "Жидкостей"], correct: 1 },
      { question: "Эффект Керра — это:", options: ["Двойное лучепреломление в электрическом поле", "Поляризация", "Дифракция", "Интерференция"], correct: 0 },
      { question: "Эффект Фарадея — это:", options: ["Вращение плоскости поляризации в магнитном поле", "Поглощение света", "Преломление", "Отражение"], correct: 0 },
      { question: "Оптическая активность — свойство:", options: ["Всех веществ", "Хиральных молекул", "Только кристаллов", "Только газов"], correct: 1 },
      { question: "Четвертьволновая пластинка превращает:", options: ["Линейную поляризацию в круговую", "Круговую в линейную", "Оба варианта", "Ничего не меняет"], correct: 2 },
    ]
  },
  {
    id: "opt-olympiad-3",
    section: "optics",
    title: "Олимпиадная оптика III",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Нелинейная оптика изучает:", options: ["Интерференцию", "Процессы при высокой интенсивности", "Геометрическую оптику", "Отражение"], correct: 1 },
      { question: "Генерация второй гармоники — это:", options: ["Удвоение частоты", "Деление частоты", "Сохранение частоты", "Поглощение"], correct: 0 },
      { question: "Оптический параметрический генератор:", options: ["Создаёт когерентный свет", "Разделяет фотон на два", "Поглощает свет", "Отражает свет"], correct: 1 },
      { question: "Самофокусировка света происходит из-за:", options: ["Зависимости n от интенсивности", "Дифракции", "Поляризации", "Дисперсии"], correct: 0 },
      { question: "Солитоны — это:", options: ["Нелинейные волны сохраняющие форму", "Обычные волны", "Стоячие волны", "Затухающие волны"], correct: 0 },
      { question: "Фотонные кристаллы имеют:", options: ["Запрещённую зону для фотонов", "Только одну частоту", "Бесконечную проводимость", "Нулевой показатель преломления"], correct: 0 },
      { question: "Метаматериалы могут иметь:", options: ["n < 0", "n = 0", "Оба варианта возможны", "Только n > 0"], correct: 2 },
      { question: "Суперлинза использует:", options: ["Отрицательное преломление", "Обычное преломление", "Отражение", "Дифракцию"], correct: 0 },
      { question: "Плазмоны — это:", options: ["Коллективные колебания электронов", "Фотоны", "Фононы", "Магноны"], correct: 0 },
      { question: "Сверхбыстрая оптика изучает процессы:", options: ["Медленнее 1 с", "Аттосекундные и фемтосекундные", "Только непрерывные", "Микросекундные"], correct: 1 },
    ]
  },

  // ==================== АТОМНАЯ ФИЗИКА ====================
  // Базовые (3)
  {
    id: "atom-basic-1",
    section: "atomic",
    title: "Строение атома",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Атом состоит из:", options: ["Только протонов", "Ядра и электронов", "Только нейтронов", "Фотонов"], correct: 1 },
      { question: "Заряд электрона:", options: ["Положительный", "Отрицательный", "Нейтральный", "Переменный"], correct: 1 },
      { question: "Заряд протона:", options: ["Положительный", "Отрицательный", "Нейтральный", "Переменный"], correct: 0 },
      { question: "Нейтрон имеет заряд:", options: ["+1", "-1", "0", "+2"], correct: 2 },
      { question: "Атом электрически:", options: ["Положителен", "Отрицателен", "Нейтрален", "Заряжен по-разному"], correct: 2 },
    ]
  },
  {
    id: "atom-basic-2",
    section: "atomic",
    title: "Радиоактивность",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Радиоактивность — это:", options: ["Нагревание", "Самопроизвольный распад ядер", "Химическая реакция", "Электрический ток"], correct: 1 },
      { question: "Альфа-частица — это:", options: ["Электрон", "Ядро гелия", "Фотон", "Нейтрон"], correct: 1 },
      { question: "Бета-частица — это:", options: ["Электрон или позитрон", "Протон", "Нейтрон", "Альфа-частица"], correct: 0 },
      { question: "Гамма-излучение — это:", options: ["Поток частиц", "Электромагнитное излучение", "Звук", "Тепло"], correct: 1 },
      { question: "Период полураспада — это время, за которое:", options: ["Распадутся все ядра", "Распадётся половина ядер", "Распадётся одно ядро", "Ничего не распадётся"], correct: 1 },
    ]
  },
  {
    id: "atom-basic-3",
    section: "atomic",
    title: "Ядерные реакции",
    difficulty: "basic",
    time_limit: 300,
    questions: [
      { question: "Ядерная реакция — это:", options: ["Химическая реакция", "Превращение ядер", "Нагревание", "Охлаждение"], correct: 1 },
      { question: "Деление ядра — это:", options: ["Распад на осколки", "Слияние ядер", "Испускание фотона", "Поглощение электрона"], correct: 0 },
      { question: "Синтез ядер — это:", options: ["Распад", "Слияние лёгких ядер", "Поглощение нейтрона", "Испускание альфа-частицы"], correct: 1 },
      { question: "Энергия Солнца выделяется при:", options: ["Делении урана", "Синтезе водорода", "Химических реакциях", "Гравитации"], correct: 1 },
      { question: "АЭС работает на:", options: ["Синтезе", "Делении", "Сжигании угля", "Солнечной энергии"], correct: 1 },
    ]
  },
  // Стандартные (2)
  {
    id: "atom-standard-1",
    section: "atomic",
    title: "Квантовая физика",
    difficulty: "standard",
    time_limit: 420,
    questions: [
      { question: "Постоянная Планка h ≈", options: ["6,6×10⁻³⁴ Дж·с", "6,6×10⁻²³ Дж·с", "1,6×10⁻¹⁹ Кл", "3×10⁸ м/с"], correct: 0 },
      { question: "Энергия фотона E = ?", options: ["hν", "hλ", "h/ν", "mc²"], correct: 0 },
      { question: "Волна де Бройля: λ = ?", options: ["h/p", "hp", "p/h", "h+p"], correct: 0 },
      { question: "Принцип неопределённости Гейзенберга:", options: ["ΔxΔp ≥ ℏ/2", "ΔxΔp = 0", "ΔxΔp ≤ ℏ", "Δx = Δp"], correct: 0 },
      { question: "Уровни энергии в атоме:", options: ["Непрерывны", "Дискретны", "Отсутствуют", "Бесконечны"], correct: 1 },
      { question: "Спектр атома водорода:", options: ["Сплошной", "Линейчатый", "Полосатый", "Белый"], correct: 1 },
      { question: "Формула для энергии уровней водорода:", options: ["E_n = -13,6/n² эВ", "E_n = 13,6n² эВ", "E_n = n·13,6 эВ", "E_n = -13,6n эВ"], correct: 0 },
    ]
  },
  {
    id: "atom-standard-2",
    section: "atomic",
    title: "Ядерная физика",
    difficulty: "standard",
    time_limit: 420,
    questions: [
      { question: "Массовое число A = ?", options: ["Z + N", "Z - N", "Z × N", "Z / N"], correct: 0 },
      { question: "Изотопы — это ядра с одинаковым:", options: ["A", "Z", "N", "Массой"], correct: 1 },
      { question: "Закон радиоактивного распада:", options: ["N = N₀e^(-λt)", "N = N₀t", "N = N₀/t", "N = λt"], correct: 0 },
      { question: "Период полураспада T = ?", options: ["ln2/λ", "λ/ln2", "λln2", "1/λ"], correct: 0 },
      { question: "Дефект массы связан с:", options: ["Энергией связи", "Зарядом", "Спином", "Магнитным моментом"], correct: 0 },
      { question: "Энергия связи E = ?", options: ["Δm·c²", "Δm·c", "Δm/c²", "Δm + c²"], correct: 0 },
      { question: "Удельная энергия связи максимальна у:", options: ["Водорода", "Урана", "Железа", "Гелия"], correct: 2 },
    ]
  },
  // Продвинутые (2)
  {
    id: "atom-advanced-1",
    section: "atomic",
    title: "Квантовая механика",
    difficulty: "advanced",
    time_limit: 600,
    questions: [
      { question: "Уравнение Шрёдингера:", options: ["iℏ∂ψ/∂t = Ĥψ", "F = ma", "E = mc²", "pV = νRT"], correct: 0 },
      { question: "Волновая функция ψ описывает:", options: ["Траекторию", "Вероятность нахождения", "Энергию", "Импульс"], correct: 1 },
      { question: "|ψ|² — это:", options: ["Энергия", "Плотность вероятности", "Импульс", "Координата"], correct: 1 },
      { question: "Принцип Паули:", options: ["Два фермиона не могут быть в одном состоянии", "Энергия сохраняется", "Импульс сохраняется", "Заряд сохраняется"], correct: 0 },
      { question: "Электрон — это:", options: ["Бозон", "Фермион", "Фотон", "Мезон"], correct: 1 },
      { question: "Спин электрона:", options: ["0", "1/2", "1", "3/2"], correct: 1 },
      { question: "Туннельный эффект — это:", options: ["Прохождение через барьер", "Отражение от барьера", "Поглощение", "Излучение"], correct: 0 },
      { question: "Квантовые числа электрона в атоме:", options: ["n, l, m, s", "Только n", "Только l", "n и l"], correct: 0 },
    ]
  },
  {
    id: "atom-advanced-2",
    section: "atomic",
    title: "Элементарные частицы",
    difficulty: "advanced",
    time_limit: 600,
    questions: [
      { question: "Кварки — это:", options: ["Составные части адронов", "Лептоны", "Бозоны", "Мезоны"], correct: 0 },
      { question: "Протон состоит из кварков:", options: ["uud", "udd", "uuu", "ddd"], correct: 0 },
      { question: "Нейтрон состоит из кварков:", options: ["uud", "udd", "uuu", "ddd"], correct: 1 },
      { question: "Переносчик электромагнитного взаимодействия:", options: ["Глюон", "Фотон", "W-бозон", "Z-бозон"], correct: 1 },
      { question: "Переносчик сильного взаимодействия:", options: ["Глюон", "Фотон", "W-бозон", "Гравитон"], correct: 0 },
      { question: "Антиматерия отличается от материи:", options: ["Знаком заряда", "Массой", "Спином", "Ничем"], correct: 0 },
      { question: "Нейтрино — это:", options: ["Адрон", "Лептон", "Кварк", "Бозон"], correct: 1 },
      { question: "Бозон Хиггса отвечает за:", options: ["Массу частиц", "Заряд", "Спин", "Цвет"], correct: 0 },
    ]
  },
  // Олимпиадные (3)
  {
    id: "atom-olympiad-1",
    section: "atomic",
    title: "Олимпиадная атомная физика I",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Тонкая структура спектра связана с:", options: ["Спин-орбитальным взаимодействием", "Гравитацией", "Сильным взаимодействием", "Слабым взаимодействием"], correct: 0 },
      { question: "Сверхтонкая структура связана с:", options: ["Взаимодействием электрона и ядра", "Гравитацией", "Электрическим полем", "Магнитным полем Земли"], correct: 0 },
      { question: "Эффект Зеемана — это:", options: ["Расщепление линий в магнитном поле", "Расщепление в электрическом поле", "Поглощение света", "Излучение света"], correct: 0 },
      { question: "Эффект Штарка — это:", options: ["Расщепление в магнитном поле", "Расщепление в электрическом поле", "Поглощение света", "Отражение"], correct: 1 },
      { question: "Лэмбовский сдвиг объясняется:", options: ["Квантовой электродинамикой", "Классической механикой", "Термодинамикой", "Оптикой"], correct: 0 },
      { question: "g-фактор электрона ≈", options: ["2", "1", "0", "0,5"], correct: 0 },
      { question: "Магнетон Бора μ_B = ?", options: ["eℏ/2m_e", "eℏ/m_e", "e/2m_e", "ℏ/2m_e"], correct: 0 },
      { question: "Правила отбора для дипольных переходов:", options: ["Δl = ±1", "Δl = 0", "Δl = ±2", "Δl любой"], correct: 0 },
      { question: "Метастабильные состояния живут:", options: ["Долго из-за запрета переходов", "Мгновенно", "Бесконечно", "Отрицательное время"], correct: 0 },
      { question: "Лазер основан на:", options: ["Вынужденном излучении", "Спонтанном излучении", "Поглощении", "Рассеянии"], correct: 0 },
    ]
  },
  {
    id: "atom-olympiad-2",
    section: "atomic",
    title: "Олимпиадная атомная физика II",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Уравнение Дирака описывает:", options: ["Релятивистский электрон", "Фотон", "Нейтрон", "Атом"], correct: 0 },
      { question: "Из уравнения Дирака следует:", options: ["Существование антиматерии", "Закон Ома", "Уравнение Максвелла", "Закон Ньютона"], correct: 0 },
      { question: "КЭД — это теория:", options: ["Электромагнитного взаимодействия", "Сильного взаимодействия", "Слабого взаимодействия", "Гравитации"], correct: 0 },
      { question: "Диаграммы Фейнмана используются для:", options: ["Расчёта амплитуд рассеяния", "Построения орбит", "Измерения массы", "Определения заряда"], correct: 0 },
      { question: "Аномальный магнитный момент электрона:", options: ["(g-2)/2 ≈ 0,00116", "= 0", "= 1", "= 2"], correct: 0 },
      { question: "Перенормировка в КЭД нужна для:", options: ["Устранения расходимостей", "Увеличения точности", "Упрощения", "Красоты"], correct: 0 },
      { question: "Постоянная тонкой структуры α ≈", options: ["1/137", "137", "1", "1/2"], correct: 0 },
      { question: "Вакуумные флуктуации — это:", options: ["Виртуальные частицы", "Реальные частицы", "Электрическое поле", "Магнитное поле"], correct: 0 },
      { question: "Эффект Казимира связан с:", options: ["Энергией вакуума", "Гравитацией", "Сильным взаимодействием", "Слабым взаимодействием"], correct: 0 },
      { question: "Лэмбовский сдвиг ≈", options: ["1000 МГц", "1 МГц", "1 ГГц", "1 кГц"], correct: 0 },
    ]
  },
  {
    id: "atom-olympiad-3",
    section: "atomic",
    title: "Олимпиадная ядерная физика",
    difficulty: "olympiad",
    time_limit: 900,
    questions: [
      { question: "Капельная модель ядра:", options: ["Рассматривает ядро как каплю жидкости", "Описывает электроны", "Квантовая модель", "Релятивистская модель"], correct: 0 },
      { question: "Оболочечная модель ядра объясняет:", options: ["Магические числа", "Массу протона", "Заряд электрона", "Спин фотона"], correct: 0 },
      { question: "Магические числа:", options: ["2, 8, 20, 28, 50, 82, 126", "1, 2, 3, 4, 5", "Простые числа", "Числа Фибоначчи"], correct: 0 },
      { question: "Сечение ядерной реакции σ измеряется в:", options: ["Барнах", "Кулонах", "Теслах", "Джоулях"], correct: 0 },
      { question: "Критическая масса — это:", options: ["Минимальная масса для цепной реакции", "Масса протона", "Масса электрона", "Дефект массы"], correct: 0 },
      { question: "Замедлитель нейтронов в реакторе:", options: ["Ускоряет нейтроны", "Замедляет нейтроны", "Поглощает нейтроны", "Генерирует нейтроны"], correct: 1 },
      { question: "Синтез гелия из водорода выделяет энергию:", options: ["≈26 МэВ на реакцию", "≈200 МэВ", "≈1 МэВ", "0 МэВ"], correct: 0 },
      { question: "Термоядерная плазма удерживается:", options: ["Магнитным полем", "Гравитацией", "Электрическим полем", "Стенками"], correct: 0 },
      { question: "Условие Лоусона определяет:", options: ["Условия зажигания термоядерной реакции", "Массу плазмы", "Температуру плавления", "Давление газа"], correct: 0 },
      { question: "Нейтронная звезда — это:", options: ["Звезда из нейтронов", "Обычная звезда", "Белый карлик", "Красный гигант"], correct: 0 },
    ]
  },
];

// Функция получения тестов по разделу
export function getTestsBySection(sectionId: string): Test[] {
  return TESTS_DATA.filter(t => t.section === sectionId);
}

// Функция получения тем по подразделу
export function getTopicsBySubsection(sectionId: string, subsectionId: string): TopicContent[] {
  const section = PHYSICS_SECTIONS[sectionId];
  if (!section) return [];
  
  const subsection = section.subsections.find(s => s.id === subsectionId);
  if (!subsection) return [];
  
  return subsection.topics.map(topic => {
    return TOPICS_CONTENT[topic.id] || {
      id: topic.id,
      section: sectionId,
      subsection: subsectionId,
      title: topic.name,
      brief_info: "Раздел в разработке",
      example_problem: "",
      formulas: []
    };
  });
}

// Функция получения темы по ID
export function getTopicById(topicId: string): TopicContent | null {
  return TOPICS_CONTENT[topicId] || null;
}

