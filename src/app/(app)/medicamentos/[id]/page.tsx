import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Check, X, Clock } from 'lucide-react';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { MedicationDetailActions } from '@/features/medications/MedicationDetailActions';
import { DAYS_OF_WEEK, MEDICATION_FORMS } from '@/lib/validations/medication';
import { formatDateShort, formatTime } from '@/lib/utils/datetime';

export const metadata: Metadata = { title: 'Medicamento · Mejoralito' };

export default async function MedicamentoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireProfile();

  const { data: medication } = await supabase
    .from('medications')
    .select('*')
    .eq('id', id)
    .eq('user_id', profile.id)
    .single();

  if (!medication) notFound();

  const [{ data: schedules }, { data: logs }] = await Promise.all([
    supabase
      .from('medication_schedules')
      .select('*')
      .eq('medication_id', id)
      .order('time_of_day'),
    supabase
      .from('medication_logs')
      .select('*')
      .eq('medication_id', id)
      .order('scheduled_for', { ascending: false })
      .limit(10),
  ]);

  const formLabel = MEDICATION_FORMS.find((f) => f.value === medication.form)?.label ?? medication.form;

  return (
    <div>
      <PageHeader title={medication.name} backHref="/medicamentos" />
      <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-6">
        <Card className="flex flex-col gap-2">
          <p className="text-2xl font-extrabold">{medication.name}</p>
          {medication.active_ingredient && (
            <p className="text-ink-muted">{medication.active_ingredient}</p>
          )}
          <p className="text-lg">
            {medication.dose} {medication.dose_unit} · {formLabel}
          </p>
          {medication.instructions && <p className="text-ink-muted">{medication.instructions}</p>}
          <p className="text-sm text-ink-muted">
            Desde {formatDateShort(medication.start_date, 'UTC')}
            {medication.end_date && ` hasta ${formatDateShort(medication.end_date, 'UTC')}`}
          </p>
          {!medication.is_active && (
            <p className="inline-flex w-fit items-center gap-1 text-sm font-bold bg-surface-muted px-3 py-1 rounded-full">
              Desactivado
            </p>
          )}
        </Card>

        {(schedules ?? []).length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-ink-muted">Horarios</h2>
            {(schedules ?? []).map((s) => (
              <Card key={s.id} className="flex items-center gap-3">
                <Clock className="text-primary" size={22} aria-hidden="true" />
                <div>
                  <p className="text-lg font-bold">{s.time_of_day.slice(0, 5)}</p>
                  <p className="text-sm text-ink-muted">
                    {s.days_of_week.length === 7
                      ? 'Todos los días'
                      : s.days_of_week
                          .map((d) => DAYS_OF_WEEK.find((dw) => dw.value === d)?.short)
                          .join(', ')}
                  </p>
                </div>
              </Card>
            ))}
          </section>
        )}

        {(logs ?? []).length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-ink-muted">Últimas tomas</h2>
            {(logs ?? []).map((log) => (
              <div key={log.id} className="flex items-center justify-between px-1">
                <span className="flex items-center gap-2 font-medium">
                  {log.status === 'taken' && <Check className="text-success" size={20} />}
                  {log.status === 'skipped' && <X className="text-danger" size={20} />}
                  {log.status === 'pending' || log.status === 'snoozed' ? (
                    <Clock className="text-warning" size={20} />
                  ) : null}
                  {formatDateShort(log.scheduled_for, profile.timezone)} ·{' '}
                  {formatTime(log.scheduled_for, profile.timezone)}
                </span>
                <span className="text-ink-muted capitalize">
                  {log.status === 'taken' &&
                    `Tomado ${log.taken_at ? 'a las ' + formatTime(log.taken_at, profile.timezone) : ''}`}
                  {log.status === 'skipped' && 'Omitido'}
                  {log.status === 'snoozed' && 'Pospuesto'}
                  {log.status === 'pending' && 'Pendiente'}
                </span>
              </div>
            ))}
          </section>
        )}

        <MedicationDetailActions medicationId={medication.id} isActive={medication.is_active} />
      </div>
    </div>
  );
}
