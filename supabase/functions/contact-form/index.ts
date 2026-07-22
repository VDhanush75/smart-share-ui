// Contact form edge function — sends email via Resend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return json({ success: false, message: "Method not allowed" }, 405);
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const CONTACT_EMAIL = Deno.env.get("CONTACT_EMAIL");
  if (!RESEND_API_KEY || !CONTACT_EMAIL) {
    console.error("Missing RESEND_API_KEY or CONTACT_EMAIL");
    return json({ success: false, message: "Email service is not configured." }, 500);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, message: "Invalid JSON payload" }, 400);
  }

  const fullName = String(payload.fullName ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const subject = String(payload.subject ?? "").trim();
  const message = String(payload.message ?? "").trim();

  if (!fullName || !email || !subject || !message) {
    return json({ success: false, message: "All fields are required." }, 400);
  }
  if (fullName.length > 100 || subject.length > 150 || email.length > 255 || message.length > 5000) {
    return json({ success: false, message: "One or more fields exceed the allowed length." }, 400);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ success: false, message: "Invalid email address." }, 400);
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const submittedAt = new Date().toISOString();

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;color:#111;">
      <h2 style="margin:0 0 16px;">New SmartShare Contact Message</h2>
      <table cellpadding="6" style="border-collapse:collapse;">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(fullName)}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
        <tr><td><strong>Subject</strong></td><td>${escapeHtml(subject)}</td></tr>
        <tr><td><strong>Submitted</strong></td><td>${escapeHtml(submittedAt)}</td></tr>
        <tr><td><strong>IP Address</strong></td><td>${escapeHtml(ip)}</td></tr>
      </table>
      <h3 style="margin:20px 0 8px;">Message</h3>
      <div style="white-space:pre-wrap;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">${escapeHtml(
        message,
      )}</div>
    </div>
  `;

  const text = [
    `New SmartShare Contact Message`,
    ``,
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    `Submitted: ${submittedAt}`,
    `IP Address: ${ip}`,
    ``,
    `Message:`,
    message,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SmartShare Contact <onboarding@resend.dev>",
        to: [CONTACT_EMAIL],
        reply_to: email,
        subject: `[SmartShare Contact] ${subject}`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error", res.status, errText);
      return json(
        { success: false, message: "Failed to send email. Please try again later." },
        502,
      );
    }

    return json({ success: true, message: "Message sent successfully." });
  } catch (err) {
    console.error("Contact function error", err);
    return json({ success: false, message: "Unexpected error sending email." }, 500);
  }
});
