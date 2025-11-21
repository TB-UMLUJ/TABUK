import React from 'react';
import { Transaction, TransactionStatus, TransactionPlatform, TransactionType } from '../types';
import { 
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    ClockIcon,
    CalendarDaysIcon,
    ArrowRightIcon,
} from '../icons/Icons';

interface TransactionCardProps {
    transaction: Transaction;
    onSelect: () => void;
    onCycleStatus: (transactionId: number) => void;
}

const statusMap: Record<TransactionStatus, { text: string; className: string }> = {
    new: { text: 'جديدة', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
    inProgress: { text: 'قيد الإجراء', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
    followedUp: { text: 'متابعة', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' },
    completed: { text: 'منجزة', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' }
};

const platformMap: Record<TransactionPlatform, string> = {
    Bain: 'نظام بين',
    MinisterEmail: 'بريد المدير',
    HospitalEmail: 'بريد الإدارة'
};

const typeMap: Record<TransactionType, { icon: React.ReactNode; borderColor: string }> = {
    incoming: { icon: <ArrowDownTrayIcon className="w-5 h-5 text-green-600" />, borderColor: 'border-green-500' },
    outgoing: { icon: <ArrowUpTrayIcon className="w-5 h-5 text-blue-600" />, borderColor: 'border-blue-500' }
};

const nextStatusTextMap: Record<TransactionStatus, string> = {
    new: 'بدء الإجراء',
    inProgress: 'تحويل للمتابعة',
    followedUp: 'إكمال المعاملة',
    completed: 'مكتملة'
};

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onSelect, onCycleStatus }) => {
    const formattedDate = new Date(transaction.date + 'T00:00:00.000Z').toLocaleDateString('ar-SA', { calendar: 'gregory', day: 'numeric', month: 'short', year: 'numeric' });
    const statusInfo = statusMap[transaction.status];
    const typeInfo = typeMap[transaction.type];
    
    const isOverdue = () => {
        if (transaction.status === 'new') {
            const transactionDate = new Date(transaction.date + 'T00:00:00.000Z');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = today.getTime() - transactionDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 2;
        }
        return false;
    };
    
    const handleCycleStatus = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCycleStatus(transaction.id);
    };

    return (
        <div 
            onClick={onSelect}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
        >
            <div className={`p-4 flex items-start gap-4 border-r-4 ${typeInfo.borderColor}`}>
                <div className="flex-shrink-0 pt-1">
                    {typeInfo.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-gray-800 dark:text-white flex-1" title={transaction.subject}>
                            {transaction.subject}
                        </h3>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${statusInfo.className}`}>
                            {statusInfo.text}
                        </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {transaction.transaction_number} &middot; {platformMap[transaction.platform]}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3">
                        <div className="flex items-center gap-1.5">
                            <CalendarDaysIcon className="w-4 h-4" />
                            <span>{formattedDate}</span>
                        </div>

                        {isOverdue() && (
                            <div className="flex items-center gap-1 font-semibold text-red-500">
                                <ClockIcon className="w-4 h-4" />
                                <span>متأخرة</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl">
                 <button
                    onClick={handleCycleStatus}
                    disabled={transaction.status === 'completed'}
                    className="btn btn-muted w-full gap-2"
                >
                    <ArrowRightIcon className="w-4 h-4" />
                    <span>{nextStatusTextMap[transaction.status]}</span>
                </button>
            </div>
        </div>
    );
};

export default TransactionCard;