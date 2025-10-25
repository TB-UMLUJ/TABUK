import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Transaction, Attachment, TransactionType, TransactionPlatform, TransactionStatus } from '../types';
import { CloseIcon, DocumentDuplicateIcon } from '../icons/Icons';
import { useToast } from '../contexts/ToastContext';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id'> & { id?: number }) => void;
    transactionToEdit: Transaction | null;
}

const initialTransactionState: Omit<Transaction, 'id'> = {
    transactionNumber: '',
    subject: '',
    type: 'incoming',
    platform: 'Bain',
    status: 'new',
    date: new Date().toISOString().split('T')[0], // Default to today
    description: '',
    attachment: undefined,
};

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSave, transactionToEdit }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [transactionData, setTransactionData] = useState(initialTransactionState);
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (transactionToEdit) {
                setTransactionData({ ...initialTransactionState, ...transactionToEdit });
            } else {
                setTransactionData(initialTransactionState);
            }
        }
    }, [transactionToEdit, isOpen]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTransactionData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                addToast("حجم الملف كبير جداً. الحجم الأقصى هو 5 ميجابايت.", 'error');
                e.target.value = ''; // Reset file input
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const newAttachment: Attachment = {
                    name: file.name,
                    type: file.type,
                    data: base64String.split(',')[1], // Remove the "data:..." part
                };
                setTransactionData(prev => ({ ...prev, attachment: newAttachment }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removeAttachment = () => {
        setTransactionData(prev => ({...prev, attachment: undefined}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave: Omit<Transaction, 'id'> & { id?: number } = {
            ...transactionData,
            id: transactionToEdit?.id,
        };
        onSave(dataToSave);
    };

    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const isEditMode = !!transactionToEdit;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div
                className={`fixed inset-0 bg-black ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
                <div className="p-6 md:p-8">
                    <button onClick={handleClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-800 transition-all duration-300 z-10 p-2 bg-gray-100/50 rounded-full dark:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200/80 transform hover:rotate-90">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary-light p-3 rounded-lg text-primary dark:bg-primary/20 dark:text-primary-light">
                            <DocumentDuplicateIcon className="w-8 h-8"/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-primary dark:text-white">{isEditMode ? 'تعديل معاملة' : 'إضافة معاملة جديدة'}</h2>
                            <p className="text-gray-500 dark:text-gray-400">املأ الحقول المطلوبة لتسجيل المعاملة.</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="transactionNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم المعاملة<span className="text-danger mr-1">*</span></label>
                                <input id="transactionNumber" name="transactionNumber" type="text" required value={transactionData.transactionNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                            </div>
                             <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التاريخ<span className="text-danger mr-1">*</span></label>
                                <input id="date" name="date" type="date" required value={transactionData.date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الموضوع<span className="text-danger mr-1">*</span></label>
                            <input id="subject" name="subject" type="text" required value={transactionData.subject} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع المعاملة</label>
                                <select id="type" name="type" value={transactionData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="incoming">واردة</option>
                                    <option value="outgoing">صادرة</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المنصة</label>
                                <select id="platform" name="platform" value={transactionData.platform} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="Bain">نظام بين للمراسلات</option>
                                    <option value="MinisterEmail">البريد الوزاري للمدير</option>
                                    <option value="HospitalEmail">البريد الوزاري لادارة المستشفى</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
                                <select id="status" name="status" value={transactionData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="new">جديدة</option>
                                    <option value="inProgress">قيد الإجراء</option>
                                    <option value="followedUp">تمت المتابعة</option>
                                    <option value="completed">منجزة</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات (اختياري)</label>
                            <textarea id="description" name="description" rows={3} value={transactionData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المرفقات (اختياري)</label>
                            {transactionData.attachment ? (
                                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{transactionData.attachment.name}</span>
                                    <button type="button" onClick={removeAttachment} className="text-danger font-bold text-sm hover:underline">إزالة</button>
                                </div>
                            ) : (
                                <input type="file" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:file:bg-primary/20 dark:file:text-primary-light dark:hover:file:bg-primary/30"/>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:-translate-y-0.5 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                                إلغاء
                            </button>
                            <button type="submit" className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark transition-all duration-200 transform hover:-translate-y-0.5">
                                {isEditMode ? 'حفظ التغييرات' : 'إضافة المعاملة'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default AddTransactionModal;
