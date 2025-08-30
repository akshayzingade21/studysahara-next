// app/scan/page.js
import Link from "next/link";

export const metadata = {
  title: "Choose where to go | StudySahara",
  description:
    "Continue to StudySahara or start a WhatsApp chat for free education loan guidance.",
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#003087",
};

export default function ScanPage() {
  const blue = "#003087";

  const websiteUrl =
    "https://studysahara.com/?utm_source=qr&utm_medium=pamphlet&utm_campaign=expo2025";
  const whatsappUrl =
  "https://wa.me/919741723972?text=Hi%2C%0AI%20want%20education%20loan%20assistance%20for%20study%20abroad";

  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#F5F7FF",
        // Respect all safe-area edges (iPhone notch / rounded corners)
        padding: `
          max(16px, env(safe-area-inset-top))
          max(16px, env(safe-area-inset-right))
          max(16px, env(safe-area-inset-bottom))
          max(16px, env(safe-area-inset-left))
        `,
        overflowX: "hidden", // prevent any right-side overflow
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 20,
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.04)",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.06)",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <header
          style={{
            background: blue,
            color: "white",
            padding: "20px 18px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.95, letterSpacing: 0.2 }}>
            StudySahara • Education Loan Assistance
          </div>
          <h1
            style={{
              fontSize: 22,
              margin: "6px 0 0",
              lineHeight: 1.25,
              fontWeight: 800,
            }}
          >
            Choose where you want to go
          </h1>
        </header>

        {/* Body */}
        <section style={{ padding: 16 }}>
          <p
            style={{
              margin: "0 0 14px",
              color: "#334155",
              fontSize: 15,
              textAlign: "center",
            }}
          >
            We help students get the right education loan —{" "}
            <strong>100% free</strong> from first call to disbursement.
          </p>

          {/* Extra 4px inner gutter ensures button borders are never clipped */}
          <div style={{ padding: "0 4px" }}>
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "1fr",
              }}
            >
              {/* Visit Website */}
              <Link
                href={websiteUrl}
                prefetch={false}
                aria-label="Visit StudySahara website"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  width: "100%",
                  maxWidth: "100%",
                  padding: "16px 18px",
                  textDecoration: "none",
                  background: "#ffffff",
                  border: `2px solid ${blue}`,
                  color: blue,
                  fontSize: 17,
                  fontWeight: 700,
                  borderRadius: 14,
                  minHeight: 56,
                  boxSizing: "border-box",
                }}
              >
                <span aria-hidden="true">🌐</span>
                Visit Our Website (studysahara.com)
              </Link>

              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  width: "100%",
                  maxWidth: "100%",
                  padding: "16px 18px",
                  textDecoration: "none",
                  background: "#25D366",
                  border: "2px solid #1BB656",
                  color: "white",
                  fontSize: 17,
                  fontWeight: 800,
                  borderRadius: 14,
                  minHeight: 56,
                  boxSizing: "border-box",
                }}
              >
                <span aria-hidden="true">💬</span>
                Chat on WhatsApp (Instant)
              </a>
            </div>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer
          style={{
            padding: "12px 14px",
            background: "#FAFAFA",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            textAlign: "center",
            fontSize: 12,
            color: "#64748B",
          }}
        >
          © {new Date().getFullYear()} StudySahara. All rights reserved.
        </footer>
      </div>
    </main>
  );
}