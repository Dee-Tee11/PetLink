import React, { useState } from "react";
import Avatar from "../components/ui/Avatar";
import { Badge } from "../components/ui/Elements";
import { T, STATUS_COLORS } from "../styles/theme";

export default function EmpresaPedidos({ user, bookings, onUpdate, appData }) {
  const { users, pets } = appData;
  const [open, setOpen] = useState(null);
  const [qf, setQf] = useState({ price: "", notes: "", date: "", time: "" });
  const [saving, setSaving] = useState(false);
  const mine = bookings.filter(b => b.caregiver_id === user.id && ["pendente", "orçamento_enviado", "rejeitado"].includes(b.status));
  
  const send = async (b) => {
    if (!qf.price) return;
    setSaving(true);
    await onUpdate(b.id, { status: "orçamento_enviado", quote_price: parseFloat(qf.price), quote_notes: qf.notes, quote_date: qf.date || b.date, quote_time: qf.time || b.time });
    setSaving(false); setOpen(null); setQf({ price: "", notes: "", date: "", time: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "var(--font-fraunces)" }}>📩 Pedidos recebidos</h2><p style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 0" }}>Analisa e envia orçamentos</p></div>
      {mine.length === 0 && <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📭</div><div style={{ fontWeight: 600 }}>Sem pedidos de momento</div></div>}
      {mine.map(b => {
        const owner = users.find(u => u.id === b.owner_id);
        const pet = pets.find(p => p.id === b.pet_id);
        const isOpen = open === b.id;
        return (
          <div key={b.id} className="card" style={{ marginBottom: 10, border: b.status === "pendente" ? `2px solid var(--mint)` : `1px solid var(--border)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Avatar name={owner?.name || ""} photoURL={owner?.photoURL} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{owner?.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>📞 {owner?.phone || "—"}</div>
              </div>
              <Badge color={STATUS_COLORS[b.status]?.color} bg={STATUS_COLORS[b.status]?.bg}>{b.status}</Badge>
            </div>
            <div style={{ background: "var(--pale)", borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[["Animal", `${pet?.species} ${pet?.name}`], ["Serviço", b.service], ["Data", b.date], ["Hora", b.time]].map(([k, v]) => (
                  <div key={k}><div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>{k}</div><div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{v}</div></div>
                ))}
              </div>
              {b.notes && <div style={{ marginTop: 8, fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>📝 "{b.notes}"</div>}
            </div>
            {b.quote_price && <div style={{ background: "var(--violet-bg)", borderRadius: 12, padding: 12, marginBottom: 10, border: `1px solid #c8b8f8` }}><div style={{ fontSize: 11, color: "var(--violet)", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Orçamento enviado</div><div style={{ fontWeight: 700, fontSize: 16, color: "var(--violet)" }}>{b.quote_price}€ · {b.quote_date || b.date}</div>{b.quote_notes && <div style={{ fontSize: 13, color: "var(--violet)", fontStyle: "italic", marginTop: 4 }}>📝 "{b.quote_notes}"</div>}</div>}
            {b.status === "pendente" && (isOpen ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--forest)" }}>💶 Enviar orçamento</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label className="label">Valor (€) *</label><input className="input" type="number" placeholder="25" value={qf.price} onChange={e => setQf(f => ({ ...f, price: e.target.value }))} /></div>
                  <div><label className="label">Data</label><input className="input" type="date" value={qf.date} onChange={e => setQf(f => ({ ...f, date: e.target.value }))} /></div>
                  <div><label className="label">Hora</label><input className="input" type="time" value={qf.time} onChange={e => setQf(f => ({ ...f, time: e.target.value }))} /></div>
                  <div><label className="label">Nota</label><input className="input" placeholder="ex: Trazer ração" value={qf.notes} onChange={e => setQf(f => ({ ...f, notes: e.target.value }))} /></div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => send(b)} disabled={saving} className="btn btn-filled" style={{ flex: 1, padding: "11px 0", opacity: (!qf.price || saving) ? .5 : 1 }}>{saving ? "A enviar…" : "📤 Enviar orçamento"}</button>
                  <button onClick={() => setOpen(null)} className="btn" style={{ padding: "11px 16px" }}>Cancelar</button>
                </div>
                <button onClick={() => { setOpen(null); onUpdate(b.id, { status: "rejeitado" }); }} className="btn btn-filled" style={{ '--accent': 'var(--red)', width: "100%", padding: "10px 0" }}>❌ Recusar pedido</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setOpen(b.id); setQf({ price: String(b.price || ""), notes: "", date: b.date, time: b.time }); }} className="btn btn-filled" style={{ flex: 1, padding: "11px 0" }}>💶 Responder com orçamento</button>
                <button onClick={() => onUpdate(b.id, { status: "rejeitado" })} className="btn btn-filled" style={{ '--accent': 'var(--red)', padding: "11px 14px" }}>❌</button>
              </div>
            ))}
            {b.status === "orçamento_enviado" && <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8f7ff", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--violet)" }}><span>⏳</span> A aguardar confirmação…</div>}
          </div>
        );
      })}
    </div>
  );
}
