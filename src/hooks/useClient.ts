import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { firebaseCollections } from '../utils/constants';
import { useAppContext } from '../context/AppContext';
import { ClientItem, ClientFormData } from '../screens/clients/types';

/**
 * Removes undefined fields from payload to prevent Firestore write errors.
 */
const sanitizePayload = (obj: Record<string, any>): Record<string, any> => {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  });
  return clean;
};

export interface UseClientReturn {
  clients: ClientItem[];
  loading: boolean;
  error: string | null;
  addClient: (clientData: ClientFormData) => Promise<string>;
  updateClient: (id: string, clientData: Partial<ClientFormData>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Promise<ClientItem | null>;
  refresh: () => Promise<void>;
}

export const useClient = (): UseClientReturn => {
  const { user } = useAppContext();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const db = useMemo(() => getFirestore(), []);
  const clientsCollection = useMemo(
    () => collection(db, firebaseCollections.clients),
    [db]
  );

  // Parse document snapshot into typed ClientItem
  const mapDocToClientItem = useCallback((docSnap: any): ClientItem => {
    const data = docSnap.data() || {};
    return {
      id: docSnap.id,
      name: data.name || '',
      clientType: data.clientType || 'Company',
      companyName: data.companyName,
      profilePic: data.profilePic,
      phone: data.phone,
      email: data.email,
      website: data.website,
      address: data.address,
      contactPerson: data.contactPerson,
      notes: data.notes,
      tags: Array.isArray(data.tags) ? data.tags : [],
      status: data.status || 'Active',
      clientSource: data.clientSource,
      category:
        data.category ||
        data.companyName ||
        (data.clientType === 'Company' ? 'Enterprise' : 'Personal Client'),
      logoType: data.logoType || 'custom',
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }, []);

  // Sort helper to display latest created/updated clients first
  const sortClients = useCallback((items: ClientItem[]): ClientItem[] => {
    return [...items].sort((a, b) => {
      const timeA =
        a.createdAt?.toMillis?.() ??
        (typeof a.createdAt === 'number' ? a.createdAt : 0);
      const timeB =
        b.createdAt?.toMillis?.() ??
        (typeof b.createdAt === 'number' ? b.createdAt : 0);
      if (timeA !== timeB) return timeB - timeA;
      return a.name.localeCompare(b.name);
    });
  }, []);

  // Real-time listener strictly scoped to the authenticated user
  useEffect(() => {
    if (!user?.id) {
      setClients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const userClientsQuery = query(
      clientsCollection,
      where('userId', '==', user.id)
    );

    const unsubscribe = onSnapshot(
      userClientsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => mapDocToClientItem(docSnap));
        setClients(sortClients(items));
        setLoading(false);
      },
      (err) => {
        console.error('Failed to listen to clients:', err);
        setError(err.message || 'Failed to fetch clients');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id, clientsCollection, mapDocToClientItem, sortClients]);

  // Create new client in firebaseCollections.clients
  const addClient = useCallback(
    async (clientData: ClientFormData): Promise<string> => {
      if (!user?.id) {
        throw new Error('You must be signed in to add a client.');
      }

      setError(null);
      try {
        const category =
          clientData.companyName?.trim() ||
          (clientData.clientType === 'Company' ? 'Enterprise' : 'Personal Client');

        const newClientPayload = sanitizePayload({
          ...clientData,
          category,
          userId: user.id,
          logoType: 'custom',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const docRef = await addDoc(clientsCollection, newClientPayload);
        return docRef.id;
      } catch (err: any) {
        console.error('Error adding client to Firestore:', err);
        const message = err?.message || 'Failed to create client';
        setError(message);
        throw err;
      }
    },
    [user?.id, clientsCollection]
  );

  // Update existing client
  const updateClient = useCallback(
    async (id: string, clientData: Partial<ClientFormData>): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to update a client.');
      }

      setError(null);
      try {
        const clientDocRef = doc(db, firebaseCollections.clients, id);

        const category =
          clientData.companyName?.trim() ||
          (clientData.clientType === 'Company'
            ? 'Enterprise'
            : clientData.clientType === 'Individual'
            ? 'Personal Client'
            : undefined);

        const updatePayload = sanitizePayload({
          ...clientData,
          ...(category ? { category } : {}),
          updatedAt: serverTimestamp(),
        });

        await updateDoc(clientDocRef, updatePayload);
      } catch (err: any) {
        console.error('Error updating client in Firestore:', err);
        const message = err?.message || 'Failed to update client';
        setError(message);
        throw err;
      }
    },
    [user?.id, db]
  );

  // Delete client
  const deleteClient = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to delete a client.');
      }

      setError(null);
      try {
        const clientDocRef = doc(db, firebaseCollections.clients, id);
        await deleteDoc(clientDocRef);
      } catch (err: any) {
        console.error('Error deleting client from Firestore:', err);
        const message = err?.message || 'Failed to delete client';
        setError(message);
        throw err;
      }
    },
    [user?.id, db]
  );

  // Get single client by id
  const getClient = useCallback(
    async (id: string): Promise<ClientItem | null> => {
      try {
        const clientDocRef = doc(db, firebaseCollections.clients, id);
        const snap = await getDoc(clientDocRef);
        if (!snap.exists()) {
          return null;
        }
        return mapDocToClientItem(snap);
      } catch (err: any) {
        console.error('Error getting client from Firestore:', err);
        return null;
      }
    },
    [db, mapDocToClientItem]
  );

  // Manual refresh trigger
  const refresh = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userClientsQuery = query(
        clientsCollection,
        where('userId', '==', user.id)
      );
      const snapshot = await getDocs(userClientsQuery);
      const items = snapshot.docs.map((docSnap) => mapDocToClientItem(docSnap));
      setClients(sortClients(items));
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing clients:', err);
      setError(err?.message || 'Failed to refresh clients');
    } finally {
      setLoading(false);
    }
  }, [user?.id, clientsCollection, mapDocToClientItem, sortClients]);

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    refresh,
  };
};

export default useClient;
