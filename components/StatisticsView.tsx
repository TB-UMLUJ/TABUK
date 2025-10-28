import React, { useState, useMemo } from 'react';
import { Employee } from '../types';
import { UserGroupIcon } from '../icons/Icons';

interface StatisticsViewProps {
    employees: Employee[];
}

type GroupByOption = 'job_title' | 'nationality' | 'center';

const StatisticsView: React.FC<StatisticsViewProps> = ({ employees }) => {
    const [groupBy, setGroupBy] = useState<GroupByOption>('job_title');

    const groupedData = useMemo(() => {
        const counts = new Map<string, number>();
        employees.forEach(employee => {
            const key = employee[groupBy] || 'غير محدد';
            counts.set(key, (counts.get(key) || 0) + 1);
        });
        return Array.from(counts.entries())
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => b.count - a.count);
    }, [employees, groupBy]);

    const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center gap-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="bg-primary-light p-4 rounded-full dark:bg-primary/20">{icon}</div>
            <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
                <p className="text-gray-500 font-medium dark:text-gray-400">{title}</p>
            </div>
        </div>
    );

    return (
        <div className="mt-6 animate-fade-in space-y-6">
            <StatCard title="إجمالي الموظفين" value={employees.length} icon={<UserGroupIcon className="w-8 h-8 text-primary dark:text-primary-light"/>} />

            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">إحصائيات الموظفين</h3>
                    <div>
                        <label htmlFor="groupBy" className="sr-only">فرز حسب</label>
                        <select
                            id="groupBy"
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
                            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="job_title">المسمى الوظيفي</option>
                            <option value="nationality">الجنسية</option>
                            <option value="center">المركز</option>
                        </select>
                    </div>
                </div>
            </div>

            {groupedData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
                    {groupedData.map(({ label, count }) => (
                        <div key={label} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center dark:bg-gray-800 dark:border-gray-700">
                            <p className="font-semibold text-gray-700 dark:text-gray-300 truncate" title={label}>{label}</p>
                            <p className="font-bold text-lg text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 rounded-full px-3 py-1">{count}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">لا توجد بيانات لعرضها.</p>
                </div>
            )}
        </div>
    );
};

export default StatisticsView;