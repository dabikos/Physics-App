import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import Constants from 'expo-constants';
import { useSubscription } from '../context/SubscriptionContext';
import { getAdRequirement, MonetizedAction } from '../services/adPolicy';
import { showContentInterstitialAd, showRewardedFeatureAd } from '../services/adService';

export function useAdGate() {
  const { isPro, hasAds } = useSubscription();
  const gateInProgressRef = useRef(false);

  const showContentAdIfNeeded = useCallback(async () => {
    if (!hasAds) return true;
    await showContentInterstitialAd();
    return true;
  }, [hasAds]);

  const requireRewardedAdForFeature = useCallback(async () => {
    if (isPro) return true;
    return showRewardedFeatureAd();
  }, [isPro]);

  const requireAdForAction = useCallback(async (action: MonetizedAction) => {
    if (gateInProgressRef.current) return false;

    // Expo Go cannot load custom native AdMob modules. Keep content testable there;
    // real ads are exercised in a development build or the Google Play build.
    if (Constants.appOwnership === 'expo') return true;

    const requirement = getAdRequirement(action, isPro);
    if (requirement === 'none') return true;

    gateInProgressRef.current = true;
    try {
      const allowed = requirement === 'rewarded'
        ? await showRewardedFeatureAd()
        : await showContentInterstitialAd();

      if (!allowed) {
        Alert.alert(
          'Реклама недоступна',
          requirement === 'rewarded'
            ? 'Не удалось загрузить видео. Проверьте интернет и попробуйте ещё раз.'
            : 'Не удалось загрузить рекламу. Попробуйте ещё раз.',
        );
      }

      return allowed;
    } catch (error) {
      console.warn(`[AdMob] ${action} gate failed`, error);
      Alert.alert('Реклама недоступна', 'Не удалось запустить рекламу. Попробуйте ещё раз.');
      return false;
    } finally {
      gateInProgressRef.current = false;
    }
  }, [isPro]);

  return {
    showContentAdIfNeeded,
    requireRewardedAdForFeature,
    requireAdForAction,
  };
}
