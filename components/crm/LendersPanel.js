// components/crm/LendersPanel.js
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

function ensureArray(x) { return Array.isArray(x) ? x : []; }

export default function LendersPanel({ lead, onChange }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'sanction'
  const [form, setForm] = useState({ lender: '', loginId:'', loginDate:'', location:'', rmName:'', rmPhone:'', sDate:'', sAmount:'', sRate:'', sFees:'', sConditions:'', sExpectedPFDate:'' });

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const { data } = await supabase
        .from('lead_lenders')
        .select('id, lender_id, stage, login_id, location, rm_name, rm_phone, dates, sanction, lenders(name)')
        .eq('lead_id', lead.id)
        .order('id');
      setRows(data || []);
    } catch (e) {
      setErr(e.message || 'Failed to load lenders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (lead?.id) load(); }, [lead?.id]);

  const ensureLenderRow = async (lenderName) => {
    const { data: lenderRows } = await supabase
      .from('lenders')
      .select('*')
      .ilike('name', lenderName)
      .limit(1);
    let lender_id = lenderRows?.[0]?.id;
    if (!lender_id) {
      const code = lenderName.toLowerCase().replace(/\s+/g,'_').slice(0,32);
      const { data: ins } = await supabase
        .from('lenders')
        .insert({ code, name: lenderName })
        .select()
        .single();
      lender_id = ins.id;
    }
    const { data: ll } = await supabase
      .from('lead_lenders')
      .select('*')
      .eq('lead_id', lead.id)
      .eq('lender_id', lender_id)
      .limit(1);

    if (!ll?.length) {
      await supabase.from('lead_lenders').insert({ lead_id: lead.id, lender_id });
    }
    return lender_id;
  };

  const openLogin = () => {
    setMode('login');
    setForm({ lender: '', loginId:'', loginDate:'', location:'', rmName:'', rmPhone:'' });
    setOpen(true);
  };
  const openSanction = () => {
    setMode('sanction');
    setForm({ lender: '', sDate:'', sAmount:'', sRate:'', sFees:'', sConditions:'', sExpectedPFDate:'' });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (mode === 'login') {
        if (!form.lender || !form.loginId || !form.loginDate) throw new Error('Lender, Login ID, Date are required.');
        const lender_id = await ensureLenderRow(form.lender);
        await supabase
          .from('lead_lenders')
          .update({
            stage: 'logged_in',
            login_id: form.loginId,
            location: form.location || null,
            rm_name: form.rmName || null,
            rm_phone: form.rmPhone || null,
            dates: { login: form.loginDate },
          })
          .eq('lead_id', lead.id)
          .eq('lender_id', lender_id);
      } else {
        if (!form.lender || !form.sDate || !form.sAmount || !form.sFees) throw new Error('Lender, Date, Amount, Fees are required.');
        const lender_id = await ensureLenderRow(form.lender);
        await supabase
          .from('lead_lenders')
          .update({
            stage: 'sanctioned',
            sanction: {
              date: form.sDate,
              amount: Number(form.sAmount),
              rate: form.sRate ? Number(form.sRate) : null,
              processing_fees: Number(form.sFees),
              conditions: form.sConditions || null,
              expected_pf_date: form.sExpectedPFDate || null,
            },
          })
          .eq('lead_id', lead.id)
          .eq('lender_id', lender_id);
      }
      setOpen(false);
      await load();
      onChange?.();
    } catch (e) {
      alert(e.message || 'Failed to save');
    }
  };

  return (
    <div className="bg-white border rounded p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">Lenders</div>
        <div className="flex gap-2">
          <button onClick={openLogin} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50">+ Add/Update Login</button>
          <button onClick={openSanction} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50">+ Add/Update Sanction</button>
        </div>
      </div>

      {err && <div className="mt-2 text-xs text-rose-600">{err}</div>}
      {loading && <div className="mt-2 text-sm text-gray-500">Loading lenders…</div>}

      {!loading && rows.length === 0 && (
        <div className="mt-2 text-sm text-gray-500">No lender data yet.</div>
      )}

      <div className="mt-3 grid gap-2">
        {rows.map((r) => (
          <div key={r.id} className="border rounded p-3 bg-gray-50">
            <div className="text-sm font-medium">{r.lenders?.name || 'Lender'}</div>
            <div className="text-xs text-gray-600">Stage: {r.stage || '-'}</div>
            <div className="mt-2 grid md:grid-cols-3 gap-2 text-xs">
              <div>Login ID: <b>{r.login_id || '-'}</b></div>
              <div>Login Date: <b>{(r.dates && r.dates.login) ? r.dates.login : '-'}</b></div>
              <div>Location: <b>{r.location || '-'}</b></div>
              <div>RM: <b>{r.rm_name || '-'}</b></div>
              <div>RM Phone: <b>{r.rm_phone || '-'}</b></div>
            </div>
            {r.sanction && (
              <div className="mt-2 grid md:grid-cols-3 gap-2 text-xs">
                <div>Sanction Date: <b>{r.sanction.date || '-'}</b></div>
                <div>Amount: <b>{r.sanction.amount ?? '-'}</b></div>
                <div>Rate: <b>{r.sanction.rate ?? '-'}</b></div>
                <div>Processing Fees: <b>{r.sanction.processing_fees ?? '-'}</b></div>
                <div>Expected PF: <b>{r.sanction.expected_pf_date || '-'}</b></div>
                <div>Conditions: <b>{r.sanction.conditions || '-'}</b></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded bg-white border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">
                {mode === 'login' ? 'Add/Update Login' : 'Add/Update Sanction'}
              </div>
              <button onClick={()=>setOpen(false)} className="text-xs underline">Close</button>
            </div>

            {mode === 'login' ? (
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <input className="border rounded px-2 py-1" placeholder="Lender Name" value={form.lender} onChange={e=>setForm(f=>({...f,lender:e.target.value}))} />
                <input className="border rounded px-2 py-1" placeholder="Login ID" value={form.loginId} onChange={e=>setForm(f=>({...f,loginId:e.target.value}))} />
                <input type="date" className="border rounded px-2 py-1" value={form.loginDate} onChange={e=>setForm(f=>({...f,loginDate:e.target.value}))} />
                <input className="border rounded px-2 py-1" placeholder="Location" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} />
                <input className="border rounded px-2 py-1" placeholder="RM Name" value={form.rmName} onChange={e=>setForm(f=>({...f,rmName:e.target.value}))} />
                <input className="border rounded px-2 py-1" placeholder="RM Phone" value={form.rmPhone} onChange={e=>setForm(f=>({...f,rmPhone:e.target.value}))} />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <input className="border rounded px-2 py-1" placeholder="Lender Name" value={form.lender} onChange={e=>setForm(f=>({...f,lender:e.target.value}))} />
                <input type="date" className="border rounded px-2 py-1" value={form.sDate} onChange={e=>setForm(f=>({...f,sDate:e.target.value}))} />
                <input className="border rounded px-2 py-1" placeholder="Amount" value={form.sAmount} onChange={e=>setForm(f=>({...f,sAmount:e.target.value}))} />
                <input className="border rounded px-2 py-1" placeholder="Interest Rate (%)" value={form.sRate} onChange={e=>setForm(f=>({...f,sRate:e.target.value}))} />
                <input className="border rounded px-2 py-1" placeholder="Processing Fees" value={form.sFees} onChange={e=>setForm(f=>({...f,sFees:e.target.value}))} />
                <input type="date" className="border rounded px-2 py-1" value={form.sExpectedPFDate} onChange={e=>setForm(f=>({...f,sExpectedPFDate:e.target.value}))} />
                <textarea className="md:col-span-2 border rounded px-2 py-1 text-sm" placeholder="Sanction conditions (optional)" value={form.sConditions} onChange={e=>setForm(f=>({...f,sConditions:e.target.value}))} />
              </div>
            )}

            <div className="flex justify-end gap-2 mt-3">
              <button onClick={()=>setOpen(false)} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="px-3 py-1.5 text-sm rounded bg-gray-900 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}