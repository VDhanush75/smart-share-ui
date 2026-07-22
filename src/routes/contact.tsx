import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare, Clock } from "lucide-react";
import { Logo } from "@/components/smartshare/Logo";
import { SiteFooter } from "@/components/smartshare/SiteFooter";
import { ContactForm } from "@/components/smartshare/ContactForm";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — SmartShare" },
      {
        name: "description",
        content:
          "Get in touch with the SmartShare team. Send questions, feedback, or report an issue through our contact form.",
      },
      { property: "og:title", content: "Contact Us — SmartShare" },
      {
        property: "og:description",
        content: "Reach the SmartShare team through our contact form. We respond as quickly as we can.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Contact Us</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            Have a question, feedback, or need help with SmartShare? Fill out the form and we'll get
            back to you as soon as possible.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <ContactForm />
          </div>

          <aside className="space-y-4">
            <InfoCard
              icon={<MessageSquare className="h-5 w-5" />}
              title="General Inquiries"
              description="Questions about how SmartShare works, features, or partnerships."
            />
            <InfoCard
              icon={<Mail className="h-5 w-5" />}
              title="Support"
              description="Trouble uploading, sharing, or viewing a resource? We're here to help."
            />
            <InfoCard
              icon={<Clock className="h-5 w-5" />}
              title="Response Time"
              description="We aim to respond within 1–2 business days."
            />
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
