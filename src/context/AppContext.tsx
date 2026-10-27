import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { http, setOnUnauthorized, getAuthToken } from '../utils/http';
import { loadAuthSession, saveAuthSession, clearAuthSession } from '../utils/authStorage';
import { queryClient } from '../utils/queryClient';

export interface User {
  id: string;
  name: string;
  email: string;
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

    const restoreSession = async () => {
      try {
        const { token, user: storedUser } = await loadAuthSession();

        if (token && storedUser) {
          if (isMounted) {
            setUser(storedUser);
          }

          // Validate and refresh profile with backend server
          try {
            const res = await http.get('/auth/me');
            const account = res?.data?.account;
            if (account && isMounted) {
              const freshUser: User = {
                id: account.userId || account.id || storedUser.id,
                name: account.name || storedUser.name,
                email: account.email || storedUser.email,
              };
              setUser(freshUser);
              await saveAuthSession(token, freshUser);
            }
          } catch (apiError: any) {
            // If token expired (401), clear invalid session
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

    // Hook auto-signout when HTTP requests receive 401 Unauthorized
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

      const res = await http.get('/auth/me');
      const account = res?.data?.account;
      if (account) {
        const updatedUser: User = {
          id: account.userId || account.id || '',
          name: account.name || 'User',
          email: account.email || '',
        };
        setUser(updatedUser);
        await saveAuthSession(token, updatedUser);
      }
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
