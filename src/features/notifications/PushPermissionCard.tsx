'use client';

import { useEffect, useState, useTransition } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { LargeButton } from '@/components/ui/LargeButton';
import { isPushSupported, subscribeToPush, getExistingSubscription } from './webPushClient';
import { savePushSubscription, removePushSubscription } from './actions';

type Status = 'checking' | 'unsupported' | 'denied' | 'off' | 'on';

function initialStatus(): Status {
  if (typeof window === 'undefined') return 'checking';
  if (!isPushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  return 'checking';
}

export function PushPermissionCard() {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!isPushSupported() || Notification.permission === 'denied') return;
    getExistingSubscription().then((sub) => setStatus(sub ? 'on' : 'off'));
  }, []);

  function handleEnable() {
    setError('');
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setStatus(permission === 'denied' ? 'denied' : 'off');
          return;
        }
        const subscription = await subscribeToPush();
        const json = subscription.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
          throw new Error('Suscripción inválida');
        }
        const result = await savePushSubscription({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        });
        if (result?.error) {
          setError(result.error);
          return;
        }
        setStatus('on');
      } catch {
        setError('No pudimos activar las notificaciones en este dispositivo.');
      }
    });
  }

  function handleDisable() {
    setError('');
    startTransition(async () => {
      const subscription = await getExistingSubscription();
      if (subscription) {
        await removePushSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus('off');
    });
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {status === 'on' ? (
          <BellRing className="text-primary" size={24} aria-hidden="true" />
        ) : (
          <Bell className="text-primary" size={24} aria-hidden="true" />
        )}
        <p className="text-lg font-bold">Notificaciones push</p>
      </div>

      {status === 'checking' && <p className="text-ink-muted">Comprobando…</p>}

      {status === 'unsupported' && (
        <p className="text-ink-muted">
          Este navegador no admite notificaciones push. En iPhone, instalá la app en la pantalla de
          inicio primero (ver instrucciones más abajo) y volvé a intentar desde ahí.
        </p>
      )}

      {status === 'denied' && (
        <p className="text-ink-muted flex items-center gap-2">
          <BellOff size={18} /> Bloqueaste las notificaciones para SaludSimple. Para activarlas,
          cambiá el permiso desde la configuración del navegador.
        </p>
      )}

      {status === 'off' && (
        <>
          <p className="text-ink-muted">
            Activá las notificaciones para recibir recordatorios cuando sea hora de tomar tus
            medicamentos.
          </p>
          <LargeButton onClick={handleEnable} loading={pending} icon={<Bell size={20} />}>
            Activar notificaciones
          </LargeButton>
        </>
      )}

      {status === 'on' && (
        <>
          <p className="text-success font-medium">Las notificaciones están activadas.</p>
          <LargeButton variant="secondary" onClick={handleDisable} loading={pending} icon={<BellOff size={20} />}>
            Desactivar en este dispositivo
          </LargeButton>
        </>
      )}

      {error && (
        <p role="alert" className="text-danger font-medium">
          {error}
        </p>
      )}
    </Card>
  );
}
