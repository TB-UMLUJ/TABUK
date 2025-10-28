import React from 'react';
import { Task } from '../types';
import { PencilIcon, TrashIcon, CalendarDaysIcon, CheckIcon } from '../icons/Icons';

interface TaskCardProps {
    task: Task;
    onToggleComplete: () => void;
    onEdit: () => void;
    onDelete: () => void;
    allowDeletion: boolean;
    allowEditing: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onEdit, onDelete, allowDeletion, allowEditing }) => {
    
    const formattedDate = task.due_date 
        ? new Date(task.due_date + 'T00:00:00.000Z').toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    return (
        <div className={`bg-white rounded-xl shadow-md p-4 flex items-start gap-4 transition-all duration-300 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${task.is_completed ? 'opacity-60' : ''}`}>
            <button
                onClick={onToggleComplete}
                className={`w-7 h-7 flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                    task.is_completed
                        ? 'bg-primary border-primary text-white'
                        : 'bg-gray-100 border-gray-300 text-transparent hover:border-primary dark:bg-gray-700 dark:border-gray-500 dark:hover:border-primary-light'
                }`}
                aria-label={task.is_completed ? "إلغاء إكمال المهمة" : "إكمال المهمة"}
            >
                <CheckIcon className="w-5 h-5" />
            </button>

            <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-md text-gray-800 dark:text-white ${task.is_completed ? 'line-through' : ''}`}>{task.title}</h3>
                {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>}
                
                {formattedDate && (
                    <div className="flex items-center gap-1.5 text-xs text-accent-dark dark:text-accent-light font-semibold mt-2">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{formattedDate}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-1 flex-shrink-0">
                {allowEditing && (
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                        title="تعديل المهمة"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                )}
                {allowDeletion && (
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg text-gray-400 hover:bg-danger/10 hover:text-danger dark:hover:bg-danger/20 dark:hover:text-red-400 transition-colors"
                        title="حذف المهمة"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default TaskCard;