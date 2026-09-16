'use client';

import { Printer } from 'lucide-react';
import { LargeButton } from './LargeButton';

export function PrintButton() {
  return (
    <LargeButton
      variant="secondary"
      icon={<Printer size={20} />}
      onClick={() => window.print()}
      className="no-print"
    >
      Descargar / Imprimir PDF
    </LargeButton>
  );
}
