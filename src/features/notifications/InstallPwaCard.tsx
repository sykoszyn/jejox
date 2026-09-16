'use client';

import { useEffect, useState } from 'react';
import { Download, Share } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { LargeButton } from '@/components/ui/LargeButton';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIos() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallPwaCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed] = useState(() => isStandalone());

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (installed) return null;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Download className="text-primary" size={24} aria-hidden="true" />
        <p className="text-lg font-bold">Instalar SaludSimple</p>
      </div>
      <p className="text-ink-muted">
        Podés agregar SaludSimple a la pantalla de inicio de tu teléfono para acceder más rápido,
        como si fuera una aplicación.
      </p>

      {deferredPrompt ? (
        <LargeButton
          icon={<Download size={20} />}
          onClick={async () => {
            await deferredPrompt.prompt();
            setDeferredPrompt(null);
          }}
        >
          Agregar a la pantalla de inicio
        </LargeButton>
      ) : isIos() ? (
        <p className="text-ink-muted flex items-center gap-2 text-sm">
          <Share size={18} className="shrink-0" /> En iPhone: tocá el botón Compartir de Safari y
          elegí &quot;Agregar a pantalla de inicio&quot;.
        </p>
      ) : (
        <p className="text-ink-muted text-sm">
          Buscá la opción &quot;Instalar aplicación&quot; o &quot;Agregar a pantalla de inicio&quot;
          en el menú de tu navegador.
        </p>
      )}
    </Card>
  );
}
