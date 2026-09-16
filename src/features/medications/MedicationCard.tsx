import Link from 'next/link';
import { Pill, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Medication, MedicationSchedule } from '@/types/database';

export function MedicationCard({
  medication,
  schedules,
}: {
  medication: Medication;
  schedules: MedicationSchedule[];
}) {
  const times = schedules
    .map((s) => s.time_of_day.slice(0, 5))
    .sort()
    .join(' · ');

  return (
    <Link href={`/medicamentos/${medication.id}`} className="block tap-target">
      <Card className="flex items-center gap-4">
        <Pill className="text-primary shrink-0" size={28} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold truncate">{medication.name}</p>
          <p className="text-ink-muted">
            {medication.dose} {medication.dose_unit}
            {times && ` · ${times}`}
          </p>
        </div>
        <ChevronRight className="text-ink-muted shrink-0" aria-hidden="true" />
      </Card>
    </Link>
  );
}
