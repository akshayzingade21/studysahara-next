// app/api/reports/lenders/route.js
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

    // All lead_lenders rows
    const { data: ll, error: eLL } = await supabase
      .from("lead_lenders")
      .select("lead_id,lender_id,stage,login_id,location,rm_name,rm_phone,dates,sanction");
    if (eLL) throw eLL;

    // Fetch leads and lenders for names
    const leadIds = [...new Set((ll || []).map((x) => x.lead_id))];
    const lenderIds = [...new Set((ll || []).map((x) => x.lender_id))];

    const [{ data: leads }, { data: lenders }] = await Promise.all([
      leadIds.length
        ? supabase.from("leads").select("id,name,phone,email").in("id", leadIds)
        : Promise.resolve({ data: [] }),
      lenderIds.length
        ? supabase.from("lenders").select("id,name,code").in("id", lenderIds)
        : Promise.resolve({ data: [] }),
    ]);

    const leadById = Object.fromEntries((leads || []).map((x) => [x.id, x]));
    const lenderById = Object.fromEntries((lenders || []).map((x) => [x.id, x]));

    const headers = [
      "lead_id",
      "lead_name",
      "phone",
      "email",
      "lender",
      "stage",
      "login_id",
      "location",
      "rm_name",
      "rm_phone",
      "login_date",
      "sanction_date",
      "sanction_amount",
      "sanction_rate",
      "processing_fees",
      "pf_paid_date",
      "expected_disb_date",
      "disbursed_date",
      "sanction_conditions",
    ];
    const lines = [headers.join(",")];

    for (const x of ll || []) {
      const L = leadById[x.lead_id] || {};
      const R = lenderById[x.lender_id] || {};
      lines.push(
        [
          csv(x.lead_id),
          csv(L.name || ""),
          csv(L.phone || ""),
          csv(L.email || ""),
          csv(R.name || R.code || ""),
          csv(x.stage || ""),
          csv(x.login_id || ""),
          csv(x.location || ""),
          csv(x.rm_name || ""),
          csv(x.rm_phone || ""),
          csv(x.dates?.login || ""),
          csv(x.sanction?.date || ""),
          csv(x.sanction?.amount ?? ""),
          csv(x.sanction?.rate ?? ""),
          csv(x.sanction?.processing_fees ?? ""),
          csv(x.dates?.pf_paid || ""),
          csv(x.dates?.expected_disb || ""),
          csv(x.dates?.disbursed || ""),
          csv(x.sanction?.conditions || ""),
        ].join(",")
      );
    }

    const body = lines.join("\n");
    return new Response(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="lender-report.csv"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    return new Response(`Failed: ${err.message || String(err)}`, { status: 500 });
  }
}