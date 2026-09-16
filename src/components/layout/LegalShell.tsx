import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export function LegalShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex-1">
      <header className="px-4 py-4 flex items-center gap-2 border-b border-border">
        <Link href="/" aria-label="Volver al inicio" className="tap-target flex items-center justify-center -ml-2">
          <ChevronLeft size={26} aria-hidden="true" />
        </Link>
        <h1 className="text-xl font-extrabold">{title}</h1>
      </header>
      <main id="contenido-principal" className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-5 text-base leading-relaxed">
        {children}
      </main>
    </div>
  );
}
