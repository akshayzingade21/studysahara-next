// app/api/leads-canada/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Simple validator
function validate(payload) {
  const errors = [];
  const required = ["name", "phone", "email", "intakeMonth", "intakeYear"];
  for (const k of required) if (!payload?.[k]) errors.push(`${k} is required`);

  if (payload?.email && !/^\S+@\S+\.\S+$/.test(payload.email)) errors.push("email is invalid");
  if (payload?.intakeYear && String(payload.intakeYear).length !== 4) errors.push("intakeYear must be YYYY");

  return errors;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const errors = validate(body);
    if (errors.length) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    const { name, phone, email, intakeMonth, intakeYear } = body;

    const { data, error } = await supabaseAdmin
      .from("leads_canada_nocollateral")
      .insert({
        name,
        phone,
        email,
        intake_month: intakeMonth,
        intake_year: Number(intakeYear),
        source_page: "education-loan-canada-no-collateral",
        // utm: body.utm || null, // if you send UTM later
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ ok: false, error: "db_insert_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id, created_at: data.created_at });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
}