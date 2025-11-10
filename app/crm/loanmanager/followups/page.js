// app/crm/loanmanager/followups/page.js
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabase';
import StageBadge from '../../../../components/crm/StageBadge';

export default function FollowUpsPage() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState('today'); // 'today' | 'overdue' | 'upcoming'

  useEffect(() => {
    (async () => {
      // fetch all followups (there should be at most one per lead after overwrite,
      // but we still defensively dedupe by most-recent due_on)
      const { data: fups } = await supabase
        .from('followups')
        .select('id, lead_id, due_on, outcome, notes, created_at')
        .order('due_on', { ascending: true });

      const leadIds = Array.from(new Set((fups || []).map(f => f.lead_id)));
      let leadsMap = {};
      if (leadIds.length) {
        const { data: leads } = await supabase
          .from('leads')
          .select('id,name,phone,email,stage')
          .in('id', leadIds);
        leadsMap = Object.fromEntries((leads || []).map(l => [l.id, l]));
      }

      // keep only the latest due per lead (pending one)
      const latestByLead = new Map();
      (fups || []).forEach(f => {
        const prev = latestByLead.get(f.lead_id);
        if (!prev || new Date(f.due_on) > new Date(prev.due_on)) {
          latestByLead.set(f.lead_id, f);
        }
      });

      const merged = Array.from(latestByLead.values())
        .map(f => ({ ...f, lead: leadsMap[f.lead_id] }))
        .filter(r => !!r.lead); // only rows with a valid lead

      setRows(merged);
    })();
  }, []);

  const { overdue, today, upcoming } = useMemo(() => {
    const start = new Date(); start.setHours(0,0,0,0);
    const end   = new Date(); end.setHours(23,59,59,999);

    const o = [], t = [], u = [];
    (rows || []).forEach(r => {
      const d = new Date(r.due_on);
      if (d < start) o.push(r);
      else if (d <= end) t.push(r);
      else u.push(r);
    });

    // sort nicely
    o.sort((a,b) => new Date(a.due_on) - new Date(b.due_on));
    t.sort((a,b) => new Date(a.due_on) - new Date(b.due_on));
    u.sort((a,b) => new Date(a.due_on) - new Date(b.due_on));

    return { overdue: o, today: t, upcoming: u };
  }, [rows]);

  const data = tab === 'overdue' ? overdue : tab === 'upcoming' ? upcoming : today;

  const openWA = (phone, name) => {
    if (!phone) return;
    const text = encodeURIComponent(`Hi ${name || 'there'}, this is StudySahara regarding your education loan. When can we connect?`);
    const url = `https://wa.me/${String(phone).replace(/\D/g,'')}?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const openEmail = (email, name) => {
    if (!email) return;
    const subject = encodeURIComponent('StudySahara – Education Loan Follow-up');
    const body = encodeURIComponent(`Hi ${name || ''},\n\nFollowing up on your education loan. Please reply with a good time to connect.\n\n– StudySahara Loan Desk`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Loan Manager</h1>
        <div className="text-sm text-gray-500">Total: {data.length}</div>
      </div>

      <div className="flex gap-2">
        <button onClick={()=>setTab('today')} className={`px-3 py-1.5 rounded border text-sm ${tab==='today'?'bg-black text-white':'bg-white hover:bg-gray-50'}`}>Today</button>
        <button onClick={()=>setTab('overdue')} className={`px-3 py-1.5 rounded border text-sm ${tab==='overdue'?'bg-black text-white':'bg-white hover:bg-gray-50'}`}>Overdue</button>
        <button onClick={()=>setTab('upcoming')} className={`px-3 py-1.5 rounded border text-sm ${tab==='upcoming'?'bg-black text-white':'bg-white hover:bg-gray-50'}`}>Upcoming</button>
      </div>

      <div className="bg-white border rounded-xl">
        <div className="px-3 py-2 border-b grid grid-cols-12 text-xs text-gray-600">
          <div className="col-span-3">Lead</div>
          <div className="col-span-2">Phone</div>
          <div className="col-span-2">Stage</div>
          <div className="col-span-2">Due</div>
          <div className="col-span-1">Outcome</div>
          <div className="col-span-2">Quick Actions</div>
        </div>

        {(data || []).map(r => (
          <div key={r.lead_id} className="px-3 py-2 border-t grid grid-cols-12 items-center text-sm">
            <div className="col-span-3">
              <Link href={`/crm/loanmanager/leads/${r.lead_id}`} className="underline">{r.lead?.name || '-'}</Link>
            </div>
            <div className="col-span-2">{r.lead?.phone || '-'}</div>
            <div className="col-span-2"><StageBadge stage={r.lead?.stage || 'new'} /></div>
            <div className="col-span-2">{new Date(r.due_on).toLocaleString()}</div>
            <div className="col-span-1 uppercase text-xs text-gray-500">{r.outcome || '-'}</div>
            <div className="col-span-2 flex gap-2">
              <button onClick={()=>openWA(r.lead?.phone, r.lead?.name)} className="px-2 py-1 rounded bg-green-600 text-white text-xs">WhatsApp</button>
              <button onClick={()=>openEmail(r.lead?.email, r.lead?.name)} className="px-2 py-1 rounded border text-xs">Email</button>
            </div>
          </div>
        ))}

        {!data.length && (
          <div className="p-4 text-sm text-gray-500">No follow-ups.</div>
        )}
      </div>
    </div>
  );
}