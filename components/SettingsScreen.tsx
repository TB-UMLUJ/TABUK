
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../lib/supabaseClient';
import { Policy } from '../types';
import { 
    CloseIcon, 
    ChevronLeftIcon, 
    ArrowRightOnRectangleIcon, 
    KeyIcon, 
    InformationCircleIcon, 
    UsersRolesIcon, 
    ListBulletIcon, 
    BookOpenIcon, 
    ArrowDownTrayIcon, 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    BellIcon, 
    FingerprintIcon, 
    Bars3Icon, 
    EmailIcon, 
    ArrowBackIcon, 
    UserIcon, 
    SunIcon, 
    ClockIcon, 
    ClipboardDocumentListIcon, 
    SparklesIcon, 
    ExclamationTriangleIcon, 
    CloudArrowUpIcon, 
    StarIcon, 
    PhoneIcon, 
    ChevronDownIcon, 
    ArrowPathIcon 
} from '../icons/Icons';
import AboutModal from './AboutModal';
import { useAuth } from '../contexts/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import UserRoleManagementView from './UserRoleManagementView';
import ActivityLogView from './ActivityLogView';
import { useToast } from '../contexts/ToastContext';
import AddPolicyModal from './AddPolicyModal';
import ConfirmationModal from './ConfirmationModal';
import { logActivity } from '../lib/activityLogger';
import WebAuthnManagementView from './WebAuthnManagementView';
import UserGuide from './UserGuide';
import ToggleSwitch from './ToggleSwitch';

interface SettingsScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

type SettingsView = 
    | 'main' 
    | 'userRoleManagement' 
    | 'activityLog' 
    | 'governance' 
    | 'webauthn' 
    | 'userGuide' 
    | 'contactUs'
    // New Pages
    | 'profile'
    | 'notifications'
    | 'appearance'
    | 'sessions'
    | 'loginHistory'
    | 'dropdowns'
    | 'archiving'
    | 'branding'
    | 'backup'
    | 'faq'
    | 'changelog'
    | 'bugReport';


const UpdateAppView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const messages = [
            "جاري البحث عن تحديثات...",
            "تم العثور على تحديث!",
            "تنزيل الحزمة...",
            "تثبيت التحديثات...",
            "إعادة تشغيل التطبيق...",
        ];

        const messageInterval = setInterval(() => {
            setCurrentMessageIndex(prev => {
                if (prev >= messages.length - 1) {
                    clearInterval(messageInterval);
                    return prev;
                }
                return prev + 1;
            });
        }, 800);

        const completeTimeout = setTimeout(() => {
            onComplete();
        }, 800 * messages.length + 500);

        return () => {
            clearInterval(messageInterval);
            clearTimeout(completeTimeout);
        };
    }, [onComplete]);

    // Use Portal to render outside the parent stacking context (SettingsScreen)
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center text-white animate-fade-in">
            <div className="relative mb-8">
                 <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                 <ArrowPathIcon className="w-24 h-24 text-primary-light animate-spin" style={{ animationDuration: '2s' }} />
            </div>
            <h2 className="text-2xl font-bold tracking-wider">جاري تحديث التطبيق</h2>
            <p className="text-gray-300 mt-2 animate-fade-in text-center h-6">
                {
                    ["جاري البحث عن تحديثات...", "تم العثور على تحديث!", "تنزيل الحزمة...", "تثبيت التحديثات...", "إعادة تشغيل التطبيق..."][currentMessageIndex]
                }
            </p>
            <div className="w-full max-w-xs mt-6 overflow-hidden rounded-full bg-gray-700 h-2">
                <div className="bg-primary h-full rounded-full" style={{ width: `${((currentMessageIndex + 1) / 5) * 100}%`, transition: 'width 0.8s ease-in-out' }}></div>
            </div>
        </div>,
        document.body
    );
};


