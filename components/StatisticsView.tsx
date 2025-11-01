


import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Employee, Transaction, OfficeContact, Task } from '../types';
import EmployeeCountGauge from './EmployeeCountGauge';
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
    InformationCircleIcon,
    PhoneIcon,
    ClipboardDocumentCheckIcon,
    Cog6ToothIcon
} from '../icons/Icons';
import { supabase } from '../lib/supabaseClient'; // To get office contacts count
import { useToast } from '../contexts/ToastContext';

declare const XLSX: any;


interface StatisticsViewProps {
    employees: Employee[];
    transactions: Transaction[];
    officeContacts: OfficeContact[];
    tasks: Task[];
}

// --- Helper Functions ---
const groupAndAggregate = (data: any[], key: string, limit?: number) => {
    const counts = new Map<string, number>();
    data.forEach(item => {
        const value = item[key] || 'غير محدد';
        counts.set(value, (counts.get(value) || 0) + 1);
    });

    const sorted = Array.from(counts.entries())
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);

    if (limit) {
        return sorted.slice(0, limit);
    }
    return sorted;
};

// --- Sub-Components ---
const gradients = {
    facilities: { id: 'grad-facilities', colors: ['#008755', '#009ACE'] }, // Green to Blue
    offices: { id: 'grad-offices', colors: ['#009ACE', '#4f46e5'] },     // Blue to Indigo
    ongoing: { id: 'grad-ongoing', colors: ['#F59E0B', '#FBBF24'] },   // Orange to Yellow
    completed: { id: 'grad-completed', colors: ['#10B981', '#34D399'] }, // Green to Lighter Green
    remainingTasks: { id: 'grad-remaining', colors: ['#64748B', '#475569'] }, // Slate colors
    completedTasks: { id: 'grad-completed-tasks', colors: ['#22C55E', '#16A34A'] } // Green colors
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement<React.SVGProps<SVGSVGElement>>; gradientId: string; gradientColors: [string, string] }> = ({ title, value, icon, gradientId, gradientColors }) => (
    <div className="relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden h-24">
        <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={gradientColors[0]} />
                    <stop offset="100%" stopColor={gradientColors[1]} />
                </linearGradient>
            </defs>
        </svg>

        <div className="relative z-10">
            <p className="text-gray-500 font-medium text-sm dark:text-gray-400 truncate">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        </div>
        <div className="absolute -bottom-1 -left-1 z-0 opacity-50 dark:opacity-30">
             {React.cloneElement(icon, { 
                 className: 'w-12 h-12',
                 stroke: `url(#${gradientId})`
             })}
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
                <div className="space-y-4">
                    {data.map((item, index) => (
                        <div key={index}>
                            <div className="flex justify-between items-center mb-1 text-xs">
                                <span className="font-medium text-gray-700 dark:text-gray-300 truncate" title={item.label}>{item.label}</span>
                                <span className="font-bold text-gray-800 dark:text-white">{item.value}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                    className="bg-primary h-2.5 rounded-full"
                                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                                ></div>
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
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF6666', '#66CCCC', '#FFD700'];
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="font-bold text-lg text-gray-800 mb-4 dark:text-white">{title}</h3>
            {data.length > 0 ? (
                <div className="w-full">
                    <ul className="space-y-2 max-h-72 overflow-y-auto pr-2">
                        {data.map((entry, index) => (
                            <li key={index} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}/>
                                    <span className="text-gray-600 dark:text-gray-300 font-medium truncate" title={entry.label}>{entry.label}</span>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <span className="font-semibold text-gray-800 dark:text-white">{entry.value}</span>
                                    <span className="text-gray-500 dark:text-gray-400 w-10 text-right">{total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%</span>
                                </div>
                            </li>
                        ))}
                    </ul>
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

const StatisticsView: React.FC<StatisticsViewProps> = ({ employees, transactions, officeContacts, tasks }) => {
    const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsReportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
        
        const remainingTasks = tasks.filter(t => !t.is_completed).length;
        const completedTasks = tasks.filter(t => t.is_completed).length;

        return {
            totalEmployees: employees.length,
            totalFacilities: [...new Set(employees.map(e => e.center).filter(Boolean))].length,
            ongoingTransactions: transactions.filter(t => ['new', 'inProgress', 'followedUp'].includes(t.status)).length,
            completedTransactions: transactions.filter(t => t.status === 'completed').length,
            overdueTransactions: transactions.filter(t => t.status === 'new' && new Date(t.date) < twoDaysAgo).length,
            dailyActivityChange: dailyChange,
            remainingTasks,
            completedTasks
        };
    }, [employees, transactions, tasks]);

    const chartData = useMemo(() => {
        const employeesByCenter = groupAndAggregate(employees, 'center');
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
        setIsReportMenuOpen(false);
    };

    return (
        <div className="mt-6 animate-fade-in pb-24 md:pb-6 relative">
            

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                <div className="lg:col-span-4">
                    <EmployeeCountGauge value={stats.totalEmployees} />
                </div>
                
                <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard 
                        title="المرافق الصحية" 
                        value={stats.totalFacilities} 
                        icon={<BuildingOfficeIcon />} 
                        gradientId={gradients.facilities.id} 
                        gradientColors={gradients.facilities.colors as [string, string]}
                    />
                    <StatCard 
                        title="تحويلات المكاتب" 
                        value={officeContacts.length} 
                        icon={<PhoneIcon />}
                        gradientId={gradients.offices.id} 
                        gradientColors={gradients.offices.colors as [string, string]}
                    />
                    <StatCard 
                        title="معاملات جارية" 
                        value={stats.ongoingTransactions} 
                        icon={<ClockIcon />}
                        gradientId={gradients.ongoing.id} 
                        gradientColors={gradients.ongoing.colors as [string, string]}
                    />
                    <StatCard 
                        title="معاملات مكتملة" 
                        value={stats.completedTransactions} 
                        icon={<CheckCircleIcon />}
                        gradientId={gradients.completed.id} 
                        gradientColors={gradients.completed.colors as [string, string]}
                    />
                    <StatCard 
                        title="المهام المتبقية" 
                        value={stats.remainingTasks} 
                        icon={<BellIcon />}
                        gradientId={gradients.remainingTasks.id} 
                        gradientColors={gradients.remainingTasks.colors as [string, string]}
                    />
                    <StatCard 
                        title="المهام المكتملة" 
                        value={stats.completedTasks} 
                        icon={<ClipboardDocumentCheckIcon />}
                        gradientId={gradients.completedTasks.id} 
                        gradientColors={gradients.completedTasks.colors as [string, string]}
                    />
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
                    <BarChartCard 
                        title="توزيع الموظفين حسب القطاع" 
                        data={chartData.employeesByDepartment} 
                    />
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

                {/* 6. Progress Tracker - Styled as an announcement */}
                 <div className="lg:col-span-4 bg-gradient-to-br from-primary to-green-600 dark:from-primary-dark dark:to-green-700 rounded-xl shadow-lg p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Cog6ToothIcon className="w-10 h-10 text-white flex-shrink-0 animate-spin [animation-duration:3s]" />
                        <div className="flex-1 w-full text-center sm:text-right">
                            <p className="text-lg font-bold text-white">المنصة الآن مكتملة بنسبة 80%</p>
                            <p className="text-sm text-green-100 dark:text-green-200 mt-1 mb-3">
                                جاري العمل على إضافة مميزات قريباً
                            </p>
                            <div className="w-full bg-white/30 rounded-full h-2.5">
                                <div className="bg-white h-2.5 rounded-full" style={{width: '80%'}}></div>
                            </div>
                        </div>
                    </div>
                 </div>

            </div>

            {/* Export Button at the bottom */}
            <div className="mt-12 flex justify-center">
                 <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setIsReportMenuOpen(prev => !prev)}
                        className="flex items-center gap-2 bg-brand/10 text-brand-dark dark:bg-brand/20 dark:text-brand-light font-semibold py-2.5 px-6 rounded-lg hover:bg-brand/20 dark:hover:bg-brand/30 transition-all duration-200 transform hover:-translate-y-0.5"
                        title="تحميل تقرير الإحصائيات"
                    >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        <span>تصدير تقرير</span>
                    </button>
                    {isReportMenuOpen && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 z-50 p-2 animate-fade-in">
                            <ul className="space-y-1">
                                <li>
                                    <button onClick={handleExport} className="w-full flex items-center gap-3 text-right p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <DocumentArrowDownIcon className="w-5 h-5 text-green-600" />
                                        <span className="font-semibold">تصدير Excel</span>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => { addToast('قريباً', 'سيتم توفير تصدير PDF في التحديثات القادمة.', 'info'); setIsReportMenuOpen(false); }} className="w-full flex items-center gap-3 text-right p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <DocumentArrowDownIcon className="w-5 h-5 text-red-600" />
                                        <span className="font-semibold">تصدير PDF (قريباً)</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatisticsView;