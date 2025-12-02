'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user is already logged in
    const auth = sessionStorage.getItem('resolveitAuth');
    if (auth) {
      try {
        const user = JSON.parse(auth);
        setRedirecting(true);
        // Redirect based on role
        if (user.role === 'admin' || user.role === 'super_admin') {
          router.replace('/admin/dashboard');
        } else if (user.role === 'agent') {
          router.replace('/agent/dashboard');
        } else {
          router.replace('/auth/login');
        }
      } catch {
        setRedirecting(true);
        router.replace('/auth/login');
      }
    } else {
      setRedirecting(true);
      router.replace('/auth/login');
    }
  }, [router]);

  // Always show loading state to avoid hydration mismatch
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">R</span>
        </div>
        <p className="text-gray-600">
          {redirecting ? 'Redirecting...' : 'Loading...'}
        </p>
      </div>
    </div>
  );
}
