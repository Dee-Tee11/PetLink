import React, { useState } from "react";
import Avatar from "../components/ui/Avatar";
import { Back, Badge, Tag, Stars } from "../components/ui/Elements";
import EmpresaPerfil from "./EmpresaPerfil";
import { T } from "../styles/theme";

export default function ServicosScreen({ user, appData, onAddBooking, onChat }) {
  const { users, caregiverProfiles, reviews } = appData;
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selEmpresa, setSelEmpresa] = useState(null);
  const SVC_LIST = ["Todos", "Pet Sitting", "Passeios", "Banho & Tosa", "Treino", "Hospedagem", "Transporte", "Veterinária"];

  const list = caregiverProfiles.filter(c => {
    const u = users.find(us => us.id === c.user_id);
    const matchFilter = filter === "Todos" || (c.services || []).includes(filter);
    const matchSearch = !search || (u?.name || "").toLowerCase().includes(search.toLowerCase()) || (c.services || []).some(s => s.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const selProfile = selEmpresa ? caregiverProfiles.find(c => c.user_id === selEmpresa) : null;
  const selUser = selEmpresa ? users.find(u => u.id === selEmpresa) : null;

  if (selEmpresa && selProfile && selUser) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Back onClick={() => setSelEmpresa(null)} />
      <EmpresaPerfil empresaUser={selUser} profile={selProfile} appData={appData} user={user} onBook={onAddBooking} onChat={() => { onChat(selEmpresa); setSelEmpresa(null); }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "var(--font-fraunces)" }}>Serviços</h2>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "2px 0 0" }}>Empresas e prestadores de confiança</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--white)", border: `1.5px solid var(--border)`, borderRadius: 100, padding: "10px 16px" }}>
        <span style={{ color: "var(--muted)" }}>🔍</span>
        <input style={{ border: "none", outline: "none", flex: 1, fontSize: 14, fontFamily: "var(--font-dm-sans)", background: "transparent", color: "var(--text)" }} placeholder="Pesquisar por nome ou serviço…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
        {SVC_LIST.map(sv => (
          <button key={sv} onClick={() => setFilter(sv)} style={{ background: filter === sv ? "var(--forest)" : "#f0f7f2", color: filter === sv ? "var(--white)" : "var(--muted)", border: "none", borderRadius: 100, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-dm-sans)" }}>{sv}</button>
        ))}
      </div>
      {list.length === 0 && <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div><div style={{ fontWeight: 600 }}>Sem resultados</div></div>}
      {list.map(c => {
        const u = users.find(us => us.id === c.user_id);
        const empReviews = reviews.filter(r => r.caregiver_id === c.user_id);
        return (
          <div key={c.user_id} onClick={() => setSelEmpresa(c.user_id)} className="card" style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <Avatar name={u?.name || ""} photoURL={u?.photoURL} size={50} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{u?.name}</span>
                  {u?.role === "empresa" && <Badge color="var(--violet)" bg="var(--violet-bg)">🏢</Badge>}
                </div>
                {c.rating > 0 && <Stars r={c.rating} />}
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>📍 {u?.location || "—"}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 700, color: "var(--forest)", fontSize: 16 }}>{c.price_per_hour}€<span style={{ fontSize: 11, fontWeight: 400 }}>/h</span></div>
                <Badge color={c.available ? "#16773a" : "#888"} bg={c.available ? "#dcf0e3" : "#f0f4f8"}>{c.available ? "Disponível" : "Ocupado"}</Badge>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {(c.services || []).slice(0, 4).map(sv => <Tag key={sv}>{sv}</Tag>)}
              {(c.services || []).length > 4 && <Tag bg="#f0f4f8" color="#5a6a7a">+{c.services.length - 4}</Tag>}
            </div>
            {c.schedule && <div style={{ fontSize: 12, color: "var(--muted)" }}>🕐 {c.schedule}</div>}
          </div>
        );
      })}
    </div>
  );
}
