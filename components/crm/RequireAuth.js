// components/crm/RequireAuth.js  (CLIENT component)
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function RequireAuth() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const search = new URLSearchParams({ redirectedFrom: window.location.pathname }).toString();
        window.location.href = `/login?${search}`;
        return;
      }
      setChecked(true);
    })();
  }, []);

  if (!checked) return null;
  return null;
}