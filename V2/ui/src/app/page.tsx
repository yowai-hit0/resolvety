'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loader from './components/Loader';

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
    <Loader
      size="lg"
      message={redirecting ? 'Redirecting...' : 'Loading...'}
      fullScreen={true}
    />
  );
}
