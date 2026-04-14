import React from "react";
import Avatar from "../components/ui/Avatar";
import { Badge } from "../components/ui/Elements";
import { T, STATUS_COLORS } from "../styles/theme";

export default function DonoReservas({ user, bookings, onUpdate, appData }) {
  const { users, pets } = appData;
  const mine = bookings.filter(b => b.owner_id === user.id);
  const ORDER = ["a decorrer", "orçamento_enviado", "confirmado", "pendente", "rejeitado"];
  const LABELS = { "a decorrer": "A decorrer", "orçamento_enviado": "Orçamento recebido", "confirmado": "Confirmados", "pendente": "Aguarda orçamento", "rejeitado": "Rejeitados" };
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "var(--font-fraunces)" }}>As minhas reservas</h2>
      {mine.length === 0 && <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🗓️</div><div style={{ fontWeight: 600 }}>Sem reservas ainda</div></div>}
      {ORDER.map(status => {
        const list = mine.filter(b => b.status === status); if (!list.length) return null;
        return (
          <div key={status}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>{LABELS[status]}</div>
            {list.map(b => {
              const cU = users.find(u => u.id === b.caregiver_id);
              const pet = pets.find(p => p.id === b.pet_id);
              return (
                <div key={b.id} className="card" style={{ marginBottom: 10, border: status === "orçamento_enviado" ? `2px solid var(--violet)` : `1px solid var(--border)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: b.quote_price ? 12 : 0 }}>
                    <Avatar name={cU?.name || ""} photoURL={cU?.photoURL} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{pet?.species} {pet?.name} com {cU?.name}</div>
                      <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{b.service} · {b.date} {b.time}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, color: "var(--forest)", fontSize: 15, marginBottom: 4 }}>{b.quote_price || b.price}€</div>
                      <Badge color={STATUS_COLORS[b.status]?.color} bg={STATUS_COLORS[b.status]?.bg}>{b.status}</Badge>
                    </div>
                  </div>
                  {status === "orçamento_enviado" && b.quote_price && (
                    <>
                      <div style={{ background: "var(--violet-bg)", borderRadius: 12, padding: 14, marginBottom: 12, border: `1px solid #c8b8f8` }}>
                        <div style={{ fontSize: 11, color: "var(--violet)", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>💶 Orçamento recebido</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {[["Valor", `${b.quote_price}€`], ["Data proposta", b.quote_date || b.date]].map(([k, v]) => (
                            <div key={k} style={{ background: "rgba(255,255,255,.7)", borderRadius: 9, padding: "8px 10px" }}><div style={{ fontSize: 10, color: "var(--violet)", fontWeight: 700, textTransform: "uppercase" }}>{k}</div><div style={{ fontWeight: 700, fontSize: 14, marginTop: 2, color: "var(--violet)" }}>{v}</div></div>
                          ))}
                        </div>
                        {b.quote_notes && <div style={{ fontSize: 13, color: "var(--violet)", fontStyle: "italic", marginTop: 8 }}>📝 "{b.quote_notes}"</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => onUpdate(b.id, { status: "confirmado", price: b.quote_price })} className="btn btn-filled" style={{ flex: 1, padding: "12px 0" }}>✅ Aceitar</button>
                        <button onClick={() => onUpdate(b.id, { status: "rejeitado" })} className="btn btn-filled" style={{ '--accent': 'var(--red)', padding: "12px 16px" }}>❌</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
