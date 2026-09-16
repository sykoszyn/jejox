import Link from 'next/link';
import type { ReactNode } from 'react';

export function QuickActionButton({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 bg-surface border-2 border-border rounded-2xl py-5 px-2 text-center font-bold tap-target hover:border-primary/50"
    >
      <span className="text-primary" aria-hidden="true">
        {icon}
      </span>
      <span className="text-base">{label}</span>
    </Link>
  );
}
