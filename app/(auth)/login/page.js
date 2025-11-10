// app/[auth]/login/page.js
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Login(){
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const search = useSearchParams();
  // If someone bookmarked a target, we’ll still honor it for non-admins.
  const redirectedFrom = search.get('redirectedFrom') || '/crm/loanmanager';

  // -- helpers ----------------------------------------------------------------

  // Upsert into employees so admin can “Assign to …”
  const ensureEmployee = async (user) => {
    if (!user?.id) return;
    // employees: id (uuid PK), email (text), name (text)
    await supabase.from('employees').upsert(
      { id: user.id, email: user.email || null, name: null },
      { onConflict: 'id' }
    );
  };

  // Ensure a role row exists; default to 'manager'
  const ensureDefaultRole = async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .limit(1);
    if (error) return; // not fatal
    if (!data || data.length === 0) {
      await supabase.from('user_roles').insert({ user_id: userId, role: 'manager' });
    }
  };

  // Read role and redirect
  const redirectByRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // make sure infra rows exist (safe to call repeatedly)
    await ensureEmployee(user);
    await ensureDefaultRole(user.id);

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .limit(1);

    const role = !error && data?.[0]?.role ? data[0].role : 'manager';
    router.replace(role === 'admin' ? '/crm/admin' : redirectedFrom);
  };

  // If already signed in, do role-based redirect
  useEffect(() => {
    (async ()=>{
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await redirectByRole();
      }
    })();
  }, []); // eslint-disable-line

  // -- submit -----------------------------------------------------------------
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // finalize infra rows & redirect
        await redirectByRole();

      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // If email confirmation is required, there is no session yet.
        if (data?.user && data?.session === null) {
          setLoading(false);
          return setErr('Check your email to confirm your account, then sign in.');
        }

        // If we already have a session (email confirm not required),
        // finish wiring (employees + role) and redirect by role.
        await redirectByRole();
      }
    } catch (e2) {
      setErr(e2.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // -- UI ---------------------------------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form onSubmit={submit} className="bg-white border rounded-xl p-6 w-full max-w-sm space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </div>
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-xs text-gray-600 underline"
          >
            {mode === 'signin' ? 'Need an account?' : 'Have an account? Sign in'}
          </button>
        </div>

        {err && <div className="text-sm text-rose-600 border border-rose-200 bg-rose-50 rounded-md px-3 py-2">{err}</div>}

        <input
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded-md"
          required
        />

        <button className="w-full px-3 py-2 bg-gray-900 text-white rounded-md disabled:opacity-60" disabled={loading}>
          {loading ? (mode === 'signin' ? 'Signing in…' : 'Creating…') : (mode === 'signin' ? 'Sign in' : 'Sign up')}
        </button>

        <div className="text-[11px] text-gray-500 text-center">
          You’ll be redirected to your dashboard based on role.
        </div>
      </form>
    </div>
  );
}