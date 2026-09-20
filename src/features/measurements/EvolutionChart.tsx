'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatDate } from '@/lib/utils/datetime';

export interface EvolutionSeries {
  key: string;
  label: string;
  color: string;
}

export interface EvolutionPoint {
  timestamp: string;
  [seriesKey: string]: string | number;
}

export function EvolutionChart({
  data,
  series,
  unit,
}: {
  data: EvolutionPoint[];
  series: EvolutionSeries[];
  unit?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(v: string) => formatDate(v)}
            tick={{ fontSize: 13, fill: 'var(--color-ink-muted)' }}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 13, fill: 'var(--color-ink-muted)' }}
            width={40}
            unit={unit ? ` ${unit}` : undefined}
          />
          <Tooltip
            labelFormatter={(v) => (typeof v === 'string' ? formatDate(v) : String(v ?? ''))}
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              fontSize: 14,
            }}
          />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 14 }} />}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
