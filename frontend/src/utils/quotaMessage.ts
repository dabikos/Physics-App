import type { QuotaErrorDetail } from '../services/aiService'

type Translate = (key: string, options?: Record<string, unknown>) => string

const FEATURE_KEYS: Record<string, string> = {
  learn_more: 'quota.features.learnMore',
  task_generation: 'quota.features.taskGeneration',
  test_generation: 'quota.features.testGeneration',
  random_test: 'quota.features.randomTest',
}

export function formatQuotaError(
  detail: QuotaErrorDetail | undefined,
  t: Translate,
  fallback: string,
): string {
  if (detail?.code !== 'AI_GENERATION_LIMIT_REACHED' || !detail.quota) return fallback

  const resetDate = detail.quota.reset_at ? new Date(detail.quota.reset_at) : null
  const resetTime = resetDate && !Number.isNaN(resetDate.getTime())
    ? resetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : t('quota.nextDay')
  const tier = t(`quota.plans.${detail.quota.tier}`, { defaultValue: detail.quota.tier })
  const feature = t(FEATURE_KEYS[detail.resource || ''] || 'quota.features.generation')

  return t('quota.generationLimitReached', {
    plan: tier,
    feature,
    limit: detail.quota.limit,
    time: resetTime,
  })
}

