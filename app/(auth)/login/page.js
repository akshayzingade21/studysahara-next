// app/(auth)/login/page.js  (or app/[auth]/login/page.js)
'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginInner(){
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const search = useSearchParams();
  const redirectedFrom = search?.get('redirectedFrom') || '/crm/loanmanager';

  // ensure user has a row in user_roles (defaults to 'manager')
  const ensureDefaultRole = async (userId) => {
    if (!userId) return;
    const { data: existing, error: rErr } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .limit(1);
    if (rErr) return; // not critical
    if (existing && existing.length) return;
    await supabase.from('user_roles').insert({ user_id: userId, role: 'manager' });
  };

  const redirectByRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .limit(1);
    const role = !error && data?.[0]?.role ? data[0].role : 'manager';
    if (role === 'admin') router.replace('/crm/admin');
    else router.replace(redirectedFrom);
  };

  useEffect(() => {
    (async ()=>{
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await redirectByRole();
      }
    })();
  }, []); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .limit(1);
        const role = data?.[0]?.role || 'manager';
        router.replace(role === 'admin' ? '/crm/admin' : '/crm/loanmanager');

      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.user && data?.session === null) {
          setLoading(false);
          return setErr('Check your email to confirm your account, then sign in.');
        }
        router.replace('/crm/loanmanager');
      }
    } catch (e2) {
      setErr(e2.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

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

export default function LoginPage() {
  // Suspense boundary required for components that call useSearchParams()
  return (
    <Suspense fallback={<div />}>
      <LoginInner />
    </Suspense>
  );
}