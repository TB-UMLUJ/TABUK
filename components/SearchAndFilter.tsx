

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { SearchIcon, ArrowUpTrayIcon, UserPlusIcon, ArrowDownTrayIcon } from '../icons/Icons';

interface SearchAndFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onImport: (file: File) => void;
    onAddEmployeeClick: () => void;
    onExport: () => void;
}

export interface SearchAndFilterRef {
  focusSearchInput: () => void;
}

const SearchAndFilter = forwardRef<SearchAndFilterRef, SearchAndFilterProps>(({
    searchTerm,
    setSearchTerm,
    onImport,
    onAddEmployeeClick,
    onExport
}, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focusSearchInput: () => {
            searchInputRef.current?.focus();
        },
    }));

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImport(file);
        }
        if(event.target) {
            event.target.value = '';
        }
    };
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-200 mt-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                 <button
                    onClick={onAddEmployeeClick}
                    className="p-2.5 rounded-lg w-full sm:w-auto flex items-center justify-center transition-all duration-200 font-semibold bg-primary text-white hover:bg-primary-dark transform hover:-translate-y-0.5"
                    title="إضافة موظف جديد"
                >
                    <UserPlusIcon className="h-5 w-5 ml-2" />
                    إضافة
                </button>
                <div className="relative w-full flex-grow">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="ابحث بالاسم، الرقم الوظيفي، السجل، أو المركز..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleImportClick}
                        className="p-2.5 rounded-lg flex-1 sm:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 transform hover:-translate-y-0.5"
                        title="استيراد الموظفين من ملف Excel"
                    >
                        <ArrowUpTrayIcon className="h-5 w-5 ml-2" />
                        <span className="hidden sm:inline">استيراد</span>
                    </button>
                     <button
                        onClick={onExport}
                        className="p-2.5 rounded-lg flex-1 sm:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-accent/10 text-accent-dark hover:bg-accent/20 dark:bg-accent/20 dark:text-accent-light dark:hover:bg-accent/30 transform hover:-translate-y-0.5"
                        title="تصدير النتائج الحالية"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5 ml-2" />
                        <span className="hidden sm:inline">تصدير</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".xlsx, .xls"
                    />
                </div>
            </div>
        </div>
    );
});

export default SearchAndFilter;