import React from "react";

export const Badge = ({ color, bg, children }) => (
  <span style={{ background: bg, color, borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
    {children}
  </span>
);

export const Tag = ({ bg = "var(--pale)", color = "var(--moss)", children }) => (
  <span style={{ background: bg, color, borderRadius: 8, padding: "3px 9px", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}>
    {children}
  </span>
);

export const Stars = ({ r = 0 }) => (
  <span style={{ fontSize: 12, color: "var(--amber)" }}>
    {"★".repeat(Math.floor(r))}
    <span style={{ color: "#ddd" }}>{"★".repeat(5 - Math.floor(r))}</span>
    <span style={{ color: "var(--muted)", marginLeft: 4, fontSize: 11 }}>{r}</span>
  </span>
);

export const Back = ({ onClick }) => (
  <button onClick={onClick} style={{ alignSelf: "flex-start", background: "var(--pale)", border: "none", borderRadius: 100, padding: "7px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", color: "var(--forest)", fontFamily: "var(--font-dm-sans)" }}>
    ← Voltar
  </button>
);
