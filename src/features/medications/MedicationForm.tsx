'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { TextField, SelectField, TextareaField } from '@/components/ui/Field';
import { DateSelector } from '@/components/ui/DateSelector';
import { TimeSelector } from '@/components/ui/TimeSelector';
import { Card } from '@/components/ui/Card';
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

export const emptyMedicationForm: MedicationFormDraft = {
  name: '',
  active_ingredient: '',
  dose: '',
  dose_unit: 'mg',
  form: 'comprimido',
  instructions: '',
  start_date: todayIso(),
  end_date: '',
  schedules: [{ time_of_day: '08:00', days_of_week: [0, 1, 2, 3, 4, 5, 6] }],
};

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function updateSchedule(index: number, patch: Partial<ScheduleDraft>) {
    setValues((v) => ({
      ...v,
      schedules: v.schedules.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }

  function toggleDay(index: number, day: number) {
    setValues((v) => ({
      ...v,
      schedules: v.schedules.map((s, i) => {
        if (i !== index) return s;
        const has = s.days_of_week.includes(day);
        return {
          ...s,
          days_of_week: has ? s.days_of_week.filter((d) => d !== day) : [...s.days_of_week, day].sort(),
        };
      }),
    }));
  }

  function addSchedule() {
    setValues((v) => ({
      ...v,
      schedules: [...v.schedules, { time_of_day: '08:00', days_of_week: [0, 1, 2, 3, 4, 5, 6] }],
    }));
  }

  function removeSchedule(index: number) {
    setValues((v) => ({ ...v, schedules: v.schedules.filter((_, i) => i !== index) }));
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <TextField
        label="Nombre del medicamento"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        error={fieldErrors.name}
        required
      />
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
          required
        />
        <TextField
          label="Unidad"
          placeholder="mg, ml, UI…"
          value={values.dose_unit}
          onChange={(e) => setValues((v) => ({ ...v, dose_unit: e.target.value }))}
          error={fieldErrors.dose_unit}
          required
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

      <fieldset className="flex flex-col gap-4">
        <legend className="text-lg font-bold mb-1">Horarios</legend>
        {values.schedules.map((schedule, index) => (
          <Card key={index} className="flex flex-col gap-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <TimeSelector
                  label={`Horario ${index + 1}`}
                  value={schedule.time_of_day}
                  onChange={(e) => updateSchedule(index, { time_of_day: e.target.value })}
                />
              </div>
              {values.schedules.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSchedule(index)}
                  aria-label={`Eliminar horario ${index + 1}`}
                  className="tap-target text-danger flex items-center justify-center rounded-xl border-2 border-border"
                >
                  <Trash2 size={22} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const active = schedule.days_of_week.includes(day.value);
                return (
                  <button
                    type="button"
                    key={day.value}
                    onClick={() => toggleDay(index, day.value)}
                    aria-pressed={active}
                    aria-label={day.label}
                    className={`w-11 h-11 rounded-full font-bold border-2 tap-target ${
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
          </Card>
        ))}
        <LargeButton type="button" variant="secondary" icon={<Plus size={20} />} onClick={addSchedule}>
          Agregar horario
        </LargeButton>
      </fieldset>

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
