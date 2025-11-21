
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
    FireIcon, 
    PhoneIcon, 
    UserGroupIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon
} from '../icons/Icons';
import { Task, Employee } from '../types';

interface CrisisDashboardProps {
    employees: Employee[];
    tasks: Task[];
}

const CrisisDashboard: React.FC<CrisisDashboardProps> = ({ employees, tasks }) => {
    const { toggleCrisisMode } = useTheme();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Filter data for crisis relevance
    const onCallStaff = employees.filter(e => 
        e.job_title.includes('طبيب') || 
        e.job_title.includes('تمريض') || 
        e.job_title.includes('أمن')
    ).slice(0, 6);

    const emergencyContacts = [
        { name: 'غرفة القيادة والتحكم', number: '937' },
        { name: 'مدير الطوارئ', number: '0500000000' },
        { name: 'الدفاع المدني', number: '998' },
        { name: 'الهلال الأحمر', number: '997' },
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900 font-sans flex flex-col overflow-hidden text-white">
            {/* Pulse Overlay Effect - Modernized */}
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(220,38,38,0.6)] animate-pulse pointer-events-none z-0"></div>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0"></div>

            {/* Header */}
            <header className="relative z-10 bg-red-950/90 backdrop-blur-md border-b border-red-700/50 shadow-2xl">
                <div className="container mx-auto px-4 py-4 md:py-5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto justify-center md:justify-start">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                            <FireIcon className="w-10 h-10 md:w-12 md:h-12 text-red-500 relative z-10" />
                        </div>
                        <div className="text-center md:text-right">
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wider drop-shadow-md">
                                حالة طوارئ
                            </h1>
                            <p className="text-red-300 text-xs md:text-sm font-semibold">تجمع تبوك الصحي - مركز القيادة</p>
                        </div>
                    </div>

                    <div className="flex flex-row-reverse md:flex-col items-center md:items-end gap-4 md:gap-1 w-full md:w-auto justify-between md:justify-end border-t md:border-0 border-red-800/50 pt-3 md:pt-0">
                         <div className="text-left md:text-left">
                            <p className="text-2xl md:text-3xl font-bold text-white leading-none" dir="ltr">
                                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                            </p>
                            <p className="text-red-300 text-xs font-medium mt-1" dir="ltr">
                                {currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <button 
                            onClick={toggleCrisisMode}
                            className="bg-white text-red-700 hover:bg-red-50 font-bold py-2 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 text-sm md:text-base"
                        >
                            إنهاء الحالة
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area with Scrolling */}
            <main className="relative z-10 flex-grow p-4 md:p-6 overflow-y-auto custom-scrollbar">
                {/* Grid Container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Card 1: Emergency Contacts */}
                    <div className="bg-gray-800/60 backdrop-blur-sm border border-red-500/30 rounded-xl overflow-hidden shadow-lg flex flex-col">
                        <div className="bg-red-900/40 p-4 border-b border-red-500/20 flex items-center gap-2">
                            <PhoneIcon className="w-6 h-6 text-red-400" />
                            <h2 className="text-lg md:text-xl font-bold text-white">الاتصال العاجل</h2>
                        </div>
                        <div className="p-4 space-y-3 overflow-y-auto flex-grow">
                            {emergencyContacts.map((contact, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-900/50 border border-red-500/10 rounded-lg hover:border-red-500/40 transition-colors cursor-pointer">
                                    <span className="text-base md:text-lg text-gray-200">{contact.name}</span>
                                    <span className="text-xl md:text-2xl font-bold text-red-400 tracking-wider" dir="ltr">{contact.number}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card 2: On-Call Staff & Status */}
                    <div className="flex flex-col gap-4 md:gap-6">
                        {/* System Status */}
                        <div className="bg-gray-800/60 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 shadow-lg">
                            <h2 className="text-lg font-bold text-white mb-3 border-b border-white/10 pb-2">حالة النظام</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-center">
                                    <span className="block text-green-400 text-xs mb-1">الشبكة</span>
                                    <span className="block text-white font-bold text-lg">متصل</span>
                                </div>
                                <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-center">
                                    <span className="block text-green-400 text-xs mb-1">قاعدة البيانات</span>
                                    <span className="block text-white font-bold text-lg">مستقر</span>
                                </div>
                            </div>
                        </div>

                        {/* Staff */}
                        <div className="bg-gray-800/60 backdrop-blur-sm border border-red-500/30 rounded-xl overflow-hidden shadow-lg flex-grow flex flex-col">
                            <div className="bg-red-900/40 p-4 border-b border-red-500/20 flex items-center gap-2">
                                <UserGroupIcon className="w-6 h-6 text-blue-400" />
                                <h2 className="text-lg md:text-xl font-bold text-white">المناوبين (تقديري)</h2>
                            </div>
                            <ul className="divide-y divide-white/5 overflow-y-auto flex-grow">
                                {onCallStaff.map(staff => (
                                    <li key={staff.id} className="flex justify-between items-center p-3 hover:bg-white/5 transition-colors">
                                        <span className="text-gray-200 font-medium text-sm">{staff.full_name_ar}</span>
                                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{staff.job_title}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Bottom Banner */}
            <div className="relative z-10 bg-red-600 text-white text-center py-2 font-bold text-xs md:text-sm tracking-wide shadow-[0_-4px_20px_rgba(220,38,38,0.5)] animate-pulse">
                وضع الاستجابة للحوادث الحرجة نشط • الدخول مقيد • المراقبة مفعلة
            </div>
        </div>
    );
};

export default CrisisDashboard;
