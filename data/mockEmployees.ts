
import { Employee } from '../types';

// 1. البيانات الأصلية الثابتة (24 موظف)
const initialEmployees: Employee[] = [
  // --- مركز ابوشجرة ---
  {
    id: 1,
    full_name_ar: "احمد بريك بركه البلوي",
    full_name_en: "Ahmed Bareek Albalawi",
    employee_id: "120338",
    job_title: "مساعد اداري",
    department: "الإدارة",
    center: "ابوشجرة",
    phone_direct: "0542207622",
    email: "ahbalbalawi@moh.gov.sa",
    national_id: "1098765432",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1990-05-15",
    classification_id: "C-12345"
  },
  {
    id: 2,
    full_name_ar: "عطاالله رجاءالله الجهني",
    full_name_en: "Atallah Rajaallah Aljohani",
    employee_id: "120327",
    job_title: "كاتب",
    department: "الإدارة",
    center: "ابوشجرة",
    phone_direct: "0500909323",
    email: "attallaha@moh.gov.sa",
    national_id: "1087654321",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1988-03-10",
    classification_id: "C-54321"
  },
  {
    id: 3,
    full_name_ar: "د. سناء عبدالرحمن الفكي",
    full_name_en: "Dr. Sanaa Abdulrahman Alfaki",
    employee_id: "4409443",
    job_title: "طبيب عام",
    department: "العيادات العامة",
    center: "ابوشجرة",
    phone_direct: "0553602945",
    email: "sanam@moh.gov.sa",
    national_id: "2145678901",
    nationality: "سوداني",
    gender: "أنثى",
    date_of_birth: "1985-07-22",
    classification_id: "D-99887"
  },

  // --- مركز الأحمر ---
  {
    id: 4,
    full_name_ar: "احمد سالم سليم العلاطي",
    full_name_en: "Ahmed Salem Al-Alati",
    employee_id: "4410607",
    job_title: "صيدلي",
    department: "الصيدلية",
    center: "الأحمر",
    phone_direct: "0554559772",
    email: "ahjuhani@moh.gov.sa",
    national_id: "1056789012",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1993-01-15",
    classification_id: "P-33221"
  },
  {
    id: 5,
    full_name_ar: "د. هشام يحي حسن ابراهيم",
    full_name_en: "Dr. Hisham Yahya Ibrahim",
    employee_id: "4421673",
    job_title: "طبيب نائب",
    department: "العيادات العامة",
    center: "الأحمر",
    phone_direct: "0552484526",
    email: "hyibrahim@moh.gov.sa",
    national_id: "2234567890",
    nationality: "مصري",
    gender: "ذكر",
    date_of_birth: "1980-11-05",
    classification_id: "D-55443"
  },

  // --- مركز الرويضات ---
  {
    id: 6,
    full_name_ar: "دخيل سعد جبير السميري",
    full_name_en: "Dakhil Saad Alsumairi",
    employee_id: "4407665",
    job_title: "حارس أمن",
    department: "الأمن والسلامة",
    center: "الرويضات",
    phone_direct: "0506379919",
    email: "dalsumayra@moh.gov.sa",
    national_id: "1065432109",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1982-09-30",
    classification_id: "S-99001"
  },
  {
    id: 7,
    full_name_ar: "محمد سليم سليمان الحجوري",
    full_name_en: "Mohammed Saleem Alhajouri",
    employee_id: "63236",
    job_title: "فني مختبر",
    department: "المختبر",
    center: "الرويضات",
    phone_direct: "0555310386",
    email: "maljohani62@moh.gov.sa",
    national_id: "1023456789",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1991-06-25",
    classification_id: "L-44332"
  },

  // --- مركز الشبعان ---
  {
    id: 8,
    full_name_ar: "سليمان حمود الشزيواني",
    full_name_en: "Sulaiman Hamoud Alshaziwani",
    employee_id: "2612261",
    job_title: "سكرتير طبي",
    department: "الاستقبال",
    center: "الشبعان",
    phone_direct: "0503900137",
    email: "salshdeoani@moh.gov.sa",
    national_id: "1034567890",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1994-08-10",
    classification_id: "A-12121"
  },
  {
    id: 9,
    full_name_ar: "شيبا ماثيو بالقيس",
    full_name_en: "Sheeba Mathew Balqis",
    employee_id: "4412333",
    job_title: "أخصائي تمريض",
    department: "التمريض",
    center: "الشبعان",
    phone_direct: "0535409064",
    email: "sheebamv@moh.gov.sa",
    national_id: "2456789012",
    nationality: "هندي",
    gender: "أنثى",
    date_of_birth: "1989-11-20",
    classification_id: "N-90909"
  },

  // --- مركز الشدخ ---
  {
    id: 10,
    full_name_ar: "وصل الله عايد الحجوري",
    full_name_en: "Waslallah Ayed Alhajouri",
    employee_id: "4403518",
    job_title: "مدير مركز",
    department: "الإدارة",
    center: "الشدخ",
    phone_direct: "0500139239",
    email: "walhujuri@moh.gov.sa",
    national_id: "1045678901",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1983-05-05",
    classification_id: "M-56565"
  },

  // --- مركز الشعب ---
  {
    id: 11,
    full_name_ar: "عبدالباري القعيد الحمدي",
    full_name_en: "Abdulbari Alqaed Alhamdi",
    employee_id: "4707452",
    job_title: "أخصائي إدارة صحية",
    department: "الإدارة",
    center: "الشعب",
    phone_direct: "0567716581",
    email: "abdulbaria@moh.gov.sa",
    national_id: "1056789012",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1986-12-30",
    classification_id: "A-87878"
  },

  // --- مركز الشبحة ---
  {
    id: 12,
    full_name_ar: "خالد حامد علي الحبيشي",
    full_name_en: "Khalid Hamed Alhubayshi",
    employee_id: "4403463",
    job_title: "مراقب وبائيات",
    department: "الصحة العامة",
    center: "الشبحة",
    phone_direct: "0563884054",
    email: "khalhubayshi@moh.gov.sa",
    national_id: "1067890123",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1990-03-25",
    classification_id: "H-65656"
  },
  {
    id: 13,
    full_name_ar: "د. محمد زهير عطار",
    full_name_en: "Dr. Mohammed Zuhair Attar",
    employee_id: "51643140",
    job_title: "طبيب أسنان",
    department: "الأسنان",
    center: "الشبحة",
    phone_direct: "0506680461",
    email: "mzattar@moh.gov.sa",
    national_id: "2789012345",
    nationality: "سوري",
    gender: "ذكر",
    date_of_birth: "1984-06-10",
    classification_id: "D-89898"
  },

  // --- مركز الضويحي ---
  {
    id: 14,
    full_name_ar: "هاني عايد المرواني",
    full_name_en: "Hani Ayed Almarwani",
    employee_id: "4407850",
    job_title: "كاتب",
    department: "السجلات الطبية",
    center: "الضويحي",
    phone_direct: "0509519782",
    email: "halmarwani@moh.gov.sa",
    national_id: "1078901234",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1992-01-05",
    classification_id: "A-43434"
  },

  // --- مركز القبليه ---
  {
    id: 15,
    full_name_ar: "أحمد عبد الرحمن الحمدي",
    full_name_en: "Ahmed Abdulrahman Alhamdi",
    employee_id: "4407749",
    job_title: "مدير مركز",
    department: "الإدارة",
    center: "القبليه",
    phone_direct: "0543286250",
    email: "ahaljuhani@moh.gov.sa",
    national_id: "1090123456",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1981-04-20",
    classification_id: "M-76767"
  },
  {
    id: 16,
    full_name_ar: "رهف عبد الله الحربي",
    full_name_en: "Rahaf Abdullah Alharbi",
    employee_id: "51542161",
    job_title: "أخصائي مختبر",
    department: "المختبر",
    center: "القبليه",
    phone_direct: "0506449336",
    email: "Ralharbi75@moh.gov.sa",
    national_id: "1101234567",
    nationality: "سعودي",
    gender: "أنثى",
    date_of_birth: "1997-09-01",
    classification_id: "L-90901"
  },

  // --- مركز المقرح ---
  {
    id: 17,
    full_name_ar: "ساعد مسعد الفايدي",
    full_name_en: "Saed Massad Alfaidi",
    employee_id: "4405028",
    job_title: "سائق اسعاف",
    department: "النقل الاسعافي",
    center: "المقرح",
    phone_direct: "0552782186",
    email: "saaljahani@moh.gov.sa",
    national_id: "1112345678",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1979-12-12",
    classification_id: "D-11221"
  },
  {
    id: 18,
    full_name_ar: "ابرار عبدالله حميد المرواني",
    full_name_en: "Abrar Abdullah Almarwani",
    employee_id: "4408465",
    job_title: "قابلة",
    department: "التمريض",
    center: "المقرح",
    phone_direct: "0545008281",
    email: "ibrara@moh.gov.sa",
    national_id: "1123456789",
    nationality: "سعودي",
    gender: "أنثى",
    date_of_birth: "1994-05-22",
    classification_id: "N-55667"
  },

  // --- مركز النصبة ---
  {
    id: 19,
    full_name_ar: "عبدالعزيز حامد الفايدي",
    full_name_en: "Abdulaziz Hamed Alfaidi",
    employee_id: "4848387",
    job_title: "موظف استقبال",
    department: "الاستقبال",
    center: "النصبة",
    phone_direct: "0568786988",
    email: "ahalfaidi@moh.gov.sa",
    national_id: "1134567890",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1996-07-07",
    classification_id: "A-33445"
  },
  {
    id: 20,
    full_name_ar: "مساعد بشيبش العلاطي",
    full_name_en: "Musaed Bosheibesh Al-Alati",
    employee_id: "128366",
    job_title: "صيدلي قانوني",
    department: "الصيدلية",
    center: "النصبة",
    phone_direct: "0545933861",
    email: "melelati@moh.gov.sa",
    national_id: "1145678901",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1988-11-11",
    classification_id: "P-99881"
  },

  // --- مركز شثاث ---
  {
    id: 21,
    full_name_ar: "خميس عتيق الحجوري",
    full_name_en: "Khamis Atiq Alhajouri",
    employee_id: "4400337",
    job_title: "مراقب صحي",
    department: "الصحة العامة",
    center: "شثاث",
    phone_direct: "0532733049",
    email: "kalguhani@moh.gov.sa",
    national_id: "1156789012",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1985-02-28",
    classification_id: "H-22113"
  },

  // --- مركز توله ---
  {
    id: 22,
    full_name_ar: "رائد عيد حمد الجهني",
    full_name_en: "Raed Eid Aljohani",
    employee_id: "4408707",
    job_title: "أخصائي اجتماعي",
    department: "الخدمة الاجتماعية",
    center: "توله",
    phone_direct: "0553691781",
    email: "realjohani@moh.gov.sa",
    national_id: "1167890123",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1989-04-04",
    classification_id: "S-44556"
  },
  {
    id: 23,
    full_name_ar: "د. ارشاد مصطفي محمد",
    full_name_en: "Dr. Arshad Mustafa Mohammed",
    employee_id: "4404014",
    job_title: "طبيب عام",
    department: "العيادات العامة",
    center: "توله",
    phone_direct: "0502397023",
    email: "ammuhammad@moh.gov.sa",
    national_id: "2901234567",
    nationality: "باكستاني",
    gender: "ذكر",
    date_of_birth: "1982-01-20",
    classification_id: "D-11002"
  },

  // --- مركز فشيغ-مرخ ---
  {
    id: 24,
    full_name_ar: "ناشي بركة سليم الشويطي",
    full_name_en: "Nashi Baraka Alshuwaiti",
    employee_id: "4406851",
    job_title: "فني سجلات طبية",
    department: "السجلات الطبية",
    center: "فشيغ-مرخ",
    phone_direct: "0506130217",
    email: "nalshuwayti@moh.gov.sa",
    national_id: "1178901234",
    nationality: "سعودي",
    gender: "ذكر",
    date_of_birth: "1993-06-15",
    classification_id: "A-99009"
  }
];

