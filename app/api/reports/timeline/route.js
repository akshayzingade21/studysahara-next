// app/api/reports/timeline/route.js
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function csv(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const supabase = getServiceClient();

    // Pull timeline sources
    const [{ data: leads }, { data: history }, { data: followups }] = await Promise.all([
      supabase
        .from("leads")
        .select("id,name,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("lead_stage_history")
        .select("lead_id,from_stage,to_stage,changed_at,reason")
        .order("changed_at", { ascending: false }),
      supabase
        .from("followups")
        .select("lead_id,created_at,due_on,outcome,notes")
        .order("created_at", { ascending: false }),
    ]);

    const leadById = Object.fromEntries((leads || []).map((x) => [x.id, x.name]));

    // Build unified timeline rows
    const rows = [];

    // Lead created events
    for (const l of leads || []) {
      rows.push({
        when: l.created_at,
        type: "lead_created",
        lead_id: l.id,
        lead_name: l.name || "",
        details: "",
      });
    }

    // Stage changes
    for (const h of history || []) {
      rows.push({
        when: h.changed_at,
        type: "stage_change",
        lead_id: h.lead_id,
        lead_name: leadById[h.lead_id] || "",
        details: `From ${h.from_stage} → ${h.to_stage}${h.reason ? ` (reason: ${h.reason})` : ""}`,
      });
    }

    // Followups
    for (const f of followups || []) {
      rows.push({
        when: f.created_at,
        type: "followup",
        lead_id: f.lead_id,
        lead_name: leadById[f.lead_id] || "",
        details: `Outcome: ${f.outcome || "-"}; Next: ${f.due_on || "-"}; Notes: ${f.notes || ""}`,
      });
    }

    // Sort newest first
    rows.sort((a, b) => (a.when > b.when ? -1 : a.when < b.when ? 1 : 0));

    const headers = ["timestamp", "type", "lead_id", "lead_name", "details"];
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push([csv(r.when), csv(r.type), csv(r.lead_id), csv(r.lead_name), csv(r.details)].join(","));
    }

    const body = lines.join("\n");
    return new Response(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="timeline-report.csv"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    return new Response(`Failed: ${err.message || String(err)}`, { status: 500 });
  }
}