
import React, { useState, useMemo, useRef } from 'react';
import { Task } from '../types';
import TaskCard from './TaskCard';
import { ArrowUpTrayIcon, ArrowDownTrayIcon, SearchIcon, PlusIcon } from '../icons/Icons';

interface TasksViewProps {
    tasks: Task[];
    onAddTask: () => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (task: Task) => void;
    onToggleComplete: (taskId: number) => void;
    onImportClick: () => void;
    onExportClick: () => void;
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, onAddTask, onEditTask, onDeleteTask, onToggleComplete, onImportClick, onExportClick }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const { upcomingTasks, completedTasks } = useMemo(() => {
        const filtered = tasks.filter(task => 
            !searchTerm || 
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        const upcoming = filtered.filter(t => !t.is_completed).sort((a, b) => (a.due_date || 'z').localeCompare(b.due_date || 'z'));
        const completed = filtered.filter(t => t.is_completed).sort((a, b) => (b.due_date || 'a').localeCompare(a.due_date || 'a'));
        return { upcomingTasks: upcoming, completedTasks: completed };
    }, [tasks, searchTerm]);

    const TaskList: React.FC<{taskList: Task[]}> = ({taskList}) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taskList.map(task => (
                <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={() => onToggleComplete(task.id)}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task)}
                />
            ))}
        </div>
    );

    return (
        <div className="mt-6 animate-fade-in relative pb-24">
            <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <button 
                        onClick={onAddTask} 
                        className="p-2.5 rounded-lg w-full sm:w-auto flex items-center justify-center transition-all duration-200 font-semibold bg-primary text-white hover:bg-primary-dark transform hover:-translate-y-0.5"
                        title="إضافة مهمة جديدة"
                    >
                        <PlusIcon className="h-5 w-5 ml-2" /> إضافة
                    </button>
                    <div className="relative w-full flex-grow">
                        <input
                            type="text"
                            placeholder="ابحث في عنوان المهمة أو وصفها..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button onClick={onImportClick} className="p-2.5 rounded-lg flex-1 sm:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 transform hover:-translate-y-0.5">
                            <ArrowUpTrayIcon className="h-5 w-5 ml-2" /> <span className="hidden sm:inline">استيراد</span>
                        </button>
                        <button onClick={onExportClick} className="p-2.5 rounded-lg flex-1 sm:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-accent/10 text-accent-dark hover:bg-accent/20 dark:bg-accent/20 dark:text-accent-light dark:hover:bg-accent/30 transform hover:-translate-y-0.5">
                            <ArrowDownTrayIcon className="h-5 w-5 ml-2" /> <span className="hidden sm:inline">تصدير</span>
                        </button>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">المهام القادمة ({upcomingTasks.length})</h2>

            {upcomingTasks.length > 0 ? (
                <TaskList taskList={upcomingTasks} />
            ) : (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">{searchTerm ? 'لا توجد مهام تطابق بحثك.' : 'لا توجد مهام قادمة. أحسنت!'}</p>
                </div>
            )}

            {completedTasks.length > 0 && (
                <>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mt-8 mb-4">المهام المكتملة ({completedTasks.length})</h2>
                    <TaskList taskList={completedTasks} />
                </>
            )}

        </div>
    );
};

export default TasksView;
