export type ProjectStatus = 'In Progress' | 'Planning' | 'On Hold' | 'Completed' | 'Cancelled';

export type ProjectFilterStatus = 'all' | 'In Progress' | 'Planning' | 'On Hold' | 'Completed' | 'Cancelled';

export interface ProjectFormData {
  name: string;
  description?: string;
  clientId?: string;
  clientName?: string;
  status: ProjectStatus;
  startDate?: string; // ISO date string YYYY-MM-DD
  endDate?: string;   // ISO date string YYYY-MM-DD
  budget?: number;    // In INR (₹)
  color?: string;
}

export interface ProjectItem extends ProjectFormData {
  id: string;
  userId: string;
  tasksCount?: number;
  schedulesCount?: number;
  invoicesCount?: number;
  createdAt: any;
  updatedAt: any;
}
