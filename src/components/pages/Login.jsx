import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, LogIn, Mail, Lock, Loader2 } from "lucide-react";
import AuthShell from "./AuthShell";

export default function Login() {
  const nav = useNavigate();
  const { login, user, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setIsLoading(true);

    try {
      const role = await login(form);
      const next = (r) => {
        const map = { admin: "/admin", acland: "/admin", user: "/dashboard" };
        return map[r] || "/dashboard";
      };
      nav(next(role));
    } catch (e) {
      setErr(e?.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const sanitizeMsg = (s) => {
    const raw = String(s || "");

    const noTags = raw.replace(/<\/?[^>]*>/g, "");
    return noTags.slice(0, 200);
  };

  const location = useLocation();
  const verifiedInfo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const msgParam = params.get("msg");
    return {
      verified: params.get("verified") === "1",
      msg: sanitizeMsg(
        decodeURIComponent(msgParam || "") ||
          "Email verified successfully. You can now log in."
      ),
    };
  }, [location.search]);

  const [showVerified, setShowVerified] = useState(false);

  useEffect(() => {
    if (verifiedInfo.verified) {
      setShowVerified(true);

      const cleanUrl = location.pathname; // "/login"
      window.history.replaceState({}, "", cleanUrl);
    }
  }, [verifiedInfo.verified, location.pathname]);

  useEffect(() => {
    if (!loading && user) {
      const next = (r) => {
        const map = { admin: "/admin", acland: "/admin", user: "/dashboard" };
        return map[r] || "/dashboard";
      };
      nav(next(user.role));
    }
  }, [user, loading, nav]);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      formSide="left"
    >
      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-6 flex items-center gap-2 animate-fade-in">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          {err}
        </div>
      )}

      {showVerified && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 relative">
          <button
            type="button"
            onClick={() => setShowVerified(false)}
            aria-label="Dismiss"
            className="absolute right-3 top-3 text-green-700/70 hover:text-green-800"
          >
            ×
          </button>
          {verifiedInfo.msg}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              type="email"
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
              className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Signing in...
            </>
          ) : (
            <>
              <LogIn size={20} />
              Sign in
            </>
          )}
        </button>

        <div className="text-center pt-4 border-t border-gray-100">
          <span className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Create account
            </Link>
          </span>
        </div>
      </form>
    </AuthShell>
  );
}
