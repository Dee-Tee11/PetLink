import React, { useState } from "react";
import { Back, Badge, Tag } from "../components/ui/Elements";
import { T } from "../styles/theme";

export default function AlertasScreen({ alerts, onAddAlert }) {
  const [view, setView] = useState("list");
  const [aType, setAType] = useState("perdido");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", breed: "", area: "", contact: "", description: "", reward: "" });
  
  const ch = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  
  const submit = async () => {
    if (!form.name || !form.area || !form.contact) return;
    setSaving(true);
    await onAddAlert({ type: aType, name: form.name, photo: aType === "perdido" ? "🐾" : "🐕", area: form.area, time: "Agora mesmo", description: form.description, contact: form.contact, reward: form.reward ? form.reward + "€" : null, active: true });
    setSaving(false); setDone(true);
    setTimeout(() => { setDone(false); setView("list"); setForm({ name: "", breed: "", area: "", contact: "", description: "", reward: "" }); }, 2200);
  };
  
  if (view === "sos") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Back onClick={() => setView("list")} />
      <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "var(--font-fraunces)" }}>🚨 SOS Pet</h2><p style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 0" }}>Alerta para a tua comunidade</p></div>
      {done ? <div className="card" style={{ textAlign: "center", padding: 48, background: "#e8f5ec" }}><div style={{ fontSize: 48, marginBottom: 12 }}>✅</div><div style={{ fontWeight: 700, fontSize: 18, color: "var(--forest)" }}>Alerta publicado!</div></div> : <>
        <div className="card"><label className="label">Tipo</label><div style={{ display: "flex", gap: 8 }}>{[["perdido", "🔴 Perdido", "#fde8e8", T.red], ["encontrado", "🟢 Encontrado", "#dcf0e3", "#16773a"]].map(([t, l, bg, col]) => <button key={t} onClick={() => setAType(t)} style={{ flex: 1, background: aType === t ? bg : "#f8faf9", border: `2px solid ${aType === t ? col : "var(--border)"}`, borderRadius: 12, padding: "11px 0", fontSize: 13, fontWeight: 700, color: aType === t ? col : "var(--muted)", cursor: "pointer", fontFamily: "var(--font-dm-sans)" }}>{l}</button>)}</div></div>
        <div className="card"><div style={{ display: "flex", flexDirection: "column", gap: 10 }}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}><div><label className="label">Nome *</label><input className="input" placeholder="ex: Mimi" value={form.name} onChange={ch("name")} /></div><div><label className="label">Raça</label><input className="input" placeholder="ex: Persa" value={form.breed} onChange={ch("breed")} /></div></div><div><label className="label">Descrição</label><textarea className="input" style={{ resize: "none", height: 68 }} placeholder="Cor, marcas, coleira…" value={form.description} onChange={ch("description")} /></div></div></div>
        <div className="card"><div style={{ display: "flex", flexDirection: "column", gap: 10 }}><div><label className="label">Zona *</label><input className="input" placeholder="ex: Porto, Cedofeita" value={form.area} onChange={ch("area")} /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}><div><label className="label">Contacto *</label><input className="input" placeholder="912 345 678" value={form.contact} onChange={ch("contact")} /></div><div><label className="label">Recompensa (€)</label><input className="input" type="number" placeholder="50" value={form.reward} onChange={ch("reward")} /></div></div></div></div>
        <button onClick={submit} disabled={saving} className="btn btn-filled" style={{ '--accent': 'var(--red)', width: "100%", padding: "14px 0", fontSize: 14, opacity: (!form.name || !form.area || !form.contact || saving) ? .5 : 1 }}>{saving ? "A publicar…" : "🚨 Publicar alerta"}</button>
      </>}
    </div>
  );
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "var(--font-fraunces)" }}>Alertas</h2><p style={{ color: "var(--muted)", fontSize: 13, margin: "2px 0 0" }}>{alerts.filter(a => a.active).length} ativos</p></div>
        <button onClick={() => setView("sos")} className="btn btn-filled" style={{ '--accent': 'var(--red)', padding: "9px 16px", fontSize: 13 }}>🚨 SOS Pet</button>
      </div>
      {alerts.length === 0 && <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📭</div><div style={{ fontWeight: 600 }}>Sem alertas ativos</div></div>}
      {alerts.map(a => (
        <div key={a.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: a.type === "perdido" ? "#fde8e8" : "#dcf0e3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{a.photo}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{a.name}</span>
              <Badge color={a.type === "perdido" ? "var(--red)" : "#16773a"} bg={a.type === "perdido" ? "#fde8e8" : "#dcf0e3"}>{a.type === "perdido" ? "🔴 Perdido" : "🟢 Encontrado"}</Badge>
              {a.reward && <Badge color="#c47a00" bg="#fff3e0">🏆 {a.reward}</Badge>}
            </div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, marginBottom: 6 }}>{a.description}</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}><Tag>📍 {a.area}</Tag><Tag bg="#f0f4f8" color="#5a6a7a">⏰ {a.time}</Tag></div>
          </div>
          <a href={`tel:${a.contact}`} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--forest)", border: "none", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, textDecoration: "none" }}>📞</a>
        </div>
      ))}
    </div>
  );
}
