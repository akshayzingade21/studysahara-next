// components/crm/LeadsTable.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import StageBadge from './StageBadge.js';
import WhatsAppEmail from './WhatsAppEmail.js';
import StageMoveDialog from './StageMoveDialog.js';

export default function LeadsTable() {
  const [q, setQ] = useState('');
  const [source, setSource] = useState('all');
  const [rows, setRows] = useState([]);

  const load = async () => {
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (q) query = query.ilike('name', `%${q}%`);
    if (source !== 'all') query = query.eq('source', source);
    const { data } = await query;
    setRows(data || []);
  };

  useEffect(() => { load(); }, [q, source]);

  return (
    <div className="bg-white border border-gray-300 rounded-xl shadow-sm">
      <div className="p-3 flex flex-col md:flex-row md:items-center gap-2 border-b">
        <div className="text-base font-medium">Leads</div>
        <div className="flex gap-2 md:ml-auto">
          <input
            placeholder="Search by name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="px-3 py-2 text-sm border rounded-md w-56"
          />
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-3 py-2 text-sm border rounded-md"
          >
            <option value="all">All Sources</option>
            <option value="organic">Organic</option>
            <option value="partner">Partner</option>
            <option value="referral">Referral</option>
          </select>
          <Link
            href="/crm/loanmanager/leads/new"
            className="px-3 py-2 text-sm border rounded-md bg-gray-900 text-white hover:bg-black"
          >
            + New Lead
          </Link>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="text-left text-xs text-gray-500 bg-gray-50">
              <th className="p-2">Lead</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Source</th>
              <th>Stage</th>
              <th>Created</th>
              <th>Actions</th>
              <th>Move</th> {/* 👈 new column */}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">
                  <Link className="underline" href={`/crm/loanmanager/leads/${r.id}`}>{r.name}</Link>
                </td>
                <td>{r.phone || '-'}</td>
                <td>{r.email || '-'}</td>
                <td className="capitalize">{r.source || '-'}</td>
                <td><StageBadge stage={r.stage} /></td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2">
                  <WhatsAppEmail phone={r.phone} email={r.email} name={r.name} />
                </td>
                <td className="p-2">
                  <StageMoveDialog lead={r} onMoved={load} /> {/* 👈 button+dialog */}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={8} className="p-4 text-sm text-gray-500">No leads yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}