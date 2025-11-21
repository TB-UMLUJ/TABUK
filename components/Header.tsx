
import React from 'react';
import { AdjustmentsVerticalIcon, FireIcon } from '../icons/Icons';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
    onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
    const { logos, toggleCrisisMode } = useTheme();
    const { hasPermission } = useAuth();
    
    // Only admin or specific roles should ideally access crisis mode
    const canAccessCrisisMode = hasPermission('manage_users') || hasPermission('manage_health_centers');

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
            <div className="container mx-auto px-3 py-2.5 md:px-6 flex justify-between items-center">
                <div>
                    <img src={logos.headerLogoUrl} alt="Logo" className="h-8 sm:h-9 w-auto"/>
                </div>
                <div className="flex items-center gap-2">
                    {canAccessCrisisMode && (
                        <button
                            onClick={toggleCrisisMode}
                            className="header-icon-btn text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 animate-pulse"
                            title="وضع الطوارئ"
                            aria-label="تفعيل وضع الطوارئ"
                        >
                            <FireIcon className="w-6 h-6" />
                        </button>
                    )}
                    <ThemeToggle />
                    <button
                        onClick={onOpenSettings}
                        className="header-icon-btn"
                        title="الإعدادات"
                        aria-label="الإعدادات"
                    >
                        <AdjustmentsVerticalIcon />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
