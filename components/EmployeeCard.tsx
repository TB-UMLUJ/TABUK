
import React from 'react';
import { Employee } from '../types';
import { StarIcon, BuildingOfficeIcon, MapPinIcon } from '../icons/Icons';

interface EmployeeCardProps {
    employee: Employee;
    onSelect: () => void;
    isFavorite: boolean;
    onToggleFavorite: (e: React.MouseEvent) => void;
}

const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
};

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onSelect, isFavorite, onToggleFavorite }) => {

    return (
        <div 
            onClick={onSelect} 
            className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group dark:bg-gray-800"
        >
             <button
                onClick={onToggleFavorite}
                className="absolute top-3 left-3 p-1.5 rounded-full bg-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 transform hover:scale-125 dark:bg-gray-700/50"
                aria-label="Toggle Favorite"
            >
                <StarIcon className={`w-6 h-6 transition-colors ${isFavorite ? 'text-favorite fill-current' : 'text-gray-300 hover:text-favorite dark:text-gray-500 dark:hover:text-favorite'}`} />
            </button>
            <div className="w-20 h-20 rounded-full bg-primary-light flex-shrink-0 flex items-center justify-center border-4 border-gray-100 dark:border-gray-700 dark:bg-gray-700">
                <span className="text-2xl font-bold text-primary dark:text-primary-light">{getInitials(employee.fullNameAr)}</span>
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate" title={employee.fullNameAr}>{employee.fullNameAr}</h3>
                <p className="text-sm text-primary font-semibold dark:text-primary-light truncate" title={employee.jobTitle}>{employee.jobTitle}</p>
                <div className="text-xs text-gray-500 mt-2 flex flex-col items-start gap-1 dark:text-gray-400">
                     <span className="flex items-center gap-1.5 w-full">
                         <BuildingOfficeIcon className="w-3.5 h-3.5 flex-shrink-0"/> 
                         <span className="truncate" title={employee.department}>{employee.department}</span>
                     </span>
                     {employee.center && (
                         <span className="flex items-center gap-1.5 w-full">
                            <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                            <span className="truncate" title={employee.center}>{employee.center}</span>
                         </span>
                     )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeCard;