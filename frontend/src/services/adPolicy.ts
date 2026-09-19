export type MonetizedAction =
  | 'lesson_topic'
  | 'task'
  | 'test'
  | 'generated_test'
  | 'random_test'
  | 'formula';

export type AdRequirement = 'none' | 'rewarded' | 'interstitial';

export function getAdRequirement(action: MonetizedAction, isPro: boolean): AdRequirement {
  if (isPro) return 'none';
  if (action === 'formula') return 'interstitial';
  return 'rewarded';
}
