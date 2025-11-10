// app/admin/dashboard/page.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Runtime only — use public envs on client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export const revalidate = 0;             // no ISR
export const dynamic = 'force-dynamic';  // avoid prerender

function formatINR(n) {
  if (n === null || n === undefined) return '—';
  const num = Number(n) || 0;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `₹${num.toFixed(2)}`;
  }
}

function safeDate(s) {
  if (!s) return '—';
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
  } catch {
    return '—';
  }
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);

  const [convCount, setConvCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [aggCostRows, setAggCostRows] = useState([]);

  const [recentConvs, setRecentConvs] = useState([]);
  const [messageBatches, setMessageBatches] = useState([]);

  const [recentCosts, setRecentCosts] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // counts
        const [{ count: c1 }, { count: c2 }] = await Promise.all([
          supabase.from('conversations').select('*', { count: 'exact', head: true }),
          supabase.from('messages').select('*', { count: 'exact', head: true }),
        ]);
        if (!mounted) return;
        setConvCount(c1 ?? 0);
        setMsgCount(c2 ?? 0);

        // costs list for totals and per-model
        const { data: costAgg } = await supabase
          .from('cost_logs')
          .select('est_cost_inr, est_cost_usd, model, created_at')
          .order('created_at', { ascending: false })
          .limit(2000);
        if (!mounted) return;
        setAggCostRows(costAgg || []);

        // recent conversations
        const { data: convs } = await supabase
          .from('conversations')
          .select('id, session_id, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
        if (!mounted) return;
        setRecentConvs(convs || []);

        // messages for each
        const batches = await Promise.all(
          (convs || []).map(async (c) => {
            const { data: msgs } = await supabase
              .from('messages')
              .select('id, conversation_id, role, model, content, created_at')
              .eq('conversation_id', c.id)
              .order('created_at', { ascending: true })
              .limit(8);
            return { conv: c, msgs: msgs || [] };
          })
        );
        if (!mounted) return;
        setMessageBatches(batches);

        // recent cost logs
        const { data: recent } = await supabase
          .from('cost_logs')
          .select('id, conversation_id, model, prompt_tokens, completion_tokens, total_tokens, est_cost_usd, est_cost_inr, created_at')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!mounted) return;
        setRecentCosts(recent || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const totalINR = useMemo(
    () => (aggCostRows || []).reduce((sum, r) => sum + (Number(r.est_cost_inr) || 0), 0),
    [aggCostRows]
  );
  const totalUSD = useMemo(
    () => (aggCostRows || []).reduce((sum, r) => sum + (Number(r.est_cost_usd) || 0), 0),
    [aggCostRows]
  );

  const perModel = useMemo(() => {
    const m = {};
    (aggCostRows || []).forEach(r => {
      const k = r.model || 'unknown';
      m[k] = m[k] || { rows: 0, inr: 0, usd: 0 };
      m[k].rows += 1;
      m[k].inr += Number(r.est_cost_inr) || 0;
      m[k].usd += Number(r.est_cost_usd) || 0;
    });
    return m;
  }, [aggCostRows]);

  const anyTokensPresent = useMemo(
    () => (recentCosts || []).some(r =>
      r?.prompt_tokens != null || r?.completion_tokens != null || r?.total_tokens != null
    ),
    [recentCosts]
  );

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, "Helvetica Neue", Arial' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>StudySahara — Admin Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: 20 }}>Messages, costs, and recent conversations</p>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Conversations" value={convCount ?? 0} />
        <StatCard label="Total Messages" value={msgCount ?? 0} />
        <StatCard label="Total Cost (INR)" value={formatINR(totalINR)} />
        <StatCard label="Total Cost (USD)" value={`$${(totalUSD || 0).toFixed(4)}`} />
      </div>

      {/* Per model */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Cost by Model (latest)</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#f3f4f6' }}>
                <Th>Model</Th>
                <Th># Logs</Th>
                <Th>Cost (INR)</Th>
                <Th>Cost (USD)</Th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(perModel).map(([m, v]) => (
                <tr key={m} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <Td mono>{m}</Td>
                  <Td>{v.rows}</Td>
                  <Td>{formatINR(v.inr)}</Td>
                  <Td>${(v.usd || 0).toFixed(4)}</Td>
                </tr>
              ))}
              {Object.keys(perModel).length === 0 && (
                <tr><Td colSpan={4} style={{ color: '#6b7280' }}>No cost logs yet.</Td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent conversations + messages */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Recent Conversations</h2>
        {(messageBatches || []).map(({ conv, msgs }) => (
          <div key={conv.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 12 }}>
            <div style={{ padding: 10, background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 600 }}>Conversation</span>{' '}
              <code style={{ background: '#eef2ff', padding: '2px 6px', borderRadius: 6 }}>{conv.id}</code>
              <span style={{ color: '#6b7280' }}> • {safeDate(conv.created_at)}</span>
            </div>
            <div style={{ padding: 10 }}>
              {msgs.length === 0 && <div style={{ color: '#6b7280' }}>No messages yet.</div>}
              {msgs.map(m => (
                <div key={m.id} style={{
                  marginBottom: 8,
                  background: m.role === 'assistant' ? '#f3f4f6' : '#e0f2fe',
                  borderRadius: 8,
                  padding: 10
                }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                    <strong>{m.role}</strong> • {m.model || '—'} • {safeDate(m.created_at)}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {(!messageBatches || messageBatches.length === 0) && (
          <div style={{ color: '#6b7280' }}>{loading ? 'Loading…' : 'No conversations found.'}</div>
        )}
      </section>

      {/* Recent cost logs */}
      <section style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Recent Cost Logs</h2>
          <a href="/api/admin/cost-csv" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'underline' }}>
            Export CSV
          </a>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#f3f4f6' }}>
                <Th>When</Th>
                <Th>Conversation</Th>
                <Th>Model</Th>
                {anyTokensPresent && (<Th>Prompt Toks</Th>)}
                {anyTokensPresent && (<Th>Completion Toks</Th>)}
                {anyTokensPresent && (<Th>Total Toks</Th>)}
                <Th>Cost (INR)</Th>
                <Th>Cost (USD)</Th>
              </tr>
            </thead>
            <tbody>
              {(recentCosts || []).map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <Td>{safeDate(r.created_at)}</Td>
                  <Td mono>{r.conversation_id || '—'}</Td>
                  <Td mono>{r.model || '—'}</Td>
                  {anyTokensPresent && (<Td>{r.prompt_tokens ?? '—'}</Td>)}
                  {anyTokensPresent && (<Td>{r.completion_tokens ?? '—'}</Td>)}
                  {anyTokensPresent && (<Td>{r.total_tokens ?? '—'}</Td>)}
                  <Td>{formatINR(r.est_cost_inr)}</Td>
                  <Td>${(Number(r.est_cost_usd) || 0).toFixed(6)}</Td>
                </tr>
              ))}
              {(recentCosts || []).length === 0 && (
                <tr>
                  <Td colSpan={anyTokensPresent ? 8 : 5} style={{ color: '#6b7280' }}>
                    {loading ? 'Loading…' : 'No cost logs yet.'}
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, background: '#ffffff' }}>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Th({ children }) {
  return <th style={{ fontWeight: 600, padding: '10px 8px', fontSize: 13 }}>{children}</th>;
}
function Td({ children, mono = false, colSpan }) {
  return (
    <td
      colSpan={colSpan}
      style={{
        padding: '8px',
        fontFamily: mono
          ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
          : undefined
      }}
    >
      {children}
    </td>
  );
}