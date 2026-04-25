// Local physics data with lazy-loading by section

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

export interface TopicContent {
  id: string;
  section: string;
  subsection: string;
  title: string;
  brief_info: string;
  example_problem: string;
  formulas: string[];
  video?: string | number;
}

export interface Formula {
  id: string;
  section: string;
  name: string;
  formula: string;
  description: string;
  variables: Record<string, string>;
  unit: string;
}

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

export const PHYSICS_SECTIONS: Record<string, Section> = {
  "mechanics": {
    "name": "Механика",
    "icon": "speedometer",
    "color": "#4A90D9",
    "subsections": [
      {
        "id": "kinematics",
        "name": "Кинематика",
        "topics": [
          {
            "id": "linear-motion",
            "name": "Прямолинейное движение"
          },
          {
            "id": "uniform-accelerated",
            "name": "Равномерное и равноускоренное движение"
          },
          {
            "id": "circular-motion",
            "name": "Движение по окружности"
          },
          {
            "id": "relative-motion",
            "name": "Относительность движения"
          },
          {
            "id": "motion-graphs",
            "name": "Графики движения"
          }
        ]
      },
      {
        "id": "dynamics",
        "name": "Динамика",
        "topics": [
          {
            "id": "newton-laws",
            "name": "Законы Ньютона"
          },
          {
            "id": "forces",
            "name": "Силы в механике"
          },
          {
            "id": "multiple-forces",
            "name": "Движение под действием нескольких сил"
          },
          {
            "id": "inclined-plane",
            "name": "Наклонная плоскость"
          },
          {
            "id": "momentum",
            "name": "Импульс и закон сохранения импульса"
          }
        ]
      },
      {
        "id": "statics",
        "name": "Статика",
        "topics": [
          {
            "id": "equilibrium",
            "name": "Условия равновесия"
          },
          {
            "id": "torque",
            "name": "Момент силы"
          },
          {
            "id": "center-mass",
            "name": "Центр масс"
          },
          {
            "id": "simple-machines",
            "name": "Простые механизмы"
          }
        ]
      },
      {
        "id": "conservation-laws",
        "name": "Законы сохранения",
        "topics": [
          {
            "id": "work",
            "name": "Работа"
          },
          {
            "id": "kinetic-energy",
            "name": "Кинетическая энергия"
          },
          {
            "id": "potential-energy",
            "name": "Потенциальная энергия"
          },
          {
            "id": "energy-conservation",
            "name": "Закон сохранения энергии"
          }
        ]
      },
      {
        "id": "oscillations-waves",
        "name": "Механические колебания и волны",
        "topics": [
          {
            "id": "harmonic-oscillations",
            "name": "Гармонические колебания"
          },
          {
            "id": "pendulums",
            "name": "Маятники"
          },
          {
            "id": "mechanical-waves",
            "name": "Механические волны"
          },
          {
            "id": "resonance",
            "name": "Резонанс"
          }
        ]
      },
      {
        "id": "gravitation",
        "name": "Гравитация",
        "topics": [
          {
            "id": "universal-gravitation",
            "name": "Закон всемирного тяготения"
          },
          {
            "id": "gravitational-field",
            "name": "Гравитационное поле и напряжённость"
          },
          {
            "id": "weight-weightlessness",
            "name": "Вес и невесомость"
          },
          {
            "id": "satellites-orbits",
            "name": "Искусственные спутники и орбиты"
          },
          {
            "id": "kepler-laws",
            "name": "Законы Кеплера"
          },
          {
            "id": "cosmic-velocities",
            "name": "Первая, вторая и третья космические скорости"
          },
          {
            "id": "gravitational-energy",
            "name": "Гравитационная потенциальная энергия"
          }
        ]
      },
      {
        "id": "fluid-mechanics",
        "name": "Гидростатика и гидродинамика",
        "topics": [
          {
            "id": "liquid-pressure",
            "name": "Давление в жидкостях"
          },
          {
            "id": "pascal-law",
            "name": "Закон Паскаля"
          },
          {
            "id": "archimedes-principle",
            "name": "Закон Архимеда"
          },
          {
            "id": "floating-bodies",
            "name": "Плавание и погружение тел"
          },
          {
            "id": "atmospheric-pressure",
            "name": "Атмосферное давление"
          },
          {
            "id": "barometer-manometer",
            "name": "Барометр и манометр"
          },
          {
            "id": "hydraulic-machines",
            "name": "Гидравлические машины"
          },
          {
            "id": "continuity-equation",
            "name": "Уравнение неразрывности"
          },
          {
            "id": "bernoulli-equation",
            "name": "Уравнение Бернулли"
          },
          {
            "id": "fluid-viscosity",
            "name": "Вязкость жидкостей"
          },
          {
            "id": "stokes-law",
            "name": "Закон Стокса (сила сопротивления)"
          }
        ]
      },
      {
        "id": "acoustics",
        "name": "Акустика",
        "topics": [
          {
            "id": "sound-waves",
            "name": "Звуковые волны"
          },
          {
            "id": "sound-speed-media",
            "name": "Скорость звука в разных средах"
          },
          {
            "id": "loudness-intensity",
            "name": "Громкость и интенсивность звука"
          },
          {
            "id": "decibel-scale",
            "name": "Децибелы (шкала громкости)"
          },
          {
            "id": "doppler-sound",
            "name": "Эффект Доплера для звука"
          },
          {
            "id": "acoustic-resonance",
            "name": "Резонанс в акустике"
          },
          {
            "id": "ultrasound-infrasound",
            "name": "Ультразвук и инфразвук"
          },
          {
            "id": "timbre-instruments",
            "name": "Тембр и музыкальные инструменты"
          },
          {
            "id": "sound-reflection-absorption",
            "name": "Отражение и поглощение звука"
          }
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
          {
            "id": "matter-structure",
            "name": "Строение вещества"
          },
          {
            "id": "temperature",
            "name": "Температура"
          },
          {
            "id": "gas-pressure",
            "name": "Давление газа"
          }
        ]
      },
      {
        "id": "heat-processes",
        "name": "Тепловые процессы",
        "topics": [
          {
            "id": "thermal-conductivity",
            "name": "Теплопроводность"
          },
          {
            "id": "convection",
            "name": "Конвекция"
          },
          {
            "id": "radiation",
            "name": "Излучение"
          },
          {
            "id": "heat-quantity",
            "name": "Количество теплоты"
          }
        ]
      },
      {
        "id": "ideal-gas",
        "name": "Идеальный газ",
        "topics": [
          {
            "id": "state-equation",
            "name": "Уравнение состояния"
          },
          {
            "id": "isoprocesses",
            "name": "Изопроцессы"
          },
          {
            "id": "gas-laws",
            "name": "Газовые законы"
          }
        ]
      },
      {
        "id": "thermodynamics-laws",
        "name": "Законы термодинамики",
        "topics": [
          {
            "id": "first-law",
            "name": "Первый закон"
          },
          {
            "id": "second-law",
            "name": "Второй закон"
          },
          {
            "id": "heat-engines",
            "name": "Тепловые машины"
          },
          {
            "id": "efficiency",
            "name": "КПД"
          }
        ]
      },
      {
        "id": "phase-transitions",
        "name": "Фазовые переходы",
        "topics": [
          {
            "id": "melting",
            "name": "Плавление"
          },
          {
            "id": "evaporation",
            "name": "Испарение"
          },
          {
            "id": "boiling",
            "name": "Кипение"
          },
          {
            "id": "phase-diagrams",
            "name": "Диаграммы состояния"
          }
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
          {
            "id": "electric-charge",
            "name": "Электрический заряд"
          },
          {
            "id": "coulomb-law",
            "name": "Закон Кулона"
          },
          {
            "id": "electric-field",
            "name": "Электрическое поле"
          },
          {
            "id": "potential-voltage",
            "name": "Потенциал и напряжение"
          },
          {
            "id": "capacitors",
            "name": "Конденсаторы"
          }
        ]
      },
      {
        "id": "direct-current",
        "name": "Постоянный ток",
        "topics": [
          {
            "id": "current-strength",
            "name": "Сила тока"
          },
          {
            "id": "ohm-law",
            "name": "Закон Ома"
          },
          {
            "id": "work-power",
            "name": "Работа и мощность тока"
          },
          {
            "id": "conductor-connections",
            "name": "Соединение проводников"
          }
        ]
      },
      {
        "id": "magnetism",
        "name": "Магнетизм",
        "topics": [
          {
            "id": "magnetic-field",
            "name": "Магнитное поле"
          },
          {
            "id": "ampere-force",
            "name": "Сила Ампера"
          },
          {
            "id": "lorentz-force",
            "name": "Сила Лоренца"
          }
        ]
      },
      {
        "id": "electromagnetic-induction",
        "name": "Электромагнитная индукция",
        "topics": [
          {
            "id": "faraday-law",
            "name": "Закон Фарадея"
          },
          {
            "id": "lenz-rule",
            "name": "Правило Ленца"
          },
          {
            "id": "inductance",
            "name": "Индуктивность"
          },
          {
            "id": "eddy-currents",
            "name": "Вихревые токи"
          }
        ]
      },
      {
        "id": "alternating-current",
        "name": "Переменный ток",
        "topics": [
          {
            "id": "sinusoidal-current",
            "name": "Синусоидальный ток"
          },
          {
            "id": "reactive-resistance",
            "name": "Реактивное сопротивление"
          },
          {
            "id": "transformers",
            "name": "Трансформаторы"
          },
          {
            "id": "power-transmission",
            "name": "Передача электроэнергии"
          }
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
          {
            "id": "light-propagation",
            "name": "Распространение света"
          },
          {
            "id": "reflection",
            "name": "Отражение"
          },
          {
            "id": "refraction",
            "name": "Преломление"
          },
          {
            "id": "lenses-mirrors",
            "name": "Линзы и зеркала"
          },
          {
            "id": "optical-devices",
            "name": "Оптические приборы"
          }
        ]
      },
      {
        "id": "wave-optics",
        "name": "Волновая оптика",
        "topics": [
          {
            "id": "interference",
            "name": "Интерференция"
          },
          {
            "id": "diffraction",
            "name": "Дифракция"
          },
          {
            "id": "polarization",
            "name": "Поляризация"
          }
        ]
      },
      {
        "id": "quantum-optics",
        "name": "Квантовая оптика",
        "topics": [
          {
            "id": "photoelectric-effect",
            "name": "Фотоэффект"
          },
          {
            "id": "light-dualism",
            "name": "Дуализм света"
          },
          {
            "id": "emission-spectra",
            "name": "Спектры излучения"
          },
          {
            "id": "lasers",
            "name": "Лазеры"
          }
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
          {
            "id": "atom-models",
            "name": "Модели атома"
          },
          {
            "id": "energy-levels",
            "name": "Энергетические уровни"
          },
          {
            "id": "electron-shells",
            "name": "Электронные оболочки"
          }
        ]
      },
      {
        "id": "quantum-physics",
        "name": "Квантовая физика",
        "topics": [
          {
            "id": "de-broglie-waves",
            "name": "Волны де Бройля"
          },
          {
            "id": "heisenberg-uncertainty",
            "name": "Неопределённость Гейзенберга"
          }
        ]
      },
      {
        "id": "nuclear-physics",
        "name": "Ядерная физика",
        "topics": [
          {
            "id": "nucleus-structure",
            "name": "Строение ядра"
          },
          {
            "id": "nuclear-forces",
            "name": "Ядерные силы"
          },
          {
            "id": "binding-energy",
            "name": "Энергия связи"
          }
        ]
      },
      {
        "id": "radioactivity",
        "name": "Радиоактивность",
        "topics": [
          {
            "id": "decay-types",
            "name": "Виды распада"
          },
          {
            "id": "decay-law",
            "name": "Закон радиоактивного распада"
          },
          {
            "id": "radiation-doses",
            "name": "Дозы излучения"
          }
        ]
      },
      {
        "id": "nuclear-reactions",
        "name": "Ядерные реакции",
        "topics": [
          {
            "id": "fission",
            "name": "Деление ядер"
          },
          {
            "id": "fusion",
            "name": "Термоядерный синтез"
          },
          {
            "id": "nuclear-energy-use",
            "name": "Применение ядерной энергии"
          }
        ]
      }
    ]
  },
  "relativity": {
    "name": "Специальная теория относительности",
    "icon": "infinite",
    "color": "#E67E22",
    "subsections": [
      {
        "id": "special-relativity",
        "name": "СТО",
        "topics": [
          {
            "id": "einstein-postulates",
            "name": "Постулаты Эйнштейна"
          },
          {
            "id": "lorentz-transformations",
            "name": "Преобразования Лоренца"
          },
          {
            "id": "time-dilation",
            "name": "Замедление времени"
          },
          {
            "id": "length-contraction",
            "name": "Сокращение длины"
          },
          {
            "id": "invariant-interval",
            "name": "Инвариантность интервала"
          },
          {
            "id": "mass-energy-emc2",
            "name": "Связь массы и энергии E = mc²"
          },
          {
            "id": "relativistic-momentum",
            "name": "Релятивистский импульс"
          },
          {
            "id": "relativistic-energy",
            "name": "Релятивистская энергия"
          },
          {
            "id": "lightspeed-limit",
            "name": "Недостижимость скорости света"
          }
        ]
      }
    ]
  },
  "astronomy": {
    "name": "Астрономия",
    "icon": "moon",
    "color": "#34495E",
    "subsections": [
      {
        "id": "celestial-mechanics",
        "name": "Небесная механика",
        "topics": [
          {
            "id": "solar-system-structure",
            "name": "Солнечная система"
          },
          {
            "id": "orbits-satellites",
            "name": "Орбиты планет и спутников"
          },
          {
            "id": "tides",
            "name": "Приливы и отливы"
          },
          {
            "id": "eclipses",
            "name": "Затмения Солнца и Луны"
          }
        ]
      },
      {
        "id": "sun-stars",
        "name": "Солнце и звёзды",
        "topics": [
          {
            "id": "sun-structure-activity",
            "name": "Солнце: строение и активность"
          },
          {
            "id": "stellar-spectra-hr",
            "name": "Спектры звёзд и диаграмма Герцшпрунга–Рассела"
          },
          {
            "id": "stellar-evolution-types",
            "name": "Эволюция и типы звёзд"
          },
          {
            "id": "compact-stars",
            "name": "Нейтронные звёзды, пульсары и чёрные дыры"
          }
        ]
      },
      {
        "id": "galaxies-cosmology",
        "name": "Галактики и космология",
        "topics": [
          {
            "id": "milky-way-galaxies",
            "name": "Млечный Путь и типы галактик"
          },
          {
            "id": "hubble-expansion",
            "name": "Расширение Вселенной и закон Хаббла"
          },
          {
            "id": "big-bang-cmb",
            "name": "Большой взрыв и реликтовое излучение"
          },
          {
            "id": "dark-cosmos-gr",
            "name": "Тёмная материя, тёмная энергия и ОТО (кратко)"
          }
        ]
      },
      {
        "id": "observational-astronomy",
        "name": "Наблюдательная астрономия",
        "topics": [
          {
            "id": "telescopes-types",
            "name": "Телескопы и приборы"
          },
          {
            "id": "angular-resolution",
            "name": "Увеличение и разрешающая способность"
          },
          {
            "id": "spectroscopy-photometry",
            "name": "Спектроскопия и фотометрия"
          },
          {
            "id": "distance-ladder-radio",
            "name": "Расстояния до объектов и радиоастрономия"
          }
        ]
      },
      {
        "id": "solar-system-bodies",
        "name": "Планеты, малые тела и жизнь",
        "topics": [
          {
            "id": "terrestrial-gas-planets",
            "name": "Планеты земной группы и газовые гиганты"
          },
          {
            "id": "moon-satellites",
            "name": "Луна и крупные спутники"
          },
          {
            "id": "small-bodies-exoplanets",
            "name": "Астероиды, кометы, экзопланеты"
          },
          {
            "id": "life-search",
            "name": "Обитаемая зона и поиск жизни"
          }
        ]
      }
    ]
  }
};

