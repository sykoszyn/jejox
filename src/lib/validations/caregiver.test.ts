import { describe, expect, it } from 'vitest';
import { inviteCaregiverSchema } from './caregiver';

describe('inviteCaregiverSchema', () => {
  it('acepta un correo válido y un permiso conocido', () => {
    const result = inviteCaregiverSchema.safeParse({ email: 'hija@example.com', permission: 'read' });
    expect(result.success).toBe(true);
  });

  it('rechaza un correo inválido', () => {
    const result = inviteCaregiverSchema.safeParse({ email: 'no-es-correo', permission: 'read' });
    expect(result.success).toBe(false);
  });

  it('rechaza un permiso desconocido', () => {
    const result = inviteCaregiverSchema.safeParse({
      email: 'hija@example.com',
      permission: 'admin',
    });
    expect(result.success).toBe(false);
  });
});
