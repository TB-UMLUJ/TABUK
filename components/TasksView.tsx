
import React, { useMemo } from 'react';
import { Task } from '../types';
import TaskCard from './TaskCard';
import { PlusIcon } from '../icons/Icons';

interface TasksViewProps {
    tasks: Task[];
    onAddTask: () => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (task: Task) => void;
    onToggleComplete: (taskId: number) => void;
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, onAddTask, onEditTask, onDeleteTask, onToggleComplete }) => {
    const { upcomingTasks, completedTasks } = useMemo(() => {
        const upcoming = tasks.filter(t => !t.is_completed).sort((a, b) => (a.due_date || 'z').localeCompare(b.due_date || 'z'));
        const completed = tasks.filter(t => t.is_completed).sort((a, b) => (b.due_date || 'a').localeCompare(a.due_date || 'a'));
        return { upcomingTasks: upcoming, completedTasks: completed };
    }, [tasks]);

    const TaskList: React.FC<{taskList: Task[]}> = ({taskList}) => (
        <div className="space-y-3">
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
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">المهام القادمة ({upcomingTasks.length})</h2>
            {upcomingTasks.length > 0 ? (
                <TaskList taskList={upcomingTasks} />
            ) : (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">لا توجد مهام قادمة. أحسنت!</p>
                </div>
            )}

            {completedTasks.length > 0 && (
                <>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mt-8 mb-4">المهام المكتملة ({completedTasks.length})</h2>
                    <TaskList taskList={completedTasks} />
                </>
            )}

             <button
                onClick={onAddTask}
                className="fixed bottom-28 md:bottom-10 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform duration-300 z-40"
                aria-label="إضافة مهمة جديدة"
            >
                <PlusIcon className="w-8 h-8" />
            </button>
        </div>
    );
};

export default TasksView;
