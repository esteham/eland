export const LANGS = { EN: "en", BN: "bn" };

const TEXTS = {
  en: {
    // NAV
    personalInfo: "Personal Information",
    address: "Address",
    applyKhatian: "Apply Khatian/Maps",
    ldt: "Land Development Tax (LDT)",
    payments: "Payments & Receipts",
    profileKyc: "Profile & KYC",
    messages: "Messages",
    security: "Security",
    mutations: "Mutations",

    // Common
    edit: "Edit",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    back: "Back",
    loading: "Loading...",

    // Profile
    profileInformation: "Profile Information",
    editProfileInformation: "Edit Profile Information",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    role: "Role",
    notProvided: "Not provided",

    // Address
    addressInformation: "Address Information",
    permanentAddress: "Permanent Address",
    mailingAddress: "Mailing Address",
    addressLine1: "Address Line 1",
    addressLine2: "Address Line 2",
    city: "City",
    postalCode: "Postal Code",
    country: "Country",
    selectDistrict: "Select City",

    // Apply Khatian/Maps
    applyForKhatian: "Apply for Khatian",
    startNewApplication: "Search Khatian/Map",
    viewDrafts: "Applies Khatiyan",
    loadingApplications: "Loading applications...",
    noApplications: "No applications found.",
    downloadKhatian: "Download Khatian",
    downloadMouzaMap: "Download Map",
    payFirst: "Pay first",
    typeLabel: "Type",
    descriptionLabel: "Description",
    paymentStatus: "Payment Status",
    noDocument: "No document available",
    startNewNote: "Start a new application or view your drafts.",
    nbNote:
      "[N.B.: If you pay, then the payment status will be PAID and the khatian download button will be enabled.]",

    // LDT
    ldtHeader: "Land Development Tax (LDT)",
    ldtDesc: "View/pay LDT and download receipts.",
    payLdt: "Pay LDT",
    viewHistory: "View Payment History",
    noLdtRegistrations: "No LDT registrations found.",
    registrationId: "Registration Land",
    status: "Status",
    land: "Land",
    landArea: "Land Area",
    area: "sq ft",
    dagNumber: "Dag Number",
    khatiyanNumber: "Khatiyan Number",
    registrationDate: "Registration Date",
    notes: "Notes",

    // Payments
    paymentsHeader: "Payments & Receipts",
    noPayments: "No payments found.",
    feeAmount: "Fee Amount",
    downloadInvoice: "Download Invoice",
    paymentPending: "Payment Pending",
    showMore: "Show More",
    showLess: "Show Less",

    // KYC
    profileKycHeader: "Profile & KYC",
    email: "Email",
    emailVerified: "Email Verified",
    sendVerification: "Send Verification",
    phone: "Phone",
    sendOtp: "Send OTP",
    nid: "National ID (NID)",
    kycUpdated: "KYC Updated",
    kycPending: "KYC Pending",
    kycUpdate: "KYC Update",
    idFront: "ID Front",
    idBack: "ID Back",
    upload: "Upload",
    uploading: "Uploading...",
    reason: "Reason",

    // Security
    securitySettings: "Security Settings",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    savePassword: "Save Password",
    saving: "Saving...",
    enable2FA: "Enable 2FA",
    show: "Show",
    hide: "Hide",

    // Misc
    yourSubmittedApps: "Your Khatiyan And Maps",
    notificationsHere: "Notifications and messages appear here.",
    startNewBnHint: "(New Application)",
    appliedKhatianBnHint: "(Applied Khatiyan)",
    passwordUpdatedToast: "Password updated successfully",
    invoiceFail: "Failed to download invoice. Please try again.",
    khatianFail: "Failed to download khatian. Please try again.",
  },

  bn: {
    // NAV
    personalInfo: "ব্যক্তিগত তথ্য",
    address: "ঠিকানা",
    applyKhatian: "খতিয়ান/ম্যাপ আবেদন",
    ldt: "ভূমি উন্নয়ন কর (এলডিটি)",
    payments: "পেমেন্ট ও রসিদ",
    profileKyc: "প্রোফাইল ও কেওয়াইসি",
    messages: "বার্তা",
    security: "নিরাপত্তা",
    mutations: "মিউটেশন",

    // Common
    edit: "সম্পাদনা",
    saveChanges: "পরিবর্তন সংরক্ষণ",
    cancel: "বাতিল",
    back: "ফিরে যান",
    loading: "লোড হচ্ছে...",

    // Profile
    profileInformation: "প্রোফাইল তথ্য",
    editProfileInformation: "প্রোফাইল তথ্য সম্পাদনা",
    fullName: "পূর্ণ নাম",
    emailAddress: "ইমেইল ঠিকানা",
    phoneNumber: "ফোন নম্বর",
    role: "ভূমিকা",
    notProvided: "প্রদত্ত নয়",

    // Address
    addressInformation: "ঠিকানা তথ্য",
    permanentAddress: "স্থায়ী ঠিকানা",
    mailingAddress: "মেইলিং/পত্র প্রেরণের ঠিকানা",
    addressLine1: "ঠিকানা লাইন ১",
    addressLine2: "ঠিকানা লাইন ২",
    city: "শহর/জেলা",
    postalCode: "পোস্ট কোড",
    country: "দেশ",
    selectDistrict: "শহর নির্বাচন করুন",

    // Apply Khatian
    applyForKhatian: "খতিয়ান আবেদন",
    startNewApplication: "খতিয়ান/ম্যাপ খুজুন",
    viewDrafts: "আবেদন করা খতিয়ান",
    loadingApplications: "আবেদন লোড হচ্ছে...",
    noApplications: "কোনো আবেদন পাওয়া যায়নি।",
    downloadKhatian: "খতিয়ান ডাউনলোড",
    downloadMouzaMap: "ম্যাপ ডাউনলোড",
    payFirst: "আগে পেমেন্ট করুন",
    typeLabel: "ধরন",
    descriptionLabel: "বিবরণ",
    paymentStatus: "পেমেন্ট স্ট্যাটাস",
    noDocument: "কোনো ডকুমেন্ট নেই",
    startNewNote: "নতুন আবেদন করুন অথবা আপনার ড্রাফট দেখুন।",
    nbNote:
      "[দ্রষ্টব্য: আপনি পেমেন্ট করলে পেমেন্ট স্ট্যাটাস PAID হবে এবং খতিয়ান/ম্যাপ ডাউনলোড বাটন সক্রিয় হবে।]",

    // LDT
    ldtHeader: "ভূমি উন্নয়ন কর (LDT)",
    ldtDesc: "LDT দেখুন/রশিদ ডাউনলোদ ",
    payLdt: "LDT পরিশোধ করুন",
    viewHistory: "পেমেন্ট ইতিহাস দেখুন",
    noLdtRegistrations: "কোনো LDT নিবন্ধন পাওয়া যায়নি।",
    registrationId: "নিবন্ধিত জমি",
    status: "স্ট্যাটাস",
    land: "জমি ধরন",
    landArea: "জমির পরিমাণ",
    area: "স্কয়ার ফিট",
    dagNumber: "দাগ নম্বর",
    khatiyanNumber: "খতিয়ান নম্বর",
    registrationDate: "নিবন্ধনের তারিখ",
    notes: "নোটস",

    // Payments
    paymentsHeader: "পেমেন্ট ও রসিদ",
    noPayments: "কোনো পেমেন্ট পাওয়া যায়নি।",
    feeAmount: "ফি পরিমাণ",
    downloadInvoice: "ইনভয়েস ডাউনলোড",
    paymentPending: "পেমেন্ট বাকি",
    showMore: "আরও দেখুন",
    showLess: "কম দেখুন",

    // KYC
    profileKycHeader: "প্রোফাইল ও কেওয়াইসি",
    email: "ইমেইল",
    emailVerified: "ইমেইল যাচাইকৃত",
    sendVerification: "যাচাইকরণ পাঠান",
    phone: "ফোন",
    sendOtp: "ওটিপি পাঠান",
    nid: "জাতীয় পরিচয়পত্র (এনআইডি)",
    kycUpdated: "কেওয়াইসি আপডেট হয়েছে",
    kycPending: "কেওয়াইসি মুলতুবি",
    kycUpdate: "কেওয়াইসি আপডেট",
    idFront: "আইডির সামনের দিক",
    idBack: "আইডির পেছনের দিক",
    upload: "আপলোড",
    uploading: "আপলোড হচ্ছে...",
    reason: "কারণ",

    // Security
    securitySettings: "নিরাপত্তা সেটিংস",
    changePassword: "পাসওয়ার্ড পরিবর্তন",
    currentPassword: "বর্তমান পাসওয়ার্ড",
    newPassword: "নতুন পাসওয়ার্ড",
    confirmNewPassword: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
    savePassword: "পাসওয়ার্ড সংরক্ষণ",
    saving: "সংরক্ষণ হচ্ছে...",
    enable2FA: "টু-ফ্যাক্টর চালু করুন",
    show: "দেখান",
    hide: "লুকান",

    // Misc
    yourSubmittedApps: "আপনার খতিয়ান এবং ম্যাপ",
    notificationsHere: "নোটিফিকেশন ও বার্তাগুলো এখানে দেখা যাবে।",
    startNewBnHint: "(নতুন আবেদন)",
    appliedKhatianBnHint: "(আবেদন করা খতিয়ান)",
    passwordUpdatedToast: "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে",
    invoiceFail: "ইনভয়েস ডাউনলোড ব্যর্থ। আবার চেষ্টা করুন।",
    khatianFail: "খতিয়ান ডাউনলোড ব্যর্থ। আবার চেষ্টা করুন।",
  },
};

// Helper to get a translator for a given language
export const makeT = (lang) => (key) => TEXTS[lang]?.[key] ?? key;
