import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/admin/dashboard");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-sm flex-col justify-center px-5">
      <h1 className="font-display text-2xl font-semibold text-asphalt-950">Admin Login</h1>
      <p className="mt-1 text-sm text-asphalt-700">Sign in to manage pothole repair status.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-asphalt-800">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-asphalt-700/30 p-2.5 text-sm focus:border-hazard-500 focus:outline-none"
            autoComplete="username"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-asphalt-800">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-asphalt-700/30 p-2.5 text-sm focus:border-hazard-500 focus:outline-none"
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-sm text-status-reported">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-asphalt-950 px-4 py-2.5 font-display font-semibold uppercase tracking-wide text-concrete-100 disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
