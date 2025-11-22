import React from 'react';
import { 
    BookOpenIcon,
    ListBulletIcon,
    ClipboardDocumentListIcon,
    SparklesIcon,
    UserIcon,
    BellIcon,
    ChartBarIcon,
    SearchIcon,
    PlusIcon,
    TrashIcon,
    ArrowUpTrayIcon,
    ShareIcon,
    FingerprintIcon
} from '../icons/Icons';

const GuideSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <h3 className="font-bold text-xl text-primary dark:text-primary-light mb-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
            {icon}
            <span>{title}</span>
        </h3>
        <div className="space-y-5 text-gray-600 dark:text-gray-300 leading-relaxed">
            {children}
        </div>
    </div>
);

const GuideItem: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1 text-primary dark:text-primary-light">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-gray-800 dark:text-white">{title}</h4>
            <p className="text-sm mt-1">{children}</p>
        </div>
    </div>
);


const UserGuide: React.FC = () => {
    return (
        <div className="animate-fade-in">
            <div className="text-center mb-10">
                <BookOpenIcon className="w-16 h-16 mx-auto text-primary dark:text-primary-light" />
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">دليل استخدام المنصة</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">نصائح وحيل لتحقيق أقصى استفادة من التطبيق.</p>
            </div>
            
            <GuideSection title="التنقل والميزات الرئيسية" icon={<ListBulletIcon className="w-6 h-6"/>}>
                <GuideItem title="شاشات العرض الرئيسية" icon={<UserIcon className="w-5 h-5"/>}>
                    يمكنك التنقل بين الأقسام الرئيسية (الموظفين، المكاتب، المهام، المعاملات، الإحصائيات) باستخدام شريط الأزرار العلوي على أجهزة الكمبيوتر، أو الشريط السفلي على الجوال.
                </GuideItem>
                 <GuideItem title="البحث والفلترة" icon={<SearchIcon className="w-5 h-5"/>}>
                    استخدم شريط البحث في كل قسم للعثور بسرعة على ما تحتاجه. توفر شاشة الموظفين فلاتر إضافية حسب المركز والمسمى الوظيفي لتضييق نطاق البحث.
                </GuideItem>
                <GuideItem title="الإحصائيات" icon={<ChartBarIcon className="w-5 h-5"/>}>
                    توفر هذه الشاشة نظرة عامة شاملة على جميع بيانات المنصة، بما في ذلك توزيع الموظفين ونشاط المعاملات، مما يساعد في اتخاذ قرارات مستنيرة.
                </GuideItem>
            </GuideSection>

             <GuideSection title="الإجراءات الشائعة" icon={<ClipboardDocumentListIcon className="w-6 h-6"/>}>
                 <GuideItem title="الإضافة والتعديل" icon={<PlusIcon className="w-5 h-5"/>}>
                    ابحث عن أيقونة علامة الجمع (+) أو "إضافة" لإنشاء سجلات جديدة. لتعديل سجل موجود، ابحث عن أيقونة القلم (✏️) في البطاقات أو شاشات التفاصيل.
                </GuideItem>
                <GuideItem title="الحذف" icon={<TrashIcon className="w-5 h-5"/>}>
                    يمكن حذف السجلات عبر أيقونة سلة المهملات (🗑️). سيظهر لك دائمًا مربع حوار للتأكيد قبل الحذف النهائي.
                </GuideItem>
                <GuideItem title="الاستيراد والتصدير" icon={<ArrowUpTrayIcon className="w-5 h-5"/>}>
                    يمكنك إضافة أو تحديث عدد كبير من السجلات دفعة واحدة عبر استيراد ملف Excel. يمكنك أيضًا تصدير البيانات الحالية إلى ملف Excel للاحتفاظ بنسخة أو لتحليلها.
                </GuideItem>
            </GuideSection>
            
            <GuideSection title="نصائح احترافية" icon={<SparklesIcon className="w-6 h-6"/>}>
                <GuideItem title="المشاركة السريعة" icon={<ShareIcon className="w-5 h-5"/>}>
                    في بطاقات الموظفين والمكاتب، استخدم أيقونة المشاركة (📤) لنسخ بيانات الاتصال بسرعة وإرسالها عبر تطبيقات أخرى.
                </GuideItem>
                <GuideItem title="الدخول بالبصمة" icon={<FingerprintIcon className="w-5 h-5"/>}>
                    لتسجيل دخول أسرع وأكثر أمانًا، قم بتفعيل الدخول بالبصمة أو الوجه من خلال الإعدادات &gt; الدخول بالبصمة.
                </GuideItem>
                <GuideItem title="تفعيل الإشعارات" icon={<BellIcon className="w-5 h-5"/>}>
                    لا تفوت أي تحديث مهم. قم بتفعيل إشعارات المتصفح من الإعدادات &gt; تفعيل الإشعارات، لتصلك تنبيهات فورية بالمهام والمعاملات الجديدة.
                </GuideItem>
            </GuideSection>
        </div>
    );
};

export default UserGuide;