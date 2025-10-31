import React, { useMemo, useState } from 'react';
import { Employee, Transaction, TransactionStatus } from '../types';
import { 
    UserGroupIcon, 
    BuildingOfficeIcon, 
    ArrowPathIcon, 
    CheckCircleIcon,
    BellIcon,
    ExclamationTriangleIcon,
    StarIcon,
    ArrowTrendingUpIcon,
    WrenchScrewdriverIcon,
    DocumentArrowDownIcon,
    UsersIcon,
    ClockIcon,
    XCircleIcon,
    InformationCircleIcon
} from '../icons/Icons';
import { supabase } from '../lib/supabaseClient'; // To get office contacts count
import { useToast } from '../contexts/ToastContext';

declare const XLSX: any;


interface StatisticsViewProps {
    employees: Employee[];
    transactions: Transaction[];
    officeContacts: any[]; // Add officeContacts to props
}

// --- Helper Functions ---
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

// --- Sub-Components ---
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <div className="bg-primary-light p-4 rounded-full dark:bg-primary/20">{icon}</div>
        <div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
            <p className="text-gray-500 font-medium dark:text-gray-400">{title}</p>
        </div>
    </div>
);

const HighlightCard: React.FC<{ text: string; icon: React.ReactNode; colorClass: string }> = ({ text, icon, colorClass }) => (
    <div className={`p-4 rounded-xl flex items-center gap-3 ${colorClass}`}>
        <div className="flex-shrink-0">{icon}</div>
        <p className="font-semibold text-sm">{text}</p>
    </div>
);

const BarChartCard: React.FC<{ title: string, data: { label: string, value: number }[] }> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="font-bold text-lg text-gray-800 mb-4 dark:text-white">{title}</h3>
            {data.length > 0 ? (
                 <div className="space-y-3">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="w-28 text-xs text-gray-600 truncate text-right dark:text-gray-400" title={item.label}>{item.label}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-6 dark:bg-gray-700">
                                <div
                                    className="bg-primary h-6 rounded-full text-white text-xs flex items-center justify-end pr-2"
                                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                                >
                                    {item.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <p className="text-center text-gray-500 dark:text-gray-400 py-8">لا توجد بيانات لعرضها</p>
            )}
        </div>
    );
};


const DonutChartCard: React.FC<{ title: string, data: {label: string, value: number}[] }> = ({ title, data }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="font-bold text-lg text-gray-800 mb-4 dark:text-white">{title}</h3>
            {data.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                     <div className="w-full md:w-1/2">
                        <ul className="space-y-2">
                            {data.map((entry, index) => (
                                <li key={index} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}/>
                                        <span className="text-gray-600 dark:text-gray-300 font-medium truncate" title={entry.label}>{entry.label}</span>
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
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">لا توجد بيانات لعرضها</p>
            )}
        </div>
    );
};

const LineChartCard: React.FC<{ title: string, data: { label: string, value: number }[] }> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(item => item.value), 10); // Ensure a minimum height
    const points = data.map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - (item.value / maxValue) * 90; // Use 90% of height to avoid touching top
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="font-bold text-lg text-gray-800 mb-4 dark:text-white">{title}</h3>
            {data.length > 1 ? (
                 <div className="h-48 relative">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="lineChartGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#008755" stopOpacity="0.4"/>
                                <stop offset="100%" stopColor="#008755" stopOpacity="0"/>
                            </linearGradient>
                        </defs>
                        <polyline fill="url(#lineChartGradient)" stroke="#008755" strokeWidth="2" points={`0,100 ${points} 100,100`} />
                        <polyline fill="none" stroke="#008755" strokeWidth="3" points={points} />
                         {data.map((item, index) => {
                            const x = (index / (data.length - 1)) * 100;
                            const y = 100 - (item.value / maxValue) * 90;
                            return <circle key={index} cx={x} cy={y} r="2" fill="white" stroke="#008755" strokeWidth="1.5" />;
                        })}
                    </svg>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {data.map(item => <span key={item.label}>{item.label}</span>)}
                    </div>
                </div>
            ) : (
                 <p className="text-center text-gray-500 dark:text-gray-400 py-8">بيانات غير كافية لرسم المخطط</p>
            )}
        </div>
    );
};

