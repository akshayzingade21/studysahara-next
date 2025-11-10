// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,       // keep session in localStorage
      autoRefreshToken: true,     // refresh before expiry
      detectSessionInUrl: true,   // handle redirects if you ever use magic links/OAuth
    },
  }
);