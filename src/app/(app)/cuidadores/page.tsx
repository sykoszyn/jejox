import type { Metadata } from 'next';
import Link from 'next/link';
import { Users, ChevronRight } from 'lucide-react';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CaregiverInviteForm } from '@/features/caregivers/CaregiverInviteForm';
import { InvitedCaregiverRow, ReceivedInvitationRow } from '@/features/caregivers/CaregiverRow';

export const metadata: Metadata = { title: 'Cuidadores · SaludSimple' };

export default async function CuidadoresPage() {
  const { supabase, profile } = await requireProfile();
  const email = (await supabase.auth.getUser()).data.user?.email ?? '';

  const [{ data: myInvites }, { data: receivedRaw }] = await Promise.all([
    supabase
      .from('caregivers')
      .select('*')
      .eq('owner_id', profile.id)
      .neq('status', 'revoked')
      .order('created_at', { ascending: false }),
    supabase
      .from('caregivers')
      .select('*')
      .or(`caregiver_id.eq.${profile.id},caregiver_email.eq.${email}`)
      .neq('status', 'revoked')
      .order('created_at', { ascending: false }),
  ]);

  const received = receivedRaw ?? [];
  const ownerIds = Array.from(new Set(received.map((r) => r.owner_id)));
  const { data: owners } = ownerIds.length
    ? await supabase.from('profiles').select('id, first_name, last_name').in('id', ownerIds)
    : { data: [] };
  const ownerById = new Map((owners ?? []).map((o) => [o.id, o]));

  const pendingReceived = received.filter((r) => r.status === 'pending');
  const acceptedReceived = received.filter((r) => r.status === 'accepted');

  return (
    <div>
      <PageHeader title="Cuidadores" />
      <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-ink-muted">Mis cuidadores</h2>
          <Card>
            <CaregiverInviteForm />
          </Card>
          {(myInvites ?? []).length === 0 ? (
            <EmptyState
              icon={<Users size={36} />}
              title="Todavía no invitaste a nadie"
              description="Podés invitar a un familiar para que te ayude a llevar el control."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {(myInvites ?? []).map((c) => (
                <InvitedCaregiverRow
                  key={c.id}
                  id={c.id}
                  email={c.caregiver_email}
                  permission={c.permission}
                  status={c.status}
                />
              ))}
            </div>
          )}
        </section>

        {pendingReceived.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink-muted">Invitaciones recibidas</h2>
            <div className="flex flex-col gap-2">
              {pendingReceived.map((r) => {
                const owner = ownerById.get(r.owner_id);
                const name = owner ? `${owner.first_name} ${owner.last_name}`.trim() : 'Alguien';
                return <ReceivedInvitationRow key={r.id} id={r.id} ownerName={name || 'Alguien'} />;
              })}
            </div>
          </section>
        )}

        {acceptedReceived.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink-muted">Personas que cuido</h2>
            <div className="flex flex-col gap-2">
              {acceptedReceived.map((r) => {
                const owner = ownerById.get(r.owner_id);
                const name = owner ? `${owner.first_name} ${owner.last_name}`.trim() : 'Paciente';
                return (
                  <Link key={r.id} href={`/cuidadores/${r.owner_id}`} className="tap-target">
                    <Card className="flex items-center justify-between">
                      <p className="font-bold">{name || 'Paciente'}</p>
                      <ChevronRight className="text-ink-muted" aria-hidden="true" />
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
