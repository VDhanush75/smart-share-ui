import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { SiteFooter } from "./SiteFooter";

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  updated?: string;
  children: ReactNode;
}

export function LegalLayout({ title, subtitle, updated, children }: LegalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
          {subtitle && <p className="text-base text-muted-foreground">{subtitle}</p>}
          {updated && (
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Last updated: {updated}
            </p>
          )}
        </div>
        <article className="prose-legal space-y-8 text-[15px] leading-relaxed text-foreground">
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function LegalSection({ title, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{title}</h2>
      <div className="space-y-3 text-muted-foreground [&_a]:text-primary [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
