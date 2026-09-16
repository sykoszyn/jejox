'use client';

import { useState, useTransition } from 'react';
import { StickyNote } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { TextareaField } from '@/components/ui/Field';
import { DateTimeField, nowForDatetimeLocal, datetimeLocalToIso } from '@/components/ui/DateTimeField';
import { createHealthNote } from './actions';

export function NoteForm() {
  const [note, setNote] = useState('');
  const [measuredAt, setMeasuredAt] = useState(nowForDatetimeLocal());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    startTransition(async () => {
      const result = await createHealthNote({
        note,
        measured_at: datetimeLocalToIso(measuredAt),
      });
      if (result?.error) setError(result.error);
      if (result?.fieldErrors) setFieldErrors(result.fieldErrors);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <TextareaField
        label="Nota"
        autoFocus
        rows={6}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        error={fieldErrors.note}
        placeholder="Ej: hoy me sentí mareado después de almorzar"
        required
      />

      <DateTimeField
        label="Fecha y hora"
        value={measuredAt}
        onChange={(e) => setMeasuredAt(e.target.value)}
        error={fieldErrors.measured_at}
      />

      {error && (
        <p role="alert" className="text-danger font-medium">
          {error}
        </p>
      )}

      <LargeButton type="submit" size="xl" fullWidth loading={pending} icon={<StickyNote size={22} />}>
        Guardar nota
      </LargeButton>
    </form>
  );
}
