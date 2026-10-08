import { describe, expect, it } from 'vitest';
import { PUSH_LANGUAGES, pushCategories, pushChannelNames, pushDestination, pushLanguage } from '../pushPresentation';

describe('phone notification actions', () => {
  it('opens the assigned test for a student', () => {
    expect(pushDestination({ type: 'assigned_test', test_id: 'assigned-123' }, 'student')).toEqual({
      pathname: '/tests/assigned', params: { testId: 'assigned-123' },
    });
  });

  it('opens the specific student and result for a teacher', () => {
    expect(pushDestination({ type: 'test_result', student_id: 'student-1', result_id: 'result-2' }, 'teacher')).toEqual({
      pathname: '/teacher/classes', params: { studentId: 'student-1', resultId: 'result-2' },
    });
  });

  it('handles older pushes without result metadata and ignores untrusted URLs', () => {
    expect(pushDestination({ type: 'test_result', result_id: 'old-result' }, 'teacher')).toEqual({
      pathname: '/teacher/classes', params: { studentId: undefined, resultId: 'old-result' },
    });
    expect(pushDestination({ url: 'https://example.com' }, 'student')).toBe('/notifications');
    expect(pushDestination({ type: 'assigned_test', test_id: '123' }, 'teacher')).toBe('/notifications');
    expect(pushDestination({ type: 'assigned_test' }, 'student')).toBe('/notifications');
    expect(pushDestination({ type: 'daily_reminder' }, 'student')).toBe('/(tabs)');
  });

  it('uses matching category IDs and translated buttons in all three languages', () => {
    const ids = PUSH_LANGUAGES.flatMap(language => pushCategories(language).map(category => category.identifier));
    expect(new Set(ids).size).toBe(9);
    expect(pushCategories('ru')[0].title).toBe('Начать тест');
    expect(pushCategories('en')[0].title).toBe('Start test');
    expect(pushCategories('kk')[0].title).toBe('Тестті бастау');
    expect(pushChannelNames('en').reminders).toBe('Learning reminders');
  });

  it('normalizes locale variants', () => {
    expect(pushLanguage('en-US')).toBe('en');
    expect(pushLanguage('kk-KZ')).toBe('kk');
    expect(pushLanguage('kz')).toBe('kk');
    expect(pushLanguage('de')).toBe('ru');
  });
});
