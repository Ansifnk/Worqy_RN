import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { http, setOnUnauthorized, setOnTokenRefreshed, getAuthToken } from '../utils/http';
import { loadAuthSession, saveAuthSession, saveTokens, clearAuthSession } from '../utils/authStorage';
import { queryClient } from '../utils/queryClient';
import { subscriptionKeys, isPlanNotExpired } from '../utils/subscriptionUtils';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
  subscriptionPlanId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionStartsAt?: string | null;
  subscriptionEndsAt?: string | null;
  trialEndsAt?: string | null;
  hasUsedTrial?: boolean;
  subscriptionPlan?: any | null;
  daysRemaining?: number | null;
  isSubscribed?: boolean;
}

export interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  signOutUser: () => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session from AsyncStorage on app launch
  useEffect(() => {
    let isMounted = true;

    // Listen for automatic token updates and persist them
    setOnTokenRefreshed(async ({ accessToken, refreshToken }) => {
      await saveTokens(accessToken, refreshToken);
    });

    const restoreSession = async () => {
      try {
        const { token, refreshToken, user: storedUser } = await loadAuthSession();

        if (token && storedUser) {
          // Check if cached user profile already has an unexpired subscription
          const isStoredPlanValid = isPlanNotExpired(storedUser);
          const initialUser: User = {
            ...storedUser,
            isSubscribed: isStoredPlanValid,
          };
          if (isMounted) {
            setUser(initialUser);
          }

          // Validate and refresh profile & subscription status in parallel on app startup
          try {
            const [meResResult, subResResult] = await Promise.allSettled([
              http.get('/auth/me'),
              http.get('/subscription-plans/my-subscription'),
            ]);

            const account =
              meResResult.status === 'fulfilled'
                ? meResResult.value?.data?.account
                : null;

            const subData =
              subResResult.status === 'fulfilled'
                ? subResResult.value?.data
                : null;

            const targetUserId =
              account?.userId || account?.id || storedUser.id;

            if (subData) {
              queryClient.setQueryData(
                subscriptionKeys.current(targetUserId),
                subData
              );
            }

            if ((account || subData) && isMounted) {
              const mergedPlanId =
                subData?.subscriptionPlanId ??
                account?.subscriptionPlanId ??
                storedUser.subscriptionPlanId ??
                null;
              const mergedStatus =
                subData?.subscriptionStatus ??
                account?.subscriptionStatus ??
                storedUser.subscriptionStatus ??
                null;
              const mergedStartsAt =
                subData?.subscriptionStartsAt ??
                account?.subscriptionStartsAt ??
                storedUser.subscriptionStartsAt ??
                null;
              const mergedEndsAt =
                subData?.subscriptionEndsAt ??
                account?.subscriptionEndsAt ??
                storedUser.subscriptionEndsAt ??
                null;
              const mergedTrialEndsAt =
                subData?.trialEndsAt ??
                account?.trialEndsAt ??
                storedUser.trialEndsAt ??
                null;
              const mergedPlan =
                subData?.plan ??
                account?.subscriptionPlan ??
                storedUser.subscriptionPlan ??
                null;
              const mergedDaysRemaining =
                subData?.daysRemaining ??
                storedUser.daysRemaining ??
                null;

              const candidate = {
                isSubscribed:
                  subData?.isSubscribed ??
                  account?.isSubscribed ??
                  storedUser.isSubscribed,
                subscriptionPlanId: mergedPlanId,
                subscriptionStatus: mergedStatus,
                subscriptionStartsAt: mergedStartsAt,
                subscriptionEndsAt: mergedEndsAt,
                trialEndsAt: mergedTrialEndsAt,
                daysRemaining: mergedDaysRemaining,
                plan: mergedPlan,
              };

              const hasNotExpired = isPlanNotExpired(candidate);

              const freshUser: User = {
                id: targetUserId,
                name: account?.name || storedUser.name,
                email: account?.email || storedUser.email,
                mobile:
                  account?.mobile ||
                  account?.phone ||
                  storedUser.mobile ||
                  null,
                subscriptionPlanId: mergedPlanId,
                subscriptionStatus: mergedStatus,
                subscriptionStartsAt: mergedStartsAt,
                subscriptionEndsAt: mergedEndsAt,
                trialEndsAt: mergedTrialEndsAt,
                hasUsedTrial:
                  subData?.hasUsedTrial ??
                  account?.hasUsedTrial ??
                  storedUser.hasUsedTrial ??
                  false,
                subscriptionPlan: mergedPlan,
                daysRemaining: mergedDaysRemaining,
                isSubscribed: hasNotExpired,
              };

              setUser(freshUser);
              const currentToken = getAuthToken() || token;
              await saveAuthSession(currentToken, freshUser, refreshToken);
            }
          } catch (apiError: any) {
            // If token expired and refresh failed (401), clear invalid session
            if (apiError?.status === 401 && isMounted) {
              await clearAuthSession();
              setUser(null);
            }
          }
        } else {
          if (isMounted) {
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Error restoring auth session:', err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    // Hook auto-signout when HTTP requests receive 401 Unauthorized and refresh fails
    setOnUnauthorized(() => {
      clearAuthSession();
      queryClient.clear();
      setUser(null);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      try {
        await http.post('/auth/logout');
      } catch {
        // Ignore network errors during logout
      }
      await clearAuthSession();
      queryClient.clear();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      // Clear local session upon account deletion
      await clearAuthSession();
      queryClient.clear();
      setUser(null);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const [meResResult, subResResult] = await Promise.allSettled([
        http.get('/auth/me'),
        http.get('/subscription-plans/my-subscription'),
      ]);

      const account =
        meResResult.status === 'fulfilled'
          ? meResResult.value?.data?.account
          : null;

      const subData =
        subResResult.status === 'fulfilled'
          ? subResResult.value?.data
          : null;

      if (!account && !subData) return;

      setUser((prevUser) => {
        const targetUserId =
          account?.userId || account?.id || prevUser?.id || '';

        if (subData) {
          queryClient.setQueryData(
            subscriptionKeys.current(targetUserId),
            subData
          );
        }

        const mergedPlanId =
          subData?.subscriptionPlanId ??
          account?.subscriptionPlanId ??
          prevUser?.subscriptionPlanId ??
          null;
        const mergedStatus =
          subData?.subscriptionStatus ??
          account?.subscriptionStatus ??
          prevUser?.subscriptionStatus ??
          null;
        const mergedStartsAt =
          subData?.subscriptionStartsAt ??
          account?.subscriptionStartsAt ??
          prevUser?.subscriptionStartsAt ??
          null;
        const mergedEndsAt =
          subData?.subscriptionEndsAt ??
          account?.subscriptionEndsAt ??
          prevUser?.subscriptionEndsAt ??
          null;
        const mergedTrialEndsAt =
          subData?.trialEndsAt ??
          account?.trialEndsAt ??
          prevUser?.trialEndsAt ??
          null;
        const mergedPlan =
          subData?.plan ??
          account?.subscriptionPlan ??
          prevUser?.subscriptionPlan ??
          null;
        const mergedDaysRemaining =
          subData?.daysRemaining ??
          prevUser?.daysRemaining ??
          null;

        const candidate = {
          isSubscribed:
            subData?.isSubscribed ??
            account?.isSubscribed ??
            prevUser?.isSubscribed,
          subscriptionPlanId: mergedPlanId,
          subscriptionStatus: mergedStatus,
          subscriptionStartsAt: mergedStartsAt,
          subscriptionEndsAt: mergedEndsAt,
          trialEndsAt: mergedTrialEndsAt,
          daysRemaining: mergedDaysRemaining,
          plan: mergedPlan,
        };

        const hasNotExpired = isPlanNotExpired(candidate);

        const updatedUser: User = {
          id: targetUserId,
          name: account?.name || prevUser?.name || 'User',
          email: account?.email || prevUser?.email || '',
          mobile:
            account?.mobile ||
            account?.phone ||
            prevUser?.mobile ||
            null,
          subscriptionPlanId: mergedPlanId,
          subscriptionStatus: mergedStatus,
          subscriptionStartsAt: mergedStartsAt,
          subscriptionEndsAt: mergedEndsAt,
          trialEndsAt: mergedTrialEndsAt,
          hasUsedTrial:
            subData?.hasUsedTrial ??
            account?.hasUsedTrial ??
            prevUser?.hasUsedTrial ??
            false,
          subscriptionPlan: mergedPlan,
          daysRemaining: mergedDaysRemaining,
          isSubscribed: hasNotExpired,
        };

        saveAuthSession(token, updatedUser).catch((err) =>
          console.warn('Failed saving updated user session:', err)
        );

        return updatedUser;
      });
    } catch (error) {
      console.warn('Failed to refresh user profile:', error);
    }
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, loading, signOutUser, deleteAccount, refreshUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
