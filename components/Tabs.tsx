

import React from 'react';
import { BookOpenIcon, ChartPieIcon, PhoneIcon, ClipboardDocumentCheckIcon, DocumentDuplicateIcon } from '../icons/Icons';

type TabId = 'directory' | 'dashboard' | 'officeDirectory' | 'tasks' | 'transactions';

interface TabsProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'directory', name: 'الدليل', icon: BookOpenIcon },
        { id: 'officeDirectory', name: 'تحويلات المكاتب', icon: PhoneIcon },
        { id: 'tasks', name: 'المهام والتذكيرات', icon: ClipboardDocumentCheckIcon },
        { id: 'transactions', name: 'إدارة المعاملات', icon: DocumentDuplicateIcon },
        { id: 'dashboard', name: 'لوحة المعلومات', icon: ChartPieIcon },
    ];

    return (
        <div className="hidden md:block border-b border-gray-200 mb-6 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabId)}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2
                            ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                            }
                            transition-colors focus:outline-none
                        `}
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                        <tab.icon className="h-5 w-5" />
                        {tab.name}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Tabs;
