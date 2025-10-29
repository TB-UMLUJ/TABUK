import React from 'react';
import { Employee } from '../types';
import { BuildingOfficeIcon, IdentificationIcon, PaperAirplaneIcon, EmailIcon } from '../icons/Icons';
import { useToast } from '../contexts/ToastContext';

interface EmployeeCardProps {
    employee: Employee;
    onSelect: () => void;
}

const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
};

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onSelect }) => {
    const { addToast } = useToast();

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent modal from opening
        
        const shareTextParts = [
            `بيانات موظف:`,
            `الاسم: ${employee.full_name_ar}`,
            `المسمى الوظيفي: ${employee.job_title}`,
            `القطاع: ${employee.department}`
        ];
        if (employee.phone_direct) {
            shareTextParts.push(`رقم الجوال: ${employee.phone_direct}`);
        }
        if (employee.email && employee.email.includes('@')) {
            shareTextParts.push(`البريد الإلكتروني: ${employee.email}`);
        }

        const shareText = shareTextParts.join('\n');

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `بيانات الموظف: ${employee.full_name_ar}`,
                    text: shareText,
                });
            } catch (error) {
                // Silently fail if user cancels share dialog
                console.log('Share was cancelled or failed', error);
            }
        } else {
            // Fallback for browsers that don't support the Web Share API
            try {
                await navigator.clipboard.writeText(shareText);
                addToast('تم النسخ', 'تم نسخ بيانات الموظف إلى الحافظة.', 'info');
            } catch (err) {
                console.error('Failed to copy: ', err);
                addToast('خطأ', 'فشل نسخ البيانات', 'error');
            }
        }
    };

    return (
        <div 
            onClick={onSelect} 
            className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group dark:bg-gray-800"
        >
             <div className="absolute top-3 left-3">
                 <button
                    onClick={handleShare}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-200 transform hover:scale-110 dark:bg-primary/20 dark:text-primary-light"
                    aria-label="مشاركة بيانات الموظف"
                    title="مشاركة"
                >
                    <PaperAirplaneIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center border-4 border-gray-100 dark:border-gray-700">
                <span className="text-2xl font-bold text-brand dark:text-brand-light">{getInitials(employee.full_name_ar || '')}</span>
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-white truncate" title={employee.full_name_ar}>{employee.full_name_ar}</h3>
                <p className="mt-1 text-xs font-semibold inline-block py-1 px-2.5 rounded-full bg-accent-dark text-gray-800 truncate" title={employee.job_title}>{employee.job_title}</p>
                
                <div className="text-xs text-gray-500 mt-2 space-y-1.5 dark:text-gray-400">
                    <span className="hidden sm:flex items-center gap-1.5 w-full">
                        <BuildingOfficeIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                        <span className="truncate" title={employee.department}>{employee.department}</span>
                    </span>
                    <span className="flex items-center gap-1.5 w-full">
                        <IdentificationIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                        <span className="truncate" title={`الرقم الوظيفي: ${employee.employee_id}`}>{employee.employee_id}</span>
                    </span>
                    {employee.email && employee.email.includes('@') && (
                        <span className="flex items-center gap-1.5 w-full">
                            <EmailIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                            <span className="truncate" title={employee.email} dir="ltr">{employee.email}</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeCard;