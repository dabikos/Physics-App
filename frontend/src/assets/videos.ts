/**
 * Импорты всех локальных видео
 * Добавляйте новые видео здесь
 */

export const Videos = {
  'ohm-law': require('../../assets/videos/ohm-law.mp4'),
  // Добавьте другие видео:
  // 'work-power': require('../../assets/videos/work-power.mp4'),
  // 'resistance': require('../../assets/videos/resistance.mp4'),
};

/**
 * Тип для ключей видео
 */
export type VideoKey = keyof typeof Videos;












