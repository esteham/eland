import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "../../api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const tokenFromUrl = params.get("token") || "";
  const emailFromUrl = params.get("email") || "";

  const [form, setForm] = useState({
    email: emailFromUrl,
    token: tokenFromUrl,
    password: "",
    password_confirmation: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm((f) => ({ ...f, email: emailFromUrl, token: tokenFromUrl }));
  }, [emailFromUrl, tokenFromUrl]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      setLoading(true);
      await api.post("/password/reset", form);
      setMsg("Password has been reset. You can now log in.");
      setTimeout(() => nav("/login"), 1200);
    } catch (e) {
      const m =
        e?.response?.data?.message ||
        "Reset failed. The link may be invalid or expired.";
      setErr(m);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Reset Password
        </h2>

        {msg && <p className="text-green-600 text-center mb-4">{msg}</p>}
        {err && <p className="text-red-600 text-center mb-4">{err}</p>}

        <input
          type="email"
          className="w-full px-4 py-2 border rounded-md mb-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          required
        />
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-md mb-3"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="New password"
          required
        />
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-md mb-4"
          value={form.password_confirmation}
          onChange={(e) =>
            setForm({ ...form, password_confirmation: e.target.value })
          }
          placeholder="Confirm new password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Reset Password"}
        </button>

        <p className="text-center mt-4 text-gray-600">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}
