
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Employee } from '../types';
import { EmailIcon, PhoneIcon, CloseIcon, IdentificationIcon, BuildingOfficeIcon, BriefcaseIcon, UserIcon, GlobeAltIcon, UsersIcon, CakeIcon, DocumentCheckIcon, PencilIcon, TrashIcon } from '../icons/Icons';

interface EmployeeProfileModalProps {
    isOpen: boolean;
    employee: Employee | null;
    onClose: () => void;
    onEdit: (employee: Employee) => void;
    onDelete: (employeeId: number) => void;
}

const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
};


const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({ isOpen, employee, onClose, onEdit, onDelete }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    }, [onClose]);

    const handleCall = useCallback(() => {
        if (employee?.phone_direct) {
            window.location.href = `tel:${employee.phone_direct}`;
        }
    }, [employee]);

    const handleEmail = useCallback(() => {
        if (employee?.email) {
            window.location.href = `mailto:${employee.email}`;
        }
    }, [employee]);

    const handleEdit = useCallback(() => {
        if (employee) {
            onEdit(employee);
        }
    }, [employee, onEdit]);
    
    const handleDelete = () => {
        if (employee) {
            if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.')) {
                setIsClosing(true); // Start closing animation
                setTimeout(() => {
                    onDelete(employee.id); // This will delete and close the modal from App.tsx
                }, 300); // Wait for animation to finish
            }
        }
    };

    const InfoRow: React.FC<{ label: string; value: string | undefined; icon: React.ReactNode; href?: string }> = ({ label, value, icon, href }) => {
        if (!value) return null;
        
        const valueContent = href ? (
            <a href={href} className="hover:underline" target="_blank" rel="noopener noreferrer">{value}</a>
        ) : (
            value
        );

        return (
            <div className="flex items-start gap-4 py-3">
                <div className="bg-accent-light p-2.5 rounded-lg text-accent-dark mt-1 dark:bg-primary/20 dark:text-primary-light">{icon}</div>
                <div>
                    <p className="text-sm text-gray-500 font-medium dark:text-gray-400">{label}</p>
                    <p className="text-md font-bold text-gray-800 dark:text-white break-all">{valueContent}</p>
                </div>
            </div>
        );
    };
    
    if (!isOpen) {
        return null;
    }

    const modalRoot = document.getElementById('modal-root');
    if (!employee || !modalRoot) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-50 flex justify-center items-center p-4"
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`fixed inset-0 bg-black ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div
                className={`relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}
            >
                 <div className="p-6 md:p-8">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 left-4 text-gray-400 hover:text-gray-800 transition-all duration-300 z-10 p-2 bg-gray-100/50 rounded-full dark:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200/80 transform hover:rotate-90"
                    >
                       <CloseIcon className="w-6 h-6" />
                    </button>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-6">
                        <div className="text-center flex-shrink-0">
                             <div className="w-32 h-32 rounded-full bg-primary-light flex-shrink-0 flex items-center justify-center mx-auto border-4 border-gray-200 dark:border-gray-600 dark:bg-gray-700">
                                <span className="text-5xl font-bold text-primary dark:text-primary-light">{getInitials(employee.full_name_ar)}</span>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-right w-full">
                            <h2 className="text-3xl font-bold text-primary dark:text-white">{employee.full_name_ar}</h2>
                            <p className="text-lg text-accent-dark font-semibold dark:text-accent-light">{employee.job_title}</p>
                            <p className="text-md text-gray-400 dark:text-gray-500">{employee.full_name_en}</p>
                            
                            <div className="mt-6 flex items-center justify-center md:justify-end gap-2">
                                <button
                                    onClick={handleCall}
                                    disabled={!employee.phone_direct}
                                    className="text-center bg-primary text-white p-3 rounded-lg hover:bg-primary-dark transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="اتصال"
                                    title="اتصال"
                                >
                                    <PhoneIcon className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={handleEmail}
                                    disabled={!employee.email}
                                    className="text-center bg-primary/10 text-primary p-3 rounded-lg hover:bg-primary/20 transition-all duration-200 transform hover:scale-105 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="ارسال بريد إلكتروني"
                                    title="ارسال بريد إلكتروني"
                                >
                                     <EmailIcon className="w-6 h-6" />
                                </button>
                            
                                <div className="border-l h-6 border-gray-300 dark:border-gray-600 mx-1"></div>
                                
                                <button onClick={handleEdit} className="text-center bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600" aria-label="تعديل" title="تعديل">
                                    <PencilIcon className="w-6 h-6" />
                                </button>
                                <button onClick={handleDelete} className="text-center bg-danger/10 text-danger p-3 rounded-lg hover:bg-danger/20 transition-all duration-200 transform hover:scale-105 dark:bg-danger/20 dark:text-red-400 dark:hover:bg-danger/30" aria-label="حذف" title="حذف">
                                    <TrashIcon className="w-6 h-6" />
                                </button>
                            </div>

                        </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 dark:border-gray-700">
                        <InfoRow label="الاسم باللغة العربية" value={employee.full_name_ar} icon={<UserIcon className="w-5 h-5"/>}/>
                        <InfoRow label="الاسم باللغة الإنجليزية" value={employee.full_name_en} icon={<UserIcon className="w-5 h-5"/>}/>
                        <InfoRow label="الرقم الوظيفي" value={employee.employee_id} icon={<IdentificationIcon className="w-5 h-5"/>}/>
                        <InfoRow label="المسمى الوظيفي" value={employee.job_title} icon={<BriefcaseIcon className="w-5 h-5"/>}/>
                        <InfoRow label="القطاع" value={employee.department} icon={<BuildingOfficeIcon className="w-5 h-5"/>}/>
                        <InfoRow label="المركز" value={employee.center} icon={<BuildingOfficeIcon className="w-5 h-5"/>}/>
                        <InfoRow label="رقم الجوال" value={employee.phone_direct} icon={<PhoneIcon className="w-5 h-5"/>} href={`tel:${employee.phone_direct}`} />
                        <InfoRow label="البريد الإلكتروني" value={employee.email} icon={<EmailIcon className="w-5 h-5"/>} href={`mailto:${employee.email}`} />
                        <InfoRow label="السجل المدني / الإقامة" value={employee.national_id} icon={<IdentificationIcon className="w-5 h-5"/>}/>
                        <InfoRow label="الجنسية" value={employee.nationality} icon={<GlobeAltIcon className="w-5 h-5"/>}/>
                        <InfoRow label="الجنس" value={employee.gender} icon={<UsersIcon className="w-5 h-5"/>}/>
                        <InfoRow label="تاريخ الميلاد" value={employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined} icon={<CakeIcon className="w-5 h-5"/>}/>
                        <InfoRow label="رقم التصنيف" value={employee.classification_id} icon={<DocumentCheckIcon className="w-5 h-5"/>}/>
                    </div>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default EmployeeProfileModal;