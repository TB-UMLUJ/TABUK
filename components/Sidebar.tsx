
import React from 'react';
import { 
    BookOpenIcon, 
    UserGroupIcon, 
    PhoneIcon, 
    BellIcon, 
    DocumentDuplicateIcon, 
    ChartBarIcon, 
    AdjustmentsVerticalIcon,
    FireIcon,
    SunIcon,
    MoonIcon,
    ArrowRightOnRectangleIcon
} from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

type TabId = 'directory' | 'orgChart' | 'officeDirectory' | 'tasks' | 'transactions' | 'statistics';

interface SidebarProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
    onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
    const { hasPermission, currentUser, logout } = useAuth();
    const { logos, isCrisisMode, toggleCrisisMode, theme, toggleTheme } = useTheme();
    
    // Permission check for crisis mode
    const canAccessCrisisMode = hasPermission('manage_users') || hasPermission('manage_health_centers');

    const allTabs = [
        { id: 'statistics', name: 'لوحة الإحصائيات', icon: ChartBarIcon },
        { id: 'directory', name: 'دليل الموظفين', icon: BookOpenIcon },
        { id: 'officeDirectory', name: 'دليل المكاتب', icon: PhoneIcon },
        { id: 'tasks', name: 'المهام', icon: BellIcon },
        { id: 'transactions', name: 'المعاملات', icon: DocumentDuplicateIcon },
        { id: 'orgChart', name: 'الهيكل التنظيمي', icon: UserGroupIcon },
    ];
    
    const visibleTabs = allTabs.filter(tab => !(tab as any).requiredPermission || hasPermission((tab as any).requiredPermission));

    const getInitials = (name: string) => name ? name.charAt(0) : '';

    const ActionButton: React.FC<{ 
        icon: React.ElementType, 
        label: string, 
        onClick: () => void, 
        active?: boolean,
        danger?: boolean 
    }> = ({ icon: Icon, label, onClick, active, danger }) => (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm
                ${active 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                    : danger
                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'
                }
            `}
        >
            {/* Icon on the right (start) in RTL */}
            <Icon className={`w-5 h-5 ${active ? 'text-white animate-pulse' : ''}`} />
            <span className="flex-1 text-right">{label}</span>
        </button>
    );

    return (
        <aside className="hidden md:flex w-80 flex-col h-screen sticky top-0 p-4 z-40">
            {/* Main Floating Card Container */}
            <div className="flex-1 flex flex-col bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                
                {/* 1. Logo Area - Increased Size significantly */}
                <div className="p-8 pb-6 flex justify-center bg-white/50 dark:bg-gray-800/50">
                    <img 
                        src={logos.sidebarLogoUrl} 
                        alt="Logo" 
                        className="h-32 w-auto object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105" 
                    />
                </div>

                {/* 2. Navigation Links */}
                <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar space-y-1">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-4 mt-2">
                        القائمة الرئيسية
                    </p>
                    <nav className="space-y-1">
                        {visibleTabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabId)}
                                    className={`
                                        w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group
                                        ${isActive 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                                            : 'text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                        }
                                    `}
                                >
                                    <tab.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary dark:text-gray-500 dark:group-hover:text-primary-light'}`} />
                                    <span className={`font-bold text-sm ${isActive ? '' : 'font-medium'}`}>{tab.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* 3. Bottom Section: System Actions & Profile */}
                <div className="p-4 mt-auto space-y-4 bg-white/40 dark:bg-gray-900/40 border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md">
                    
                    {/* System Actions List (Full Buttons) */}
                    <div className="space-y-1">
                        {canAccessCrisisMode && (
                            <ActionButton 
                                icon={FireIcon} 
                                label="وضع الطوارئ" 
                                onClick={toggleCrisisMode} 
                                active={isCrisisMode}
                                danger={!isCrisisMode}
                            />
                        )}
                        
                        <ActionButton 
                            icon={theme === 'light' ? MoonIcon : SunIcon} 
                            label={theme === 'light' ? 'الوضع الداكن' : 'الوضع النهاري'} 
                            onClick={toggleTheme} 
                        />
                        
                        <ActionButton 
                            icon={AdjustmentsVerticalIcon} 
                            label="الإعدادات" 
                            onClick={onOpenSettings} 
                        />
                    </div>

                    {/* Separator */}
                    <div className="h-px bg-gray-200 dark:bg-gray-700 w-full opacity-50"></div>

                    {/* User Profile Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-600 flex items-center justify-between group hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
                                {getInitials(currentUser?.full_name || '')}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                                    {currentUser?.full_name}
                                </p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-medium">
                                    {currentUser?.role.role_name}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={logout}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            title="تسجيل الخروج"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