interface SectionChunk {
  SECTION_TOPICS: Record<string, TopicContent>;
  SECTION_FORMULAS: Formula[];
  SECTION_TASKS: Task[];
  SECTION_TESTS: Test[];
}

const sectionLoaders: Record<string, () => SectionChunk> = {
  /* eslint-disable @typescript-eslint/no-require-imports */
  mechanics: () => require('./physics/sections/mechanics') as SectionChunk,
  thermodynamics: () => require('./physics/sections/thermodynamics') as SectionChunk,
  electromagnetism: () => require('./physics/sections/electromagnetism') as SectionChunk,
  optics: () => require('./physics/sections/optics') as SectionChunk,
  atomic: () => require('./physics/sections/atomic') as SectionChunk,
  relativity: () => require('./physics/sections/relativity') as SectionChunk,
  astronomy: () => require('./physics/sections/astronomy') as SectionChunk,
  /* eslint-enable @typescript-eslint/no-require-imports */
};

const sectionCache: Record<string, SectionChunk> = {};
const sectionIds = Object.keys(PHYSICS_SECTIONS);

const topicSectionIndex: Record<string, string> = (() => {
  const index: Record<string, string> = {};
  for (const [sectionId, section] of Object.entries(PHYSICS_SECTIONS)) {
    for (const subsection of section.subsections) {
      for (const topic of subsection.topics) {
        index[topic.id] = sectionId;
      }
    }
  }
  return index;
})();

