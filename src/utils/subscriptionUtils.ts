export const subscriptionKeys = {
  all: ['subscription'] as const,
  current: (userId?: string) => [...subscriptionKeys.all, 'current', userId] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
};

export interface SubscriptionLike {
  isSubscribed?: boolean | string | null;
  subscriptionPlanId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionStartsAt?: string | number | Date | null;
  subscriptionEndsAt?: string | number | Date | null;
  trialEndsAt?: string | number | Date | null;
  trialStartedAt?: string | number | Date | null;
  daysRemaining?: number | string | null;
  plan?: any;
  subscriptionPlan?: any;
}

export const parseSubscriptionDateMs = (
  val?: string | number | Date | null
): number | null => {
  if (!val) return null;
  if (typeof val === 'number') return val;
  if (val instanceof Date) return val.getTime();
  const num = Number(val);
  if (!isNaN(num) && num > 1000000000) return num;
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? null : parsed;
};

/**
 * Checks whether the given subscription or user profile represents an active,
 * non-expired subscription plan.
 *
 * A plan is considered NOT EXPIRED if:
 * 1. Status is not explicitly 'EXPIRED'
 * 2. AND either:
 *    - subscriptionEndsAt is in the future
 *    - trialEndsAt is in the future (if on trial)
 *    - daysRemaining > 0
 *    - subscriptionStatus is 'ACTIVE' or 'TRIALING' (and end date has not passed)
 *    - isSubscribed is true (and end date has not passed)
 */
export const isPlanNotExpired = (data?: SubscriptionLike | null): boolean => {
  if (!data) return false;

  const status = (data.subscriptionStatus || '').toUpperCase();

  // 1. Explicit EXPIRED status always means expired
  if (status === 'EXPIRED') {
    return false;
  }

  const now = Date.now();

  // 2. Check subscriptionEndsAt
  const endsAtMs = parseSubscriptionDateMs(data.subscriptionEndsAt);
  if (endsAtMs !== null) {
    if (endsAtMs > now) {
      return true;
    }
    // Subscription end date has passed. Check if trial extends past now
    const trialEndsMs = parseSubscriptionDateMs(data.trialEndsAt);
    if (trialEndsMs !== null && trialEndsMs > now) {
      return true;
    }
    return false;
  }

  // 3. Check trialEndsAt (when trialing or no subscriptionEndsAt)
  const trialEndsMs = parseSubscriptionDateMs(data.trialEndsAt);
  if (trialEndsMs !== null) {
    if (trialEndsMs > now) {
      return true;
    }
    return false;
  }

  // 4. Check daysRemaining
  if (data.daysRemaining !== undefined && data.daysRemaining !== null) {
    const days = Number(data.daysRemaining);
    if (!isNaN(days)) {
      return days > 0;
    }
  }

  // 5. Check active/trialing status
  if (status === 'ACTIVE' || status === 'TRIALING') {
    return true;
  }

  // 6. Check boolean isSubscribed flag
  if (data.isSubscribed === true || data.isSubscribed === 'true') {
    return true;
  }

  return false;
};

export default isPlanNotExpired;
