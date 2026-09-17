import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Pill, Activity, Bell, History, Users, ShieldCheck } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';

export const metadata: Metadata = {
  title: 'Mejoralito — Tu salud, organizada y fácil',
  description:
    'Organizá tus medicamentos, registrá tus mediciones y llevá un historial simple para vos y tu familia.',
};

const FEATURES = [
  {
    icon: Pill,
    title: 'Medicamentos',
    description: 'Registrá cada medicamento con su dosis y horario, sin complicaciones.',
  },
  {
    icon: Bell,
    title: 'Recordatorios',
    description: 'Una alarma bien clara cuando sea hora de tomar un medicamento.',
  },
  {
    icon: Activity,
    title: 'Mediciones',
    description: 'Glucosa, presión, peso, temperatura, pulso y saturación en un solo lugar.',
  },
  {
    icon: History,
    title: 'Historial',
    description: 'Todo ordenado por fecha, fácil de repasar y de mostrarle a tu médico.',
  },
  {
    icon: Users,
    title: 'Familia',
    description: 'Invitá a un familiar para que te ayude a llevar el control, si querés.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex-1">
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <Image src="/icons/icon-96.png" alt="" width={36} height={36} className="rounded-xl" />
          <span className="text-2xl font-extrabold text-primary">Mejoralito</span>
        </div>
        <Link href="/ingresar" className="font-bold text-primary underline underline-offset-4 tap-target">
          Entrar
        </Link>
      </header>

      <main id="contenido-principal">
        <section className="bg-primary-soft border-y-2 border-border">
          <div className="px-6 py-14 sm:py-20 max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
            <p className="text-primary font-bold uppercase tracking-wide text-sm">
              Salud simple, día a día
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-balance">
              Que nunca se te pase un medicamento.
            </h1>
            <p className="text-xl text-ink-muted max-w-xl">
              Mejoralito te avisa a la hora justa, guarda tus mediciones y arma un historial simple
              para vos y tu familia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
              <Link href="/registrarse" className="sm:w-auto w-full">
                <LargeButton size="xl" fullWidth>
                  Empezar gratis
                </LargeButton>
              </Link>
              <Link href="/ingresar" className="sm:w-auto w-full">
                <LargeButton size="xl" variant="secondary" fullWidth>
                  Ya tengo cuenta
                </LargeButton>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 py-14">
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-center gap-5 p-5 rounded-2xl border-2 border-border bg-surface border-l-[6px] border-l-accent"
              >
                <Icon className="text-accent shrink-0" size={30} aria-hidden="true" />
                <div>
                  <h2 className="text-xl font-bold">{title}</h2>
                  <p className="text-ink-muted">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-14 bg-accent-soft border-y-2 border-border">
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-4">
            <ShieldCheck className="text-accent" size={36} aria-hidden="true" />
            <h2 className="text-2xl font-bold">Pensada para vos, sin vueltas</h2>
            <p className="text-lg text-ink-muted">
              Botones grandes, texto claro y sin pasos innecesarios. Mejoralito sirve para registrar
              y organizar información de salud; no reemplaza la consulta con un profesional de la
              salud.
            </p>
            <Link href="/registrarse">
              <LargeButton size="xl" variant="accent">
                Crear cuenta
              </LargeButton>
            </Link>
          </div>
        </section>
      </main>

      <footer className="px-6 py-8 border-t-2 border-border text-center text-sm text-ink-muted flex flex-col gap-2">
        <div className="flex justify-center gap-6">
          <Link href="/privacidad" className="underline underline-offset-4">
            Política de privacidad
          </Link>
          <Link href="/terminos" className="underline underline-offset-4">
            Términos y condiciones
          </Link>
        </div>
        <p>© {new Date().getFullYear()} Mejoralito</p>
      </footer>
    </div>
  );
}
