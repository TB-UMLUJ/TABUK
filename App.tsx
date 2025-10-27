
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
import Dashboard from './components/Dashboard';
import AddEmployeeModal from './components/AddEmployeeModal';
import ImportLoadingModal from './ImportLoadingModal';
import BottomNavBar from './components/BottomNavBar';
import OfficeDirectory from './components/OfficeDirectory';
import EditOfficeContactModal from './EditOfficeContactModal';
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
    const [favorites, setFavorites] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    // UI & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'directory' | 'dashboard' | 'officeDirectory' | 'tasks' | 'transactions'>('directory');
    const [isImporting, setIsImporting] = useState<boolean>(false);
    
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
    
    const searchAndFilterRef = useRef<SearchAndFilterRef>(null);

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
                    addToast('تمت إضافة بيانات المهام الأولية بنجاح.', 'info');
                }

                const { count: transactionsCount, error: transactionsCountError } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
                if (transactionsCountError) throw transactionsCountError;
                
                if (transactionsCount === 0) {
                    const transactionsToInsert = mockTransactions.map(({ id, ...rest }) => rest);
                    const { error: insertError } = await supabase.from('transactions').insert(transactionsToInsert);
                    if (insertError) throw insertError;
                    addToast('تمت إضافة بيانات المعاملات الأولية بنجاح.', 'info');
                }

                // Fetch all data
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
                console.error("Error fetching or seeding data:", error);
                const postgrestError = error as PostgrestError;
                addToast(`فشل في جلب البيانات: ${postgrestError.message}`, 'error');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchDataAndSeed();
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
        localStorage.removeItem('isAuthenticated');
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

    const handleDeleteEmployee = async (employee: Employee) => {
        requestConfirmation(
            `حذف الموظف: ${employee.full_name_ar}`,
            'هل أنت متأكد من رغبتك في حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.',
            async () => {
                const { error } = await supabase.from('employees').delete().eq('id', employee.id);
                if (error) {
                    addToast(`خطأ في حذف الموظف: ${error.message}`, 'error');
                } else {
                    setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
                    setSelectedEmployee(null);
                    addToast('تم حذف الموظف بنجاح.', 'success');
                }
            }
        );
    };

    // --- Office Contact Handlers ---
    const handleOpenEditContactModal = (contact: OfficeContact) => {
        setContactToEdit(contact);
    };

    const handleOpenAddContactModal = () => {
        setShowAddOfficeContactModal(true);
    };

    const handleAddOfficeContact = async (contactData: Omit<OfficeContact, 'id'>) => {
        const { data, error } = await supabase.from('office_contacts').insert([contactData]).select();
        if (error) {
            addToast(`خطأ في إضافة المكتب: ${error.message}`, 'error');
        } else if (data) {
            setOfficeContacts(prev => [...prev, data[0]].sort((a,b) => a.name.localeCompare(b.name, 'ar')));
            addToast(`تمت إضافة مكتب "${data[0].name}" بنجاح.`, 'success');
            setShowAddOfficeContactModal(false);
        }
    };

    const handleUpdateOfficeContact = async (contactData: OfficeContact) => {
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

    const handleDeleteTask = async (task: Task) => {
        requestConfirmation(
            `حذف المهمة: "${task.title}"`,
            'هل أنت متأكد من رغبتك في حذف هذه المهمة؟',
            async () => {
                const { error } = await supabase.from('tasks').delete().eq('id', task.id);
                if (error) {
                    addToast(`خطأ في حذف المهمة: ${error.message}`, 'error');
                } else {
                    setTasks(prev => prev.filter(t => t.id !== task.id));
                    addToast('تم حذف المهمة.', 'success');
                }
            }
        );
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

    const handleDeleteTransaction = async (transaction: Transaction) => {
        requestConfirmation(
            `حذف المعاملة: "${transaction.transaction_number}"`,
            'هل أنت متأكد من رغبتك في حذف هذه المعاملة؟',
            async () => {
                const { error } = await supabase.from('transactions').delete().eq('id', transaction.id);
                if(error) {
                    addToast(`خطأ في حذف المعاملة: ${error.message}`, 'error');
                } else {
                    setTransactions(prev => prev.filter(t => t.id !== transaction.id));
                    setSelectedTransaction(null);
                    addToast('تم حذف المعاملة.', 'success');
                }
            }
        );
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

    // --- Generic Excel Parser ---
    const parseExcelFile = (
        file: File, 
        aliases: { [key: string]: string[] }, 
        requiredKeys: string[],
        callback: (data: any[], error?: string) => void
    ) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                if (json.length === 0) {
                    callback([], "الملف فارغ أو لا يمكن قراءته.");
                    return;
                }
                
                // Normalize headers
                const normalizedData = json.map((row: any) => {
                    const newRow: { [key: string]: any } = {};
                    for (const key in row) {
                        const normalizedKey = Object.keys(aliases).find(
                            aliasKey => [aliasKey.toLowerCase(), ...aliases[aliasKey].map(a => a.toLowerCase())].includes(key.trim().toLowerCase())
                        );
                        if (normalizedKey) {
                            newRow[normalizedKey] = String(row[key]).trim();
                        }
                    }
                    return newRow;
                });

                // Check for required keys in the first row
                const firstRowKeys = Object.keys(normalizedData[0]);
                const missingKeys = requiredKeys.filter(key => !firstRowKeys.includes(key));

                if (missingKeys.length > 0) {
                    callback([], `الأعمدة المطلوبة غير موجودة في الملف: ${missingKeys.join(', ')}`);
                    return;
                }
                
                callback(normalizedData);
            } catch (error) {
                console.error("Error parsing Excel file:", error);
                callback([], "حدث خطأ أثناء معالجة الملف. يرجى التأكد من أنه ملف Excel صالح.");
            }
        };
        reader.onerror = (error) => {
            console.error("FileReader error:", error);
            callback([], "لا يمكن قراءة الملف.");
        };
        reader.readAsBinaryString(file);
    };

    // --- Employee Import/Export ---
    const handleImportEmployees = (file: File) => {
        setIsImporting(true);
        const aliases = {
            full_name_ar: ['الاسم الكامل (عربي)', 'الاسم', 'full_name_ar'],
            full_name_en: ['الاسم الكامل (إنجليزي)', 'full_name_en'],
            employee_id: ['الرقم الوظيفي', 'employee_id'],
            job_title: ['المسمى الوظيفي', 'job_title'],
            department: ['القطاع', 'department'],
            phone_direct: ['الجوال', 'phone_direct'],
            email: ['البريد الإلكتروني', 'email'],
            center: ['المركز', 'center'],
            national_id: ['رقم السجل المدني/الإقامة', 'national_id'],
            nationality: ['الجنسية', 'nationality'],
            gender: ['الجنس', 'gender'],
            date_of_birth: ['تاريخ الميلاد', 'date_of_birth'],
            classification_id: ['رقم التصنيف', 'classification_id'],
        };
        const requiredKeys = ['full_name_ar', 'employee_id', 'job_title', 'department'];

        parseExcelFile(file, aliases, requiredKeys, async (data, error) => {
            if (error) {
                addToast(error, 'error');
                setIsImporting(false);
                return;
            }

            const validData = data.filter(item => requiredKeys.every(key => item[key] && String(item[key]).trim() !== ''));
            if (validData.length !== data.length) {
                addToast(`تم تخطي ${data.length - validData.length} صفًا بسبب بيانات غير مكتملة.`, 'warning');
            }
            if (validData.length === 0) {
                addToast('لم يتم العثور على بيانات صالحة للاستيراد.', 'error');
                setIsImporting(false);
                return;
            }
            
            const employeesToUpsert = validData.map(item => {
                const employee: any = {};
                for (const key in aliases) {
                    if (item[key] !== undefined) employee[key] = item[key];
                }
                if (item.date_of_birth) {
                    if (typeof item.date_of_birth === 'number' && item.date_of_birth > 1) {
                        employee.date_of_birth = new Date(Math.round((item.date_of_birth - 25569) * 86400 * 1000)).toISOString();
                    } else if (typeof item.date_of_birth === 'string') {
                        const parsedDate = new Date(item.date_of_birth);
                        if (!isNaN(parsedDate.getTime())) {
                             employee.date_of_birth = parsedDate.toISOString();
                        }
                    }
                }
                return employee;
            });

            const { error: upsertError } = await supabase.from('employees').upsert(employeesToUpsert, { onConflict: 'employee_id' });
            setIsImporting(false);
            if (upsertError) {
                addToast(`خطأ في استيراد الموظفين: ${upsertError.message}`, 'error');
            } else {
                addToast(`تم استيراد وتحديث ${validData.length} موظف بنجاح!`, 'success');
                const { data: employeesData, error: employeesError } = await supabase.from('employees').select('*').order('full_name_ar', { ascending: true });
                if (!employeesError) setEmployees(employeesData || []);
            }
        });
    };

    const handleExportEmployees = () => {
        if (filteredEmployees.length === 0) {
            addToast('لا توجد بيانات لتصديرها.', 'warning');
            return;
        }
        const dataToExport = filteredEmployees.map(({ id, ...rest }) => rest);
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
        XLSX.writeFile(workbook, `employees_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        addToast('تم تصدير الموظفين بنجاح!', 'success');
    };

    // --- Office Contact Import/Export ---
    const handleImportOfficeContacts = (file: File) => {
        setIsImporting(true);
        const aliases = { name: ['اسم المكتب', 'name'], extension: ['رقم التحويلة', 'extension'], location: ['الموقع', 'location'] };
        const requiredKeys = ['name', 'extension'];
        parseExcelFile(file, aliases, requiredKeys, async (data, error) => {
            setIsImporting(false);
            if (error) {
                addToast(error, 'error');
                return;
            }
            const { error: upsertError } = await supabase.from('office_contacts').upsert(data, { onConflict: 'name' });
            if (upsertError) {
                addToast(`خطأ في استيراد التحويلات: ${upsertError.message}`, 'error');
            } else {
                addToast(`تم استيراد ${data.length} تحويلة بنجاح!`, 'success');
                const { data: contactsData, error: contactsError } = await supabase.from('office_contacts').select('*').order('name', { ascending: true });
                if (!contactsError) setOfficeContacts(contactsData || []);
            }
        });
    };

    const handleExportOfficeContacts = () => {
        if (officeContacts.length === 0) {
            addToast('لا توجد بيانات لتصديرها.', 'warning');
            return;
        }
        const dataToExport = officeContacts.map(({ id, ...rest }) => rest);
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "OfficeContacts");
        XLSX.writeFile(workbook, `office_contacts_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        addToast('تم تصدير التحويلات بنجاح!', 'success');
    };

    // --- Task Import/Export ---
    const handleImportTasks = (file: File) => {
        setIsImporting(true);
        const aliases = { title: ['عنوان المهمة', 'title'], description: ['الوصف', 'description'], due_date: ['تاريخ الاستحقاق', 'due_date'], is_completed: ['مكتملة', 'is_completed'] };
        const requiredKeys = ['title'];
        parseExcelFile(file, aliases, requiredKeys, async (data, error) => {
            setIsImporting(false);
            if (error) {
                addToast(error, 'error');
                return;
            }
            const tasksToInsert = data.map(item => ({ ...item, is_completed: ['true', 'yes', '1', 'نعم'].includes(String(item.is_completed).toLowerCase())}));
            const { error: insertError } = await supabase.from('tasks').insert(tasksToInsert);
            if (insertError) {
                addToast(`خطأ في استيراد المهام: ${insertError.message}`, 'error');
            } else {
                addToast(`تم استيراد ${data.length} مهمة بنجاح!`, 'success');
                const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false });
                if (!tasksError) setTasks(tasksData || []);
            }
        });
    };

    const handleExportTasks = () => {
        if (tasks.length === 0) {
            addToast('لا توجد بيانات لتصديرها.', 'warning');
            return;
        }
        const dataToExport = tasks.map(({ id, ...rest }) => rest);
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
        XLSX.writeFile(workbook, `tasks_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        addToast('تم تصدير المهام بنجاح!', 'success');
    };

    // --- Transaction Import/Export ---
    const handleImportTransactions = (file: File) => {
        setIsImporting(true);
        const aliases = { transaction_number: ['رقم المعاملة', 'transaction_number'], subject: ['الموضوع', 'subject'], type: ['النوع', 'type'], platform: ['المنصة', 'platform'], status: ['الحالة', 'status'], date: ['التاريخ', 'date'], description: ['ملاحظات', 'description'] };
        const requiredKeys = ['transaction_number', 'subject', 'date'];
        parseExcelFile(file, aliases, requiredKeys, async (data, error) => {
            setIsImporting(false);
            if (error) {
                addToast(error, 'error');
                return;
            }
            const { error: upsertError } = await supabase.from('transactions').upsert(data, { onConflict: 'transaction_number' });
            if (upsertError) {
                addToast(`خطأ في استيراد المعاملات: ${upsertError.message}`, 'error');
            } else {
                addToast(`تم استيراد ${data.length} معاملة بنجاح!`, 'success');
                const { data: transData, error: transError } = await supabase.from('transactions').select('*').order('date', { ascending: false });
                if (!transError) setTransactions(transData || []);
            }
        });
    };

    const handleExportTransactions = () => {
        if (transactions.length === 0) {
            addToast('لا توجد بيانات لتصديرها.', 'warning');
            return;
        }
        const dataToExport = transactions.map(({ id, attachment, ...rest }) => rest);
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
        XLSX.writeFile(workbook, `transactions_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        addToast('تم تصدير المعاملات بنجاح!', 'success');
    };

    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    if (showWelcome) {
        return <WelcomeScreen />;
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans dark:bg-gray-900 selection:bg-primary/20 selection:text-primary-dark">
            <Header onOpenSettings={() => setShowSettings(true)} />

            <main className="container mx-auto px-4 md:px-6 pb-24 md:pb-8">
                <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

                {activeTab === 'directory' && (
                    <>
                        <SearchAndFilter
                            ref={searchAndFilterRef}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            onImport={handleImportEmployees}
                            onAddEmployeeClick={handleOpenAddModal}
                            onExport={handleExportEmployees}
                        />
                        {loading ? 
                            <div className="flex justify-center items-center p-20">
                                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
                            </div> : 
                            <EmployeeList 
                                employees={filteredEmployees} 
                                onSelectEmployee={setSelectedEmployee} 
                                favorites={favorites} 
                                onToggleFavorite={toggleFavorite} 
                            />
                        }
                    </>
                )}

                {activeTab === 'dashboard' && <Dashboard employees={employees} />}
                
                {activeTab === 'officeDirectory' && <OfficeDirectory 
                    contacts={officeContacts} 
                    onEditContact={handleOpenEditContactModal} 
                    onAddContact={handleOpenAddContactModal}
                    onImport={handleImportOfficeContacts}
                    onExport={handleExportOfficeContacts}
                />}

                {activeTab === 'tasks' && <TasksView 
                    tasks={tasks} 
                    onAddTask={handleOpenAddTaskModal} 
                    onEditTask={handleOpenEditTaskModal} 
                    onDeleteTask={handleDeleteTask} 
                    onToggleComplete={handleToggleTaskCompletion}
                    onImport={handleImportTasks}
                    onExport={handleExportTasks}
                />}

                {activeTab === 'transactions' && <TransactionsView 
                    transactions={transactions} 
                    onAddTransaction={handleOpenAddTransactionModal}
                    onEditTransaction={handleOpenEditTransactionModal}
                    onDeleteTransaction={handleDeleteTransaction}
                    onSelectTransaction={setSelectedTransaction}
                    onImport={handleImportTransactions}
                    onExport={handleExportTransactions}
                />}

            </main>
            
            {/* --- Modals --- */}
            <EmployeeProfileModal 
                isOpen={!!selectedEmployee} 
                employee={selectedEmployee} 
                onClose={() => setSelectedEmployee(null)} 
                onEdit={handleOpenEditModal} 
                onDelete={handleDeleteEmployee} 
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
                onSave={handleUpdateOfficeContact}
                contactToEdit={contactToEdit}
            />
            <AddOfficeContactModal
                isOpen={showAddOfficeContactModal}
                onClose={() => setShowAddOfficeContactModal(false)}
                onSave={handleAddOfficeContact}
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
            <ConfirmationModal 
                {...confirmation}
                onClose={closeConfirmation}
            />
            <ImportLoadingModal isOpen={isImporting} />
            <SettingsScreen isOpen={showSettings} onClose={() => setShowSettings(false)} onLogout={handleLogout} />


            <BottomNavBar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onAddEmployeeClick={handleOpenAddModal}
                onAddOfficeContactClick={handleOpenAddContactModal}
                onAddTaskClick={handleOpenAddTaskModal}
                onAddTransactionClick={handleOpenAddTransactionModal}
            />
        </div>
    );
};

export default App;
