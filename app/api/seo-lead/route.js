import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validate(p) {
  const e = [];
  for (const k of ["name", "phone", "email", "intakeMonth", "intakeYear"]) {
    if (!p?.[k]) e.push(`${k} is required`);
  }
  if (p?.email && !/^\S+@\S+\.\S+$/.test(p.email)) e.push("email is invalid");
  return e;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const errors = validate(body);
    if (errors.length) return NextResponse.json({ ok:false, errors }, { status:400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE || "";
    if (!url || !serviceRole) {
      return NextResponse.json({ ok:false, error:"env_missing" }, { status:500 });
    }

    // Capture referer & UTM from request
    const headers = req.headers;
    const referer = headers.get("referer") || null;
    const { searchParams, pathname } = new URL(referer || "http://local/");
    const utm = {};
    for (const key of ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"]) {
      const v = searchParams.get(key); if (v) utm[key] = v;
    }

    const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });

    const { name, phone, email, intakeMonth, intakeYear, pageKey, sourcePath, sourceUrl } = body;

    const { data, error } = await supabase
      .from("seo_pages_lead")
      .insert({
        name,
        phone,
        email,
        intake_month: body.intakeMonth,
        intake_year: Number(intakeYear),
        page_key: pageKey || null,
        source_path: sourcePath || pathname || null,
        source_url: sourceUrl || referer || null,
        utm: Object.keys(utm).length ? utm : null,
      })
      .select("id, created_at")
      .single();

    if (error) {
      return NextResponse.json(
        process.env.NODE_ENV === "production"
          ? { ok:false, error:"db_insert_failed" }
          : { ok:false, error:"db_insert_failed", details:error.message },
        { status:500 }
      );
    }

    return NextResponse.json({ ok:true, id:data.id, created_at:data.created_at });
  } catch (err) {
    return NextResponse.json(
      process.env.NODE_ENV === "production"
        ? { ok:false, error:"bad_request" }
        : { ok:false, error:"bad_request", details:String(err) },
      { status:400 }
    );
  }
}