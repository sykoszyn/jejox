import type { Metadata } from 'next';
import { AuthShell } from '@/components/layout/AuthShell';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: 'Ingresar · SaludSimple' };

export default function LoginPage() {
  return (
    <AuthShell title="Bienvenido de nuevo" subtitle="Ingresá para ver tu salud organizada">
      <LoginForm />
    </AuthShell>
  );
}
