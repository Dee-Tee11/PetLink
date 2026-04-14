import React from "react";

export default function Loading({ msg = "A carregar…" }) {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--cream)", fontFamily: "var(--font-dm-sans)" }}>
      <div style={{ width: 60, height: 60, borderRadius: "50% 50% 50% 14%", background: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, marginBottom: 20, animation: "bob 1.6s ease-in-out infinite" }}>🐾</div>
      <p style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>{msg}</p>
      <style>{`@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
