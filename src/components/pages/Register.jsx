import { useState, useCallback, useEffect } from "react";
import AuthShell from "./AuthShell";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  UserPlus,
  Loader2,
  Check,
  X,
} from "lucide-react";

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function Register() {
  const nav = useNavigate();
  const { register, checkEmail, user, loading } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const debouncedCheckEmail = useCallback(
    debounce(async (email) => {
      if (!email || !email.includes("@")) {
        setEmailAvailable(null);
        return;
      }
      setCheckingEmail(true);
      try {
        const result = await checkEmail(email);
        setEmailAvailable(result.available);
      } catch {
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 500),
    [checkEmail]
  );

  useEffect(() => {
    debouncedCheckEmail(form.email);
  }, [form.email, debouncedCheckEmail]);

  useEffect(() => {
    if (!loading && user) {
      const next = (r) => {
        const map = { admin: "/admin", acland: "/admin", user: "/dashboard" };
        return map[r] || "/dashboard";
      };
      nav(next(user.role));
    }
  }, [user, loading, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (form.password !== form.confirmPassword) {
      setErr("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setErr("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await register(form);
      alert(response.message);
      nav("/login");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Join us today"
      subtitle="Create your account to get started"
      formSide="right"
      accent="from-emerald-500 to-teal-600"
    >
      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl mb-6 flex items-center gap-2 animate-fade-in">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          {err}
        </div>
      )}

      <form onSubmit={submit} className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              First Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                placeholder="First name"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Last Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
              placeholder="Enter your email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            {checkingEmail && (
              <Loader2
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
                size={20}
              />
            )}
            {!checkingEmail && emailAvailable === true && (
              <Check
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                size={20}
              />
            )}
            {!checkingEmail && emailAvailable === false && (
              <X
                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
                size={20}
              />
            )}
          </div>
          {emailAvailable === false && (
            <p className="text-xs text-red-500 mt-1">Email is already taken</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <div className="relative">
            <Phone
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
              placeholder="Enter your phone number"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
              placeholder="Create a password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 6 characters
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
              placeholder="Confirm your password"
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              minLength={6}
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="terms"
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the{" "}
            <Link
              to="/terms"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg shadow-emerald-500/25 mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus size={20} />
              Create account
            </>
          )}
        </button>

        <div className="text-center pt-2 border-t border-gray-100">
          <span className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </span>
        </div>
      </form>
    </AuthShell>
  );
}
