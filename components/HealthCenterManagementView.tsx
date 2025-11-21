import React, { useState, useMemo } from 'react';
import { HealthCenter, Employee } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
    ArrowBackIcon,
    PlusIcon,
    SearchIcon,
    BuildingOfficeIcon,
    UserIcon,
    PencilIcon,
    TrashIcon
} from '../icons/Icons';
import AddEditHealthCenterModal from './AddEditHealthCenterModal';

interface HealthCenterManagementViewProps {
    onBack: () => void;
    centers: HealthCenter[];
    employees: Employee[];
    onSave: (center: Omit<HealthCenter, 'id' | 'manager'> & { id?: number }) => Promise<void>;
    onDelete: (center: HealthCenter) => Promise<void>;
}

const HealthCenterManagementView: React.FC<HealthCenterManagementViewProps> = ({ onBack, centers, employees, onSave, onDelete }) => {
    const { hasPermission } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [centerToEdit, setCenterToEdit] = useState<HealthCenter | null>(null);

    const filteredCenters = useMemo(() => {
        if (!searchTerm) return centers;
        const lowercasedTerm = searchTerm.toLowerCase();
        return centers.filter(center => 
            center.name.toLowerCase().includes(lowercasedTerm) ||
            (center.manager && center.manager.full_name_ar.toLowerCase().includes(lowercasedTerm))
        );
    }, [centers, searchTerm]);

    const handleAdd = () => {
        setCenterToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (center: HealthCenter) => {
        setCenterToEdit(center);
        setIsModalOpen(true);
    };

    return (
        <div className="mt-6 animate-fade-in pb-24 md:pb-6">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 min-w-0">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
                        <ArrowBackIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white truncate">إدارة المراكز الصحية</h1>
                </div>
                {hasPermission('manage_health_centers') && (
                    <button onClick={handleAdd} className="btn btn-primary btn-icon flex-shrink-0" title="إضافة مركز">
                        <PlusIcon className="w-6 h-6" />
                    </button>
                )}
            </header>
            
            <div className="relative mb-6">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن مركز أو مدير..."
                    className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
            </div>
            
            {filteredCenters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCenters.map(center => (
                        <div key={center.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <BuildingOfficeIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-gray-800 dark:text-white">{center.name}</p>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            <UserIcon className="w-4 h-4" />
                                            <span>{center.manager?.full_name_ar || 'غير محدد'}</span>
                                        </div>
                                    </div>
                                </div>
                                {hasPermission('manage_health_centers') && (
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button onClick={() => handleEdit(center)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => onDelete(center)} className="p-2 text-danger hover:bg-danger/10 rounded-md"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="font-semibold text-gray-600 dark:text-gray-300">لا توجد نتائج مطابقة</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">حاول البحث بكلمة أخرى أو أضف مركزاً جديداً.</p>
                </div>
            )}
            
            <AddEditHealthCenterModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={async (data) => {
                    await onSave(data);
                    setIsModalOpen(false);
                }}
                centerToEdit={centerToEdit}
                employees={employees}
            />
        </div>
    );
};

export default HealthCenterManagementView;