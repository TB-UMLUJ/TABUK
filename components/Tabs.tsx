import React from 'react';
import { BookOpenIcon, UserGroupIcon, PhoneIcon, BellIcon, DocumentDuplicateIcon, ChartBarIcon } from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';

type TabId = 'directory' | 'orgChart' | 'officeDirectory' | 'tasks' | 'transactions' | 'statistics';

// FIX: Defined a type for tab objects to include the optional 'requiredPermission' property.
// This resolves the TypeScript error where 'requiredPermission' was accessed on an inferred type that did not include it.
type TabInfo = {
    id: TabId;
    name: string;
    icon: React.ElementType;
    requiredPermission?: string;
};

interface TabsProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
    const { hasPermission } = useAuth();
    
    const allTabs: TabInfo[] = [
        { id: 'statistics', name: 'الإحصائيات', icon: ChartBarIcon },
        { id: 'directory', name: 'الدليل', icon: BookOpenIcon },
        { id: 'officeDirectory', name: 'تحويلات المكاتب', icon: PhoneIcon },
        { id: 'tasks', name: 'المهام والتذكيرات', icon: BellIcon },
        { id: 'transactions', name: 'إدارة المعاملات', icon: DocumentDuplicateIcon },
        { id: 'orgChart', name: 'الهيكل التنظيمي', icon: UserGroupIcon },
    ];
    
    const visibleTabs = allTabs.filter(tab => !tab.requiredPermission || hasPermission(tab.requiredPermission));

    return (
        <div className="hidden md:block border-b border-gray-200 mb-6 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                {visibleTabs.map(tab => (
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