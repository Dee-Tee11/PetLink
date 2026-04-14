import React from "react";
import { GRADS, FONT } from "../../styles/theme";

export function avatarGrad(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) % GRADS.length;
  }
  return GRADS[Math.abs(h)];
}

export function initials(name = "") {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

export default function Avatar({ name = "", photoURL = null, size = 40, style = {} }) {
  const id = `g${name.replace(/\W/g, "")}${size}`;
  const [c1, c2] = avatarGrad(name);
  const fs = Math.round(size * 0.37);
  if (photoURL) return <img src={photoURL} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, display: "block", ...style }} />;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ borderRadius: "50%", flexShrink: 0, display: "block", ...style }}>
      <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient></defs>
      <circle cx="20" cy="20" r="20" fill={`url(#${id})`} />
      <text x="20" y="20" dominantBaseline="central" textAnchor="middle" fill="white" fontSize={fs} style={{ fontFamily: "var(--font-dm-sans)" }} fontWeight="700">{initials(name)}</text>
    </svg>
  );
}
