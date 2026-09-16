import { AlertTriangle } from 'lucide-react';
import { LargeButton } from './LargeButton';
import { Card } from './Card';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'No pudimos cargar la información. Revisá tu conexión e intentá nuevamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Card
      role="alert"
      className="flex flex-col items-center text-center gap-4 py-8 border-danger/40 bg-danger-soft"
    >
      <AlertTriangle className="text-danger" size={36} aria-hidden="true" />
      <p className="text-base font-medium">{message}</p>
      {onRetry && (
        <LargeButton variant="secondary" size="md" onClick={onRetry}>
          Reintentar
        </LargeButton>
      )}
    </Card>
  );
}
