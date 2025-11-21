import React, { useState, useEffect } from 'react';

interface AnimatedStatCardProps {
    title: string;
    value: number;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    bgClass: string;
    iconColorClass: string;
}

const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({ title, value, icon, bgClass, iconColorClass }) => {
    const [animatedValue, setAnimatedValue] = useState(0);

    useEffect(() => {
        let animationFrameId: number;
        const startValue = 0;
        const endValue = value;
        const duration = 1500;
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsedTime = timestamp - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
            const currentValue = startValue + (endValue - startValue) * easedProgress;

            setAnimatedValue(currentValue);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setAnimatedValue(endValue);
            }
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [value]);

    return (
        <div className={`relative p-4 rounded-2xl shadow-sm overflow-hidden h-36 bg-gradient-to-br ${bgClass}`}>
            <div className={`absolute -bottom-3 -left-3 opacity-10 ${iconColorClass}`}>
                 {React.cloneElement(icon, { 
                     className: 'w-24 h-24'
                 })}
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-end text-right">
                <p className="font-bold text-4xl text-gray-800 dark:text-white">{Math.round(animatedValue)}</p>
                <p className="font-semibold text-gray-600 dark:text-gray-300 mt-1 truncate">{title}</p>
            </div>
        </div>
    );
};

export default AnimatedStatCard;