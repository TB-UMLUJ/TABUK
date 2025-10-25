import { Task } from '../types';

export const mockTasks: Task[] = [
  { id: 1, title: 'مراجعة تقرير الأداء الربع سنوي', description: 'التأكد من اكتمال جميع الأقسام وتحليل البيانات.', due_date: '2024-09-15', is_completed: false },
  { id: 2, title: 'التحضير لاجتماع الإدارة الأسبوعي', description: 'تجهيز عرض تقديمي عن تقدم المشاريع الحالية.', due_date: '2024-09-10', is_completed: true },
  { id: 3, title: 'التواصل مع قسم الموارد البشرية بخصوص التعيينات الجديدة', description: 'تحديد موعد للمقابلات الشخصية للمرشحين الجدد.', is_completed: false },
  { id: 4, title: 'إرسال بريد إلكتروني للمتابعة مع الموردين', description: 'متابعة طلبات الشراء المعلقة والتأكد من تواريخ التسليم.', due_date: '2024-09-12', is_completed: false },
  { id: 5, title: 'تحديث دليل الهاتف الداخلي', description: 'إضافة الموظفين الجدد وإزالة من غادروا.', due_date: '2024-09-30', is_completed: true },
];