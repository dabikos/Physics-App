import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import {
  REVENUECAT_ENTITLEMENT_ID,
  REVENUECAT_OFFERING_ID,
  REVENUECAT_PRODUCTS,
  RevenueCatProductId,
  getRevenueCatApiKey,
} from '../config/revenueCat';

let configurePromise: Promise<boolean> | null = null;
let loggedInAppUserId: string | null = null;

export function isProCustomer(customerInfo: CustomerInfo | null | undefined) {
  return Boolean(customerInfo?.entitlements.active[REVENUECAT_ENTITLEMENT_ID]);
}

export function getRevenueCatErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: string }).message || 'RevenueCat request failed');
  }

  return 'RevenueCat request failed';
}

export async function configureRevenueCat(appUserId?: string | null) {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios' && Platform.OS !== 'web') {
    return false;
  }

  const apiKey = getRevenueCatApiKey();
  if (!apiKey) {
    console.warn(`RevenueCat API key is not configured for ${Platform.OS}`);
    return false;
  }

  if (!configurePromise) {
    configurePromise = (async () => {
      try {
        const alreadyConfigured = await Purchases.isConfigured().catch(() => false);
        if (!alreadyConfigured) {
          if (__DEV__) {
            Purchases.setLogLevel(LOG_LEVEL.DEBUG);
          }

          Purchases.configure({ apiKey });
        }

        return true;
      } catch (error) {
        configurePromise = null;
        console.warn('RevenueCat configure failed:', getRevenueCatErrorMessage(error));
        return false;
      }
    })();
  }

  const configured = await configurePromise;
  if (configured && appUserId && loggedInAppUserId !== appUserId) {
    try {
      const result = await Purchases.logIn(appUserId);
      loggedInAppUserId = appUserId;
      return Boolean(result.customerInfo);
    } catch (error) {
      console.warn('RevenueCat login failed:', getRevenueCatErrorMessage(error));
    }
  }

  return configured;
}

export async function setRevenueCatUserAttributes(user?: {
  email?: string | null;
  name?: string | null;
  role?: string | null;
}) {
  if (!user) return;

  try {
    if (user.email) {
      await Purchases.setEmail(user.email);
    }

    if (user.name) {
      await Purchases.setDisplayName(user.name);
    }

    if (user.role) {
      await Purchases.setAttributes({ role: user.role });
    }
  } catch (error) {
    console.warn('RevenueCat attributes failed:', getRevenueCatErrorMessage(error));
  }
}

export async function getRevenueCatCustomerInfo() {
  await configureRevenueCat();
  return Purchases.getCustomerInfo();
}

export async function getRevenueCatOfferings(): Promise<PurchasesOfferings> {
  await configureRevenueCat();
  return Purchases.getOfferings();
}

export function getPreferredOffering(offerings: PurchasesOfferings | null) {
  if (!offerings) return null;
  return offerings.current || offerings.all[REVENUECAT_OFFERING_ID] || null;
}

export function getPackagesFromOffering(offering: PurchasesOffering | null) {
  return offering?.availablePackages || [];
}

export function findPackageByProductId(
  packages: PurchasesPackage[],
  productId: RevenueCatProductId,
) {
  const productIdentifier = REVENUECAT_PRODUCTS[productId];

  return (
    packages.find((item) => item.product.identifier === productIdentifier) ||
    packages.find((item) => item.identifier.toLowerCase().includes(productId))
  );
}

export async function purchaseRevenueCatPackage(packageToPurchase: PurchasesPackage) {
  await configureRevenueCat();
  return Purchases.purchasePackage(packageToPurchase);
}

export async function restoreRevenueCatPurchases() {
  await configureRevenueCat();
  return Purchases.restorePurchases();
}

export async function logOutRevenueCat() {
  try {
    const configured = await Purchases.isConfigured().catch(() => false);
    if (!configured) return null;

    loggedInAppUserId = null;
    return await Purchases.logOut();
  } catch (error) {
    console.warn('RevenueCat logout failed:', getRevenueCatErrorMessage(error));
    return null;
  }
}

export async function presentRevenueCatPaywall(offering?: PurchasesOffering | null) {
  await configureRevenueCat();

  const result = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: REVENUECAT_ENTITLEMENT_ID,
    offering: offering || undefined,
    displayCloseButton: true,
  });

  return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
}

export async function presentRevenueCatCustomerCenter() {
  await configureRevenueCat();

  await RevenueCatUI.presentCustomerCenter({
    callbacks: {
      onRestoreCompleted: ({ customerInfo }) => {
        console.log('RevenueCat restore completed:', customerInfo.entitlements.active);
      },
      onRestoreFailed: ({ error }) => {
        console.warn('RevenueCat restore failed:', error.message);
      },
    },
  });
}
