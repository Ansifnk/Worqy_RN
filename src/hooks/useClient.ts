import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { http } from '../utils/http';
import { ClientItem, ClientFormData } from '../screens/clients/types';

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (userId?: string) => [...clientKeys.lists(), userId] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
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
  const queryClient = useQueryClient();

  // Helper to sort clients with latest created/updated first
  const sortClients = useCallback((items: ClientItem[]): ClientItem[] => {
    return [...items].sort((a, b) => {
      const timeA =
        a.createdAt?.toMillis?.() ??
        (typeof a.createdAt === 'string'
          ? new Date(a.createdAt).getTime()
          : typeof a.createdAt === 'number'
          ? a.createdAt
          : 0);
      const timeB =
        b.createdAt?.toMillis?.() ??
        (typeof b.createdAt === 'string'
          ? new Date(b.createdAt).getTime()
          : typeof b.createdAt === 'number'
          ? b.createdAt
          : 0);
      if (timeA !== timeB) return timeB - timeA;
      return a.name.localeCompare(b.name);
    });
  }, []);

  // TanStack Query for fetching client list directly via HTTP
  const {
    data: rawClients = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<ClientItem[]>({
    queryKey: clientKeys.list(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await http.get<ClientItem[]>('/clients', {
        params: { limit: 1000 },
      });
      return res.data || [];
    },
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const clients = useMemo(() => {
    return sortClients(rawClients);
  }, [rawClients, sortClients]);

  // Mutation: Create client (POST /clients)
  const addMutation = useMutation({
    mutationFn: async (newClientData: ClientFormData) => {
      const res = await http.post<ClientItem>('/clients', newClientData);
      if (!res.data) {
        throw new Error(res.msg || 'Failed to create client');
      }
      return res.data;
    },
    onSuccess: (newClient) => {
      queryClient.setQueryData<ClientItem[]>(clientKeys.list(user?.id), (old = []) => [
        newClient,
        ...old.filter((item) => item.id !== newClient.id),
      ]);
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });

  // Mutation: Update client (PUT /clients/:id)
  const updateMutation = useMutation({
    mutationFn: async ({ id, clientData }: { id: string; clientData: Partial<ClientFormData> }) => {
      const res = await http.put<ClientItem>(`/clients/${id}`, clientData);
      if (!res.data) {
        throw new Error(res.msg || 'Failed to update client');
      }
      return res.data;
    },
    onSuccess: (updatedClient) => {
      queryClient.setQueryData<ClientItem[]>(clientKeys.list(user?.id), (old = []) =>
        old.map((item) => (item.id === updatedClient.id ? updatedClient : item))
      );
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });

  // Mutation: Delete client (DELETE /clients/:id)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<{ id: string }>(`/clients/${id}`);
      return res.data || { id };
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<ClientItem[]>(clientKeys.list(user?.id), (old = []) =>
        old.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });

  // Create client
  const addClient = useCallback(
    async (clientData: ClientFormData): Promise<string> => {
      if (!user?.id) {
        throw new Error('You must be signed in to add a client.');
      }
      const created = await addMutation.mutateAsync(clientData);
      return created.id;
    },
    [user?.id, addMutation]
  );

  // Update client
  const updateClient = useCallback(
    async (id: string, clientData: Partial<ClientFormData>): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to update a client.');
      }
      await updateMutation.mutateAsync({ id, clientData });
    },
    [user?.id, updateMutation]
  );

  // Delete client
  const deleteClient = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to delete a client.');
      }
      await deleteMutation.mutateAsync(id);
    },
    [user?.id, deleteMutation]
  );

  // Get single client by id (from cache or server fallback GET /clients/:id)
  const getClient = useCallback(
    async (id: string): Promise<ClientItem | null> => {
      const cached = queryClient.getQueryData<ClientItem[]>(clientKeys.list(user?.id));
      const found = cached?.find((c) => c.id === id);
      if (found) {
        return found;
      }

      try {
        const res = await http.get<ClientItem>(`/clients/${id}`);
        return res.data || null;
      } catch (err) {
        console.warn('Error fetching client by id:', err);
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
      return (queryError as any)?.msg || (queryError as any)?.message || 'Failed to fetch clients';
    }
    if (addMutation.error) {
      return (addMutation.error as any)?.msg || (addMutation.error as any)?.message || 'Failed to create client';
    }
    if (updateMutation.error) {
      return (updateMutation.error as any)?.msg || (updateMutation.error as any)?.message || 'Failed to update client';
    }
    if (deleteMutation.error) {
      return (deleteMutation.error as any)?.msg || (deleteMutation.error as any)?.message || 'Failed to delete client';
    }
    return null;
  }, [queryError, addMutation.error, updateMutation.error, deleteMutation.error]);

  const loading = Boolean(user?.id) && isLoading;

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
