export type ScheduleType = 'Meeting' | 'Task' | 'Deadline' | 'Reminder' | 'Break';

export interface ScheduleFormData {
  title: string;
  date: string; // ISO date string format: YYYY-MM-DD
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "10:30 AM"
  type: ScheduleType;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  notes?: string;
}

export interface ScheduleItem extends ScheduleFormData {
  id: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}
