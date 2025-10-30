
import React from 'react';
import { BookOpenIcon, PhoneIcon, BellIcon, DocumentDuplicateIcon, ChartBarIcon, UserGroupIcon } from '../icons/Icons';

type TabId = 'directory' | 'orgChart' | 'officeDirectory' | 'tasks' | 'transactions' | 'statistics';

interface BottomNavBarProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ 
    activeTab, 
    setActiveTab, 
}) => {

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
        <div className="md:hidden fixed bottom-4 inset-x-4 h-16 z-50 pointer-events-none">
            <div className="grid grid-cols-6 h-full max-w-lg mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80 dark:bg-gray-800/80 dark:border-gray-700/50 pointer-events-auto">
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
                <NavButton
                    label="المهام"
                    icon={BellIcon}
                    onClick={() => setActiveTab('tasks')}
                    isActive={activeTab === 'tasks'}
                />
                 <NavButton
                    label="المعاملات"
                    icon={DocumentDuplicateIcon}
                    onClick={() => setActiveTab('transactions')}
                    isActive={activeTab === 'transactions'}
                />
                 <NavButton
                    label="الهيكل"
                    icon={UserGroupIcon}
                    onClick={() => setActiveTab('orgChart')}
                    isActive={activeTab === 'orgChart'}
                />
                 <NavButton
                    label="إحصائيات"
                    icon={ChartBarIcon}
                    onClick={() => setActiveTab('statistics')}
                    isActive={activeTab === 'statistics'}
                />
            </div>
        </div>
    );
};

export default BottomNavBar;