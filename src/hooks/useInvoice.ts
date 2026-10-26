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
import {
  Invoice,
  InvoiceFormData,
  InvoiceStatus,
} from '../screens/invoices/types';

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


export interface UseInvoiceReturn {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  addInvoice: (invoiceData: InvoiceFormData) => Promise<string>;
  updateInvoice: (id: string, invoiceData: Partial<InvoiceFormData>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  getInvoice: (id: string) => Promise<Invoice | null>;
  refresh: () => Promise<void>;
}

export const useInvoice = (): UseInvoiceReturn => {
  const { user } = useAppContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const db = useMemo(() => getFirestore(), []);
  const invoicesCollection = useMemo(
    () => collection(db, firebaseCollections.invoices),
    [db]
  );

  // Map Firestore document snapshot to typed Invoice
  const mapDocToInvoice = useCallback((docSnap: any): Invoice => {
    const data = docSnap.data() || {};
    return {
      id: docSnap.id,
      invoiceNumber: data.invoiceNumber || 'INV-0000',
      clientId: data.clientId,
      clientName: data.clientName || 'Unnamed Client',
      clientEmail: data.clientEmail || '',
      issueDate: data.issueDate || new Date().toISOString(),
      dueDate: data.dueDate || new Date().toISOString(),
      paymentTerms: data.paymentTerms || 'Net 14 days',
      status: (data.status as InvoiceStatus) || 'Draft',
      items: Array.isArray(data.items) ? data.items : [],
      subtotal: typeof data.subtotal === 'number' ? data.subtotal : 0,
      taxRate: typeof data.taxRate === 'number' ? data.taxRate : 18,
      taxAmount: typeof data.taxAmount === 'number' ? data.taxAmount : 0,
      total: typeof data.total === 'number' ? data.total : 0,
      notes: data.notes || '',
      avatarColor: data.avatarColor || '#16A34A',
      avatarLetter: data.avatarLetter || data.clientName?.[0]?.toUpperCase() || 'C',
      userId: data.userId || '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }, []);

  // Sort invoices: Latest invoice number descending, or createdAt descending
  const sortInvoices = useCallback((items: Invoice[]): Invoice[] => {
    return [...items].sort((a, b) => {
      if (a.invoiceNumber && b.invoiceNumber) {
        return b.invoiceNumber.localeCompare(a.invoiceNumber);
      }
      return 0;
    });
  }, []);

  // Seed initial invoices if user collection is completely empty
  const seedInitialInvoicesIfNeeded = useCallback(
    async (userId: string) => {
      try {
        const q = query(invoicesCollection, where('userId', '==', userId));
        const snap = await getDocs(q);

      } catch (e) {
        console.warn('Seeding initial invoices failed or skipped:', e);
      }
    },
    [invoicesCollection]
  );

  // Real-time listener strictly scoped to authenticated user
  useEffect(() => {
    if (!user?.id) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Trigger seed in background if empty
    seedInitialInvoicesIfNeeded(user.id);

    const userInvoicesQuery = query(
      invoicesCollection,
      where('userId', '==', user.id)
    );

    const unsubscribe = onSnapshot(
      userInvoicesQuery,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => mapDocToInvoice(docSnap));
        setInvoices(sortInvoices(items));
        setLoading(false);
      },
      (err) => {
        console.error('Failed to listen to invoices:', err);
        setError(err.message || 'Failed to fetch invoices');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id, invoicesCollection, mapDocToInvoice, sortInvoices, seedInitialInvoicesIfNeeded]);

  // Create new invoice
  const addInvoice = useCallback(
    async (invoiceData: InvoiceFormData): Promise<string> => {
      if (!user?.id) {
        throw new Error('You must be signed in to add an invoice.');
      }

      setError(null);
      try {
        const payload = sanitizePayload({
          ...invoiceData,
          userId: user.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const docRef = await addDoc(invoicesCollection, payload);
        return docRef.id;
      } catch (err: any) {
        console.error('Error adding invoice to Firestore:', err);
        const message = err?.message || 'Failed to create invoice';
        setError(message);
        throw err;
      }
    },
    [user?.id, invoicesCollection]
  );

  // Update existing invoice
  const updateInvoice = useCallback(
    async (id: string, invoiceData: Partial<InvoiceFormData>): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to update an invoice.');
      }

      setError(null);
      try {
        const docRef = doc(db, firebaseCollections.invoices, id);
        const payload = sanitizePayload({
          ...invoiceData,
          updatedAt: serverTimestamp(),
        });

        await updateDoc(docRef, payload);
      } catch (err: any) {
        console.error('Error updating invoice in Firestore:', err);
        const message = err?.message || 'Failed to update invoice';
        setError(message);
        throw err;
      }
    },
    [user?.id, db]
  );

  // Update status shortcut
  const updateInvoiceStatus = useCallback(
    async (id: string, status: InvoiceStatus): Promise<void> => {
      return updateInvoice(id, { status });
    },
    [updateInvoice]
  );

  // Delete invoice
  const deleteInvoice = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to delete an invoice.');
      }

      setError(null);
      try {
        const docRef = doc(db, firebaseCollections.invoices, id);
        await deleteDoc(docRef);
      } catch (err: any) {
        console.error('Error deleting invoice from Firestore:', err);
        const message = err?.message || 'Failed to delete invoice';
        setError(message);
        throw err;
      }
    },
    [user?.id, db]
  );

  // Get single invoice
  const getInvoice = useCallback(
    async (id: string): Promise<Invoice | null> => {
      try {
        const docRef = doc(db, firebaseCollections.invoices, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return mapDocToInvoice(docSnap);
        }
        return null;
      } catch (err: any) {
        console.error('Error fetching single invoice:', err);
        return null;
      }
    },
    [db, mapDocToInvoice]
  );

  // Manual refresh trigger
  const refresh = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const userInvoicesQuery = query(
        invoicesCollection,
        where('userId', '==', user.id)
      );
      const snapshot = await getDocs(userInvoicesQuery);
      const items = snapshot.docs.map((docSnap) => mapDocToInvoice(docSnap));
      setInvoices(sortInvoices(items));
      setLoading(false);
    } catch (err: any) {
      console.error('Error refreshing invoices:', err);
      setError(err.message || 'Failed to refresh invoices');
      setLoading(false);
    }
  }, [user?.id, invoicesCollection, mapDocToInvoice, sortInvoices]);

  return {
    invoices,
    loading,
    error,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    getInvoice,
    refresh,
  };
};
