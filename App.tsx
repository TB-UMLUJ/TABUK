

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Employee, OfficeContact, Task, Transaction } from './types';
import { mockEmployees } from './data/mockEmployees';
import { mockOfficeDirectory } from './data/mockOfficeDirectory';
import { mockTasks } from './data/mockTasks';
import { mockTransactions } from './data/mockTransactions';
import Header from './components/Header';
// Fix: Import SearchAndFilterRef to resolve type error.
import SearchAndFilter, { SearchAndFilterRef } from './components/SearchAndFilter';
import EmployeeList from './components/EmployeeList';
import EmployeeProfileModal from './components/EmployeeProfileModal';
import LoginScreen from './components/LoginScreen';
import WelcomeScreen from './components/WelcomeScreen';
import AboutModal from './components/AboutModal';
import { useToast } from './contexts/ToastContext';
import Tabs from './components/Tabs';
import Dashboard from './components/Dashboard';
import AddEmployeeModal from './components/AddEmployeeModal';
import ImportLoadingModal from './ImportLoadingModal';
import BottomNavBar from './components/BottomNavBar';
import OfficeDirectory from './components/OfficeDirectory';
import EditOfficeContactModal from './EditOfficeContactModal';
import TasksView from './components/TasksView';
import AddTaskModal from './components/AddTaskModal';
import TransactionsView from './components/TransactionsView';
import AddTransactionModal from './components/AddTransactionModal';
import TransactionDetailModal from './components/TransactionDetailModal';


declare const XLSX: any;

