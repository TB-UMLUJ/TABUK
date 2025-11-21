
export interface Employee {
  id: number;
  created_at?: string;
  updated_at?: string;
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
  // FIX: Add missing classification_id property.
  classification_id?: string;
  certificates?: Certificate[];
  documents?: EmployeeDocument[];
  kudos?: Kudos[];
}

export const CertificateTypes = [
  'BLS', 'ACLS', 'PALS', 'NALS', 'ATLS', 'CPR', 'PEARS', 'FALS', 'ATCN', 'Other'
] as const;

export type CertificateType = typeof CertificateTypes[number];

export interface Certificate {
  id: string; // استخدام UUID لإدارة الحالة المحلية قبل الحفظ
  type: CertificateType;
  custom_name?: string;
  expiry_date?: string; // 'YYYY-MM-DD' (سنة-شهر-يوم)
  file_url?: string;
  file_name?: string; // المسار في التخزين للحذف
  display_file_name?: string; // اسم الملف الأصلي الذي يراه المستخدم
  file?: File; // للتعامل مع تحميلات الملفات الجديدة في النماذج
}

export interface EmployeeDocument {
  id: string; // استخدام UUID لإدارة الحالة المحلية قبل الحفظ
  name: string;
  uploaded_at?: string; // ISO string
  file_url?: string;
  file_name?: string; // المسار في التخزين للحذف
  display_file_name?: string; // اسم الملف الأصلي الذي يراه المستخدم
  file?: File; // للتعامل مع تحميلات الملفات الجديدة في النماذج
}

export interface Kudos {
    id: string;
    from: string;
    type: 'teamwork' | 'innovation' | 'speed' | 'leadership';
    message: string;
    date: string;
}


export interface OfficeContact {
  id: number;
  created_at?: string;
  updated_at?: string;
  name: string;
  extension: string;
  location?: string;
  email?: string;
}

export interface HealthCenter {
  id: number;
  created_at?: string;
  updated_at?: string;
  name: string;
  manager_employee_id: number | null;
  // للبيانات المدمجة (join)
  manager?: { id: number; full_name_ar: string; } | null;
}


export interface Task {
  id: number;
  created_at?: string;
  updated_at?: string;
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
  created_at?: string;
  updated_at?: string;
  transaction_number: string;
  subject: string;
  type: TransactionType;
  platform: TransactionPlatform;
  status: TransactionStatus;
  date: string; // ISO String 'YYYY-MM-DD'
  description?: string;
  attachment?: Attachment;
  linked_employee_id?: number | null;
  linked_office_contact_id?: number | null;
  // للبيانات المدمجة (join)
  linked_employee?: { id: number; full_name_ar: string; } | null;
  linked_office_contact?: { id: number; name: string; } | null;
}

// --- أنواع الإشعارات الجديدة ---
export type NotificationCategory = 'task' | 'transaction' | 'system' | 'employee' | 'contact';

export interface Notification {
  id: number;
  created_at: string;
  title: string;
  message: string;
  category: NotificationCategory;
  is_read: boolean;
  link_id?: number;
}

// --- أنواع جديدة للتحكم في الوصول المستند إلى الأدوار (RBAC) ---
export interface Permission {
  permission_id: number;
  permission_name: string;
  description?: string;
}

export interface Role {
  role_id: number;
  role_name: string;
  description?: string;
  role_permissions?: { permissions: Permission }[]; // لعملية الدمج (join) في Supabase
}

export interface User {
  user_id: number;
  username: string;
  full_name: string;
  is_active: boolean;
  role: Role;
  role_id: number;
  permissions: string[];
}

// --- نوع جديد لسجل النشاط ---
export interface ActivityLog {
  id: number;
  created_at: string;
  user_id: number;
  user_full_name: string;
  action: string;
  action_type?: string;
  details: Record<string, any>;
}

// --- نوع جديد للسياسات ---
export interface Policy {
  id: number;
  created_at: string;
  title: string;
  description?: string;
  file_name?: string | null; // المسار في وحدة التخزين
  file_url?: string | null;
  display_file_name?: string | null; // اسم الملف الأصلي
}

// --- إجراءات جديدة لسجل النشاط ---
export type ActivityAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_EMPLOYEE' | 'UPDATE_EMPLOYEE' | 'DELETE_EMPLOYEE' | 'IMPORT_EMPLOYEES'
  | 'CREATE_CONTACT' | 'UPDATE_CONTACT' | 'DELETE_CONTACT' | 'IMPORT_CONTACTS'
  | 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 'COMPLETE_TASK'
  | 'CREATE_TRANSACTION' | 'UPDATE_TRANSACTION' | 'DELETE_TRANSACTION' | 'UPDATE_TRANSACTION_STATUS'
  | 'CREATE_POLICY' | 'UPDATE_POLICY' | 'DELETE_POLICY';

// --- أنواع جديدة للبحث الشامل ---
export interface GlobalSearchResults {
  employees: Employee[];
  officeContacts: OfficeContact[];
  tasks: Task[];
  transactions: Transaction[];
}

// --- أنواع جديدة لنظام الاستيراد ---
export interface ImportSummary {
  create: number;
  update: number;
  ignored: number;
}

export interface ValidationIssue {
  rowIndex: number; // رقم الصف في Excel
  message: string;
}

// نوع جديد للاحتفاظ ببيانات المقارنة للتحديث
export interface UpdatePreview<T> {
    old: T;
    new: Partial<T>; // البيانات الواردة من ملف Excel
}

// نوع جديد لإدارة اختيارات المستخدم للتحديثات
export type UpdateSelection = Record<number | string, Set<string>>; // المفتاح هو معرف الموظف/جهة الاتصال أو الاسم، والقيمة هي مجموعة من أسماء الحقول للتحديث

// --- أنواع جديدة لـ WebAuthn ---
export interface WebAuthnCredential {
  id: number;
  created_at: string;
  user_id: number;
  credential_id: string;
  public_key: string;
  transports: string[];
}
