import React from 'react';
import { BookOpenIcon, UserGroupIcon, PhoneIcon, BellIcon, DocumentDuplicateIcon, ChartBarIcon, ClipboardDocumentListIcon } from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';

type TabId = 'directory' | 'orgChart' | 'officeDirectory' | 'tasks' | 'transactions' | 'statistics';

interface TabsProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
    const { hasPermission } = useAuth();
    
    const allTabs = [
        { id: 'statistics', name: 'الإحصائيات', icon: ChartBarIcon },
        { id: 'directory', name: 'الموظفين', icon: BookOpenIcon },
        { id: 'officeDirectory', name: 'المكاتب', icon: PhoneIcon },
        { id: 'tasks', name: 'المهام والتذكيرات', icon: BellIcon },
        { id: 'transactions', name: 'إدارة المعاملات', icon: DocumentDuplicateIcon },
        { id: 'orgChart', name: 'الهيكل التنظيمي', icon: UserGroupIcon },
    ];
    
    const visibleTabs = allTabs.filter(tab => !(tab as any).requiredPermission || hasPermission((tab as any).requiredPermission));

    return (
        <div className="md:p-4">
            <nav className="flex flex-col space-y-2" aria-label="Tabs">
                {visibleTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabId)}
                        className={`
                            whitespace-nowrap py-3 px-4 rounded-lg font-semibold text-sm flex items-center gap-3 text-right
                            ${
                                activeTab === tab.id
                                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                            }
                            transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800
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