import type { Metadata } from 'next';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmergencyContactManager } from '@/features/settings/EmergencyContactManager';

export const metadata: Metadata = { title: 'Contacto de emergencia · Mejoralito' };

export default async function EmergenciaPage() {
  const { supabase, profile } = await requireProfile();
  const { data: contacts } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: true });

  return (
    <div>
      <PageHeader title="Contacto de emergencia" backHref="/configuracion" />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <EmergencyContactManager contacts={contacts ?? []} />
      </div>
    </div>
  );
}
