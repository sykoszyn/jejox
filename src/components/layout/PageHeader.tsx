import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

export function PageHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref?: string;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur border-b border-border px-4 py-4 flex items-center gap-2">
      {backHref && (
        <Link
          href={backHref}
          aria-label="Volver"
          className="tap-target flex items-center justify-center rounded-full -ml-2"
        >
          <ChevronLeft size={28} aria-hidden="true" />
        </Link>
      )}
      <h1 className="text-xl font-extrabold flex-1 truncate">{title}</h1>
      {action}
    </header>
  );
}
