import React from 'react';
import { ArrowRightOnRectangleIcon, InformationCircleIcon } from '../icons/Icons';
import ThemeToggle from './ThemeToggle';
import { tabukHealthClusterLogo } from './Logo';

interface HeaderProps {
    onLogout: () => void;
    onOpenAbout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, onOpenAbout }) => {
    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
            <div className="container mx-auto px-4 py-4 md:px-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img src={tabukHealthClusterLogo} alt="Logo" className="h-12 w-auto"/>
                    <div>
                        <h1 className="text-lg md:text-2xl font-bold text-primary dark:text-white">تجمع تبوك الصحي</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <ThemeToggle />
                     <button
                        onClick={onOpenAbout}
                        className="p-2.5 rounded-lg text-gray-500 hover:bg-primary/10 hover:text-primary transition-all duration-200 transform hover:-translate-y-0.5 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        title="حول التطبيق"
                        aria-label="حول التطبيق"
                    >
                        <InformationCircleIcon className="h-6 w-6" />
                    </button>
                     <button
                        onClick={onLogout}
                        className="p-2.5 rounded-lg text-gray-500 hover:bg-primary/10 hover:text-primary transition-all duration-200 transform hover:-translate-y-0.5 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        title="تسجيل الخروج"
                        aria-label="تسجيل الخروج"
                    >
                        <ArrowRightOnRectangleIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;