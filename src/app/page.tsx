import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Pill, Activity, Bell, History, Users } from 'lucide-react';
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
    description: 'Registrá cada medicamento con su dosis y horario.',
  },
  {
    icon: Bell,
    title: 'Recordatorios',
    description: 'Una alarma clara cuando sea hora de tomarlo.',
  },
  {
    icon: Activity,
    title: 'Mediciones',
    description: 'Glucosa, presión, peso y más, en un solo lugar.',
  },
  {
    icon: History,
    title: 'Historial',
    description: 'Ordenado por fecha, listo para mostrarle a tu médico.',
  },
  {
    icon: Users,
    title: 'Familia',
    description: 'Invitá a alguien para que te ayude, si querés.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex-1">
      <header className="px-6 py-6 flex items-center justify-between max-w-3xl mx-auto">
        <div className="flex items-center gap-2.5">
          <Image src="/icons/icon-96.png" alt="" width={32} height={32} className="rounded-lg" />
          <span className="text-xl font-bold text-primary">Mejoralito</span>
        </div>
        <Link href="/ingresar" className="font-semibold text-primary tap-target">
          Entrar
        </Link>
      </header>

      <main id="contenido-principal" className="px-6">
        <section className="max-w-2xl mx-auto py-16 sm:py-24 flex flex-col gap-6">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-balance">
            Que nunca se te pase un medicamento.
          </h1>
          <p className="text-xl text-ink-muted max-w-lg">
            Mejoralito te avisa a la hora justa, guarda tus mediciones y arma un historial simple
            para vos y tu familia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
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
        </section>

        <section className="max-w-2xl mx-auto py-12 border-t border-border">
          <ul className="flex flex-col gap-8">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <Icon className="text-primary shrink-0 mt-1" size={24} aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-bold">{title}</h2>
                  <p className="text-ink-muted">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="max-w-2xl mx-auto py-12 border-t border-border flex flex-col gap-4">
          <h2 className="text-xl font-bold">Pensada para vos, sin vueltas</h2>
          <p className="text-lg text-ink-muted">
            Botones grandes, texto claro y sin pasos innecesarios. Mejoralito sirve para registrar
            y organizar información de salud; no reemplaza la consulta con un profesional de la
            salud.
          </p>
          <Link href="/registrarse" className="mt-2">
            <LargeButton size="xl">Crear cuenta</LargeButton>
          </Link>
        </section>
      </main>

      <footer className="px-6 py-8 max-w-2xl mx-auto border-t border-border text-sm text-ink-muted flex flex-col gap-2">
        <div className="flex gap-6">
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
