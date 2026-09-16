'use client';

import { ErrorState } from '@/components/ui/ErrorState';

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="px-4 py-10 max-w-md mx-auto">
      <ErrorState onRetry={reset} />
    </div>
  );
}
