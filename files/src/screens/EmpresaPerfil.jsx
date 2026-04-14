import React, { useState } from "react";
import Avatar from "../components/ui/Avatar";
import { Badge, Stars } from "../components/ui/Elements";

export default function EmpresaPerfil({ empresaUser, profile, appData, user, onBook, onChat }) {
  const [showBook, setShowBook] = useState(false);
  const [bookDone, setBookDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const { reviews, users, pets } = appData;
  const ownerPets = pets.filter(p => p.owner_id === user.id);
  const empReviews = reviews.filter(r => r.caregiver_id === empresaUser.id);
  const [bf, setBf] = useState({ pet_id: "", service: "", date: "", time: "", notes: "" });

  const book = async () => {
    if (!bf.pet_id || !bf.service || !bf.date || !bf.time) return;
    setSaving(true);
    await onBook({ owner_id: user.id, caregiver_id: empresaUser.id, pet_id: bf.pet_id, service: bf.service, date: bf.date, time: bf.time, status: "pendente", price: profile.price_per_hour, notes: bf.notes });
    setSaving(false); setBookDone(true);
    setTimeout(() => { setBookDone(false); setShowBook(false); setBf({ pet_id: "", service: "", date: "", time: "", notes: "" }); }, 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,var(--forest),var(--moss))`, borderRadius: 20, padding: 24, color: "var(--white)", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar name={empresaUser.name} photoURL={empresaUser.photoURL} size={64} style={{ border: "3px solid rgba(255,255,255,.4)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 20, fontFamily: "var(--font-fraunces)" }}>{empresaUser.name}</div>
            {profile.rating > 0 && <div style={{ marginTop: 4 }}><Stars r={profile.rating} /><span style={{ fontSize: 12, opacity: .8 }}> ({profile.reviews} avaliações)</span></div>}
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,.2)", borderRadius: 8, padding: "3px 10px", fontSize: 11 }}>📍 {empresaUser.location || "—"}</span>
              {profile.schedule && <span style={{ background: "rgba(255,255,255,.2)", borderRadius: 8, padding: "3px 10px", fontSize: 11 }}>🕐 {profile.schedule}</span>}
            </div>
          </div>
          <Badge color={profile.available ? "#dcf0e3" : "#f0f4f8"} bg={profile.available ? "#16773a" : "#888"}>{profile.available ? "✅ Aberto" : "⏸ Fechado"}</Badge>
        </div>
      </div>

      {/* Identificação */}
      <div className="card">
        <div className="label" style={{ marginBottom: 10 }}>Sobre a empresa</div>
        <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, margin: "0 0 12px" }}>{profile.bio || empresaUser.bio || "Sem descrição."}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {empresaUser.phone && <div style={{ background: "var(--pale)", borderRadius: 10, padding: "8px 12px" }}><div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Contacto</div><div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>📞 {empresaUser.phone}</div></div>}
          {profile.price_per_hour > 0 && <div style={{ background: "var(--pale)", borderRadius: 10, padding: "8px 12px" }}><div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Preço base/h</div><div style={{ fontWeight: 700, fontSize: 18, color: "var(--forest)", marginTop: 2 }}>{profile.price_per_hour}€</div></div>}
          {profile.schedule && <div style={{ background: "var(--pale)", borderRadius: 10, padding: "8px 12px", gridColumn: "1/-1" }}><div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Horário</div><div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>🕐 {profile.schedule}</div></div>}
        </div>
      </div>

      {/* Serviços */}
      <div className="card">
        <div className="label" style={{ marginBottom: 12 }}>Serviços disponíveis</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(profile.services || []).map(sv => (
            <div key={sv} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--pale)", borderRadius: 12 }}>
              <span style={{ fontSize: 18 }}>{sv === "Pet Sitting" ? "🏠" : sv === "Passeios" ? "🦮" : sv === "Banho & Tosa" ? "🛁" : sv === "Treino" ? "🎓" : sv === "Hospedagem" ? "🏡" : sv === "Transporte" ? "🚗" : sv === "Veterinária" ? "🏥" : sv === "Comportamento" ? "🧠" : "⭐"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{sv}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>A partir de {profile.price_per_hour}€/hora</div>
              </div>
              <button onClick={() => { setShowBook(true); setBf(f => ({ ...f, service: sv })); }} className="btn btn-filled" style={{ padding: "6px 14px", fontSize: 12 }}>Agendar</button>
            </div>
          ))}
        </div>
      </div>

      {/* Avaliações */}
      {empReviews.length > 0 && (
        <div className="card">
          <div className="label" style={{ marginBottom: 12 }}>Avaliações ({empReviews.length})</div>
          {empReviews.map(r => {
            const o = users.find(u => u.id === r.owner_id);
            return (
              <div key={r.id} style={{ paddingBottom: 12, borderBottom: `1px solid var(--border)`, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><Avatar name={o?.name || ""} photoURL={o?.photoURL} size={28} /><span style={{ fontWeight: 600, fontSize: 14 }}>{o?.name}</span><Stars r={r.rating} /></div>
                <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>"{r.comment}"</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Ações */}
      {showBook ? (
        bookDone ? (
          <div className="card" style={{ textAlign: "center", padding: 40, background: "#e8f5ec" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "var(--forest)" }}>Pedido enviado!</div>
          </div>
        ) : (
          <div className="card" style={{ border: `2px solid var(--mint)` }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>📅 Agendar com {empresaUser.name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div><label className="label">Animal *</label><select className="input" value={bf.pet_id} onChange={e => setBf(f => ({ ...f, pet_id: e.target.value }))}><option value="">Seleciona o animal</option>{ownerPets.map(p => <option key={p.id} value={p.id}>{p.species} {p.name}</option>)}</select></div>
              <div><label className="label">Serviço *</label><select className="input" value={bf.service} onChange={e => setBf(f => ({ ...f, service: e.target.value }))}><option value="">Seleciona o serviço</option>{(profile.services || []).map(sv => <option key={sv} value={sv}>{sv}</option>)}</select></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="label">Data *</label><input className="input" type="date" value={bf.date} onChange={e => setBf(f => ({ ...f, date: e.target.value }))} /></div>
                <div><label className="label">Hora *</label><input className="input" type="time" value={bf.time} onChange={e => setBf(f => ({ ...f, time: e.target.value }))} /></div>
              </div>
              <div><label className="label">Notas</label><textarea className="input" style={{ resize: "none", height: 60 }} placeholder="Instruções especiais…" value={bf.notes} onChange={e => setBf(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={book} disabled={saving} className="btn btn-filled" style={{ flex: 1, padding: "12px 0", opacity: (!bf.pet_id || !bf.service || !bf.date || !bf.time || saving) ? .5 : 1 }}>{saving ? "A enviar…" : "Enviar pedido"}</button>
              <button onClick={() => setShowBook(false)} className="btn" style={{ padding: "12px 16px" }}>Cancelar</button>
            </div>
          </div>
        )
      ) : (
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowBook(true)} disabled={!profile.available} className="btn btn-filled" style={{ flex: 2, padding: "13px 0", opacity: profile.available ? 1 : .5 }}>📅 {profile.available ? "Agendar serviço" : "Indisponível"}</button>
          <button onClick={onChat} className="btn" style={{ flex: 1, padding: "13px 0" }}>💬 Chat</button>
        </div>
      )}
    </div>
  );
}
