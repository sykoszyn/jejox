'use client';

import { useState, useTransition } from 'react';
import { Droplet, HeartPulse, Scale, Thermometer, Activity, Wind, Bell, ShieldPlus } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { TextField } from '@/components/ui/Field';
import { completeOnboarding } from './actions';
import type { EnabledMetrics } from '@/types/database';

const METRIC_OPTIONS: { key: keyof EnabledMetrics; label: string; icon: React.ReactNode }[] = [
  { key: 'glucose', label: 'Glucosa', icon: <Droplet size={22} /> },
  { key: 'blood_pressure', label: 'Presión arterial', icon: <HeartPulse size={22} /> },
  { key: 'weight', label: 'Peso', icon: <Scale size={22} /> },
  { key: 'temperature', label: 'Temperatura', icon: <Thermometer size={22} /> },
  { key: 'heart_rate', label: 'Frecuencia cardíaca', icon: <Activity size={22} /> },
  { key: 'oxygen', label: 'Saturación de oxígeno', icon: <Wind size={22} /> },
];

export function OnboardingWizard({ defaultFirstName }: { defaultFirstName: string }) {
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState('');
  const [metrics, setMetrics] = useState<EnabledMetrics>({
    glucose: true,
    blood_pressure: true,
    weight: true,
    temperature: true,
    heart_rate: true,
    oxygen: true,
  });
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelationship, setContactRelationship] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function toggleMetric(key: keyof EnabledMetrics) {
    setMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!firstName.trim()) {
      setError('Por favor ingresá tu nombre.');
      return;
    }
    setError('');

    startTransition(async () => {
      const result = await completeOnboarding({
        firstName,
        lastName,
        enabledMetrics: metrics,
        remindersEnabled,
        emergencyContact:
          showEmergencyContact && contactName && contactPhone
            ? { name: contactName, phone: contactPhone, relationship: contactRelationship }
            : null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold">¿Cómo te llamás?</h1>
        <TextField
          label="Nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
          required
        />
        <TextField
          label="Apellido (opcional)"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
        />
      </section>

      <section className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold">¿Qué querés registrar?</h1>
        <p className="text-ink-muted text-base">
          Elegí lo que te interese. Podés cambiar esto más adelante desde Configuración.
        </p>
        <div className="flex flex-col gap-3">
          {METRIC_OPTIONS.map(({ key, label, icon }) => (
            <label
              key={key}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
            >
              <input
                type="checkbox"
                checked={metrics[key]}
                onChange={() => toggleMetric(key)}
                className="w-6 h-6 accent-primary"
              />
              <span className="text-primary" aria-hidden="true">
                {icon}
              </span>
              <span className="text-lg font-medium">{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <label className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
          <input
            type="checkbox"
            checked={remindersEnabled}
            onChange={(e) => setRemindersEnabled(e.target.checked)}
            className="w-6 h-6 accent-primary"
          />
          <span className="text-primary" aria-hidden="true">
            <Bell size={22} />
          </span>
          <span className="text-lg font-medium">Avisarme cuando sea hora de tomar mis medicamentos</span>
        </label>
      </section>

      <section className="flex flex-col gap-4">
        {!showEmergencyContact ? (
          <button
            type="button"
            onClick={() => setShowEmergencyContact(true)}
            className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-border bg-surface text-left"
          >
            <span className="text-primary" aria-hidden="true">
              <ShieldPlus size={22} />
            </span>
            <span className="text-lg font-medium">Agregar un contacto de emergencia (opcional)</span>
          </button>
        ) : (
          <div className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Contacto de emergencia</h2>
              <button
                type="button"
                onClick={() => {
                  setShowEmergencyContact(false);
                  setContactName('');
                  setContactPhone('');
                  setContactRelationship('');
                }}
                className="text-ink-muted font-medium underline tap-target"
              >
                Quitar
              </button>
            </div>
            <TextField label="Nombre" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            <TextField
              label="Teléfono"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
            <TextField
              label="Relación (opcional)"
              value={contactRelationship}
              onChange={(e) => setContactRelationship(e.target.value)}
              placeholder="Hija, esposo, vecino…"
            />
          </div>
        )}
      </section>

      {error && (
        <p role="alert" className="text-danger font-medium">
          {error}
        </p>
      )}

      <LargeButton type="submit" loading={pending} fullWidth>
        Listo, empezar
      </LargeButton>
    </form>
  );
}
