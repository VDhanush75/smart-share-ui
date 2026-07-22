import { useState } from "react";
import { z } from "zod";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage } from "@/services/contactService";
import { toast } from "sonner";

const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Please enter your full name" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  subject: z
    .string()
    .trim()
    .min(3, { message: "Subject must be at least 3 characters" })
    .max(150, { message: "Subject must be less than 150 characters" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(2000, { message: "Message must be less than 2000 characters" }),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

export function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse({ fullName, email, subject, message });
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const result = await sendContactMessage(parsed.data);
      toast.success(result.message);
      setFullName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="How can we help?"
          aria-invalid={!!errors.subject}
        />
        {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us more about your question or feedback..."
          rows={6}
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
      </div>
      <Button type="submit" size="lg" className="w-full rounded-full sm:w-auto" disabled={submitting}>
        <Send className="mr-2 h-4 w-4" />
        {submitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
