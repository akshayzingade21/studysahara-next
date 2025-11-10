// components/crm/LeadForm.js
'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LeadForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'organic',
    country_of_study: '',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const bind = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

const submit = async (e) => {
  e.preventDefault();
  setErr('');
  setLoading(true);

  try {
    // 👇 Fetch current user to satisfy FK + RLS policies
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    if (!user) throw new Error('Not signed in. Please login again.');

    // 👇 Include created_by = user.id
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      source: form.source,
      country_of_study: form.country_of_study || null,
      interested_admissions: false,
      stage: 'new',
    };

    const { data, error } = await supabase
      .from('leads')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    router.push(`/crm/loanmanager/leads/${data.id}`);
  } catch (e2) {
    console.error('Create lead failed:', e2);
    setErr(e2.message || 'Failed to create lead');
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="bg-white border border-gray-300 rounded-xl p-4 shadow-sm">
        <div className="font-medium mb-3">Create Lead</div>

        {err && (
          <div className="mb-3 text-sm text-rose-600 border border-rose-200 bg-rose-50 rounded-md px-3 py-2">
            {err}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3">
          <input value={form.name} onChange={bind('name')} placeholder="Name" className="px-3 py-2 border rounded-md" required />
          <input value={form.phone} onChange={bind('phone')} placeholder="Contact Number" className="px-3 py-2 border rounded-md" required />
          <input value={form.email} onChange={bind('email')} placeholder="Email" className="px-3 py-2 border rounded-md" />
          <input value={form.country_of_study} onChange={bind('country_of_study')} placeholder="Country of Study" className="px-3 py-2 border rounded-md" />
          <select value={form.source} onChange={bind('source')} className="px-3 py-2 border rounded-md">
            <option value="organic">Organic</option>
            <option value="partner">Partner</option>
            <option value="referral">Referral</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-3 px-3 py-2 bg-gray-900 text-white rounded-md disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}