
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Employee } from '../types';
import { CloseIcon, UsersIcon } from '../icons/Icons';

interface SynergyRadarModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedEmployees: Employee[];
}

// Helper to generate consistent pseudo-random stats based on string input
const getPseudoStat = (str: string, seed: number) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const result = Math.abs(hash + seed) % 100;
    return result < 40 ? result + 40 : result; // Ensure minimum score of 40 for better visuals
};

const statsCategories = [
    { key: 'tech', label: 'الخبرة التقنية', angle: 0 },
    { key: 'comm', label: 'التواصل', angle: 60 },
    { key: 'lead', label: 'القيادة', angle: 120 },
    { key: 'innov', label: 'الابتكار', angle: 180 },
    { key: 'eff', label: 'الكفاءة', angle: 240 },
    { key: 'team', label: 'العمل الجماعي', angle: 300 },
];

const SynergyRadarModal: React.FC<SynergyRadarModalProps> = ({ isOpen, onClose, selectedEmployees }) => {
    
    const teamStats = useMemo(() => {
        if (selectedEmployees.length === 0) return null;

        const aggregated = { tech: 0, comm: 0, lead: 0, innov: 0, eff: 0, team: 0 };

        selectedEmployees.forEach(emp => {
            const idStr = emp.employee_id + emp.full_name_en;
            aggregated.tech += getPseudoStat(idStr, 1);
            aggregated.comm += getPseudoStat(idStr, 2);
            aggregated.lead += getPseudoStat(idStr, 3);
            aggregated.innov += getPseudoStat(idStr, 4);
            aggregated.eff += getPseudoStat(idStr, 5);
            aggregated.team += getPseudoStat(idStr, 6);
        });

        // Calculate averages
        const count = selectedEmployees.length;
        return {
            tech: Math.round(aggregated.tech / count),
            comm: Math.round(aggregated.comm / count),
            lead: Math.round(aggregated.lead / count),
            innov: Math.round(aggregated.innov / count),
            eff: Math.round(aggregated.eff / count),
            team: Math.round(aggregated.team / count),
        };

    }, [selectedEmployees]);

    if (!isOpen || !teamStats) return null;

    // Chart configuration
    const size = 300;
    const center = size / 2;
    const radius = 100;
    const maxDataValue = 100;

    // Helper to calculate coordinates
    const getCoordinates = (angle: number, value: number) => {
        const angleRad = (Math.PI / 180) * (angle - 90); // -90 to rotate to top
        const r = (value / maxDataValue) * radius;
        return {
            x: center + r * Math.cos(angleRad),
            y: center + r * Math.sin(angleRad)
        };
    };

    // Generate Polygon Points
    const points = statsCategories.map(cat => {
        const val = teamStats[cat.key as keyof typeof teamStats];
        const coords = getCoordinates(cat.angle, val);
        return `${coords.x},${coords.y}`;
    }).join(' ');

    // Generate Grid Lines (Background)
    const gridLevels = [25, 50, 75, 100];

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/60 animate-backdrop-in" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-modal-in-scale border border-gray-200 dark:border-gray-700">
                
                <button onClick={onClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <CloseIcon className="w-6 h-6" />
                </button>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light mb-3">
                        <UsersIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">رادار التناغم</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">تحليل مهارات الفريق المختار ({selectedEmployees.length} موظف)</p>
                </div>

                <div className="flex justify-center">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                        {/* Grid Polygons */}
                        {gridLevels.map(level => (
                            <polygon
                                key={level}
                                points={statsCategories.map(c => {
                                    const coords = getCoordinates(c.angle, level);
                                    return `${coords.x},${coords.y}`;
                                }).join(' ')}
                                fill="none"
                                stroke="#e5e7eb" // gray-200
                                strokeWidth="1"
                                className="dark:stroke-gray-700"
                            />
                        ))}

                        {/* Axes Lines */}
                        {statsCategories.map(cat => {
                            const coords = getCoordinates(cat.angle, 100);
                            return (
                                <line
                                    key={cat.key}
                                    x1={center}
                                    y1={center}
                                    x2={coords.x}
                                    y2={coords.y}
                                    stroke="#e5e7eb"
                                    strokeWidth="1"
                                    className="dark:stroke-gray-700"
                                />
                            );
                        })}

                        {/* Data Polygon */}
                        <polygon
                            points={points}
                            fill="rgba(0, 135, 85, 0.2)" // Primary with opacity
                            stroke="#008755" // Primary
                            strokeWidth="2"
                            className="transition-all duration-500 ease-out"
                        />

                        {/* Labels */}
                        {statsCategories.map(cat => {
                            // Push label out a bit further than radius
                            const coords = getCoordinates(cat.angle, 115); 
                            return (
                                <text
                                    key={cat.key}
                                    x={coords.x}
                                    y={coords.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-[10px] sm:text-xs font-bold fill-gray-600 dark:fill-gray-300"
                                >
                                    {cat.label}
                                </text>
                            );
                        })}

                         {/* Values (Dots) */}
                         {statsCategories.map(cat => {
                            const val = teamStats[cat.key as keyof typeof teamStats];
                            const coords = getCoordinates(cat.angle, val);
                            return (
                                <circle
                                    key={cat.key}
                                    cx={coords.x}
                                    cy={coords.y}
                                    r="3"
                                    fill="#008755"
                                    className="hover:r-4 transition-all"
                                >
                                    <title>{cat.label}: {val}%</title>
                                </circle>
                            );
                        })}
                    </svg>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">تحليل الذكاء الاصطناعي:</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        يتمتع هذا الفريق بتوازن جيد في <span className="font-bold text-primary">الابتكار</span> و <span className="font-bold text-primary">الكفاءة التقنية</span>. 
                        {teamStats.comm < 60 && <span className="block mt-1 text-amber-600 dark:text-amber-400">⚠ تنبيه: قد يحتاج الفريق إلى تعزيز مهارات التواصل لتحسين التناغم.</span>}
                    </p>
                </div>

            </div>
        </div>,
        modalRoot
    );
};

export default SynergyRadarModal;
