import React from 'react';
import { Transaction, TransactionStatus, TransactionPlatform } from '../types';
import { PencilIcon, TrashIcon, PaperClipIcon, CalendarDaysIcon } from '../icons/Icons';

interface TransactionCardProps {
    transaction: Transaction;
    onSelect: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete?: (e: React.MouseEvent) => void;
    allowEditing: boolean;
}

const statusMap: Record<TransactionStatus, { text: string; className: string }> = {
    new: { text: 'جديدة', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    inProgress: { text: 'قيد الإجراء', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    followedUp: { text: 'تمت المتابعة', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    completed: { text: 'منجزة', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' }
};

const platformMap: Record<TransactionPlatform, string> = {
    Bain: 'نظام بين',
    MinisterEmail: 'بريد الوزير',
    HospitalEmail: 'بريد المستشفى'
};

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onSelect, onEdit, onDelete, allowEditing }) => {
    
    const formattedDate = new Date(transaction.date + 'T00:00:00.000Z').toLocaleDateString('ar-SA', { day: '2-digit', month: 'short', year: 'numeric' });
    const statusInfo = statusMap[transaction.status];
    const typeInfo = {
        incoming: { text: 'واردة', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
        outgoing: { text: 'صادرة', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
    }[transaction.type];

    return (
        <div 
            onClick={onSelect}
            className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 transition-all duration-300 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-primary/50 dark:hover:border-primary-light/50 cursor-pointer"
        >
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusInfo.className}`}>{statusInfo.text}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeInfo.className}`}>{typeInfo.text}</span>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 truncate" title={transaction.transaction_number}>{transaction.transaction_number}</p>
                </div>
                
                <h3 className="font-bold text-md text-gray-800 dark:text-white">{transaction.subject}</h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <div className="flex items-center gap-1.5 font-medium">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <span className="font-bold">المنصة:</span>
                        <span>{platformMap[transaction.platform]}</span>
                    </div>
                    {transaction.attachment && (
                        <div className="flex items-center gap-1 text-primary dark:text-primary-light font-bold">
                            <PaperClipIcon className="w-4 h-4" />
                            <span>يوجد مرفق</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
                {allowEditing && (
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                        title="تعديل"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg text-gray-400 hover:bg-danger/10 hover:text-danger dark:hover:bg-danger/20 dark:hover:text-red-400 transition-colors"
                        title="حذف"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default TransactionCard;