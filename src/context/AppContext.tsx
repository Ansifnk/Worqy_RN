import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  type User as FirebaseUser,
} from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from '@react-native-firebase/firestore';
import { firebaseCollections } from '../utils/constants';
import { signOutGoogle } from '../utils/googleAuth';

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
  deleteAccount: (password: string) => Promise<void>;
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
      await signOutGoogle();
      const auth = getAuth();
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const currentUserId = user?.id || currentUser?.uid;

      if (!currentUser || !currentUser.email || !currentUserId) {
        throw new Error('No user is currently authenticated.');
      }

      // 1. Re-authenticate with password to satisfy Firebase security requirement
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      // 2. Fetch existing user document
      const db = getFirestore();
      const userDocRef = doc(db, firebaseCollections.users, currentUserId);
      const deletedUserDocRef = doc(db, firebaseCollections.deletedUsers, currentUserId);

      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.exists()
        ? userSnap.data()
        : { id: currentUserId, name: user?.name || '', email: user?.email || '' };

      // 3. Move user document to DELETED_USERS collection while freshly authenticated
      await setDoc(deletedUserDocRef, {
        ...userData,
        deletedAt: new Date().toISOString(),
        deletedTimestamp: Date.now(),
      });

      // 4. Remove from active USERS collection
      await deleteDoc(userDocRef);

      // 5. Delete Firebase Auth user account
      await deleteUser(currentUser);

      setUser(null);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      const updatedUser = await fetchUserData(currentUser);
      setUser(updatedUser);
    }
  }, [fetchUserData]);

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

