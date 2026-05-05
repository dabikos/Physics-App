import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Purchases, {
  CustomerInfo,
  CustomerInfoUpdateListener,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import { useAuth } from './AuthContext';
import { RevenueCatProductId } from '../config/revenueCat';
import api from '../services/api';
import {
  configureRevenueCat,
  findPackageByProductId,
  getPackagesFromOffering,
  getPreferredOffering,
  getRevenueCatCustomerInfo,
  getRevenueCatErrorMessage,
  getRevenueCatOfferings,
  isProCustomer,
  logOutRevenueCat,
  presentRevenueCatCustomerCenter,
  presentRevenueCatPaywall,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
  setRevenueCatUserAttributes,
} from '../services/revenueCatService';

interface SubscriptionContextValue {
  configured: boolean;
  loading: boolean;
  error: string | null;
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  packages: PurchasesPackage[];
  refreshCustomerInfo: () => Promise<CustomerInfo | null>;
  refreshOfferings: () => Promise<PurchasesOffering | null>;
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<boolean>;
  purchaseProduct: (productId: RevenueCatProductId) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  presentPaywall: () => Promise<boolean>;
  presentCustomerCenter: () => Promise<void>;
  requirePro: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const lastSyncedSignatureRef = useRef<string | null>(null);

  const syncSubscriptionToBackend = useCallback(
    async (info: CustomerInfo | null) => {
      if (!user) return;

      const activeEntitlements = Object.keys(info?.entitlements?.active || {});
      const pro = isProCustomer(info);
      const signature = `${user.id}:${pro}:${activeEntitlements.sort().join(',')}`;
      if (lastSyncedSignatureRef.current === signature) return;

      try {
        await api.post('/subscription/sync', {
          is_pro: pro,
          active_entitlements: activeEntitlements,
          source: 'revenuecat',
        });
        lastSyncedSignatureRef.current = signature;
      } catch (err) {
        console.log('Subscription sync error:', getRevenueCatErrorMessage(err));
      }
    },
    [user],
  );

  const refreshCustomerInfo = useCallback(async () => {
    try {
      setError(null);
      const info = await getRevenueCatCustomerInfo();
      setCustomerInfo(info);
      await syncSubscriptionToBackend(info);
      return info;
    } catch (err) {
      setError(getRevenueCatErrorMessage(err));
      return null;
    }
  }, [syncSubscriptionToBackend]);

  const refreshOfferings = useCallback(async () => {
    try {
      setError(null);
      const offerings = await getRevenueCatOfferings();
      const offering = getPreferredOffering(offerings);
      setCurrentOffering(offering);
      setPackages(getPackagesFromOffering(offering));
      return offering;
    } catch (err) {
      setError(getRevenueCatErrorMessage(err));
      setCurrentOffering(null);
      setPackages([]);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (authLoading) return;

      setLoading(true);
      setError(null);

      try {
        const isConfigured = await configureRevenueCat(user?.id);
        if (!mounted) return;

        setConfigured(isConfigured);

        if (isConfigured) {
          await setRevenueCatUserAttributes(user || undefined);
          await Promise.all([refreshCustomerInfo(), refreshOfferings()]);
        } else {
          setCustomerInfo(null);
          setCurrentOffering(null);
          setPackages([]);
        }
      } catch (err) {
        if (mounted) {
          setError(getRevenueCatErrorMessage(err));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [authLoading, refreshCustomerInfo, refreshOfferings, user]);

  useEffect(() => {
    if (!configured) return;

    const listener: CustomerInfoUpdateListener = (info) => {
      setCustomerInfo(info);
      syncSubscriptionToBackend(info);
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [configured, syncSubscriptionToBackend]);

  useEffect(() => {
    if (authLoading || user || !configured) return;

    logOutRevenueCat().then((info) => {
      setCustomerInfo(info);
    });
  }, [authLoading, configured, user]);

  const purchasePackage = useCallback(
    async (packageToPurchase: PurchasesPackage) => {
      try {
        setError(null);
        const result = await purchaseRevenueCatPackage(packageToPurchase);
        setCustomerInfo(result.customerInfo);
        await syncSubscriptionToBackend(result.customerInfo);
        return isProCustomer(result.customerInfo);
      } catch (err: any) {
        if (!err?.userCancelled) {
          setError(getRevenueCatErrorMessage(err));
        }
        return false;
      }
    },
    [syncSubscriptionToBackend],
  );

  const purchaseProduct = useCallback(
    async (productId: RevenueCatProductId) => {
      const packageToPurchase = findPackageByProductId(packages, productId);

      if (!packageToPurchase) {
        setError(`RevenueCat package is not configured: ${productId}`);
        return false;
      }

      return purchasePackage(packageToPurchase);
    },
    [packages, purchasePackage],
  );

  const restorePurchases = useCallback(async () => {
    try {
      setError(null);
      const info = await restoreRevenueCatPurchases();
      setCustomerInfo(info);
      await syncSubscriptionToBackend(info);
      return isProCustomer(info);
    } catch (err) {
      setError(getRevenueCatErrorMessage(err));
      return false;
    }
  }, [syncSubscriptionToBackend]);

  const presentPaywall = useCallback(async () => {
    try {
      setError(null);
      const purchased = await presentRevenueCatPaywall(currentOffering);
      const info = await refreshCustomerInfo();
      return purchased || isProCustomer(info);
    } catch (err) {
      setError(getRevenueCatErrorMessage(err));
      return false;
    }
  }, [currentOffering, refreshCustomerInfo]);

  const presentCustomerCenter = useCallback(async () => {
    try {
      setError(null);
      await presentRevenueCatCustomerCenter();
      await refreshCustomerInfo();
    } catch (err) {
      setError(getRevenueCatErrorMessage(err));
    }
  }, [refreshCustomerInfo]);

  const requirePro = useCallback(async () => {
    if (isProCustomer(customerInfo)) return true;
    return presentPaywall();
  }, [customerInfo, presentPaywall]);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      configured,
      loading,
      error,
      isPro: isProCustomer(customerInfo),
      customerInfo,
      currentOffering,
      packages,
      refreshCustomerInfo,
      refreshOfferings,
      purchasePackage,
      purchaseProduct,
      restorePurchases,
      presentPaywall,
      presentCustomerCenter,
      requirePro,
    }),
    [
      configured,
      customerInfo,
      currentOffering,
      error,
      loading,
      packages,
      presentCustomerCenter,
      presentPaywall,
      purchasePackage,
      purchaseProduct,
      refreshCustomerInfo,
      refreshOfferings,
      requirePro,
      restorePurchases,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }

  return context;
}
