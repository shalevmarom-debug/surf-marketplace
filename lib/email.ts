type SendPasswordResetEmailParams = {
  to: string;
  username: string;
  resetLink: string;
};

export async function sendPasswordResetEmail({
  to,
  username,
  resetLink,
}: SendPasswordResetEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("Email is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL).");
  }

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

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error (${response.status}): ${body}`);
  }
}
