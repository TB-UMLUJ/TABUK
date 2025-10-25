import { Transaction } from '../types';

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    transactionNumber: 'THC-2024-001',
    subject: 'طلب توفير أجهزة حاسب آلي لقسم الطوارئ',
    type: 'incoming',
    platform: 'Bain',
    status: 'inProgress',
    date: '2024-09-01',
    description: 'معاملة واردة من الشؤون الإدارية بخصوص طلب أجهزة حاسب آلي جديدة.',
  },
  {
    id: 2,
    transactionNumber: 'THC-2024-002',
    subject: 'الرد على استفسار بخصوص إجازات الموظفين',
    type: 'outgoing',
    platform: 'HospitalEmail',
    status: 'completed',
    date: '2024-08-28',
    description: 'تم إرسال الرد إلى إدارة الموارد البشرية.',
  },
  {
    id: 3,
    transactionNumber: 'THC-2024-003',
    subject: 'تعميم بخصوص إجراءات السلامة الجديدة',
    type: 'incoming',
    platform: 'MinisterEmail',
    status: 'new',
    date: '2024-09-05',
  },
  {
    id: 4,
    transactionNumber: 'THC-2024-004',
    subject: 'متابعة تقرير الصيانة الدورية للمبنى الرئيسي',
    type: 'outgoing',
    platform: 'Bain',
    status: 'followedUp',
    date: '2024-08-20',
    description: 'تم إرسال تذكير لقسم الصيانة.',
  }
];
