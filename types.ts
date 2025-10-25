
export interface Employee {
  id: number;
  fullNameAr: string;
  fullNameEn: string;
  employeeId: string;
  jobTitle: string;
  department: string;
  phoneDirect: string;
  email: string;
  center?: string;
  nationalId?: string;
  nationality?: string;
  gender?: string;
  dateOfBirth?: string;
  classificationId?: string;
}

export interface OfficeContact {
  id: number;
  name: string;
  extension: string;
  location?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string; // Storing as 'YYYY-MM-DD'
  isCompleted: boolean;
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
  transactionNumber: string;
  subject: string;
  type: TransactionType;
  platform: TransactionPlatform;
  status: TransactionStatus;
  date: string; // ISO String 'YYYY-MM-DD'
  description?: string;
  attachment?: Attachment;
}
