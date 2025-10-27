import React, { useState } from 'react';
import { UserIcon, KeyIcon } from '../icons/Icons';
import { tabukHealthClusterLogo } from './Logo';
import ThemeToggle from './ThemeToggle';

interface LoginScreenProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded credentials for demonstration
        if (username === 'admin' && password === '1234') {
            onLogin();
        } else {
            setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4 dark:from-gray-900 dark:to-gray-800">
            <div className="absolute top-4 left-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-md mx-auto">
                <img
                    src={tabukHealthClusterLogo}
                    alt="شعار تجمع تبوك الصحي"
                    className="w-48 h-auto mx-auto mb-10"
                />
                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 dark:bg-gray-800">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white">أهلاً بك</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-2 dark:text-gray-400">سجّل الدخول لتجربة إدارة أسرع وأذكى</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="sr-only">اسم المستخدم</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="اسم المستخدم"
                                    className="w-full pr-10 pl-4 py-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition text-gray-900 dark:bg-gray-700 dark:text-white dark:focus:bg-gray-900"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                             <label htmlFor="password" className="sr-only">كلمة المرور</label>
                            <div className="relative">
                                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <KeyIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="كلمة المرور"
                                    className="w-full pr-10 pl-4 py-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition text-gray-900 dark:bg-gray-700 dark:text-white dark:focus:bg-gray-900"
                                    required
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        
                        <button
                            type="submit"
                            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            تسجيل الدخول
                        </button>
                    </form>
                </div>
                <p className="text-center text-gray-500 text-sm mt-6 dark:text-gray-400">
                    🌿 بيانات دقيقة.. تواصل أسرع 🌿
                </p>
                 <p className="text-center text-gray-400 text-xs mt-6 dark:text-gray-500">
                    &copy; {new Date().getFullYear()} تجمع تبوك الصحي. جميع الحقوق محفوظة.
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;