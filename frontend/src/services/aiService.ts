/**
 * OpenAI AI Service
 * Работает через бэкенд API (ключи хранятся на сервере)
 */

import api from './api';

// Доступные модели (для справки, реальный выбор делает бэкенд)
export const AI_MODELS = {
  GPT5_NANO: 'gpt-5-nano',
} as const;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  success: boolean;
  content: string;
  error?: string;
  errorCode?: string;
  quota?: ChatQuota;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface ChatQuota {
  day: string;
  free_limit: number;
  free_used: number;
  free_remaining: number;
  rewarded_credits: number;
}

/**
 * Отправка запроса к AI через бэкенд
 */
export async function sendAIRequest(
  messages: ChatMessage[],
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<AIResponse> {
  try {
    // Формируем сообщение из массива (берём последнее user сообщение)
    const userMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    
    // Формируем полный промпт
    const fullMessage = systemMessage 
      ? `${systemMessage}\n\n${userMessage}`
      : userMessage;

    const response = await api.post('/chat', {
      message: fullMessage,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature ?? 0.7,
    });

    return {
      success: true,
      content: response.data.response || '',
      quota: response.data.quota,
    };
  } catch (error: any) {
    const detail = error.response?.data?.detail;
    const errorMessage =
      (typeof detail === 'object' ? detail?.message : detail) ||
      error.message ||
      'Ошибка AI сервиса';
    return {
      success: false,
      content: '',
      error: errorMessage,
      errorCode: typeof detail === 'object' ? detail?.code : undefined,
      quota: typeof detail === 'object' ? detail?.quota : undefined,
    };
  }
}

/**
 * Генерация расширенного контента темы
 */
export async function generateExpandedContent(
  topicTitle: string,
  briefInfo: string,
  sectionName: string,
  language: string = 'русский',
  topicId?: string
): Promise<AIResponse> {
  const resolvedTopicId = topicId?.trim();
  if (resolvedTopicId) {
    try {
      const response = await api.post(`/topics/${encodeURIComponent(resolvedTopicId)}/generate`, {
        topic_id: resolvedTopicId,
        content_type: 'detailed',
      });
      return {
        success: true,
        content: response.data?.content || '',
      };
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      return {
        success: false,
        content: '',
        error: (typeof detail === 'string' ? detail : detail?.message) || error.message || 'Failed to load content',
      };
    }
  }

  const systemPrompt = `Ты — опытный преподаватель физики. Твоя задача — объяснять сложные концепции простым и понятным языком для школьников и студентов.

ВАЖНО: Все формулы и математические выражения должны быть в формате LaTeX:
- Блочные формулы: $$F = ma$$ (отдельной строкой)
- Inline формулы: $v = v_0 + at$ (в тексте)

Примеры правильного использования:
- "Согласно второму закону Ньютона: $$F = ma$$"
- "где $m$ — масса тела, $a$ — ускорение"
- "Кинетическая энергия: $$E_k = \\frac{1}{2}mv^2$$"

Правила:
- Пиши на языке: ${language}
- ВСЕ формулы ТОЛЬКО в LaTeX формате
- Используй примеры из реальной жизни
- Объясняй формулы пошагово
- Добавляй интересные факты
- Структурируй текст с заголовками
- Избегай слишком сложных терминов без объяснения`;

  const userPrompt = `Напиши расширенное объяснение темы "${topicTitle}" из раздела "${sectionName}".

Краткая информация о теме:
${briefInfo}

Структура ответа:
1. **Введение** — что это и зачем нужно
2. **Основные понятия** — ключевые термины и определения  
3. **Физический смысл** — как это работает на практике
4. **Примеры из жизни** — где мы это встречаем
5. **Формулы и расчёты** — основные формулы в LaTeX с пояснениями
6. **Интересные факты** — что ещё интересного связано с этой темой
7. **Итог** — краткое резюме

ВАЖНО: Все формулы записывай в формате LaTeX ($$...$$ или $...$).
Отвечай на языке: ${language}.
Пиши подробно, но понятно. Объём: 800-1200 слов.`;

  return sendAIRequest([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], {
    model: AI_MODELS.GPT5_NANO,
    maxTokens: 4096,
    temperature: 0.7,
  });
}

/**
 * AI Чат по физике
 */
export async function sendChatMessage(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  language: string = 'русский'
): Promise<AIResponse> {
  const systemPrompt = `Ты — AI помощник по физике. Помогаешь школьникам и студентам понимать физику.

ВАЖНО: Все формулы и математические выражения записывай в формате LaTeX:
- Блочные формулы (отдельной строкой): $$F = ma$$
- Inline формулы (в тексте): $v = v_0 + at$

Примеры:
- "Закон Ома: $$I = \\frac{U}{R}$$"
- "где $I$ — сила тока, $U$ — напряжение, $R$ — сопротивление"

Правила:
- Отвечай на языке: ${language}
- ВСЕ формулы ТОЛЬКО в LaTeX формате
- Объясняй понятно и пошагово
- Используй примеры из жизни
- При использовании формулы — объясни каждый символ
- Если вопрос не по физике — вежливо переведи тему на физику
- Будь дружелюбным и поддерживающим`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  return sendAIRequest(messages, {
    model: AI_MODELS.GPT5_NANO,
    maxTokens: 2048,
    temperature: 0.8,
  });
}

/**
 * Генерация подсказки для задачи
 */
export async function generateTaskHint(
  taskCondition: string,
  currentStep?: string,
  language: string = 'русский'
): Promise<AIResponse> {
  const systemPrompt = `Ты — репетитор по физике. Даёшь подсказки, но НЕ решаешь задачу целиком.

ВАЖНО: Все формулы записывай в формате LaTeX:
- Блочные формулы: $$F = ma$$
- Inline формулы: $v$, $t$, $a$

Правила:
- Отвечай на языке: ${language}
- Подскажи направление мысли
- Напомни нужную формулу в LaTeX формате
- НЕ давай готовый ответ
- Помоги ученику самому дойти до решения`;

  const userPrompt = currentStep
    ? `Задача: ${taskCondition}\n\nУченик на этапе: ${currentStep}\n\nДай небольшую подсказку для следующего шага. Формулы пиши в LaTeX.`
    : `Задача: ${taskCondition}\n\nДай подсказку с чего начать решение. Формулы пиши в LaTeX.`;

  return sendAIRequest([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], {
    model: AI_MODELS.GPT5_NANO,
    maxTokens: 512,
    temperature: 0.6,
  });
}

/**
 * Проверка доступности API
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const result = await sendAIRequest([
      { role: 'user', content: 'Привет' }
    ], { maxTokens: 10 });
    
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Получить информацию о лимитах
 */
export async function getChatQuota(): Promise<{ success: boolean; quota?: ChatQuota; error?: string }> {
  try {
    const response = await api.get('/chat/quota');
    return { success: true, quota: response.data };
  } catch (error: any) {
    const detail = error.response?.data?.detail;
    return {
      success: false,
      error: (typeof detail === 'string' ? detail : detail?.message) || error.message || 'Не удалось получить лимиты чата',
    };
  }
}

export async function claimRewardedChatCredit(
  adUnit: string
): Promise<{ success: boolean; quota?: ChatQuota; error?: string }> {
  try {
    const response = await api.post('/chat/rewarded/claim', {
      ad_unit: adUnit,
      platform: 'android',
    });
    return { success: true, quota: response.data?.quota };
  } catch (error: any) {
    const detail = error.response?.data?.detail;
    return {
      success: false,
      error: (typeof detail === 'string' ? detail : detail?.message) || error.message || 'Не удалось начислить рекламный кредит',
    };
  }
}

export function getAPILimits() {
  return {
    openai: {
      'gpt-5-nano': { rpm: 30, rpd: 5000, description: 'OpenAI GPT-5 Nano' },
    },
  };
}

/**
 * Интерфейс сгенерированного теста
 */
export interface GeneratedTestQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface GeneratedTest {
  title: string;
  section: string;
  difficulty: string;
  questions: GeneratedTestQuestion[];
}

/**
 * Генерация теста по физике с AI
 */
export async function generateTest(
  sectionName: string,
  sectionKey: string,
  difficulty: 'basic' | 'standard' | 'advanced' | 'olympiad',
  questionCount: number,
  language: string = 'русский'
): Promise<{ success: boolean; test?: GeneratedTest; error?: string }> {
  const difficultyDescriptions = {
    basic: 'базовый уровень — простые вопросы на понимание основ',
    standard: 'стандартный уровень — вопросы средней сложности с расчётами',
    advanced: 'продвинутый уровень — сложные вопросы с комплексными задачами',
    olympiad: 'олимпиадный уровень — очень сложные нестандартные задачи',
  };

  const systemPrompt = `Ты — эксперт по составлению тестов по физике. Создаёшь качественные тестовые вопросы с вариантами ответов.

ВАЖНО: Формулы записывай в Unicode символах для лучшего отображения:
- Используй: ², ³, ⁴ для степеней
- Используй: ₀, ₁, ₂ для индексов  
- Используй: α, β, γ, δ, θ, λ, μ, π, ω для греческих букв
- Используй: ·, ×, ÷, √, ∞, →, ≈, ≠, ≤, ≥ для операторов

Примеры правильного написания:
- "F = ma" вместо "F = m*a"
- "E = mc²" вместо "E = mc^2"
- "v₀" вместо "v_0"
- "sinα" вместо "sin(alpha)"

Правила:
- Пиши на языке: ${language}
- Каждый вопрос должен иметь 4 варианта ответа
- Только ОДИН ответ правильный
- Вопросы должны быть разнообразными
- Включай как теоретические, так и расчётные вопросы
- Для расчётных задач указывай все необходимые данные`;

  const userPrompt = `Создай тест по физике:
- Раздел: ${sectionName}
- Сложность: ${difficultyDescriptions[difficulty]}
- Количество вопросов: ${questionCount}

КРИТИЧЕСКИ ВАЖНО:
1. Для расчётных задач СНАЧАЛА вычисли правильный ответ
2. В объяснении укажи РЕАЛЬНЫЙ расчёт с финальным ответом (например: "s = v·t = 36·10 = 360 м")
3. Правильный ответ (correct) ДОЛЖЕН точно совпадать с финальным ответом в объяснении
4. Если в объяснении написано "= 360 м", то правильный ответ должен быть вариантом "360 м"

Верни ответ СТРОГО в JSON формате:
{
  "title": "Название теста",
  "questions": [
    {
      "question": "Текст вопроса",
      "options": ["Вариант A", "Вариант B", "Вариант C", "Вариант D"],
      "correct": 0,
      "explanation": "Краткое пояснение с расчётом и финальным ответом (например: 's = v·t = 36·10 = 360 м')"
    }
  ]
}

Где "correct" — индекс правильного ответа (0-3), который ТОЧНО совпадает с финальным ответом в explanation.
Формулы пиши в Unicode (², α, ·, √ и т.д.), НЕ в LaTeX.
Верни ТОЛЬКО JSON, без дополнительного текста.`;

  const result = await sendAIRequest([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], {
    model: AI_MODELS.GPT5_NANO,
    maxTokens: 4096,
    temperature: 0.7,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    // Извлекаем JSON из ответа
    let jsonStr = result.content;
    
    // Убираем markdown блоки если есть
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Пробуем найти JSON объект
    const jsonStartIndex = jsonStr.indexOf('{');
    const jsonEndIndex = jsonStr.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      jsonStr = jsonStr.slice(jsonStartIndex, jsonEndIndex + 1);
    }

    const parsed = JSON.parse(jsonStr);
    
    // Валидация
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return { success: false, error: 'Неверный формат ответа AI' };
    }

    // Функция для извлечения числового значения из текста
    const extractValueFromText = (text: string): string | null => {
      // Ищем паттерны типа "= 360 м", "= 60 Дж", "360 м", "60 Дж" и т.д.
      // Ищем последнее числовое значение с единицами измерения (обычно это финальный ответ)
      const patterns = [
        /=\s*([0-9,.\s×·]+)\s*([А-Яа-яЁёA-Za-z²³⁴°\/]+)/g,  // = 360 м, = 60 Дж
        /([0-9,.\s×·]+)\s*([А-Яа-яЁёA-Za-z²³⁴°\/]+)/g,      // 360 м, 60 Дж
      ];
      
      let allMatches: RegExpMatchArray[] = [];
      for (const pattern of patterns) {
        const matches = [...text.matchAll(pattern)];
        allMatches.push(...matches);
      }
      
      // Берем последнее совпадение (обычно это финальный ответ)
      if (allMatches.length > 0) {
        const lastMatch = allMatches[allMatches.length - 1];
        let number = lastMatch[1].trim().replace(/\s/g, '').replace(/×/g, '').replace(/·/g, '');
        const unit = lastMatch[2].trim();
        
        // Обрабатываем случаи с умножением типа "36·10 = 360"
        if (number.includes('=')) {
          const parts = number.split('=');
          number = parts[parts.length - 1].trim();
        }
        
        return `${number} ${unit}`;
      }
      
      return null;
    };

    // Функция для извлечения числа из текста
    const extractNumber = (text: string): string | null => {
      const match = text.match(/([0-9,.\s]+)/);
      return match ? match[1].trim().replace(/\s/g, '').replace(/,/g, '.') : null;
    };

    // Валидация и исправление правильных ответов
    const validatedQuestions = parsed.questions.map((q: any) => {
      let correctIndex = typeof q.correct === 'number' ? q.correct : 0;
      const options = q.options || ['', '', '', ''];
      const explanation = q.explanation || '';

      // Если есть объяснение, пытаемся извлечь из него правильный ответ
      if (explanation) {
        const extractedValue = extractValueFromText(explanation);
        
        if (extractedValue) {
          // Извлекаем число из извлеченного значения
          const extractedNumber = extractNumber(extractedValue);
          const extractedUnit = extractedValue.split(' ').slice(1).join(' ').trim();
          
          if (extractedNumber) {
            // Ищем этот ответ среди вариантов
            for (let i = 0; i < options.length; i++) {
              const optionNumber = extractNumber(options[i]);
              const optionUnit = options[i].replace(/[0-9,.\s]/g, '').trim();
              
              // Проверяем совпадение числа и единицы измерения
              if (optionNumber && extractedNumber) {
                // Сравниваем числа (с учетом возможных различий в формате)
                const num1 = parseFloat(optionNumber);
                const num2 = parseFloat(extractedNumber);
                
                // Если числа совпадают (с небольшой погрешностью) и единицы похожи
                if (Math.abs(num1 - num2) < 0.01) {
                  // Проверяем единицы измерения (может быть разный формат, но смысл тот же)
                  const unitsMatch = !extractedUnit || 
                    optionUnit.toLowerCase().includes(extractedUnit.toLowerCase()) ||
                    extractedUnit.toLowerCase().includes(optionUnit.toLowerCase()) ||
                    optionUnit.length === 0; // Если единицы не указаны в варианте
                  
                  if (unitsMatch) {
                    correctIndex = i;
                    console.log(`Исправлен правильный ответ для вопроса: "${q.question.substring(0, 50)}..."`);
                    console.log(`  Было: ${options[typeof q.correct === 'number' ? q.correct : 0]}`);
                    console.log(`  Стало: ${options[i]}`);
                    console.log(`  Из объяснения: ${extractedValue}`);
                    break;
                  }
                }
              }
            }
          }
        }
      }

      return {
        question: q.question || '',
        options,
        correct: correctIndex,
        explanation,
      };
    });

    const test: GeneratedTest = {
      title: parsed.title || `Тест по ${sectionName}`,
      section: sectionKey,
      difficulty,
      questions: validatedQuestions,
    };

    return { success: true, test };
  } catch (parseError: any) {
    console.error('Parse error:', parseError, result.content);
    return { success: false, error: 'Ошибка парсинга ответа AI. Попробуйте ещё раз.' };
  }
}

