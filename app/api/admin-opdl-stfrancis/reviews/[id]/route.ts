import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// PATCH /api/admin-opdl-stfrancis/reviews/[id]
// Body: { action: "approve" | "reject" }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check
  const token = req.cookies.get("cr_admin")?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { action: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("reviews")
    .update({ status: action === "approve" ? "approved" : "rejected" })
    .eq("id", id);

  if (error) {
    console.error("Review update error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
