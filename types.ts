
export interface Employee {
  id: number;
  full_name_ar: string;
  full_name_en: string;
  employee_id: string;
  job_title: string;
  department: string;
  phone_direct: string;
  email: string;
  center?: string;
  national_id?: string;
  nationality?: string;
  gender?: string;
  date_of_birth?: string;
  classification_id?: string;
}

export interface OfficeContact {
  id: number;
  name: string;
  extension: string;
  location?: string;
  email?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string; // Storing as 'YYYY-MM-DD'
  is_completed: boolean;
}

export interface Attachment {
  name: string;
  type: string;
  data: string; // Base64 encoded string
}

export type TransactionType = 'incoming' | 'outgoing';
export type TransactionPlatform = 'Bain' | 'MinisterEmail' | 'HospitalEmail';
export type TransactionStatus = 'new' | 'inProgress' | 'followedUp' | 'completed';

export interface Transaction {
  id: number;
  transaction_number: string;
  subject: string;
  type: TransactionType;
  platform: TransactionPlatform;
  status: TransactionStatus;
  date: string; // ISO String 'YYYY-MM-DD'
  description?: string;
  attachment?: Attachment;
}

// --- New RBAC Types ---
export interface Role {
  role_id: number;
  role_name: string;
}

export interface User {
  user_id: number;
  username: string;
  full_name: string;
  is_active: boolean;
  role: Role;
  // FIX: Added role_id to match the database schema and resolve type errors during user upsert operations.
  role_id: number;
  permissions: string[];
}
