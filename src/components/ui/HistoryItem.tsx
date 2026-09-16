import { Pill, Droplet, HeartPulse, Scale, Thermometer, Activity, Wind, StickyNote, Check, X, Clock } from 'lucide-react';
import { Card } from './Card';
import { formatTime } from '@/lib/utils/datetime';
import type { HistoryEntry } from '@/features/history/getHistoryEntries';

const ICONS = {
  medication: Pill,
  glucose: Droplet,
  blood_pressure: HeartPulse,
  weight: Scale,
  temperature: Thermometer,
  heart_rate: Activity,
  oxygen: Wind,
  note: StickyNote,
};

export function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const Icon = ICONS[entry.category];

  return (
    <Card className="flex items-start gap-4">
      <Icon className="text-primary shrink-0 mt-1" size={24} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold">{entry.title}</p>
        {entry.detail && <p className="text-ink-muted break-words">{entry.detail}</p>}
        {entry.status && (
          <p className="flex items-center gap-1 text-sm font-bold mt-1">
            {entry.status === 'taken' && (
              <>
                <Check className="text-success" size={16} /> TOMADO
              </>
            )}
            {entry.status === 'skipped' && (
              <>
                <X className="text-danger" size={16} /> OMITIDO
              </>
            )}
            {(entry.status === 'pending' || entry.status === 'snoozed') && (
              <>
                <Clock className="text-warning" size={16} /> PENDIENTE
              </>
            )}
          </p>
        )}
      </div>
      <time dateTime={entry.timestamp} className="text-ink-muted shrink-0">
        {formatTime(entry.timestamp)}
      </time>
    </Card>
  );
}
