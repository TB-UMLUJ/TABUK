

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
import { useToast } from './contexts/ToastContext';
import Tabs from './components/Tabs';
import OrganizationalChartView from './components/OrganizationalChartView';
import AddEmployeeModal from './components/AddEmployeeModal';
import ImportLoadingModal from './ImportLoadingModal';
import BottomNavBar from './components/BottomNavBar';
import OfficeDirectory from './components/OfficeDirectory';
import AddOfficeContactModal from './components/AddOfficeContactModal';
import TasksView from './components/TasksView';
import AddTaskModal from './components/AddTaskModal';
import TransactionsView from './components/TransactionsView';
import AddTransactionModal from './components/AddTransactionModal';
import TransactionDetailModal from './components/TransactionDetailModal';
import ConfirmationModal from './components/ConfirmationModal';
import { mockTasks } from './data/mockTasks';
import { mockTransactions } from './data/mockTransactions';
import SettingsScreen from './components/SettingsScreen';
import StatisticsView from './components/StatisticsView';
import PromotionalModal from './components/PromotionalModal';
import AdminPasswordModal from './components/AdminPasswordModal';


declare const XLSX: any;

const App: React.FC = () => {
    const { addToast } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return sessionStorage.getItem('isAuthenticated') === 'true';
    });
    const [showWelcome, setShowWelcome] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState(false);
    
    // Data State
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [officeContacts, setOfficeContacts] = useState<OfficeContact[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // UI & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'directory' | 'orgChart' | 'officeDirectory' | 'tasks' | 'transactions' | 'statistics'>('directory');
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [visibleEmployeeCount, setVisibleEmployeeCount] = useState(10);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    // Modal State
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const [contactToEdit, setContactToEdit] = useState<OfficeContact | null>(null);
    const [showAddOfficeContactModal, setShowAddOfficeContactModal] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showPromoModal, setShowPromoModal] = useState<boolean>(false);
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });
    
    const [adminAction, setAdminAction] = useState<{ isOpen: boolean; onSuccess: () => void; }>({
        isOpen: false,
        onSuccess: () => {},
    });
    
    const searchAndFilterRef = useRef<SearchAndFilterRef>(null);
    const genericFileInputRef = useRef<HTMLInputElement>(null);
    const [importHandler, setImportHandler] = useState<(file: File) => void>(() => () => {});


    const requestAdminPermission = (onSuccess: () => void) => {
        setAdminAction({ isOpen: true, onSuccess });
    };
    
    const closeAdminModal = () => {
        setAdminAction({ isOpen: false, onSuccess: () => {} });
    };

    const requestConfirmation = (title: string, message: string, onConfirm: () => void) => {
        setConfirmation({ isOpen: true, title, message, onConfirm });
    };

    const closeConfirmation = () => {
        setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    };


    // --- Data Fetching and Seeding from Supabase ---
    useEffect(() => {
        const fetchDataAndSeed = async () => {
            setLoading(true);
            try {
                // Seed data if tables are empty
                const { count: tasksCount, error: tasksCountError } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
                if (tasksCountError) throw tasksCountError;

                if (tasksCount === 0) {
                    const tasksToInsert = mockTasks.map(({ id, ...rest }) => rest);
                    const { error: insertError } = await supabase.from('tasks').insert(tasksToInsert);
                    if (insertError) throw insertError;
                    addToast('بيانات أولية', 'تمت إضافة بيانات المهام بنجاح.', 'info');
                }

                const { count: transactionsCount, error: transactionsCountError } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
                if (transactionsCountError) throw transactionsCountError;
                
                if (transactionsCount === 0) {
                    const transactionsToInsert = mockTransactions.map(({ id, ...rest }) => rest);
                    const { error: insertError } = await supabase.from('transactions').insert(transactionsToInsert);
                    if (insertError) throw insertError;
                    addToast('بيانات أولية', 'تمت إضافة بيانات المعاملات بنجاح.', 'info');
                }

                // Fetch all data
                const [
                    { data: employeesData, error: employeesError },
                    { data: contactsData, error: contactsError },
                    { data: tasksData, error: tasksError },
                    { data: transactionsData, error: transactionsError },
                ] = await Promise.all([
                    supabase.from('employees').select('*').order('full_name_ar', { ascending: true }),
                    supabase.from('office_contacts').select('*').order('name', { ascending: true }),
                    supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false }),
                    supabase.from('transactions').select('*').order('date', { ascending: false }),
                ]);

                if (employeesError) throw employeesError;
                if (contactsError) throw contactsError;
                if (tasksError) throw tasksError;
                if (transactionsError) throw transactionsError;

                setEmployees(employeesData || []);
                setOfficeContacts(contactsData || []);
                setTasks(tasksData || []);
                setTransactions(transactionsData || []);

            } catch (error) {
                console.error("Error fetching or seeding data:", error);
                const postgrestError = error as PostgrestError;
                addToast('خطأ في الشبكة', `فشل في جلب البيانات: ${postgrestError.message}`, 'error');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchDataAndSeed();
        }
    }, [isAuthenticated, addToast]);


    useEffect(() => {
        setVisibleEmployeeCount(10);
    }, [searchTerm]);

    useEffect(() => {
        if (isAuthenticated) {
            const today = new Date().toISOString().slice(0, 10);
            const dismissedToday = localStorage.getItem('promoModalDismissedToday');
            
            if (dismissedToday !== today) {
                const timer = setTimeout(() => {
                    setShowPromoModal(true);
                }, 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [isAuthenticated]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            if (searchTerm === '') return true;
            const lowerCaseSearchTerm = searchTerm.toLowerCase();

            return (
                employee.full_name_ar.toLowerCase().includes(lowerCaseSearchTerm) ||
                employee.full_name_en.toLowerCase().includes(lowerCaseSearchTerm) ||
                employee.employee_id.toLowerCase().includes(lowerCaseSearchTerm) ||
                (employee.national_id && employee.national_id.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (employee.center && employee.center.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }).sort((a, b) => a.full_name_ar.localeCompare(b.full_name_ar, 'ar'));
    }, [employees, searchTerm]);

    const visibleEmployees = useMemo(
        () => filteredEmployees.slice(0, visibleEmployeeCount),
        [filteredEmployees, visibleEmployeeCount]
    );

    const hasMoreEmployees = visibleEmployeeCount < filteredEmployees.length;

    const loadMoreEmployees = useCallback(() => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);
        setTimeout(() => {
            setVisibleEmployeeCount(prev => prev + 10);
            setIsLoadingMore(false);
        }, 500);
    }, [isLoadingMore]);


    // --- Authentication Handlers ---
    const handleLogin = () => {
        sessionStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
        setShowWelcome(true);
        setTimeout(() => {
            setShowWelcome(false);
        }, 4000);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('isAuthenticated');
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
    };

    // --- Employee Handlers ---
    const handleSaveEmployee = async (employeeData: Omit<Employee, 'id'> & { id?: number }) => {
        const isEditing = !!employeeData.id;
        const { data, error } = await supabase.from('employees').upsert(employeeData).select();

        if (error) {
            addToast('خطأ', `فشل حفظ الموظف: ${error.message}`, 'error');
        } else if (data) {
            if (isEditing) {
                setEmployees(prev => prev.map(emp => (emp.id === data[0].id ? data[0] : emp)));
            } else {
                setEmployees(prev => [...prev, data[0]]);
            }
            addToast('نجاح', `تم ${isEditing ? 'تحديث' : 'إضافة'} الموظف بنجاح.`, 'success');
            setShowAddEmployeeModal(false);
            setEmployeeToEdit(null);
        }
    };

    const handleDeleteEmployee = async (employee: Employee) => {
        requestAdminPermission(() => {
            requestConfirmation(
                'تأكيد الحذف',
                `هل أنت متأكد من رغبتك في حذف الموظف "${employee.full_name_ar}"؟ لا يمكن التراجع عن هذا الإجراء.`,
                async () => {
                    const { error } = await supabase.from('employees').delete().eq('id', employee.id);
                    if (error) {
                        addToast('خطأ', `فشل حذف الموظف: ${error.message}`, 'error');
                    } else {
                        setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
                        addToast('تم الحذف', 'تم حذف الموظف بنجاح.', 'deleted');
                    }
                    setSelectedEmployee(null); // Close profile modal after deletion
                }
            );
        });
    };

    const handleImportEmployees = (file: File) => {
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                const newEmployees = json.map((row): Omit<Employee, 'id'> => ({
                    employee_id: String(row['الرقم الوظيفي'] || ''),
                    full_name_ar: String(row['الاسم باللغة العربية'] || ''),
                    full_name_en: String(row['الاسم باللغة الإنجليزية'] || ''),
                    job_title: String(row['المسمى الوظيفي'] || ''),
                    department: String(row['القطاع'] || ''),
                    center: String(row['المركز'] || ''),
                    phone_direct: String(row['رقم الجوال'] || ''),
                    email: String(row['البريد الإلكتروني'] || ''),
                    national_id: String(row['السجل المدني / الإقامة'] || ''),
                    nationality: String(row['الجنسية'] || ''),
                    gender: String(row['الجنس'] || ''),
                    date_of_birth: row['تاريخ الميلاد'] ? new Date((row['تاريخ الميلاد'] - (25567 + 1)) * 86400 * 1000).toISOString() : undefined,
                    classification_id: String(row['رقم التصنيف'] || ''),
                }));

                const { data: upsertedData, error } = await supabase.from('employees').upsert(newEmployees, { onConflict: 'employee_id' }).select();

                if (error) throw error;
                
                // Merge new data with existing state
                setEmployees(prev => {
                    const existingIds = new Set(prev.map(e => e.employee_id));
                    const trulyNew = upsertedData.filter(e => !existingIds.has(e.employee_id));
                    const updated = prev.map(e => upsertedData.find(u => u.employee_id === e.employee_id) || e);
                    return [...updated, ...trulyNew];
                });
                
                addToast('نجاح', `تم استيراد وتحديث ${upsertedData.length} موظف بنجاح.`, 'success');

            } catch (err: any) {
                console.error("Import error:", err);
                addToast('خطأ في الاستيراد', 'فشل استيراد الملف. تأكد من أن التنسيق صحيح.', 'error');
            } finally {
                setIsImporting(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };
    
    const handleExportEmployees = () => {
        requestAdminPermission(() => {
            const dataToExport = filteredEmployees.map(emp => ({
                'الرقم الوظيفي': emp.employee_id,
                'الاسم باللغة العربية': emp.full_name_ar,
                'الاسم باللغة الإنجليزية': emp.full_name_en,
                'المسمى الوظيفي': emp.job_title,
                'القطاع': emp.department,
                'المركز': emp.center,
                'رقم الجوال': emp.phone_direct,
                'البريد الإلكتروني': emp.email,
                'السجل المدني / الإقامة': emp.national_id,
                'الجنسية': emp.nationality,
                'الجنس': emp.gender,
                'تاريخ الميلاد': emp.date_of_birth ? new Date(emp.date_of_birth).toLocaleDateString('ar-SA') : '',
                'رقم التصنيف': emp.classification_id
            }));
            
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'الموظفين');
            XLSX.writeFile(workbook, 'employees_export.xlsx');
            addToast('تم التصدير', 'تم تصدير بيانات الموظفين بنجاح.', 'success');
        });
    };


    // --- Office Contact Handlers ---
    const handleSaveOfficeContact = async (contactData: Omit<OfficeContact, 'id'> & { id?: number }) => {
        const isEditing = !!contactData.id;
        const { data, error } = await supabase.from('office_contacts').upsert(contactData).select();
        
        if (error) {
            addToast('خطأ', `فشل حفظ جهة الاتصال: ${error.message}`, 'error');
        } else if (data) {
             if (isEditing) {
                setOfficeContacts(prev => prev.map(c => c.id === data[0].id ? data[0] : c));
            } else {
                setOfficeContacts(prev => [...prev, data[0]]);
            }
            addToast('نجاح', `تم ${isEditing ? 'تحديث' : 'إضافة'} جهة الاتصال بنجاح.`, 'success');
            setShowAddOfficeContactModal(false);
            setContactToEdit(null);
        }
    };

    const handleDeleteOfficeContact = async (contact: OfficeContact) => {
        requestAdminPermission(() => {
            requestConfirmation('تأكيد الحذف', `هل أنت متأكد من رغبتك في حذف "${contact.name}"؟`, async () => {
                const { error } = await supabase.from('office_contacts').delete().eq('id', contact.id);
                if (error) {
                    addToast('خطأ', `فشل الحذف: ${error.message}`, 'error');
                } else {
                    setOfficeContacts(prev => prev.filter(c => c.id !== contact.id));
                    addToast('تم الحذف', 'تم حذف جهة الاتصال بنجاح.', 'deleted');
                }
            });
        });
    };
    
    const handleImportOfficeContacts = (file: File) => {
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                const newContacts = json.map(row => ({
                    name: String(row['اسم المكتب'] || ''),
                    extension: String(row['التحويلة'] || ''),
                    location: String(row['الموقع'] || ''),
                    email: String(row['البريد الإلكتروني'] || ''),
                }));

                const { data: upsertedData, error } = await supabase.from('office_contacts').upsert(newContacts, { onConflict: 'name' }).select();

                if (error) throw error;

                setOfficeContacts(prev => {
                    const existingNames = new Set(prev.map(c => c.name));
                    const trulyNew = upsertedData.filter(c => !existingNames.has(c.name));
                    const updated = prev.map(c => upsertedData.find(u => u.name === c.name) || c);
                    return [...updated, ...trulyNew];
                });
                
                addToast('نجاح', `تم استيراد وتحديث ${upsertedData.length} جهة اتصال بنجاح.`, 'success');
            } catch (err) {
                console.error("Import error:", err);
                addToast('خطأ في الاستيراد', 'فشل استيراد الملف. تأكد من أن التنسيق صحيح.', 'error');
            } finally {
                setIsImporting(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleExportOfficeContacts = () => {
        requestAdminPermission(() => {
            const dataToExport = officeContacts.map(c => ({
                'اسم المكتب': c.name,
                'التحويلة': c.extension,
                'الموقع': c.location,
                'البريد الإلكتروني': c.email
            }));
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'تحويلات المكاتب');
            XLSX.writeFile(workbook, 'office_contacts_export.xlsx');
            addToast('تم التصدير', 'تم تصدير تحويلات المكاتب بنجاح.', 'success');
        });
    };


    // --- Task Handlers ---
    const handleSaveTask = async (taskData: Omit<Task, 'id'> & { id?: number }) => {
        const isEditing = !!taskData.id;
        const { data, error } = await supabase.from('tasks').upsert(taskData).select();
        if (error) {
            addToast('خطأ', `فشل حفظ المهمة: ${error.message}`, 'error');
        } else if (data) {
            if (isEditing) {
                setTasks(prev => prev.map(t => (t.id === data[0].id ? data[0] : t)));
            } else {
                setTasks(prev => [...prev, data[0]]);
            }
            addToast('نجاح', `تم ${isEditing ? 'تحديث' : 'إضافة'} المهمة بنجاح.`, 'success');
            setShowAddTaskModal(false);
            setTaskToEdit(null);
        }
    };
    
    const handleDeleteTask = (task: Task) => {
        requestAdminPermission(() => {
            requestConfirmation('تأكيد الحذف', `هل أنت متأكد من رغبتك في حذف مهمة "${task.title}"؟`, async () => {
                const { error } = await supabase.from('tasks').delete().eq('id', task.id);
                if (error) {
                    addToast('خطأ', `فشل الحذف: ${error.message}`, 'error');
                } else {
                    setTasks(prev => prev.filter(t => t.id !== task.id));
                    addToast('تم الحذف', 'تم حذف المهمة بنجاح.', 'deleted');
                }
            });
        });
    };
    
    const handleToggleTaskComplete = async (taskId: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const { data, error } = await supabase.from('tasks').update({ is_completed: !task.is_completed }).eq('id', taskId).select();
            if (error) {
                addToast('خطأ', `فشل تحديث حالة المهمة: ${error.message}`, 'error');
            } else if (data) {
                setTasks(prev => prev.map(t => t.id === taskId ? data[0] : t));
            }
        }
    };


    // --- Transaction Handlers ---
    const handleSaveTransaction = async (transactionData: Omit<Transaction, 'id'> & { id?: number }) => {
        const isEditing = !!transactionData.id;
        const { data, error } = await supabase.from('transactions').upsert(transactionData).select();
        if (error) {
            addToast('خطأ', `فشل حفظ المعاملة: ${error.message}`, 'error');
        } else if (data) {
            if (isEditing) {
                setTransactions(prev => prev.map(t => (t.id === data[0].id ? data[0] : t)));
            } else {
                setTransactions(prev => [...prev, data[0]]);
            }
            addToast('نجاح', `تم ${isEditing ? 'تحديث' : 'إضافة'} المعاملة بنجاح.`, 'success');
            setShowAddTransactionModal(false);
            setTransactionToEdit(null);
        }
    };
    
    const handleDeleteTransaction = (transaction: Transaction) => {
        requestAdminPermission(() => {
            requestConfirmation('تأكيد الحذف', `هل أنت متأكد من رغبتك في حذف المعاملة رقم "${transaction.transaction_number}"؟`, async () => {
                const { error } = await supabase.from('transactions').delete().eq('id', transaction.id);
                if (error) {
                    addToast('خطأ', `فشل حذف المعاملة: ${error.message}`, 'error');
                } else {
                    setTransactions(prev => prev.filter(t => t.id !== transaction.id));
                    addToast('تم الحذف', 'تم حذف المعاملة بنجاح.', 'deleted');
                }
                 setSelectedTransaction(null); // Close detail modal
            });
        });
    };
    
    // --- Generic Import/Export ---
    const handleGenericImport = () => {
        const handlerMap = {
            directory: handleImportEmployees,
            officeDirectory: handleImportOfficeContacts,
            // Add other tabs here
            tasks: () => addToast('معلومة', 'استيراد المهام غير مدعوم حالياً.', 'info'),
            transactions: () => addToast('معلومة', 'استيراد المعاملات غير مدعوم حالياً.', 'info'),
            orgChart: () => {},
            statistics: () => {}
        };
        const handler = handlerMap[activeTab];
        setImportHandler(() => handler);
        genericFileInputRef.current?.click();
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && importHandler) {
            importHandler(file);
        }
        // Reset file input
        if(event.target) event.target.value = '';
    };

    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    if (showWelcome) {
        return <WelcomeScreen />;
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Header onOpenSettings={() => setShowSettings(true)} />
            
            <main className="container mx-auto px-4 md:px-6 flex-grow pb-24 md:pb-6">
                 <Tabs activeTab={activeTab} setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setSearchTerm(''); // Reset search when changing tabs
                 }} />

                 {loading && (
                    <div className="flex justify-center items-center py-20">
                         <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
                    </div>
                 )}

                 {!loading && (
                    <div key={activeTab} className="animate-tab-content-in">
                        {activeTab === 'directory' && (
                            <>
                                <SearchAndFilter
                                    ref={searchAndFilterRef}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    onImportClick={() => requestAdminPermission(handleGenericImport)}
                                    onAddEmployeeClick={() => {
                                        requestAdminPermission(() => {
                                            setEmployeeToEdit(null);
                                            setShowAddEmployeeModal(true);
                                        });
                                    }}
                                    onExportClick={handleExportEmployees}
                                />
                                <EmployeeList
                                    employees={visibleEmployees}
                                    onSelectEmployee={setSelectedEmployee}
                                    onLoadMore={loadMoreEmployees}
                                    hasMore={hasMoreEmployees}
                                    isLoadingMore={isLoadingMore}
                                />
                            </>
                        )}
                        {activeTab === 'orgChart' && <OrganizationalChartView employees={employees} />}
                        {activeTab === 'officeDirectory' && (
                            <OfficeDirectory
                                contacts={officeContacts}
                                onAddContact={() => {
                                    requestAdminPermission(() => {
                                        setContactToEdit(null);
                                        setShowAddOfficeContactModal(true);
                                    });
                                }}
                                onEditContact={(contact) => {
                                    requestAdminPermission(() => {
                                        setContactToEdit(contact);
                                        setShowAddOfficeContactModal(true);
                                    });
                                }}
                                onDeleteContact={handleDeleteOfficeContact}
                                onImportClick={() => requestAdminPermission(handleGenericImport)}
                                onExportClick={handleExportOfficeContacts}
                            />
                        )}
                         {activeTab === 'tasks' && (
                            <TasksView 
                                tasks={tasks}
                                onAddTask={() => {
                                    requestAdminPermission(() => {
                                        setTaskToEdit(null);
                                        setShowAddTaskModal(true);
                                    });
                                }}
                                onEditTask={(task) => {
                                    requestAdminPermission(() => {
                                        setTaskToEdit(task);
                                        setShowAddTaskModal(true);
                                    });
                                }}
                                onDeleteTask={handleDeleteTask}
                                onToggleComplete={handleToggleTaskComplete}
                                onImportClick={() => addToast('غير متوفر', 'استيراد المهام غير مدعوم حاليًا.', 'info')}
                                onExportClick={() => addToast('غير متوفر', 'تصدير المهام غير مدعوم حاليًا.', 'info')}
                            />
                         )}
                         {activeTab === 'transactions' && (
                            <TransactionsView
                                transactions={transactions}
                                onAddTransaction={() => {
                                    requestAdminPermission(() => {
                                        setTransactionToEdit(null);
                                        setShowAddTransactionModal(true);
                                    });
                                }}
                                onEditTransaction={(t) => {
                                    requestAdminPermission(() => {
                                        setTransactionToEdit(t);
                                        setShowAddTransactionModal(true);
                                    });
                                }}
                                onDeleteTransaction={handleDeleteTransaction}
                                onSelectTransaction={setSelectedTransaction}
                                onImportClick={() => addToast('غير متوفر', 'استيراد المعاملات غير مدعوم حاليًا.', 'info')}
                                onExportClick={() => addToast('غير متوفر', 'تصدير المعاملات غير مدعوم حاليًا.', 'info')}
                            />
                         )}
                         {activeTab === 'statistics' && <StatisticsView employees={employees} transactions={transactions} />}
                    </div>
                 )}
            </main>

            <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <SettingsScreen isOpen={showSettings} onClose={() => setShowSettings(false)} onLogout={handleLogout} />

            <input
                type="file"
                ref={genericFileInputRef}
                onChange={handleFileSelected}
                accept=".xlsx, .xls"
                className="hidden"
            />
            
            <ImportLoadingModal isOpen={isImporting} />

            {selectedEmployee && (
                <EmployeeProfileModal
                    isOpen={!!selectedEmployee}
                    employee={selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                    onEdit={(emp) => {
                        requestAdminPermission(() => {
                            setSelectedEmployee(null);
                            setTimeout(() => {
                                setEmployeeToEdit(emp);
                                setShowAddEmployeeModal(true);
                            }, 100);
                        });
                    }}
                    onDelete={handleDeleteEmployee}
                />
            )}
            
            {(showAddEmployeeModal || employeeToEdit) && (
                 <AddEmployeeModal
                    isOpen={showAddEmployeeModal || !!employeeToEdit}
                    onClose={() => {
                        setShowAddEmployeeModal(false);
                        setEmployeeToEdit(null);
                    }}
                    onSave={handleSaveEmployee}
                    employeeToEdit={employeeToEdit}
                />
            )}

            {(showAddOfficeContactModal || contactToEdit) && (
                <AddOfficeContactModal
                    isOpen={showAddOfficeContactModal || !!contactToEdit}
                    onClose={() => {
                        setShowAddOfficeContactModal(false);
                        setContactToEdit(null);
                    }}
                    onSave={handleSaveOfficeContact}
                    contactToEdit={contactToEdit}
                />
            )}

             {(showAddTaskModal || taskToEdit) && (
                 <AddTaskModal
                    isOpen={showAddTaskModal || !!taskToEdit}
                    onClose={() => { setShowAddTaskModal(false); setTaskToEdit(null); }}
                    onSave={handleSaveTask}
                    taskToEdit={taskToEdit}
                />
            )}

            {(showAddTransactionModal || transactionToEdit) && (
                <AddTransactionModal
                    isOpen={showAddTransactionModal || !!transactionToEdit}
                    onClose={() => { setShowAddTransactionModal(false); setTransactionToEdit(null); }}
                    onSave={handleSaveTransaction}
                    transactionToEdit={transactionToEdit}
                />
            )}
            
            {selectedTransaction && (
                <TransactionDetailModal
                    isOpen={!!selectedTransaction}
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    onEdit={(t) => {
                        requestAdminPermission(() => {
                            setSelectedTransaction(null);
                            setTimeout(() => {
                               setTransactionToEdit(t);
                               setShowAddTransactionModal(true);
                            }, 100);
                        });
                    }}
                    onDelete={handleDeleteTransaction}
                />
            )}

            <ConfirmationModal 
                isOpen={confirmation.isOpen}
                onClose={closeConfirmation}
                onConfirm={() => {
                    confirmation.onConfirm();
                    closeConfirmation();
                }}
                title={confirmation.title}
                message={confirmation.message}
            />

            <AdminPasswordModal 
                isOpen={adminAction.isOpen}
                onClose={closeAdminModal}
                onSuccess={() => {
                    adminAction.onSuccess();
                    closeAdminModal();
                }}
            />
            
            <PromotionalModal isOpen={showPromoModal} onClose={() => setShowPromoModal(false)} />

        </div>
    );
};

export default App;