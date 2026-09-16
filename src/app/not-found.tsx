import Link from 'next/link';
import { Compass } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <Compass size={48} className="text-ink-muted" aria-hidden="true" />
      <h1 className="text-2xl font-bold">No encontramos esta página</h1>
      <p className="text-lg text-ink-muted max-w-sm">
        Puede que el enlace esté roto o que la página haya cambiado de lugar.
      </p>
      <Link href="/">
        <LargeButton>Volver al inicio</LargeButton>
      </Link>
    </main>
  );
}
