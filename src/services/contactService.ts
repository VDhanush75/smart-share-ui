import { supabase } from "@/lib/supabase";

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

export async function sendContactMessage(payload: ContactPayload): Promise<ContactResult> {
  const { data, error } = await supabase.functions.invoke("contact-form", {
    body: payload,
  });

  if (error) {
    // Try to extract server-provided message from the error context
    let serverMessage: string | undefined;
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body && typeof body.message === "string") serverMessage = body.message;
      }
    } catch {
      // ignore parse failures
    }
    throw new Error(serverMessage ?? error.message ?? "Failed to send message");
  }

  if (!data || data.success !== true) {
    throw new Error(data?.message ?? "Failed to send message");
  }

  return {
    success: true,
    message: data.message ?? "Message sent successfully.",
  };
}
