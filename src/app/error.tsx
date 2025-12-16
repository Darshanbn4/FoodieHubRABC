'use client';

import { useEffect } from 'react';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <ErrorMessage
      title="Something went wrong"
      message={error.message || 'An unexpected error occurred'}
      onRetry={reset}
      fullScreen
    />
  );
}