// 2. بيانات مساعدة لتوليد الموظفين الإضافيين (منطقة تبوك)
const firstNamesM = [
    "محمد", "أحمد", "عبدالله", "سعود", "فهد", "سلطان", "خالد", "علي", "يوسف", "إبراهيم", 
    "عمر", "عبدالرحمن", "فيصل", "تركي", "نواف", "سلمان", "عبدالعزيز", "مشعل", "ماجد", "بندر",
    "راشد", "سالم", "حمزة", "زياد", "فارس", "ياسر", "طلال", "بدر", "سامي", "وليد",
    "عايد", "عطالله", "سويلم", "عودة", "مسعد", "عيد", "فريج", "جزاع", "معتق", "صالح"
];

const firstNamesF = [
    "سارة", "نورة", "مريم", "فاطمة", "ريم", "منال", "هدى", "أمل", "جواهر", "عنود",
    "لطيفة", "حصة", "مها", "العنود", "شيخة", "بدور", "روان", "رغد", "شهد", "ليان",
    "عبير", "وفاء", "سمية", "خلود", "أسماء", "هند", "نوف", "دانة", "بشاير", "مشاعل",
    "جميلة", "صالحة", "فوزية", "نعيمة", "وداد", "منيرة", "عيدة", "سلمى", "عائشة", "خديجة"
];

