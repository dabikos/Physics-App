import { Platform } from 'react-native';
import Constants from 'expo-constants';

type GoogleMobileAdsModule = typeof import('react-native-google-mobile-ads');

const ADS_TEST_MODE = String(process.env.EXPO_PUBLIC_ADS_TEST_MODE || '').toLowerCase() === 'true';
const TEST_DEVICE_IDENTIFIERS = ['73501659-c885-4f9d-b3a4-bb2fbe0f9e60'];
const isExpoGo = Constants.appOwnership === 'expo';

let adsInitialized = false;
let googleMobileAdsModule: GoogleMobileAdsModule | null | undefined;

async function getGoogleMobileAdsModule(): Promise<GoogleMobileAdsModule | null> {
  if (isExpoGo) {
    return null;
  }

  if (googleMobileAdsModule !== undefined) {
    return googleMobileAdsModule;
  }

  try {
    // Native module is unavailable in Expo Go; keep this import lazy for dev builds.
    googleMobileAdsModule = await import('react-native-google-mobile-ads');
  } catch {
    googleMobileAdsModule = null;
  }

  return googleMobileAdsModule ?? null;
}

export const CHAT_REWARDED_AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/5224354917'
  : ADS_TEST_MODE
  ? 'ca-app-pub-3940256099942544/5224354917'
  : Platform.select({
      ios: 'ca-app-pub-4380583516308857/9258832559',
      android: 'ca-app-pub-4380583516308857/6637905622',
      default: 'ca-app-pub-3940256099942544/5224354917',
    }) ?? 'ca-app-pub-3940256099942544/5224354917';

export const LEARN_MORE_INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/1033173712'
  : ADS_TEST_MODE
  ? 'ca-app-pub-3940256099942544/1033173712'
  : Platform.select({
      ios: 'ca-app-pub-4380583516308857/2528726498',
      android: 'ca-app-pub-4380583516308857/1473208851',
      default: 'ca-app-pub-3940256099942544/1033173712',
    }) ?? 'ca-app-pub-3940256099942544/1033173712';

export async function initializeMobileAds(): Promise<void> {
  if (adsInitialized) return;

  const ads = await getGoogleMobileAdsModule();
  if (!ads) {
    return;
  }

  await ads.default().setRequestConfiguration({
    testDeviceIdentifiers: TEST_DEVICE_IDENTIFIERS,
  });
  await ads.default().initialize();
  adsInitialized = true;
}

export async function showRewardedChatAd(): Promise<boolean> {
  const ads = await getGoogleMobileAdsModule();
  if (!ads) {
    return false;
  }

  await initializeMobileAds();

  return await new Promise<boolean>((resolve) => {
    let finished = false;
    let earnedReward = false;
    const ad = ads.RewardedAd.createForAdRequest(
      __DEV__ || ADS_TEST_MODE ? ads.TestIds.REWARDED : CHAT_REWARDED_AD_UNIT_ID,
      { requestNonPersonalizedAdsOnly: true }
    );

    const finish = (value: boolean) => {
      if (finished) return;
      finished = true;
      unsubLoaded();
      unsubClosed();
      unsubError();
      unsubEarned();
      resolve(value);
    };

    const unsubLoaded = ad.addAdEventListener(ads.RewardedAdEventType.LOADED, () => {
      ad.show().catch(() => finish(false));
    });

    const unsubClosed = ad.addAdEventListener(ads.AdEventType.CLOSED, () => {
      finish(earnedReward);
    });

    const unsubError = ad.addAdEventListener(ads.AdEventType.ERROR, () => {
      finish(false);
    });

    const unsubEarned = ad.addAdEventListener(ads.RewardedAdEventType.EARNED_REWARD, () => {
      earnedReward = true;
    });

    ad.load();
  });
}

export async function showLearnMoreInterstitialAd(): Promise<boolean> {
  const ads = await getGoogleMobileAdsModule();
  if (!ads) {
    return false;
  }

  await initializeMobileAds();

  return await new Promise<boolean>((resolve) => {
    let finished = false;
    const ad = ads.InterstitialAd.createForAdRequest(
      __DEV__ || ADS_TEST_MODE
        ? ads.TestIds.INTERSTITIAL
        : LEARN_MORE_INTERSTITIAL_AD_UNIT_ID,
      { requestNonPersonalizedAdsOnly: true }
    );

    const finish = (shown: boolean) => {
      if (finished) return;
      finished = true;
      unsubLoaded();
      unsubClosed();
      unsubError();
      resolve(shown);
    };

    const unsubLoaded = ad.addAdEventListener(ads.AdEventType.LOADED, () => {
      ad.show().catch(() => finish(false));
    });

    const unsubClosed = ad.addAdEventListener(ads.AdEventType.CLOSED, () => {
      finish(true);
    });

    const unsubError = ad.addAdEventListener(ads.AdEventType.ERROR, () => {
      finish(false);
    });

    ad.load();
  });
}
