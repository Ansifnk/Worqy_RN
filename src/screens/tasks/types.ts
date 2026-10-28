export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  text: string;
  createdAt: any;
  authorName?: string;
}

export interface TaskFormData {
  title: string;
  clientName?: string;
  clientId?: string;
  project?: string;
  projectId?: string;
  projectName?: string;
  dueDate: string; // ISO string format
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;
  description?: string;
  checklist?: ChecklistItem[];
}

export interface TaskItem extends TaskFormData {
  id: string;
  userId: string;
  checklist: ChecklistItem[];
  comments?: TaskComment[];
  createdAt: any;
  updatedAt: any;
}
