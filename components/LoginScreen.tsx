import React, { useState, useEffect, useRef } from 'react';
import { UserIcon, KeyIcon, ArrowLeftOnRectangleIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon, FingerprintIcon } from '../icons/Icons';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, WebAuthnCredential } from '../types';
import InactiveAccountModal from './InactiveAccountModal';
import { supabase } from '../lib/supabaseClient';
import { base64UrlToArrayBuffer, arrayBufferToBase64Url } from '../lib/webauthnHelpers';
import WebAuthnPromptModal from './WebAuthnPromptModal';
import ForgotPasswordModal from './ForgotPasswordModal';


type NotificationType = 'success' | 'error' | 'info';

// FIX: Define BaseUser locally to match the type returned from verifyCredentials and supabase queries.
type BaseUser = Omit<User, 'permissions'>;

const welcomeSteps = [
    { id: 1, text: "جاري التحقق من الهوية..." },
    { id: 2, text: "تجهيز بيئة العمل..." },
    { id: 3, text: "جلب أحدث البيانات..." },
    { id: 4, text: "وضع اللمسات الأخيرة..." },
    { id: 5, text: "أهلاً بك في منصة تجمع تبوك الصحي!" }
];

// FIX: Update currentUser prop to accept BaseUser, as it only needs properties available in BaseUser.
const WelcomeAnimation: React.FC<{ onComplete: () => void; currentUser: BaseUser | null; }> = ({ onComplete, currentUser }) => {
    const [progress, setProgress] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const animationFrameId = useRef<number | null>(null);
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        const stepDuration = 1000;
        const totalSteps = welcomeSteps.length;
        const totalDuration = stepDuration * totalSteps;
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const rawProgress = Math.min((elapsed / totalDuration) * 100, 100);
            setProgress(rawProgress);
            const calculatedStepIndex = Math.min(Math.floor((rawProgress / 100) * totalSteps), totalSteps - 1);
            setCurrentStepIndex(calculatedStepIndex);

            if (elapsed < totalDuration) {
                animationFrameId.current = requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    onCompleteRef.current?.();
                }, 500);
            }
        };

        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, []);

    return (
        <div className="text-center animate-fade-in py-8">
            <div className="flex flex-col items-center justify-center gap-4 mb-8">
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500">
                        مرحباً بعودتك
                    </span>
                </h2>
                <div className="px-6 py-2 bg-white/40 dark:bg-gray-800/40 border-2 border-dashed border-primary/30 dark:border-primary/40 rounded-2xl">
                    <span className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-light pb-1" dir="auto">
                        {currentUser?.full_name}
                    </span>
                </div>
            </div>
            
            <div className="h-8 flex items-center justify-center mb-6">
                 <p 
                    key={currentStepIndex} 
                    className="text-gray-700 dark:text-gray-300 font-semibold text-lg animate-step-text-fade flex items-center gap-2"
                 >
                    {currentStepIndex === welcomeSteps.length - 1 && <CheckCircleIcon className="w-5 h-5 text-green-500"/>}
                    {welcomeSteps[currentStepIndex].text}
                 </p>
            </div>
            
            <div className="w-full max-w-xs mx-auto px-4 mt-4">
                <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                        className="absolute top-0 right-0 h-full bg-gradient-to-l from-primary to-teal-500 rounded-full"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-[28px] z-10">
                            <div className="bg-primary dark:bg-primary-light text-white dark:text-gray-900 text-xs font-bold px-2 py-1 rounded-md shadow-lg min-w-[36px] text-center relative">
                                {Math.round(progress)}%
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary dark:bg-primary-light rotate-45"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoginScreen: React.FC = () => {
    const { verifyCredentials, performLogin } = useAuth();
    const { logos } = useTheme();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isWebAuthnSubmitting, setIsWebAuthnSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
    const [showInactiveAccountModal, setShowInactiveAccountModal] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [webAuthnPrompt, setWebAuthnPrompt] = useState<{ isOpen: boolean; status: 'scanning' | 'success' | 'failed' }>({ isOpen: false, status: 'scanning' });
    const [view, setView] = useState<'login' | 'welcome'>('login');
    // FIX: Update verifiedUser state to use BaseUser type, resolving the type mismatch error.
    const [verifiedUser, setVerifiedUser] = useState<BaseUser | null>(null);

    useEffect(() => {
        const logoutMessage = sessionStorage.getItem('logoutMessage');
        if (logoutMessage) {
            showNotification(logoutMessage, 'info', 2000);
            sessionStorage.removeItem('logoutMessage');
        }
    }, []);

    const showNotification = (message: string, type: NotificationType, duration: number = 2000) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, duration);
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotification(null);
        setIsSubmitting(true);

        try {
            const result = await verifyCredentials(username, password);
            
            if (result === 'INACTIVE_ACCOUNT') {
                setShowInactiveAccountModal(true);
            } else if (result) {
                setVerifiedUser(result);
                setView('welcome');
            } else {
                showNotification('اسم المستخدم أو كلمة المرور غير صحيحة.', 'error', 3000);
                setPassword('');
            }
        } catch (error) {
            console.error(error);
            showNotification('حدث خطأ غير متوقع.', 'error', 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWebAuthnLogin = async () => {
        setIsWebAuthnSubmitting(true);
        setNotification(null);
        setWebAuthnPrompt({ isOpen: true, status: 'scanning' });

        if (!navigator.credentials || !navigator.credentials.get) {
            showNotification('جهازك لا يدعم تسجيل الدخول بالبصمة أو الوجه.', 'error', 4000);
            setIsWebAuthnSubmitting(false);
            setWebAuthnPrompt({ isOpen: false, status: 'failed' });
            return;
        }

        try {
            const { data: credentials, error: fetchError } = await supabase
                .from('webauthn_credentials')
                .select('*');
            
            if (fetchError) throw fetchError;
            if (!credentials || credentials.length === 0) {
                 setWebAuthnPrompt({ isOpen: false, status: 'failed' });
                 showNotification('لم يتم ربط أي بصمة. يرجى تسجيل الدخول وإعدادها من الإعدادات.', 'info', 4000);
                 setIsWebAuthnSubmitting(false);
                return;
            }

            const allowCredentials = credentials.map((cred: WebAuthnCredential) => ({
                type: 'public-key' as PublicKeyCredentialType,
                id: base64UrlToArrayBuffer(cred.credential_id),
            }));
            
            const challenge = crypto.getRandomValues(new Uint8Array(32));

            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge,
                    allowCredentials,
                    userVerification: 'preferred',
                    rpId: window.location.hostname,
                },
            }) as PublicKeyCredential;

            if (!assertion) {
                throw new Error('فشل التحقق من الهوية.');
            }

            setWebAuthnPrompt(prev => ({ ...prev, status: 'success' }));

            const assertedCredentialId = arrayBufferToBase64Url(assertion.rawId);
            const matchingCredential = credentials.find(c => c.credential_id === assertedCredentialId);

            if (!matchingCredential) {
                throw new Error('لم يتم العثور على البصمة المسجلة.');
            }

            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*, role:roles(*)')
                .eq('user_id', matchingCredential.user_id)
                .single();
            
            if (userError || !user) throw new Error('لم يتم العثور على حساب المستخدم المرتبط.');
            
            if (!user.is_active) {
                setShowInactiveAccountModal(true);
                setWebAuthnPrompt({ isOpen: false, status: 'failed' });
                return;
            }
            
            await sleep(1000);
            setVerifiedUser(user);
            setView('welcome');
            setWebAuthnPrompt({ isOpen: false, status: 'scanning' });

        } catch (error: any) {
            console.error("WebAuthn login error:", error);
            setWebAuthnPrompt(prev => ({ ...prev, status: 'failed' }));
            
            await sleep(2000);
            setWebAuthnPrompt({ isOpen: false, status: 'scanning' });

            let message = 'حدث خطأ أثناء تسجيل الدخول بالبصمة.';
            if (error.name === 'NotAllowedError') {
                message = 'تم إلغاء عملية التحقق.';
            }
            showNotification(message, 'error', 4000);
        } finally {
            setIsWebAuthnSubmitting(false);
        }
    };
    
    const handleWelcomeComplete = async () => {
        if (verifiedUser) {
            await performLogin(verifiedUser);
        }
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowForgotPasswordModal(true);
    };
    
    const notificationConfig = {
        success: { icon: <CheckCircleIcon className="h-5 w-5"/>, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
        error: { icon: <XCircleIcon className="h-5 w-5"/>, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
        info: { icon: <InformationCircleIcon className="h-5 w-5"/>, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    };
    
    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
            <div className="absolute top-4 left-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-md mx-auto">
                <img
                    src={logos.loginLogoUrl}
                    alt="شعار الشركة الصحية القابضة"
                    className="w-56 h-auto mx-auto mb-10"
                />
                
                {view === 'login' ? (
                    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 dark:bg-gray-800/80 dark:backdrop-blur-sm dark:border dark:border-gray-700">
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">أهلاً بك</h1>
                                <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">سجّل الدخول لتجربة إدارة أسرع وأذكى</p>
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
                                            onChange={(e) => {
                                                setUsername(e.target.value);
                                            }}
                                            placeholder="اسم المستخدم"
                                            className={`w-full pr-10 pl-4 py-2.5 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition dark:focus:bg-gray-900 dark:focus:text-white bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white`}
                                            required
                                            autoComplete="username"
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
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                            }}
                                            placeholder="كلمة المرور"
                                            className={`w-full pr-10 pl-4 py-2.5 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition dark:focus:bg-gray-900 dark:focus:text-white bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white`}
                                            required
                                            autoComplete="current-password"
                                        />
                                    </div>
                                    <div className="text-left mt-2">
                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            className="text-sm font-semibold text-primary hover:underline focus:outline-none dark:text-primary-light"
                                        >
                                            نسيت كلمة السر؟
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex flex-col items-stretch gap-3">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || isWebAuthnSubmitting}
                                            className="btn btn-primary w-full"
                                            style={{ minHeight: '2.75rem', borderRadius: '0.5rem' }}
                                        >
                                            {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                                            {!isSubmitting && <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleWebAuthnLogin}
                                            disabled={isWebAuthnSubmitting || isSubmitting}
                                            className={`btn btn-secondary w-full gap-2 transition-opacity duration-200 ${webAuthnPrompt.isOpen ? 'opacity-0' : 'opacity-100'}`}
                                            title="تسجيل الدخول بالبصمة"
                                            aria-label="تسجيل الدخول بالبصمة"
                                            style={{ borderRadius: '0.5rem' }}
                                        >
                                            <span>دخول بالبصمة</span>
                                            <FingerprintIcon className="h-6 w-6"/>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </>
                    </div>
                ) : (
                    <WelcomeAnimation onComplete={handleWelcomeComplete} currentUser={verifiedUser} />
                )}


                <div className="h-16 mt-2 flex items-center justify-center">
                    {notification && (
                        <div className={`w-full text-center p-3 rounded-lg flex items-center justify-center gap-2 animate-fade-in font-semibold text-sm ${notificationConfig[notification.type].className}`}>
                            {notificationConfig[notification.type].icon}
                            <span>{notification.message}</span>
                        </div>
                    )}
                </div>

                <p className="text-center text-gray-500 text-sm dark:text-gray-400">
                    🌿 بيانات دقيقة.. تواصل أسرع 🌿
                </p>
                 <p className="text-center text-gray-400 text-xs mt-6 dark:text-gray-500">
                    &copy; {new Date().getFullYear()} تجمع تبوك الصحي. جميع الحقوق محفوظة.
                </p>
            </div>

             <InactiveAccountModal 
                isOpen={showInactiveAccountModal}
                onClose={() => setShowInactiveAccountModal(false)}
            />
            <WebAuthnPromptModal 
                isOpen={webAuthnPrompt.isOpen}
                status={webAuthnPrompt.status}
                onClose={() => setWebAuthnPrompt({ isOpen: false, status: 'scanning' })}
            />
            <ForgotPasswordModal 
                isOpen={showForgotPasswordModal}
                onClose={() => setShowForgotPasswordModal(false)}
            />
        </div>
    );
};

export default LoginScreen;