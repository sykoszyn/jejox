'use client';

import { useState, useTransition } from 'react';
import { UserPlus } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { TextField, SelectField } from '@/components/ui/Field';
import { inviteCaregiver } from './actions';

export function CaregiverInviteForm() {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'read' | 'edit'>('read');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});
    startTransition(async () => {
      const result = await inviteCaregiver({ email, permission });
      if (result?.error) setError(result.error);
      if (result?.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result?.success) {
        setSuccess(result.success);
        setEmail('');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="Correo del cuidador"
        type="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        required
      />
      <SelectField
        label="Permiso"
        value={permission}
        onChange={(e) => setPermission(e.target.value as 'read' | 'edit')}
      >
        <option value="read">Solo puede ver</option>
        <option value="edit">Puede ver y ayudar a registrar</option>
      </SelectField>
      {error && (
        <p role="alert" className="text-danger font-medium">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-success font-medium">
          {success}
        </p>
      )}
      <LargeButton type="submit" loading={pending} icon={<UserPlus size={20} />}>
        Invitar cuidador
      </LargeButton>
    </form>
  );
}
