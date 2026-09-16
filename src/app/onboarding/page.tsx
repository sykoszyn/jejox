import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { OnboardingWizard } from './OnboardingWizard';

export const metadata: Metadata = { title: 'Configurar tu salud · SaludSimple' };

export default async function OnboardingPage() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, onboarding_completed')
    .eq('id', user.id)
    .single();

  if (profile?.onboarding_completed) {
    redirect('/inicio');
  }

  return (
    <main id="contenido-principal" className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
      <p className="text-center text-primary font-bold text-lg mb-2">Vamos a configurar tu salud</p>
      <OnboardingWizard defaultFirstName={profile?.first_name ?? ''} />
    </main>
  );
}
