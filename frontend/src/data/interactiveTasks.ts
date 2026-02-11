// Интерактивные задачи с пошаговым решением

// Типы ввода ответа
export type AnswerType = 'choice' | 'number' | 'formula';

// Шаг решения
export interface SolutionStep {
  id: string;
  type: 'formula' | 'substitution' | 'calculation' | 'text';
  content: string;
  description?: string; // Короткое пояснение (опционально)
}

// Структура интерактивной задачи
export interface InteractiveTask {
  id: string;
  section: string;
  difficulty: 'basic' | 'standard' | 'advanced' | 'olympiad';
  
  // Условие
  title: string;
  condition: string;
  image?: string; // URL изображения (опционально)
  
  // Дано (для физических задач)
  given?: {
    symbol: string;
    value: string;
    unit: string;
    name: string;
  }[];
  
  // Найти
  find?: {
    symbol: string;
    unit: string;
    name: string;
  };
  
  // Тип ответа
  answerType: AnswerType;
  
  // Для выбора ответа
  options?: string[];
  correctOptionIndex?: number;
  
  // Для числового ввода
  correctValue?: number;
  tolerance?: number; // Допустимая погрешность (%)
  unit?: string;
  
  // Подсказка (Уровень 1)
  hint: string;
  
  // Пошаговое решение (Уровень 2)
  steps: SolutionStep[];
  
  // Полное решение (Уровень 3)
  fullSolution: string;
  
  // Финальный ответ
  answer: string;
}

