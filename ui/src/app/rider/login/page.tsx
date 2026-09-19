"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function RiderLoginPage() {
  const { login, user, isLoading } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === "RIDER") window.location.replace("/rider");
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(emailOrPhone, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm font-semibold text-white">Loading rider portal...</main>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#160b0b] px-5 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-red-900/50 bg-zinc-950 p-8 shadow-2xl shadow-black/30">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-400">Meat Lovers</p>
        <h1 className="mt-3 text-3xl font-black">Rider portal</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">Sign in to view your route, update delivery status, and share your location.</p>

        {error && <p className="mt-6 rounded-xl border border-red-800 bg-red-950/50 p-3 text-sm text-red-200">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <label className="block text-sm font-semibold text-zinc-200">
            Email or phone
            <input value={emailOrPhone} onChange={(event) => setEmailOrPhone(event.target.value)} required autoComplete="username" className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-500" />
          </label>
          <label className="block text-sm font-semibold text-zinc-200">
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-500" />
          </label>
          <button type="submit" disabled={submitting} className="w-full rounded-xl bg-red-700 px-4 py-3 font-black transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}