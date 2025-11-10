// components/crm/SanctionAdd.js
'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function SanctionAdd({ leadId, onSaved }) {
  const [lender, setLender] = useState('');
  const [sanctionDate, setSanctionDate] = useState('');
  const [expectedPF, setExpectedPF] = useState('');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [fees, setFees] = useState('');
  const [conditions, setConditions] = useState('');
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
      if (!lender.trim() || !sanctionDate.trim() || !amount.trim() || !fees.trim()) {
        setErr('Please fill Lender, Date of Sanction, Loan Amount, and Processing Fees.');
        return;
      }
      setSaving(true);
      const lender_id = await ensureLenderRow(lender.trim());

      const sanction = {
        date: sanctionDate,
        amount: Number(amount),
        rate: rate ? Number(rate) : null,
        processing_fees: Number(fees),
        conditions: conditions || null,
        expected_pf_date: expectedPF || null,
      };

      const { error: upErr } = await supabase
        .from('lead_lenders')
        .update({ stage: 'sanctioned', sanction })
        .eq('lead_id', leadId)
        .eq('lender_id', lender_id);
      if (upErr) throw upErr;

      // reset
      setLender(''); setSanctionDate(''); setExpectedPF('');
      setAmount(''); setRate(''); setFees(''); setConditions('');
      onSaved?.();
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Failed to add sanction row.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded p-3 bg-white space-y-2">
      <div className="font-medium text-sm">Add Sanctioned Lender</div>
      {!!err && <div className="text-xs text-rose-600">{err}</div>}
      <div className="grid md:grid-cols-2 gap-2 text-sm">
        <input
          className="border rounded px-2 py-1"
          placeholder="Lender Name"
          value={lender}
          onChange={(e)=>setLender(e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-2 py-1"
          aria-label="Date of Sanction"
          value={sanctionDate}
          onChange={(e)=>setSanctionDate(e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-2 py-1"
          aria-label="Expected Date of PF"
          value={expectedPF}
          onChange={(e)=>setExpectedPF(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Loan Amount"
          value={amount}
          onChange={(e)=>setAmount(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Interest Rate (%)"
          value={rate}
          onChange={(e)=>setRate(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Processing Fees"
          value={fees}
          onChange={(e)=>setFees(e.target.value)}
        />
      </div>
      <textarea
        className="w-full border rounded px-2 py-1 text-sm"
        placeholder="Sanction conditions (if any)"
        value={conditions}
        onChange={(e)=>setConditions(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={saving}
          className="px-3 py-1.5 text-sm rounded bg-black text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Add Sanction Row'}
        </button>
      </div>
    </div>
  );
}