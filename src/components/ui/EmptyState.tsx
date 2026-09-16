import type { ReactNode } from 'react';
import { Card } from './Card';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center text-center gap-3 py-10">
      {icon && (
        <div className="text-primary" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="text-lg font-bold">{title}</p>
      {description && <p className="text-ink-muted text-base">{description}</p>}
      {action}
    </Card>
  );
}
