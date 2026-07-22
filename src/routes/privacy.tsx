import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/smartshare/LegalLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SmartShare" },
      {
        name: "description",
        content:
          "How SmartShare collects, stores, and protects your data when sharing files, text, and code across devices.",
      },
      { property: "og:title", content: "Privacy Policy — SmartShare" },
      {
        property: "og:description",
        content: "Learn how SmartShare handles your data, cookies, retention, and third-party services.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Your privacy matters. This policy explains what SmartShare collects and how it is used."
      updated="July 22, 2026"
    >
      <LegalSection title="Introduction">
        <p>
          SmartShare ("we", "our", or "us") provides a service that lets users share files, text, and
          code snippets across devices using short share codes and QR codes. This Privacy Policy
          explains what information we collect, how we use it, and the choices you have.
        </p>
      </LegalSection>

      <LegalSection title="Information We Collect">
        <p>We collect the minimum information required to operate the service:</p>
        <ul>
          <li>Files, text content, and code snippets you choose to upload.</li>
          <li>Auto-generated share codes and resource metadata (file name, size, type, timestamps).</li>
          <li>Basic technical logs such as request timing and error diagnostics.</li>
          <li>Aggregate view and download counts for each shared resource.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Anonymous File Sharing">
        <p>
          SmartShare does not require account creation to upload or open shared files. We do not
          associate uploads with personal identity. Anyone who has your share code or link can access
          the resource until it expires.
        </p>
      </LegalSection>

      <LegalSection title="Text & Code Sharing">
        <p>
          Text and code snippets are stored as database records rather than files. They are treated
          the same way as file uploads and are subject to the same expiration policy. Please avoid
          sharing secrets, credentials, or personal data through public snippets.
        </p>
      </LegalSection>

      <LegalSection title="Analytics">
        <p>
          We collect aggregate usage metrics — such as total uploads, active resources, view counts,
          and download counts — to help us understand how the product is used and to improve
          reliability. These metrics are not linked to individual identities.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          SmartShare uses only essential cookies required for the service to function, such as
          authentication cookies for administrator sessions. We do not use third-party advertising or
          cross-site tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          Data is transmitted over HTTPS and stored using industry-standard providers. Access to
          storage buckets and databases is restricted through row-level security and administrative
          authentication. Despite these measures, no system is completely secure — please avoid
          sharing highly sensitive information.
        </p>
      </LegalSection>

      <LegalSection title="Data Retention">
        <p>
          Shared resources are automatically deleted after their expiration period (24 hours by
          default). Expired files are removed from storage and their metadata is purged from the
          database by our scheduled cleanup process. Administrators may delete resources earlier at
          any time.
        </p>
      </LegalSection>

      <LegalSection title="Third Party Services">
        <p>SmartShare relies on the following third-party providers:</p>
        <ul>
          <li>
            <strong>Supabase</strong> — hosts our database, authentication, and object storage.
          </li>
          <li>
            <strong>Resend</strong> — delivers transactional emails such as contact form messages.
          </li>
        </ul>
        <p>
          These providers process data on our behalf under their respective privacy policies and data
          processing agreements.
        </p>
      </LegalSection>

      <LegalSection title="User Rights">
        <p>
          Because SmartShare is anonymous by design, we typically do not hold personal data linked to
          you. If you believe a resource contains your personal data or infringes your rights, you
          may request deletion by contacting us through the Contact page.
        </p>
      </LegalSection>

      <LegalSection title="Changes to Policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected by
          updating the "Last updated" date at the top of this page. Continued use of the service
          after changes indicates acceptance of the revised policy.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this Privacy Policy? Reach out through our{" "}
          <a href="/contact">Contact page</a> and we'll respond as soon as possible.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
