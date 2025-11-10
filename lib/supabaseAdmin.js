// lib/supabaseAdmin.js
import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;           // ok to reuse
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;          // <- match your .env

// Extra guard: this file must never run in the browser
if (typeof window !== 'undefined') {
  throw new Error('supabaseAdmin must only be imported on the server');
}

if (!supabaseUrl || !serviceKey) {
  throw new Error(
    'Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});