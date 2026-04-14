import { SignInForm } from "@/components/auth/sign-in-form";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo, message } = await searchParams;
  const pageMessage =
    message === "password-updated" ? "You can now log in with your new password." : null;

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
          maxWidth: 520,
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
        <div style={{ display: "grid", gap: 8 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.06,
              letterSpacing: "-0.03em",
              color: "#fafafa"
            }}
          >
            Log in
          </h1>
          <p style={{ margin: 0, color: "#a1a1aa", fontSize: 15, lineHeight: 1.55 }}>
            Use your CortexRate account to leave ratings and short notes.
          </p>
        </div>

        <SignInForm redirectTo={redirectTo || "/"} initialMessage={pageMessage} />
      </section>
    </main>
  );
}
