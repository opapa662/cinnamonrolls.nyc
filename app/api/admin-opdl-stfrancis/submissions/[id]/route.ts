import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (req.cookies.get("cr_admin")?.value !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await req.json();

  if (action === "create_draft") {
    const { data: sub, error: fetchErr } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchErr || !sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    const notes = [sub.comments, sub.address ? `Address: ${sub.address}` : null]
      .filter(Boolean)
      .join("\n") || null;

    const { error: insertErr } = await supabaseAdmin.from("locations").insert({
      name: sub.name ?? "Unnamed",
      latitude: 0,
      longitude: 0,
      visible: false,
      status: "open",
      website: sub.website ?? null,
      notes,
    });
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    const { error: updateErr } = await supabaseAdmin
      .from("submissions")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    const { error } = await supabaseAdmin
      .from("submissions")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "dismiss") {
    const { error } = await supabaseAdmin
      .from("submissions")
      .update({ dismissed: true })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
