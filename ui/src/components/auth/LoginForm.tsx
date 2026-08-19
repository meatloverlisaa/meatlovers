'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
      
      // If remember me is enabled, you could store preferences
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

  // Load remembered email on mount
  React.useEffect(() => {
    const remembered = localStorage.getItem('remember_login');
    if (remembered) {
      setEmailOrPhone(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">🥩 Meat Lovers</h1>
          <p className="text-gray-600">Customer Information Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{roleTitle} Login</h2>
            {roleDescription && (
              <p className="text-sm text-gray-600">{roleDescription}</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="ml-3 text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/Phone Input */}
            <div>
              <label htmlFor="email_or_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Phone Number
              </label>
              <input
                id="email_or_phone"
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                placeholder="Enter your email or phone"
                required
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition pr-12"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  minLength={8}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  disabled={isSubmitting}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <a
                href="/auth/forgot-password"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Need help? Contact your system administrator</p>
          </div>

          {/* Allowed Roles Info */}
          {allowedRoles && allowedRoles.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Authorized Roles:</strong> {allowedRoles.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Meat Lovers CIMS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
