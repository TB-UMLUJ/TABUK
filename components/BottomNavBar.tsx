

import React from 'react';
import { BookOpenIcon, ChartPieIcon, UserPlusIcon, ClipboardDocumentCheckIcon, PhoneIcon, DocumentDuplicateIcon } from '../icons/Icons';

type TabId = 'directory' | 'dashboard' | 'officeDirectory' | 'tasks' | 'transactions';

interface BottomNavBarProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
    onAddEmployeeClick: () => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab, onAddEmployeeClick }) => {

    const NavButton: React.FC<{
        label: string;
        icon: React.ElementType;
        onClick: () => void;
        isActive?: boolean;
    }> = ({ label, icon: Icon, onClick, isActive = false }) => (
        <button
            onClick={onClick}
            aria-label={label}
            className={`flex flex-col items-center justify-center w-full h-full pt-2 pb-1 transition-all duration-200 transform hover:scale-110 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light'}`}
        >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
        </button>
    );

    return (
        <div className="md:hidden fixed bottom-4 inset-x-4 h-20 z-50 pointer-events-none">
            <div className="grid grid-cols-5 h-full max-w-lg mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80 dark:bg-gray-800/80 dark:border-gray-700/50 pointer-events-auto">
                <NavButton
                    label="الدليل"
                    icon={BookOpenIcon}
                    onClick={() => setActiveTab('directory')}
                    isActive={activeTab === 'directory'}
                />
                <NavButton
                    label="تحويلات"
                    icon={PhoneIcon}
                    onClick={() => setActiveTab('officeDirectory')}
                    isActive={activeTab === 'officeDirectory'}
                />
                <div className="flex justify-center items-center">
                     <button
                        onClick={onAddEmployeeClick}
                        className="w-16 h-16 -mt-6 bg-primary rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 hover:rotate-90 transition-all duration-300"
                        aria-label="إضافة موظف جديد"
                    >
                        <UserPlusIcon className="w-8 h-8" />
                    </button>
                </div>
                <NavButton
                    label="المهام"
                    icon={ClipboardDocumentCheckIcon}
                    onClick={() => setActiveTab('tasks')}
                    isActive={activeTab === 'tasks'}
                />
                 <NavButton
                    label="المعاملات"
                    icon={DocumentDuplicateIcon}
                    onClick={() => setActiveTab('transactions')}
                    isActive={activeTab === 'transactions'}
                />
            </div>
        </div>
    );
};

export default BottomNavBar;
