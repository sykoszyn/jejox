'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Pencil, Ban, RotateCcw } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { deactivateMedication, reactivateMedication } from './actions';

export function MedicationDetailActions({
  medicationId,
  isActive,
}: {
  medicationId: string;
  isActive: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleDeactivate() {
    startTransition(async () => {
      const result = await deactivateMedication(medicationId);
      if (result?.error) setError(result.error);
      setConfirmOpen(false);
    });
  }

  function handleReactivate() {
    startTransition(async () => {
      const result = await reactivateMedication(medicationId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="text-danger font-medium">
          {error}
        </p>
      )}
      <Link href={`/medicamentos/${medicationId}/editar`}>
        <LargeButton variant="secondary" icon={<Pencil size={20} />} fullWidth>
          Editar medicamento
        </LargeButton>
      </Link>
      {isActive ? (
        <LargeButton
          variant="ghost"
          icon={<Ban size={20} />}
          fullWidth
          onClick={() => setConfirmOpen(true)}
        >
          Desactivar medicamento
        </LargeButton>
      ) : (
        <LargeButton
          variant="ghost"
          icon={<RotateCcw size={20} />}
          fullWidth
          onClick={handleReactivate}
          loading={pending}
        >
          Reactivar medicamento
        </LargeButton>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="¿Desactivar este medicamento?"
        description="No vas a recibir más recordatorios, pero se conserva todo el historial de tomas. Podés reactivarlo cuando quieras."
        confirmLabel="Desactivar"
        cancelLabel="Cancelar"
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
