import Image from "next/image";

const browserLogos = [
  { src: "/browsers/brave.svg", alt: "Brave browser logo" },
  { src: "/browsers/vivaldi.svg", alt: "Vivaldi browser logo" },
  { src: "/browsers/edge.svg", alt: "Microsoft Edge browser logo" },
  { src: "/browsers/chrome.svg", alt: "Google Chrome browser logo" }
];

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
          maxWidth: 640,
          borderRadius: 24,
          padding: "28px 24px 26px",
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
        <div
          style={{
            width: "fit-content",
            padding: "12px 14px",
            borderRadius: 20,
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(244, 244, 245, 0.06)"
          }}
        >
          <Image
            src="/cortexrate-logo.jpg"
            alt="CortexRate logo"
            width={216}
            height={144}
            priority
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              maxWidth: 216,
              borderRadius: 14
            }}
          />
        </div>

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
              fontSize: 38,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#fafafa"
            }}
          >
            Rate presets. Discover better sounds.
          </h1>
          <p style={{ margin: 0, color: "#a1a1aa", fontSize: 16, lineHeight: 1.55 }}>
            See preset ratings directly on the Neural DSP Cortex Cloud — right on the page.
          </p>
        </div>

        <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
          <a
            href="https://chromewebstore.google.com/detail/cortexrate-mvp/fjjcnhcabdpjobkdcnejcipjcnfkiekj"
            target="_blank"
            rel="noopener noreferrer"
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
            Add to Chrome — Free
          </a>

          <p
            style={{
              margin: 0,
              color: "#a1a1aa",
              fontSize: 14,
              lineHeight: 1.5
            }}
          >
            Free · Works instantly · No signup required
          </p>

          <div
            style={{
              width: "100%",
              display: "grid",
              gap: 10,
              justifyItems: "center",
              paddingTop: 2
            }}
          >
            <p
              style={{
                margin: 0,
                color: "rgba(228, 228, 231, 0.76)",
                fontSize: 13,
                lineHeight: 1.5,
                textAlign: "center"
              }}
            >
              Works on Brave, Vivaldi, Edge, Chrome & other Chromium browsers
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                flexWrap: "wrap",
                width: "100%"
              }}
            >
              {browserLogos.map((browser) => (
                <Image
                  key={browser.src}
                  src={browser.src}
                  alt={browser.alt}
                  width={24}
                  height={24}
                  style={{
                    opacity: 0.72,
                    display: "block"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
