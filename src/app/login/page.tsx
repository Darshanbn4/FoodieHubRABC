'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button, Input, Card, CardContent } from '@/components/ui';

const DEMO_ACCOUNTS = {
  admin: { email: 'nick@slooze.com', password: 'password123', label: 'Admin (Nick Fury)' },
  managerIndia: { email: 'marvel@slooze.com', password: 'password123', label: 'Manager India' },
  managerAmerica: { email: 'america@slooze.com', password: 'password123', label: 'Manager America' },
  memberThanos: { email: 'thanos@slooze.com', password: 'password123', label: 'Member India - Thanos' },
  memberThor: { email: 'thor@slooze.com', password: 'password123', label: 'Member India - Thor' },
  memberTravis: { email: 'travis@slooze.com', password: 'password123', label: 'Member America - Travis' },
};

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role-based redirect after login
  useEffect(() => {
    if (!isLoading && user) {
      redirectBasedOnRole(user.role);
    }
  }, [user, isLoading, router]);

  const redirectBasedOnRole = (role: string) => {
    // All users go to restaurants page after login
    router.push('/restaurants');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setIsSubmitting(true);

    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleQuickLogin = async (accountKey: keyof typeof DEMO_ACCOUNTS) => {
    const account = DEMO_ACCOUNTS[accountKey];
    setEmail(account.email);
    setPassword(account.password);
    await performLogin(account.email, account.password);
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🍕 Slooze Food Ordering
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                id="email"
                type="email"
                label="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isSubmitting}
              />

              <Input
                id="password"
                type="password"
                label="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} fullWidth>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Card>


        {/* Quick Login Buttons */}
        <Card variant="default" padding="lg">
          <CardContent>
            <p className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Quick Demo Login
            </p>
            
            {/* Admin */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Admin</p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => handleQuickLogin('admin')}
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                🛡️ Login as Nick Fury (Admin)
              </Button>
            </div>

            {/* Managers */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Managers</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleQuickLogin('managerIndia')}
                  disabled={isSubmitting}
                  className="text-sm"
                >
                  🇮🇳 Captain Marvel
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleQuickLogin('managerAmerica')}
                  disabled={isSubmitting}
                  className="text-sm"
                >
                  🇺🇸 Captain America
                </Button>
              </div>
            </div>

            {/* Members */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Members</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="ghost"
                  onClick={() => handleQuickLogin('memberThanos')}
                  disabled={isSubmitting}
                  className="text-sm border border-gray-300 dark:border-gray-600"
                >
                  🇮🇳 Thanos
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleQuickLogin('memberThor')}
                  disabled={isSubmitting}
                  className="text-sm border border-gray-300 dark:border-gray-600"
                >
                  🇮🇳 Thor
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleQuickLogin('memberTravis')}
                  disabled={isSubmitting}
                  className="text-sm border border-gray-300 dark:border-gray-600"
                >
                  🇺🇸 Travis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-specific login links */}
        <div className="flex justify-center gap-4 text-sm">
          <a href="/admin/login" className="text-purple-600 dark:text-purple-400 hover:underline">
            Admin Portal →
          </a>
          <a href="/manager/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Manager Portal →
          </a>
        </div>
      </div>
    </div>
  );
}
