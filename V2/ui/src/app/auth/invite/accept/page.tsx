'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon, { faEnvelope, faLock, faUser, faEye, faEyeSlash } from '@/app/components/Icon';

function AcceptInviteForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. Please check your email for the correct link.');
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
    setLoading(false);
  }, [token]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    if (!token) {
      setError('Missing invitation token. Please use the link from your email.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    // Mock invite acceptance for now
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - role would come from the invite token
      const mockUser = {
        id: Date.now(),
        email: 'invited@resolveit.rw', // Would come from token
        name: name.trim(),
        role: 'agent' // Would come from token
      };

      // Store in sessionStorage
      sessionStorage.setItem('resolveitAuth', JSON.stringify(mockUser));
      sessionStorage.setItem('resolveitRole', mockUser.role);
      sessionStorage.setItem('adminName', mockUser.name);

      // Redirect based on role
      if (mockUser.role === 'admin' || mockUser.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else if (mockUser.role === 'agent') {
        router.push('/agent/dashboard');
      } else {
        router.push('/auth/login');
      }
    } catch (err) {
      setError('Failed to accept invite. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex">
        <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon={faEnvelope} size="lg" className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
            <p className="text-sm text-gray-600 mb-6">
              {error || 'This invitation link is invalid or has expired.'}
            </p>
            <Link
              href="/auth/login"
              className="inline-block w-full py-2.5 bg-primary-500 text-white rounded-sm font-medium hover:bg-primary-600 transition-colors text-sm"
              style={{ backgroundColor: '#0f36a5' }}
            >
              Go to Login
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex lg:w-[60%] relative bg-gradient-to-br from-accent-600 to-accent-800">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
            backgroundImage: 'url("/login-cover.jpg")',
          }}>
            <div className="absolute inset-0 bg-accent/40"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Accept Invite Form */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Accept Invitation</h1>
            <p className="text-sm text-gray-600">
              Complete your account setup to join ResolveIt
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Accept Invite Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Icon icon={faUser} size="sm" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 text-sm ${
                    errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-accent focus:ring-accent'
                  }`}
                  placeholder="Enter your full name"
                  required
                  disabled={submitting}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This will be used to identify you in the system
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Icon icon={faLock} size="sm" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 text-sm ${
                    errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-accent focus:ring-accent'
                  }`}
                  placeholder="Create a secure password"
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  <Icon icon={showPassword ? faEyeSlash : faEye} size="sm" />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Icon icon={faLock} size="sm" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border rounded-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 text-sm ${
                    errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-accent focus:ring-accent'
                  }`}
                  placeholder="Confirm your password"
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  <Icon icon={showConfirmPassword ? faEyeSlash : faEye} size="sm" />
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !name || !password || !confirmPassword}
              className="w-full py-2.5 bg-primary-500 text-white rounded-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-6"
              style={{ backgroundColor: '#0f36a5' }}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account & Continue'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-accent hover:text-accent-600 font-medium">
                Sign in
              </Link>
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
            <h2 className="text-4xl font-bold mb-4">Welcome to ResolveIt</h2>
            <p className="text-xl opacity-90">
              You've been invited to join our team. Complete your setup to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AcceptInviteForm />
    </Suspense>
  );
}

