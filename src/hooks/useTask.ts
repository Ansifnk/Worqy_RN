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
  TaskItem,
  TaskFormData,
  ChecklistItem,
  TaskComment,
} from '../screens/tasks/types';
import dayjs from 'dayjs';

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

export interface UseTaskReturn {
  tasks: TaskItem[];
  loading: boolean;
  error: string | null;
  addTask: (taskData: TaskFormData) => Promise<string>;
  updateTask: (id: string, taskData: Partial<TaskFormData>) => Promise<void>;
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
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const db = useMemo(() => getFirestore(), []);
  const tasksCollection = useMemo(
    () => collection(db, firebaseCollections.tasks),
    [db]
  );

  // Map Firestore document snapshot to typed TaskItem
  const mapDocToTaskItem = useCallback((docSnap: any): TaskItem => {
    const data = docSnap.data() || {};
    return {
      id: docSnap.id,
      title: data.title || '',
      clientName: data.clientName || '',
      clientId: data.clientId,
      project: data.project || '',
      dueDate: data.dueDate || new Date().toISOString(),
      priority: data.priority || 'Medium',
      status: data.status || 'To Do',
      assignedTo: data.assignedTo || 'Me',
      description: data.description || '',
      checklist: Array.isArray(data.checklist) ? data.checklist : [],
      comments: Array.isArray(data.comments) ? data.comments : [],
      userId: data.userId || '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }, []);

  // Sort tasks: Due date ascending, or created date
  const sortTasks = useCallback((items: TaskItem[]): TaskItem[] => {
    return [...items].sort((a, b) => {
      // Done items at the bottom if comparing completion
      if (a.status === 'Done' && b.status !== 'Done') return 1;
      if (a.status !== 'Done' && b.status === 'Done') return -1;

      const dateA = a.dueDate ? dayjs(a.dueDate).valueOf() : 0;
      const dateB = b.dueDate ? dayjs(b.dueDate).valueOf() : 0;
      if (dateA !== dateB) return dateA - dateB;

      return a.title.localeCompare(b.title);
    });
  }, []);

  // Real-time listener strictly scoped to authenticated user
  useEffect(() => {
    if (!user?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const userTasksQuery = query(
      tasksCollection,
      where('userId', '==', user.id)
    );

    const unsubscribe = onSnapshot(
      userTasksQuery,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => mapDocToTaskItem(docSnap));
        setTasks(sortTasks(items));
        setLoading(false);
      },
      (err) => {
        console.error('Failed to listen to tasks:', err);
        setError(err.message || 'Failed to fetch tasks');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id, tasksCollection, mapDocToTaskItem, sortTasks]);

  // Create new task
  const addTask = useCallback(
    async (taskData: TaskFormData): Promise<string> => {
      if (!user?.id) {
        throw new Error('You must be signed in to add a task.');
      }

      setError(null);
      try {
        const payload = sanitizePayload({
          ...taskData,
          checklist: taskData.checklist || [],
          comments: [],
          userId: user.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const docRef = await addDoc(tasksCollection, payload);
        return docRef.id;
      } catch (err: any) {
        console.error('Error adding task to Firestore:', err);
        const message = err?.message || 'Failed to create task';
        setError(message);
        throw err;
      }
    },
    [user?.id, tasksCollection]
  );

  // Update existing task
  const updateTask = useCallback(
    async (id: string, taskData: Partial<TaskFormData>): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to update a task.');
      }

      setError(null);
      try {
        const docRef = doc(db, firebaseCollections.tasks, id);
        const payload = sanitizePayload({
          ...taskData,
          updatedAt: serverTimestamp(),
        });

        await updateDoc(docRef, payload);
      } catch (err: any) {
        console.error('Error updating task in Firestore:', err);
        const message = err?.message || 'Failed to update task';
        setError(message);
        throw err;
      }
    },
    [user?.id, db]
  );

  // Delete task
  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to delete a task.');
      }

      setError(null);
      try {
        const docRef = doc(db, firebaseCollections.tasks, id);
        await deleteDoc(docRef);
      } catch (err: any) {
        console.error('Error deleting task from Firestore:', err);
        const message = err?.message || 'Failed to delete task';
        setError(message);
        throw err;
      }
    },
    [user?.id, db]
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

      const docRef = doc(db, firebaseCollections.tasks, taskId);
      await updateDoc(docRef, {
        checklist: updatedChecklist,
        updatedAt: serverTimestamp(),
      });
    },
    [tasks, db]
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

      const docRef = doc(db, firebaseCollections.tasks, taskId);
      await updateDoc(docRef, {
        checklist: [...task.checklist, newItem],
        updatedAt: serverTimestamp(),
      });
    },
    [tasks, db]
  );

  // Delete checklist item
  const deleteChecklistItem = useCallback(
    async (taskId: string, itemId: string): Promise<void> => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedChecklist = task.checklist.filter((item) => item.id !== itemId);
      const docRef = doc(db, firebaseCollections.tasks, taskId);
      await updateDoc(docRef, {
        checklist: updatedChecklist,
        updatedAt: serverTimestamp(),
      });
    },
    [tasks, db]
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

      const docRef = doc(db, firebaseCollections.tasks, taskId);
      await updateDoc(docRef, {
        comments: [...(task.comments || []), newComment],
        updatedAt: serverTimestamp(),
      });
    },
    [tasks, db]
  );

  // Get single task
  const getTask = useCallback(
    async (id: string): Promise<TaskItem | null> => {
      try {
        const docRef = doc(db, firebaseCollections.tasks, id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          return null;
        }
        return mapDocToTaskItem(snap);
      } catch (err: any) {
        console.error('Error getting task from Firestore:', err);
        return null;
      }
    },
    [db, mapDocToTaskItem]
  );

  // Refresh
  const refresh = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userTasksQuery = query(
        tasksCollection,
        where('userId', '==', user.id)
      );
      const snapshot = await getDocs(userTasksQuery);
      const items = snapshot.docs.map((docSnap) => mapDocToTaskItem(docSnap));
      setTasks(sortTasks(items));
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing tasks:', err);
      setError(err?.message || 'Failed to refresh tasks');
    } finally {
      setLoading(false);
    }
  }, [user?.id, tasksCollection, mapDocToTaskItem, sortTasks]);

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
