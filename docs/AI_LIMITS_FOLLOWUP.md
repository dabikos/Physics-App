# AI limits follow-up

Deferred product and implementation work agreed on 2026-09-19.

## Recommended daily limits

| Plan | AI chat | Learn more | Task generation | Test generation |
| --- | ---: | ---: | ---: | ---: |
| Free | 5 | 1 | 1 | 1 |
| Basic | 20 | 5 | 5 | 5 |
| Pro | 60 | 15 | 15 | 15 |

- One rewarded ad grants one additional AI chat message.
- Limit rewarded chat grants to five per user per UTC day.
- Enforce the rewarded limit on the backend; do not trust a client-only claim.
- Reduce the normal chat completion limit from 4096 to about 2000 output tokens.

## User-facing quota errors

The backend should return a structured quota error containing:

- error code;
- feature (`learn_more`, `task_generation`, or `test_generation`);
- subscription tier;
- daily limit;
- used and remaining counts;
- next reset time.

The mobile app must display localized messages instead of raw backend text. Example:

> Дневной лимит исчерпан. На тарифе Free доступна 1 генерация раздела «Изучить больше» в день. Лимит обновится завтра в 05:00.

Use the corresponding feature name and actual plan allowance for generated tasks and tests.

## Deployment impact

- Backend quota changes require a Railway redeploy.
- Localized UI handling and rewarded-ad UX require a new Android APK/AAB build.

