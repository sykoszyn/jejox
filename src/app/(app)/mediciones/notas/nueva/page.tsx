import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { NoteForm } from '@/features/measurements/NoteForm';

export const metadata: Metadata = { title: 'Agregar nota · SaludSimple' };

export default function NuevaNotaPage() {
  return (
    <div>
      <PageHeader title="Agregar nota de salud" backHref="/mediciones" />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <NoteForm />
      </div>
    </div>
  );
}
