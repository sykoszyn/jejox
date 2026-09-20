'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { TextField } from '@/components/ui/Field';
import { signUpWithPassword, type AuthFormState } from '@/lib/auth/actions';

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpWithPassword, initialState);

  if (state.success) {
    return (
      <p role="status" className="text-center text-lg bg-primary-soft text-primary-dark rounded-xl p-5">
        {state.success}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-5" noValidate>
        <TextField
          label="Tu nombre"
          name="firstName"
          type="text"
          autoComplete="given-name"
          error={state.fieldErrors?.firstName}
          required
        />
        <TextField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          error={state.fieldErrors?.email}
          required
        />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="Al menos 8 caracteres."
          error={state.fieldErrors?.password}
          required
        />
        {state.error && (
          <p role="alert" className="text-danger font-medium">
            {state.error}
          </p>
        )}
        <LargeButton type="submit" size="xl" fullWidth loading={pending} icon={<UserPlus size={24} />}>
          Crear mi cuenta
        </LargeButton>
      </form>
      <p className="text-center text-base">
        ¿Ya tenés cuenta?{' '}
        <Link href="/ingresar" className="text-primary font-bold underline underline-offset-4">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
