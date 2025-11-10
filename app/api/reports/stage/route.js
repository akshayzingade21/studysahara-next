// app/api/reports/stage/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const csv = (v) => {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // service key bypasses RLS
    if (!url || !key) {
      return new NextResponse('Missing Supabase env vars', { status: 500 });
    }
    const admin = createClient(url, key, { auth: { persistSession: false } });

    // 1) Leads (authoritative current stage)
    const { data: leads, error: eLeads } = await admin
      .from('leads')
      .select('id,name,phone,email,source,stage,created_at,updated_at,loan_manager_id')
      .order('created_at', { ascending: false });
    if (eLeads) throw eLeads;

    const leadIds = (leads || []).map(l => l.id);
    const managerIds = Array.from(
      new Set((leads || []).map(l => l.loan_manager_id).filter(Boolean))
    );

    // 2) Last stage-change timestamp (from history)
    let latestByLead = {};
    if (leadIds.length) {
      const { data: hist, error: eHist } = await admin
        .from('lead_stage_history')
        .select('lead_id, changed_at')
        .in('lead_id', leadIds)
        .order('changed_at', { ascending: false });
      if (eHist) throw eHist;

      for (const h of hist || []) {
        if (!latestByLead[h.lead_id]) latestByLead[h.lead_id] = h.changed_at;
      }
    }

    // 3) Manager (from employees)
    const managerById = {};
    if (managerIds.length) {
      const { data: emps, error: eEmp } = await admin
        .from('employees')
        .select('id,email,name')
        .in('id', managerIds);
      if (eEmp) throw eEmp;
      for (const e of emps || []) {
        managerById[e.id] = { email: e.email || '', name: e.name || '' };
      }
    }

    // 4) CSV
    const headers = [
      'lead_id',
      'lead_name',
      'phone',
      'email',
      'source',
      'current_stage',
      'created_at',
      'last_stage_change',
      'loan_manager_id',
      'manager_name',
      'manager_email'
    ];
    const lines = [headers.join(',')];

    for (const l of (leads || [])) {
      const mgr = managerById[l.loan_manager_id] || {};
      lines.push([
        csv(l.id),
        csv(l.name || ''),
        csv(l.phone || ''),
        csv(l.email || ''),
        csv(l.source || ''),
        csv(l.stage || ''),
        csv(l.created_at || ''),
        csv(latestByLead[l.id] || l.updated_at || ''),
        csv(l.loan_manager_id || ''),
        csv(mgr.name || ''),
        csv(mgr.email || '')
      ].join(','));
    }

    const body = lines.join('\n');
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="stage-report.csv"',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    return new NextResponse(`Failed: ${err.message || String(err)}`, { status: 500 });
  }
}