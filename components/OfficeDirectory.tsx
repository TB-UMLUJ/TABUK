

import React, { useState, useMemo, useRef } from 'react';
import { OfficeContact } from '../types';
import OfficeContactCard from './OfficeContactCard';
import { SearchIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, PlusIcon } from '../icons/Icons';

interface OfficeDirectoryProps {
    contacts: OfficeContact[];
    onEditContact: (contact: OfficeContact) => void;
    onAddContact: () => void;
    onImport: (file: File) => void;
    onExport: () => void;
}

const OfficeDirectory: React.FC<OfficeDirectoryProps> = ({ contacts, onEditContact, onAddContact, onImport, onExport }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) onImport(file);
        if (event.target) event.target.value = '';
    };

    const filteredContacts = useMemo(() => {
        if (!searchTerm) {
            return contacts.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        }
        return contacts.filter(contact =>
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.extension.includes(searchTerm)
        ).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    }, [contacts, searchTerm]);

    return (
        <div className="mt-6 animate-fade-in relative pb-24">
            <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full flex-grow">
                        <input
                            type="text"
                            placeholder="ابحث باسم المكتب أو التحويلة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                    </div>
                     <div className="flex items-center gap-2 w-full md:w-auto">
                        <button 
                            onClick={onAddContact} 
                            className="p-2.5 rounded-lg flex-1 md:flex-none hidden md:flex items-center justify-center transition-all duration-200 font-semibold bg-primary text-white hover:bg-primary-dark transform hover:-translate-y-0.5"
                            title="إضافة تحويلة جديدة"
                        >
                            <PlusIcon className="h-5 w-5 ml-2" /> إضافة
                        </button>
                        <button onClick={handleImportClick} className="p-2.5 rounded-lg flex-1 md:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 transform hover:-translate-y-0.5">
                            <ArrowUpTrayIcon className="h-5 w-5 ml-2" /> استيراد
                        </button>
                        <button onClick={onExport} className="p-2.5 rounded-lg flex-1 md:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-accent/10 text-accent-dark hover:bg-accent/20 dark:bg-accent/20 dark:text-accent-light dark:hover:bg-accent/30 transform hover:-translate-y-0.5">
                            <ArrowDownTrayIcon className="h-5 w-5 ml-2" /> تصدير
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls" />
                    </div>
                </div>
            </div>

            {filteredContacts.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredContacts.map(contact => (
                        <OfficeContactCard 
                            key={contact.id} 
                            contact={contact} 
                            onEdit={() => onEditContact(contact)}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-8">لا توجد نتائج مطابقة لبحثك.</p>
            )}
            
        </div>
    );
};

export default OfficeDirectory;