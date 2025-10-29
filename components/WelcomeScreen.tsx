import React, { useState, useEffect } from 'react';
import { tabukHealthClusterLogoMain } from './Logo';
import { ArrowPathIcon, CheckCircleIcon } from '../icons/Icons';

type StepStatus = 'pending' | 'loading' | 'success';

interface LoadingStep {
    id: number;
    text: string;
    status: StepStatus;
}

const initialSteps: LoadingStep[] = [
    { id: 1, text: 'جاري الاتصال بقاعدة البيانات...', status: 'pending' },
    { id: 2, text: 'جاري تحميل البيانات...', status: 'pending' },
    { id: 3, text: 'جاري التجهيز للدخول...', status: 'pending' },
];

const WelcomeScreen: React.FC = () => {
    const [steps, setSteps] = useState<LoadingStep[]>(initialSteps);

    useEffect(() => {
        // Fix: In a browser environment, `setTimeout` returns a `number`, not a `NodeJS.Timeout`.
        const timeouts: number[] = [];

        // Step 1: Connecting
        // FIX: Use window.setTimeout to ensure the return type is a number, matching the array type.
        timeouts.push(window.setTimeout(() => {
            setSteps(prev => prev.map(s => s.id === 1 ? { ...s, status: 'loading' } : s));
        }, 200));

        // FIX: Use window.setTimeout to ensure the return type is a number, matching the array type.
        timeouts.push(window.setTimeout(() => {
            setSteps(prev => prev.map(s => s.id === 1 ? { ...s, text: 'تم الاتصال بنجاح!', status: 'success' } : s));
        }, 1200));

        // Step 2: Loading Data
        // FIX: Use window.setTimeout to ensure the return type is a number, matching the array type.
        timeouts.push(window.setTimeout(() => {
            setSteps(prev => prev.map(s => s.id === 2 ? { ...s, status: 'loading' } : s));
        }, 1500));

        // FIX: Use window.setTimeout to ensure the return type is a number, matching the array type.
        timeouts.push(window.setTimeout(() => {
            setSteps(prev => prev.map(s => s.id === 2 ? { ...s, text: 'تم تحميل البيانات بنجاح!', status: 'success' } : s));
        }, 2700));

        // Step 3: Preparing
        // FIX: Use window.setTimeout to ensure the return type is a number, matching the array type.
        timeouts.push(window.setTimeout(() => {
            setSteps(prev => prev.map(s => s.id === 3 ? { ...s, status: 'loading' } : s));
        }, 3000));
        
        // FIX: Use window.setTimeout to ensure the return type is a number, matching the array type.
        timeouts.push(window.setTimeout(() => {
            setSteps(prev => prev.map(s => s.id === 3 ? { ...s, text: 'تم الدخول!', status: 'success' } : s));
        }, 3500));

        return () => timeouts.forEach(clearTimeout);
    }, []);

    const StatusIcon: React.FC<{ status: StepStatus }> = ({ status }) => {
        switch (status) {
            case 'loading':
                return <ArrowPathIcon className="w-6 h-6 text-primary animate-spin" />;
            case 'success':
                return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
            default:
                return <div className="w-6 h-6" />; // Placeholder for pending
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 animate-fade-in dark:bg-gray-900">
            <div className="text-center flex flex-col items-center">
                <img
                    src={tabukHealthClusterLogoMain}
                    alt="شعار تجمع تبوك الصحي"
                    className="w-56 h-auto mx-auto mb-10"
                />
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 dark:text-white">أهلاً بك</h1>

                <div className="space-y-4 w-full max-w-xs">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`flex items-center gap-4 transition-opacity duration-500 ${step.status !== 'pending' ? 'opacity-100' : 'opacity-0'}`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className="w-8 flex-shrink-0 flex items-center justify-center">
                                <StatusIcon status={step.status} />
                            </div>
                            <p className={`text-base md:text-lg font-semibold ${step.status === 'success' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                {step.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;