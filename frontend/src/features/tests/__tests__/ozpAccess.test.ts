import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { canOpenOzp, FREE_OZP_SESSION_ID, OZP_SESSIONS } from '../ozpAccess';
import freeExam from '../../../data/ozpFree.json';

describe('OZP subscription access', () => {
  it('keeps only the first exam free and allows all three for Pro', () => {
    expect(OZP_SESSIONS[0].id).toBe(FREE_OZP_SESSION_ID);
    expect(freeExam.id).toBe(FREE_OZP_SESSION_ID);
    for (const session of OZP_SESSIONS) {
      expect(canOpenOzp(session.id, false)).toBe(session.id === FREE_OZP_SESSION_ID);
      expect(canOpenOzp(session.id, true)).toBe(true);
    }
    expect(canOpenOzp('unknown', true)).toBe(false);
  });

  it('does not bundle premium question sets through the exam route', () => {
    const route = readFileSync(resolve(__dirname, '../../../../app/exams/ozp.tsx'), 'utf8');
    expect(route).not.toContain('ozpPreview');
    expect(route).not.toContain('ozpNnt');
    expect(route).not.toContain('ozpVerifiedKeys');
    expect(route).toContain('canOpenOzp');
    expect(route).toContain('/exams/ozp/');
    expect(route).not.toContain('requirePro(');
  });
});
