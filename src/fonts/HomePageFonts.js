export const LANGS = { EN: "en", BN: "bn" };

export const translations = {
  en: {
    title: "Welcome to E-Land",
    subtitle: "Comprehensive Land Record Management System",
    description:
      "Streamline land record management with our digital platform. Access, manage, and track land records efficiently across divisions, districts, upazilas, and mouzas.",
    login: "Login to Your Account",
    explore: "Explore Land Records",
    register: "Create New Account",
    ldt: "Land Development Tax (LDT)",
    adminDivisions: "Administrative Divisions",
    adminDesc: "Manage records across all administrative levels",
    digitalRecords: "Digital Records",
    digitalDesc: "Secure and efficient digital land record management",
    secureAccess: "Secure Access",
    secureDesc: "Role-based access control for different user types",
    toggle: "বাংলা",
  },
  bn: {
    title: "E-Land এ স্বাগতম",
    subtitle: "ব্যাপক ভূমি রেকর্ড ব্যবস্থাপনা সিস্টেম",
    description:
      "আমাদের ডিজিটাল প্ল্যাটফর্মের সাথে ভূমি রেকর্ড ব্যবস্থাপনাকে স্ট্রিমলাইন করুন। বিভাগ, জেলা, উপজেলা এবং মৌজা জুড়ে ভূমি রেকর্ডগুলি দক্ষতার সাথে অ্যাক্সেস, পরিচালনা এবং ট্র্যাক করুন।",
    login: "আপনার অ্যাকাউন্টে লগইন করুন",
    explore: "ভূমি রেকর্ড অন্বেষণ করুন",
    register: "নতুন অ্যাকাউন্ট তৈরি করুন",
    ldt: "ভূমি উন্নয়ন কর (LDT)",
    adminDivisions: "প্রশাসনিক বিভাগ",
    adminDesc: "সমস্ত প্রশাসনিক স্তর জুড়ে রেকর্ড পরিচালনা করুন",
    digitalRecords: "ডিজিটাল রেকর্ড",
    digitalDesc: "নিরাপদ এবং দক্ষ ডিজিটাল ভূমি রেকর্ড ব্যবস্থাপনা",
    secureAccess: "নিরাপদ অ্যাক্সেস",
    secureDesc:
      "বিভিন্ন ব্যবহারকারী প্রকারের জন্য ভূমিকা-ভিত্তিক অ্যাক্সেস নিয়ন্ত্রণ",
    toggle: "English",
  },
};

export const makeT = (lang) => (key) => translations[lang]?.[key] ?? key;
