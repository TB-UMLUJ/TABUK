import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { HealthCenter, Employee } from '../types';
import { CloseIcon, BuildingOfficeIcon, SearchIcon } from '../icons/Icons';

interface AddEditHealthCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (center: Omit<HealthCenter, 'id' | 'manager'> & { id?: number }) => Promise<void>;
    centerToEdit: HealthCenter | null;
    employees: Employee[];
}

const AddEditHealthCenterModal: React.FC<AddEditHealthCenterModalProps> = ({ isOpen, onClose, onSave, centerToEdit, employees }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [name, setName] = useState('');
    const [managerId, setManagerId] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [managerSearch, setManagerSearch] = useState('');
    const isEditMode = !!centerToEdit;
    
    useEffect(() => {
        if (isOpen) {
            if (centerToEdit) {
                setName(centerToEdit.name);
                setManagerId(centerToEdit.manager_employee_id?.toString() || '');
            } else {
                setName('');
                setManagerId('');
            }
            setManagerSearch('');
        }
    }, [isOpen, centerToEdit]);

    const handleClose = () => {
        if (isSaving) return;
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);
        try {
            await onSave({
                id: centerToEdit?.id,
                name,
                manager_employee_id: managerId ? parseInt(managerId, 10) : null,
            });
        } catch (error) {
            // Error handled by parent, modal stays open for correction
        } finally {
            setIsSaving(false);
        }
    };
    
    const filteredEmployees = useMemo(() => 
        employees.filter(e => e.full_name_ar.toLowerCase().includes(managerSearch.toLowerCase())),
    [employees, managerSearch]);

    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[60] flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`} onClick={handleClose} />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
                <div className="p-6">
                    <button onClick={handleClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg text-primary dark:text-primary-light">
                            <BuildingOfficeIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{isEditMode ? 'تعديل مركز صحي' : 'إضافة مركز صحي جديد'}</h2>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="center-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المركز<span className="text-danger mr-1">*</span></label>
                            <input id="center-name" value={name} onChange={(e) => setName(e.target.value)} required className="input-style" />
                        </div>
                        <div>
                            <label htmlFor="manager-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مدير المركز (اختياري)</label>
                            <div className="relative mb-2">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="ابحث عن موظف..."
                                    value={managerSearch}
                                    onChange={(e) => setManagerSearch(e.target.value)}
                                    className="w-full input-style pr-10"
                                />
                            </div>
                            <select id="manager-id" value={managerId} onChange={(e) => setManagerId(e.target.value)} className="input-style">
                                <option value="">-- لا يوجد مدير --</option>
                                {filteredEmployees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.full_name_ar}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-8 flex justify-end gap-3 pt-4">
                            <button type="button" onClick={handleClose} className="btn btn-secondary">إلغاء</button>
                            <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
             <style>{`
                .input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; border-radius: 0.5rem; padding: 0.75rem 1rem; width: 100%; outline: none; color: #111827; }
                .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
                .input-style:focus { --tw-ring-color: #008755; box-shadow: 0 0 0 2px var(--tw-ring-color); }
            `}</style>
        </div>,
        document.getElementById('modal-root')!
    );
};

export default AddEditHealthCenterModal;
