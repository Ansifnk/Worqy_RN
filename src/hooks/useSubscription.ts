import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { http } from '../utils/http';
import { SubscriptionPlan, UserSubscription } from '../screens/subscription/types';
import { openRazorpayCheckout } from '../utils/razorpay';

export const subscriptionKeys = {
  all: ['subscription'] as const,
  current: (userId?: string) => [...subscriptionKeys.all, 'current', userId] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
};

export interface SubscribeResult {
  success: boolean;
  subscription?: UserSubscription;
  cancelled?: boolean;
  message?: string;
}

export interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  plansLoading: boolean;
  error: string | null;
  subscribe: (planId: string) => Promise<UserSubscription>;
  subscribeWithRazorpay: (plan: SubscriptionPlan) => Promise<SubscribeResult>;
  cancel: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { user, refreshUser } = useAppContext();
  const queryClient = useQueryClient();

  // Fetch current user's subscription
  const {
    data: subscription = null,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useQuery<UserSubscription | null>({
    queryKey: subscriptionKeys.current(user?.id),
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await http.get('/subscription-plans/my-subscription');
        return res?.data ?? null;
      } catch (err) {
        console.warn('Error fetching user subscription:', err);
        return null;
      }
    },
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Fetch available active subscription plans
  const {
    data: plans = [],
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = useQuery<SubscriptionPlan[]>({
    queryKey: subscriptionKeys.plans(),
    queryFn: async () => {
      try {
        const res = await http.get('/subscription-plans', {
          params: { status: 'active', limit: 50 },
        });
        const items = res?.data ?? [];
        return Array.isArray(items)
          ? items.sort((a: SubscriptionPlan, b: SubscriptionPlan) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          : [];
      } catch (err) {
        console.warn('Error fetching subscription plans:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Subscribe mutation (direct activation without payment gateway)
  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await http.post('/subscription-plans/subscribe', { planId });
      return res.data as UserSubscription;
    },
    onSuccess: async (newSubscription) => {
      // Invalidate and refresh cache
      queryClient.setQueryData(subscriptionKeys.current(user?.id), newSubscription);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
        refreshUser(),
      ]);
    },
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      await http.post('/subscription-plans/cancel');
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
        refreshUser(),
      ]);
    },
  });

  const subscribe = useCallback(
    async (planId: string): Promise<UserSubscription> => {
      return await subscribeMutation.mutateAsync(planId);
    },
    [subscribeMutation]
  );

  const subscribeWithRazorpay = useCallback(
    async (plan: SubscriptionPlan): Promise<SubscribeResult> => {
      const isTrial = plan.isTrial || (plan.price === 0 && (plan.trialDays ?? 0) > 0);

      // Free trial or zero price plan -> direct activation without payment gateway
      if (isTrial) {
        const sub = await subscribe(plan.id);
        return { success: true, subscription: sub };
      }

      // Step 1: Create Order on backend
      const orderRes = await http.post('/subscription-plans/create-order', {
        planId: plan.id,
      });

      if (!orderRes?.data || !orderRes.data.orderId) {
        throw new Error(orderRes?.msg || 'Failed to initiate checkout order.');
      }

      const orderData = orderRes.data;
      const keyId = orderData.keyId || orderData.key || orderData.razorpayKeyId;
      if (!keyId) {
        throw new Error('Payment gateway configuration is missing key ID.');
      }

      // Step 2: Open native Razorpay checkout
      let paymentRes;
      try {
        paymentRes = await openRazorpayCheckout(
          {
            orderId: orderData.orderId,
            amount: orderData.amount ?? Math.round(plan.price * 100),
            currency: orderData.currency || 'INR',
            keyId,
          },
          plan.name,
          {
            name: user?.name,
            email: user?.email,
            mobile: user?.mobile,
          }
        );
      } catch (err: any) {
        // User cancelled payment sheet or closed modal
        if (err?.code === 0 || err?.description?.toLowerCase().includes('cancelled')) {
          return { success: false, cancelled: true };
        }
        throw new Error(err?.description || err?.message || 'Payment cancelled or failed');
      }

      // Step 3: Verify payment signature on backend
      const verifyRes = await http.post('/subscription-plans/verify-payment', {
        planId: plan.id,
        razorpay_order_id: paymentRes.razorpay_order_id,
        razorpay_payment_id: paymentRes.razorpay_payment_id,
        razorpay_signature: paymentRes.razorpay_signature,
      });

      const updatedSubscription = verifyRes?.data as UserSubscription;

      // Update query cache and refresh current user profile
      queryClient.setQueryData(subscriptionKeys.current(user?.id), updatedSubscription);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
        refreshUser(),
      ]);
      return {
        success: true,
        subscription: updatedSubscription,
        message: verifyRes?.msg || 'Subscription activated successfully!',
      };
    },
    [subscribe, user, queryClient, refreshUser]
  );

  const cancel = useCallback(async (): Promise<void> => {
    await cancelMutation.mutateAsync();
  }, [cancelMutation]);

  const refresh = useCallback(async () => {
    await Promise.all([refetchSubscription(), refetchPlans()]);
  }, [refetchSubscription, refetchPlans]);

  const errorMessage =
    (subscriptionError as any)?.message ||
    (plansError as any)?.message ||
    (subscribeMutation.error as any)?.message ||
    null;

  return {
    subscription,
    plans,
    loading: subscriptionLoading,
    plansLoading,
    error: errorMessage,
    subscribe,
    subscribeWithRazorpay,
    cancel,
    refresh,
  };
};

export default useSubscription;
