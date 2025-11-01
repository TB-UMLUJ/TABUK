import React from 'react';

interface GaugeProps {
    value: number;
    maxValue?: number;
}

const EmployeeCountGauge: React.FC<GaugeProps> = ({ value, maxValue = 250 }) => {
    const minAngle = -90;
    const maxAngle = 90;
    const angleRange = maxAngle - minAngle;

    const valueToAngle = (val: number) => {
        const percentage = Math.min(Math.max(val, 0), maxValue) / maxValue;
        return minAngle + percentage * angleRange;
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        const d = [ "M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y ].join(" ");
        return d;
    };

    const colors = ['#EF4444', '#F59E0B', '#10B981', '#008755']; // Red, Orange, Light Green, Dark Green
    const segments = colors.map((color, i) => {
        const start = (i / colors.length) * maxValue;
        const end = ((i + 1) / colors.length) * maxValue;
        return { path: describeArc(100, 100, 75, valueToAngle(start), valueToAngle(end)), color };
    });

    const indicatorAngle = valueToAngle(value);
    const indicatorPos = polarToCartesian(100, 100, 75, indicatorAngle);

    const description = "موظف";
    let descriptionColor = "text-red-500";
    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) {
        descriptionColor = "text-primary";
    } else if (percentage >= 60) {
        descriptionColor = "text-green-500";
    } else if (percentage >= 40) {
        descriptionColor = "text-yellow-500";
    } else if (percentage >= 20) {
        descriptionColor = "text-orange-500";
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
            
            <p className="text-lg font-bold text-gray-800 dark:text-white">إجمالي عدد الموظفين</p>
            
            <svg viewBox="0 0 200 125" className="w-full max-w-sm mx-auto">
                {/* Color Segments */}
                {segments.map((segment, i) => (
                     <path key={i} d={segment.path} fill="none" stroke={segment.color} strokeWidth="8" strokeLinecap="round" />
                ))}

                {/* Indicator */}
                <g>
                    <circle cx={indicatorPos.x} cy={indicatorPos.y} r="6" fill="white" stroke="#3B82F6" strokeWidth="2.5" />
                    <circle cx={indicatorPos.x} cy={indicatorPos.y} r="2.5" fill="#3B82F6" />
                </g>
                
                {/* Text in the middle */}
                <text x="100" y="80" textAnchor="middle" className="text-5xl font-bold fill-gray-900 dark:fill-white">
                    {value}
                </text>
                <text x="100" y="102" textAnchor="middle" className={`text-xl font-semibold ${descriptionColor.replace('text-', 'fill-')}`}>
                    {description}
                </text>

                 {/* Min/Max Labels */}
                <text x="20" y="118" textAnchor="middle" className="text-sm font-medium fill-gray-500 dark:fill-gray-400">0</text>
                <text x="180" y="118" textAnchor="middle" className="text-sm font-medium fill-gray-500 dark:fill-gray-400">{maxValue}</text>
            </svg>
        </div>
    );
};

export default EmployeeCountGauge;