// Примеры интерактивных задач
export const INTERACTIVE_TASKS: InteractiveTask[] = [
  // ==================== МЕХАНИКА ====================
  {
    id: "int-mech-1",
    section: "mechanics",
    difficulty: "basic",
    title: "Скорость автомобиля",
    condition: "Автомобиль проехал 150 км за 2 часа. Найдите среднюю скорость автомобиля.",
    given: [
      { symbol: "S", value: "150", unit: "км", name: "Путь" },
      { symbol: "t", value: "2", unit: "ч", name: "Время" },
    ],
    find: { symbol: "v", unit: "км/ч", name: "Скорость" },
    answerType: "number",
    correctValue: 75,
    tolerance: 1,
    unit: "км/ч",
    hint: "Используйте формулу равномерного движения: скорость = путь / время",
    steps: [
      { id: "s1", type: "formula", content: "v = S / t" },
      { id: "s2", type: "substitution", content: "v = 150 км / 2 ч" },
      { id: "s3", type: "calculation", content: "v = 75 км/ч" },
    ],
    fullSolution: "По определению средней скорости:\nv = S / t\nv = 150 км / 2 ч = 75 км/ч",
    answer: "75 км/ч",
  },
  {
    id: "int-mech-2",
    section: "mechanics",
    difficulty: "basic",
    title: "Сила тяжести",
    condition: "Найдите силу тяжести, действующую на тело массой 8 кг. Ускорение свободного падения g = 10 м/с².",
    given: [
      { symbol: "m", value: "8", unit: "кг", name: "Масса" },
      { symbol: "g", value: "10", unit: "м/с²", name: "Ускорение свободного падения" },
    ],
    find: { symbol: "F", unit: "Н", name: "Сила тяжести" },
    answerType: "number",
    correctValue: 80,
    tolerance: 1,
    unit: "Н",
    hint: "Сила тяжести равна произведению массы на ускорение свободного падения",
    steps: [
      { id: "s1", type: "formula", content: "F = m × g" },
      { id: "s2", type: "substitution", content: "F = 8 кг × 10 м/с²" },
      { id: "s3", type: "calculation", content: "F = 80 Н" },
    ],
    fullSolution: "По формуле силы тяжести:\nF = mg\nF = 8 кг × 10 м/с² = 80 Н",
    answer: "80 Н",
  },
  {
    id: "int-mech-3",
    section: "mechanics",
    difficulty: "standard",
    title: "Кинетическая энергия",
    condition: "Автомобиль массой 1200 кг движется со скоростью 72 км/ч. Определите его кинетическую энергию.",
    given: [
      { symbol: "m", value: "1200", unit: "кг", name: "Масса" },
      { symbol: "v", value: "72", unit: "км/ч", name: "Скорость" },
    ],
    find: { symbol: "E", unit: "кДж", name: "Кинетическая энергия" },
    answerType: "choice",
    options: ["120 кДж", "240 кДж", "480 кДж", "960 кДж"],
    correctOptionIndex: 1,
    hint: "Не забудьте перевести скорость в м/с! (72 км/ч = 20 м/с)",
    steps: [
      { id: "s1", type: "text", content: "Переводим скорость в СИ:" },
      { id: "s2", type: "calculation", content: "v = 72 км/ч = 72 / 3,6 = 20 м/с" },
      { id: "s3", type: "formula", content: "E = mv² / 2" },
      { id: "s4", type: "substitution", content: "E = 1200 × 20² / 2" },
      { id: "s5", type: "calculation", content: "E = 1200 × 400 / 2 = 240000 Дж = 240 кДж" },
    ],
    fullSolution: "1. Переводим скорость:\nv = 72 км/ч = 20 м/с\n\n2. Формула кинетической энергии:\nE = mv²/2\n\n3. Подставляем:\nE = 1200 × 400 / 2 = 240000 Дж = 240 кДж",
    answer: "240 кДж",
  },
  {
    id: "int-mech-4",
    section: "mechanics",
    difficulty: "standard",
    title: "Свободное падение",
    condition: "Камень падает с высоты 45 м без начальной скорости. Сколько времени он будет падать? (g = 10 м/с²)",
    given: [
      { symbol: "h", value: "45", unit: "м", name: "Высота" },
      { symbol: "v₀", value: "0", unit: "м/с", name: "Начальная скорость" },
      { symbol: "g", value: "10", unit: "м/с²", name: "Ускорение" },
    ],
    find: { symbol: "t", unit: "с", name: "Время падения" },
    answerType: "number",
    correctValue: 3,
    tolerance: 5,
    unit: "с",
    hint: "При падении без начальной скорости: h = gt²/2. Выразите t из этой формулы.",
    steps: [
      { id: "s1", type: "formula", content: "h = gt² / 2" },
      { id: "s2", type: "formula", content: "t² = 2h / g" },
      { id: "s3", type: "substitution", content: "t² = 2 × 45 / 10 = 9" },
      { id: "s4", type: "calculation", content: "t = √9 = 3 с" },
    ],
    fullSolution: "Из формулы h = gt²/2:\nt² = 2h/g\nt² = 2 × 45 / 10 = 9\nt = 3 с",
    answer: "3 с",
  },
  {
    id: "int-mech-5",
    section: "mechanics",
    difficulty: "advanced",
    title: "Наклонная плоскость",
    condition: "Тело массой 2 кг скользит по наклонной плоскости с углом 30° без трения. Найдите ускорение тела.",
    given: [
      { symbol: "m", value: "2", unit: "кг", name: "Масса" },
      { symbol: "α", value: "30", unit: "°", name: "Угол наклона" },
      { symbol: "g", value: "10", unit: "м/с²", name: "Ускорение свободного падения" },
    ],
    find: { symbol: "a", unit: "м/с²", name: "Ускорение" },
    answerType: "number",
    correctValue: 5,
    tolerance: 5,
    unit: "м/с²",
    hint: "На наклонной плоскости тело ускоряется составляющей силы тяжести вдоль плоскости: F = mg·sin(α)",
    steps: [
      { id: "s1", type: "text", content: "Сила, ускоряющая тело вдоль плоскости:" },
      { id: "s2", type: "formula", content: "F = mg·sin(α)" },
      { id: "s3", type: "text", content: "По второму закону Ньютона:" },
      { id: "s4", type: "formula", content: "ma = mg·sin(α)" },
      { id: "s5", type: "formula", content: "a = g·sin(α)" },
      { id: "s6", type: "substitution", content: "a = 10 × sin(30°) = 10 × 0,5" },
      { id: "s7", type: "calculation", content: "a = 5 м/с²" },
    ],
    fullSolution: "1. Сила вдоль плоскости: F = mg·sin(α)\n2. По второму закону Ньютона: ma = mg·sin(α)\n3. Ускорение: a = g·sin(α) = 10 × 0,5 = 5 м/с²\n\nОтвет не зависит от массы!",
    answer: "5 м/с²",
  },

  // ==================== ТЕРМОДИНАМИКА ====================
  {
    id: "int-therm-1",
    section: "thermodynamics",
    difficulty: "basic",
    title: "Нагревание воды",
    condition: "Сколько теплоты нужно для нагревания 2 кг воды от 20°C до 80°C? Удельная теплоёмкость воды c = 4200 Дж/(кг·°C).",
    given: [
      { symbol: "m", value: "2", unit: "кг", name: "Масса воды" },
      { symbol: "t₁", value: "20", unit: "°C", name: "Начальная температура" },
      { symbol: "t₂", value: "80", unit: "°C", name: "Конечная температура" },
      { symbol: "c", value: "4200", unit: "Дж/(кг·°C)", name: "Удельная теплоёмкость" },
    ],
    find: { symbol: "Q", unit: "кДж", name: "Количество теплоты" },
    answerType: "number",
    correctValue: 504,
    tolerance: 1,
    unit: "кДж",
    hint: "Количество теплоты Q = cmΔT, где ΔT = t₂ - t₁",
    steps: [
      { id: "s1", type: "text", content: "Изменение температуры:" },
      { id: "s2", type: "calculation", content: "ΔT = 80 - 20 = 60°C" },
      { id: "s3", type: "formula", content: "Q = cmΔT" },
      { id: "s4", type: "substitution", content: "Q = 4200 × 2 × 60" },
      { id: "s5", type: "calculation", content: "Q = 504000 Дж = 504 кДж" },
    ],
    fullSolution: "ΔT = 80°C - 20°C = 60°C\nQ = cmΔT = 4200 × 2 × 60 = 504000 Дж = 504 кДж",
    answer: "504 кДж",
  },
  {
    id: "int-therm-2",
    section: "thermodynamics",
    difficulty: "standard",
    title: "Изотермический процесс",
    condition: "Газ при давлении 200 кПа занимает объём 3 л. Каким станет давление, если объём изотермически уменьшить до 1 л?",
    given: [
      { symbol: "p₁", value: "200", unit: "кПа", name: "Начальное давление" },
      { symbol: "V₁", value: "3", unit: "л", name: "Начальный объём" },
      { symbol: "V₂", value: "1", unit: "л", name: "Конечный объём" },
    ],
    find: { symbol: "p₂", unit: "кПа", name: "Конечное давление" },
    answerType: "number",
    correctValue: 600,
    tolerance: 1,
    unit: "кПа",
    hint: "При изотермическом процессе T = const, используйте закон Бойля-Мариотта: p₁V₁ = p₂V₂",
    steps: [
      { id: "s1", type: "text", content: "Закон Бойля-Мариотта (T = const):" },
      { id: "s2", type: "formula", content: "p₁V₁ = p₂V₂" },
      { id: "s3", type: "formula", content: "p₂ = p₁V₁ / V₂" },
      { id: "s4", type: "substitution", content: "p₂ = 200 × 3 / 1" },
      { id: "s5", type: "calculation", content: "p₂ = 600 кПа" },
    ],
    fullSolution: "По закону Бойля-Мариотта:\np₁V₁ = p₂V₂\np₂ = p₁V₁/V₂ = 200 × 3 / 1 = 600 кПа",
    answer: "600 кПа",
  },

  // ==================== ЭЛЕКТРИЧЕСТВО ====================
  {
    id: "int-em-1",
    section: "electromagnetism",
    difficulty: "basic",
    title: "Закон Ома",
    condition: "Найдите силу тока в цепи, если напряжение 12 В, а сопротивление 4 Ом.",
    given: [
      { symbol: "U", value: "12", unit: "В", name: "Напряжение" },
      { symbol: "R", value: "4", unit: "Ом", name: "Сопротивление" },
    ],
    find: { symbol: "I", unit: "А", name: "Сила тока" },
    answerType: "number",
    correctValue: 3,
    tolerance: 1,
    unit: "А",
    hint: "Закон Ома: сила тока равна напряжению, делённому на сопротивление",
    steps: [
      { id: "s1", type: "formula", content: "I = U / R" },
      { id: "s2", type: "substitution", content: "I = 12 В / 4 Ом" },
      { id: "s3", type: "calculation", content: "I = 3 А" },
    ],
    fullSolution: "По закону Ома:\nI = U/R = 12/4 = 3 А",
    answer: "3 А",
  },
  {
    id: "int-em-2",
    section: "electromagnetism",
    difficulty: "standard",
    title: "Параллельное соединение",
    condition: "Два резистора R₁ = 6 Ом и R₂ = 3 Ом соединены параллельно. Найдите общее сопротивление.",
    given: [
      { symbol: "R₁", value: "6", unit: "Ом", name: "Первый резистор" },
      { symbol: "R₂", value: "3", unit: "Ом", name: "Второй резистор" },
    ],
    find: { symbol: "R", unit: "Ом", name: "Общее сопротивление" },
    answerType: "number",
    correctValue: 2,
    tolerance: 1,
    unit: "Ом",
    hint: "При параллельном соединении: 1/R = 1/R₁ + 1/R₂",
    steps: [
      { id: "s1", type: "formula", content: "1/R = 1/R₁ + 1/R₂" },
      { id: "s2", type: "substitution", content: "1/R = 1/6 + 1/3" },
      { id: "s3", type: "calculation", content: "1/R = 1/6 + 2/6 = 3/6 = 1/2" },
      { id: "s4", type: "calculation", content: "R = 2 Ом" },
    ],
    fullSolution: "1/R = 1/R₁ + 1/R₂ = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2\nR = 2 Ом",
    answer: "2 Ом",
  },
  {
    id: "int-em-3",
    section: "electromagnetism",
    difficulty: "advanced",
    title: "Закон Кулона",
    condition: "Два точечных заряда q₁ = 4 мкКл и q₂ = 9 мкКл находятся на расстоянии 30 см. Найдите силу взаимодействия. (k = 9×10⁹)",
    given: [
      { symbol: "q₁", value: "4", unit: "мкКл", name: "Первый заряд" },
      { symbol: "q₂", value: "9", unit: "мкКл", name: "Второй заряд" },
      { symbol: "r", value: "30", unit: "см", name: "Расстояние" },
      { symbol: "k", value: "9×10⁹", unit: "Н·м²/Кл²", name: "Коэффициент" },
    ],
    find: { symbol: "F", unit: "Н", name: "Сила взаимодействия" },
    answerType: "choice",
    options: ["1,2 Н", "3,6 Н", "4,0 Н", "36 Н"],
    correctOptionIndex: 1,
    hint: "Переведите заряды в Кл (1 мкКл = 10⁻⁶ Кл) и расстояние в метры!",
    steps: [
      { id: "s1", type: "text", content: "Переводим в СИ:" },
      { id: "s2", type: "calculation", content: "q₁ = 4×10⁻⁶ Кл, q₂ = 9×10⁻⁶ Кл, r = 0,3 м" },
      { id: "s3", type: "formula", content: "F = k × q₁ × q₂ / r²" },
      { id: "s4", type: "substitution", content: "F = 9×10⁹ × 4×10⁻⁶ × 9×10⁻⁶ / 0,09" },
      { id: "s5", type: "calculation", content: "F = 9×10⁹ × 36×10⁻¹² / 0,09" },
      { id: "s6", type: "calculation", content: "F = 324×10⁻³ / 0,09 = 3,6 Н" },
    ],
    fullSolution: "q₁ = 4×10⁻⁶ Кл, q₂ = 9×10⁻⁶ Кл, r = 0,3 м\nF = kq₁q₂/r² = 9×10⁹ × 4×10⁻⁶ × 9×10⁻⁶ / 0,09 = 3,6 Н",
    answer: "3,6 Н",
  },

  // ==================== ОПТИКА ====================
  {
    id: "int-opt-1",
    section: "optics",
    difficulty: "basic",
    title: "Скорость света в среде",
    condition: "Найдите скорость света в воде, если показатель преломления воды n = 1,33. Скорость света в вакууме c = 3×10⁸ м/с.",
    given: [
      { symbol: "n", value: "1,33", unit: "", name: "Показатель преломления" },
      { symbol: "c", value: "3×10⁸", unit: "м/с", name: "Скорость света в вакууме" },
    ],
    find: { symbol: "v", unit: "м/с", name: "Скорость света в воде" },
    answerType: "choice",
    options: ["1,5×10⁸ м/с", "2,26×10⁸ м/с", "3×10⁸ м/с", "4×10⁸ м/с"],
    correctOptionIndex: 1,
    hint: "Показатель преломления n = c/v, откуда v = c/n",
    steps: [
      { id: "s1", type: "formula", content: "n = c / v" },
      { id: "s2", type: "formula", content: "v = c / n" },
      { id: "s3", type: "substitution", content: "v = 3×10⁸ / 1,33" },
      { id: "s4", type: "calculation", content: "v ≈ 2,26×10⁸ м/с" },
    ],
    fullSolution: "v = c/n = 3×10⁸ / 1,33 ≈ 2,26×10⁸ м/с",
    answer: "2,26×10⁸ м/с",
  },
  {
    id: "int-opt-2",
    section: "optics",
    difficulty: "standard",
    title: "Оптическая сила линзы",
    condition: "Фокусное расстояние линзы F = 20 см. Найдите её оптическую силу.",
    given: [
      { symbol: "F", value: "20", unit: "см", name: "Фокусное расстояние" },
    ],
    find: { symbol: "D", unit: "дптр", name: "Оптическая сила" },
    answerType: "number",
    correctValue: 5,
    tolerance: 1,
    unit: "дптр",
    hint: "Оптическая сила D = 1/F, где F должно быть в метрах!",
    steps: [
      { id: "s1", type: "text", content: "Переводим в метры:" },
      { id: "s2", type: "calculation", content: "F = 20 см = 0,2 м" },
      { id: "s3", type: "formula", content: "D = 1 / F" },
      { id: "s4", type: "substitution", content: "D = 1 / 0,2" },
      { id: "s5", type: "calculation", content: "D = 5 дптр" },
    ],
    fullSolution: "F = 20 см = 0,2 м\nD = 1/F = 1/0,2 = 5 дптр",
    answer: "5 дптр",
  },

  // ==================== АТОМНАЯ ====================
  {
    id: "int-atom-1",
    section: "atomic",
    difficulty: "basic",
    title: "Энергия фотона",
    condition: "Найдите энергию фотона с частотой ν = 5×10¹⁴ Гц. Постоянная Планка h = 6,6×10⁻³⁴ Дж·с.",
    given: [
      { symbol: "ν", value: "5×10¹⁴", unit: "Гц", name: "Частота" },
      { symbol: "h", value: "6,6×10⁻³⁴", unit: "Дж·с", name: "Постоянная Планка" },
    ],
    find: { symbol: "E", unit: "Дж", name: "Энергия фотона" },
    answerType: "choice",
    options: ["3,3×10⁻²⁰ Дж", "3,3×10⁻¹⁹ Дж", "6,6×10⁻¹⁹ Дж", "1,3×10⁻¹⁸ Дж"],
    correctOptionIndex: 1,
    hint: "Энергия фотона: E = hν",
    steps: [
      { id: "s1", type: "formula", content: "E = h × ν" },
      { id: "s2", type: "substitution", content: "E = 6,6×10⁻³⁴ × 5×10¹⁴" },
      { id: "s3", type: "calculation", content: "E = 33×10⁻²⁰ = 3,3×10⁻¹⁹ Дж" },
    ],
    fullSolution: "E = hν = 6,6×10⁻³⁴ × 5×10¹⁴ = 3,3×10⁻¹⁹ Дж",
    answer: "3,3×10⁻¹⁹ Дж",
  },
  {
    id: "int-atom-2",
    section: "atomic",
    difficulty: "standard",
    title: "Период полураспада",
    condition: "Период полураспада радиоактивного изотопа T = 10 суток. Какая доля ядер останется через 30 суток?",
    given: [
      { symbol: "T", value: "10", unit: "суток", name: "Период полураспада" },
      { symbol: "t", value: "30", unit: "суток", name: "Время" },
    ],
    find: { symbol: "N/N₀", unit: "", name: "Доля оставшихся ядер" },
    answerType: "choice",
    options: ["1/2", "1/4", "1/8", "1/16"],
    correctOptionIndex: 2,
    hint: "За каждый период полураспада количество ядер уменьшается в 2 раза. Сколько периодов прошло?",
    steps: [
      { id: "s1", type: "text", content: "Число периодов:" },
      { id: "s2", type: "calculation", content: "n = t/T = 30/10 = 3" },
      { id: "s3", type: "formula", content: "N/N₀ = (1/2)ⁿ" },
      { id: "s4", type: "substitution", content: "N/N₀ = (1/2)³" },
      { id: "s5", type: "calculation", content: "N/N₀ = 1/8" },
    ],
    fullSolution: "n = t/T = 30/10 = 3 периода\nN/N₀ = (1/2)³ = 1/8",
    answer: "1/8",
  },
];

// Функция получения задач по разделу
export function getInteractiveTasksBySection(sectionId: string): InteractiveTask[] {
  return INTERACTIVE_TASKS.filter(t => t.section === sectionId);
}

// Функция получения задачи по ID
export function getInteractiveTaskById(taskId: string): InteractiveTask | null {
  return INTERACTIVE_TASKS.find(t => t.id === taskId) || null;
}

















