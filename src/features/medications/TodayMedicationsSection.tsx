'use client';

import { useEffect, useState } from 'react';
import { Pill, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { LargeButton } from '@/components/ui/LargeButton';
import { DoseActionDialog, type DoseInfo } from './DoseActionDialog';

export interface DoseViewModel extends DoseInfo {
  status: 'pending' | 'taken' | 'skipped' | 'snoozed';
  takenAtLabel: string | null;
}

const CHECK_INTERVAL_MS = 15_000;

export function TodayMedicationsSection({ doses }: { doses: DoseViewModel[] }) {
  const [activeDose, setActiveDose] = useState<DoseInfo | null>(null);

  const pending = doses.filter((d) => d.status === 'pending' || d.status === 'snoozed');
  const next = pending[0] ?? null;
  const rest = pending.slice(1);
  const resolvedToday = doses.filter((d) => d.status === 'taken' || d.status === 'skipped');

  // La alarma no debería depender de que alguien se acuerde de tocar
  // "Tomar": mientras la app esté abierta, en cuanto se cumple el horario
  // (o se vence una posposición) esto abre solo el diálogo con sonido. Si
  // se cierra sin elegir una acción (por ej. con Escape), sigue pendiente
  // y vuelve a sonar en el próximo chequeo — a propósito, para que insista.
  useEffect(() => {
    const check = () => {
      setActiveDose((current) => {
        if (current) return current;
        const due = pending.find((d) => new Date(d.effectiveFor).getTime() <= Date.now());
        return due ?? current;
      });
    };
    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending.map((d) => `${d.scheduleId}-${d.effectiveFor}`).join(',')]);

  if (doses.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="proximo-medicamento" className="flex flex-col gap-4">
      <h2 id="proximo-medicamento" className="text-lg font-bold text-ink-muted">
        Próximo medicamento
      </h2>

      {next ? (
        <Card className="flex flex-col gap-4 border-primary/30 bg-primary-soft">
          <div className="flex items-center gap-3">
            <Pill className="text-primary" size={32} aria-hidden="true" />
            <div>
              <p className="text-2xl font-extrabold">{next.name}</p>
              <p className="text-lg text-ink-muted">
                {next.dose} {next.doseUnit} · {next.timeLabel}
              </p>
            </div>
          </div>
          <LargeButton size="xl" fullWidth onClick={() => setActiveDose(next)}>
            Tomar
          </LargeButton>
        </Card>
      ) : (
        <Card className="flex items-center gap-3 bg-success-soft border-success/30">
          <Check className="text-success" size={28} aria-hidden="true" />
          <p className="text-lg font-bold">Ya tomaste todos tus medicamentos de hoy</p>
        </Card>
      )}

      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          {rest.map((dose) => (
            <button
              key={`${dose.scheduleId}-${dose.scheduledFor}`}
              onClick={() => setActiveDose(dose)}
              className="flex items-center justify-between gap-3 bg-surface border border-border rounded-xl px-4 py-3 text-left tap-target"
            >
              <span className="font-semibold">
                {dose.name} · {dose.dose} {dose.doseUnit}
              </span>
              <span className="text-ink-muted">{dose.timeLabel}</span>
            </button>
          ))}
        </div>
      )}

      {resolvedToday.length > 0 && (
        <div className="flex flex-col gap-2">
          {resolvedToday.map((dose) => (
            <div
              key={`${dose.scheduleId}-${dose.scheduledFor}`}
              className="flex items-center justify-between gap-3 px-4 py-3 text-ink-muted"
            >
              <span className="font-medium flex items-center gap-2">
                {dose.status === 'taken' ? (
                  <Check className="text-success" size={20} aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">!</span>
                )}
                {dose.name}
              </span>
              <span>
                {dose.status === 'taken'
                  ? `Tomado a las ${dose.takenAtLabel}`
                  : 'Omitido'}
              </span>
            </div>
          ))}
        </div>
      )}

      <DoseActionDialog
        key={activeDose ? `${activeDose.scheduleId}-${activeDose.scheduledFor}` : 'closed'}
        dose={activeDose}
        open={Boolean(activeDose)}
        onClose={() => setActiveDose(null)}
      />
    </section>
  );
}
