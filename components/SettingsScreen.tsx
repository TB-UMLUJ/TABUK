
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon, ChevronLeftIcon, ArrowRightOnRectangleIcon } from '../icons/Icons';
import ThemeToggle from './ThemeToggle';
import AboutModal from './AboutModal';

interface SettingsScreenProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ isOpen, onClose, onLogout }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsClosing(false);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    if (!isOpen && !isClosing) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div 
            className={`fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 ${isOpen ? 'animate-slide-in-left' : 'animate-slide-out-left'}`}
            role="dialog"
            aria-modal="true"
        >
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
                <div className="container mx-auto px-4 py-3 md:px-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-primary dark:text-white">الإعدادات</h2>
                    <button
                        onClick={handleClose}
                        className="p-2.5 rounded-lg text-gray-500 hover:bg-primary/10 hover:text-primary transition-all duration-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        aria-label="إغلاق"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
            </header>

            {/* Settings List */}
            <main className="container mx-auto p-4 md:p-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Dark Mode Toggle */}
                        <li className="p-4 flex justify-between items-center">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">الوضع الداكن</span>
                            <ThemeToggle />
                        </li>
                        
                        {/* About App */}
                        <li className="p-2">
                            <button onClick={() => setShowAboutModal(true)} className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">حول التطبيق</span>
                                <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
                            </button>
                        </li>

                         {/* Logout */}
                        <li className="p-2">
                            <button onClick={onLogout} className="w-full flex justify-between items-center p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors">
                                <span className="font-semibold">تسجيل الخروج</span>
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            </button>
                        </li>
                    </ul>
                </div>
            </main>

            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
        </div>,
        modalRoot
    );
};

export default SettingsScreen;
