'use client';

import { useTransition } from 'react';
import { Check, X, Ban } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { LargeButton } from '@/components/ui/LargeButton';
import {
  revokeCaregiver,
  acceptCaregiverInvitation,
  declineCaregiverInvitation,
} from './actions';
import type { CaregiverPermission } from '@/types/database';

const PERMISSION_LABELS: Record<CaregiverPermission, string> = {
  read: 'Solo puede ver',
  edit: 'Puede ver y ayudar a registrar',
};

export function InvitedCaregiverRow({ id, email, permission, status }: { id: string; email: string; permission: CaregiverPermission; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card className="flex items-center justify-between gap-3">
      <div>
        <p className="font-bold">{email}</p>
        <p className="text-sm text-ink-muted">
          {PERMISSION_LABELS[permission]} ·{' '}
          {status === 'pending' ? 'Invitación pendiente' : 'Activo'}
        </p>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(async () => { await revokeCaregiver(id); })}
        aria-label={`Quitar acceso a ${email}`}
        className="tap-target text-danger flex items-center justify-center rounded-xl border border-border"
      >
        <Ban size={20} />
      </button>
    </Card>
  );
}

export function ReceivedInvitationRow({ id, ownerName }: { id: string; ownerName: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card className="flex items-center justify-between gap-3">
      <p className="font-bold">{ownerName}</p>
      <div className="flex gap-2">
        <LargeButton
          size="md"
          loading={pending}
          icon={<Check size={18} />}
          onClick={() => startTransition(async () => { await acceptCaregiverInvitation(id); })}
        >
          Aceptar
        </LargeButton>
        <LargeButton
          size="md"
          variant="ghost"
          disabled={pending}
          icon={<X size={18} />}
          onClick={() => startTransition(async () => { await declineCaregiverInvitation(id); })}
        >
          Rechazar
        </LargeButton>
      </div>
    </Card>
  );
}
