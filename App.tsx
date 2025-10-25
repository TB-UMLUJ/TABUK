
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';
import { Employee, OfficeContact, Task, Transaction } from './types';
import Header from './components/Header';
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
    
    // Data State
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [officeContacts, setOfficeContacts] = useState<OfficeContact[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

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

    // --- Data Fetching from Supabase ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [
                    { data: employeesData, error: employeesError },
                    { data: contactsData, error: contactsError },
                    { data: tasksData, error: tasksError },
                    { data: transactionsData, error: transactionsError },
                    { data: favoritesData, error: favoritesError }
                ] = await Promise.all([
                    supabase.from('employees').select('*').order('full_name_ar', { ascending: true }),
                    supabase.from('office_contacts').select('*').order('name', { ascending: true }),
                    supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false }),
                    supabase.from('transactions').select('*').order('date', { ascending: false }),
                    supabase.from('employee_favorites').select('employee_id')
                ]);

                if (employeesError) throw employeesError;
                if (contactsError) throw contactsError;
                if (tasksError) throw tasksError;
                if (transactionsError) throw transactionsError;
                if (favoritesError) throw favoritesError;

                setEmployees(employeesData || []);
                setOfficeContacts(contactsData || []);
                setTasks(tasksData || []);
                setTransactions(transactionsData || []);
                setFavorites(favoritesData ? favoritesData.map((f: any) => f.employee_id) : []);

            } catch (error) {
                console.error("Error fetching data:", error);
                const postgrestError = error as PostgrestError;
                addToast(`فشل في جلب البيانات: ${postgrestError.message}`, 'error');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, addToast]);


    const toggleFavorite = async (employeeId: number) => {
        const isCurrentlyFavorite = favorites.includes(employeeId);
        
        if (isCurrentlyFavorite) {
            const { error } = await supabase.from('employee_favorites').delete().eq('employee_id', employeeId);
            if (error) {
                addToast('خطأ في إزالة من المفضلة', 'error');
            } else {
                setFavorites(prev => prev.filter(id => id !== employeeId));
            }
        } else {
            const { error } = await supabase.from('employee_favorites').insert({ employee_id: employeeId });
            if (error) {
                addToast('خطأ في الإضافة إلى المفضلة', 'error');
            } else {
                setFavorites(prev => [...prev, employeeId]);
            }
        }
    };

    const departments = useMemo(() => ['all', ...Array.from(new Set(employees.map(e => e.department)))], [employees]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            const matchesSearch = searchTerm === '' ||
                employee.full_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.full_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
            const matchesFavorites = !showFavorites || favorites.includes(employee.id);

            return matchesSearch && matchesDepartment && matchesFavorites;
        }).sort((a, b) => a.full_name_ar.localeCompare(b.full_name_ar, 'ar'));
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
    const handleSaveEmployee = async (employeeData: Omit<Employee, 'id'> & { id?: number }) => {
        const { data, error } = await supabase.from('employees').upsert(employeeData).select();

        if (error) {
            addToast(`خطأ في حفظ الموظف: ${error.message}`, 'error');
        } else if (data) {
            if (employeeData.id) {
                setEmployees(prev => prev.map(emp => (emp.id === data[0].id ? data[0] : emp)));
            } else {
                setEmployees(prev => [...prev, data[0]].sort((a, b) => a.full_name_ar.localeCompare(b.full_name_ar, 'ar')));
            }
            addToast(employeeData.id ? 'تم تحديث الموظف بنجاح!' : 'تمت إضافة الموظف بنجاح!', 'success');
            setShowAddEmployeeModal(false);
            setEmployeeToEdit(null);
        }
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

    const handleDeleteEmployee = useCallback(async (employeeId: number) => {
        const { error } = await supabase.from('employees').delete().eq('id', employeeId);
        if (error) {
            addToast(`خطأ في حذف الموظف: ${error.message}`, 'error');
        } else {
            setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
            setSelectedEmployee(null);
            addToast('تم حذف الموظف بنجاح.', 'success');
        }
    }, [addToast]);

    // --- Office Contact Handlers ---
    const handleOpenEditContactModal = (contact: OfficeContact) => {
        setContactToEdit(contact);
    };

    const handleSaveOfficeContact = async (contactData: OfficeContact) => {
        const { data, error } = await supabase.from('office_contacts').update(contactData).eq('id', contactData.id).select();
        if (error) {
            addToast(`خطأ في تحديث المكتب: ${error.message}`, 'error');
        } else if (data) {
            setOfficeContacts(prev => prev.map(c => (c.id === data[0].id ? data[0] : c)));
            addToast(`تم تحديث بيانات مكتب "${data[0].name}" بنجاح.`, 'success');
            setContactToEdit(null);
        }
    };

    // --- Task Handlers ---
    const handleSaveTask = async (taskData: Omit<Task, 'id'> & { id?: number }) => {
        const { data, error } = await supabase.from('tasks').upsert(taskData).select();
        if (error) {
            addToast(`خطأ في حفظ المهمة: ${error.message}`, 'error');
        } else if (data) {
            if (taskData.id) {
                setTasks(prev => prev.map(t => (t.id === data[0].id ? data[0] : t)));
            } else {
                setTasks(prev => [...prev, data[0]]);
            }
            addToast(taskData.id ? 'تم تحديث المهمة بنجاح!' : 'تمت إضافة المهمة بنجاح!', 'success');
            setShowAddTaskModal(false);
            setTaskToEdit(null);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) {
            addToast(`خطأ في حذف المهمة: ${error.message}`, 'error');
        } else {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            addToast('تم حذف المهمة.', 'success');
        }
    };

    const handleToggleTaskCompletion = async (taskId: number) => {
        const taskToToggle = tasks.find(t => t.id === taskId);
        if (!taskToToggle) return;
        
        const { error } = await supabase.from('tasks').update({ is_completed: !taskToToggle.is_completed }).eq('id', taskId);
        if (error) {
            addToast(`خطأ في تحديث حالة المهمة: ${error.message}`, 'error');
        } else {
            setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, is_completed: !t.is_completed } : t)));
        }
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
    const handleSaveTransaction = async (transactionData: Omit<Transaction, 'id'> & { id?: number }) => {
        const { data, error } = await supabase.from('transactions').upsert(transactionData).select();
        if (error) {
             addToast(`خطأ في حفظ المعاملة: ${error.message}`, 'error');
        } else if (data) {
            if (transactionData.id) {
                setTransactions(prev => prev.map(t => (t.id === data[0].id ? data[0] : t)));
            } else {
                setTransactions(prev => [...prev, data[0]]);
            }
            addToast(transactionData.id ? 'تم تحديث المعاملة بنجاح!' : 'تمت إضافة المعاملة بنجاح!', 'success');
            setShowAddTransactionModal(false);
            setTransactionToEdit(null);
        }
    };

    const handleDeleteTransaction = async (transactionId: number) => {
        const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
        if(error) {
            addToast(`خطأ في حذف المعاملة: ${error.message}`, 'error');
        } else {
            setTransactions(prev => prev.filter(t => t.id !== transactionId));
            setSelectedTransaction(null);
            addToast('تم حذف المعاملة.', 'success');
        }
    };

    const handleOpenAddTransactionModal = () => {
        setTransactionToEdit(null);
        setShowAddTransactionModal(true);
    };

    const handleOpenEditTransactionModal = (transaction: Transaction) => {
        setSelectedTransaction(null);
        setTransactionToEdit(transaction);
        setShowAddTransactionModal(true);
    };

    // --- Import Handler ---
    const handleImport = (file: File) => {
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[];

                if (json.length === 0) {
                    addToast("الملف فارغ أو لا يحتوي على بيانات.", 'warning');
                    setIsImporting(false);
                    return;
                }
                
                const header = Object.keys(json[0]);
                type EmployeeKey = keyof Employee;
                type ColumnMap = { [key in EmployeeKey]?: string | null };

                const columnMap: ColumnMap = {};
                const aliases: { [key in keyof Omit<Employee, 'id'>]: string[] } = {
                    employee_id: ['الرقم الوظيفي', 'employeeid', 'id', 'رقم الموظف', 'الرقم التعريفي'],
                    full_name_ar: ['الاسم باللغة العربية', 'الاسم الكامل (عربي)', 'الاسم', 'fullnamear', 'arabic name', 'الاسم بالعربي', 'اسم الموظف'],
                    full_name_en: ['الاسم باللغة الانجليزية', 'الاسم الكامل (انجليزي)', 'fullnameen', 'english name', 'الاسم بالانجليزي'],
                    job_title: ['المسمى الوظيفي', 'jobtitle', 'الوظيفة', 'position', 'المنصب'],
                    department: ['القطاع', 'القسم', 'department', 'الإدارة'],
                    center: ['المركز', 'center'],
                    phone_direct: ['رقم الجوال', 'الهاتف المباشر', 'phonedirect', 'mobile', 'الجوال', 'phone'],
                    email: ['الايميل', 'البريد الإلكتروني', 'email'],
                    national_id: ['السجل المدني / الإقامة', 'nationalid', 'السجل المدني', 'الإقامة', 'رقم الهوية'],
                    nationality: ['الجنسية', 'nationality'],
                    gender: ['الجنس', 'gender', 'النوع'],
                    date_of_birth: ['تاريخ الميلاد', 'dateofbirth', 'dob'],
                    classification_id: ['رقم التصنيف', 'classificationid']
                };

                for (const key in aliases) {
                    const typedKey = key as keyof typeof aliases;
                    const possibleNames = aliases[typedKey];
                    const foundHeader = header.find(h => possibleNames.some(p => h.toLowerCase().trim() === p.toLowerCase().trim()));
                    if (foundHeader) {
                        columnMap[typedKey] = foundHeader;
                    }
                }
                
                const requiredKeys: (keyof typeof aliases)[] = ['employee_id', 'full_name_ar', 'job_title', 'department'];
                const missingHeaders = requiredKeys.filter(key => !columnMap[key]).map(key => aliases[key][0]);

                if (missingHeaders.length > 0) {
                    addToast(`الملف غير صالح. الأعمدة الأساسية مفقودة: ${missingHeaders.join(', ')}`, 'error');
                    setIsImporting(false);
                    return;
                }

                const mappedEmployees = json.map((row: any) => {
                    const employee_id = String(row[columnMap.employee_id!] || '').trim();
                    if (!employee_id || !row[columnMap.full_name_ar!]) return null;

                    const parseDate = (rawDate: any): string | undefined => {
                        if (!rawDate) return undefined;
                        if (rawDate instanceof Date) return rawDate.toISOString().split('T')[0];
                        if (typeof rawDate === 'string' || typeof rawDate === 'number') {
                             const parsedDate = new Date(rawDate);
                             if (!isNaN(parsedDate.getTime())) {
                                 if (typeof rawDate === 'number') {
                                      // Handle Excel's numeric date format
                                      return new Date(Date.UTC(0, 0, rawDate - 1)).toISOString().split('T')[0];
                                 }
                                 return parsedDate.toISOString().split('T')[0];
                             }
                        }
                        return undefined;
                    };
                    
                    const dobISO = parseDate(columnMap.date_of_birth ? row[columnMap.date_of_birth] : undefined);

                    return {
                        employee_id,
                        full_name_ar: row[columnMap.full_name_ar!],
                        job_title: row[columnMap.job_title!],
                        department: row[columnMap.department!],
                        full_name_en: columnMap.full_name_en ? row[columnMap.full_name_en] : '',
                        phone_direct: columnMap.phone_direct ? String(row[columnMap.phone_direct] || '') : '',
                        email: columnMap.email ? row[columnMap.email] : '',
                        center: columnMap.center ? String(row[columnMap.center] || '') : undefined,
                        national_id: columnMap.national_id ? String(row[columnMap.national_id] || '') : undefined,
                        nationality: columnMap.nationality ? String(row[columnMap.nationality] || '') : undefined,
                        gender: columnMap.gender ? String(row[columnMap.gender] || '') : undefined,
                        date_of_birth: dobISO,
                        classification_id: columnMap.classification_id ? String(row[columnMap.classification_id] || '') : undefined,
                    };
                }).filter(Boolean) as (Omit<Employee, 'id'> & { id?: number })[];

                // --- Deduplication Logic ---
                // Use a Map to automatically handle duplicates, keeping the last seen entry for any given employee_id.
                const uniqueEmployeesMap = new Map<string, typeof mappedEmployees[0]>();
                mappedEmployees.forEach(emp => {
                    if (emp && emp.employee_id) {
                        uniqueEmployeesMap.set(emp.employee_id, emp);
                    }
                });

                const employeesToUpsert = Array.from(uniqueEmployeesMap.values());
                const duplicatesCount = mappedEmployees.length - employeesToUpsert.length;

                if (duplicatesCount > 0) {
                    addToast(`تم العثور على ${duplicatesCount} سجل مكرر وتجاهلهم.`, 'warning');
                }
                // --- End Deduplication Logic ---


                if (employeesToUpsert.length > 0) {
                    const { error: upsertError } = await supabase.from('employees').upsert(employeesToUpsert, { onConflict: 'employee_id' });
                    
                    if (upsertError) {
                        throw upsertError;
                    }

                    addToast(`تمت معالجة ${employeesToUpsert.length} سجلاً بنجاح.`, 'success');

                    // Refresh data from DB
                    const { data: updatedEmployees, error: fetchError } = await supabase.from('employees').select('*').order('full_name_ar');
                    if (!fetchError && updatedEmployees) {
                        setEmployees(updatedEmployees);
                    }
                } else {
                    addToast("لم يتم العثور على بيانات صالحة للاستيراد.", 'warning');
                }

            } catch (error) {
                console.error("Error processing Excel file:", error);
                const postgrestError = error as PostgrestError;
                addToast(`حدث خطأ أثناء معالجة الملف: ${postgrestError.message}`, 'error');
            } finally {
                setIsImporting(false);
            }
        };
        reader.onerror = () => {
            setIsImporting(false);
            addToast('فشل في قراءة الملف.', 'error');
        };
        reader.readAsArrayBuffer(file);
    };
    
    if (showWelcome) return <WelcomeScreen />;
    if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="h-16 w-16 mx-auto animate-spin rounded-full border-4 border-gray-300 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">جاري تحميل البيانات...</p>
                </div>
            </div>
        );
    }

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
