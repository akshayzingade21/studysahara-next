// app/admin/dashboard/page.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic'; // remove revalidate entirely

function formatINR(n) {
  if (n === null || n === undefined) return '—';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(Number(n));
  } catch {
    return `₹${Number(n).toFixed(2)}`;
  }
}

function safeDate(s) {
  try { return s ? new Date(s).toLocaleString() : '—'; } catch { return '—'; }
}

export default function AdminDashboardPage() {
  const [convCount, setConvCount] = useState(0);
  const [msgCount, setMsgCount]   = useState(0);
  const [aggCostRows, setAggCostRows] = useState([]);
  const [recentConvs, setRecentConvs] = useState([]);
  const [messageBatches, setMessageBatches] = useState([]);
  const [recentCosts, setRecentCosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { totalINR, totalUSD, perModel, anyTokensPresent } = useMemo(() => {
    const inr = (aggCostRows || []).reduce((sum, r) => sum + (Number(r.est_cost_inr) || 0), 0);
    const usd = (aggCostRows || []).reduce((sum, r) => sum + (Number(r.est_cost_usd) || 0), 0);

    const modelAgg = {};
    (aggCostRows || []).forEach(r => {
      const k = r.model || 'unknown';
      modelAgg[k] = modelAgg[k] || { rows: 0, inr: 0, usd: 0 };
      modelAgg[k].rows += 1;
      modelAgg[k].inr  += Number(r.est_cost_inr) || 0;
      modelAgg[k].usd  += Number(r.est_cost_usd) || 0;
    });

    const tokensPresent = (recentCosts || []).some(
      r => r?.prompt_tokens != null || r?.completion_tokens != null || r?.total_tokens != null
    );

    return { totalINR: inr, totalUSD: usd, perModel: modelAgg, anyTokensPresent: tokensPresent };
  }, [aggCostRows, recentCosts]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const [{ count: cCount }, { count: mCount }] = await Promise.all([
          supabase.from('conversations').select('*', { count: 'exact', head: true }),
          supabase.from('messages').select('*', { count: 'exact', head: true })
        ]);
        if (!cancelled) {
          setConvCount(cCount ?? 0);
          setMsgCount(mCount ?? 0);
        }

        const { data: agg } = await supabase
          .from('cost_logs')
          .select('est_cost_inr, est_cost_usd, model, created_at')
          .order('created_at', { ascending: false })
          .limit(2000);
        if (!cancelled) setAggCostRows(agg || []);

        const { data: rCosts } = await supabase
          .from('cost_logs')
          .select('id, conversation_id, model, prompt_tokens, completion_tokens, total_tokens, est_cost_usd, est_cost_inr, created_at')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!cancelled) setRecentCosts(rCosts || []);

        const { data: rConvs } = await supabase
          .from('conversations')
          .select('id, session_id, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
        if (!cancelled) setRecentConvs(rConvs || []);

        const batches = await Promise.all(
          (rConvs || []).map(async (c) => {
            const { data: msgs } = await supabase
              .from('messages')
              .select('id, conversation_id, role, model, content, created_at')
              .eq('conversation_id', c.id)
              .order('created_at', { ascending: true })
              .limit(8);
            return { conv: c, msgs: msgs || [] };
          })
        );
        if (!cancelled) setMessageBatches(batches || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, "Helvetica Neue", Arial' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>StudySahara — Admin Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: 20 }}>Messages, costs, and recent conversations</p>

      {loading && (
        <div style={{ marginBottom: 16, color: '#6b7280' }}>Loading…</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Conversations" value={convCount ?? 0} />
        <StatCard label="Total Messages" value={msgCount ?? 0} />
        <StatCard label="Total Cost (INR)" value={formatINR(totalINR)} />
        <StatCard label="Total Cost (USD)" value={`$${(totalUSD || 0).toFixed(4)}`} />
      </div>

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
          <div style={{ color: '#6b7280' }}>No conversations found.</div>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Recent Cost Logs</h2>
          <a href="/api/admin/cost-csv" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'underline' }}>Export CSV</a>
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
                <tr><Td colSpan={anyTokensPresent ? 8 : 5} style={{ color: '#6b7280' }}>No cost logs yet.</Td></tr>
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
  return <td colSpan={colSpan} style={{ padding: '8px', fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' : undefined }}>{children}</td>;
}