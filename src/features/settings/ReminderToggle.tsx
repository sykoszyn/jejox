'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { updateReminderPreferences } from './notificationActions';

export function ReminderToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [, startTransition] = useTransition();

  return (
    <Card>
      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span>
          <span className="text-lg font-bold block">Recordatorios de medicamentos</span>
          <span className="text-ink-muted text-sm">
            Recibir un aviso cuando sea hora de tomar un medicamento.
          </span>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            setEnabled(e.target.checked);
            startTransition(async () => {
              await updateReminderPreferences({ remindersEnabled: e.target.checked });
            });
          }}
          className="w-7 h-7 accent-primary shrink-0"
        />
      </label>
    </Card>
  );
}
