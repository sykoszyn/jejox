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

const TOTAL_STEPS = 4;

export function OnboardingWizard({ defaultFirstName }: { defaultFirstName: string }) {
  const [step, setStep] = useState(1);
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
  const [wantsEmergencyContact, setWantsEmergencyContact] = useState<boolean | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelationship, setContactRelationship] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function toggleMetric(key: keyof EnabledMetrics) {
    setMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function next() {
    if (step === 1 && !firstName.trim()) {
      setError('Por favor ingresá tu nombre.');
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function back() {
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  }

  function finish() {
    startTransition(async () => {
      const result = await completeOnboarding({
        firstName,
        lastName,
        enabledMetrics: metrics,
        remindersEnabled,
        emergencyContact:
          wantsEmergencyContact && contactName && contactPhone
            ? { name: contactName, phone: contactPhone, relationship: contactRelationship }
            : null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`Paso ${step} de ${TOTAL_STEPS}`}
        className="flex gap-2"
      >
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-surface-muted'}`}
          />
        ))}
      </div>

      {step === 1 && (
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
      )}

      {step === 2 && (
        <section className="flex flex-col gap-5">
          <h1 className="text-2xl font-bold">¿Qué querés registrar?</h1>
          <p className="text-ink-muted text-base">
            Podés cambiar esto más adelante desde Configuración.
          </p>
          <div className="flex flex-col gap-3">
            {METRIC_OPTIONS.map(({ key, label, icon }) => (
              <label
                key={key}
                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-border bg-surface cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
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
      )}

      {step === 3 && (
        <section className="flex flex-col gap-5">
          <Bell className="text-primary" size={40} aria-hidden="true" />
          <h1 className="text-2xl font-bold">¿Querés recibir recordatorios?</h1>
          <p className="text-ink-muted text-base">
            Te avisaremos cuando sea hora de tomar tus medicamentos.
          </p>
          <div className="flex gap-3">
            <LargeButton
              variant={remindersEnabled ? 'primary' : 'secondary'}
              onClick={() => setRemindersEnabled(true)}
              fullWidth
            >
              Sí
            </LargeButton>
            <LargeButton
              variant={!remindersEnabled ? 'primary' : 'secondary'}
              onClick={() => setRemindersEnabled(false)}
              fullWidth
            >
              No
            </LargeButton>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="flex flex-col gap-5">
          <ShieldPlus className="text-primary" size={40} aria-hidden="true" />
          <h1 className="text-2xl font-bold">¿Querés agregar un contacto de emergencia?</h1>
          <div className="flex gap-3">
            <LargeButton
              variant={wantsEmergencyContact === true ? 'primary' : 'secondary'}
              onClick={() => setWantsEmergencyContact(true)}
              fullWidth
            >
              Sí
            </LargeButton>
            <LargeButton
              variant={wantsEmergencyContact === false ? 'primary' : 'secondary'}
              onClick={() => setWantsEmergencyContact(false)}
              fullWidth
            >
              Ahora no
            </LargeButton>
          </div>
          {wantsEmergencyContact && (
            <div className="flex flex-col gap-4 mt-2">
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
      )}

      {error && (
        <p role="alert" className="text-danger font-medium">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        {step > 1 && (
          <LargeButton variant="secondary" onClick={back} disabled={pending}>
            Atrás
          </LargeButton>
        )}
        {step < TOTAL_STEPS ? (
          <LargeButton onClick={next} fullWidth>
            Continuar
          </LargeButton>
        ) : (
          <LargeButton onClick={finish} loading={pending} fullWidth>
            Listo, empezar
          </LargeButton>
        )}
      </div>
    </div>
  );
}
