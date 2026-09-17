import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DoseActionDialog, type DoseInfo } from './DoseActionDialog';
import * as medicationActions from '@/lib/medications/actions';

vi.mock('@/lib/medications/actions', () => ({
  markMedicationTaken: vi.fn().mockResolvedValue({ success: true }),
  markMedicationSkipped: vi.fn().mockResolvedValue({ success: true }),
  snoozeMedication: vi.fn().mockResolvedValue({ success: true }),
}));

// HTMLDialogElement y la reproducción de audio no están implementados en jsdom.
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

const dose: DoseInfo = {
  medicationId: 'med-1',
  scheduleId: 'sched-1',
  scheduledFor: '2024-06-10T08:00:00.000Z',
  effectiveFor: '2024-06-10T08:00:00.000Z',
  name: 'Metformina',
  dose: 850,
  doseUnit: 'mg',
  timeLabel: '08:00',
};

describe('DoseActionDialog', () => {
  it('reproduce el sonido de alerta en bucle mientras el diálogo está abierto', () => {
    const onClose = vi.fn();
    render(<DoseActionDialog dose={dose} open onClose={onClose} />);

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('llama a markMedicationTaken y cierra el dialogo al confirmar "Ya la tomé"', async () => {
    const onClose = vi.fn();
    render(<DoseActionDialog dose={dose} open onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /ya la tomé/i }));

    await waitFor(() => {
      expect(medicationActions.markMedicationTaken).toHaveBeenCalledWith({
        medicationId: 'med-1',
        scheduleId: 'sched-1',
        scheduledFor: '2024-06-10T08:00:00.000Z',
      });
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('muestra las opciones de posponer y llama a snoozeMedication con los minutos elegidos', async () => {
    const onClose = vi.fn();
    render(<DoseActionDialog dose={dose} open onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /recordar más tarde/i }));
    fireEvent.click(screen.getByRole('button', { name: '15 min' }));

    await waitFor(() => {
      expect(medicationActions.snoozeMedication).toHaveBeenCalledWith(
        { medicationId: 'med-1', scheduleId: 'sched-1', scheduledFor: '2024-06-10T08:00:00.000Z' },
        15
      );
    });
  });
});
