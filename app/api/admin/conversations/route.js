// app/api/admin/conversations/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
    : null;

export async function GET(req) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversation_id');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

  try {
    if (conversationId) {
      // DETAIL MODE: all messages of this conversation
      const { data: conv, error: convErr } = await supabase
        .from('conversations')
        .select('id, session_id, created_at, last_model, meta')
        .eq('id', conversationId)
        .single();
      if (convErr) throw convErr;

      const { data: msgs, error: msgErr } = await supabase
        .from('messages')
        .select('id, role, content, model, prompt_tokens, completion_tokens, total_tokens, cost_usd, cost_inr, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (msgErr) throw msgErr;

      // Totals
      const totals = msgs.reduce(
        (acc, m) => {
          acc.tokens += m.total_tokens || 0;
          acc.usd += Number(m.cost_usd || 0);
          acc.inr += Number(m.cost_inr || 0);
          return acc;
        },
        { tokens: 0, usd: 0, inr: 0 }
      );

      return NextResponse.json({ conversation: conv, messages: msgs, totals });
    }

    // LIST MODE: latest conversations
    const { data: convs, error: convsErr } = await supabase
      .from('conversations')
      .select('id, session_id, created_at, last_model, meta')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (convsErr) throw convsErr;

    // Fetch messages for these conversations in one go
    const ids = convs.map(c => c.id);
    if (ids.length === 0) return NextResponse.json({ conversations: [], rows: [] });

    const { data: msgs, error: msgsErr } = await supabase
      .from('messages')
      .select('conversation_id, cost_usd, cost_inr, total_tokens, created_at')
      .in('conversation_id', ids);
    if (msgsErr) throw msgsErr;

    // Aggregate
    const byConv = {};
    msgs.forEach(m => {
      const k = m.conversation_id;
      if (!byConv[k]) byConv[k] = { tokens: 0, usd: 0, inr: 0, lastAt: m.created_at };
      byConv[k].tokens += m.total_tokens || 0;
      byConv[k].usd += Number(m.cost_usd || 0);
      byConv[k].inr += Number(m.cost_inr || 0);
      if (new Date(m.created_at) > new Date(byConv[k].lastAt)) byConv[k].lastAt = m.created_at;
    });

    const rows = convs.map(c => ({
      id: c.id,
      session_id: c.session_id,
      created_at: c.created_at,
      last_model: c.last_model,
      last_activity: byConv[c.id]?.lastAt || c.created_at,
      total_tokens: byConv[c.id]?.tokens || 0,
      total_cost_usd: +(byConv[c.id]?.usd || 0).toFixed(6),
      total_cost_inr: +(byConv[c.id]?.inr || 0).toFixed(2),
      meta: c.meta || null
    }));

    return NextResponse.json({ conversations: rows });
  } catch (e) {
    console.error('Admin API error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}