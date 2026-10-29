import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { http } from '../utils/http';
import { SubscriptionPlan, UserSubscription } from '../screens/subscription/types';

export const subscriptionKeys = {
  all: ['subscription'] as const,
  current: (userId?: string) => [...subscriptionKeys.all, 'current', userId] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
};

export interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  plansLoading: boolean;
  error: string | null;
  subscribe: (planId: string) => Promise<UserSubscription>;
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
    cancel,
    refresh,
  };
};

export default useSubscription;
