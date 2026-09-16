import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('muestra el título y la descripción', () => {
    render(
      <EmptyState
        title="Todavía no agregaste medicamentos"
        description="Registrá tus medicamentos para recibir recordatorios."
      />
    );

    expect(screen.getByText('Todavía no agregaste medicamentos')).toBeInTheDocument();
    expect(
      screen.getByText('Registrá tus medicamentos para recibir recordatorios.')
    ).toBeInTheDocument();
  });
});
