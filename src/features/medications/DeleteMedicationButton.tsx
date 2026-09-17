'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { deleteMedication } from './actions';

export function DeleteMedicationButton({
  medicationId,
  medicationName,
}: {
  medicationId: string;
  medicationName: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMedication(medicationId);
      if (result?.error) {
        setError(result.error);
        setConfirmOpen(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="text-danger font-medium">
          {error}
        </p>
      )}
      <LargeButton
        type="button"
        variant="ghost"
        icon={<Trash2 size={20} />}
        fullWidth
        onClick={() => setConfirmOpen(true)}
        className="text-danger"
      >
        Eliminar medicamento
      </LargeButton>

      <ConfirmDialog
        open={confirmOpen}
        title={`¿Eliminar "${medicationName}"?`}
        description="Esto borra el medicamento y todo su historial de tomas, para siempre. Si solo querés dejar de tomarlo pero conservar el historial, mejor desactivalo desde su pantalla de detalle."
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
      {pending && (
        <p role="status" className="text-center text-ink-muted text-sm">
          Eliminando…
        </p>
      )}
    </div>
  );
}
