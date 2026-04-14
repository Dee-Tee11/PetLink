import React from "react";
import Avatar from "../components/ui/Avatar";
import { T } from "../styles/theme";

export default function EmpresaDashboard({ user, profile, bookings, setTab, appData }) {
  const { users, pets } = appData;
  const mine = bookings.filter(b => b.caregiver_id === user.id);
  const pending = mine.filter(b => b.status === "pendente");
  const earning = mine.filter(b => ["confirmado", "a decorrer"].includes(b.status)).reduce((s, b) => s + (b.price || 0), 0);
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><p style={{ color: "var(--muted)", fontSize: 13, margin: 0, fontWeight: 500 }}>Painel da empresa</p><h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-fraunces)" }}>Olá, {user.name.split(" ")[0]}</h1></div><Avatar name={user.name} photoURL={user.photoURL} size={44} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {[{ label: "Pedidos", icon: "📩", val: pending.length, tab: "pedidos", bg: "#fff3e0" }, { label: "Confirmados", icon: "✅", val: mine.filter(b => b.status === "confirmado").length, tab: "agenda", bg: "var(--pale)" }, { label: "Ganhos", icon: "💶", val: `${earning}€`, tab: "agenda", bg: "var(--violet-bg)" }].map(s => (
          <div key={s.label} onClick={() => setTab(s.tab)} className="card" style={{ background: s.bg, border: "none", cursor: "pointer", padding: "14px 10px", textAlign: "center" }}><div style={{ fontSize: 24 }}>{s.icon}</div><div style={{ fontWeight: 700, fontSize: 22, margin: "4px 0 0", fontFamily: "var(--font-fraunces)" }}>{s.val}</div><div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{s.label}</div></div>
        ))}
      </div>
      {pending.length > 0 && <div className="card" style={{ background: "#fff3e0", border: "1px solid #f5d08a" }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📩 Novos pedidos ({pending.length})</div>
        {pending.slice(0, 2).map(b => {
          const owner = users.find(u => u.id === b.owner_id);
          const pet = pets.find(p => p.id === b.pet_id);
          return (<div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: `1px solid #f5d08a` }}><Avatar name={owner?.name || ""} photoURL={owner?.photoURL} size={36} /><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{owner?.name}</div><div style={{ fontSize: 12, color: "var(--muted)" }}>{pet?.species} {pet?.name} · {b.service}</div></div><button onClick={() => setTab("pedidos")} className="btn btn-filled" style={{ padding: "6px 12px", fontSize: 12 }}>Ver</button></div>);
        })}
        {pending.length > 2 && <div onClick={() => setTab("pedidos")} style={{ textAlign: "center", color: "var(--moss)", fontSize: 13, fontWeight: 600, cursor: "pointer", paddingTop: 8 }}>+{pending.length - 2} mais →</div>}
      </div>}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, fontFamily: "var(--font-fraunces)" }}>Resumo da empresa</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["Total", mine.length], ["Avaliação", profile?.rating || "—"], ["Avaliações", profile?.reviews || 0], ["Preço/h", `${profile?.price_per_hour || 0}€`]].map(([k, v]) => (
            <div key={k} style={{ background: "var(--pale)", borderRadius: 12, padding: 12 }}><div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>{k}</div><div style={{ fontWeight: 700, fontSize: 20, color: "var(--forest)", marginTop: 4 }}>{v}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}
