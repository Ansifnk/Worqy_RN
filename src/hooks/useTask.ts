import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { http } from '../utils/http';
import {
  TaskItem,
  TaskFormData,
  ChecklistItem,
  TaskComment,
} from '../screens/tasks/types';
import dayjs from 'dayjs';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (userId?: string) => [...taskKeys.lists(), userId] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

export type TaskUpdateData = Partial<TaskFormData> & {
  comments?: TaskComment[];
};

export interface UseTaskReturn {
  tasks: TaskItem[];
  loading: boolean;
  error: string | null;
  addTask: (taskData: TaskFormData) => Promise<string>;
  updateTask: (id: string, taskData: TaskUpdateData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  toggleChecklistItem: (taskId: string, itemId: string) => Promise<void>;
  addChecklistItem: (taskId: string, title: string) => Promise<void>;
  deleteChecklistItem: (taskId: string, itemId: string) => Promise<void>;
  addComment: (taskId: string, text: string, authorName?: string) => Promise<void>;
  getTask: (id: string) => Promise<TaskItem | null>;
  refresh: () => Promise<void>;
}

export const useTask = (): UseTaskReturn => {
  const { user } = useAppContext();
  const queryClient = useQueryClient();

  // Sort tasks: Due date ascending, with Done items at bottom
  const sortTasks = useCallback((items: TaskItem[]): TaskItem[] => {
    return [...items].sort((a, b) => {
      if (a.status === 'Done' && b.status !== 'Done') return 1;
      if (a.status !== 'Done' && b.status === 'Done') return -1;

      const dateA = a.dueDate ? dayjs(a.dueDate).valueOf() : 0;
      const dateB = b.dueDate ? dayjs(b.dueDate).valueOf() : 0;
      if (dateA !== dateB) return dateA - dateB;

      return a.title.localeCompare(b.title);
    });
  }, []);

  // TanStack Query for fetching task list directly via HTTP
  const {
    data: rawTasks = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<TaskItem[]>({
    queryKey: taskKeys.list(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await http.get<TaskItem[]>('/tasks', {
        params: { limit: 1000 },
      });
      return res.data || [];
    },
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 2,
  });

  const tasks = useMemo(() => {
    return sortTasks(rawTasks);
  }, [rawTasks, sortTasks]);

  // Mutation: Create task (POST /tasks)
  const addMutation = useMutation({
    mutationFn: async (taskData: TaskFormData) => {
      const res = await http.post<TaskItem>('/tasks', taskData);
      if (!res.data) {
        throw new Error(res.msg || 'Failed to create task');
      }
      return res.data;
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData<TaskItem[]>(taskKeys.list(user?.id), (old = []) => [
        newTask,
        ...old.filter((item) => item.id !== newTask.id),
      ]);
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });

  // Mutation: Update task (PUT /tasks/:id)
  const updateMutation = useMutation({
    mutationFn: async ({ id, taskData }: { id: string; taskData: TaskUpdateData }) => {
      const res = await http.put<TaskItem>(`/tasks/${id}`, taskData);
      if (!res.data) {
        throw new Error(res.msg || 'Failed to update task');
      }
      return res.data;
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<TaskItem[]>(taskKeys.list(user?.id), (old = []) =>
        old.map((item) => (item.id === updatedTask.id ? updatedTask : item))
      );
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });

  // Mutation: Delete task (DELETE /tasks/:id)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await http.delete<{ id: string }>(`/tasks/${id}`);
      return res.data || { id };
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<TaskItem[]>(taskKeys.list(user?.id), (old = []) =>
        old.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });

  // Create task
  const addTask = useCallback(
    async (taskData: TaskFormData): Promise<string> => {
      if (!user?.id) {
        throw new Error('You must be signed in to add a task.');
      }
      const created = await addMutation.mutateAsync(taskData);
      return created.id;
    },
    [user?.id, addMutation]
  );

  // Update task
  const updateTask = useCallback(
    async (id: string, taskData: TaskUpdateData): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to update a task.');
      }
      await updateMutation.mutateAsync({ id, taskData });
    },
    [user?.id, updateMutation]
  );

  // Delete task
  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to delete a task.');
      }
      await deleteMutation.mutateAsync(id);
    },
    [user?.id, deleteMutation]
  );

  // Toggle complete
  const toggleTaskComplete = useCallback(
    async (id: string): Promise<void> => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
      await updateTask(id, { status: newStatus });
    },
    [tasks, updateTask]
  );

  // Toggle checklist item
  const toggleChecklistItem = useCallback(
    async (taskId: string, itemId: string): Promise<void> => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedChecklist = task.checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );

      await updateTask(taskId, { checklist: updatedChecklist });
    },
    [tasks, updateTask]
  );

  // Add checklist item
  const addChecklistItem = useCallback(
    async (taskId: string, title: string): Promise<void> => {
      if (!title.trim()) return;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const newItem: ChecklistItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: title.trim(),
        completed: false,
      };

      await updateTask(taskId, { checklist: [...task.checklist, newItem] });
    },
    [tasks, updateTask]
  );

  // Delete checklist item
  const deleteChecklistItem = useCallback(
    async (taskId: string, itemId: string): Promise<void> => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedChecklist = task.checklist.filter((item) => item.id !== itemId);
      await updateTask(taskId, { checklist: updatedChecklist });
    },
    [tasks, updateTask]
  );

  // Add comment
  const addComment = useCallback(
    async (taskId: string, text: string, authorName = 'Me'): Promise<void> => {
      if (!text.trim()) return;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const newComment: TaskComment = {
        id: `cmt_${Date.now()}`,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        authorName,
      };

      await updateTask(taskId, {
        comments: [...(task.comments || []), newComment],
      });
    },
    [tasks, updateTask]
  );

  // Get single task
  const getTask = useCallback(
    async (id: string): Promise<TaskItem | null> => {
      const cached = queryClient.getQueryData<TaskItem[]>(taskKeys.list(user?.id));
      const found = cached?.find((t) => t.id === id);
      if (found) {
        return found;
      }

      try {
        const res = await http.get<TaskItem>(`/tasks/${id}`);
        return res.data || null;
      } catch (err) {
        console.warn('Error fetching task by id:', err);
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
      return (queryError as any)?.msg || (queryError as any)?.message || 'Failed to fetch tasks';
    }
    if (addMutation.error) {
      return (addMutation.error as any)?.msg || (addMutation.error as any)?.message || 'Failed to create task';
    }
    if (updateMutation.error) {
      return (updateMutation.error as any)?.msg || (updateMutation.error as any)?.message || 'Failed to update task';
    }
    if (deleteMutation.error) {
      return (deleteMutation.error as any)?.msg || (deleteMutation.error as any)?.message || 'Failed to delete task';
    }
    return null;
  }, [queryError, addMutation.error, updateMutation.error, deleteMutation.error]);

  const loading = Boolean(user?.id) && isLoading;

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    addComment,
    getTask,
    refresh,
  };
};

export default useTask;
