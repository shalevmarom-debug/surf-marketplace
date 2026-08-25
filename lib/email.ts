type SendPasswordResetEmailParams = {
  to: string;
  username: string;
  resetLink: string;
};

type SendReportNotificationParams = {
  to: string;
  listingTitle: string;
  listingId: string;
  listingUrl: string;
  reason: string;
  reporterLabel: string;
  ownerLabel: string;
};

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("Email is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL).");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error (${response.status}): ${body}`);
  }
}

export async function sendPasswordResetEmail({
  to,
  username,
  resetLink,
}: SendPasswordResetEmailParams): Promise<void> {
  const subject = "Reset your Surf Marketplace password";
  const html = `
    <div style="font-family: sans-serif; line-height: 1.5; color: #111;">
      <p>Hi,</p>
      <p>We received a request to reset the password for <strong>@${username}</strong>.</p>
      <p><a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;">Reset password</a></p>
      <p>Or copy this link:</p>
      <p style="word-break:break-all;">${resetLink}</p>
      <p style="color:#666;font-size:14px;">If you did not request this, you can ignore this email.</p>
    </div>
  `;
  await sendEmail(to, subject, html);
}

export async function sendReportNotificationEmail({
  to,
  listingTitle,
  listingId,
  listingUrl,
  reason,
  reporterLabel,
  ownerLabel,
}: SendReportNotificationParams): Promise<void> {
  const subject = `[Surf Marketplace] Listing reported: ${listingTitle}`;
  const html = `
    <div style="font-family: sans-serif; line-height: 1.5; color: #111;">
      <h2 style="margin:0 0 12px;">New listing report</h2>
      <p><strong>Listing:</strong> ${listingTitle}</p>
      <p><strong>Listing ID:</strong> ${listingId}</p>
      <p><strong>Owner:</strong> ${ownerLabel}</p>
      <p><strong>Reporter:</strong> ${reporterLabel}</p>
      <p><strong>Reason:</strong></p>
      <p style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px;">${reason}</p>
      <p><a href="${listingUrl}" style="display:inline-block;padding:10px 16px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;">View listing</a></p>
      <p><a href="${listingUrl.replace(/\/listing\/[^/]+$/, "/admin")}">Open admin panel</a></p>
    </div>
  `;
  await sendEmail(to, subject, html);
}