const ReportModal: React.FC<{ isOpen: boolean, onClose: () => void, onExport: () => void }> = ({ isOpen, onClose, onExport }) => {
    if (!isOpen) return null;
    const { addToast } = useToast();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-modal-in">
                 <button onClick={onClose} className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                    <XCircleIcon className="w-6 h-6" />
                </button>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">تصدير تقرير</h3>
                <div className="space-y-3">
                    <button
                        onClick={onExport}
                        className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 font-semibold py-3 px-4 rounded-lg hover:bg-green-200 dark:hover:bg-green-900 transition-colors"
                    >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        تصدير كملف Excel
                    </button>
                    <button
                        onClick={() => addToast('قريباً', 'سيتم توفير تصدير PDF في التحديثات القادمة.', 'info')}
                         className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 font-semibold py-3 px-4 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                    >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                       تصدير كملف PDF (قريباً)
                    </button>
                </div>
            </div>
        </div>
    );
};


const StatisticsView: React.FC<StatisticsViewProps> = ({ employees, transactions, officeContacts }) => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const stats = useMemo(() => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const transactionsToday = transactions.filter(t => t.date === todayStr).length;
        const transactionsYesterday = transactions.filter(t => t.date === yesterdayStr).length;
        const dailyChange = transactionsYesterday > 0 ? ((transactionsToday - transactionsYesterday) / transactionsYesterday) * 100 : (transactionsToday > 0 ? 100 : 0);

        return {
            totalEmployees: employees.length,
            totalFacilities: [...new Set(employees.map(e => e.center).filter(Boolean))].length,
            ongoingTransactions: transactions.filter(t => ['new', 'inProgress', 'followedUp'].includes(t.status)).length,
            completedTransactions: transactions.filter(t => t.status === 'completed').length,
            overdueTransactions: transactions.filter(t => t.status === 'new' && new Date(t.date) < twoDaysAgo).length,
            dailyActivityChange: dailyChange
        };
    }, [employees, transactions]);

    const chartData = useMemo(() => {
        const employeesByCenter = groupAndAggregate(employees, 'center', 5);
        const employeesByDepartment = groupAndAggregate(employees, 'department', 7);
        
        const transactionsLast7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('ar-SA', { weekday: 'short' });
            return { date: dateStr, label: dayName, value: 0 };
        }).reverse();
        
        transactions.forEach(t => {
            const transactionDate = t.date;
            const dayData = transactionsLast7Days.find(d => d.date === transactionDate);
            if (dayData) {
                dayData.value += 1;
            }
        });

        return { employeesByCenter, employeesByDepartment, transactionsLast7Days };
    }, [employees, transactions]);

    const handleExport = () => {
         const dataToExport = [
            {"المؤشر": "إجمالي الموظفين", "القيمة": stats.totalEmployees},
            {"المؤشر": "إجمالي المرافق", "القيمة": stats.totalFacilities},
            {"المؤشر": "المعاملات الجارية", "القيمة": stats.ongoingTransactions},
            {"المؤشر": "المعاملات المكتملة", "القيمة": stats.completedTransactions},
            ...chartData.employeesByDepartment.map(d => ({ "المؤشر": `عدد الموظفين في قطاع ${d.label}`, "القيمة": d.value})),
            ...chartData.employeesByCenter.map(d => ({ "المؤشر": `عدد الموظفين في مركز ${d.label}`, "القيمة": d.value})),
        ];
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ملخص الإحصائيات');
        XLSX.writeFile(workbook, 'statistics_summary.xlsx');
        setIsReportModalOpen(false);
    };

    return (
        <div className="mt-6 animate-fade-in pb-24 md:pb-6 relative">
            {/* Reports Button */}
            <button
                onClick={() => setIsReportModalOpen(true)}
                className="fixed bottom-20 md:bottom-8 right-8 z-40 bg-brand text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-brand-dark transition-transform transform hover:scale-110"
                title="تحميل التقارير"
            >
                <DocumentArrowDownIcon className="w-7 h-7" />
            </button>
             <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onExport={handleExport} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Dashboard Overview */}
                <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="إجمالي الموظفين" value={stats.totalEmployees} icon={<UserGroupIcon className="w-8 h-8 text-primary dark:text-primary-light"/>} />
                    <StatCard title="المرافق الصحية" value={stats.totalFacilities} icon={<BuildingOfficeIcon className="w-8 h-8 text-primary dark:text-primary-light"/>} />
                    <StatCard title="معاملات جارية" value={stats.ongoingTransactions} icon={<ArrowPathIcon className="w-8 h-8 text-primary dark:text-primary-light"/>} />
                    <StatCard title="معاملات مكتملة" value={stats.completedTransactions} icon={<CheckCircleIcon className="w-8 h-8 text-primary dark:text-primary-light"/>} />
                </div>

                 {/* 5. Smart Highlights */}
                 <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     <HighlightCard 
                        text={`نشاط اليوم ${stats.dailyActivityChange >= 0 ? 'مرتفع' : 'منخفض'} بنسبة ${Math.abs(stats.dailyActivityChange).toFixed(0)}% مقارنة بالأمس.`}
                        icon={<ArrowTrendingUpIcon className={`w-7 h-7 ${stats.dailyActivityChange >= 0 ? 'text-green-700' : 'text-red-700 rotate-90'}`}/>}
                        colorClass={`${stats.dailyActivityChange >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'}`}
                     />
                     <HighlightCard 
                        text={stats.overdueTransactions > 0 ? `هناك ${stats.overdueTransactions} معاملات لم تُراجع منذ أكثر من يومين.` : 'لا توجد معاملات متأخرة.'}
                        icon={<ExclamationTriangleIcon className="w-7 h-7 text-yellow-700"/>}
                        colorClass="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
                     />
                      <HighlightCard 
                        text="تم تسجيل 10 مستخدمين جدد هذا الأسبوع."
                        icon={<StarIcon className="w-7 h-7 text-blue-700"/>}
                        colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                     />
                </div>

                {/* 2. Interactive Charts */}
                <div className="md:col-span-2 lg:col-span-2">
                    <BarChartCard title="توزيع الموظفين حسب القطاع" data={chartData.employeesByDepartment} />
                </div>
                <div className="md:col-span-2 lg:col-span-2">
                     <DonutChartCard title="توزيع الموظفين حسب المراكز" data={chartData.employeesByCenter} />
                </div>
                 <div className="md:col-span-2 lg:col-span-4">
                     <LineChartCard title="نشاط المعاملات (آخر 7 أيام)" data={chartData.transactionsLast7Days} />
                </div>

                 {/* 3. User Activity Analytics */}
                 <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                     <h3 className="font-bold text-lg text-gray-800 mb-4 dark:text-white">تحليل الاستخدام <span className="text-xs text-gray-400">(بيانات تجريبية)</span></h3>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <UsersIcon className="w-8 h-8 mx-auto text-primary" />
                            <p className="mt-2 font-semibold text-gray-700 dark:text-gray-200">أكثر المستخدمين نشاطًا</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">عبدالله القرني</p>
                        </div>
                         <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <BuildingOfficeIcon className="w-8 h-8 mx-auto text-primary" />
                            <p className="mt-2 font-semibold text-gray-700 dark:text-gray-200">أكثر الأقسام استخدامًا</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">إدارة المعاملات</p>
                        </div>
                         <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <ClockIcon className="w-8 h-8 mx-auto text-primary" />
                            <p className="mt-2 font-semibold text-gray-700 dark:text-gray-200">الأوقات الأكثر نشاطًا</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">11:00 صباحًا</p>
                        </div>
                     </div>
                </div>

                {/* 6. Progress Tracker */}
                 <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <WrenchScrewdriverIcon className="w-8 h-8 text-primary" />
                        <div className="flex-1 w-full">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                المنصة الآن مكتملة بنسبة 80٪ – جاري العمل على إضافة نظام التذكيرات الذكي 🔧
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div className="bg-primary h-2.5 rounded-full" style={{width: '80%'}}></div>
                            </div>
                        </div>
                    </div>
                 </div>

            </div>
        </div>
    );
};

export default StatisticsView;
