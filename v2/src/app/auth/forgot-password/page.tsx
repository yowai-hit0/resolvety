'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon, { faEnvelope, faCheckCircle, faArrowLeft } from '@/app/components/Icon';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email
    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please provide a valid email address');
      setLoading(false);
      return;
    }

    // Mock password reset for now
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Success Message */}
        <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-2xl">R</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
              <p className="text-sm text-gray-600">
                We've sent password reset instructions to your email
              </p>
            </div>

            {/* Success Message */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-sm">
              <div className="flex items-start gap-3">
                <Icon icon={faCheckCircle} className="text-green-600 mt-0.5" size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 mb-1">
                    Reset email sent successfully!
                  </p>
                  <p className="text-xs text-green-700">
                    Please check your inbox at <strong>{email}</strong> and follow the instructions to reset your password.
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-sm">
              <p className="text-xs text-gray-600 mb-2">
                <strong>Didn't receive the email?</strong>
              </p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes and try again</li>
              </ul>
            </div>

            {/* Back to Login */}
            <Link
              href="/auth/login"
              className="w-full py-2.5 bg-accent text-white rounded-sm font-medium hover:bg-accent-600 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Icon icon={faArrowLeft} size="sm" />
              <span>Back to Login</span>
            </Link>

            {/* Footer */}
            <div className="mt-12 text-center">
              <p className="text-xs text-gray-500 mb-2">© 2025 ResolveIt</p>
              <p className="text-xs text-gray-500">
                A comprehensive ticket management system for efficient customer support
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Image Cover */}
        <div className="hidden lg:flex lg:w-[60%] relative bg-gradient-to-br from-accent-600 to-accent-800">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
            backgroundImage: 'url("/login-cover.jpg")',
          }}>
            <div className="absolute inset-0 bg-accent/40"></div>
          </div>
          
          <div className="relative z-10 flex items-end justify-center w-full p-12 pb-24">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Password Reset</h2>
              <p className="text-xl opacity-90">
                Follow the instructions in your email to reset your password
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Forgot Password Form */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
            <p className="text-sm text-gray-600">
              No worries! Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Icon icon={faEnvelope} size="sm" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent text-sm"
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                We'll send a password reset link to this email
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-white rounded-sm font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-accent transition-colors"
            >
              <Icon icon={faArrowLeft} size="xs" />
              <span>Back to Login</span>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs text-gray-500 mb-2">© 2025 ResolveIt</p>
            <p className="text-xs text-gray-500">
              A comprehensive ticket management system for efficient customer support
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image Cover */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-gradient-to-br from-accent-600 to-accent-800">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
          backgroundImage: 'url("/login-cover.jpg")',
        }}>
          <div className="absolute inset-0 bg-accent/40"></div>
        </div>
        
        {/* Optional overlay content */}
          <div className="relative z-10 flex items-end justify-center w-full p-12 pb-24">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Reset Your Password</h2>
              <p className="text-xl opacity-90">
                Enter your email and we'll help you regain access to your account
              </p>
            </div>
          </div>
      </div>
    </div>
  );
}

