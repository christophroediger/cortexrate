import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px 20px 40px",
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
          maxWidth: 560,
          borderRadius: 24,
          padding: "28px 24px",
          background:
            "linear-gradient(180deg, rgba(39, 39, 42, 0.92), rgba(24, 24, 27, 0.94))",
          border: "1px solid rgba(244, 244, 245, 0.07)",
          boxShadow:
            "0 18px 50px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(14px)",
          display: "grid",
          gap: 18
        }}
      >
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

        <div style={{ display: "grid", gap: 10 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 38,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#fafafa"
            }}
          >
            Rate presets and captures
          </h1>
          <p style={{ margin: 0, color: "#a1a1aa", fontSize: 16, lineHeight: 1.55 }}>
            Quickly see what sounds good. Leave your own rating in seconds.
          </p>
        </div>

        <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 18px",
              borderRadius: 999,
              backgroundColor: "#fafafa",
              color: "#18181b",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            Log in to rate
          </Link>

          <Link
            href="/signup"
            style={{
              color: "#a1a1aa",
              fontSize: 14,
              textDecoration: "none"
            }}
          >
            New here? Sign up
          </Link>
        </div>
      </section>
    </main>
  );
}
