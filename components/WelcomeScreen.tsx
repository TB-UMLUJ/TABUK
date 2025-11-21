import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { CheckCircleIcon } from '../icons/Icons';

interface WelcomeScreenProps {
    currentUser: User | null;
    onComplete: () => void;
}

const steps = [
    { id: 1, text: "جاري التحقق من الهوية..." },
    { id: 2, text: "تجهيز بيئة العمل..." },
    { id: 3, text: "جلب أحدث البيانات..." },
    { id: 4, text: "وضع اللمسات الأخيرة..." },
    { id: 5, text: "أهلاً بك في منصة تجمع تبوك الصحي!" }
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ currentUser, onComplete }) => {
    const { logos } = useTheme();
    const [progress, setProgress] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const animationFrameId = useRef<number | null>(null);
    
    // استخدام Ref للحفاظ على دالة onComplete وتجنب إعادة تشغيل التأثير عند تحديث المكون الأب
    const onCompleteRef = useRef(onComplete);

    // تحديث المرجع عند تغير الدالة (لضمان استدعاء أحدث نسخة)
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        const stepDuration = 1200; // Duration per step in ms
        const totalSteps = steps.length;
        const totalDuration = stepDuration * totalSteps;
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            
            // Calculate overall progress (0 to 100)
            const rawProgress = Math.min((elapsed / totalDuration) * 100, 100);
            setProgress(rawProgress);

            // Calculate current step based on progress percentage
            const calculatedStepIndex = Math.min(
                Math.floor((rawProgress / 100) * totalSteps),
                totalSteps - 1
            );
            setCurrentStepIndex(calculatedStepIndex);

            if (elapsed < totalDuration) {
                animationFrameId.current = requestAnimationFrame(animate);
            } else {
                // Animation complete
                setTimeout(() => {
                    if (onCompleteRef.current) {
                        onCompleteRef.current();
                    }
                }, 800);
            }
        };

        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []); // مصفوفة تبعيات فارغة لضمان التشغيل مرة واحدة فقط عند التحميل

    if (!currentUser) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center animate-fade-in relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="mb-10 relative z-10">
                <img
                    src={logos.mainLogoUrl}
                    alt="شعار تجمع تبوك الصحي"
                    className="w-40 sm:w-48 h-auto drop-shadow-sm"
                />
            </div>
            
            <div className="w-full max-w-3xl relative z-10 flex flex-col items-center">
                
                {/* Styled Greeting Layout */}
                <div className="flex flex-row items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-12 w-full px-2">
                    {/* Gradient Greeting Text */}
                    <h2 className="text-2xl sm:text-5xl font-black tracking-tight whitespace-nowrap">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500">
                            مرحباً بعودتك
                        </span>
                    </h2>

                    {/* User Name Box - Dashed Border */}
                    <div className="px-4 py-1.5 sm:px-8 sm:py-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border-2 border-dashed border-primary/30 dark:border-primary/40 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm hover:border-primary/60 transition-all duration-300 transform hover:scale-105 max-w-[50%] sm:max-w-none">
                        <span className="text-lg sm:text-2xl font-bold text-primary dark:text-primary-light pb-1 truncate" dir="auto">
                            {currentUser.full_name}
                        </span>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="h-8 flex items-center justify-center mb-6">
                     <p 
                        key={currentStepIndex} 
                        className="text-gray-700 dark:text-gray-300 font-semibold text-lg animate-step-text-fade flex items-center gap-2"
                     >
                        {currentStepIndex === steps.length - 1 && <CheckCircleIcon className="w-5 h-5 text-green-500"/>}
                        {steps[currentStepIndex].text}
                     </p>
                </div>
                
                {/* Continuous Progress Bar with Moving Percentage */}
                <div className="w-full max-w-md px-6 mt-4">
                    <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                            className="absolute top-0 right-0 h-full bg-gradient-to-l from-primary to-teal-500 rounded-full"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Moving Percentage Indicator (Tooltip Style) */}
                            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-[32px] z-20">
                                <div className="bg-primary dark:bg-primary-light text-white dark:text-gray-900 text-[10px] font-bold px-2 py-1 rounded-md shadow-lg min-w-[36px] text-center relative">
                                    {Math.round(progress)}%
                                    {/* Arrow pointing down */}
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary dark:bg-primary-light rotate-45"></div>
                                </div>
                            </div>

                            {/* Glowing Leading Edge */}
                            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10"></div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="absolute bottom-8 text-center text-gray-400 text-xs dark:text-gray-500 font-medium">
                &copy; {new Date().getFullYear()} تجمع تبوك الصحي. جميع الحقوق محفوظة.
            </p>
        </div>
    );
};

export default WelcomeScreen;