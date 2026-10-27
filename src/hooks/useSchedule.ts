import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { http } from '../utils/http';
import { ScheduleItem, ScheduleFormData } from '../screens/schedule/types';
import dayjs from 'dayjs';

export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (userId?: string) => [...scheduleKeys.lists(), userId] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
};

/**
 * Helper to convert 12-hour time string ("09:00 AM", "2:30 PM") to comparable minutes
 */
export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = (match[3] || 'AM').toUpperCase();

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

export interface UseScheduleReturn {
  schedules: ScheduleItem[];
  loading: boolean;
  error: string | null;
  addSchedule: (scheduleData: ScheduleFormData) => Promise<string>;
  updateSchedule: (id: string, scheduleData: Partial<ScheduleFormData>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  getSchedule: (id: string) => Promise<ScheduleItem | null>;
  refresh: () => Promise<void>;
}

export const useSchedule = (): UseScheduleReturn => {
  const { user } = useAppContext();
  const queryClient = useQueryClient();

  // Sort helper to display chronological order (by date then startTime)
  const sortSchedules = useCallback((items: ScheduleItem[]): ScheduleItem[] => {
    return [...items].sort((a, b) => {
      const dateA = dayjs(a.date).valueOf();
      const dateB = dayjs(b.date).valueOf();
      if (dateA !== dateB) return dateA - dateB;

      const timeA = parseTimeToMinutes(a.startTime);
      const timeB = parseTimeToMinutes(b.startTime);
      if (timeA !== timeB) return timeA - timeB;
      return a.title.localeCompare(b.title);
    });
  }, []);

  // TanStack Query for fetching schedules list directly via HTTP
  const {
    data: rawSchedules = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<ScheduleItem[]>({
    queryKey: scheduleKeys.list(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await http.get<ScheduleItem[]>('/schedules', {
        params: { limit: 1000 },
      });
      return res.data || [];
    },
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 2,
  });

  const schedules = useMemo(() => {
    return sortSchedules(rawSchedules);
  }, [rawSchedules, sortSchedules]);

  // Mutation: Create schedule (POST /schedules)
  const addMutation = useMutation({
    mutationFn: async (scheduleData: ScheduleFormData) => {
      const res = await http.post<ScheduleItem>('/schedules', scheduleData);
      if (!res.data) {
        throw new Error(res.msg || 'Failed to create schedule');
      }
      return res.data;
    },
    onSuccess: (newSchedule) => {
      queryClient.setQueryData<ScheduleItem[]>(scheduleKeys.list(user?.id), (old = []) => [
        newSchedule,
        ...old.filter((item) => item.id !== newSchedule.id),
      ]);
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });

  // Mutation: Update schedule (PUT /schedules/:id)
  const updateMutation = useMutation({
    mutationFn: async ({ id, scheduleData }: { id: string; scheduleData: Partial<ScheduleFormData> }) => {
      const res = await http.put<ScheduleItem>(`/schedules/${id}`, scheduleData);
      if (!res.data) {
        throw new Error(res.msg || 'Failed to update schedule');
      }
      return res.data;
    },
    onSuccess: (updatedSchedule) => {
      queryClient.setQueryData<ScheduleItem[]>(scheduleKeys.list(user?.id), (old = []) =>
        old.map((item) => (item.id === updatedSchedule.id ? updatedSchedule : item))
      );
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });

  // Mutation: Delete schedule (DELETE /schedules/:id)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<{ id: string }>(`/schedules/${id}`);
      return res.data || { id };
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<ScheduleItem[]>(scheduleKeys.list(user?.id), (old = []) =>
        old.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });

  // Create schedule
  const addSchedule = useCallback(
    async (scheduleData: ScheduleFormData): Promise<string> => {
      if (!user?.id) {
        throw new Error('You must be signed in to add a schedule.');
      }
      const created = await addMutation.mutateAsync(scheduleData);
      return created.id;
    },
    [user?.id, addMutation]
  );

  // Update schedule
  const updateSchedule = useCallback(
    async (id: string, scheduleData: Partial<ScheduleFormData>): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to update a schedule.');
      }
      await updateMutation.mutateAsync({ id, scheduleData });
    },
    [user?.id, updateMutation]
  );

  // Delete schedule
  const deleteSchedule = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to delete a schedule.');
      }
      await deleteMutation.mutateAsync(id);
    },
    [user?.id, deleteMutation]
  );

  // Get single schedule
  const getSchedule = useCallback(
    async (id: string): Promise<ScheduleItem | null> => {
      const cached = queryClient.getQueryData<ScheduleItem[]>(scheduleKeys.list(user?.id));
      const found = cached?.find((s) => s.id === id);
      if (found) {
        return found;
      }

      try {
        const res = await http.get<ScheduleItem>(`/schedules/${id}`);
        return res.data || null;
      } catch (err) {
        console.warn('Error fetching schedule by id:', err);
        return null;
      }
    },
    [queryClient, user?.id]
  );

  // Refresh
  const refresh = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    await refetch();
  }, [user?.id, refetch]);

  const error = useMemo(() => {
    if (queryError) {
      return (queryError as any)?.msg || (queryError as any)?.message || 'Failed to fetch schedules';
    }
    if (addMutation.error) {
      return (addMutation.error as any)?.msg || (addMutation.error as any)?.message || 'Failed to create schedule';
    }
    if (updateMutation.error) {
      return (updateMutation.error as any)?.msg || (updateMutation.error as any)?.message || 'Failed to update schedule';
    }
    if (deleteMutation.error) {
      return (deleteMutation.error as any)?.msg || (deleteMutation.error as any)?.message || 'Failed to delete schedule';
    }
    return null;
  }, [queryError, addMutation.error, updateMutation.error, deleteMutation.error]);

  const loading = Boolean(user?.id) && isLoading;

  return {
    schedules,
    loading,
    error,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedule,
    refresh,
  };
};

export default useSchedule;
