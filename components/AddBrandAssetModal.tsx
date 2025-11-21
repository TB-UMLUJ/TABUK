
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../lib/supabaseClient';
import { BrandAsset } from '../types';
import { CloseIcon, SwatchIcon, CloudArrowUpIcon, PaperClipIcon } from '../icons/Icons';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { logActivity } from '../lib/activityLogger';

interface AddBrandAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
}

const AddBrandAssetModal: React.FC<AddBrandAssetModalProps> = ({ isOpen, onClose, onSaveSuccess }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assetType, setAssetType] = useState<'logo' | 'font' | 'template' | 'icon' | 'other'>('logo');
    const [file, setFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDescription('');
            setAssetType('logo');
            setFile(null);
        }
    }, [isOpen]);

    const handleClose = useCallback(() => {
        if (isSaving) return;
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    }, [isSaving, onClose]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
                addToast('خطأ', 'حجم الملف يجب أن يكون أقل من 20 ميجابايت.', 'error');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!file) {
            addToast('تنبيه', 'الرجاء اختيار ملف للرفع.', 'warning');
            return;
        }

        setIsSaving(true);
        try {
            // Generate a safe, unique filename using UUID
            const fileExt = file.name.split('.').pop();
            const randomName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${assetType}/${randomName}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage.from('brand-assets').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('brand-assets').getPublicUrl(uploadData.path);
            const file_url = urlData.publicUrl;
            const file_name = filePath; 
            const display_file_name = file.name; 

            const assetData = {
                title,
                description,
                asset_type: assetType,
                file_url,
                file_name,
                display_file_name,
            };

            const { data, error: insertError } = await supabase
                .from('brand_assets')
                .insert(assetData)
                .select()
                .single();

            if (insertError) throw insertError;

            const savedAsset = data as BrandAsset;
            await logActivity(currentUser, 'CREATE_BRAND_ASSET', { assetId: savedAsset.id, assetTitle: savedAsset.title });

            addToast('تم إضافة ملف الهوية بنجاح', '', 'success');
            onSaveSuccess();
            handleClose();

        } catch (error: any) {
            console.error('Error saving brand asset:', error);
            addToast('خطأ', `فشل حفظ الملف: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[60] flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/60" onClick={handleClose} />
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>
                <div className="p-6">
                    <button onClick={handleClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg text-purple-600 dark:text-purple-400">
                            <SwatchIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">إضافة ملف هوية</h2>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان الملف</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input-style" placeholder="مثال: الشعار الرسمي (ملون)" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع الملف</label>
                                <select value={assetType} onChange={(e) => setAssetType(e.target.value as any)} className="input-style">
                                    <option value="logo">شعار (Logo)</option>
                                    <option value="font">خط (Font)</option>
                                    <option value="icon">أيقونة (Icon)</option>
                                    <option value="template">قالب (Template)</option>
                                    <option value="other">أخرى</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف (اختياري)</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input-style" placeholder="وصف لاستخدام هذا الملف..." />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الملف (بحد أقصى 20 ميجابايت)</label>
                            <div className="mt-2 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="space-y-1 text-center">
                                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                        <label htmlFor="asset-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                                            <span>اختر ملفًا</span>
                                            <input id="asset-upload" name="asset-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                        </label>
                                        <p className="pr-1">أو اسحبه هنا</p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, SVG, PDF, ZIP, AI</p>
                                </div>
                            </div>
                            {file && (
                                <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                    <PaperClipIcon className="w-4 h-4" /> <span>{file.name}</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={handleClose} className="btn-secondary">إلغاء</button>
                            <button type="submit" className="btn-primary" disabled={isSaving}>
                                {isSaving ? 'جاري الرفع...' : 'حفظ'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style>{`
                .input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; border-radius: 0.5rem; padding: 0.75rem 1rem; width: 100%; outline: none; color: #111827; }
                .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
                .input-style:focus { --tw-ring-color: #005A9C; box-shadow: 0 0 0 2px var(--tw-ring-color); }
                .btn-primary { background-color: #005A9C; color: white; font-weight: 600; padding: 0.5rem 1.5rem; border-radius: 0.5rem; transition: all 0.2s; min-width: 6.25rem; }
                .btn-primary:hover { background-color: #004B80; }
                .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
                .btn-secondary { background-color: #E5E7EB; color: #1F2937; font-weight: 600; padding: 0.5rem 1.5rem; border-radius: 0.5rem; transition: all 0.2s; }
                .dark .btn-secondary { background-color: #4B5563; color: #D1D5DB; }
                .btn-secondary:hover { background-color: #D1D5DB; }
                .dark .btn-secondary:hover { background-color: #374151; }
            `}</style>
        </div>,
        document.getElementById('modal-root')!
    );
};

export default AddBrandAssetModal;
