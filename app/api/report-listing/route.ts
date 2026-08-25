import { NextResponse } from "next/server";
import { getAdminNotificationEmail, getUserIdFromBearer } from "@/lib/admin";
import { sendReportNotificationEmail } from "@/lib/email";
import { createSupabaseAdmin, getSiteUrl } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  let body: { listingId?: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const listingId = typeof body.listingId === "string" ? body.listingId.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  if (!listingId || !reason) {
    return NextResponse.json({ error: "Listing ID and reason are required." }, { status: 400 });
  }

  const reporterId = await getUserIdFromBearer(request);
  const admin = createSupabaseAdmin();

  const { data: listing, error: listingError } = await admin
    .from("listings")
    .select("id, title, user_id")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const { error: insertError } = await admin.from("reports").insert({
    listing_id: listingId,
    reporter_id: reporterId ?? null,
    reason,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const siteUrl = getSiteUrl(request);
  const listingUrl = `${siteUrl}/listing/${listingId}`;

  let reporterLabel = "Anonymous";
  if (reporterId) {
    const { data: reporterProfile } = await admin
      .from("profiles")
      .select("username, first_name, last_name, recovery_email")
      .eq("id", reporterId)
      .maybeSingle();
    const name = [reporterProfile?.first_name, reporterProfile?.last_name].filter(Boolean).join(" ");
    reporterLabel = reporterProfile?.username
      ? `@${reporterProfile.username}${name ? ` (${name})` : ""}${reporterProfile.recovery_email ? ` · ${reporterProfile.recovery_email}` : ""}`
      : reporterId;
  }

  let ownerLabel = listing.user_id;
  const { data: ownerProfile } = await admin
    .from("profiles")
    .select("username, first_name, last_name, recovery_email")
    .eq("id", listing.user_id)
    .maybeSingle();
  if (ownerProfile) {
    const name = [ownerProfile.first_name, ownerProfile.last_name].filter(Boolean).join(" ");
    ownerLabel = ownerProfile.username
      ? `@${ownerProfile.username}${name ? ` (${name})` : ""}${ownerProfile.recovery_email ? ` · ${ownerProfile.recovery_email}` : ""}`
      : listing.user_id;
  }

  try {
    const adminEmail = await getAdminNotificationEmail();
    if (adminEmail) {
      await sendReportNotificationEmail({
        to: adminEmail,
        listingTitle: listing.title,
        listingId: listing.id,
        listingUrl,
        reason,
        reporterLabel,
        ownerLabel,
      });
    } else {
      console.warn("No admin notification email configured; report saved without email.");
    }
  } catch (error) {
    console.error("report notification email failed:", error);
  }

  return NextResponse.json({ ok: true });
}
