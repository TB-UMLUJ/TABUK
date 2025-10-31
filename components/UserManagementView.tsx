
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Role } from '../types';
import { useToast } from '../contexts/ToastContext';
import { PlusIcon, UserIcon, PencilIcon, TrashIcon } from '../icons/Icons';
import AddUserModal from './AddUserModal';
import ConfirmationModal from './ConfirmationModal';
import ToggleSwitch from './ToggleSwitch';
import { useAuth } from '../contexts/AuthContext';

const UserManagementView: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const { addToast } = useToast();
    const { currentUser } = useAuth();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*, role:roles(*)');
            
            if (usersError) throw usersError;

            const { data: rolesData, error: rolesError } = await supabase
                .from('roles')
                .select('*');

            if (rolesError) throw rolesError;

            setUsers(usersData as any[] || []);
            setRoles(rolesData || []);
        } catch (error: any) {
            addToast('خطأ', 'فشل في جلب بيانات المستخدمين.', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddUser = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };
    
    const handleSaveUser = async (userData: Partial<User> & { password?: string }): Promise<void> => {
        try {
            const { password, ...dataToUpsert } = userData;
            
            if (password) {
                // In a real app, hash the password on the server before inserting.
                // For this demo, we're saving it as is.
                (dataToUpsert as any).password = password;
            }

            const { error } = await supabase.from('users').upsert(dataToUpsert);
            
            if (error) throw error;
            
            addToast('نجاح', `تم ${userData.user_id ? 'تحديث' : 'إضافة'} المستخدم بنجاح.`, 'success');
            setIsModalOpen(false);
            fetchData(); // Refresh data
        } catch (error: any) {
            addToast('خطأ', `فشل حفظ المستخدم: ${error.message}`, 'error');
            throw error; // Re-throw to notify the modal of the failure
        }
    };
    
    const handleDeleteClick = (user: User) => {
        if (currentUser?.user_id === user.user_id) {
            addToast('خطأ', 'لا يمكنك حذف حسابك الخاص.', 'error');
            return;
        }
        setUserToDelete(user);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            const { error } = await supabase.from('users').delete().eq('user_id', userToDelete.user_id);
            if (error) throw error;
            addToast('تم الحذف', `تم حذف المستخدم ${userToDelete.full_name} بنجاح.`, 'deleted');
            setUsers(prev => prev.filter(u => u.user_id !== userToDelete.user_id));
        } catch (error: any) {
            addToast('خطأ', `فشل حذف المستخدم: ${error.message}`, 'error');
        } finally {
            setUserToDelete(null);
        }
    };

    const handleToggleStatus = async (user: User) => {
        if (currentUser?.user_id === user.user_id) {
            addToast('خطأ', 'لا يمكنك تعطيل حسابك الخاص.', 'error');
            return;
        }

        const originalUsers = users;
        setUsers(prev => prev.map(u => u.user_id === user.user_id ? { ...u, is_active: !u.is_active } : u));
        
        try {
            const { error } = await supabase.from('users').update({ is_active: !user.is_active }).eq('user_id', user.user_id);
            if (error) throw error;
            addToast('تم التحديث', `تم تحديث حالة المستخدم ${user.full_name}.`, 'success');
        } catch (error: any) {
            addToast('خطأ', 'فشل تحديث حالة المستخدم.', 'error');
            setUsers(originalUsers); // Revert on error
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">المستخدمون</h2>
                <button
                    onClick={handleAddUser}
                    className="p-2.5 rounded-lg flex items-center justify-center transition-all duration-200 font-semibold bg-primary text-white hover:bg-primary-dark transform hover:-translate-y-0.5"
                    title="إضافة مستخدم جديد"
                >
                    <PlusIcon className="h-5 w-5 ml-2" /> إضافة مستخدم
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الاسم الكامل</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">اسم المستخدم</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الدور</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الحالة</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map(user => (
                                <tr key={user.user_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.role?.role_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <ToggleSwitch checked={user.is_active} onChange={() => handleToggleStatus(user)} ariaLabel={`Toggle status for ${user.full_name}`} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEditUser(user)} className="p-2 rounded-md text-primary hover:bg-gray-100 dark:text-primary-light dark:hover:bg-gray-700" title="تعديل">
                                                <PencilIcon className="w-5 h-5"/>
                                            </button>
                                            <button onClick={() => handleDeleteClick(user)} className="p-2 rounded-md text-danger hover:bg-danger/10" title="حذف">
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                     {users.map(user => (
                        <div key={user.user_id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 rounded-full flex-shrink-0">
                                        <UserIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{user.full_name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center flex-shrink-0">
                                    <button onClick={() => handleEditUser(user)} className="p-2 text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-white" title="تعديل">
                                        <PencilIcon className="w-5 h-5"/>
                                    </button>
                                     <button onClick={() => handleDeleteClick(user)} className="p-2 text-danger hover:bg-danger/10" title="حذف">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 items-center text-sm gap-2">
                                <p className="text-gray-600 dark:text-gray-300">
                                    <span className="font-semibold">الدور:</span> {user.role?.role_name}
                                </p>
                                <div className="flex items-center justify-end gap-2">
                                     <span className={`text-xs font-semibold ${user.is_active ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                        {user.is_active ? 'نشط' : 'معطل'}
                                    </span>
                                    <ToggleSwitch checked={user.is_active} onChange={() => handleToggleStatus(user)} ariaLabel={`Toggle status for ${user.full_name}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AddUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                userToEdit={userToEdit}
                roles={roles}
            />

             <ConfirmationModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={confirmDelete}
                title="تأكيد الحذف"
                message={`هل أنت متأكد من رغبتك في حذف المستخدم "${userToDelete?.full_name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
            />
        </div>
    );
};

export default UserManagementView;
