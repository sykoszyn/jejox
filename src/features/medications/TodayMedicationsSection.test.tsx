import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TodayMedicationsSection, type DoseViewModel } from './TodayMedicationsSection';

vi.mock('@/lib/medications/actions', () => ({
  markMedicationTaken: vi.fn().mockResolvedValue({ success: true }),
  markMedicationSkipped: vi.fn().mockResolvedValue({ success: true }),
  snoozeMedication: vi.fn().mockResolvedValue({ success: true }),
}));

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLMediaElement.prototype.pause = vi.fn();
});

function makeDose(overrides: Partial<DoseViewModel> = {}): DoseViewModel {
  return {
    medicationId: 'med-1',
    scheduleId: 'sched-1',
    scheduledFor: '2024-06-10T08:00:00.000Z',
    effectiveFor: '2024-06-10T08:00:00.000Z',
    name: 'Metformina',
    dose: 850,
    doseUnit: 'mg',
    timeLabel: '08:00',
    status: 'pending',
    takenAtLabel: null,
    ...overrides,
  };
}

describe('TodayMedicationsSection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-10T08:00:01.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('abre sola la alarma cuando la toma ya está vencida, sin tocar "Tomar"', () => {
    render(<TodayMedicationsSection doses={[makeDose()]} />);

    expect(screen.getByRole('dialog', { hidden: true })).toHaveProperty('open', true);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('no abre la alarma todavía si la toma es en el futuro', () => {
    render(
      <TodayMedicationsSection
        doses={[makeDose({ scheduledFor: '2024-06-10T09:00:00.000Z', effectiveFor: '2024-06-10T09:00:00.000Z' })]}
      />
    );

    expect(screen.queryByRole('dialog', { hidden: true })).toBeNull();

    act(() => {
      vi.setSystemTime(new Date('2024-06-10T09:00:01.000Z'));
      vi.advanceTimersByTime(15_000);
    });

    expect(screen.getByRole('dialog', { hidden: true })).toHaveProperty('open', true);
  });
});
