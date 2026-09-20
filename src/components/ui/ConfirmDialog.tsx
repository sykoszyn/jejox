'use client';

import { useEffect, useRef } from 'react';
import { LargeButton } from './LargeButton';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="rounded-xl border border-border p-0 bg-surface text-ink max-w-sm w-[90vw] backdrop:bg-black/50"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="p-6 flex flex-col gap-4">
        <h2 id="confirm-dialog-title" className="text-xl font-bold">
          {title}
        </h2>
        {description && <p className="text-base text-ink-muted">{description}</p>}
        <div className="flex flex-col gap-3 mt-2">
          <LargeButton variant={danger ? 'danger' : 'primary'} onClick={onConfirm} fullWidth>
            {confirmLabel}
          </LargeButton>
          <LargeButton variant="secondary" onClick={onCancel} fullWidth>
            {cancelLabel}
          </LargeButton>
        </div>
      </div>
    </dialog>
  );
}
