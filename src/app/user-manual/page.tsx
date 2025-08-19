import Link from "next/link";

export default function UserManualPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-display font-bold mb-4">User Manual</h1>
        <p className="text-muted-foreground mb-4">
          This user manual provides practical guidance for using MilAIAssist's
          mission planning features, symbol management, and export options.
        </p>

        <nav className="mb-6">
          <h2 className="text-sm font-semibold mb-2">Contents</h2>
          <ul className="list-disc list-inside text-muted-foreground text-sm">
            <li>
              <a href="#getting-started" className="text-primary underline">
                Getting Started
              </a>
            </li>
            <li>
              <a href="#commands" className="text-primary underline">
                Command Input & Examples
              </a>
            </li>
            <li>
              <a href="#symbols" className="text-primary underline">
                Symbols & Editing
              </a>
            </li>
            <li>
              <a href="#export" className="text-primary underline">
                Exporting & Backups
              </a>
            </li>
            <li>
              <a href="#shortcuts" className="text-primary underline">
                Keyboard Shortcuts
              </a>
            </li>
            <li>
              <a href="#troubleshooting" className="text-primary underline">
                Troubleshooting
              </a>
            </li>
            <li>
              <a href="#contact" className="text-primary underline">
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <section id="getting-started" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <ol className="list-decimal list-inside text-muted-foreground">
            <li>Open the Mission Planner from the site header.</li>
            <li>
              Pan/zoom the map with mouse or touch to your area of interest.
            </li>
            <li>
              Use the command input (bottom) to enter natural language commands.
            </li>
            <li>
              Select placed symbols to edit properties, or open the symbol list
              to manage them in bulk.
            </li>
          </ol>
        </section>

        <section id="commands" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Command Input & Examples
          </h2>
          <p className="text-muted-foreground">
            Commands are free-text. Examples:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground">
            <li>"Friendly infantry company 'Raptors' at 33.72, 73.09"</li>
            <li>
              "Damaged hostile armored battalion 'Thunder Run' at 33.68, 73.04"
            </li>
            <li>"Draw an air corridor for an F-16 from Lahore to Delhi"</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            Tips: be explicit with unit names and coordinates for best results.
          </p>
        </section>

        <section id="symbols" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Symbols & Editing</h2>
          <p className="text-muted-foreground">
            Use the map directly to interact with symbols:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground">
            <li>
              Click a symbol to open the editor and change label, echelon, or
              modifiers.
            </li>
            <li>Drag symbols (if enabled) to reposition.</li>
            <li>
              Use the symbol list to jump to a symbol, edit, or delete it.
            </li>
          </ul>
        </section>

        <section id="export" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Exporting & Backups</h2>
          <p className="text-muted-foreground">
            Export options help archive mission data:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground">
            <li>Export GeoJSON for GIS interoperability.</li>
            <li>Capture image snapshots for briefings.</li>
            <li>
              Secure exported files according to your organization policy.
            </li>
          </ul>
        </section>

        <section id="shortcuts" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Keyboard Shortcuts</h2>
          <p className="text-muted-foreground">
            (If supported by your browser and platform)
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground">
            <li>
              <strong>Space</strong> — Pan when held and dragging (map
              interaction)
            </li>
            <li>
              <strong>Ctrl/Cmd + Z</strong> — Undo (where implemented)
            </li>
          </ul>
        </section>

        <section id="troubleshooting" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Troubleshooting</h2>
          <p className="text-muted-foreground">
            Common issues and quick fixes:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground">
            <li>
              Map tiles not loading — check network connectivity and Mapbox
              token configuration.
            </li>
            <li>
              Commands failing — ensure input uses coordinates or precise unit
              descriptors; check server logs for AI errors.
            </li>
            <li>
              Unable to save/export — confirm your account permissions and
              storage backend availability.
            </li>
          </ul>
        </section>

        <section id="contact" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p className="text-muted-foreground">
            For help, contact your system administrator or the platform support
            channel.
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
