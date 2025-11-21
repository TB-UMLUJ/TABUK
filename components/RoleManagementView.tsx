
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Role, Permission } from '../types';
import { useToast } from '../contexts/ToastContext';
import { PlusIcon, PencilIcon, ShieldCheckIcon, TrashIcon } from '../icons/Icons';
import AddEditRoleModal from './AddEditRoleModal';
import RolePermissionsModal from './RolePermissionsModal';
import ConfirmationModal from './ConfirmationModal';

const roleNameMap: { [key: string]: string } = {
    'Admin': 'مسؤول النظام',
    'HR_Manager': 'مدير موارد بشرية',
    'User': 'مستخدم'
};

const RoleManagementView: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
    const [roleForPermissions, setRoleForPermissions] = useState<Role | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('roles')
                .select('*, role_permissions(permissions(*))')
                .order('role_id');
            if (error) throw error;
            setRoles(data || []);
        } catch (error: any) {
            addToast('خطأ', `فشل جلب الأدوار: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddRole = () => {
        setRoleToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setRoleToEdit(role);
        setIsAddEditModalOpen(true);
    };

    const handleEditPermissions = (role: Role) => {
        setRoleForPermissions(role);
        setIsPermissionsModalOpen(true);
    };
    
    const handleDeleteClick = (role: Role) => {
        setRoleToDelete(role);
    };

    const handleConfirmDelete = async () => {
        if (!roleToDelete) return;
        
        try {
            const { error } = await supabase
                .from('roles')
                .delete()
                .eq('role_id', roleToDelete.role_id);

            if (error) {
                // Check for foreign key violation (Postgres code 23503)
                if (error.code === '23503') {
                    throw new Error('لا يمكن حذف هذا الدور لأنه مسند لمستخدمين حاليين. قم بتغيير أدوار المستخدمين أولاً.');
                }
                throw error;
            }

            addToast('تم حذف الدور بنجاح', '', 'deleted');
            fetchData();
        } catch (error: any) {
            addToast('خطأ', error.message || `فشل حذف الدور: ${error.message}`, 'error');
        } finally {
            setRoleToDelete(null);
        }
    };
    
    const handleSaveRole = async (roleData: { role_name: string; description: string; role_id?: number }): Promise<void> => {
        try {
            const { error } = await supabase.from('roles').upsert(roleData);
            if (error) throw error;
            addToast(`تم ${roleData.role_id ? 'تحديث' : 'إنشاء'} الدور بنجاح`, '', 'success');
            setIsAddEditModalOpen(false);
            fetchData();
        } catch (error: any) {
            addToast('خطأ', `فشل حفظ الدور: ${error.message}`, 'error');
            throw error;
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div></div>;
    }

    return (
        <div className="animate-fade-in relative">
            <div className="text-right mb-6">
                <button onClick={handleAddRole} className="p-2.5 rounded-lg inline-flex items-center justify-center transition-all duration-200 font-semibold bg-primary text-white hover:bg-primary-dark transform hover:-translate-y-0.5" title="إضافة دور جديد">
                    <PlusIcon className="h-5 w-5 ml-2" /> إضافة دور
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                    <div key={role.role_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-between group hover:border-primary/30 dark:hover:border-primary-light/30 transition-all">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-primary dark:text-primary-light">{roleNameMap[role.role_name] || role.role_name}</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 h-10 line-clamp-2">{role.description}</p>
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">الصلاحيات الممنوحة</p>
                                <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                                    {Array.isArray(role.role_permissions) && role.role_permissions.length > 0
                                        ? `${role.role_permissions.length} صلاحيات`
                                        : 'لا توجد صلاحيات'}
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                            <button onClick={() => handleEditRole(role)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors" title="تعديل الاسم">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                             <button onClick={() => handleEditPermissions(role)} className="p-2 rounded-md text-primary hover:bg-primary/10 dark:text-primary-light dark:hover:bg-primary/20 transition-colors" title="تعديل الصلاحيات">
                                <ShieldCheckIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteClick(role)} className="p-2 rounded-md text-danger hover:bg-danger/10 dark:text-red-400 dark:hover:bg-danger/20 transition-colors" title="حذف الدور">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <AddEditRoleModal
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSave={handleSaveRole}
                roleToEdit={roleToEdit}
            />

            <RolePermissionsModal
                isOpen={isPermissionsModalOpen}
                onClose={() => setIsPermissionsModalOpen(false)}
                role={roleForPermissions}
                onSaveSuccess={fetchData}
            />

            <ConfirmationModal
                isOpen={!!roleToDelete}
                onClose={() => setRoleToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="تأكيد حذف الدور"
                message={`هل أنت متأكد من رغبتك في حذف الدور "${roleToDelete && (roleNameMap[roleToDelete.role_name] || roleToDelete.role_name)}"\u200E؟ لا يمكن التراجع عن هذا الإجراء.`}
            />
        </div>
    );
};

export default RoleManagementView;
