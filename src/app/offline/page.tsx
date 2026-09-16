import type { Metadata } from 'next';
import { WifiOff } from 'lucide-react';

export const metadata: Metadata = { title: 'Sin conexión · SaludSimple' };

export default function OfflinePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <WifiOff size={48} className="text-ink-muted" aria-hidden="true" />
      <h1 className="text-2xl font-bold">Sin conexión a internet</h1>
      <p className="text-lg text-ink-muted max-w-sm">
        No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo. Tu información
        no se pierde: podés volver a intentar cuando tengas señal.
      </p>
    </main>
  );
}
