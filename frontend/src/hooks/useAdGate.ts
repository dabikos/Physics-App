import { useCallback } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { showContentInterstitialAd, showRewardedFeatureAd } from '../services/adService';

export function useAdGate() {
  const { isPro, hasAds } = useSubscription();

  const showContentAdIfNeeded = useCallback(async () => {
    if (!hasAds) return true;
    await showContentInterstitialAd();
    return true;
  }, [hasAds]);

  const requireRewardedAdForFeature = useCallback(async () => {
    if (isPro) return true;
    return showRewardedFeatureAd();
  }, [isPro]);

  return {
    showContentAdIfNeeded,
    requireRewardedAdForFeature,
  };
}
