"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-config";
import { getAuthHeader } from "@/lib/auth";

type Profile = { full_name?: string; email?: string; phone?: string; role?: string };

export default function RiderProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getApiBaseUrl()}/auth/profile`, { headers: getAuthHeader() })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load your profile.");
        return response.json() as Promise<Profile>;
      })
      .then((data) => {
        setProfile(data);
        setFullName(data.full_name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
      })
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const updateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const response = await fetch(`${getApiBaseUrl()}/auth/profile`, {
      method: "PATCH",
      headers: { ...getAuthHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, email, phone }),
    });
    if (!response.ok) {
      setError("Unable to update your profile.");
      return;
    }
    setProfile(await response.json());
    setMessage("Profile updated.");
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const response = await fetch(`${getApiBaseUrl()}/auth/change-password`, {
      method: "POST",
      headers: { ...getAuthHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    if (!response.ok) {
      setError("Unable to change your password. Check your current password.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setMessage("Password changed.");
  };

  if (loading) return <main className="min-h-screen bg-zinc-50 p-6 text-zinc-700">Loading profile...</main>;

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950">
      <div className="mx-auto max-w-2xl">
        <Link href="/rider" className="text-sm font-bold text-red-700">← Back to route</Link>
        <div className="mt-5 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Rider account</p><h1 className="mt-2 text-3xl font-black">Profile</h1></div><span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-black">{profile?.role || "RIDER"}</span></div>
        {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
        <form onSubmit={updateProfile} className="mt-6 space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">Personal details</h2>
          <input aria-label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" required className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-red-500" />
          <input aria-label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" required className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-red-500" />
          <input aria-label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-red-500" />
          <button className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-black text-white hover:bg-zinc-800">Save details</button>
        </form>
        <form onSubmit={changePassword} className="mt-5 space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">Security</h2>
          <input aria-label="Current password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Current password" required className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-red-500" />
          <input aria-label="New password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password" minLength={8} required className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-red-500" />
          <button className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-black hover:bg-zinc-50">Change password</button>
        </form>
      </div>
    </main>
  );
}