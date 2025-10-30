

import React from 'react';
import { BookOpenIcon, PhoneIcon, BellIcon, DocumentDuplicateIcon, ChartBarIcon, UserGroupIcon } from '../icons/Icons';

type TabId = 'directory' | 'orgChart' | 'officeDirectory' | 'tasks' | 'transactions' | 'statistics';

interface BottomNavBarProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'directory', label: 'الدليل', icon: BookOpenIcon },
    { id: 'officeDirectory', label: 'تحويلات', icon: PhoneIcon },
    { id: 'tasks', label: 'المهام', icon: BellIcon },
    { id: 'transactions', label: 'المعاملات', icon: DocumentDuplicateIcon },
    { id: 'orgChart', label: 'الهيكل', icon: UserGroupIcon },
    { id: 'statistics', label: 'إحصائيات', icon: ChartBarIcon },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

    return (
        <div className="md:hidden fixed bottom-4 inset-x-4 h-16 z-50 pointer-events-none">
            <div className="relative grid grid-cols-6 h-full max-w-lg mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80 dark:bg-gray-800/80 dark:border-gray-700/50 pointer-events-auto">
                {/* Sliding Indicator */}
                <div
                    className="absolute top-0 right-0 h-full w-[calc(100%/6)] p-1 transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    <div className="w-full h-full bg-primary/10 dark:bg-primary/20 rounded-xl" />
                </div>

                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        aria-label={tab.label}
                        className={`relative z-10 flex flex-col items-center justify-center w-full h-full pt-2 pb-1 transition-colors duration-300
                            ${activeTab === tab.id
                                ? 'text-primary dark:text-primary-light'
                                : 'text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light'
                            }`}
                    >
                        <tab.icon className="w-6 h-6 mb-1" />
                        <span className="text-xs font-bold">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNavBar;
