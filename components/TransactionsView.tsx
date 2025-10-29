





import React, { useState, useMemo, useRef } from 'react';
import { Transaction } from '../types';
import TransactionCard from './TransactionCard';
import { SearchIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, PlusIcon } from '../icons/Icons';

interface TransactionsViewProps {
    transactions: Transaction[];
    onAddTransaction: () => void;
    onEditTransaction: (task: Transaction) => void;
    onDeleteTransaction: (transaction: Transaction) => void;
    onSelectTransaction: (transaction: Transaction) => void;
    onImport: (file: File) => void;
    onExport: () => void;
    showImportExport: boolean;
    allowDeletion: boolean;
    allowEditing: boolean;
}

const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onAddTransaction, onEditTransaction, onDeleteTransaction, onSelectTransaction, onImport, onExport, showImportExport, allowDeletion, allowEditing }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) onImport(file);
        if (event.target) event.target.value = '';
    };

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                return searchTerm === '' ||
                    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.transaction_number.toLowerCase().includes(searchTerm.toLowerCase());
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, searchTerm]);


    return (
        <div className="mt-6 animate-fade-in relative pb-24">
            
             <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <button 
                        onClick={onAddTransaction} 
                        className="p-2.5 rounded-lg w-full sm:w-auto flex items-center justify-center transition-all duration-200 font-semibold bg-primary text-white hover:bg-primary-dark transform hover:-translate-y-0.5"
                        title="إضافة معاملة جديدة"
                    >
                        <PlusIcon className="h-5 w-5 ml-2" /> إضافة
                    </button>
                    <div className="relative w-full flex-grow">
                         <input
                            type="text"
                            placeholder="ابحث برقم المعاملة أو الموضوع..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                    </div>
                    {showImportExport && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button onClick={handleImportClick} className="p-2.5 rounded-lg flex-1 sm:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 transform hover:-translate-y-0.5">
                                <ArrowUpTrayIcon className="h-5 w-5 ml-2" /> <span className="hidden sm:inline">استيراد</span>
                            </button>
                            <button onClick={onExport} className="p-2.5 rounded-lg flex-1 sm:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-accent/10 text-accent-dark hover:bg-accent/20 dark:bg-accent/20 dark:text-accent-light dark:hover:bg-accent/30 transform hover:-translate-y-0.5">
                                <ArrowDownTrayIcon className="h-5 w-5 ml-2" /> <span className="hidden sm:inline">تصدير</span>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls" />
                        </div>
                    )}
                </div>
            </div>

            {filteredTransactions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTransactions.map(transaction => (
                        <TransactionCard
                            key={transaction.id}
                            transaction={transaction}
                            onSelect={() => onSelectTransaction(transaction)}
                            onEdit={(e) => { e.stopPropagation(); onEditTransaction(transaction); }}
                            onDelete={allowDeletion ? (e) => { e.stopPropagation(); onDeleteTransaction(transaction); } : undefined}
                            allowEditing={allowEditing}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">لا توجد معاملات تطابق بحثك.</p>
                </div>
            )}

        </div>
    );
};

export default TransactionsView;