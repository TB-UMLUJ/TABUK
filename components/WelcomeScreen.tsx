import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { tabukHealthClusterLogoMain } from './Logo';
import { CheckIcon } from '../icons/Icons';

const steps = [
    { id: 1, progress: 10, text: "جارٍ التحقق من بيانات الدخول…" },
    { id: 2, progress: 35, text: "جارٍ الاتصال بقاعدة البيانات…" },
    { id: 3, progress: 60, text: "جارٍ تحميل بيانات المستخدم…" },
    { id: 4, progress: 85, text: "تحضير الواجهة الرئيسية…" },
    { id: 5, progress: 100, text: "تم تسجيل الدخول بنجاح 🎉" }
];

const WelcomeScreen: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timeouts: number[] = [];
        const baseDelay = 100;
        const stepDelay = 750;

        steps.forEach((step, index) => {
            timeouts.push(setTimeout(() => {
                setProgress(step.progress);
            }, baseDelay + index * stepDelay));
        });
        
        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, []);

    if (!currentUser) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center animate-fade-in relative">
            <div className="mb-12">
                <img
                    src={tabukHealthClusterLogoMain}
                    alt="شعار تجمع تبوك الصحي"
                    className="w-32 sm:w-36 h-auto"
                />
            </div>
            
            <div className="w-full max-w-sm">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-8">
                    مرحبا بعودتك، {currentUser.full_name}
                </h2>

                <div className="relative pr-5"> {/* Padding for alignment */}
                    
                    <ul className="relative">
                        {/* Vertical track lines */}
                        <div className="absolute right-[18px] top-0 bottom-0 w-1.5 bg-accent-light rounded-full" style={{ transform: 'translateX(50%)' }} />
                        <div 
                            className="absolute right-[18px] top-0 w-1.5 bg-primary rounded-full transition-all duration-500 ease-linear"
                            style={{ 
                                height: `${progress}%`,
                                transform: 'translateX(50%)'
                            }}
                        />

                        {steps.map((step, index) => {
                            const isCompleted = progress >= step.progress;
                            
                            const firstIncompleteIndex = steps.findIndex(s => progress < s.progress);
                            const isActive = firstIncompleteIndex !== -1 && index === firstIncompleteIndex;

                            let nodeClasses = "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 flex-shrink-0";
                            let textClasses = "font-semibold transition-colors duration-300 text-right";

                            if (isCompleted) {
                                nodeClasses += " bg-primary border-4 border-gray-50 dark:border-gray-900";
                                textClasses += " text-gray-800 dark:text-white";
                            } else if (isActive) {
                                nodeClasses += " bg-white dark:bg-gray-900 ring-4 ring-accent-dark";
                                textClasses += " text-gray-700 dark:text-gray-300";
                            } else {
                                nodeClasses += " bg-accent-light border-4 border-gray-50 dark:border-gray-900";
                                textClasses += " text-gray-400 dark:text-gray-500";
                            }

                            return (
                                <li key={step.id} className="flex items-center gap-4" style={{minHeight: '4.5rem'}}>
                                    <div className={nodeClasses}>
                                        {isCompleted && <CheckIcon className="w-6 h-6 text-white" />}
                                    </div>
                                    <p className={textClasses}>
                                        {step.text}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
            <p className="absolute bottom-6 text-center text-gray-400 text-xs dark:text-gray-500">
                &copy; 2025 تجمع تبوك الصحي. جميع الحقوق محفوظة.
            </p>
        </div>
    );
};

export default WelcomeScreen;