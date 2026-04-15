export default function ImprintPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px 20px 72px",
        margin: 0,
        background:
          "radial-gradient(circle at top, rgba(82, 82, 91, 0.16), transparent 36%), #09090b",
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 620,
          borderRadius: 24,
          padding: "28px 24px",
          background:
            "linear-gradient(180deg, rgba(39, 39, 42, 0.92), rgba(24, 24, 27, 0.94))",
          border: "1px solid rgba(244, 244, 245, 0.07)",
          boxShadow:
            "0 18px 50px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(14px)",
          display: "grid",
          gap: 22,
          color: "#e4e4e7"
        }}
      >
        <div style={{ display: "grid", gap: 10 }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(244, 244, 245, 0.52)"
            }}
          >
            CortexRate
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.06,
              letterSpacing: "-0.03em",
              color: "#fafafa"
            }}
          >
            Impressum
          </h1>
        </div>

        <div style={{ display: "grid", gap: 16, lineHeight: 1.7, fontSize: 16 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <p style={{ margin: 0, color: "#fafafa", fontWeight: 600 }}>Angaben gemäß § 5 DDG</p>
            <p style={{ margin: 0 }}>
              Christoph Rödiger
              <br />
              Brandstraße 7
              <br />
              53721 Siegburg
              <br />
              Deutschland
            </p>
            <p style={{ margin: 0 }}>
              E-Mail:{" "}
              <a
                href="mailto:kantern.lamellen.3v@icloud.com"
                style={{ color: "#fafafa", textDecoration: "none" }}
              >
                kantern.lamellen.3v@icloud.com
              </a>
            </p>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <p style={{ margin: 0, color: "#fafafa", fontWeight: 600 }}>
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
            </p>
            <p style={{ margin: 0 }}>
              Christoph Rödiger
              <br />
              Brandstraße 7
              <br />
              53721 Siegburg
              <br />
              Deutschland
            </p>
          </div>
        </div>

        <section
          style={{
            display: "grid",
            gap: 20,
            paddingTop: 24,
            borderTop: "1px solid rgba(244, 244, 245, 0.08)"
          }}
        >
          <div style={{ display: "grid", gap: 10 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "#fafafa"
              }}
            >
              Privacy Policy
            </h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "#d4d4d8" }}>
              This Privacy Policy explains how CortexRate collects and uses data.
            </p>
          </div>

          <section style={{ display: "grid", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 20, color: "#fafafa" }}>Data we collect</h3>
            <ul style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 8, lineHeight: 1.7 }}>
              <li>Email address (for account creation and login)</li>
              <li>Ratings and optional notes you submit</li>
            </ul>
          </section>

          <section style={{ display: "grid", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 20, color: "#fafafa" }}>How we use data</h3>
            <ul style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 8, lineHeight: 1.7 }}>
              <li>To authenticate users</li>
              <li>To display and store ratings</li>
              <li>To improve the product</li>
            </ul>
          </section>

          <section style={{ display: "grid", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 20, color: "#fafafa" }}>Data sharing</h3>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "#d4d4d8" }}>
              We do not sell or share your personal data with third parties.
            </p>
          </section>

          <section style={{ display: "grid", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 20, color: "#fafafa" }}>Storage</h3>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "#d4d4d8" }}>
              Data is securely stored using Supabase.
            </p>
          </section>

          <section style={{ display: "grid", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 20, color: "#fafafa" }}>Contact</h3>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "#d4d4d8" }}>
              For questions, contact:{" "}
              <a
                href="mailto:kantern.lamellen.3v@icloud.com"
                style={{ color: "#fafafa", textDecoration: "none" }}
              >
                kantern.lamellen.3v@icloud.com
              </a>
            </p>
          </section>
        </section>
      </section>
    </main>
  );
}
