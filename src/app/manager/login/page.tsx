'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button, Input, Card, CardContent } from '@/components/ui';

const MANAGER_ACCOUNTS = {
  india: { email: 'marvel@slooze.com', password: 'password123', name: 'Captain Marvel', flag: '🇮🇳' },
  america: { email: 'america@slooze.com', password: 'password123', name: 'Captain America', flag: '🇺🇸' },
};

export default function ManagerLoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'manager' || user.role === 'admin') {
        router.push('/orders');
      } else {
        setError('Access denied. Manager credentials required.');
      }
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (country: 'india' | 'america') => {
    const account = MANAGER_ACCOUNTS[country];
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setIsSubmitting(true);
    try {
      await login(account.email, account.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (user && (user.role === 'manager' || user.role === 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <span className="text-3xl">👔</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Manager Portal
          </h1>
          <p className="text-blue-300">
            Slooze Food Ordering - Management
          </p>
        </div>

        <Card variant="elevated" padding="lg" className="bg-gray-800/50 backdrop-blur border-blue-500/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                id="email"
                type="email"
                label="Manager Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@slooze.com"
                disabled={isSubmitting}
                className="bg-gray-700/50 border-gray-600 text-white"
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
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              fullWidth
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in as Manager'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-3 text-center">Quick Login</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                onClick={() => handleQuickLogin('india')}
                disabled={isSubmitting}
                className="text-blue-300 hover:text-blue-200 border border-blue-500/30"
              >
                🇮🇳 Captain Marvel
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleQuickLogin('america')}
                disabled={isSubmitting}
                className="text-blue-300 hover:text-blue-200 border border-blue-500/30"
              >
                🇺🇸 Captain America
              </Button>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <a href="/login" className="text-blue-400 hover:text-blue-300 text-sm">
            ← Back to main login
          </a>
        </div>
      </div>
    </div>
  );
}