const SettingsScreen: React.FC<SettingsScreenProps> = ({ isOpen, onClose }) => {
    const { logout, hasPermission } = useAuth();
    const [isClosing, setIsClosing] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentView, setCurrentView] = useState<SettingsView>('main');
    const [showUpdateScreen, setShowUpdateScreen] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setCurrentView('main');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    }, [onClose]);

    const handleRequestNotificationPermission = () => {
        if (!("Notification" in window)) {
            addToast('غير مدعوم', 'متصفحك لا يدعم الإشعارات.', 'error');
            return;
        }

        if (Notification.permission === "granted") {
            addToast('مفعلة بالفعل', 'الإشعارات مفعلة بالفعل لهذا الموقع.', 'info');
        } else if (Notification.permission === "denied") {
            addToast('محظورة', 'تم حظر الإشعارات. يرجى تفعيلها من إعدادات المتصفح.', 'warning');
        } else {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    addToast('تم التفعيل', 'تم تفعيل الإشعارات بنجاح!', 'success');
                    new Notification("أهلاً بك!", { body: "ستتلقى الآن آخر التحديثات." });
                } else {
                    addToast('تم الرفض', 'لم يتم منح إذن الإشعارات.', 'info');
                }
            });
        }
    };
    
    const handleUpdateComplete = useCallback(() => {
        sessionStorage.setItem('appIsUpdating', 'true');
        window.location.reload();
    }, []);
    
    if (!isOpen) {
        return null;
    }

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const renderView = () => {
        switch(currentView) {
            // Existing Views
            case 'userRoleManagement': return <UserRoleManagementView />;
            case 'activityLog': return <ActivityLogView />;
            case 'governance': return <GovernanceCenterContent />;
            case 'webauthn': return <WebAuthnManagementView />;
            case 'userGuide': return <UserGuide />;
            case 'contactUs': return <ContactUsView />;
            
            // New Views (Text Only / Placeholders)
            case 'profile': return <ProfileView />;
            case 'notifications': return <NotificationsView onEnable={handleRequestNotificationPermission} />;
            case 'appearance': return <AppearanceView />;
            case 'sessions': return <ActiveSessionsView />;
            case 'loginHistory': return <LoginHistoryView />;
            case 'dropdowns': return <DropdownManagementView />;
            case 'archiving': return <ArchivingSettingsView />;
            case 'branding': return <BrandingView />;
            case 'backup': return <BackupManagementView />;
            case 'faq': return <FAQView />;
            case 'changelog': return <ChangelogView />;
            case 'bugReport': return <BugReportView />;
            
            case 'main':
            default: return <MainSettingsContent 
                onNavigate={setCurrentView} 
                onLogout={logout} 
                onShowChangePassword={() => setShowChangePasswordModal(true)}
                onShowAbout={() => setShowAboutModal(true)}
                onShowUpdateScreen={() => setShowUpdateScreen(true)}
                hasPermission={hasPermission}
            />;
        }
    };

    const viewTitles: Record<SettingsView, string> = {
        main: 'الإعدادات',
        userRoleManagement: 'إدارة المستخدمين والأدوار',
        activityLog: 'سجل النشاطات',
        governance: 'مركز الحوكمة والسياسات',
        webauthn: 'الدخول بالبصمة / الوجه',
        userGuide: 'دليل الاستخدام',
        contactUs: 'اتصل بنا',
        profile: 'الملف الشخصي',
        notifications: 'تفضيلات الإشعارات',
        appearance: 'المظهر وإمكانية الوصول',
        sessions: 'الجلسات النشطة',
        loginHistory: 'سجل الدخول',
        dropdowns: 'إدارة القوائم',
        archiving: 'إعدادات الأرشفة',
        branding: 'تخصيص الهوية',
        backup: 'النسخ الاحتياطي',
        faq: 'الأسئلة الشائعة',
        changelog: 'سجل التحديثات',
        bugReport: 'الإبلاغ عن مشكلة',
    };
    
    return ReactDOM.createPortal(
        <div 
            className={`fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 overflow-y-auto ${isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'}`}
            role="dialog"
            aria-modal="true"
        >
            {showUpdateScreen && <UpdateAppView onComplete={handleUpdateComplete} />}
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                     <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {viewTitles[currentView]}
                    </h1>
                    <button
                        onClick={currentView === 'main' ? handleClose : () => setCurrentView('main')}
                        className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                        aria-label={currentView === 'main' ? 'إغلاق' : 'رجوع'}
                    >
                         {currentView === 'main' ? <CloseIcon className="h-6 w-6" /> : <ArrowBackIcon className="h-6 w-6" />}
                    </button>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-6 pb-24">
                {renderView()}
            </main>

            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
            <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />
        </div>,
        modalRoot
    );
};


