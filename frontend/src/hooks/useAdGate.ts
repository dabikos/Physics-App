import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import Constants from 'expo-constants';
import { useSubscription } from '../context/SubscriptionContext';
import { getAdRequirement, MonetizedAction } from '../services/adPolicy';
import { showContentInterstitialAd, showRewardedFeatureAd } from '../services/adService';
import { useTranslation } from 'react-i18next';

export function useAdGate() {
  const { hasAds } = useSubscription();
  const { t } = useTranslation();
  const gateInProgressRef = useRef(false);

  const showContentAdIfNeeded = useCallback(async () => {
    if (!hasAds) return true;
    await showContentInterstitialAd();
    return true;
  }, [hasAds]);

  const requireRewardedAdForFeature = useCallback(async () => {
    if (!hasAds) return true;
    return showRewardedFeatureAd();
  }, [hasAds]);

  const requireAdForAction = useCallback(async (action: MonetizedAction) => {
    if (gateInProgressRef.current) return false;

    // Expo Go cannot load custom native AdMob modules. Keep content testable there;
    // real ads are exercised in a development build or the Google Play build.
    if (Constants.appOwnership === 'expo') return true;

    const requirement = getAdRequirement(action, !hasAds);
    if (requirement === 'none') return true;

    gateInProgressRef.current = true;
    try {
      const allowed = requirement === 'rewarded'
        ? await showRewardedFeatureAd()
        : await showContentInterstitialAd();

      if (!allowed) {
        Alert.alert(
          t('ads.unavailableTitle'),
          requirement === 'rewarded'
            ? t('ads.rewardedUnavailable')
            : t('ads.interstitialUnavailable'),
        );
      }

      return allowed;
    } catch (error) {
      console.warn(`[AdMob] ${action} gate failed`, error);
      Alert.alert(t('ads.unavailableTitle'), t('ads.startError'));
      return false;
    } finally {
      gateInProgressRef.current = false;
    }
  }, [hasAds, t]);

  return {
    showContentAdIfNeeded,
    requireRewardedAdForFeature,
    requireAdForAction,
  };
}
