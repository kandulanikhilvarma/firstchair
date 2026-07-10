"use client";

// Catches errors in the root layout itself (must render its own html/body).
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ color: "#153E75" }}>Something went wrong</h1>
          <p style={{ color: "#475569" }}>Please reload the page.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1rem",
              background: "#153E75",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
