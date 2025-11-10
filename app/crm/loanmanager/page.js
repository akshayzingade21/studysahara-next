// app/crm/loanmanager/page.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import StageBadge from '../../../components/crm/StageBadge.js';
import StageMoveDialog from '../../../components/crm/StageMoveDialog.js';
import Link from 'next/link';

const STAGES = [
  { key: 'new',          label: 'New' },
  { key: 'lod_shared',   label: 'LOD Shared' },
  { key: 'docs_received',label: 'Docs Received' },
  { key: 'logged_in',    label: 'Logged In' },
  { key: 'sanctioned',   label: 'Sanctioned' },
  { key: 'pf_paid',      label: 'PF Paid' },
  { key: 'disbursed',    label: 'Disbursed' },
  { key: 'deferred',     label: 'Deferred' },
  { key: 'lost',         label: 'Lost' },
];

export default function Dashboard() {
  const [counts, setCounts] = useState({});
  const [fresh, setFresh] = useState([]);

  useEffect(() => {
    (async () => {
      // ---- Stage counts (simple client-side tally) ----
      const { data: allStages } = await supabase.from('leads').select('stage');
      const map = {};
      STAGES.forEach(s => { map[s.key] = 0; });
      (allStages || []).forEach(r => {
        const s = r.stage || 'new';
        map[s] = (map[s] || 0) + 1;
      });
      setCounts(map);

      // ---- Fresh leads: must be NEW and have NO followups ----
      const { data: leads } = await supabase
        .from('leads')
        .select('id,name,phone,email,source,stage,created_at,followups!left(id)')
        .eq('stage', 'new')            // only "to be contacted first time"
        .is('followups.id', null)      // never had a follow-up
        .order('created_at', { ascending: false })
        .limit(10);

      setFresh(leads || []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Loan Manager</h1>
        <Link
          href="/crm/loanmanager/leads/new"
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          + New Lead
        </Link>
      </div>

      {/* Stage cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {STAGES.map(({ key, label }) => (
          <div key={key} className="bg-white border border-gray-300 rounded-xl p-3 shadow-sm">
            <div className="text-xs text-gray-600 mb-1">{label}</div>
            <div className="text-3xl font-semibold tabular-nums">{counts[key] || 0}</div>
          </div>
        ))}
      </div>

      {/* CSV actions */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/api/reports/stage"
          download="stage-report.csv"
          className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50"
        >
          Download Stage Report (CSV)
        </a>
        <a
          href="/api/reports/lender"
          download="lender-report.csv"
          className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50"
        >
          Download Lender Report (CSV)
        </a>
        <a
          href="/api/reports/timeline"
          download="timeline-report.csv"
          className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50"
        >
          Download Timeline Report (CSV)
        </a>
      </div>

      {/* Fresh leads */}
      <div className="bg-white border border-gray-300 rounded-xl shadow-sm">
        <div className="p-3 font-medium border-b">Fresh Leads</div>
        <div className="divide-y">
          {(fresh || []).map((l) => (
            <div key={l.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{l.name}</div>
                <div className="text-xs text-gray-500">{l.phone || '-'} • {l.source || '-'}</div>
              </div>
              <div className="flex items-center gap-2">
                <StageBadge stage={l.stage} />
                <StageMoveDialog lead={l} onMoved={() => window.location.reload()} />
              </div>
            </div>
          ))}
          {!fresh?.length && (
            <div className="p-4 text-sm text-gray-500">
              No fresh leads. (All new leads have been contacted / scheduled.)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}