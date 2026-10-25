export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export type InvoiceFilterStatus = 'all' | 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export interface InvoiceItem {
  id: string;
  title: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  issueDate: string; // ISO string or 'YYYY-MM-DD'
  dueDate: string;   // ISO string or 'YYYY-MM-DD'
  paymentTerms: string; // e.g., 'Net 14 days', 'Due on receipt', etc.
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // percentage e.g. 18
  taxAmount: number;
  total: number;
  notes?: string;
  avatarColor?: string;
  avatarLetter?: string;
}

export interface Invoice extends InvoiceFormData {
  id: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}
