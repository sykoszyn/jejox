'use client';

import { useState, useTransition } from 'react';
import { HeartPulse } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { TextField, TextareaField } from '@/components/ui/Field';
import { DateTimeField, nowForDatetimeLocal, datetimeLocalToIso } from '@/components/ui/DateTimeField';
import { createBloodPressureReading } from './actions';

export function BloodPressureForm() {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
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
      const result = await createBloodPressureReading({
        systolic,
        diastolic,
        heart_rate: heartRate,
        measured_at: datetimeLocalToIso(measuredAt),
        notes,
      });
      if (result?.error) setError(result.error);
      if (result?.fieldErrors) setFieldErrors(result.fieldErrors);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Sistólica"
          type="number"
          inputMode="numeric"
          autoFocus
          value={systolic}
          onChange={(e) => setSystolic(e.target.value)}
          error={fieldErrors.systolic}
          required
        />
        <TextField
          label="Diastólica"
          type="number"
          inputMode="numeric"
          value={diastolic}
          onChange={(e) => setDiastolic(e.target.value)}
          error={fieldErrors.diastolic}
          required
        />
      </div>
      <TextField
        label="Frecuencia cardíaca (opcional)"
        type="number"
        inputMode="numeric"
        hint="BPM"
        value={heartRate}
        onChange={(e) => setHeartRate(e.target.value)}
        error={fieldErrors.heart_rate}
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

      <LargeButton type="submit" size="xl" fullWidth loading={pending} icon={<HeartPulse size={22} />}>
        Guardar presión
      </LargeButton>
    </form>
  );
}
