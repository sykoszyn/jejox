import { describe, expect, it } from 'vitest';
import { signInSchema, signUpSchema, magicLinkSchema } from './auth';

describe('signInSchema', () => {
  it('acepta credenciales válidas', () => {
    const result = signInSchema.safeParse({ email: 'ana@example.com', password: 'secreta123' });
    expect(result.success).toBe(true);
  });

  it('rechaza un correo inválido', () => {
    const result = signInSchema.safeParse({ email: 'no-es-un-correo', password: 'secreta123' });
    expect(result.success).toBe(false);
  });

  it('rechaza una contraseña vacía', () => {
    const result = signInSchema.safeParse({ email: 'ana@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('signUpSchema', () => {
  it('exige nombre, correo y contraseña de al menos 8 caracteres', () => {
    expect(
      signUpSchema.safeParse({ firstName: 'Ana', email: 'ana@example.com', password: '1234567' })
        .success
    ).toBe(false);

    expect(
      signUpSchema.safeParse({ firstName: 'Ana', email: 'ana@example.com', password: '12345678' })
        .success
    ).toBe(true);

    expect(
      signUpSchema.safeParse({ firstName: '', email: 'ana@example.com', password: '12345678' })
        .success
    ).toBe(false);
  });
});

describe('magicLinkSchema', () => {
  it('valida solo el correo', () => {
    expect(magicLinkSchema.safeParse({ email: 'ana@example.com' }).success).toBe(true);
    expect(magicLinkSchema.safeParse({ email: '' }).success).toBe(false);
  });
});
