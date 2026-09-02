'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  FireIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface LoginFormProps {
  roleTitle: string;
  roleDescription?: string;
  allowedRoles?: string[];
}

export default function LoginForm({ roleTitle, roleDescription, allowedRoles }: LoginFormProps) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(emailOrPhone, password);

      if (rememberMe) {
        localStorage.setItem('remember_login', emailOrPhone);
      } else {
        localStorage.removeItem('remember_login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    const remembered = localStorage.getItem('remember_login');
    if (remembered) {
      setEmailOrPhone(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ec,_#f4d0a8_24%,_#4b0d0d_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-[#f5d38d]/40 bg-[#fffaf5]/90 shadow-[0_30px_100px_rgba(62,10,10,0.22)] backdrop-blur-sm lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden bg-[#3b0707] px-8 py-10 text-white sm:px-10 lg:px-12 lg:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(246,194,92,0.25),_transparent_35%)]" />
            <div className="relative z-10">
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#f0c774]/40 bg-white/5 px-4 py-2 backdrop-blur-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3c77a] text-[#3b0707] shadow-lg shadow-[#f3c77a]/20">
                  <FireIcon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f8d89a]">
                  Meat Lovers
                </span>
              </div>

              <div className="mb-8">
                <p className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-[#f7d9a0]">
                  {roleTitle}
                </p>
                <h1 className="max-w-sm text-4xl font-black leading-tight text-white sm:text-5xl">
                  Access your operational command center.
                </h1>
              </div>

              {roleDescription && (
                <p className="max-w-md text-base leading-7 text-red-100/90">{roleDescription}</p>
              )}

              <div className="mt-8 space-y-4">
                {[
                  'Secure staff authentication',
                  'Faster role-based workflows',
                  'Operational visibility across restaurant teams',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4c570] text-[#3b0707]">
                      <ShieldCheckIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-red-50">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#fffaf5] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b27a1d]">Access</p>
                <h2 className="mt-2 text-3xl font-black text-[#2b120e]">{roleTitle} Login</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5e5c5] text-[#7a4310] shadow-inner shadow-[#d8ac59]/30">
                <SparklesIcon className="h-6 w-6" />
              </div>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-red-100 p-1 text-red-700">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email_or_phone" className="mb-2 block text-sm font-semibold text-[#3a220d]">
                  Email or Phone
                </label>
                <input
                  id="email_or_phone"
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full rounded-2xl border border-[#e6d7bd] bg-white px-4 py-3 text-[#2b120e] shadow-sm outline-none transition focus:border-[#d59d2b] focus:ring-4 focus:ring-[#f0d89c]/60"
                  placeholder="Enter your email or phone number"
                  required
                  autoComplete="username"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#3a220d]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-[#e6d7bd] bg-white px-4 py-3 pr-12 text-[#2b120e] shadow-sm outline-none transition focus:border-[#d59d2b] focus:ring-4 focus:ring-[#f0d89c]/60"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    minLength={8}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#6d4a1d] transition hover:bg-[#f8edd8]"
                    disabled={isSubmitting}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#50371d]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#dcb771] text-[#a91f1f] focus:ring-[#d59d2b]"
                    disabled={isSubmitting}
                  />
                  Remember me
                </label>
                <a href="/auth/forgot-password" className="text-sm font-semibold text-[#a91f1f] transition hover:text-[#7d1212]">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#a91f1f] via-[#7d1212] to-[#b8342a] px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-[#8f1717]/30 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#f0d89c]/70 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-[#f3d79c] bg-[#fff3d8] p-3 text-center text-xs font-medium text-[#74470d]">
              Secure access for all restaurant operations and staff dashboards.
            </div>

            {allowedRoles && allowedRoles.length > 0 && (
              <div className="mt-4 rounded-2xl border border-[#dfe6ef] bg-[#f4f8ff] p-3 text-center text-xs text-[#344a68]">
                <strong className="font-bold">Authorized roles:</strong> {allowedRoles.join(', ')}
              </div>
            )}

            <div className="mt-6 text-center text-sm text-[#74543e]">Need help? Contact your system administrator.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
