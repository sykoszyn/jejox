'use client';

import { useState, useTransition } from 'react';
import { Droplet } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { TextField, SelectField, TextareaField } from '@/components/ui/Field';
import { DateTimeField, nowForDatetimeLocal, datetimeLocalToIso } from '@/components/ui/DateTimeField';
import { GLUCOSE_CONTEXT_LABELS } from '@/lib/measurements/config';
import { createGlucoseReading } from './actions';
import type { GlucoseUnit } from '@/types/database';

export function GlucoseForm({ defaultUnit = 'mg/dL' as GlucoseUnit }: { defaultUnit?: GlucoseUnit }) {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<GlucoseUnit>(defaultUnit);
  const [context, setContext] = useState('ayunas');
  const [measuredAt, setMeasuredAt] = useState(nowForDatetimeLocal());
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    startTransition(async () => {
      const result = await createGlucoseReading({
        value,
        unit,
        context,
        measured_at: datetimeLocalToIso(measuredAt),
        notes,
      });
      if (result?.error) setError(result.error);
      if (result?.fieldErrors) setFieldErrors(result.fieldErrors);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <TextField
            label="Valor de glucosa"
            type="number"
            inputMode="decimal"
            step="0.1"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            error={fieldErrors.value}
            required
          />
        </div>
        <SelectField
          label="Unidad"
          value={unit}
          onChange={(e) => setUnit(e.target.value as GlucoseUnit)}
          className="w-32"
        >
          <option value="mg/dL">mg/dL</option>
          <option value="mmol/L">mmol/L</option>
        </SelectField>
      </div>

      <SelectField label="Momento" value={context} onChange={(e) => setContext(e.target.value)}>
        {Object.entries(GLUCOSE_CONTEXT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>

      <DateTimeField
        label="Fecha y hora"
        value={measuredAt}
        onChange={(e) => setMeasuredAt(e.target.value)}
        error={fieldErrors.measured_at}
      />

      <TextareaField
        label="Notas (opcional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {error && (
        <p role="alert" className="text-danger font-medium">
          {error}
        </p>
      )}

      <LargeButton type="submit" size="xl" fullWidth loading={pending} icon={<Droplet size={22} />}>
        Guardar glucosa
      </LargeButton>
    </form>
  );
}
