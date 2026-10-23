import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        gap: "1rem",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: "28rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Activity Demo</h1>
        <p style={{ color: "#555", lineHeight: 1.5 }}>
          Pick a surface to explore.
        </p>
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginTop: "1.25rem",
          }}
        >
          <Link
            href="/generative-ui"
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "12px",
              background: "#0f766e",
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Generative UI chat demo
          </Link>
          <Link
            href="/streaming-data"
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "12px",
              background: "#1d4ed8",
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Streaming Data demo
          </Link>
          <Link
            href="/activities"
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "12px",
              border: "1px solid #ddd",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Activities CRUD
          </Link>
        </nav>
      </div>
    </main>
  );
}
