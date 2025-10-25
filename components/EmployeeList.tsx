
import React from 'react';
import { Employee } from '../types';
import EmployeeCard from './EmployeeCard';

interface EmployeeListProps {
    employees: Employee[];
    onSelectEmployee: (employee: Employee) => void;
    favorites: number[];
    onToggleFavorite: (employeeId: number) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onSelectEmployee, favorites, onToggleFavorite }) => {
    if (employees.length === 0) {
        return <p className="text-center text-gray-500 mt-8">لا توجد نتائج مطابقة لبحثك.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employees.map(employee => (
                <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onSelect={() => onSelectEmployee(employee)}
                    isFavorite={favorites.includes(employee.id)}
                    onToggleFavorite={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(employee.id);
                    }}
                />
            ))}
        </div>
    );
};

export default EmployeeList;
