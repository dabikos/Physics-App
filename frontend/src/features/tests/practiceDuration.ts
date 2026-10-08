const MIN_PRACTICE_SECONDS = 5 * 60;

/** Time limits from the API are seconds. AI tests without a limit get one minute per question. */
export function practiceDurationSeconds(timeLimit: unknown, questionCount: number): number {
  const parsed = typeof timeLimit === 'number' || typeof timeLimit === 'string' ? Number(timeLimit) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  return Math.max(MIN_PRACTICE_SECONDS, Math.max(0, Math.floor(questionCount)) * 60);
}
