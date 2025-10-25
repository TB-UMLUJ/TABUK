
import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { StarIcon, SearchIcon, ArrowUpTrayIcon, UserPlusIcon } from '../icons/Icons';

interface SearchAndFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    departmentFilter: string;
    setDepartmentFilter: (dep: string) => void;
    showFavorites: boolean;
    setShowFavorites: (show: boolean) => void;
    departments: string[];
    favoritesCount: number;
    onImport: (file: File) => void;
    onAddEmployeeClick: () => void;
}

export interface SearchAndFilterRef {
  focusSearchInput: () => void;
}

const SearchAndFilter = forwardRef<SearchAndFilterRef, SearchAndFilterProps>(({
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    showFavorites,
    setShowFavorites,
    departments,
    favoritesCount,
    onImport,
    onAddEmployeeClick
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
        // Reset file input to allow importing the same file again
        if(event.target) {
            event.target.value = '';
        }
    };
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-200 mt-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-center">
                <div className="relative sm:col-span-2 md:col-span-2">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="ابحث بالاسم, المسمى الوظيفي..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                </div>
                <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="p-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-primary dark:hover:border-primary-light transition-colors"
                >
                    {departments.map(dep => (
                        <option key={dep} value={dep}>{dep === 'all' ? 'جميع القطاعات' : dep}</option>
                    ))}
                </select>
                <button
                    onClick={() => setShowFavorites(!showFavorites)}
                    className={`p-2.5 rounded-lg flex items-center justify-center transition-all duration-200 font-semibold transform hover:-translate-y-0.5 ${
                        showFavorites ? 'bg-favorite text-black shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    <StarIcon className={`h-5 w-5 ml-2 ${showFavorites ? 'text-black' : 'text-favorite'}`} />
                    المفضلة ({favoritesCount})
                </button>
                 <button
                    onClick={onAddEmployeeClick}
                    className="p-2.5 rounded-lg hidden md:flex items-center justify-center transition-all duration-200 font-semibold bg-primary text-white hover:bg-primary-dark transform hover:-translate-y-0.5"
                    title="إضافة موظف جديد"
                >
                    <UserPlusIcon className="h-5 w-5 ml-2" />
                    إضافة
                </button>
                 <button
                    onClick={handleImportClick}
                    className="p-2.5 rounded-lg flex items-center justify-center transition-all duration-200 font-semibold bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 transform hover:-translate-y-0.5"
                    title="استيراد الموظفين من ملف Excel"
                >
                    <ArrowUpTrayIcon className="h-5 w-5 ml-2" />
                    استيراد
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".xlsx, .xls"
                />
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center md:text-right dark:text-gray-400">
                <span className="font-bold">للاستيراد:</span> يجب أن يتضمن الملف على الأقل الأعمدة التالية: الرقم الوظيفي, الاسم باللغة العربية, المسمى الوظيفي, القطاع.
            </p>
        </div>
    );
});

export default SearchAndFilter;
