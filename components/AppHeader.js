 // components/AppHeader.js (example)
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AppHeader(){
  const [role, setRole] = useState(null);
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).limit(1);
      setRole(data?.[0]?.role || 'manager');
    })();
  }, []);
  return (
    <header className="flex items-center justify-between p-3 border-b bg-white">
      <div className="font-semibold">StudySahara CRM</div>
      <nav className="flex items-center gap-3 text-sm">
        <Link href="/crm/loanmanager" className="underline">Loan Manager</Link>
        {role === 'admin' && <Link href="/crm/admin" className="underline">Admin</Link>}
      </nav>
    </header>
  );
}