function getSectionChunk(sectionId: string): SectionChunk | null {
  if (sectionCache[sectionId]) return sectionCache[sectionId];
  const loader = sectionLoaders[sectionId];
  if (!loader) return null;
  const chunk = loader();
  sectionCache[sectionId] = chunk;
  return chunk;
}

export function getSectionIdByTopicId(topicId: string): string | null {
  return topicSectionIndex[topicId] || null;
}

export function getAvailableSectionIds(): string[] {
  return [...sectionIds];
}

export function preloadSectionData(sectionId: string): void {
  getSectionChunk(sectionId);
}

export function getTopicsContentBySection(sectionId: string): Record<string, TopicContent> {
  const chunk = getSectionChunk(sectionId);
  return chunk ? (chunk.SECTION_TOPICS as Record<string, TopicContent>) : {};
}

export function getFormulasBySection(sectionId: string): Formula[] {
  const chunk = getSectionChunk(sectionId);
  return chunk ? (chunk.SECTION_FORMULAS as Formula[]) : [];
}

export function getTasksBySection(sectionId: string): Task[] {
  const chunk = getSectionChunk(sectionId);
  return chunk ? (chunk.SECTION_TASKS as Task[]) : [];
}

export function getTestsBySection(sectionId: string): Test[] {
  const chunk = getSectionChunk(sectionId);
  return chunk ? (chunk.SECTION_TESTS as Test[]) : [];
}

