import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LargeButton } from './LargeButton';

describe('LargeButton', () => {
  it('renderiza el texto y responde al click', () => {
    const onClick = vi.fn();
    render(<LargeButton onClick={onClick}>Guardar</LargeButton>);

    const button = screen.getByRole('button', { name: 'Guardar' });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('se deshabilita mientras está cargando y no dispara el click', () => {
    const onClick = vi.fn();
    render(
      <LargeButton onClick={onClick} loading>
        Guardar
      </LargeButton>
    );

    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
