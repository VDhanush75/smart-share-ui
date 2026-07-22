export interface ContactPayload {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResult {
  success: boolean;
  message: string;
}

/**
 * Placeholder contact service.
 *
 * This abstraction is intentionally decoupled from the transport so it can be
 * swapped for a Supabase Edge Function that dispatches email through Resend
 * without any UI changes. Do NOT call Resend directly from the browser and do
 * NOT hardcode API keys here.
 *
 * Future implementation:
 *   const { data, error } = await supabase.functions.invoke("send-contact-email", { body: payload });
 */
export async function sendContactMessage(payload: ContactPayload): Promise<ContactResult> {
  // Simulate network latency for realistic UX feedback.
  await new Promise((resolve) => setTimeout(resolve, 700));

  // In a real implementation, errors from the edge function would throw.
  if (!payload.email || !payload.message) {
    throw new Error("Invalid contact payload");
  }

  return {
    success: true,
    message: "Your message has been received. We'll get back to you shortly.",
  };
}
