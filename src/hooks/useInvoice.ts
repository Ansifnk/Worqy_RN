import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { http } from '../utils/http';
import {
  Invoice,
  InvoiceFormData,
  InvoiceStatus,
} from '../screens/invoices/types';

export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (userId?: string) => [...invoiceKeys.lists(), userId] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
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
  const queryClient = useQueryClient();

  // Sort invoices: Latest invoice number descending, or createdAt descending
  const sortInvoices = useCallback((items: Invoice[]): Invoice[] => {
    return [...items].sort((a, b) => {
      if (a.invoiceNumber && b.invoiceNumber) {
        return b.invoiceNumber.localeCompare(a.invoiceNumber);
      }
      return 0;
    });
  }, []);

  // TanStack Query for fetching invoice list directly via HTTP
  const {
    data: rawInvoices = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<Invoice[]>({
    queryKey: invoiceKeys.list(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await http.get<Invoice[]>('/invoices', {
        params: { limit: 1000 },
      });
      return res.data || [];
    },
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 2,
  });

  const invoices = useMemo(() => {
    return sortInvoices(rawInvoices);
  }, [rawInvoices, sortInvoices]);

  // Mutation: Create invoice (POST /invoices)
  const addMutation = useMutation({
    mutationFn: async (invoiceData: InvoiceFormData) => {
      const res = await http.post<Invoice>('/invoices', invoiceData);
      if (!res.data) {
        throw new Error(res.msg || 'Failed to create invoice');
      }
      return res.data;
    },
    onSuccess: (newInvoice) => {
      queryClient.setQueryData<Invoice[]>(invoiceKeys.list(user?.id), (old = []) => [
        newInvoice,
        ...old.filter((item) => item.id !== newInvoice.id),
      ]);
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });

  // Mutation: Update invoice (PUT /invoices/:id)
  const updateMutation = useMutation({
    mutationFn: async ({ id, invoiceData }: { id: string; invoiceData: Partial<InvoiceFormData> }) => {
      const res = await http.put<Invoice>(`/invoices/${id}`, invoiceData);
      if (!res.data) {
        throw new Error(res.msg || 'Failed to update invoice');
      }
      return res.data;
    },
    onSuccess: (updatedInvoice) => {
      queryClient.setQueryData<Invoice[]>(invoiceKeys.list(user?.id), (old = []) =>
        old.map((item) => (item.id === updatedInvoice.id ? updatedInvoice : item))
      );
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });

  // Mutation: Delete invoice (DELETE /invoices/:id)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<{ id: string }>(`/invoices/${id}`);
      return res.data || { id };
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Invoice[]>(invoiceKeys.list(user?.id), (old = []) =>
        old.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });

  // Create invoice
  const addInvoice = useCallback(
    async (invoiceData: InvoiceFormData): Promise<string> => {
      if (!user?.id) {
        throw new Error('You must be signed in to add an invoice.');
      }
      const created = await addMutation.mutateAsync(invoiceData);
      return created.id;
    },
    [user?.id, addMutation]
  );

  // Update invoice
  const updateInvoice = useCallback(
    async (id: string, invoiceData: Partial<InvoiceFormData>): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to update an invoice.');
      }
      await updateMutation.mutateAsync({ id, invoiceData });
    },
    [user?.id, updateMutation]
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
      await deleteMutation.mutateAsync(id);
    },
    [user?.id, deleteMutation]
  );

  // Get single invoice
  const getInvoice = useCallback(
    async (id: string): Promise<Invoice | null> => {
      const cached = queryClient.getQueryData<Invoice[]>(invoiceKeys.list(user?.id));
      const found = cached?.find((inv) => inv.id === id);
      if (found) {
        return found;
      }

      try {
        const res = await http.get<Invoice>(`/invoices/${id}`);
        return res.data || null;
      } catch (err) {
        console.warn('Error fetching invoice by id:', err);
        return null;
      }
    },
    [queryClient, user?.id]
  );

  // Manual refresh trigger
  const refresh = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    await refetch();
  }, [user?.id, refetch]);

  const error = useMemo(() => {
    if (queryError) {
      return (queryError as any)?.msg || (queryError as any)?.message || 'Failed to fetch invoices';
    }
    if (addMutation.error) {
      return (addMutation.error as any)?.msg || (addMutation.error as any)?.message || 'Failed to create invoice';
    }
    if (updateMutation.error) {
      return (updateMutation.error as any)?.msg || (updateMutation.error as any)?.message || 'Failed to update invoice';
    }
    if (deleteMutation.error) {
      return (deleteMutation.error as any)?.msg || (deleteMutation.error as any)?.message || 'Failed to delete invoice';
    }
    return null;
  }, [queryError, addMutation.error, updateMutation.error, deleteMutation.error]);

  const loading = Boolean(user?.id) && isLoading;

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

export default useInvoice;
