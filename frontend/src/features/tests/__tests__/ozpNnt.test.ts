import { describe, expect, it } from 'vitest';
import { nntContexts, nntQuestions } from '../../../data/ozpNnt';

describe('new OZP screenshot set', () => {
  it('contains 50 unique questions in the 40 + 10 order', () => {
    expect(nntQuestions).toHaveLength(50);
    expect(nntQuestions.map(q => q.id)).toEqual(Array.from({ length: 50 }, (_, i) => `NNT-${String(i + 1).padStart(3, '0')}`));
    expect(nntQuestions.slice(0, 40).every(q => !q.contextId)).toBe(true);
    expect(nntQuestions.slice(40).every(q => q.contextId === 'motion' || q.contextId === 'component')).toBe(true);
    expect(nntQuestions.every(q => q.options.length === 4 && q.options.every(Boolean) && q.explanation)).toBe(true);
  });

  it('leaves flawed or ambiguous source items ungraded', () => {
    const disputed = nntQuestions.filter(q => q.correct === undefined).map(q => Number(q.id.slice(-3)));
    expect(disputed).toEqual([7, 18, 23, 31, 49]);
    expect(nntQuestions.filter(q => q.correct !== undefined)).toHaveLength(45);
    expect(nntQuestions.every(q => q.correct === undefined || (q.correct >= 0 && q.correct < q.options.length))).toBe(true);
  });

  it('connects both context images and standalone question figures', () => {
    expect(nntContexts.motion.illustrationId).toBe('nnt_motion');
    expect(nntContexts.component.illustrationId).toBe('nnt_ui');
    expect(nntQuestions.filter(q => q.diagramId).map(q => q.id)).toEqual([
      'NNT-004', 'NNT-007', 'NNT-029', 'NNT-030', 'NNT-034', 'NNT-043',
    ]);
  });
});
