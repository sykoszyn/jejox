'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { LargeButton } from '@/components/ui/LargeButton';
import { TextField } from '@/components/ui/Field';
import { signInWithPassword, sendMagicLink, type AuthFormState } from '@/lib/auth/actions';

const initialState: AuthFormState = {};

export function LoginForm() {
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [passwordState, passwordAction, passwordPending] = useActionState(
    signInWithPassword,
    initialState
  );
  const [magicState, magicAction, magicPending] = useActionState(sendMagicLink, initialState);

  return (
    <div className="flex flex-col gap-6">
      {mode === 'password' ? (
        <form action={passwordAction} className="flex flex-col gap-5" noValidate>
          <TextField
            label="Correo electrónico"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            error={passwordState.fieldErrors?.email}
            required
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="current-password"
            error={passwordState.fieldErrors?.password}
            required
          />
          {passwordState.error && (
            <p role="alert" className="text-danger font-medium">
              {passwordState.error}
            </p>
          )}
          <LargeButton type="submit" size="xl" fullWidth loading={passwordPending} icon={<Lock size={24} />}>
            Ingresar
          </LargeButton>
        </form>
      ) : (
        <form action={magicAction} className="flex flex-col gap-5" noValidate>
          <TextField
            label="Correo electrónico"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            error={magicState.fieldErrors?.email}
            required
          />
          {magicState.error && (
            <p role="alert" className="text-danger font-medium">
              {magicState.error}
            </p>
          )}
          {magicState.success && (
            <p role="status" className="text-success font-medium">
              {magicState.success}
            </p>
          )}
          <LargeButton type="submit" size="xl" fullWidth loading={magicPending} icon={<Mail size={24} />}>
            Enviarme un enlace de acceso
          </LargeButton>
        </form>
      )}

      <button
        type="button"
        onClick={() => setMode(mode === 'password' ? 'magic' : 'password')}
        className="text-primary font-bold text-base underline underline-offset-4 tap-target"
      >
        {mode === 'password' ? '¿Preferís ingresar sin contraseña?' : 'Ingresar con contraseña'}
      </button>

      <p className="text-center text-base">
        ¿No tenés cuenta?{' '}
        <Link href="/registrarse" className="text-primary font-bold underline underline-offset-4">
          Creá una gratis
        </Link>
      </p>
    </div>
  );
}
