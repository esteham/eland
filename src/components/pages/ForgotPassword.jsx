import { useState } from "react";
import api from "../../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      setLoading(true);
      await api.post("/password/forgot", { email });
      setMsg(
        "If an account exists for that email, a reset link has been sent."
      );
    } catch (e) {
      // We still show generic message
      setMsg(
        "If an account exists for that email, a reset link has been sent."
      );
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
          Forgot Password
        </h2>
        {msg && <p className="text-green-600 text-center mb-4">{msg}</p>}
        {err && <p className="text-red-600 text-center mb-4">{err}</p>}
        <input
          type="email"
          className="w-full px-4 py-2 border rounded-md mb-4 focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
