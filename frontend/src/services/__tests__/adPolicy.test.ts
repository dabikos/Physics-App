import { describe, expect, it } from 'vitest';

import { getAdRequirement } from '../adPolicy';

describe('getAdRequirement', () => {
  it('requires rewarded ads only for free users entering learning content', () => {
    expect(getAdRequirement('lesson_topic', false)).toBe('rewarded');
    expect(getAdRequirement('task', false)).toBe('rewarded');
    expect(getAdRequirement('test', false)).toBe('rewarded');
    expect(getAdRequirement('generated_test', false)).toBe('rewarded');
    expect(getAdRequirement('random_test', false)).toBe('rewarded');
  });

  it('requires an interstitial only when a free user opens a formula', () => {
    expect(getAdRequirement('formula', false)).toBe('interstitial');
  });

  it('never requires ads for Pro users', () => {
    expect(getAdRequirement('lesson_topic', true)).toBe('none');
    expect(getAdRequirement('formula', true)).toBe('none');
  });
});
