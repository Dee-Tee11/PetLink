import React, { useState, useRef } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { T, PET_BG, SPECIES } from "../styles/theme";
import Avatar from "../components/ui/Avatar";
import UploadBtn from "../components/ui/UploadBtn";
import { Back, Badge, Stars, Tag } from "../components/ui/Elements";
import PetProfile from "./PetProfile";

export default function PerfilScreen({ user, appData, onUpdatePhoto, onLogout, onRefresh }) {
  const { pets, users, reviews, caregiverProfiles } = appData;
  const ownerPets = pets.filter(p => p.owner_id === user.id);
  const isEmpresa = user.role === "empresa";
  const cgProfile = caregiverProfiles.find(p => p.user_id === user.id);
  const myReviews = reviews.filter(r => r.caregiver_id === user.id);
  const [selPet, setSelPet] = useState(null);
  const [addMode, setAddMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pName, setPName] = useState(""); 
  const [pSpecies, setPSpecies] = useState("🐕"); 
  const [pBreed, setPBreed] = useState(""); 
  const [pAge, setPAge] = useState(""); 
  const [pWeight, setPWeight] = useState(""); 
  const [pNotes, setPNotes] = useState("");

  const livePet = appData.pets.find(p => p.id === selPet);

  const savePet = async () => {
    if (!pName.trim()) return;
    setSaving(true);
    await addDoc(collection(db, "pets"), { owner_id: user.id, name: pName.trim(), species: pSpecies, breed: pBreed || "—", age: parseInt(pAge) || 0, weight: pWeight || "—", color: PET_BG[Math.floor(Math.random() * PET_BG.length)], status: "Em casa", vaccines: [], history: [], notes: pNotes });
    setSaving(false); setAddMode(false); setPName(""); setPBreed(""); setPAge(""); setPWeight(""); setPNotes(""); onRefresh?.();
  };

  if (selPet && livePet) return <PetProfile pet={livePet} onBack={() => setSelPet(null)} />;

  if (addMode) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Back onClick={() => setAddMode(false)} />
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "var(--font-fraunces)" }}>🐾 Novo animal</h2>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 68, height: 68, borderRadius: 18, background: PET_BG[0], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, flexShrink: 0 }}>{pSpecies}</div>
          <div style={{ flex: 1 }}><label className="label">Nome *</label><input className="input" placeholder="Nome do animal" value={pName} onChange={e => setPName(e.target.value)} autoFocus /></div>
        </div>
        <div><label className="label">Espécie</label><div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>{SPECIES.map(sp => <button key={sp.emoji} onClick={() => setPSpecies(sp.emoji)} style={{ background: pSpecies === sp.emoji ? "var(--pale)" : "#f8faf9", border: `2px solid ${pSpecies === sp.emoji ? "var(--forest)" : "var(--border)"}`, borderRadius: 12, padding: "7px 11px", cursor: "pointer", fontFamily: "var(--font-dm-sans)", fontSize: 12, fontWeight: 600, color: pSpecies === sp.emoji ? "var(--forest)" : "var(--muted)" }}>{sp.emoji} {sp.label}</button>)}</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label className="label">Raça</label><input className="input" placeholder="ex: Labrador" value={pBreed} onChange={e => setPBreed(e.target.value)} /></div>
          <div><label className="label">Idade (anos)</label><input className="input" type="number" placeholder="3" value={pAge} onChange={e => setPAge(e.target.value)} /></div>
          <div><label className="label">Peso</label><input className="input" placeholder="ex: 8kg" value={pWeight} onChange={e => setPWeight(e.target.value)} /></div>
        </div>
        <div><label className="label">Notas</label><textarea className="input" style={{ resize: "none", height: 60 }} placeholder="Alergias, medicação…" value={pNotes} onChange={e => setPNotes(e.target.value)} /></div>
        <button onClick={savePet} disabled={saving || !pName.trim()} className="btn btn-filled" style={{ width: "100%", padding: "13px 0", opacity: (saving || !pName.trim()) ? .5 : 1 }}>{saving ? "A guardar…" : "Guardar animal"}</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Perfil do utilizador */}
      <div className="card" style={{ textAlign: "center", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <UploadBtn photoURL={user.photoURL} name={user.name} size={88} onUploaded={onUpdatePhoto} folder="avatars" />
        </div>
        <div style={{ fontWeight: 700, fontSize: 20, fontFamily: "var(--font-fraunces)" }}>{user.name}</div>
        <div style={{ marginTop: 8 }}>
          <Badge color={isEmpresa ? T.violet : T.forest} bg={isEmpresa ? T.violetBg : T.pale}>
            {isEmpresa ? "🏢 Empresa / Prestador" : "🏡 Dono de Pet"}
          </Badge>
        </div>
        {cgProfile && cgProfile.rating > 0 && <div style={{ marginTop: 8 }}><Stars r={cgProfile.rating} /><span style={{ color: "var(--muted)", fontSize: 12 }}> ({cgProfile.reviews} avaliações)</span></div>}
        <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 10, lineHeight: 1.6 }}>{user.bio || "Sem bio ainda."}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
          <Tag>📍 {user.location || "—"}</Tag>
          <Tag bg="#f0f4f8" color="#5a6a7a">📞 {user.phone || "—"}</Tag>
          {user.website && <Tag bg="var(--blue-bg)" color="var(--blue)">🌐 Website</Tag>}
        </div>
      </div>

      {/* Animais do dono */}
      {!isEmpresa && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "var(--font-fraunces)" }}>Os meus animais</h3>
            <button onClick={() => setAddMode(true)} className="btn btn-filled" style={{ padding: "7px 14px", fontSize: 12 }}>+ Novo</button>
          </div>
          {ownerPets.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🐾</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Adiciona o teu primeiro pet</div>
              <button onClick={() => setAddMode(true)} className="btn btn-filled" style={{ marginTop: 14, padding: "9px 20px" }}>Adicionar</button>
            </div>
          )}
          {ownerPets.map(p => (
            <div key={p.id} onClick={() => setSelPet(p.id)} className="card" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 10 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: p.color || "var(--pale)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                {p.photoURL ? <img src={p.photoURL} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 28 }}>{p.species}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{p.breed} · {p.age} anos</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  {(p.vaccines || []).length > 0 && <Tag bg="#dcf0e3" color="#16773a">💉 {p.vaccines.length} vacina{p.vaccines.length !== 1 ? "s" : ""}</Tag>}
                  {(p.history || []).length > 0 && <Tag bg="#f0f4f8" color="#5a6a7a">🏥 {p.history.length} visita{p.history.length !== 1 ? "s" : ""}</Tag>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <Badge color={p.status === "Em casa" ? "#16773a" : "#c47a00"} bg={p.status === "Em casa" ? "#dcf0e3" : "#fff3e0"}>{p.status}</Badge>
                <div style={{ color: "var(--muted)", fontSize: 18, marginTop: 4 }}>›</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Avaliações se cuidador/empresa */}
      {(isEmpresa || user.role === "cuidador") && myReviews.length > 0 && (
        <div className="card">
          <div className="label" style={{ marginBottom: 12 }}>Avaliações recebidas</div>
          {myReviews.map(r => {
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

      <button onClick={onLogout} className="btn" style={{ '--accent': 'var(--red)', width: "100%", padding: "12px 0", textAlign: "center" }}>🚪 Terminar sessão</button>
    </div>
  );
}
