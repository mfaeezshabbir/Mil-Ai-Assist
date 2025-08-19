import Link from "next/link";

export default function SecurityPolicyPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-display font-bold mb-4">
          Security Policy
        </h1>
        <p className="text-muted-foreground mb-4">
          This Security Policy outlines how MilAIAssist protects mission data,
          enforces access controls, and handles incidents. It is intended for
          system administrators, operators, and auditors.
        </p>

        {/* Table of contents */}
        <nav className="mb-6">
          <h2 className="text-sm font-semibold mb-2">Contents</h2>
          <ul className="list-disc list-inside text-muted-foreground text-sm">
            <li>
              <a href="#classification" className="text-primary underline">
                Data Classification & Handling
              </a>
            </li>
            <li>
              <a href="#retention" className="text-primary underline">
                Retention & Export
              </a>
            </li>
            <li>
              <a href="#encryption" className="text-primary underline">
                Encryption & Transport Security
              </a>
            </li>
            <li>
              <a href="#access" className="text-primary underline">
                Authentication & Access Control
              </a>
            </li>
            <li>
              <a href="#incidents" className="text-primary underline">
                Incident Reporting
              </a>
            </li>
            <li>
              <a href="#contact" className="text-primary underline">
                Contact & Revisions
              </a>
            </li>
          </ul>
        </nav>

        <section id="classification" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Data Classification & Handling
          </h2>
          <p className="text-muted-foreground">
            Data created or imported into MilAIAssist may be unclassified,
            sensitive, or classified depending on the operational context. Treat
            all operational mission data as sensitive by default.
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground">
            <li>
              Do not upload classified data to public or third-party services
              without authorization.
            </li>
            <li>Limit exports and sharing to authorized personnel.</li>
            <li>
              Use ephemeral sessions for transient exercises where possible.
            </li>
          </ul>
        </section>

        <section id="retention" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Retention & Export</h2>
          <p className="text-muted-foreground">
            Define retention schedules according to your organizational policy.
            MilAIAssist provides simple export options (GeoJSON, image
            snapshots) for offline archival; ensure exported files are handled
            securely.
          </p>
        </section>

        <section id="encryption" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Encryption & Transport Security
          </h2>
          <p className="text-muted-foreground">
            All network communications should use TLS. Sensitive data at rest
            should be encrypted by the hosting platform. Use
            organization-managed keys where available.
          </p>
        </section>

        <section id="access" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Authentication & Access Control
          </h2>
          <p className="text-muted-foreground">
            Follow the principle of least privilege. Maintain role-based access
            controls and consider multifactor authentication for all operator
            accounts. Log all administrative actions and review periodically.
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground">
            <li>Use unique operator accounts; avoid shared credentials.</li>
            <li>
              Disable or remove accounts promptly when access is no longer
              required.
            </li>
            <li>
              Use centralized identity providers (SAML/OAuth) if available.
            </li>
          </ul>
        </section>

        <section id="incidents" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Incident Reporting</h2>
          <p className="text-muted-foreground">
            If you suspect a security incident, preserve evidence and notify
            your security operations center immediately. Include:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground">
            <li>Time and date of event</li>
            <li>Accounts involved</li>
            <li>Any exported files or suspicious network destinations</li>
          </ul>
        </section>

        <section id="contact" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Contact & Revisions</h2>
          <p className="text-muted-foreground">
            For security questions or to report incidents, contact your local
            security office. This document was last revised on
            <strong> {new Date().toLocaleDateString()}</strong>.
          </p>
          <p className="text-muted-foreground mt-2">
            Revision history and audit logs are maintained by the platform
            administrator.
          </p>
        </section>

        <div className="mt-8">
          <Link href="/" className="text-primary underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