const App: React.FC = () => {
    const { addToast } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return sessionStorage.getItem('isAuthenticated') === 'true';
    });
    const [showWelcome, setShowWelcome] = useState<boolean>(false);
    const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
    
    // Employee State
    const [employees, setEmployees] = useState<Employee[]>(() => {
        const saved = localStorage.getItem('employees');
        return saved ? JSON.parse(saved) : mockEmployees;
    });
    
    // Office Contacts State
    const [officeContacts, setOfficeContacts] = useState<OfficeContact[]>(() => {
        const saved = localStorage.getItem('officeContacts');
        return saved ? JSON.parse(saved) : mockOfficeDirectory;
    });

    // Tasks State
    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : mockTasks;
    });
    
    // Transactions State
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem('transactions');
        return saved ? JSON.parse(saved) : mockTransactions;
    });


    // UI & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [showFavorites, setShowFavorites] = useState(false);
    const [activeTab, setActiveTab] = useState<'directory' | 'dashboard' | 'officeDirectory' | 'tasks' | 'transactions'>('directory');
    const [isImporting, setIsImporting] = useState<boolean>(false);
    
    // Modal State
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const [contactToEdit, setContactToEdit] = useState<OfficeContact | null>(null);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    
    const searchAndFilterRef = useRef<SearchAndFilterRef>(null);

    const [favorites, setFavorites] = useState<number[]>(() => {
        const savedFavorites = localStorage.getItem('employee_favorites');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });
    
    // --- LocalStorage useEffects ---
    useEffect(() => { localStorage.setItem('employee_favorites', JSON.stringify(favorites)); }, [favorites]);
    useEffect(() => { localStorage.setItem('employees', JSON.stringify(employees)); }, [employees]);
    useEffect(() => { localStorage.setItem('officeContacts', JSON.stringify(officeContacts)); }, [officeContacts]);
    useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)); }, [tasks]);
    useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);


    const toggleFavorite = (employeeId: number) => {
        setFavorites(prev => 
            prev.includes(employeeId) 
                ? prev.filter(id => id !== employeeId) 
                : [...prev, employeeId]
        );
    };

    const departments = useMemo(() => ['all', ...Array.from(new Set(employees.map(e => e.department)))], [employees]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            const matchesSearch = searchTerm === '' ||
                employee.fullNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.fullNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
            const matchesFavorites = !showFavorites || favorites.includes(employee.id);

            return matchesSearch && matchesDepartment && matchesFavorites;
        }).sort((a, b) => a.fullNameAr.localeCompare(b.fullNameAr, 'ar'));
    }, [employees, searchTerm, departmentFilter, showFavorites, favorites]);

    // --- Authentication Handlers ---
    const handleLogin = () => {
        setShowWelcome(true);
        setTimeout(() => {
            sessionStorage.setItem('isAuthenticated', 'true');
            setIsAuthenticated(true);
            setShowWelcome(false);
        }, 4000);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
    };

    // --- Employee Handlers ---
    const handleSaveEmployee = (employeeData: Omit<Employee, 'id'> & { id?: number }) => {
        if (employeeData.id) {
            setEmployees(prev => prev.map(emp => (emp.id === employeeData.id ? { ...emp, ...employeeData } as Employee : emp)));
            addToast('تم تحديث بيانات الموظف بنجاح!', 'success');
        } else {
            setEmployees(prev => {
                const maxId = Math.max(0, ...prev.map(e => e.id));
                const newEmployee: Employee = { id: maxId + 1, ...employeeData };
                return [...prev, newEmployee].sort((a, b) => a.fullNameAr.localeCompare(b.fullNameAr, 'ar'));
            });
            addToast('تمت إضافة الموظف بنجاح!', 'success');
        }
        setShowAddEmployeeModal(false);
        setEmployeeToEdit(null);
    };

    const handleOpenAddModal = () => {
        setEmployeeToEdit(null);
        setShowAddEmployeeModal(true);
    };

    const handleOpenEditModal = (employee: Employee) => {
        setSelectedEmployee(null);
        setEmployeeToEdit(employee);
        setShowAddEmployeeModal(true);
    };

    const handleDeleteEmployee = useCallback((employeeId: number) => {
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
        setSelectedEmployee(null); // Close the modal
        addToast('تم حذف الموظف بنجاح.', 'success');
    }, [addToast]);

    // --- Office Contact Handlers ---
    const handleOpenEditContactModal = (contact: OfficeContact) => {
        setContactToEdit(contact);
    };

    const handleSaveOfficeContact = (contactData: OfficeContact) => {
        setOfficeContacts(prev => prev.map(c => (c.id === contactData.id ? contactData : c)));
        addToast(`تم تحديث بيانات مكتب "${contactData.name}" بنجاح.`, 'success');
        setContactToEdit(null); // Close modal
    };

    // --- Task Handlers ---
    const handleSaveTask = (taskData: Omit<Task, 'id'> & { id?: number }) => {
        if (taskData.id) {
            setTasks(prev => prev.map(t => (t.id === taskData.id ? { ...t, ...taskData } as Task : t)));
            addToast('تم تحديث المهمة بنجاح!', 'success');
        } else {
            setTasks(prev => {
                const maxId = Math.max(0, ...prev.map(t => t.id));
                const newTask: Task = { id: maxId + 1, ...taskData, isCompleted: false };
                return [...prev, newTask];
            });
            addToast('تمت إضافة المهمة بنجاح!', 'success');
        }
        setShowAddTaskModal(false);
        setTaskToEdit(null);
    };

    const handleDeleteTask = (taskId: number) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        addToast('تم حذف المهمة.', 'success');
    };

    const handleToggleTaskCompletion = (taskId: number) => {
        setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)));
    };
    
    const handleOpenAddTaskModal = () => {
        setTaskToEdit(null);
        setShowAddTaskModal(true);
    };

    const handleOpenEditTaskModal = (task: Task) => {
        setTaskToEdit(task);
        setShowAddTaskModal(true);
    };

    // --- Transaction Handlers ---
    const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'> & { id?: number }) => {
        if (transactionData.id) {
            setTransactions(prev => prev.map(t => (t.id === transactionData.id ? { ...t, ...transactionData } as Transaction : t)));
            addToast('تم تحديث المعاملة بنجاح!', 'success');
        } else {
            setTransactions(prev => {
                const maxId = Math.max(0, ...prev.map(t => t.id));
                const newTransaction: Transaction = { id: maxId + 1, ...transactionData } as Transaction;
                return [...prev, newTransaction];
            });
            addToast('تمت إضافة المعاملة بنجاح!', 'success');
        }
        setShowAddTransactionModal(false);
        setTransactionToEdit(null);
    };

    const handleDeleteTransaction = (transactionId: number) => {
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        setSelectedTransaction(null); // Close detail modal if open
        addToast('تم حذف المعاملة.', 'success');
    };

    const handleOpenAddTransactionModal = () => {
        setTransactionToEdit(null);
        setShowAddTransactionModal(true);
    };

    const handleOpenEditTransactionModal = (transaction: Transaction) => {
        setSelectedTransaction(null); // Close detail view first
        setTransactionToEdit(transaction);
        setShowAddTransactionModal(true);
    };

    // --- Import Handler ---
    const handleImport = (file: File) => {
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            setTimeout(() => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[];
                    // ... (rest of the complex import logic remains unchanged)
                    if (json.length === 0) {
                        addToast("الملف فارغ أو لا يحتوي على بيانات.", 'warning');
                        return;
                    }

                    const header = Object.keys(json[0]);
                    type EmployeeKey = keyof Employee;
                    type ColumnMap = { [key in EmployeeKey]?: string | null };

                    const columnMap: ColumnMap = {};

                     const aliases: { [key in keyof Omit<Employee, 'id'>]: string[] } = {
                        employeeId: ['الرقم الوظيفي', 'employeeid', 'id', 'رقم الموظف', 'الرقم التعريفي'],
                        fullNameAr: ['الاسم باللغة العربية', 'الاسم الكامل (عربي)', 'الاسم', 'fullnamear', 'arabic name', 'الاسم بالعربي', 'اسم الموظف'],
                        fullNameEn: ['الاسم باللغة الانجليزية', 'الاسم الكامل (انجليزي)', 'fullnameen', 'english name', 'الاسم بالانجليزي'],
                        jobTitle: ['المسمى الوظيفي', 'jobtitle', 'الوظيفة', 'position', 'المنصب'],
                        department: ['القطاع', 'القسم', 'department', 'الإدارة'],
                        center: ['المركز', 'center'],
                        phoneDirect: ['رقم الجوال', 'الهاتف المباشر', 'phonedirect', 'mobile', 'الجوال', 'phone'],
                        email: ['الايميل', 'البريد الإلكتروني', 'email'],
                        nationalId: ['السجل المدني / الإقامة', 'nationalid', 'السجل المدني', 'الإقامة', 'رقم الهوية'],
                        nationality: ['الجنسية', 'nationality'],
                        gender: ['الجنس', 'gender', 'النوع'],
                        dateOfBirth: ['تاريخ الميلاد', 'dateofbirth', 'dob'],
                        classificationId: ['رقم التصنيف', 'classificationid']
                    };

                    for (const key in aliases) {
                        const typedKey = key as keyof typeof aliases;
                        const possibleNames = aliases[typedKey];
                        const foundHeader = header.find(h => possibleNames.some(p => h.toLowerCase().trim() === p.toLowerCase().trim()));
                        if (foundHeader) {
                            columnMap[typedKey] = foundHeader;
                        }
                    }
                    
                    const requiredKeys: (keyof typeof aliases)[] = ['employeeId', 'fullNameAr', 'jobTitle', 'department'];
                    const missingHeaders = requiredKeys
                        .filter(key => !columnMap[key])
                        .map(key => aliases[key][0]);

                    if (missingHeaders.length > 0) {
                        addToast(`الملف غير صالح. الأعمدة الأساسية التالية مفقودة: ${missingHeaders.join(', ')}`, 'error');
                        return;
                    }

                    let addedCount = 0;
                    let updatedCount = 0;

                    setEmployees(prevEmployees => {
                        const employeesCopy = [...prevEmployees];
                        let maxId = Math.max(0, ...employeesCopy.map(e => e.id));

                        json.forEach((row: any) => {
                            const employeeId = String(row[columnMap.employeeId!] || '').trim();
                            if (!employeeId || !row[columnMap.fullNameAr!]) return;
                            
                            const parseDate = (rawDate: any): string | undefined => {
                                if (!rawDate) return undefined;
                                if (rawDate instanceof Date) return rawDate.toISOString();
                                if (typeof rawDate === 'string' || typeof rawDate === 'number') {
                                     const parsedDate = new Date(rawDate);
                                     if (!isNaN(parsedDate.getTime())) {
                                         if (typeof rawDate === 'number') {
                                              return new Date(Date.UTC(1899, 11, 30 + rawDate)).toISOString();
                                         }
                                         return parsedDate.toISOString();
                                     }
                                }
                                return undefined;
                            };
                            
                            const dobISO = parseDate(columnMap.dateOfBirth ? row[columnMap.dateOfBirth] : null);

                            const employeeDataFromRow = {
                                employeeId,
                                fullNameAr: row[columnMap.fullNameAr!],
                                jobTitle: row[columnMap.jobTitle!],
                                department: row[columnMap.department!],
                                fullNameEn: columnMap.fullNameEn ? row[columnMap.fullNameEn] : '',
                                phoneDirect: columnMap.phoneDirect ? String(row[columnMap.phoneDirect] || '') : '',
                                email: columnMap.email ? row[columnMap.email] : '',
                                center: columnMap.center ? String(row[columnMap.center] || '') : undefined,
                                nationalId: columnMap.nationalId ? String(row[columnMap.nationalId] || '') : undefined,
                                nationality: columnMap.nationality ? String(row[columnMap.nationality] || '') : undefined,
                                gender: columnMap.gender ? String(row[columnMap.gender] || '') : undefined,
                                dateOfBirth: dobISO,
                                classificationId: columnMap.classificationId ? String(row[columnMap.classificationId] || '') : undefined,
                            };

                            const existingEmployeeIndex = employeesCopy.findIndex(emp => emp.employeeId === employeeId);

                            if (existingEmployeeIndex !== -1) {
                                const existingEmployee = employeesCopy[existingEmployeeIndex];
                                employeesCopy[existingEmployeeIndex] = { ...existingEmployee, ...employeeDataFromRow, fullNameEn: employeeDataFromRow.fullNameEn || existingEmployee.fullNameEn };
                                updatedCount++;
                            } else {
                                maxId++;
                                const newEmployee: Employee = { id: maxId, ...employeeDataFromRow, fullNameEn: employeeDataFromRow.fullNameEn || `Employee #${maxId}` };
                                employeesCopy.push(newEmployee);
                                addedCount++;
                            }
                        });

                        if (addedCount > 0 || updatedCount > 0) {
                            addToast(`تم إضافة ${addedCount} وتحديث ${updatedCount} موظفاً بنجاح.`, 'success');
                        } else {
                            addToast("لم يتم العثور على بيانات جديدة.", 'warning');
                        }
                        
                        return employeesCopy.sort((a, b) => a.fullNameAr.localeCompare(b.fullNameAr, 'ar'));
                    });
                } catch (error) {
                    console.error("Error parsing Excel file:", error);
                    addToast("حدث خطأ أثناء معالجة الملف.", 'error');
                } finally {
                    setIsImporting(false);
                }
            }, 50);
        };
        reader.onerror = () => {
            setIsImporting(false);
            addToast('فشل في قراءة الملف.', 'error');
        };
        reader.readAsArrayBuffer(file);
    };
    
    if (showWelcome) return <WelcomeScreen />;
    if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;
    
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 animate-fade-in dark:bg-gray-900 dark:text-gray-300">
            <Header 
                onLogout={handleLogout}
                onOpenAbout={() => setShowAboutModal(true)}
            />
             <main className="container mx-auto p-4 md:p-6 pb-24 md:pb-6">
                <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                
                {activeTab === 'directory' && (
                    <>
                        <SearchAndFilter
                            ref={searchAndFilterRef}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            departmentFilter={departmentFilter}
                            setDepartmentFilter={setDepartmentFilter}
                            showFavorites={showFavorites}
                            setShowFavorites={setShowFavorites}
                            departments={departments}
                            favoritesCount={favorites.length}
                            onImport={handleImport}
                            onAddEmployeeClick={handleOpenAddModal}
                        />
                        <EmployeeList 
                            employees={filteredEmployees} 
                            onSelectEmployee={setSelectedEmployee}
                            favorites={favorites}
                            onToggleFavorite={toggleFavorite}
                        />
                    </>
                )}

                {activeTab === 'officeDirectory' && (
                    <OfficeDirectory 
                        contacts={officeContacts} 
                        onEditContact={handleOpenEditContactModal}
                    />
                )}

                {activeTab === 'tasks' && (
                    <TasksView
                        tasks={tasks}
                        onAddTask={handleOpenAddTaskModal}
                        onEditTask={handleOpenEditTaskModal}
                        onDeleteTask={handleDeleteTask}
                        onToggleComplete={handleToggleTaskCompletion}
                    />
                )}

                {activeTab === 'transactions' && (
                    <TransactionsView 
                        transactions={transactions}
                        onAddTransaction={handleOpenAddTransactionModal}
                        onEditTransaction={handleOpenEditTransactionModal}
                        onDeleteTransaction={handleDeleteTransaction}
                        onSelectTransaction={setSelectedTransaction}
                    />
                )}

                {activeTab === 'dashboard' && <Dashboard employees={employees} />}
            </main>
            
            <BottomNavBar 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onAddEmployeeClick={handleOpenAddModal}
            />
            
            {/* --- Modals --- */}
            <EmployeeProfileModal 
                isOpen={!!selectedEmployee}
                employee={selectedEmployee} 
                onClose={() => setSelectedEmployee(null)}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteEmployee}
            />
            <AboutModal 
                isOpen={showAboutModal}
                onClose={() => setShowAboutModal(false)}
            />
            <AddEmployeeModal
                isOpen={showAddEmployeeModal}
                onClose={() => { setShowAddEmployeeModal(false); setEmployeeToEdit(null); }}
                onSave={handleSaveEmployee}
                employeeToEdit={employeeToEdit}
            />
             <EditOfficeContactModal
                isOpen={!!contactToEdit}
                onClose={() => setContactToEdit(null)}
                onSave={handleSaveOfficeContact}
                contactToEdit={contactToEdit}
            />
            <AddTaskModal 
                isOpen={showAddTaskModal}
                onClose={() => { setShowAddTaskModal(false); setTaskToEdit(null); }}
                onSave={handleSaveTask}
                taskToEdit={taskToEdit}
            />
            <AddTransactionModal 
                isOpen={showAddTransactionModal}
                onClose={() => { setShowAddTransactionModal(false); setTransactionToEdit(null); }}
                onSave={handleSaveTransaction}
                transactionToEdit={transactionToEdit}
            />
            <TransactionDetailModal
                isOpen={!!selectedTransaction}
                transaction={selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                onEdit={handleOpenEditTransactionModal}
                onDelete={handleDeleteTransaction}
            />
            <ImportLoadingModal isOpen={isImporting} />
        </div>
    );
};

export default App;
