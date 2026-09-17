import type { Metadata } from 'next';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { PushPermissionCard } from '@/features/notifications/PushPermissionCard';
import { InstallPwaCard } from '@/features/notifications/InstallPwaCard';
import { ReminderToggle } from '@/features/settings/ReminderToggle';

export const metadata: Metadata = { title: 'Notificaciones · Mejoralito' };

export default async function NotificacionesPage() {
  const { profile } = await requireProfile();

  return (
    <div>
      <PageHeader title="Notificaciones" backHref="/configuracion" />
      <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-4">
        <ReminderToggle initialEnabled={profile.reminders_enabled} />
        <PushPermissionCard />
        <InstallPwaCard />
        <p className="text-sm text-ink-muted bg-surface-muted rounded-xl p-3">
          Importante: en iPhone, las notificaciones push solo funcionan si instalaste Mejoralito
          en la pantalla de inicio (no alcanza con tenerla abierta en Safari). Ni iOS ni Android
          garantizan que una notificación llegue en el segundo exacto si el teléfono está en modo
          de ahorro de batería: es una limitación del sistema operativo, no de la aplicación.
        </p>
      </div>
    </div>
  );
}