export function getAllTopicsContent(): Record<string, TopicContent> {
  const merged: Record<string, TopicContent> = {};
  for (const sectionId of sectionIds) {
    Object.assign(merged, getTopicsContentBySection(sectionId));
  }
  return merged;
}

export function getAllFormulas(): Formula[] {
  return sectionIds.flatMap((sectionId) => getFormulasBySection(sectionId));
}

export function getAllTasks(): Task[] {
  return sectionIds.flatMap((sectionId) => getTasksBySection(sectionId));
}

export function getAllTests(): Test[] {
  return sectionIds.flatMap((sectionId) => getTestsBySection(sectionId));
}

export function getFormulaById(formulaId: string): Formula | null {
  for (const sectionId of sectionIds) {
    const formula = getFormulasBySection(sectionId).find((f) => f.id === formulaId);
    if (formula) return formula;
  }
  return null;
}

export function getTopicsBySubsection(sectionId: string, subsectionId: string): TopicContent[] {
  const section = PHYSICS_SECTIONS[sectionId];
  if (!section) return [];

  const subsection = section.subsections.find((s) => s.id === subsectionId);
  if (!subsection) return [];

  const sectionTopics = getTopicsContentBySection(sectionId);

  return subsection.topics.map((topic) => {
    return sectionTopics[topic.id] || {
      id: topic.id,
      section: sectionId,
      subsection: subsectionId,
      title: topic.name,
      brief_info: 'Section under development',
      example_problem: '',
      formulas: [],
    };
  });
}

export function getTopicById(topicId: string): TopicContent | null {
  const sectionId = topicSectionIndex[topicId];
  if (!sectionId) return null;
  return getTopicsContentBySection(sectionId)[topicId] || null;
}
