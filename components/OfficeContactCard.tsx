

import React from 'react';
import { OfficeContact } from '../types';
import { PhoneIcon, BuildingOfficeIcon, PencilIcon } from '../icons/Icons';

interface OfficeContactCardProps {
    contact: OfficeContact;
    onEdit: () => void;
}

const OfficeContactCard: React.FC<OfficeContactCardProps> = ({ contact, onEdit }) => {
    const handleCall = () => {
        window.location.href = `tel:${contact.extension}`;
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="p-3 bg-accent-light rounded-lg flex-shrink-0 dark:bg-gray-700">
                <BuildingOfficeIcon className="w-6 h-6 text-accent-dark dark:text-accent-light" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-md text-gray-800 truncate dark:text-white">{contact.name}</h3>
                {contact.location && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{contact.location}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                 <button
                    onClick={onEdit}
                    className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-110"
                    title="تعديل"
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={handleCall}
                    className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-all duration-200 transform hover:-translate-y-0.5"
                    title={`اتصال بالرقم ${contact.extension}`}
                >
                    <PhoneIcon className="w-5 h-5" />
                    <span>{contact.extension}</span>
                </button>
            </div>
        </div>
    );
};

export default OfficeContactCard;