import React from "react";
import Avatar from "../components/ui/Avatar";
import { Badge } from "../components/ui/Elements";
import { T } from "../styles/theme";

export default function DonoDashboard({ user, setTab, appData, bookings, alerts }) {
  const { pets, users } = appData;
  const ownerPets = pets.filter(p => p.owner_id === user.id);
  const mine = bookings.filter(b => b.owner_id === user.id);
  const active = mine.find(b => b.status === "a decorrer");
  const quotePend = mine.filter(b => b.status === "orçamento_enviado").length;
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><p style={{ color: "var(--muted)", fontSize: 13, margin: 0, fontWeight: 500 }}>Bom dia 👋</p><h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-fraunces)" }}>Olá, {user.name.split(" ")[0]}</h1></div>
        <Avatar name={user.name} photoURL={user.photoURL} size={44} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {[{ label: "Pets", icon: "🐾", val: ownerPets.length, tab: "perfil", bg: "#e8f5ec" }, { label: "Alertas", icon: "📍", val: alerts.filter(a => a.active).length, tab: "alertas", bg: "#fff3e0" }, { label: "Reservas", icon: "🗓️", val: mine.length, tab: "reservas", bg: "var(--violet-bg)" }].map(s => (
          <div key={s.tab} onClick={() => setTab(s.tab)} className="card" style={{ background: s.bg, border: "none", cursor: "pointer", padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 24 }}>{s.icon}</div><div style={{ fontWeight: 700, fontSize: 24, margin: "4px 0 0", fontFamily: "var(--font-fraunces)" }}>{s.val}</div><div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {active && <div style={{ background: `linear-gradient(135deg,var(--forest),var(--moss))`, borderRadius: 18, padding: 16, color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={users.find(u => u.id === active.caregiver_id)?.name || ""} photoURL={users.find(u => u.id === active.caregiver_id)?.photoURL} size={44} style={{ border: "2px solid rgba(255,255,255,.3)" }} />
        <div style={{ flex: 1 }}><div style={{ fontSize: 11, opacity: .7, fontWeight: 600 }}>A DECORRER AGORA</div><div style={{ fontWeight: 700, fontSize: 15 }}>{pets.find(p => p.id === active.pet_id)?.name} com {users.find(u => u.id === active.caregiver_id)?.name}</div><div style={{ fontSize: 12, opacity: .8 }}>{active.service} · {active.date}</div></div>
      </div>}
      {quotePend > 0 && <div onClick={() => setTab("reservas")} className="card" style={{ background: "var(--violet-bg)", border: `2px solid #c8b8f8`, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: 24 }}>💶</span><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14, color: "var(--violet)" }}>{quotePend} orçamento{quotePend > 1 ? "s" : ""} por responder</div><div style={{ fontSize: 13, color: "#9b8fd4" }}>Toca para ver</div></div><span style={{ fontSize: 20, color: "var(--violet)" }}>›</span></div>}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ fontWeight: 700, fontSize: 15, fontFamily: "var(--font-fraunces)" }}>Os meus animais</span><span onClick={() => setTab("perfil")} style={{ color: "var(--moss)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Ver todos →</span></div>
        {ownerPets.length === 0 ? <div className="card" style={{ textAlign: "center", padding: 28, color: "var(--muted)", cursor: "pointer" }} onClick={() => setTab("perfil")}><div style={{ fontSize: 36, marginBottom: 8 }}>🐾</div><div style={{ fontWeight: 600, fontSize: 14 }}>Adiciona o teu primeiro pet</div></div>
          : <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>{ownerPets.map(p => <div key={p.id} onClick={() => setTab("perfil")} className="card" style={{ minWidth: 130, flexShrink: 0, textAlign: "center", background: p.color || "var(--pale)", border: "none", cursor: "pointer" }}><div style={{ width: 42, height: 42, borderRadius: 14, overflow: "hidden", margin: "0 auto 8px", background: "rgba(255,255,255,.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>{p.photoURL ? <img src={p.photoURL} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 26 }}>{p.species}</span>}</div><div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div><div style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 8px" }}>{p.breed}</div><Badge color={p.status === "Em casa" ? "#16773a" : "#c47a00"} bg={p.status === "Em casa" ? "#dcf0e3" : "#fff3e0"}>{p.status}</Badge></div>)}</div>}
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ fontWeight: 700, fontSize: 15, fontFamily: "var(--font-fraunces)" }}>Serviços recentes</span><span onClick={() => setTab("servicos")} style={{ color: "var(--moss)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Encontrar →</span></div>
        <div onClick={() => setTab("servicos")} className="card" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "var(--pale)", border: "none" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🐾</div>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>Encontrar prestadores</div><div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Pet Sitting, Passeios, Banho & Tosa e mais</div></div>
          <span style={{ fontSize: 20, color: "var(--muted)" }}>›</span>
        </div>
      </div>
    </div>
  );
}
