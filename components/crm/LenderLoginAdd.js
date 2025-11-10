// components/crm/LenderLoginAdd.js
'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LenderLoginAdd({ leadId, onSaved }) {
  const [lender, setLender] = useState('');
  const [loginId, setLoginId] = useState('');
  const [loginDate, setLoginDate] = useState('');
  const [location, setLocation] = useState('');
  const [rmName, setRmName] = useState('');
  const [rmPhone, setRmPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const ensureLenderRow = async (lenderName) => {
    const { data: lenderRows, error: le } = await supabase
      .from('lenders').select('*').ilike('name', lenderName).limit(1);
    if (le) throw le;

    let lender_id = lenderRows?.[0]?.id;
    if (!lender_id) {
      const code = lenderName.toLowerCase().replace(/\s+/g, '_').slice(0, 32);
      const { data: ins, error: ie } = await supabase
        .from('lenders').insert({ code, name: lenderName }).select().single();
      if (ie) throw ie;
      lender_id = ins.id;
    }

    // ensure lead_lenders row exists
    const { data: ll, error: lle } = await supabase
      .from('lead_lenders')
      .select('*')
      .eq('lead_id', leadId)
      .eq('lender_id', lender_id)
      .limit(1);
    if (lle) throw lle;

    if (!ll?.length) {
      const { error: insLL } = await supabase
        .from('lead_lenders')
        .insert({ lead_id: leadId, lender_id });
      if (insLL) throw insLL;
    }
    return lender_id;
  };

  const submit = async () => {
    try {
      setErr('');
      if (!lender.trim() || !loginId.trim() || !loginDate.trim()) {
        setErr('Please fill Lender, Login ID, and Date of Login.');
        return;
      }
      setSaving(true);

      const lender_id = await ensureLenderRow(lender.trim());

      // Merge existing dates (preserve future pf_paid/disbursed etc.)
      const { data: currentLL, error: curErr } = await supabase
        .from('lead_lenders')
        .select('id, dates')
        .eq('lead_id', leadId)
        .eq('lender_id', lender_id)
        .single();
      if (curErr) throw curErr;

      const mergedDates = { ...(currentLL?.dates || {}), login: loginDate };

      const { error: upErr } = await supabase
        .from('lead_lenders')
        .update({
          stage: 'logged_in',
          login_id: loginId.trim(),
          location: location.trim() || null,
          rm_name: rmName.trim() || null,
          rm_phone: rmPhone.trim() || null,
          dates: mergedDates,
        })
        .eq('lead_id', leadId)
        .eq('lender_id', lender_id);
      if (upErr) throw upErr;

      // Reset
      setLender(''); setLoginId(''); setLoginDate('');
      setLocation(''); setRmName(''); setRmPhone('');
      onSaved?.();
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Failed to add login row.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded p-3 bg-white space-y-2">
      <div className="font-medium text-sm">Add Logged In Lender</div>
      {!!err && <div className="text-xs text-rose-600">{err}</div>}
      <div className="grid md:grid-cols-2 gap-2 text-sm">
        <input
          className="border rounded px-2 py-1"
          placeholder="Lender Name"
          value={lender}
          onChange={(e)=>setLender(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Login ID"
          value={loginId}
          onChange={(e)=>setLoginId(e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-2 py-1"
          aria-label="Date of Login"
          value={loginDate}
          onChange={(e)=>setLoginDate(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Location"
          value={location}
          onChange={(e)=>setLocation(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="RM Name"
          value={rmName}
          onChange={(e)=>setRmName(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="RM Phone"
          value={rmPhone}
          onChange={(e)=>setRmPhone(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={saving}
          className="px-3 py-1.5 text-sm rounded bg-black text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Add Login Row'}
        </button>
      </div>
    </div>
  );
}