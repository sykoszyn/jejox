import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/database';

/**
 * El layout de (app) y la página que se está mostrando necesitan, casi
 * siempre, el mismo usuario/perfil (para el nav, el tema, la zona horaria,
 * los datos de la página, etc). Sin cachear, cada uno dispara su propio
 * viaje de red a Supabase — hasta 4 por navegación, en serie, antes de
 * pedir cualquier dato propio de la pantalla. cache() de React deduplica
 * esas llamadas dentro de un mismo request: da igual cuántas veces se
 * invoque, Supabase se consulta una sola vez.
 */
export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCachedProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data as Profile | null;
});

export async function requireUser() {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect('/ingresar');
  }

  return { supabase, user };
}

export async function requireProfile(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  profile: Profile;
}> {
  const { supabase, user } = await requireUser();

  const profile = await getCachedProfile(user.id);

  if (!profile) {
    redirect('/ingresar');
  }

  if (!profile.onboarding_completed) {
    redirect('/onboarding');
  }

  return { supabase, profile };
}
