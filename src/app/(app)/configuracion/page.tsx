import type { Metadata } from 'next';
import Link from 'next/link';
import {
  User,
  Bell,
  Type,
  Ruler,
  ShieldAlert,
  Users,
  FileText,
  Download,
  LogOut,
  ChevronRight,
  Lock,
  Scroll,
} from 'lucide-react';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { signOut } from '@/lib/auth/actions';

export const metadata: Metadata = { title: 'Configuración · SaludSimple' };

const LINKS = [
  { href: '/configuracion/perfil', label: 'Perfil', icon: User },
  { href: '/configuracion/notificaciones', label: 'Notificaciones', icon: Bell },
  { href: '/configuracion/accesibilidad', label: 'Accesibilidad', icon: Type },
  { href: '/configuracion/unidades', label: 'Unidades y mediciones', icon: Ruler },
  { href: '/configuracion/emergencia', label: 'Contacto de emergencia', icon: ShieldAlert },
  { href: '/cuidadores', label: 'Cuidadores', icon: Users },
  { href: '/informe', label: 'Informe de salud', icon: FileText },
  { href: '/privacidad', label: 'Política de privacidad', icon: Lock },
  { href: '/terminos', label: 'Términos y condiciones', icon: Scroll },
];

export default async function ConfiguracionPage() {
  const { profile: user } = await requireProfile();

  return (
    <div>
      <PageHeader title="Configuración" />
      <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-6">
        <Card>
          <p className="text-ink-muted text-sm">Cuenta</p>
          <p className="text-lg font-bold">{user.first_name} {user.last_name}</p>
        </Card>

        <div className="flex flex-col gap-2">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="tap-target">
              <Card className="flex items-center gap-4">
                <Icon className="text-primary shrink-0" size={22} aria-hidden="true" />
                <span className="flex-1 font-semibold">{label}</span>
                <ChevronRight className="text-ink-muted" aria-hidden="true" />
              </Card>
            </Link>
          ))}

          <a href="/api/export" className="tap-target">
            <Card className="flex items-center gap-4">
              <Download className="text-primary shrink-0" size={22} aria-hidden="true" />
              <span className="flex-1 font-semibold">Exportar mis datos</span>
              <ChevronRight className="text-ink-muted" aria-hidden="true" />
            </Card>
          </a>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full min-h-14 rounded-2xl border-2 border-danger text-danger font-bold tap-target"
          >
            <LogOut size={20} aria-hidden="true" /> Cerrar sesión
          </button>
        </form>

        <p className="text-center text-xs text-ink-muted px-4">
          Esta aplicación sirve para registrar y organizar información de salud. No reemplaza la
          consulta con un profesional de la salud.
        </p>
      </div>
    </div>
  );
}
