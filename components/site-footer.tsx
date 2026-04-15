import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 18,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999,
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      <Link
        href="/imprint"
        style={{
          color: "rgba(228, 228, 231, 0.68)",
          fontSize: 14,
          textDecoration: "none"
        }}
      >
        Impressum
      </Link>
    </footer>
  );
}