const MainSettingsContent: React.FC<{
    onNavigate: (view: SettingsView) => void;
    onLogout: () => void;
    onShowChangePassword: () => void;
    onShowAbout: () => void;
    onShowUpdateScreen: () => void;
    hasPermission: (permission: string) => boolean;
}> = (props) => {
    
    const canAccessGovernance = 
        props.hasPermission('manage_policies') || 
        props.hasPermission('view_policies') || 
        props.hasPermission('edit_policy') || 
        props.hasPermission('delete_policy');
        
    const isAdmin = props.hasPermission('manage_users'); // Assuming manage_users is admin-level

    return (
        <div className="space-y-6">
            
            {/* Experimental Data Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold text-amber-800 dark:text-amber-200 text-base">تنويه هام</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                        يرجى ملاحظة أن جميع البيانات والأرقام المعروضة في هذا التطبيق هي بيانات تجريبية ووهمية لأغراض العرض والاختبار فقط، ولا تمثل بيانات حقيقية.
                    </p>
                </div>
            </div>

            {/* قسم الحساب */}
            <div>
                 <h2 className="px-2 mb-2 font-semibold text-gray-500 text-sm">الحساب الشخصي</h2>
                 <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <SettingsItem icon={<UserIcon className="w-6 h-6 text-teal-500"/>} title="الملف الشخصي" onClick={() => props.onNavigate('profile')} />
                    <SettingsItem icon={<BellIcon className="w-6 h-6 text-orange-500"/>} title="تفضيلات الإشعارات" onClick={() => props.onNavigate('notifications')} />
                    <SettingsItem icon={<FingerprintIcon className="w-6 h-6 text-purple-500"/>} title="إدارة الدخول بالبصمة" onClick={() => props.onNavigate('webauthn')} />
                    <SettingsItem icon={<KeyIcon className="w-6 h-6 text-gray-500"/>} title="تغيير كلمة المرور" onClick={props.onShowChangePassword} />
                    <SettingsItem icon={<SunIcon className="w-6 h-6 text-yellow-500"/>} title="المظهر وإمكانية الوصول" onClick={() => props.onNavigate('appearance')} />
                    <SettingsItem icon={<ClockIcon className="w-6 h-6 text-blue-500"/>} title="الجلسات النشطة" onClick={() => props.onNavigate('sessions')} />
                    <SettingsItem icon={<ClipboardDocumentListIcon className="w-6 h-6 text-indigo-500"/>} title="سجل الدخول" onClick={() => props.onNavigate('loginHistory')} isLast />
                 </div>
            </div>

            {/* قسم الإدارة والنظام (للمسؤولين) */}
            { (isAdmin || props.hasPermission('view_activity_log') || canAccessGovernance) && (
                 <div>
                    <h2 className="px-2 mb-2 font-semibold text-gray-500 text-sm">إدارة النظام</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        {props.hasPermission('manage_users') && (
                            <SettingsItem icon={<UsersRolesIcon className="w-6 h-6 text-blue-600"/>} title="المستخدمين والأدوار" onClick={() => props.onNavigate('userRoleManagement')} />
                        )}
                        {props.hasPermission('view_activity_log') && (
                            <SettingsItem icon={<Bars3Icon className="w-6 h-6 text-yellow-600"/>} title="سجل النشاطات" onClick={() => props.onNavigate('activityLog')} />
                        )}
                        {canAccessGovernance && (
                            <SettingsItem icon={<BookOpenIcon className="w-6 h-6 text-emerald-600"/>} title="مركز الحوكمة والسياسات" onClick={() => props.onNavigate('governance')} />
                        )}
                        {isAdmin && (
                            <>
                                <SettingsItem icon={<ListBulletIcon className="w-6 h-6 text-pink-500"/>} title="إدارة القوائم المنسدلة" onClick={() => props.onNavigate('dropdowns')} />
                                <SettingsItem icon={<ArrowDownTrayIcon className="w-6 h-6 text-gray-600"/>} title="إعدادات الأرشفة" onClick={() => props.onNavigate('archiving')} />
                                <SettingsItem icon={<StarIcon className="w-6 h-6 text-amber-500"/>} title="تخصيص الهوية" onClick={() => props.onNavigate('branding')} />
                                <SettingsItem icon={<CloudArrowUpIcon className="w-6 h-6 text-sky-600"/>} title="إدارة النسخ الاحتياطي" onClick={() => props.onNavigate('backup')} isLast={!isAdmin} />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* قسم الدعم والمساعدة */}
             <div>
                 <h2 className="px-2 mb-2 font-semibold text-gray-500 text-sm">الدعم والمعلومات</h2>
                 <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <SettingsItem icon={<InformationCircleIcon className="w-6 h-6 text-blue-400"/>} title="الأسئلة الشائعة" onClick={() => props.onNavigate('faq')} />
                    <SettingsItem icon={<SparklesIcon className="w-6 h-6 text-amber-400"/>} title="سجل التحديثات" onClick={() => props.onNavigate('changelog')} />
                    <SettingsItem icon={<BookOpenIcon className="w-6 h-6 text-indigo-500"/>} title="دليل الاستخدام" onClick={() => props.onNavigate('userGuide')} />
                    <SettingsItem icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-400"/>} title="الإبلاغ عن مشكلة" onClick={() => props.onNavigate('bugReport')} />
                    <SettingsItem icon={<EmailIcon className="w-6 h-6 text-green-500"/>} title="اتصل بنا" onClick={() => props.onNavigate('contactUs')} />
                    <SettingsItem icon={<ArrowPathIcon className="w-6 h-6 text-cyan-500"/>} title="تحديث التطبيق" onClick={props.onShowUpdateScreen} />
                    <SettingsItem icon={<InformationCircleIcon className="w-6 h-6 text-gray-400"/>} title="حول التطبيق" onClick={props.onShowAbout} isLast />
                 </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                 <SettingsItem icon={<ArrowRightOnRectangleIcon className="w-6 h-6 text-red-500"/>} title="تسجيل الخروج" onClick={props.onLogout} isLast />
            </div>
            
            <p className="text-center text-xs text-gray-400 dark:text-gray-600">
                Version 1.3.0
            </p>
        </div>
    );
};

const SettingsItem: React.FC<{ icon: React.ReactNode; title: string; onClick: () => void; isLast?: boolean; }> = ({ icon, title, onClick, isLast }) => (
    <button
        onClick={onClick}
        className={`w-full text-right p-4 flex items-center justify-between transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!isLast ? 'border-b border-gray-100 dark:border-gray-700/50' : ''}`}
    >
        <div className="flex items-center gap-4">
            {icon}
            <span className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">{title}</span>
        </div>
        <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
    </button>
);

// --- New Text-Only/Placeholder Views ---

const ProfileView: React.FC = () => {
    const { currentUser } = useAuth();
    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col items-center py-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-3xl font-bold text-primary mb-4">
                    {currentUser?.full_name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser?.full_name}</h2>
                <p className="text-gray-500 dark:text-gray-400">@{currentUser?.username}</p>
             </div>
             
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                    <span className="text-gray-500 dark:text-gray-400">المسمى الوظيفي</span>
                    <span className="font-semibold text-gray-800 dark:text-white">مسؤول نظام</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                    <span className="text-gray-500 dark:text-gray-400">رقم الجوال</span>
                    <span className="font-semibold text-gray-800 dark:text-white">+966 5X XXX XXXX</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">البريد الإلكتروني</span>
                    <span className="font-semibold text-gray-800 dark:text-white">{currentUser?.username}@moh.gov.sa</span>
                </div>
             </div>
        </div>
    );
};

const NotificationsView: React.FC<{ onEnable: () => void }> = ({ onEnable }) => (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">إشعارات المتصفح</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">تفعيل التنبيهات المنبثقة</p>
                </div>
                <button onClick={onEnable} className="text-primary font-bold text-sm">تفعيل</button>
            </div>
             <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">المهام الجديدة</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">عند إسناد مهمة جديدة لك</p>
                </div>
                <ToggleSwitch checked={true} onChange={() => {}} ariaLabel="Toggle tasks" />
            </div>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">المعاملات الواردة</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">تنبيه عند وصول معاملة جديدة</p>
                </div>
                <ToggleSwitch checked={true} onChange={() => {}} ariaLabel="Toggle transactions" />
            </div>
             <div className="p-4 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">ملخص يومي</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">استلام ملخص عبر البريد الإلكتروني</p>
                </div>
                <ToggleSwitch checked={false} onChange={() => {}} ariaLabel="Toggle summary" />
            </div>
        </div>
    </div>
);

const AppearanceView: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">إعدادات العرض</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">حجم الخط</span>
                    <select className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1">
                        <option>صغير</option>
                        <option selected>متوسط</option>
                        <option>كبير</option>
                    </select>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">لغة التطبيق</span>
                    <select className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1">
                        <option selected>العربية</option>
                        <option>English</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
);

const ActiveSessionsView: React.FC = () => (
    <div className="space-y-4 animate-fade-in">
        <p className="text-sm text-gray-500 dark:text-gray-400 px-2">الأجهزة التي تم تسجيل الدخول منها حالياً:</p>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full"><UserIcon className="w-5 h-5 text-green-600"/></div>
                    <div>
                        <p className="font-bold text-gray-800 dark:text-white">Windows PC - Chrome</p>
                        <p className="text-xs text-green-600 dark:text-green-400">الجهاز الحالي • الرياض</p>
                    </div>
                </div>
            </div>
             <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full"><PhoneIcon className="w-5 h-5 text-gray-500"/></div>
                    <div>
                        <p className="font-bold text-gray-800 dark:text-white">iPhone 13</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">آخر نشاط منذ ساعتين • تبوك</p>
                    </div>
                </div>
                <button className="text-red-500 text-sm font-semibold">خروج</button>
            </div>
        </div>
    </div>
);

const LoginHistoryView: React.FC = () => (
     <div className="animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                    <tr>
                        <th className="p-4">التاريخ</th>
                        <th className="p-4">الجهاز</th>
                        <th className="p-4">الحالة</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    <tr>
                        <td className="p-4 text-gray-800 dark:text-white">2024-05-20 10:30 AM</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">Chrome / Windows</td>
                        <td className="p-4 text-green-500 font-bold">ناجح</td>
                    </tr>
                    <tr>
                        <td className="p-4 text-gray-800 dark:text-white">2024-05-19 08:15 PM</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">Safari / iOS</td>
                        <td className="p-4 text-green-500 font-bold">ناجح</td>
                    </tr>
                     <tr>
                        <td className="p-4 text-gray-800 dark:text-white">2024-05-18 09:00 AM</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">Chrome / Windows</td>
                        <td className="p-4 text-red-500 font-bold">فشل (كلمة مرور)</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

const DropdownManagementView: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <p className="text-gray-500 dark:text-gray-400 text-sm">إدارة محتويات القوائم المنسدلة في النظام.</p>
        
        {['القطاعات', 'المراكز الصحية', 'المسميات الوظيفية', 'الجنسيات'].map(listName => (
            <div key={listName} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 dark:text-white">{listName}</h3>
                <button className="btn btn-sm btn-secondary">إدارة القائمة</button>
            </div>
        ))}
    </div>
);

const ArchivingSettingsView: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">قواعد الأرشفة التلقائية</h3>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">أرشفة المعاملات المكتملة بعد</span>
                    <select className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1">
                        <option>6 أشهر</option>
                        <option>سنة واحدة</option>
                        <option>سنتين</option>
                    </select>
                </div>
                 <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">حذف السجلات المؤقتة كل</span>
                    <select className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1">
                        <option>30 يوم</option>
                        <option>60 يوم</option>
                    </select>
                </div>
                
                <button className="btn btn-primary w-full mt-4">حفظ الإعدادات</button>
            </div>
        </div>
    </div>
);

