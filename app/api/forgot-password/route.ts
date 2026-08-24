import { NextResponse } from "next/server";
import { isValidUsername, normalizeUsername, toInternalEmail } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { createSupabaseAdmin, getSiteUrl } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  let body: { username?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  if (!isValidUsername(username)) {
    return NextResponse.json({ ok: false, error: "Invalid username." }, { status: 400 });
  }

  const normalized = normalizeUsername(username);
  const internalEmail = toInternalEmail(normalized);
  const siteUrl = getSiteUrl(request);
  const redirectTo = `${siteUrl}/reset-password`;

  try {
    const supabase = createSupabaseAdmin();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, recovery_email")
      .eq("username", normalized)
      .maybeSingle();

    const recoveryEmail = profile?.recovery_email?.trim().toLowerCase();
    if (!recoveryEmail) {
      return NextResponse.json({ ok: true });
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: internalEmail,
      options: { redirectTo },
    });

    if (linkError || !linkData.properties?.action_link) {
      console.error("generateLink failed:", linkError?.message ?? "missing action_link");
      return NextResponse.json({ ok: true });
    }

    await sendPasswordResetEmail({
      to: recoveryEmail,
      username: normalized,
      resetLink: linkData.properties.action_link,
    });
  } catch (error) {
    console.error("forgot-password error:", error);
  }

  return NextResponse.json({ ok: true });
}
