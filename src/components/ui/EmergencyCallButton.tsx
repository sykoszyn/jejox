'use client';

import { useState } from 'react';
import { PhoneCall } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

export function EmergencyCallButton({ name, phone }: { name: string; phone: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 w-full min-h-14 rounded-xl bg-accent text-accent-contrast font-extrabold text-lg tap-target"
      >
        <PhoneCall size={22} aria-hidden="true" /> CONTACTO DE EMERGENCIA
      </button>
      <ConfirmDialog
        open={open}
        title={`¿Llamar a ${name}?`}
        confirmLabel="Llamar"
        cancelLabel="Cancelar"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          window.location.href = `tel:${phone}`;
          setOpen(false);
        }}
      />
    </>
  );
}
