'use client';

import { useState, useTransition } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { TextField, SelectField, TextareaField } from '@/components/ui/Field';
import { DateSelector } from '@/components/ui/DateSelector';
import { TimeSelector } from '@/components/ui/TimeSelector';
import { MEDICATION_FORMS, DAYS_OF_WEEK } from '@/lib/validations/medication';
import type { MedicationActionResult } from './actions';

interface ScheduleDraft {
  time_of_day: string;
  days_of_week: number[];
}

/** Estado local del formulario: todo string porque viene de inputs sin parsear. */
export interface MedicationFormDraft {
  name: string;
  active_ingredient: string;
  dose: string;
  dose_unit: string;
  form: string;
  instructions: string;
  start_date: string;
  end_date: string;
  schedules: ScheduleDraft[];
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

/** Horarios sugeridos según cuántas veces por día, espaciados a lo largo del día. */
const DEFAULT_TIMES_BY_COUNT: Record<number, string[]> = {
  1: ['08:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '14:00', '20:00'],
  4: ['08:00', '12:00', '16:00', '20:00'],
};

export const emptyMedicationForm: MedicationFormDraft = {
  name: '',
  active_ingredient: '',
  dose: '1',
  dose_unit: 'dosis',
  form: 'comprimido',
  instructions: '',
  start_date: todayIso(),
  end_date: '',
  schedules: [{ time_of_day: '08:00', days_of_week: ALL_DAYS }],
};

/** ¿Los datos "avanzados" tienen algo distinto del valor por defecto? Si es
 * así abrimos "Más detalles" de entrada (por ej. al editar un medicamento
 * que ya los tenía cargados), para no esconderle datos propios al usuario. */
function hasNonDefaultDetails(values: MedicationFormDraft) {
  return (
    values.active_ingredient !== '' ||
    values.instructions !== '' ||
    values.end_date !== '' ||
    values.form !== 'comprimido' ||
    !(values.dose === '1' && values.dose_unit === 'dosis')
  );
}

function allSameDays(schedules: ScheduleDraft[]) {
  if (schedules.length === 0) return ALL_DAYS;
  return schedules[0].days_of_week;
}

function isEveryDay(days: number[]) {
  return ALL_DAYS.every((d) => days.includes(d));
}

export function MedicationForm({
  initialValues,
  submitLabel,
  onSubmit,
}: {
  initialValues: MedicationFormDraft;
  submitLabel: string;
  onSubmit: (values: MedicationFormDraft) => Promise<MedicationActionResult | void>;
}) {
  const [values, setValues] = useState(initialValues);
  const [everyDay, setEveryDay] = useState(() => isEveryDay(allSameDays(initialValues.schedules)));
  const [detailsOpen, setDetailsOpen] = useState(() => hasNonDefaultDetails(initialValues));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const timesPerDay = values.schedules.length;

  function setTimesPerDay(count: number) {
    setValues((v) => {
      const defaults = DEFAULT_TIMES_BY_COUNT[count] ?? DEFAULT_TIMES_BY_COUNT[4];
      const days = everyDay ? ALL_DAYS : allSameDays(v.schedules);
      const schedules = Array.from({ length: count }, (_, i) => ({
        time_of_day: v.schedules[i]?.time_of_day ?? defaults[i] ?? '08:00',
        days_of_week: days,
      }));
      return { ...v, schedules };
    });
  }

  function setScheduleTime(index: number, time: string) {
    setValues((v) => ({
      ...v,
      schedules: v.schedules.map((s, i) => (i === index ? { ...s, time_of_day: time } : s)),
    }));
  }

  function toggleDay(day: number) {
    setValues((v) => {
      const current = allSameDays(v.schedules);
      const has = current.includes(day);
      const next = has ? current.filter((d) => d !== day) : [...current, day].sort();
      return { ...v, schedules: v.schedules.map((s) => ({ ...s, days_of_week: next })) };
    });
  }

  function handleEveryDayChange(value: boolean) {
    setEveryDay(value);
    if (value) {
      setValues((v) => ({ ...v, schedules: v.schedules.map((s) => ({ ...s, days_of_week: ALL_DAYS })) }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    startTransition(async () => {
      const result = await onSubmit(values);
      if (result?.error) setError(result.error);
      if (result?.fieldErrors) setFieldErrors(result.fieldErrors);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
      <TextField
        label="Nombre del medicamento"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        error={fieldErrors.name}
        required
        autoFocus
      />

      <fieldset className="flex flex-col gap-4">
        <legend className="text-lg font-bold mb-1">¿Cuántas veces por día?</legend>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setTimesPerDay(n)}
              aria-pressed={timesPerDay === n}
              className={`flex-1 min-h-14 rounded-xl font-bold border tap-target ${
                timesPerDay === n
                  ? 'bg-primary text-primary-contrast border-primary'
                  : 'bg-surface text-ink border-border'
              }`}
            >
              {n} {n === 1 ? 'vez' : 'veces'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {values.schedules.map((schedule, index) => (
            <TimeSelector
              key={index}
              label={timesPerDay === 1 ? 'Horario' : `Horario ${index + 1}`}
              value={schedule.time_of_day}
              onChange={(e) => setScheduleTime(index, e.target.value)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-lg font-bold mb-1">¿Todos los días?</legend>
        <div className="flex gap-3">
          <LargeButton
            type="button"
            variant={everyDay ? 'primary' : 'secondary'}
            onClick={() => handleEveryDayChange(true)}
            fullWidth
          >
            Sí, todos los días
          </LargeButton>
          <LargeButton
            type="button"
            variant={!everyDay ? 'primary' : 'secondary'}
            onClick={() => handleEveryDayChange(false)}
            fullWidth
          >
            No
          </LargeButton>
        </div>
        {!everyDay && (
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const active = allSameDays(values.schedules).includes(day.value);
              return (
                <button
                  type="button"
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  aria-pressed={active}
                  aria-label={day.label}
                  className={`w-11 h-11 rounded-full font-bold border tap-target ${
                    active
                      ? 'bg-primary text-primary-contrast border-primary'
                      : 'bg-surface text-ink-muted border-border'
                  }`}
                >
                  {day.short}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      <p className="flex items-center gap-3 text-ink-muted text-base">
        <Bell size={20} className="text-primary shrink-0" aria-hidden="true" />
        Vamos a avisarte con una alarma a cada horario, hasta que la marques como tomada.
      </p>

      <div>
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          aria-expanded={detailsOpen}
          className="flex items-center gap-2 text-primary font-bold tap-target"
        >
          <ChevronDown
            size={20}
            className={`transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
          Más detalles (opcional)
        </button>

        {detailsOpen && (
          <div className="flex flex-col gap-6 mt-4">
            <TextField
              label="Principio activo (opcional)"
              value={values.active_ingredient}
              onChange={(e) => setValues((v) => ({ ...v, active_ingredient: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Dosis"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={values.dose}
                onChange={(e) => setValues((v) => ({ ...v, dose: e.target.value }))}
                error={fieldErrors.dose}
              />
              <TextField
                label="Unidad"
                placeholder="mg, ml, UI…"
                value={values.dose_unit}
                onChange={(e) => setValues((v) => ({ ...v, dose_unit: e.target.value }))}
                error={fieldErrors.dose_unit}
              />
            </div>
            <SelectField
              label="Forma"
              value={values.form}
              onChange={(e) => setValues((v) => ({ ...v, form: e.target.value }))}
            >
              {MEDICATION_FORMS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </SelectField>
            <TextareaField
              label="Indicaciones / notas (opcional)"
              placeholder="Ej: tomar con el desayuno"
              value={values.instructions}
              onChange={(e) => setValues((v) => ({ ...v, instructions: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <DateSelector
                label="Fecha de inicio"
                value={values.start_date}
                onChange={(e) => setValues((v) => ({ ...v, start_date: e.target.value }))}
                error={fieldErrors.start_date}
              />
              <DateSelector
                label="Fecha de fin (opcional)"
                value={values.end_date}
                onChange={(e) => setValues((v) => ({ ...v, end_date: e.target.value }))}
                error={fieldErrors.end_date}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-danger font-medium">
          {error}
        </p>
      )}

      <LargeButton type="submit" size="xl" fullWidth loading={pending}>
        {submitLabel}
      </LargeButton>
    </form>
  );
}
