export const CHAT_REWARDED_AD_UNIT_ID = 'web-test-ad-unit';
export const LEARN_MORE_INTERSTITIAL_AD_UNIT_ID = 'web-test-interstitial-ad-unit';

export async function initializeMobileAds(): Promise<void> {
  // No-op on web
}

export function showRewardedAdForChat(
  onRewarded: (reward: { type: string; amount: number }) => void,
  callbacks?: {
    onAdLoaded?: () => void;
    onAdClosed?: () => void;
    onError?: (error: Error) => void;
    onAdNotReady?: () => void;
  }
): void {
  // On web simulation, immediately grant reward
  console.log('[Web Mock] Rewarded ad simulated');
  callbacks?.onAdLoaded?.();
  onRewarded({ type: 'coins', amount: 1 });
  callbacks?.onAdClosed?.();
}

export function showLearnMoreInterstitial(
  onDismiss: () => void,
  callbacks?: {
    onAdLoaded?: () => void;
    onError?: (error: Error) => void;
  }
): void {
  // On web simulation, immediately proceed
  console.log('[Web Mock] Interstitial ad simulated');
  callbacks?.onAdLoaded?.();
  onDismiss();
}

export async function showContentInterstitialAd(): Promise<boolean> {
  return true;
}

export async function showRewardedFeatureAd(): Promise<boolean> {
  return true;
}
