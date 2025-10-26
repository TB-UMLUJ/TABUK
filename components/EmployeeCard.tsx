import React from 'react';
import { Employee } from '../types';
import { StarIcon, BuildingOfficeIcon, MapPinIcon, IdentificationIcon, ShareIcon } from '../icons/Icons';
import { useToast } from '../contexts/ToastContext';

interface EmployeeCardProps {
    employee: Employee;
    onSelect: () => void;
    isFavorite: boolean;
    onToggleFavorite: (e: React.MouseEvent) => void;
}

const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
};

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onSelect, isFavorite, onToggleFavorite }) => {
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
        if (employee.email) {
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
                addToast('تم نسخ بيانات الموظف إلى الحافظة', 'success');
            } catch (err) {
                console.error('Failed to copy: ', err);
                addToast('فشل نسخ البيانات', 'error');
            }
        }
    };

    return (
        <div 
            onClick={onSelect} 
            className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group dark:bg-gray-800"
        >
             <div className="absolute top-3 left-3 flex items-center gap-1">
                 <button
                    onClick={handleShare}
                    className="p-1.5 rounded-full bg-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 transform hover:scale-125 dark:bg-gray-700/50"
                    aria-label="مشاركة بيانات الموظف"
                    title="مشاركة"
                >
                    <ShareIcon className="w-5 h-5 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light" />
                </button>
                <button
                    onClick={onToggleFavorite}
                    className="p-1.5 rounded-full bg-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 transform hover:scale-125 dark:bg-gray-700/50"
                    aria-label="Toggle Favorite"
                >
                    <StarIcon className={`w-5 h-5 transition-colors ${isFavorite ? 'text-favorite fill-current' : 'text-gray-300 hover:text-favorite dark:text-gray-500 dark:hover:text-favorite'}`} />
                </button>
            </div>

            <div className="w-20 h-20 rounded-full bg-primary-light flex-shrink-0 flex items-center justify-center border-4 border-gray-100 dark:border-gray-700 dark:bg-gray-700">
                <span className="text-2xl font-bold text-primary dark:text-primary-light">{getInitials(employee.full_name_ar)}</span>
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-white truncate" title={employee.full_name_ar}>{employee.full_name_ar}</h3>
                <p className="text-xs sm:text-sm text-primary font-semibold dark:text-primary-light truncate" title={employee.job_title}>{employee.job_title}</p>
                <div className="text-xs text-gray-500 mt-2 flex items-start gap-4 dark:text-gray-400">
                    {/* Column 1: Department & Center */}
                    <div className="flex flex-col gap-1 min-w-0">
                         <span className="flex items-center gap-1.5 w-full">
                             <BuildingOfficeIcon className="w-3.5 h-3.5 flex-shrink-0"/> 
                             <span className="truncate" title={employee.department}>{employee.department}</span>
                         </span>
                         {employee.center && (
                             <span className="flex items-center gap-1.5 w-full">
                                <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                                <span className="truncate" title={employee.center}>{employee.center}</span>
                             </span>
                         )}
                    </div>
                    {/* Column 2: IDs */}
                     <div className="flex flex-col gap-1 min-w-0">
                        <span className="flex items-center gap-1.5 w-full">
                            <IdentificationIcon className="w-3.5 h-3.5 flex-shrink-0"/> 
                            <span className="truncate" title={`الرقم الوظيفي: ${employee.employee_id}`}>{employee.employee_id}</span>
                        </span>
                        {employee.national_id && (
                            <span className="flex items-center gap-1.5 w-full">
                               <IdentificationIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                               <span className="truncate" title={`رقم السجل: ${employee.national_id}`}>{employee.national_id}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeCard;