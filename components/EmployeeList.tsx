
import React, { useRef, useCallback, useState } from 'react';
import { Employee } from '../types';
import EmployeeCard from './EmployeeCard';
import { UsersIcon, ChartPieIcon, CheckCircleIcon } from '../icons/Icons';
import SynergyRadarModal from './SynergyRadarModal';

interface EmployeeListProps {
    employees: Employee[];
    onSelectEmployee: (employee: Employee) => void;
    onLoadMore: () => void;
    hasMore: boolean;
    isLoadingMore: boolean;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onSelectEmployee, onLoadMore, hasMore, isLoadingMore }) => {
    const observer = useRef<IntersectionObserver | null>(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedForTeam, setSelectedForTeam] = useState<Set<number>>(new Set());
    const [showRadar, setShowRadar] = useState(false);

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                onLoadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoadingMore, hasMore, onLoadMore]);

    const toggleSelection = (employeeId: number) => {
        setSelectedForTeam(prev => {
            const newSet = new Set(prev);
            if (newSet.has(employeeId)) {
                newSet.delete(employeeId);
            } else {
                newSet.add(employeeId);
            }
            return newSet;
        });
    };

    const handleCardClick = (employee: Employee) => {
        if (isSelectionMode) {
            toggleSelection(employee.id);
        } else {
            onSelectEmployee(employee);
        }
    };
    
    const getSelectedEmployees = () => {
        return employees.filter(e => selectedForTeam.has(e.id));
    };

    return (
        <>
            {/* Selection Mode Header */}
            <div className="mb-4 flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode);
                            setSelectedForTeam(new Set());
                        }}
                        className={`btn btn-sm gap-2 ${isSelectionMode ? 'btn-secondary' : 'btn-muted'}`}
                    >
                        <UsersIcon className="w-4 h-4" />
                        {isSelectionMode ? 'إلغاء التحديد' : 'تكوين فريق'}
                    </button>
                    {isSelectionMode && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            تم اختيار: {selectedForTeam.size}
                        </span>
                    )}
                </div>

                {isSelectionMode && selectedForTeam.size > 0 && (
                    <button 
                        onClick={() => setShowRadar(true)}
                        className="btn btn-sm btn-primary gap-2 animate-fade-in"
                    >
                        <ChartPieIcon className="w-4 h-4" />
                        <span>تحليل التناغم</span>
                    </button>
                )}
            </div>

            {employees.length === 0 && !isLoadingMore ? (
                <p className="text-center text-gray-500 mt-8">لا توجد نتائج مطابقة لبحثك.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {employees.map(employee => (
                        <div key={employee.id} className="relative group">
                            <EmployeeCard
                                employee={employee}
                                onSelect={() => handleCardClick(employee)}
                            />
                            {isSelectionMode && (
                                <div 
                                    className={`absolute inset-0 z-10 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-start justify-end p-2
                                        ${selectedForTeam.has(employee.id) 
                                            ? 'border-primary bg-primary/10' 
                                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                                    onClick={() => toggleSelection(employee.id)}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedForTeam.has(employee.id) ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                                        {selectedForTeam.has(employee.id) && <CheckCircleIcon className="w-4 h-4 text-white" />}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            <div ref={lastElementRef} />

            {isLoadingMore && (
                <div className="flex justify-center items-center py-8">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
                    <p className="mr-4 text-lg font-semibold text-gray-600 dark:text-gray-400">جاري التحميل...</p>
                </div>
            )}

            <SynergyRadarModal 
                isOpen={showRadar} 
                onClose={() => setShowRadar(false)} 
                selectedEmployees={getSelectedEmployees()} 
            />
        </>
    );
};

export default EmployeeList;
