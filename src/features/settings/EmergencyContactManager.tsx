'use client';

import { useState, useTransition } from 'react';
import { Phone, Trash2, Plus, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { LargeButton } from '@/components/ui/LargeButton';
import { TextField } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { addEmergencyContact, deleteEmergencyContact } from './emergencyActions';
import type { EmergencyContact } from '@/types/database';

export function EmergencyContactManager({ contacts }: { contacts: EmergencyContact[] }) {
  const [showForm, setShowForm] = useState(contacts.length === 0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const [callTarget, setCallTarget] = useState<EmergencyContact | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    startTransition(async () => {
      const result = await addEmergencyContact({ name, phone, relationship });
      if (result?.error) setError(result.error);
      else if (result?.fieldErrors) setFieldErrors(result.fieldErrors);
      else {
        setName('');
        setPhone('');
        setRelationship('');
        setShowForm(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {contacts.length === 0 && !showForm && (
        <EmptyState
          icon={<ShieldAlert size={32} />}
          title="Sin contacto de emergencia"
          description="Agregá uno para poder llamarlo rápido si hace falta."
        />
      )}

      {contacts.map((c) => (
        <Card key={c.id} className="flex items-center gap-3">
          <ShieldAlert className="text-accent shrink-0" size={24} aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="font-bold">{c.name}</p>
            <p className="text-ink-muted text-sm">
              {c.phone}
              {c.relationship ? ` · ${c.relationship}` : ''}
            </p>
          </div>
          <button
            onClick={() => setCallTarget(c)}
            className="tap-target flex items-center justify-center rounded-xl bg-accent text-accent-contrast px-4"
            aria-label={`Llamar a ${c.name}`}
          >
            <Phone size={20} />
          </button>
          <button
            onClick={() => startTransition(() => deleteEmergencyContact(c.id))}
            className="tap-target flex items-center justify-center rounded-xl border border-border text-danger"
            aria-label={`Eliminar contacto ${c.name}`}
          >
            <Trash2 size={20} />
          </button>
        </Card>
      ))}

      {showForm ? (
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name} required />
            <TextField
              label="Teléfono"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={fieldErrors.phone}
              required
            />
            <TextField
              label="Relación (opcional)"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Hija, esposo, vecino…"
            />
            {error && (
              <p role="alert" className="text-danger font-medium">
                {error}
              </p>
            )}
            <LargeButton type="submit" loading={pending}>
              Guardar contacto
            </LargeButton>
          </form>
        </Card>
      ) : (
        <LargeButton variant="secondary" icon={<Plus size={20} />} onClick={() => setShowForm(true)}>
          Agregar otro contacto
        </LargeButton>
      )}

      <ConfirmDialog
        open={Boolean(callTarget)}
        title={`¿Llamar a ${callTarget?.name}?`}
        confirmLabel="Llamar"
        cancelLabel="Cancelar"
        onCancel={() => setCallTarget(null)}
        onConfirm={() => {
          if (callTarget) window.location.href = `tel:${callTarget.phone}`;
          setCallTarget(null);
        }}
      />
    </div>
  );
}
