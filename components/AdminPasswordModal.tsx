
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon, ShieldCheckIcon } from '../icons/Icons';

interface AdminPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ADMIN_PASSWORD = 'Admin-2815';

const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const passwordInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Focus input when modal opens
            setTimeout(() => passwordInputRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setPassword('');
            setError('');
            setIsClosing(false);
        }, 300);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            onSuccess();
            handleClose();
        } else {
            setError('كلمة المرور غير صحيحة.');
            setPassword('');
            passwordInputRef.current?.focus();
        }
    };

    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[60] flex justify-center items-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-modal-title"
        >
            <div
                className={`fixed inset-0 bg-black ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div
                className={`relative bg-white rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}
            >
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheckIcon className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                        <h3 id="password-modal-title" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                            مطلوب إذن المسؤول
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            الرجاء إدخال كلمة مرور المسؤول للمتابعة.
                        </p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label htmlFor="admin-password" className="sr-only">كلمة المرور</label>
                        <input
                            ref={passwordInputRef}
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="كلمة المرور"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div className="flex flex-row-reverse gap-3">
                         <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            تأكيد
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        modalRoot
    );
};

export default AdminPasswordModal;
