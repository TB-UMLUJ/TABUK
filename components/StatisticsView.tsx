import React, { useMemo } from 'react';
import { Employee, Transaction, TransactionStatus } from '../types';
import { InformationCircleIcon } from '../icons/Icons';

interface StatisticsViewProps {
    employees: Employee[];
    transactions: Transaction[];
}

const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#AF19FF'];
const STROKE_WIDTH = 20;
const RADIUS = 80;
const NORMALIZED_RADIUS = RADIUS - STROKE_WIDTH / 2;
const CIRCUMFERENCE = NORMALIZED_RADIUS * 2 * Math.PI;

const groupAndAggregate = (data: any[], key: string, limit: number) => {
    const counts = new Map<string, number>();
    data.forEach(item => {
        const value = item[key] || 'غير محدد';
        counts.set(value, (counts.get(value) || 0) + 1);
    });

    const sorted = Array.from(counts.entries())
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);

    if (sorted.length > limit) {
        const othersValue = sorted.slice(limit - 1).reduce((acc, curr) => acc + curr.value, 0);
        return [...sorted.slice(0, limit - 1), { label: 'أخرى', value: othersValue }];
    }
    return sorted;
};

const DonutChartCard: React.FC<{ title: string, data: {label: string, value: number}[] }> = ({ title, data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return null;

    let strokeDashoffset = 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    {title}
                    <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                </h3>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-48 h-48 flex-shrink-0">
                    <svg height="100%" width="100%" viewBox="0 0 200 200">
                         <circle
                            stroke="#E0E0E0"
                            fill="transparent"
                            strokeWidth={STROKE_WIDTH}
                            r={NORMALIZED_RADIUS}
                            cx={RADIUS + 10}
                            cy={RADIUS + 10}
                         />
                         {data.map((entry, index) => {
                            const strokeDasharray = `${(entry.value / total) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
                            const segment = (
                                <circle
                                    key={entry.label}
                                    stroke={COLORS[index % COLORS.length]}
                                    fill="transparent"
                                    strokeWidth={STROKE_WIDTH}
                                    strokeDasharray={strokeDasharray}
                                    style={{ strokeDashoffset }}
                                    strokeLinecap="round"
                                    r={NORMALIZED_RADIUS}
                                    cx={RADIUS + 10}
                                    cy={RADIUS + 10}
                                    transform={`rotate(-90 ${RADIUS + 10} ${RADIUS + 10})`}
                                />
                            );
                            strokeDashoffset -= (entry.value / total) * CIRCUMFERENCE;
                            return segment;
                         })}
                    </svg>
                </div>
                <div className="w-full">
                    <ul className="space-y-2">
                        {data.map((entry, index) => (
                            <li key={entry.label} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}/>
                                    <span className="text-gray-600 dark:text-gray-300 font-medium">{entry.label}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold text-gray-800 dark:text-white">{entry.value}</span>
                                    <span className="text-gray-500 dark:text-gray-400 w-8 text-right">{((entry.value / total) * 100).toFixed(0)}%</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const SegmentedBarCard: React.FC<{ title: string; data: { status: TransactionStatus; count: number }[] }> = ({ title, data }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    if (total === 0) return null;

    const statusMap: Record<TransactionStatus, { text: string; color: string }> = {
        new: { text: 'جديدة', color: '#0088FE' }, // Blue
        inProgress: { text: 'قيد الإجراء', color: '#FFBB28' }, // Yellow
        followedUp: { text: 'متابعة', color: '#AF19FF' }, // Purple
        completed: { text: 'منجزة', color: '#00C49F' } // Green
    };

    const overallPercentage = data.reduce((sum, item) => item.status === 'completed' ? sum + item.count : sum, 0) / total * 100;

    return (
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    {title}
                    <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                </h3>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
                 <p className="text-3xl font-bold text-gray-800 dark:text-white">{overallPercentage.toFixed(0)}%</p>
                 <p className="text-sm font-semibold text-green-500">منتهية</p>
            </div>

            <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-4">
                {data.map(({ status, count }) => (
                    <div
                        key={status}
                        className="h-full"
                        style={{ width: `${(count / total) * 100}%`, backgroundColor: statusMap[status].color }}
                        title={`${statusMap[status].text}: ${count}`}
                    />
                ))}
            </div>

             <div className="flex flex-col gap-2 text-sm">
                 {data.map(({ status, count }) => (
                    <div key={status} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: statusMap[status].color}}/>
                             <span className="text-gray-600 dark:text-gray-300">{statusMap[status].text}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-gray-800 dark:text-white">{count}</span>
                             <span className="text-green-500 font-semibold w-10 text-right">{((count / total) * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StatisticsView: React.FC<StatisticsViewProps> = ({ employees, transactions }) => {
    
    const employeesByDepartment = useMemo(() => groupAndAggregate(employees, 'department', 5), [employees]);
    const employeesByJobTitle = useMemo(() => groupAndAggregate(employees, 'job_title', 5), [employees]);

    const transactionsByStatus = useMemo(() => {
        const counts = new Map<TransactionStatus, number>();
        transactions.forEach(t => {
            counts.set(t.status, (counts.get(t.status) || 0) + 1);
        });
        const order: TransactionStatus[] = ['new', 'inProgress', 'followedUp', 'completed'];
        return order.map(status => ({ status, count: counts.get(status) || 0 })).filter(item => item.count > 0);
    }, [transactions]);

    return (
        <div className="mt-6 animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24 md:pb-6">
            <DonutChartCard title="توزيع الموظفين حسب القطاع" data={employeesByDepartment} />
            <DonutChartCard title="توزيع الموظفين حسب المسمى الوظيفي" data={employeesByJobTitle} />
            <div className="lg:col-span-2">
                 <SegmentedBarCard title="حالة المعاملات" data={transactionsByStatus} />
            </div>
        </div>
    );
};

export default StatisticsView;