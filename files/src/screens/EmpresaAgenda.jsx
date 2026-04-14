import React from "react";
import Avatar from "../components/ui/Avatar";
import { Badge } from "../components/ui/Elements";
import { T, STATUS_COLORS } from "../styles/theme";

export default function EmpresaAgenda({ user, bookings, onUpdate, appData }) {
  const { users, pets } = appData;
  const mine = bookings.filter(b => b.caregiver_id === user.id && ["confirmado", "a decorrer"].includes(b.status));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "var(--font-fraunces)" }}>📅 Agenda</h2>
      {mine.length === 0 && <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🗓️</div><div style={{ fontWeight: 600 }}>Sem serviços confirmados</div></div>}
      {["a decorrer", "confirmado"].map(status => {
        const list = mine.filter(b => b.status === status); if (!list.length) return null;
        return (
          <div key={status}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>{status === "a decorrer" ? "🟠 A decorrer" : "✅ Confirmados"} ({list.length})</div>
            {list.map(b => {
              const owner = users.find(u => u.id === b.owner_id);
              const pet = pets.find(p => p.id === b.pet_id);
              return (
                <div key={b.id} className="card" style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <Avatar name={owner?.name || ""} photoURL={owner?.photoURL} size={40} />
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{owner?.name}</div><div style={{ color: "var(--muted)", fontSize: 12 }}>{owner?.phone || "—"}</div></div>
                    <Badge color={STATUS_COLORS[b.status]?.color} bg={STATUS_COLORS[b.status]?.bg}>{b.status}</Badge>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                    {[["Animal", `${pet?.species} ${pet?.name}`], ["Serviço", b.service], ["Data/Hora", `${b.date} ${b.time}`], ["Valor", `${b.quote_price || b.price}€`]].map(([k, v]) => (
                      <div key={k} style={{ background: "var(--pale)", borderRadius: 10, padding: "8px 10px" }}><div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>{k}</div><div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{v}</div></div>
                    ))}
                  </div>
                  {status === "confirmado" && <button onClick={() => onUpdate(b.id, { status: "a decorrer" })} className="btn btn-filled" style={{ '--accent': 'var(--amber)', width: "100%", padding: "10px 0" }}>▶ Iniciar serviço</button>}
                  {status === "a decorrer" && <button onClick={() => onUpdate(b.id, { status: "concluido" })} className="btn" style={{ width: "100%", padding: "10px 0" }}>✓ Concluir serviço</button>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