const middleNames = [
    "سالم", "محمد", "علي", "صالح", "عودة", "سليمان", "عبدالله", "عيد", "حماد", "مسلم",
    "عطية", "سويلم", "فرج", "مبارك", "سعيد", "حمد", "حسن", "إبراهيم", "خلف", "مقبول",
    "ظاهر", "فالح", "مفلح", "عواد", "عايض"
];

const familyNames = [
    "البلوي", "الجهني", "العطوي", "الحويطي", "العنزي", "الشمري", "الحربي", "المسعودي", 
    "العمري", "الشهري", "القحطاني", "الزهراني", "الدوسري", "المطيري", "السبيعي", "الغامدي", 
    "المالكي", "الفياض", "الخمعلي", "العازمي", "الوابصي", "الفاضلي", "المرواني", "الحبيشي",
    "الفايدي", "العلاطي", "الشويطي", "الحمدي", "الحجوري"
];

const centersList = [
    "ابوشجرة", "الأحمر", "الرويضات", "الشبعان", "الشدخ", "الشعب", "الشبحة", 
    "الضويحي", "القبليه", "المقرح", "النصبة", "شثاث", "توله", "فشيغ-مرخ"
];

const jobRoles = [
    { title: "طبيب عام", dept: "العيادات العامة", code: "D" },
    { title: "طبيب مقيم", dept: "العيادات العامة", code: "D" },
    { title: "طبيب أسنان", dept: "الأسنان", code: "D" },
    { title: "أخصائي تمريض", dept: "التمريض", code: "N" },
    { title: "فني تمريض", dept: "التمريض", code: "N" },
    { title: "قابلة", dept: "التمريض", code: "N" },
    { title: "صيدلي", dept: "الصيدلية", code: "P" },
    { title: "فني صيدلة", dept: "الصيدلية", code: "P" },
    { title: "فني مختبر", dept: "المختبر", code: "L" },
    { title: "أخصائي مختبر", dept: "المختبر", code: "L" },
    { title: "فني أشعة", dept: "الأشعة", code: "R" },
    { title: "موظف استقبال", dept: "الاستقبال", code: "A" },
    { title: "كاتب", dept: "الإدارة", code: "A" },
    { title: "مساعد اداري", dept: "الإدارة", code: "A" },
    { title: "حارس أمن", dept: "الأمن والسلامة", code: "S" },
    { title: "سائق اسعاف", dept: "النقل الاسعافي", code: "T" },
    { title: "مراقب وبائيات", dept: "الصحة العامة", code: "H" },
    { title: "مراقب صحي", dept: "الصحة العامة", code: "H" },
    { title: "أخصائي اجتماعي", dept: "الخدمة الاجتماعية", code: "W" }
];

