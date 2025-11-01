


import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';
import { Employee, OfficeContact, Task, Transaction, User } from './types';
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
import { useAuth } from './contexts/AuthContext';
import { tabukHealthClusterLogoMain } from './components/Logo';


declare const XLSX: any;

const App: React.FC = () => {
    const { addToast } = useToast();
    const { currentUser, isAuthenticating, justLoggedIn, clearJustLoggedIn } = useAuth();
    const [showSettings, setShowSettings] = useState(false);
    
    // Data State
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [officeContacts, setOfficeContacts] = useState<OfficeContact[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // UI & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'directory' | 'orgChart' | 'officeDirectory' | 'tasks' | 'transactions' | 'statistics'>('statistics');
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
    const [showLogoSplash, setShowLogoSplash] = useState(false);
    
    const searchAndFilterRef = useRef<SearchAndFilterRef>(null);
    const genericFileInputRef = useRef<HTMLInputElement>(null);
    const [importHandler, setImportHandler] = useState<(file: File) => void>(() => () => {});


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
                }

                const { count: transactionsCount, error: transactionsCountError } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
                if (transactionsCountError) throw transactionsCountError;
                
                if (transactionsCount === 0) {
                    const transactionsToInsert = mockTransactions.map(({ id, ...rest }) => rest);
                    const { error: insertError } = await supabase.from('transactions').insert(transactionsToInsert);
                    if (insertError) throw insertError;
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

        if (currentUser && !justLoggedIn) {
            fetchDataAndSeed();
        }
    }, [currentUser, justLoggedIn, addToast]);

     useEffect(() => {
        if (justLoggedIn) {
            const timer = setTimeout(() => {
                clearJustLoggedIn();
            }, 4000); // Show welcome message for 4 seconds
            return () => clearTimeout(timer);
        }
    }, [justLoggedIn, clearJustLoggedIn]);

    useEffect(() => {
        // Only show splash if user is logged in and not in the process of just logging in (welcome screen is showing)
        if (currentUser && !justLoggedIn) {
            setShowLogoSplash(true);
            const timer = setTimeout(() => {
                setShowLogoSplash(false);
            }, 2000); // Show for 2 seconds
            
            return () => clearTimeout(timer);
        }
    }, [currentUser, justLoggedIn]);

    useEffect(() => {
        if (currentUser) {
            const today = new Date().toISOString().slice(0, 10);
            const dismissedToday = localStorage.getItem('promoModalDismissedToday');
            
            if (dismissedToday !== today) {
                const timer = setTimeout(() => {
                    setShowPromoModal(true);
                }, 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [currentUser]);

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


    // --- Handlers ---
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
    };

    const handleImportEmployees = (file: File) => {
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                const parseExcelDate = (excelDate: any): string | undefined => {
                    if (!excelDate) return undefined;
    
                    let date: Date;
                    let isLikelyUtc = false;
    
                    if (excelDate instanceof Date) {
                        date = excelDate;
                    } else if (typeof excelDate === 'number') {
                        date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
                        isLikelyUtc = true;
                    } else if (typeof excelDate === 'string') {
                        date = new Date(excelDate);
                        if (/^\d{4}-\d{2}-\d{2}$/.test(excelDate.trim())) {
                             isLikelyUtc = true;
                        }
                    } else {
                        return undefined;
                    }
    
                    if (isNaN(date.getTime())) return undefined;
    
                    const year = isLikelyUtc ? date.getUTCFullYear() : date.getFullYear();
                    const month = isLikelyUtc ? date.getUTCMonth() : date.getMonth();
                    const day = isLikelyUtc ? date.getUTCDate() : date.getDate();
    
                    const finalDate = new Date(Date.UTC(year, month, day));
                    
                    return finalDate.toISOString();
                };

                const newEmployees = json
                    .map((row): Omit<Employee, 'id'> => ({
                        employee_id: String(row['الرقم الوظيفي'] || '').trim(),
                        full_name_ar: String(row['الاسم باللغة العربية'] || '').trim(),
                        full_name_en: String(row['الاسم باللغة الإنجليزية'] || '').trim(),
                        job_title: String(row['المسمى الوظيفي'] || '').trim(),
                        department: String(row['القطاع'] || '').trim(),
                        center: String(row['المركز'] || '').trim(),
                        phone_direct: String(row['رقم الجوال'] || '').trim(),
                        email: String(row['البريد الإلكتروني'] || '').trim(),
                        national_id: String(row['السجل المدني / الإقامة'] || '').trim(),
                        nationality: String(row['الجنسية'] || '').trim(),
                        gender: String(row['الجنس'] || '').trim(),
                        date_of_birth: parseExcelDate(row['تاريخ الميلاد']),
                        classification_id: String(row['رقم التصنيف'] || '').trim(),
                    }))
                    .filter(emp => emp.employee_id && emp.full_name_ar);

                if (newEmployees.length === 0) {
                    addToast('لا توجد بيانات', 'لم يتم العثور على موظفين صالحين في الملف.', 'warning');
                    setIsImporting(false);
                    return;
                }
                
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
    };


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
        requestConfirmation('تأكيد الحذف', `هل أنت متأكد من رغبتك في حذف "${contact.name}"؟`, async () => {
            const { error } = await supabase.from('office_contacts').delete().eq('id', contact.id);
            if (error) {
                addToast('خطأ', `فشل الحذف: ${error.message}`, 'error');
            } else {
                setOfficeContacts(prev => prev.filter(c => c.id !== contact.id));
                addToast('تم الحذف', 'تم حذف جهة الاتصال بنجاح.', 'deleted');
            }
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
                    name: String(row['اسم المكتب'] || '').trim(),
                    extension: String(row['التحويلة'] || '').trim(),
                    location: String(row['الموقع'] || '').trim(),
                    email: String(row['البريد الإلكتروني'] || '').trim(),
                })).filter(c => c.name);

                if (newContacts.length === 0) {
                    addToast('لا توجد بيانات', 'لم يتم العثور على جهات اتصال صالحة في الملف.', 'warning');
                    setIsImporting(false);
                    return;
                }

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
    };

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
        requestConfirmation('تأكيد الحذف', `هل أنت متأكد من رغبتك في حذف مهمة "${task.title}"؟`, async () => {
            const { error } = await supabase.from('tasks').delete().eq('id', task.id);
            if (error) {
                addToast('خطأ', `فشل الحذف: ${error.message}`, 'error');
            } else {
                setTasks(prev => prev.filter(t => t.id !== task.id));
                addToast('تم الحذف', 'تم حذف المهمة بنجاح.', 'deleted');
            }
        });
    };
    
    const handleToggleTaskComplete = async (taskId: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const newStatus = !task.is_completed;
            const { data, error } = await supabase.from('tasks').update({ is_completed: newStatus }).eq('id', taskId).select();
            if (error) {
                addToast('خطأ', `فشل تحديث حالة المهمة: ${error.message}`, 'error');
            } else if (data) {
                setTasks(prev => prev.map(t => t.id === taskId ? data[0] : t));
                if (newStatus) {
                    addToast('اكتملت المهمة', `"${task.title}" تم إكمالها.`, 'success');
                } else {
                    addToast('أعيد فتح المهمة', `"${task.title}" أعيدت إلى المهام القادمة.`, 'info');
                }
            }
        }
    };

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
    };
    
    const handleGenericImport = () => {
        const handlerMap = {
            directory: handleImportEmployees,
            officeDirectory: handleImportOfficeContacts,
            tasks: () => addToast('معلومة', 'استيراد المهام غير مدعوم حالياً.', 'info'),
            transactions: () => addToast('معلومة', 'استيراد المعاملات غير مدعوم حالياً.', 'info'),
            orgChart: () => {},
            statistics: () => {},
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
        if(event.target) event.target.value = '';
    };

    if (isAuthenticating) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
            </div>
        );
    }
    
    if (!currentUser) {
        return <LoginScreen />;
    }

    if (justLoggedIn) {
        return <WelcomeScreen currentUser={currentUser} />;
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Header onOpenSettings={() => setShowSettings(true)} />
            
            <main className="container mx-auto px-4 md:px-6 flex-grow pb-24 md:pb-6">
                 <Tabs activeTab={activeTab} setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setSearchTerm(''); 
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
                                    onImportClick={handleGenericImport}
                                    onAddEmployeeClick={() => { setEmployeeToEdit(null); setShowAddEmployeeModal(true); }}
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
                                onAddContact={() => { setContactToEdit(null); setShowAddOfficeContactModal(true); }}
                                onEditContact={(contact) => { setContactToEdit(contact); setShowAddOfficeContactModal(true); }}
                                onDeleteContact={handleDeleteOfficeContact}
                                onImportClick={handleGenericImport}
                                onExportClick={handleExportOfficeContacts}
                            />
                        )}
                         {activeTab === 'tasks' && (
                            <TasksView 
                                tasks={tasks}
                                onAddTask={() => { setTaskToEdit(null); setShowAddTaskModal(true); }}
                                onEditTask={(task) => { setTaskToEdit(task); setShowAddTaskModal(true); }}
                                onDeleteTask={handleDeleteTask}
                                onToggleComplete={handleToggleTaskComplete}
                                onImportClick={() => addToast('غير متوفر', 'استيراد المهام غير مدعوم حاليًا.', 'info')}
                                onExportClick={() => addToast('غير متوفر', 'تصدير المهام غير مدعوم حاليًا.', 'info')}
                            />
                         )}
                         {activeTab === 'transactions' && (
                            <TransactionsView
                                transactions={transactions}
                                onAddTransaction={() => { setTransactionToEdit(null); setShowAddTransactionModal(true); }}
                                onEditTransaction={(t) => { setTransactionToEdit(t); setShowAddTransactionModal(true); }}
                                onDeleteTransaction={handleDeleteTransaction}
                                onSelectTransaction={setSelectedTransaction}
                                onImportClick={() => addToast('غير متوفر', 'استيراد المعاملات غير مدعوم حاليًا.', 'info')}
                                onExportClick={() => addToast('غير متوفر', 'تصدير المعاملات غير مدعوم حاليًا.', 'info')}
                            />
                         )}
                         {activeTab === 'statistics' && <StatisticsView employees={employees} transactions={transactions} officeContacts={officeContacts} tasks={tasks} />}
                    </div>
                 )}
            </main>

            <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <SettingsScreen isOpen={showSettings} onClose={() => setShowSettings(false)} />

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
                        setSelectedEmployee(null);
                        setTimeout(() => {
                            setEmployeeToEdit(emp);
                            setShowAddEmployeeModal(true);
                        }, 100);
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
                        setSelectedTransaction(null);
                        setTimeout(() => {
                           setTransactionToEdit(t);
                           setShowAddTransactionModal(true);
                        }, 100);
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
            
            <PromotionalModal isOpen={showPromoModal} onClose={() => setShowPromoModal(false)} />
            
            {showLogoSplash && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-out pointer-events-none">
                    <img
                        src={tabukHealthClusterLogoMain}
                        alt="شعار تجمع تبوك الصحي"
                        className="w-40 h-auto"
                    />
                </div>
            )}
        </div>
    );
};

export default App;