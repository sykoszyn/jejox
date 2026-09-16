import type { Metadata } from 'next';
import { AuthShell } from '@/components/layout/AuthShell';
import { SignupForm } from './SignupForm';

export const metadata: Metadata = { title: 'Crear cuenta · SaludSimple' };

export default function SignupPage() {
  return (
    <AuthShell title="Vamos a empezar" subtitle="Creá tu cuenta gratis en un minuto">
      <SignupForm />
    </AuthShell>
  );
}
