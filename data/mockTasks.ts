import { Task } from '../types';

export const mockTasks: Task[] = [
  { id: 1, title: 'مراجعة تقرير الأداء الربع سنوي', description: 'التأكد من اكتمال جميع الأقسام وتحليل البيانات.', dueDate: '2024-09-15', isCompleted: false },
  { id: 2, title: 'التحضير لاجتماع الإدارة الأسبوعي', description: 'تجهيز عرض تقديمي عن تقدم المشاريع الحالية.', dueDate: '2024-09-10', isCompleted: true },
  { id: 3, title: 'التواصل مع قسم الموارد البشرية بخصوص التعيينات الجديدة', description: 'تحديد موعد للمقابلات الشخصية للمرشحين الجدد.', isCompleted: false },
  { id: 4, title: 'إرسال بريد إلكتروني للمتابعة مع الموردين', description: 'متابعة طلبات الشراء المعلقة والتأكد من تواريخ التسليم.', dueDate: '2024-09-12', isCompleted: false },
  { id: 5, title: 'تحديث دليل الهاتف الداخلي', description: 'إضافة الموظفين الجدد وإزالة من غادروا.', dueDate: '2024-09-30', isCompleted: true },
];
