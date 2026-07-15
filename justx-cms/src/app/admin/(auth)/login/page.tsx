"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log("Login attempt:", { email });
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      console.log("Login response status:", res.status);
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Login failed:", data);
        setError(data.error || "Login failed");
        return;
      }
      
      const data = await res.json();
      console.log("Login successful:", data);
      
      // Wait a bit to ensure cookie is processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use window.location for a hard redirect to ensure new session is loaded
      console.log("Redirecting to dashboard...");
      window.location.href = "/admin/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded bg-white p-8 shadow-lg">
        <h1 className="font-display text-2xl text-ink">JustX CMS</h1>
        <p className="mt-1 text-sm text-muted">Sign in to the admin dashboard.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-border px-3 py-2 text-sm"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded bg-ink py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
