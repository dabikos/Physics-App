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
    formulas: ["I = U/R", "I = ε/(R+r)"]
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

