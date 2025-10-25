import React, { useState, useMemo } from 'react';
import { Transaction, TransactionStatus, TransactionPlatform } from '../types';
import TransactionCard from './TransactionCard';
import { PlusIcon, SearchIcon } from '../icons/Icons';

interface TransactionsViewProps {
    transactions: Transaction[];
    onAddTransaction: () => void;
    onEditTransaction: (task: Transaction) => void;
    onDeleteTransaction: (taskId: number) => void;
    onSelectTransaction: (transaction: Transaction) => void;
}

const statusOptions: { value: TransactionStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'new', label: 'جديدة' },
    { value: 'inProgress', label: 'قيد الإجراء' },
    { value: 'followedUp', label: 'تمت المتابعة' },
    { value: 'completed', label: 'منجزة' },
];

const platformOptions: { value: TransactionPlatform | 'all'; label: string }[] = [
    { value: 'all', label: 'كل المنصات' },
    { value: 'Bain', label: 'نظام بين' },
    { value: 'MinisterEmail', label: 'بريد الوزير' },
    { value: 'HospitalEmail', label: 'بريد المستشفى' },
];


const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onAddTransaction, onEditTransaction, onDeleteTransaction, onSelectTransaction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
    const [platformFilter, setPlatformFilter] = useState<TransactionPlatform | 'all'>('all');

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                const matchesSearch = searchTerm === '' ||
                    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.transaction_number.toLowerCase().includes(searchTerm.toLowerCase());
                
                const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
                const matchesPlatform = platformFilter === 'all' || t.platform === platformFilter;

                return matchesSearch && matchesStatus && matchesPlatform;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, searchTerm, statusFilter, platformFilter]);


    return (
        <div className="mt-6 animate-fade-in relative pb-24">
            
             <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative md:col-span-3">
                         <input
                            type="text"
                            placeholder="ابحث برقم المعاملة أو الموضوع..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'all')}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <select
                        value={platformFilter}
                        onChange={(e) => setPlatformFilter(e.target.value as TransactionPlatform | 'all')}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        {platformOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            {filteredTransactions.length > 0 ? (
                <div className="space-y-3">
                    {filteredTransactions.map(transaction => (
                        <TransactionCard
                            key={transaction.id}
                            transaction={transaction}
                            onSelect={() => onSelectTransaction(transaction)}
                            onEdit={(e) => { e.stopPropagation(); onEditTransaction(transaction); }}
                            onDelete={(e) => { e.stopPropagation(); onDeleteTransaction(transaction.id); }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">لا توجد معاملات تطابق بحثك.</p>
                </div>
            )}

             <button
                onClick={onAddTransaction}
                className="fixed bottom-28 md:bottom-10 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform duration-300 z-40"
                aria-label="إضافة معاملة جديدة"
            >
                <PlusIcon className="w-8 h-8" />
            </button>
        </div>
    );
};

export default TransactionsView;