'use client';

import { useState, useTransition } from 'react';
import { Wind } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { TextField, TextareaField } from '@/components/ui/Field';
import { DateTimeField, nowForDatetimeLocal, datetimeLocalToIso } from '@/components/ui/DateTimeField';
import { createOxygenReading } from './actions';

export function OxygenForm() {
  const [value, setValue] = useState('');
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
      const result = await createOxygenReading({
        value,
        measured_at: datetimeLocalToIso(measuredAt),
        notes,
      });
      if (result?.error) setError(result.error);
      if (result?.fieldErrors) setFieldErrors(result.fieldErrors);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <TextField
        label="Saturación de oxígeno"
        type="number"
        inputMode="numeric"
        hint="Porcentaje (%)"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error={fieldErrors.value}
        required
      />

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

      <LargeButton type="submit" size="xl" fullWidth loading={pending} icon={<Wind size={22} />}>
        Guardar saturación
      </LargeButton>
    </form>
  );
}
