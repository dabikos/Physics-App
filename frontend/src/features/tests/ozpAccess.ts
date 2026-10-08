export const FREE_OZP_SESSION_ID = '2026-03-11';
export const OZP_SESSIONS = [
  { id: FREE_OZP_SESSION_ID, titleKey: 'marchTest', detailKey: 'ozpCardDetail' },
  { id: '2026-05-25', titleKey: 'mayTest', detailKey: 'ozpCardDetail' },
  { id: 'nnt-50', titleKey: 'newTest', detailKey: 'newTestDetail' },
] as const;

export function canOpenOzp(sessionId: string, isPro: boolean): boolean {
  return OZP_SESSIONS.some(session => session.id === sessionId) && (sessionId === FREE_OZP_SESSION_ID || isPro);
}
