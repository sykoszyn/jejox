'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { SelectField } from '@/components/ui/Field';
import { METRIC_LABELS } from '@/lib/measurements/config';
import { updateUnitsAndMetrics } from './unitsActions';
import type { EnabledMetrics, GlucoseUnit } from '@/types/database';

export function UnitsForm({
  initialGlucoseUnit,
  initialMetrics,
}: {
  initialGlucoseUnit: GlucoseUnit;
  initialMetrics: EnabledMetrics;
}) {
  const [glucoseUnit, setGlucoseUnit] = useState(initialGlucoseUnit);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [, startTransition] = useTransition();

  function save(next: { glucoseUnit: GlucoseUnit; metrics: EnabledMetrics }) {
    startTransition(async () => {
      await updateUnitsAndMetrics(next);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <SelectField
          label="Unidad de glucosa preferida"
          value={glucoseUnit}
          onChange={(e) => {
            const unit = e.target.value as GlucoseUnit;
            setGlucoseUnit(unit);
            save({ glucoseUnit: unit, metrics });
          }}
        >
          <option value="mg/dL">mg/dL</option>
          <option value="mmol/L">mmol/L</option>
        </SelectField>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Mediciones que quiero registrar</h2>
        {(Object.keys(METRIC_LABELS) as (keyof EnabledMetrics)[]).map((key) => (
          <Card key={key}>
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-lg font-medium">{METRIC_LABELS[key]}</span>
              <input
                type="checkbox"
                checked={metrics[key]}
                onChange={(e) => {
                  const next = { ...metrics, [key]: e.target.checked };
                  setMetrics(next);
                  save({ glucoseUnit, metrics: next });
                }}
                className="w-7 h-7 accent-primary shrink-0"
              />
            </label>
          </Card>
        ))}
      </section>
    </div>
  );
}
