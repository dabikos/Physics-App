import mobileAds, {
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

const ADS_TEST_MODE = String(process.env.EXPO_PUBLIC_ADS_TEST_MODE || '').toLowerCase() === 'true';
const TEST_DEVICE_IDENTIFIERS = ['73501659-c885-4f9d-b3a4-bb2fbe0f9e60'];

export const CHAT_REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : ADS_TEST_MODE
  ? TestIds.REWARDED
  : Platform.select({
      ios: 'ca-app-pub-4380583516308857/9258832559',
      android: 'ca-app-pub-4380583516308857/6637905622',
      default: TestIds.REWARDED,
    }) ?? TestIds.REWARDED;

export const LEARN_MORE_INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : ADS_TEST_MODE
  ? TestIds.INTERSTITIAL
  : Platform.select({
      ios: 'ca-app-pub-4380583516308857/2528726498',
      android: 'ca-app-pub-4380583516308857/1473208851',
      default: TestIds.INTERSTITIAL,
    }) ?? TestIds.INTERSTITIAL;

let adsInitialized = false;

export async function initializeMobileAds(): Promise<void> {
  if (adsInitialized) return;
  await mobileAds().setRequestConfiguration({
    testDeviceIdentifiers: TEST_DEVICE_IDENTIFIERS,
  });
  await mobileAds().initialize();
  adsInitialized = true;
}

export async function showRewardedChatAd(): Promise<boolean> {
  await initializeMobileAds();

  return await new Promise<boolean>((resolve) => {
    let finished = false;
    let earnedReward = false;
    const ad = RewardedAd.createForAdRequest(CHAT_REWARDED_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    const finish = (value: boolean) => {
      if (finished) return;
      finished = true;
      unsubLoaded();
      unsubClosed();
      unsubError();
      unsubEarned();
      resolve(value);
    };

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      ad.show().catch(() => finish(false));
    });

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      finish(earnedReward);
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      finish(false);
    });

    const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earnedReward = true;
    });

    ad.load();
  });
}

export async function showLearnMoreInterstitialAd(): Promise<boolean> {
  await initializeMobileAds();

  return await new Promise<boolean>((resolve) => {
    let finished = false;
    const ad = InterstitialAd.createForAdRequest(LEARN_MORE_INTERSTITIAL_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    const finish = (shown: boolean) => {
      if (finished) return;
      finished = true;
      unsubLoaded();
      unsubClosed();
      unsubError();
      resolve(shown);
    };

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      ad.show().catch(() => finish(false));
    });

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      finish(true);
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      finish(false);
    });

    ad.load();
  });
}
