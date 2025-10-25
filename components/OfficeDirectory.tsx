

import React, { useState, useMemo } from 'react';
import { OfficeContact } from '../types';
import OfficeContactCard from './OfficeContactCard';
import { SearchIcon } from '../icons/Icons';

interface OfficeDirectoryProps {
    contacts: OfficeContact[];
    onEditContact: (contact: OfficeContact) => void;
}

const OfficeDirectory: React.FC<OfficeDirectoryProps> = ({ contacts, onEditContact }) => {
    const [searchTerm, setSearchTerm] = useState('');

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
        <div className="mt-6 animate-fade-in">
            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="ابحث باسم المكتب أو التحويلة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 shadow-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
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