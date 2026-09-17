'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Check, Clock, X, Pill } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { markMedicationTaken, markMedicationSkipped, snoozeMedication } from '@/lib/medications/actions';
import { playAlarmAudio, stopAlarmAudio } from './alarmAudio';

export interface DoseInfo {
  medicationId: string;
  scheduleId: string | null;
  scheduledFor: string; // ISO
  /** Hora real a partir de la cual esta toma debe considerarse vencida
   * (si está pospuesta, es la nueva hora; si no, igual a scheduledFor). */
  effectiveFor: string; // ISO
  name: string;
  dose: number;
  doseUnit: string;
  timeLabel: string;
}

export function DoseActionDialog({
  dose,
  open,
  onClose,
}: {
  dose: DoseInfo | null;
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [showSnooze, setShowSnooze] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Suena en bucle mientras el recordatorio esté sin resolver, para que se
  // note aunque el teléfono esté en la otra habitación. Se corta apenas se
  // toca cualquiera de los tres botones (o se cierra el diálogo), porque
  // en ese momento este componente se desmonta (ver key en el padre). Usa
  // un único <audio> compartido (alarmAudio.ts) en vez de crear uno nuevo
  // acá: así, cuando este diálogo se abre solo (sin un toque nuevo del
  // usuario justo antes), puede seguir sonando si ese audio ya fue
  // "desbloqueado" antes por algún toque anterior en la app.
  useEffect(() => {
    if (!open) return;
    playAlarmAudio();
    return () => stopAlarmAudio();
  }, [open]);

  if (!dose) return null;

  const input = {
    medicationId: dose.medicationId,
    scheduleId: dose.scheduleId,
    scheduledFor: dose.scheduledFor,
  };

  function handleTaken() {
    startTransition(async () => {
      const result = await markMedicationTaken(input);
      if (result?.error) setError(result.error);
      else onClose();
    });
  }

  function handleSkip() {
    startTransition(async () => {
      const result = await markMedicationSkipped(input);
      if (result?.error) setError(result.error);
      else onClose();
    });
  }

  function handleSnooze(minutes: 15 | 30 | 60) {
    startTransition(async () => {
      const result = await snoozeMedication(input, minutes);
      if (result?.error) setError(result.error);
      else onClose();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="dose-dialog-title"
      className="rounded-3xl border-2 border-border p-0 bg-surface text-ink max-w-sm w-[92vw] backdrop:bg-black/60"
    >
      <div className="p-6 flex flex-col items-center gap-4 text-center">
        <Pill className="text-primary" size={48} aria-hidden="true" />
        <p className="text-lg font-bold uppercase tracking-wide text-ink-muted">
          Es hora de tomar
        </p>
        <p className="sr-only" role="status">
          Sonando hasta que confirmes qué hiciste con este medicamento.
        </p>
        <h2 id="dose-dialog-title" className="text-2xl font-extrabold">
          {dose.name}
        </h2>
        <p className="text-xl">
          {dose.dose} {dose.doseUnit} · {dose.timeLabel}
        </p>

        {error && (
          <p role="alert" className="text-danger font-medium">
            {error}
          </p>
        )}

        {!showSnooze ? (
          <div className="flex flex-col gap-3 w-full mt-2">
            <LargeButton
              size="xl"
              fullWidth
              icon={<Check size={26} />}
              onClick={handleTaken}
              loading={pending}
            >
              Ya la tomé
            </LargeButton>
            <LargeButton
              variant="secondary"
              fullWidth
              icon={<Clock size={22} />}
              onClick={() => setShowSnooze(true)}
              disabled={pending}
            >
              Recordar más tarde
            </LargeButton>
            <LargeButton
              variant="ghost"
              fullWidth
              icon={<X size={22} />}
              onClick={handleSkip}
              disabled={pending}
            >
              Omitir
            </LargeButton>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full mt-2">
            <p className="font-bold">¿Cuánto tiempo?</p>
            <div className="flex gap-2">
              <LargeButton size="md" fullWidth onClick={() => handleSnooze(15)} loading={pending}>
                15 min
              </LargeButton>
              <LargeButton size="md" fullWidth onClick={() => handleSnooze(30)} loading={pending}>
                30 min
              </LargeButton>
              <LargeButton size="md" fullWidth onClick={() => handleSnooze(60)} loading={pending}>
                1 hora
              </LargeButton>
            </div>
            <LargeButton variant="ghost" onClick={() => setShowSnooze(false)} disabled={pending}>
              Volver
            </LargeButton>
          </div>
        )}
      </div>
    </dialog>
  );
}
