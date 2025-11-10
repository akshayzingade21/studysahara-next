// components/crm/Topbar.js
'use client';
import { supabase } from '../../lib/supabase';

export default function Topbar() {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';   // ✅
  };
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between p-3 border-b bg-white/80 backdrop-blur">
      <div className="font-medium">Loan Manager</div>
      <button onClick={logout} className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">Logout</button>
    </div>
  );
}