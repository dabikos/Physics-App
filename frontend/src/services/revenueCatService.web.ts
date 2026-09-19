import {
  REVENUECAT_ENTITLEMENT_ID,
  REVENUECAT_OFFERING_ID,
  REVENUECAT_PRODUCTS,
  RevenueCatProductId,
} from '../config/revenueCat';

export function isRevenueCatExpoGoPreview() {
  return true;
}

export function isProCustomer(customerInfo: any) {
  return Boolean(customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID]);
}

export function getRevenueCatErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: string }).message || 'RevenueCat request failed');
  }
  return 'RevenueCat request failed';
}

export async function configureRevenueCat(appUserId?: string | null) {
  return false;
}

export async function setRevenueCatUserAttributes(user?: any) {
  return;
}

export async function getRevenueCatCustomerInfo() {
  return null;
}

export async function getRevenueCatOfferings() {
  return { current: null, all: {} } as any;
}

export function getPreferredOffering(offerings: any) {
  if (!offerings) return null;
  return offerings.current || offerings.all?.[REVENUECAT_OFFERING_ID] || null;
}

export function getPackagesFromOffering(offering: any) {
  return offering?.availablePackages || [];
}

export function findPackageByProductId(packages: any[], productId: RevenueCatProductId) {
  const productIdentifier = REVENUECAT_PRODUCTS[productId];
  return (
    packages.find((item) => item.product?.identifier === productIdentifier) ||
    packages.find((item) => item.identifier?.toLowerCase().includes(productId))
  );
}

export async function purchaseRevenueCatPackage(packageToPurchase: any) {
  throw new Error('In-App Purchases are available in mobile Android & iOS builds.');
}

export async function restoreRevenueCatPurchases() {
  throw new Error('In-App Purchases are available in mobile Android & iOS builds.');
}

export async function logOutRevenueCat() {
  return null;
}

export async function presentRevenueCatPaywall(offering?: any) {
  return false;
}

export async function presentRevenueCatCustomerCenter() {
  return;
}

export function addRevenueCatCustomerInfoUpdateListener(listener: any) {
  return;
}

export function removeRevenueCatCustomerInfoUpdateListener(listener: any) {
  return;
}
