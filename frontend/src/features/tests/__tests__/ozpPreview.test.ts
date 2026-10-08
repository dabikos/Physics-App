import { describe, expect, it } from 'vitest';
import data from '../../../data/ozpPreview.json';
import { marchKeys, mayKeys } from '../../../data/ozpVerifiedKeys';

describe('OZP preview content', () => {
  it('keeps both source exams in the requested 40 + 10 order', () => {
    expect(data.sessions).toHaveLength(2);
    for (const session of data.sessions) {
      expect(session.questions).toHaveLength(50);
      expect(session.questions.map(q => q.position)).toEqual(Array.from({ length: 50 }, (_, i) => i + 1));
      expect(session.questions.slice(0, 40).every(q => !q.contextId)).toBe(true);
      expect(session.questions.slice(40).every(q => !!q.contextId)).toBe(true);
      expect(session.questions.every(q => q.options.length === 4 && q.options.every(Boolean))).toBe(true);
    }
  });

  it('includes source context and diagrams for every referenced question', () => {
    const contextIds = new Set(data.contexts.map(context => context.id));
    for (const session of data.sessions) {
      for (const question of session.questions) {
        if (question.contextId) expect(contextIds.has(question.contextId)).toBe(true);
      }
    }
    const diagrams = new Set(data.sessions.flatMap(session => session.questions.map(q => q.diagramId).filter(Boolean)));
    expect(diagrams).toEqual(new Set(['OZP-034', 'OZP-044', 'OZP-045', 'OZP-053', 'OZP-055', 'OZP-067', 'OZP-078', 'OZP-088']));
  });

  it('aligns independently checked answers to the original order and excludes disputed source items', () => {
    for (const [session, keys] of data.sessions.map((item, i) => [item, i === 0 ? marchKeys : mayKeys] as const)) {
      expect(keys).toHaveLength(50);
      expect(keys.map(entry => entry[0])).toEqual(session.questions.map(question => question.id));
      expect(keys.every(([_, correct, explanation], i) => Boolean(explanation) && (correct === undefined || (correct >= 0 && correct < session.questions[i].options.length)))).toBe(true);
    }
    expect(marchKeys.flatMap(([_, correct], i) => correct === undefined ? [i + 1] : [])).toEqual([11, 22, 28, 42]);
    expect(mayKeys.flatMap(([_, correct], i) => correct === undefined ? [i + 1] : [])).toEqual([41, 42]);
    // The same photon problem has differently ordered options in the two sets.
    expect(marchKeys[17][1]).toBe(2);
    expect(mayKeys[2][1]).toBe(3);
  });
});
