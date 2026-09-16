'use client';

import { useState, useTransition } from 'react';
import { Thermometer } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { TextField, SelectField, TextareaField } from '@/components/ui/Field';
import { DateTimeField, nowForDatetimeLocal, datetimeLocalToIso } from '@/components/ui/DateTimeField';
import { createTemperatureReading } from './actions';
import type { TemperatureUnit } from '@/types/database';

export function TemperatureForm() {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<TemperatureUnit>('°C');
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
      const result = await createTemperatureReading({
        value,
        unit,
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
            label="Temperatura"
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
          onChange={(e) => setUnit(e.target.value as TemperatureUnit)}
          className="w-28"
        >
          <option value="°C">°C</option>
          <option value="°F">°F</option>
        </SelectField>
      </div>

      <DateTimeField
        label="Fecha y hora"
        value={measuredAt}
        onChange={(e) => setMeasuredAt(e.target.value)}
        error={fieldErrors.measured_at}
      />

      <TextareaField label="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

      {error && (
        <p role="alert" className="text-danger font-medium">
          {error}
        </p>
      )}

      <LargeButton type="submit" size="xl" fullWidth loading={pending} icon={<Thermometer size={22} />}>
        Guardar temperatura
      </LargeButton>
    </form>
  );
}
