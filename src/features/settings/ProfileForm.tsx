'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { User, Camera } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { TextField } from '@/components/ui/Field';
import { DateSelector } from '@/components/ui/DateSelector';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from './profileActions';

interface ProfileFormProps {
  userId: string;
  initial: {
    first_name: string;
    last_name: string;
    birth_date: string;
    phone: string;
    avatar_url: string;
  };
}

export function ProfileForm({ userId, initial }: ProfileFormProps) {
  const [values, setValues] = useState(initial);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setValues((v) => ({ ...v, avatar_url: `${data.publicUrl}?t=${Date.now()}` }));
    } catch {
      setError('No pudimos subir la foto. Probá con otra imagen.');
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result?.error) setError(result.error);
      if (result?.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result?.success) setSuccess(result.success);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-24 h-24 rounded-full bg-surface-muted border-2 border-border overflow-hidden flex items-center justify-center">
          {values.avatar_url ? (
            <Image src={values.avatar_url} alt="" fill className="object-cover" />
          ) : (
            <User size={40} className="text-ink-muted" aria-hidden="true" />
          )}
        </div>
        <label className="inline-flex items-center gap-2 text-primary font-bold cursor-pointer tap-target">
          <Camera size={20} aria-hidden="true" />
          {uploading ? 'Subiendo…' : 'Cambiar foto (opcional)'}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </label>
      </div>

      <TextField
        label="Nombre"
        value={values.first_name}
        onChange={(e) => setValues((v) => ({ ...v, first_name: e.target.value }))}
        error={fieldErrors.first_name}
        required
      />
      <TextField
        label="Apellido (opcional)"
        value={values.last_name}
        onChange={(e) => setValues((v) => ({ ...v, last_name: e.target.value }))}
      />
      <DateSelector
        label="Fecha de nacimiento (opcional)"
        value={values.birth_date}
        onChange={(e) => setValues((v) => ({ ...v, birth_date: e.target.value }))}
      />
      <TextField
        label="Teléfono (opcional)"
        type="tel"
        value={values.phone}
        onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
      />

      {error && (
        <p role="alert" className="text-danger font-medium">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-success font-medium">
          ✓ {success}
        </p>
      )}

      <LargeButton type="submit" loading={pending} fullWidth>
        Guardar cambios
      </LargeButton>
    </form>
  );
}
