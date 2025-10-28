import React, { useState } from 'react';
import { OfficeContact } from '../types';
import { PhoneIcon, BuildingOfficeIcon, PencilIcon, EmailIcon, TrashIcon, Bars3Icon } from '../icons/Icons';
import { useToast } from '../contexts/ToastContext';

interface OfficeContactCardProps {
    contact: OfficeContact;
    onEdit: () => void;
    onDelete: () => void;
    allowDeletion: boolean;
    allowEditing: boolean;
}

const OfficeContactCard: React.FC<OfficeContactCardProps> = ({ contact, onEdit, onDelete, allowDeletion, allowEditing }) => {
    const { addToast } = useToast();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = `tel:${contact.extension}`;
    };
    
    const handleEmail = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (contact.email) {
            try {
                await navigator.clipboard.writeText(contact.email);
                addToast('تم نسخ البريد الإلكتروني بنجاح', 'success');
            } catch (err) {
                console.error('Failed to copy email:', err);
                addToast('فشل نسخ البريد الإلكتروني', 'error');
            }
        }
    };
    
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit();
    };
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    const isValidEmail = contact.email && contact.email.includes('@');
    
    const ActionButton: React.FC<{onClick: (e: React.MouseEvent) => void; title: string; children: React.ReactNode; className?: string}> = 
        ({onClick, title, children, className}) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors ${className}`}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className="bg-white rounded-xl shadow-md p-4 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-accent-light rounded-lg flex-shrink-0 dark:bg-gray-700">
                    <BuildingOfficeIcon className="w-6 h-6 text-accent-dark dark:text-accent-light" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-gray-800 truncate dark:text-white">{contact.name}</h3>
                    {contact.location && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{contact.location}</p>}
                    {isValidEmail && <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1" dir="ltr">{contact.email}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Desktop Buttons */}
                    <div className="hidden md:flex items-center gap-1">
                        {allowEditing && <button onClick={handleEdit} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 transition-all" title="تعديل"><PencilIcon className="w-5 h-5" /></button>}
                        {allowDeletion && <button onClick={handleDelete} className="p-2 rounded-lg text-gray-500 hover:bg-danger/10 hover:text-danger dark:text-gray-400 dark:hover:bg-danger/20 dark:hover:text-red-400 transition-all" title="حذف"><TrashIcon className="w-5 h-5" /></button>}
                        {isValidEmail && <button onClick={handleEmail} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 transition-all" title={`نسخ ${contact.email}`}><EmailIcon className="w-5 h-5" /></button>}
                        <button
                            onClick={handleCall}
                            className="flex items-center gap-1.5 bg-primary text-white font-semibold py-1.5 px-3 rounded-lg hover:bg-primary-dark transition-all duration-200 transform hover:-translate-y-0.5"
                            title={`اتصال بالرقم ${contact.extension}`}
                        >
                            <PhoneIcon className="w-4 h-4" />
                            <span className="text-sm pt-px">{contact.extension}</span>
                        </button>
                    </div>
                    
                    {/* Mobile More Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600">
                            <Bars3Icon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Menu for Mobile */}
            {isExpanded && (
                <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center animate-fade-in">
                    <ActionButton onClick={handleCall} title={`اتصال بالرقم ${contact.extension}`} className="text-primary hover:bg-primary/10 dark:text-primary-light dark:hover:bg-primary/20">
                        <PhoneIcon className="w-6 h-6" />
                        <span className="text-xs">{contact.extension}</span>
                    </ActionButton>
                    {allowEditing && (
                        <ActionButton onClick={handleEdit} title="تعديل">
                            <PencilIcon className="w-6 h-6" />
                            <span className="text-xs">تعديل</span>
                        </ActionButton>
                    )}
                    {allowDeletion && (
                        <ActionButton onClick={handleDelete} title="حذف" className="text-danger hover:bg-danger/10">
                            <TrashIcon className="w-6 h-6" />
                            <span className="text-xs">حذف</span>
                        </ActionButton>
                    )}
                    {isValidEmail && (
                        <ActionButton onClick={handleEmail} title={`نسخ ${contact.email}`} className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50">
                            <EmailIcon className="w-6 h-6" />
                            <span className="text-xs">نسخ البريد</span>
                        </ActionButton>
                    )}
                </div>
            )}
        </div>
    );
};

export default OfficeContactCard;