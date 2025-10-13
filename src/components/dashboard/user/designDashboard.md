import { useState, useEffect } from "react";
import { useAuth } from "../../../auth/AuthContext";
import api from "../../../api";
import { User, MapPin, FileText, DollarSign, Receipt, Shield, Mail, Lock, Eye, EyeOff, Edit2, Save, X, Check, Clock, AlertCircle } from "lucide-react";

export default function UserDashboard() {
const { user, logout, updateUser } = useAuth();

const navItems = [
{ name: "Personal Information", icon: User },
{ name: "Address", icon: MapPin },
{ name: "Apply Khatian", icon: FileText },
{ name: "Land Development Tax (LDT)", icon: DollarSign },
{ name: "Payments & Receipts", icon: Receipt },
{ name: "Profile & KYC", icon: Shield },
{ name: "Messages", icon: Mail },
{ name: "Security", icon: Lock },
];

const [activeTab, setActiveTab] = useState(navItems[0].name);
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

useEffect(() => {
if (user) {
setFormData({
name: user.name || "",
email: user.email || "",
phone: user.phone || "",
});
}
}, [user]);

useEffect(() => {
setIsEditing(false);
}, [activeTab]);

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

const handleSave = async (e) => {
e.preventDefault();
try {
const { data } = await api.put("/me", formData);
updateUser(data.user);
setIsEditing(false);
} catch (error) {
console.error("Error updating profile:", error);
}
};

const [showPwdForm, setShowPwdForm] = useState(false);
const [pwdForm, setPwdForm] = useState({
current_password: "",
password: "",
password_confirmation: "",
});
const [pwdLoading, setPwdLoading] = useState(false);
const [pwdErrors, setPwdErrors] = useState({});
const [showCurrentPwd, setShowCurrentPwd] = useState(false);
const [showNewPwd, setShowNewPwd] = useState(false);
const [showConfirmPwd, setShowConfirmPwd] = useState(false);

const handleChangePassword = async (e) => {
e.preventDefault();
setPwdLoading(true);
setPwdErrors({});
try {
await api.post("/me/change-password", pwdForm);
setPwdForm({
current_password: "",
password: "",
password_confirmation: "",
});
setShowPwdForm(false);
alert("Password updated successfully");
} catch (err) {
setPwdErrors(err?.response?.data?.errors || {});
} finally {
setPwdLoading(false);
}
};

useEffect(() => {
setShowPwdForm(false);
setPwdErrors({});
setPwdForm({
current_password: "",
password: "",
password_confirmation: "",
});
setShowCurrentPwd(false);
setShowNewPwd(false);
setShowConfirmPwd(false);
}, [activeTab]);

const renderContent = () => {
switch (activeTab) {
case "Personal Information":
return isEditing ? (

<div className="space-y-6">
<div className="flex items-center justify-between">
<h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
<button
onClick={() => setIsEditing(false)}
className="p-2 hover:bg-gray-100 rounded-full transition-colors" >
<X className="w-5 h-5 text-gray-500" />
</button>
</div>
<form onSubmit={handleSave} className="space-y-6">
<div className="space-y-2">
<label className="text-sm font-semibold text-gray-700">Full Name</label>
<input
type="text"
value={formData.name}
onChange={(e) => setFormData({ ...formData, name: e.target.value })}
className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
required
/>
</div>
<div className="space-y-2">
<label className="text-sm font-semibold text-gray-700">Email Address</label>
<input
type="email"
value={formData.email}
onChange={(e) => setFormData({ ...formData, email: e.target.value })}
className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
required
/>
</div>
<div className="space-y-2">
<label className="text-sm font-semibold text-gray-700">Phone Number</label>
<input
type="text"
value={formData.phone}
onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
/>
</div>
<div className="flex gap-3 pt-4">
<button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
                >
<Save className="w-4 h-4" />
Save Changes
</button>
<button
type="button"
onClick={() => setIsEditing(false)}
className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all" >
Cancel
</button>
</div>
</form>
</div>
) : (
<div className="space-y-6">
<div className="flex items-center justify-between">
<h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
<button
onClick={() => setIsEditing(true)}
className="flex items-center gap-2 px-4 py-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all" >
<Edit2 className="w-4 h-4" />
Edit
</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
<label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
<p className="mt-2 text-lg font-semibold text-gray-900">{user?.name}</p>
</div>
<div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
<label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
<p className="mt-2 text-lg font-semibold text-gray-900">{user?.email}</p>
</div>
<div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
<label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phone Number</label>
<p className="mt-2 text-lg font-semibold text-gray-900">{user?.phone || "Not provided"}</p>
</div>
<div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
<label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Role</label>
<p className="mt-2 text-lg font-semibold text-gray-900 capitalize">{user?.role}</p>
</div>
</div>
</div>
);

      case "Address":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Address Information</h2>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 text-center">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Address details will be displayed here.</p>
            </div>
          </div>
        );

      case "Apply Khatian":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Apply for Khatian</h2>
            <p className="text-gray-600">Start a new application or view your drafts.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="group p-6 rounded-2xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                <FileText className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-900 mb-1">Start New Application</h3>
                <p className="text-sm text-gray-600">Begin a fresh Khatian application</p>
              </button>
              <button className="group p-6 rounded-2xl border-2 border-gray-300 hover:border-amber-500 hover:bg-amber-50 transition-all text-left">
                <Clock className="w-8 h-8 text-amber-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-900 mb-1">View Drafts</h3>
                <p className="text-sm text-gray-600">Continue your saved applications</p>
              </button>
            </div>
          </div>
        );

      case "Land Development Tax (LDT)":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Land Development Tax</h2>
            <p className="text-gray-600">View and pay your LDT, download receipts.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="group p-6 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all text-left">
                <DollarSign className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold mb-1">Pay LDT</h3>
                <p className="text-sm text-green-100">Make a tax payment</p>
              </button>
              <button className="group p-6 rounded-2xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all text-left">
                <Receipt className="w-8 h-8 text-gray-700 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-900 mb-1">Payment History</h3>
                <p className="text-sm text-gray-600">View past transactions</p>
              </button>
            </div>
          </div>
        );

      case "Payments & Receipts":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Payments & Receipts</h2>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200 text-center">
              <Receipt className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Your payments and downloadable receipts will show here.</p>
            </div>
          </div>
        );

      case "Profile & KYC":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile & KYC Verification</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Email Verification</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                  Verify
                </button>
              </div>
              <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-gray-200 hover:border-green-300 transition-all bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Phone Verification</div>
                    <div className="text-sm text-gray-500">{user?.phone || "Not provided"}</div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all shadow-md hover:shadow-lg">
                  Send OTP
                </button>
              </div>
              <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-gray-200 hover:border-amber-300 transition-all bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">National ID (NID)</div>
                    <div className="text-sm text-gray-500">Upload for verification</div>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-md hover:shadow-lg">
                  Upload
                </button>
              </div>
            </div>
          </div>
        );

      case "Messages":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-2xl border border-cyan-200 text-center">
              <Mail className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
              <p className="text-gray-600">Notifications and messages appear here.</p>
            </div>
          </div>
        );

      case "Security":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
            {!showPwdForm ? (
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all"
                onClick={() => setShowPwdForm(true)}
              >
                <Lock className="w-5 h-5" />
                Change Password
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? "text" : "password"}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      value={pwdForm.current_password}
                      onChange={(e) => setPwdForm({ ...pwdForm, current_password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {showCurrentPwd ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                    </button>
                  </div>
                  {pwdErrors.current_password && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {pwdErrors.current_password[0]}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? "text" : "password"}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      value={pwdForm.password}
                      onChange={(e) => setPwdForm({ ...pwdForm, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {showNewPwd ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                    </button>
                  </div>
                  {pwdErrors.password && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {pwdErrors.password[0]}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      value={pwdForm.password_confirmation}
                      onChange={(e) => setPwdForm({ ...pwdForm, password_confirmation: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {showConfirmPwd ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={pwdLoading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-60 shadow-lg hover:shadow-xl transition-all"
                  >
                    {pwdLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {pwdLoading ? "Saving..." : "Save Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPwdForm(false);
                      setPwdErrors({});
                      setPwdForm({ current_password: "", password: "", password_confirmation: "" });
                      setShowCurrentPwd(false);
                      setShowNewPwd(false);
                      setShowConfirmPwd(false);
                    }}
                    className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            <div className="pt-6 border-t border-gray-200">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Enable Two-Factor Authentication</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }

};

return (

<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-12 gap-6">
<div className="col-span-12 md:col-span-4 bg-white shadow-xl rounded-3xl p-6 border border-gray-100">
<div className="text-center mb-8">
<div className="relative inline-block">
<div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
{getInitials(user?.name)}
</div>
<div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
</div>
<h1 className="text-2xl font-bold text-gray-900 mt-4">{user?.name}</h1>
<p className="text-gray-500 capitalize font-medium">{user?.role}</p>
</div>
<nav className="space-y-1">
{navItems.map((item) => {
const Icon = item.icon;
return (
<button
key={item.name}
onClick={() => setActiveTab(item.name)}
className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === item.name
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-50"
                    }`} >
<Icon className="w-5 h-5" />
<span className="text-left flex-1">{item.name}</span>
</button>
);
})}
</nav>
<div className="mt-8 pt-6 border-t border-gray-200">
<button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all"
              >
<Lock className="w-5 h-5" />
Logout
</button>
</div>
</div>

          <div className="col-span-12 md:col-span-8 bg-white shadow-xl rounded-3xl p-8 border border-gray-100">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>

);
}
