import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main id="contenido-principal" className="flex-1 flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <Link href="/" className="flex flex-col items-center gap-3">
          <Image src="/icons/icon-96.png" alt="" width={64} height={64} priority />
          <span className="text-2xl font-extrabold text-primary">Mejoralito</span>
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-ink-muted text-lg mt-1">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
