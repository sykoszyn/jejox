import type { Metadata } from 'next';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileForm } from '@/features/settings/ProfileForm';

export const metadata: Metadata = { title: 'Perfil · SaludSimple' };

export default async function PerfilPage() {
  const { profile } = await requireProfile();

  return (
    <div>
      <PageHeader title="Perfil" backHref="/configuracion" />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <ProfileForm
          userId={profile.id}
          initial={{
            first_name: profile.first_name,
            last_name: profile.last_name,
            birth_date: profile.birth_date ?? '',
            phone: profile.phone ?? '',
            avatar_url: profile.avatar_url ?? '',
          }}
        />
      </div>
    </div>
  );
}
