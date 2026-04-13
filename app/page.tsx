export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        backgroundColor: "#f4f4f5"
      }}
    >
      <div
        style={{
          maxWidth: 720,
          padding: 32,
          borderRadius: 16,
          backgroundColor: "#ffffff",
          border: "1px solid #d4d4d8"
        }}
      >
        <h1 style={{ marginTop: 0 }}>CortexRate</h1>
        <p>
          Minimal MVP web app foundation for viewing a canonical item, reading active reviews, and
          submitting one review per user.
        </p>
        <p style={{ marginBottom: 0, color: "#52525b" }}>
          Open an item page directly at <code>/items/&lt;canonicalItemId&gt;</code>.
        </p>
      </div>
    </main>
  );
}
