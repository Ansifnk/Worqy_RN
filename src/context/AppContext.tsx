import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signOut, type User as FirebaseUser } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from '@react-native-firebase/firestore';
import { firebaseCollections } from '../utils/constants';

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
  refreshUser: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserData = useCallback(async (authUser: FirebaseUser): Promise<User> => {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, firebaseCollections.users, authUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          id: authUser.uid,
          name: data?.name,
          email: data?.email,
        };
      }

      // If document doesn't exist yet, populate and save
      const fallbackUser: User = {
        id: authUser.uid,
        name: authUser.displayName || (authUser.email ? authUser.email.split('@')[0] : 'User'),
        email: authUser.email || '',
      };
      await setDoc(userDocRef, fallbackUser);
      return fallbackUser;
    } catch (error) {
      console.warn('Failed to load user document from Firestore:', error);
      return {
        id: authUser.uid,
        name: authUser.displayName || (authUser.email ? authUser.email.split('@')[0] : 'User'),
        email: authUser.email || '',
      };
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          const loadedUser = await fetchUserData(authUser);
          if (isMounted) {
            setUser(loadedUser);
          }
        } else {
          if (isMounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchUserData]);

  const signOutUser = useCallback(async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      const updatedUser = await fetchUserData(currentUser);
      setUser(updatedUser);
    }
  }, [fetchUserData]);

  return (
    <AppContext.Provider value={{ user, setUser, loading, signOutUser, refreshUser }}>
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