const BrandingView: React.FC = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-500">منطقة معاينة الشعار</p>
            </div>
            <button className="btn btn-secondary">رفع شعار جديد</button>
            
             <div className="mt-6 text-right space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المنصة</label>
                    <input type="text" value="تجمع تبوك الصحي" className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اللون الأساسي</label>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#008755] cursor-pointer ring-2 ring-offset-2 ring-primary"></div>
                        <div className="w-8 h-8 rounded-full bg-blue-600 cursor-pointer"></div>
                        <div className="w-8 h-8 rounded-full bg-purple-600 cursor-pointer"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const BackupManagementView: React.FC = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
                <CloudArrowUpIcon className="w-10 h-10 text-primary"/>
                <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">النسخ الاحتياطي للبيانات</h3>
                    <p className="text-sm text-gray-500">آخر نسخة احتياطية: 2024-05-20</p>
                </div>
            </div>
            
            <button className="btn btn-primary w-full mb-4">إنشاء نسخة احتياطية الآن</button>
            <button className="btn btn-secondary w-full">تحميل نسخة (.JSON)</button>
        </div>
    </div>
);

const FAQView: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const faqs = [
        { q: 'كيف يمكنني إضافة موظف جديد؟', a: 'يمكنك إضافة موظف من خلال قسم "الموظفين" ثم الضغط على زر "إضافة" في الأعلى. ستظهر لك نافذة لإدخال البيانات الأساسية والوظيفية.' },
        { q: 'كيف أربط معاملة بموظف؟', a: 'عند إنشاء أو تعديل معاملة، اختر "ربط بموظف" من القائمة المنسدلة وابحث عن الاسم أو الرقم الوظيفي ثم اختره من القائمة.' },
        { q: 'هل يمكنني استعادة البيانات المحذوفة؟', a: 'للأسف، الحذف نهائي حالياً لضمان دقة البيانات. يظهر لك دائماً تحذير قبل الحذف للتأكيد. ننصح بأخذ نسخ احتياطية دورية.' },
        { q: 'كيف أفعل الإشعارات؟', a: 'اذهب إلى الإعدادات > تفضيلات الإشعارات واضغط على "تفعيل" في الأعلى للسماح للمتصفح بإرسال التنبيهات.' },
        { q: 'كيف أقوم بتغيير كلمة المرور؟', a: 'من قائمة الإعدادات الرئيسية، اختر "تغيير كلمة المرور". ستحتاج لإدخال كلمة المرور الحالية ثم الجديدة وتأكيدها.' },
        { q: 'ما هو مركز الحوكمة؟', a: 'هو قسم مخصص لعرض وتحميل السياسات والإجراءات المعتمدة في التجمع. يمكن للمسؤولين فقط إضافة أو تعديل السياسات.' }
    ];

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {faqs.map((item, index) => (
                    <div key={index} className={`border-b border-gray-100 dark:border-gray-700 last:border-0`}>
                        <button
                            onClick={() => toggleAccordion(index)}
                            className="w-full flex items-center justify-between p-4 text-right focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <span className={`font-bold text-sm sm:text-base ${activeIndex === index ? 'text-primary dark:text-primary-light' : 'text-gray-800 dark:text-white'}`}>
                                {item.q}
                            </span>
                            <ChevronDownIcon 
                                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeIndex === index ? 'rotate-180 text-primary' : ''}`} 
                            />
                        </button>
                        {activeIndex === index && (
                            <div className="animate-fade-in">
                                <div className="p-4 pt-0 text-gray-600 dark:text-gray-300 text-sm leading-relaxed border-t border-dashed border-gray-100 dark:border-gray-700 mt-2">
                                    {item.a}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ChangelogView: React.FC = () => (
    <div className="relative border-r-2 border-gray-200 dark:border-gray-700 mr-4 space-y-8 animate-fade-in">
        <div className="relative pr-6">
            <div className="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">الإصدار 1.3.0 <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full mr-2">الحالي</span></h3>
            <p className="text-xs text-gray-400 mb-2">20 مايو 2024</p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>إضافة ميزة الدخول بالبصمة.</li>
                <li>تحسين واجهة الإحصائيات.</li>
                <li>إضافة مركز الحوكمة والسياسات.</li>
            </ul>
        </div>
        <div className="relative pr-6 opacity-70">
            <div className="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-900"></div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">الإصدار 1.2.0</h3>
            <p className="text-xs text-gray-400 mb-2">10 أبريل 2024</p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>إطلاق ميزة إدارة المهام.</li>
                <li>تحديث نظام البحث الشامل.</li>
            </ul>
        </div>
    </div>
);

const BugReportView: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">الإبلاغ عن مشكلة فنية</h3>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان المشكلة</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="مثلاً: لا يمكنني رفع ملف" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وصف التفاصيل</label>
                <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="اشرح الخطوات التي أدت للمشكلة..."></textarea>
            </div>
            <button className="btn btn-primary w-full">إرسال التقرير</button>
        </form>
    </div>
);

// --- End New Views ---

const GovernanceCenterContent: React.FC = () => {
    const { hasPermission, currentUser } = useAuth();
    const { addToast } = useToast();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
    const [policyToEdit, setPolicyToEdit] = useState<Policy | null>(null);
    const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);

    const fetchPolicies = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('policies')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setPolicies(data || []);
        } catch (error: any) {
            addToast('خطأ', `فشل تحميل السياسات: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    const handleAddPolicy = () => {
        setPolicyToEdit(null);
        setShowAddPolicyModal(true);
    };
    
    const handleEditPolicy = (policy: Policy) => {
        setPolicyToEdit(policy);
        setShowAddPolicyModal(true);
    };

    const handleDeletePolicy = async () => {
        if (!policyToDelete) return;

        try {
            if (policyToDelete.file_name) {
                const { error: storageError } = await supabase.storage.from('policies').remove([policyToDelete.file_name]);
                if (storageError) {
                    console.error("Could not delete policy file from storage:", storageError.message);
                    addToast('تحذير', 'لم يتم حذف الملف المرفق من وحدة التخزين.', 'warning');
                }
            }
            
            const { error: dbError } = await supabase.from('policies').delete().eq('id', policyToDelete.id);
            if (dbError) throw dbError;

            await logActivity(currentUser, 'DELETE_POLICY', { policyId: policyToDelete.id, policyTitle: policyToDelete.title });

            addToast('تم الحذف', `تم حذف السياسة "${policyToDelete.title}" بنجاح.`, 'deleted');
            fetchPolicies();
        } catch (error: any) {
             addToast('خطأ', `فشل حذف السياسة: ${error.message}`, 'error');
        } finally {
            setPolicyToDelete(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-600 border-t-primary"></div></div>;
    }

    return (
        <div className="animate-fade-in">
            {hasPermission('manage_policies') && (
                <div className="text-left mb-6">
                    <button onClick={handleAddPolicy} className="btn btn-primary gap-2">
                        <PlusIcon className="w-5 h-5"/>
                        إضافة سياسة جديدة
                    </button>
                </div>
            )}
            
            {policies.length > 0 ? (
                <div className="space-y-4">
                    {policies.map(policy => (
                        <div key={policy.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start gap-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex-1 min-w-0 w-full">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate mb-2">{policy.title}</h4>
                                {policy.description && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{policy.description}</p>}
                                
                                <div className="flex flex-wrap items-center gap-3 w-full">
                                    {policy.file_url && (
                                        <a 
                                            href={policy.file_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-lg hover:-translate-y-0.5 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary dark:hover:text-white flex-grow sm:flex-grow-0 justify-center"
                                        >
                                            <ArrowDownTrayIcon className="w-5 h-5"/>
                                            <span>تحميل السياسة</span>
                                        </a>
                                    )}
                                    
                                    <div className="flex items-center gap-2 mr-auto sm:mr-0">
                                         {hasPermission('edit_policy') && (
                                             <button onClick={() => handleEditPolicy(policy)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors" title="تعديل">
                                                <PencilIcon className="w-5 h-5"/>
                                            </button>
                                         )}
                                         {hasPermission('delete_policy') && (
                                             <button onClick={() => setPolicyToDelete(policy)} className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors" title="حذف">
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                         )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <BookOpenIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">لا توجد سياسات مضافة</p>
                    {hasPermission('manage_policies') && <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">قم بإضافة أول سياسة لمركز الحوكمة.</p>}
                </div>
            )}

            <AddPolicyModal
                isOpen={showAddPolicyModal}
                onClose={() => setShowAddPolicyModal(false)}
                onSaveSuccess={() => {
                    setShowAddPolicyModal(false);
                    fetchPolicies();
                }}
                policyToEdit={policyToEdit}
            />

            <ConfirmationModal
                isOpen={!!policyToDelete}
                onClose={() => setPolicyToDelete(null)}
                onConfirm={handleDeletePolicy}
                title="تأكيد الحذف"
                message={`هل أنت متأكد من رغبتك في حذف السياسة "${policyToDelete?.title}"؟ سيتم حذف الملف المرفق أيضًا.`}
            />
        </div>
    );
};

const ContactUsView: React.FC = () => {
    return (
        <div className="animate-fade-in text-center max-w-lg mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <EmailIcon className="w-16 h-16 mx-auto text-primary dark:text-primary-light" />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">تواصل معنا</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    نحن هنا للمساعدة. يمكنك التواصل معنا عبر البريد الإلكتروني.
                </p>
                <div className="mt-6">
                    <a href="mailto:support@tabuk-hc.com?subject=استفسار%20بخصوص%20منصة%20تجمع%20تبوك%20الصحي"
                       className="inline-block bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:-translate-y-0.5">
                        support@tabuk-hc.com
                    </a>
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">
                    سنقوم بالرد على استفسارك في أقرب وقت ممكن.
                </p>
            </div>
        </div>
    );
};

export default SettingsScreen;
