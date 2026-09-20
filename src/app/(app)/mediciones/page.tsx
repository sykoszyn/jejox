import type { Metadata } from 'next';
import Link from 'next/link';
import { Droplet, HeartPulse, Scale, Thermometer, Activity, Wind, StickyNote, TrendingUp } from 'lucide-react';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = { title: 'Mediciones · Mejoralito' };

const METRICS = [
  { key: 'glucose' as const, label: 'Glucosa', icon: Droplet, base: '/mediciones/glucosa' },
  { key: 'blood_pressure' as const, label: 'Presión arterial', icon: HeartPulse, base: '/mediciones/presion' },
  { key: 'heart_rate' as const, label: 'Frecuencia cardíaca', icon: Activity, base: '/mediciones/pulso' },
  { key: 'weight' as const, label: 'Peso', icon: Scale, base: '/mediciones/peso' },
  { key: 'temperature' as const, label: 'Temperatura', icon: Thermometer, base: '/mediciones/temperatura' },
  { key: 'oxygen' as const, label: 'Saturación de oxígeno', icon: Wind, base: '/mediciones/oxigeno' },
];

export default async function MedicionesPage() {
  const { profile } = await requireProfile();

  return (
    <div>
      <PageHeader title="Mediciones" />
      <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-4">
        {METRICS.filter((m) => profile.enabled_metrics[m.key]).map(({ key, label, icon: Icon, base }) => (
          <Card key={key} className="flex items-center gap-4">
            <Icon className="text-primary shrink-0" size={28} aria-hidden="true" />
            <p className="flex-1 text-lg font-bold">{label}</p>
            <div className="flex gap-2">
              <Link
                href={`${base}/evolucion`}
                aria-label={`Ver evolución de ${label}`}
                className="tap-target flex items-center justify-center rounded-xl border border-border"
              >
                <TrendingUp size={22} aria-hidden="true" />
              </Link>
              <Link
                href={`${base}/nueva`}
                className="tap-target flex items-center justify-center rounded-xl bg-primary text-primary-contrast px-4 font-bold"
              >
                Registrar
              </Link>
            </div>
          </Card>
        ))}

        <Card className="flex items-center gap-4">
          <StickyNote className="text-primary shrink-0" size={28} aria-hidden="true" />
          <p className="flex-1 text-lg font-bold">Notas de salud</p>
          <Link
            href="/mediciones/notas/nueva"
            className="tap-target flex items-center justify-center rounded-xl bg-primary text-primary-contrast px-4 font-bold"
          >
            Agregar
          </Link>
        </Card>
      </div>
    </div>
  );
}
