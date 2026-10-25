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
import { ScheduleItem, ScheduleFormData } from '../screens/schedule/types';
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
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const db = useMemo(() => getFirestore(), []);
  const schedulesCollection = useMemo(
    () => collection(db, firebaseCollections.schedules),
    [db]
  );

  // Parse document snapshot into typed ScheduleItem
  const mapDocToScheduleItem = useCallback((docSnap: any): ScheduleItem => {
    const data = docSnap.data() || {};
    return {
      id: docSnap.id,
      title: data.title || '',
      date: data.date || '',
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      type: data.type || 'Meeting',
      clientId: data.clientId,
      clientName: data.clientName,
      notes: data.notes,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }, []);

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

  // Real-time listener strictly scoped to authenticated user
  useEffect(() => {
    if (!user?.id) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const userSchedulesQuery = query(
      schedulesCollection,
      where('userId', '==', user.id)
    );

    const unsubscribe = onSnapshot(
      userSchedulesQuery,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => mapDocToScheduleItem(docSnap));
        setSchedules(sortSchedules(items));
        setLoading(false);
      },
      (err) => {
        console.error('Failed to listen to schedules:', err);
        setError(err.message || 'Failed to fetch schedules');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id, schedulesCollection, mapDocToScheduleItem, sortSchedules]);

  // Create new schedule item
  const addSchedule = useCallback(
    async (scheduleData: ScheduleFormData): Promise<string> => {
      if (!user?.id) {
        throw new Error('You must be signed in to add a schedule.');
      }

      setError(null);
      try {
        const payload = sanitizePayload({
          ...scheduleData,
          date: dayjs(scheduleData.date).toISOString(),
          userId: user.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const docRef = await addDoc(schedulesCollection, payload);
        return docRef.id;
      } catch (err: any) {
        console.error('Error adding schedule to Firestore:', err);
        const message = err?.message || 'Failed to create schedule';
        setError(message);
        throw err;
      }
    },
    [user?.id, schedulesCollection]
  );

  // Update existing schedule
  const updateSchedule = useCallback(
    async (id: string, scheduleData: Partial<ScheduleFormData>): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to update a schedule.');
      }

      setError(null);
      try {
        const docRef = doc(db, firebaseCollections.schedules, id);
        const payload = sanitizePayload({
          ...scheduleData,
          ...(scheduleData.date ? { date: dayjs(scheduleData.date).toISOString() } : {}),
          updatedAt: serverTimestamp(),
        });

        await updateDoc(docRef, payload);
      } catch (err: any) {
        console.error('Error updating schedule in Firestore:', err);
        const message = err?.message || 'Failed to update schedule';
        setError(message);
        throw err;
      }
    },
    [user?.id, db]
  );

  // Delete schedule
  const deleteSchedule = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('You must be signed in to delete a schedule.');
      }

      setError(null);
      try {
        const docRef = doc(db, firebaseCollections.schedules, id);
        await deleteDoc(docRef);
      } catch (err: any) {
        console.error('Error deleting schedule from Firestore:', err);
        const message = err?.message || 'Failed to delete schedule';
        setError(message);
        throw err;
      }
    },
    [user?.id, db]
  );

  // Get single schedule
  const getSchedule = useCallback(
    async (id: string): Promise<ScheduleItem | null> => {
      try {
        const docRef = doc(db, firebaseCollections.schedules, id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          return null;
        }
        return mapDocToScheduleItem(snap);
      } catch (err: any) {
        console.error('Error getting schedule from Firestore:', err);
        return null;
      }
    },
    [db, mapDocToScheduleItem]
  );

  // Manual refresh
  const refresh = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userSchedulesQuery = query(
        schedulesCollection,
        where('userId', '==', user.id)
      );
      const snapshot = await getDocs(userSchedulesQuery);
      const items = snapshot.docs.map((docSnap) => mapDocToScheduleItem(docSnap));
      setSchedules(sortSchedules(items));
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing schedules:', err);
      setError(err?.message || 'Failed to refresh schedules');
    } finally {
      setLoading(false);
    }
  }, [user?.id, schedulesCollection, mapDocToScheduleItem, sortSchedules]);

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
