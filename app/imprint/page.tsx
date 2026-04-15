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
      </section>
    </main>
  );
}
