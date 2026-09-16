import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Cliente con service_role: SOLO se importa desde Route Handlers /
// Server Actions que corren en el servidor. Nunca debe llegar al bundle
// del cliente (el paquete "server-only" rompe el build si eso ocurre).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Faltan variables de entorno de Supabase para el cliente admin (SUPABASE_SERVICE_ROLE_KEY).'
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
