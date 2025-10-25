
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { OfficeContact } from './types';
import { CloseIcon, PencilIcon } from './icons/Icons';

interface EditOfficeContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: OfficeContact) => void;
    contactToEdit: OfficeContact | null;
}

const EditOfficeContactModal: React.FC<EditOfficeContactModalProps> = ({ isOpen, onClose, onSave, contactToEdit }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [contactData, setContactData] = useState<OfficeContact | null>(null);

    useEffect(() => {
        // This effect correctly handles both setting the data when a contact is provided
        // for editing, and resetting the state to null when the modal is closed (when contactToEdit becomes null).
        // This prevents stale data from persisting between edits.
        if (contactToEdit) {
            setContactData({ ...contactToEdit });
        } else {
            setContactData(null);
        }
    }, [contactToEdit]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (contactData) {
            setContactData({ ...contactData, [name]: value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (contactData) {
            onSave(contactData);
        }
    };

    // If the modal isn't supposed to be open, don't render anything.
    if (!isOpen) {
        return null;
    }

    // This guard prevents rendering the form with stale data or crashing if data is null.
    // On the first render after opening, `contactData` will be null, so we render nothing.
    // The `useEffect` then runs, sets the state, and triggers a re-render with the correct data.
    if (!contactData) {
        return null;
    }

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div
                className={`fixed inset-0 bg-black ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
                <div className="p-6 md:p-8">
                    <button onClick={handleClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-800 transition-all duration-300 z-10 p-2 bg-gray-100/50 rounded-full dark:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200/80 transform hover:rotate-90">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary-light p-3 rounded-lg text-primary dark:bg-primary/20 dark:text-primary-light">
                            <PencilIcon className="w-8 h-8"/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-primary dark:text-white">تعديل بيانات المكتب</h2>
                            <p className="text-gray-500 dark:text-gray-400">قم بتحديث البيانات المطلوبة.</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المكتب</label>
                                <input id="name" name="name" type="text" required value={contactData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                            </div>
                            <div>
                                <label htmlFor="extension" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم التحويلة</label>
                                <input id="extension" name="extension" type="text" required value={contactData.extension} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الموقع</label>
                                <input id="location" name="location" type="text" value={contactData.location || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:-translate-y-0.5 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                                إلغاء
                            </button>
                            <button type="submit" className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark transition-all duration-200 transform hover:-translate-y-0.5">
                                حفظ التغييرات
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default EditOfficeContactModal;
