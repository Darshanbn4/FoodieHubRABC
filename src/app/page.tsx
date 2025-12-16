'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirect based on role
        switch (user.role) {
          case 'admin':
            router.push('/settings/payments');
            break;
          case 'manager':
            router.push('/orders');
            break;
          default:
            router.push('/restaurants');
        }
      } else {
        // Not logged in - go to login
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return <LoadingSpinner fullScreen />;
}
