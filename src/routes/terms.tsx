import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/smartshare/LegalLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — SmartShare" },
      {
        name: "description",
        content:
          "The rules and conditions that apply when using SmartShare to share files, text, and code across devices.",
      },
      { property: "og:title", content: "Terms & Conditions — SmartShare" },
      {
        property: "og:description",
        content: "Read the acceptable use policy, disclaimers, and liability terms for SmartShare.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using SmartShare."
      updated="July 22, 2026"
    >
      <LegalSection title="Acceptance">
        <p>
          By accessing or using SmartShare, you agree to be bound by these Terms & Conditions. If you
          do not agree with any part of these terms, please do not use the service.
        </p>
      </LegalSection>

      <LegalSection title="Anonymous Usage">
        <p>
          SmartShare does not require account registration for uploading or viewing shared resources.
          You are responsible for the safe handling of the share codes and links you generate, since
          anyone in possession of them may access the associated content.
        </p>
      </LegalSection>

      <LegalSection title="User Responsibilities">
        <ul>
          <li>Only upload content you have the right to share.</li>
          <li>Do not upload sensitive personal data, credentials, or confidential information.</li>
          <li>Comply with all applicable laws and regulations in your jurisdiction.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Prohibited Content">
        <p>You agree not to use SmartShare to upload, host, or distribute:</p>
        <ul>
          <li>Malware, viruses, or otherwise harmful executable code.</li>
          <li>Illegal, defamatory, harassing, or hateful material.</li>
          <li>Sexually explicit content involving minors or non-consensual imagery.</li>
          <li>Content that infringes intellectual property rights.</li>
          <li>Phishing pages, scams, or fraudulent material.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Copyright">
        <p>
          You retain ownership of the content you upload. By uploading content, you grant SmartShare
          a limited right to host and deliver that content solely to enable the sharing service. If
          you believe your copyright has been infringed by content on SmartShare, contact us with the
          share code and details of the alleged infringement.
        </p>
      </LegalSection>

      <LegalSection title="File Expiration">
        <p>
          All shared resources have a limited lifetime (24 hours by default). After expiration,
          resources are deleted automatically and cannot be recovered. Do not rely on SmartShare as a
          long-term storage solution.
        </p>
      </LegalSection>

      <LegalSection title="Abuse Prevention">
        <p>
          We reserve the right to remove any resource and to block access from users that violate
          these terms, without prior notice. Automated abuse detection, rate limits, and manual
          moderation may be applied to protect the service and its users.
        </p>
      </LegalSection>

      <LegalSection title="Service Availability">
        <p>
          SmartShare is provided on an "as available" basis. We may modify, suspend, or discontinue
          all or part of the service at any time, with or without notice. Planned maintenance or
          incidents may cause temporary interruptions.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer">
        <p>
          The service is provided "as is" and "as available" without warranties of any kind, either
          express or implied, including but not limited to warranties of merchantability, fitness for
          a particular purpose, or non-infringement.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of Liability">
        <p>
          To the maximum extent permitted by law, SmartShare and its operators shall not be liable
          for any indirect, incidental, special, consequential, or punitive damages arising from your
          use of, or inability to use, the service — including loss of data, revenue, or goodwill.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update these Terms from time to time. When we do, we will revise the "Last updated"
          date. Your continued use of SmartShare after any changes constitutes acceptance of the
          updated Terms.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
