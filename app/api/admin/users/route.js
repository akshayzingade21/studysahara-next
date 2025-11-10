// app/api/admin/users/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const sb = admin();

    // user_roles contains the role; auth.users contains the email
    const { data: roles, error: e1 } = await sb
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "manager");
    if (e1) throw e1;

    const ids = roles.map(r => r.user_id);
    if (!ids.length) return NextResponse.json([]);

    // Fetch emails from auth schema using service role
    const { data: users, error: e2 } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (e2) throw e2;

    const byId = new Map(users.users.map(u => [u.id, u]));
    const out = roles
      .map(r => {
        const u = byId.get(r.user_id);
        return u ? { id: u.id, email: u.email, role: r.role } : null;
      })
      .filter(Boolean);

    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}