export type BillingCycle = 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'LIFETIME';

export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  trialDays: number;
  isActive: boolean;
  isPopular: boolean;
  isTrial: boolean;
  sortOrder: number;
  maxClients?: number | null;
  maxProjects?: number | null;
  maxTasks?: number | null;
  maxInvoices?: number | null;
  maxUsers?: number | null;
  maxStorageMb?: number | null;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  isSubscribed: boolean;
  subscriptionPlanId?: string | null;
  subscriptionStatus?: SubscriptionStatus | null;
  subscriptionStartsAt?: string | null;
  subscriptionEndsAt?: string | null;
  trialEndsAt?: string | null;
  trialStartedAt?: string | null;
  hasUsedTrial?: boolean;
  daysRemaining?: number | null;
  plan?: SubscriptionPlan | null;
  usage?: {
    clients: number;
    projects: number;
    tasks: number;
    invoices: number;
  };
}
