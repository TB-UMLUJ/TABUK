import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ArrowRightIcon, ChevronLeftIcon, ArrowRightOnRectangleIcon, EyeIcon, EyeSlashIcon, TrashIcon, ShieldCheckIcon, PencilIcon } from '../icons/Icons';
import ThemeToggle from './ThemeToggle';
import AboutModal from './AboutModal';
import { useSettings } from '../contexts/SettingsContext';
import ToggleSwitch from './ToggleSwitch';

interface SettingsScreenProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ isOpen, onClose, onLogout }) => {
    const [isClosing, setIsClosing] = useState(false);
    const { showImportExport, toggleShowImportExport, allowDeletion, toggleAllowDeletion, allowEditing, toggleAllowEditing } = useSettings();
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
            className={`fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 ${isOpen ? 'animate-slide-in-right' : 'animate-slide-out-right'}`}
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
                        aria-label="العودة"
                    >
                        <ArrowRightIcon className="h-6 w-6" />
                    </button>
                </div>
            </header>

            {/* Settings List */}
            <main className="container mx-auto p-4 md:p-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Admin Settings Section */}
                        <li className="p-4">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">إعدادات المسؤول</h3>
                            <ul className="space-y-4">
                                <li className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        {showImportExport ? <EyeIcon className="w-6 h-6 text-primary" /> : <EyeSlashIcon className="w-6 h-6 text-gray-400" />}
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">إظهار أزرار الاستيراد والتصدير</span>
                                    </div>
                                    <ToggleSwitch checked={showImportExport} onChange={toggleShowImportExport} ariaLabel="Toggle Import/Export Visibility" />
                                </li>
                                <li className="flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        {allowDeletion ? <TrashIcon className="w-6 h-6 text-danger" /> : <ShieldCheckIcon className="w-6 h-6 text-gray-400" />}
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">السماح بحذف البيانات</span>
                                    </div>
                                    <ToggleSwitch checked={allowDeletion} onChange={toggleAllowDeletion} ariaLabel="Toggle Deletion" />
                                </li>
                                <li className="flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        {allowEditing ? <PencilIcon className="w-6 h-6 text-accent-dark" /> : <ShieldCheckIcon className="w-6 h-6 text-gray-400" />}
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">السماح بتعديل البيانات</span>
                                    </div>
                                    <ToggleSwitch checked={allowEditing} onChange={toggleAllowEditing} ariaLabel="Toggle Editing" />
                                </li>
                            </ul>
                        </li>
                        {/* Dark Mode Toggle */}
                        <li className="p-4 flex justify-between items-center pt-6">
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