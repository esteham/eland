import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { makeT } from "../../../fonts/UserDashbboardFonts";
import { getUnreadNotificationCount } from "../../../api";
import ErrorBoundary from "../../ErrorBoundary";

// Import all tab components
import PersonalInfoTab from "./tabs/PersonalInfoTab";
import AddressTab from "./tabs/AddressTab";
import ApplyKhatianTab from "./tabs/ApplyKhatianTab";
import LDTTab from "./tabs/LDTTab";
import PaymentsTab from "./tabs/PaymentsTab";
import ProfileKYCTab from "./tabs/ProfileKYCTab";
import MessagesTab from "./tabs/MessagesTab";
import SecurityTab from "./tabs/SecurityTab";
import MutationList from "./tabs/MutationList";

const NAV_KEYS = [
  "personalInfo",
  "address",
  "mutations",
  "applyKhatian",
  "ldt",
  "payments",
  "profileKyc",
  "messages",
  "security",
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);

  const t = useMemo(() => makeT(language), [language]);

  // ---- Nav & Active Tab (key-based) ----
  const [activeKey, setActiveKey] = useState(() => {
    const tab = searchParams.get("tab");
    return tab && NAV_KEYS.includes(tab) ? tab : NAV_KEYS[0];
  });

  // Update URL when activeKey changes
  useEffect(() => {
    setSearchParams({ tab: activeKey });
  }, [activeKey, setSearchParams]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getUnreadNotificationCount();
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error("Failed to fetch unread count", error);
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Avatar initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ---- Render body per tab (by key) ----
  const renderContent = () => {
    const commonProps = {
      lang: language,
      t,
      user,
    };

    switch (activeKey) {
      case "personalInfo":
        return <PersonalInfoTab {...commonProps} />;
      case "address":
        return <AddressTab {...commonProps} />;
      case "applyKhatian":
        return <ApplyKhatianTab {...commonProps} />;
      case "ldt":
        return <LDTTab {...commonProps} />;
      case "mutations":
        return <MutationList {...commonProps} />;
      case "payments":
        return <PaymentsTab {...commonProps} />;
      case "profileKyc":
        return <ProfileKYCTab {...commonProps} />;
      case "messages":
        return <MessagesTab {...commonProps} />;
      case "security":
        return <SecurityTab {...commonProps} />;
      default:
        return null;
    }
  };

  // ---- Build nav items from keys with current language ----
  const navItems = NAV_KEYS.map((key) => ({
    key,
    label:
      key === "messages" && unreadCount > 0
        ? `${t(key)} (${unreadCount})`
        : t(key),
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-4 bg-white shadow-lg rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {getInitials(user?.name)}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600 capitalize">{user?.role}</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveKey(item.key)}
                  className={`w-full text-left font-semibold px-4 py-2 rounded-md transition ${
                    activeKey === item.key
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-8 bg-white shadow-lg rounded-lg p-6">
            <ErrorBoundary>{renderContent()}</ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
