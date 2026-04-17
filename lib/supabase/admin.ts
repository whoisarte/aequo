import { createClient } from '@supabase/supabase-js';

// Cliente de servicio con privilegios elevados (bypass RLS)
// Se utiliza para operaciones internas de facturación y administración de suscripciones.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
