// app/api/admin/bulk/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function addHistory(sb, leadIds, fromToPairs, reason = null) {
  if (!leadIds.length || !fromToPairs?.size) return;
  const rows = [];
  for (const lead_id of leadIds) {
    const p = fromToPairs.get(lead_id);
    if (!p) continue;
    rows.push({ lead_id, from_stage: p.from, to_stage: p.to, reason });
  }
  if (rows.length) await sb.from("lead_stage_history").insert(rows);
}

export async function POST(req) {
  try {
    const sb = adminClient();
    const { action, leadIds = [], payload = {} } = await req.json();
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ ok: false, error: "No leadIds provided" }, { status: 400 });
    }

    // fetch current stages
    const { data: leads, error: eLeads } = await sb
      .from("leads")
      .select("id, stage")
      .in("id", leadIds);
    if (eLeads) throw eLeads;
    const stageMap = new Map(leads.map(l => [l.id, l.stage || null]));

    if (action === "purge_notes") {
      const { error } = await sb.from("notes").delete().in("lead_id", leadIds);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "purge_followups") {
      const { error } = await sb.from("followups").delete().in("lead_id", leadIds);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "set_stage") {
      const target = payload?.stage;
      if (!target) return NextResponse.json({ ok: false, error: "Missing payload.stage" }, { status: 400 });
      const pairs = new Map(leadIds.map(id => [id, { from: stageMap.get(id), to: target }]));
      const { error } = await sb.from("leads").update({ stage: target }).in("id", leadIds);
      if (error) throw error;
      await addHistory(sb, leadIds, pairs, `Admin set stage -> ${target}`);
      return NextResponse.json({ ok: true });
    }

    if (action === "reassign_manager") {
      const managerId = payload?.manager_id;
      if (!managerId) return NextResponse.json({ ok: false, error: "Missing payload.manager_id" }, { status: 400 });
      const { error } = await sb.from("leads").update({ assigned_to: managerId }).in("id", leadIds);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "close_lost" || action === "close_disbursed") {
      const target = action === "close_lost" ? "lost" : "disbursed";
      const pairs = new Map(leadIds.map(id => [id, { from: stageMap.get(id), to: target }]));
      const { error } = await sb.from("leads").update({ stage: target }).in("id", leadIds);
      if (error) throw error;
      await addHistory(sb, leadIds, pairs, `Admin closed as ${target}`);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}