const transliterate = (text: string): string => {
    const map: Record<string, string> = {
        'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
        'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
        'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y',
        'ة': 'ah', 'ى': 'a', ' ': ' '
    };
    return text.split('').map(char => map[char] || char).join('');
};

// 3. دالة التوليد
const generateEmployees = (count: number): Employee[] => {
    const employees: Employee[] = [];
    const startId = 25; // Start after the initial 24

    for (let i = 0; i < count; i++) {
        const isMale = Math.random() > 0.35; // 65% Male
        const firstName = isMale 
            ? firstNamesM[Math.floor(Math.random() * firstNamesM.length)] 
            : firstNamesF[Math.floor(Math.random() * firstNamesF.length)];
        
        const fatherName = middleNames[Math.floor(Math.random() * middleNames.length)];
        const grandName = middleNames[Math.floor(Math.random() * middleNames.length)];
        const familyName = familyNames[Math.floor(Math.random() * familyNames.length)];
        
        const fullNameAr = `${firstName} ${fatherName} ${grandName} ${familyName}`;
        const fullNameEn = `${transliterate(firstName)} ${transliterate(fatherName)} ${transliterate(familyName)}`; // Simple En Name
        
        const role = jobRoles[Math.floor(Math.random() * jobRoles.length)];
        const center = centersList[Math.floor(Math.random() * centersList.length)];
        
        const randomEmpId = Math.floor(4400000 + Math.random() * 900000).toString(); // 44xxxxx format
        const randomPhone = `05${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
        const randomNationalId = `10${Math.floor(Math.random() * 90000000).toString().padStart(8, '0')}`; // Starts with 10
        
        // Date of birth between 1970 and 2000
        const year = 1970 + Math.floor(Math.random() * 30);
        const month = 1 + Math.floor(Math.random() * 12);
        const day = 1 + Math.floor(Math.random() * 28);
        const dob = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        employees.push({
            id: startId + i,
            full_name_ar: fullNameAr,
            full_name_en: capitalize(fullNameEn),
            employee_id: randomEmpId,
            job_title: role.title,
            department: role.dept,
            center: center,
            phone_direct: randomPhone,
            email: `${transliterate(firstName).charAt(0).toLowerCase()}${transliterate(familyName).toLowerCase()}@moh.gov.sa`,
            national_id: randomNationalId,
            nationality: Math.random() > 0.1 ? "سعودي" : (isMale ? "مصري" : "فلبيني"), // 90% Saudi
            gender: isMale ? "ذكر" : "أنثى",
            date_of_birth: dob,
            classification_id: `${role.code}-${Math.floor(Math.random() * 99999)}`
        });
    }
    return employees;
};

const capitalize = (s: string) => {
    return s.replace(/\b\w/g, l => l.toUpperCase());
}

// 4. دمج البيانات وتصديرها
const targetTotal = 419;
const neededCount = targetTotal - initialEmployees.length;
const generatedEmployees = generateEmployees(neededCount);

export const mockEmployees: Employee[] = [
    ...initialEmployees,
    ...generatedEmployees
];
