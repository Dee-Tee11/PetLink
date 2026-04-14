import React, { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Back, Badge, Tag } from "../components/ui/Elements";

export default function PetProfile({ pet, onBack }) {
  const [sub, setSub] = useState("info");
  const [addVacc, setAddVacc] = useState(false);
  const [vaccInput, setVaccInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [addVisit, setAddVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({ date: "", vet: "", reason: "", notes: "" });

  const saveVacc = async () => {
    if (!vaccInput.trim()) return;
    setSaving(true);
    await updateDoc(doc(db, "pets", pet.id), { vaccines: [...(pet.vaccines || []), vaccInput.trim()] });
    setSaving(false); setVaccInput(""); setAddVacc(false);
  };

  const saveVisit = async () => {
    if (!visitForm.date || !visitForm.vet) return;
    setSaving(true);
    const visits = [...(pet.history || []), { ...visitForm, id: Date.now() }];
    await updateDoc(doc(db, "pets", pet.id), { history: visits });
    setSaving(false); setVisitForm({ date: "", vet: "", reason: "", notes: "" }); setAddVisit(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Back onClick={onBack} />
      <div className="card" style={{ background: pet.color || "var(--pale)", border: "none", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 70, height: 70, borderRadius: 20, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {pet.photoURL ? <img src={pet.photoURL} alt={pet.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 40 }}>{pet.species}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-fraunces)" }}>{pet.name}</div>
          <div style={{ color: "var(--muted)", fontSize: 13, margin: "2px 0 8px" }}>{pet.breed} · {pet.age} anos · {pet.weight}</div>
          <Badge color={pet.status === "Em casa" ? "#16773a" : "#c47a00"} bg={pet.status === "Em casa" ? "#dcf0e3" : "#fff3e0"}>{pet.status}</Badge>
        </div>
      </div>
      <div style={{ display: "flex", background: "#edf5ef", borderRadius: 12, padding: 4 }}>
        {["info", "vacinas", "historial"].map(t => (
          <button key={t} onClick={() => setSub(t)} style={{ flex: 1, background: sub === t ? "var(--white)" : "transparent", border: "none", borderRadius: 9, padding: "8px 0", fontWeight: 700, fontSize: 13, color: sub === t ? "var(--forest)" : "var(--muted)", cursor: "pointer", fontFamily: "var(--font-dm-sans)", textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>
      {sub === "info" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["Microchip", pet.microchip || "—"], ["Próxima consulta", pet.nextVet || "—"], ["Raça", pet.breed || "—"], ["Peso", pet.weight || "—"], ["Cor", pet.coatColor || "—"], ["Esterilizado", pet.sterilized ? "Sim" : "Não"]].map(([k, v]) => (
              <div key={k} className="card"><div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{k}</div><div style={{ fontWeight: 600, fontSize: 14 }}>{v}</div></div>
            ))}
          </div>
          {pet.notes && <div className="card"><div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Notas especiais</div><div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>{pet.notes}</div></div>}
          {pet.allergies && <div className="card" style={{ background: "#fff8e1", border: "1px solid #ffe082" }}><div style={{ fontSize: 10, color: "#c47a00", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>⚠️ Alergias</div><div style={{ fontSize: 14, color: "var(--text)" }}>{pet.allergies}</div></div>}
        </div>
      )}
      {sub === "vacinas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--forest)" }}>Vacinas registadas</div>
              <button onClick={() => setAddVacc(!addVacc)} className="btn btn-filled" style={{ padding: "6px 14px", fontSize: 12 }}>+ Adicionar</button>
            </div>
            {addVacc && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input className="input" style={{ flex: 1 }} placeholder="ex: Raiva, Esgana…" value={vaccInput} onChange={e => setVaccInput(e.target.value)} autoFocus onKeyDown={e => e.key === "Enter" && saveVacc()} />
                <button onClick={saveVacc} disabled={saving} className="btn btn-filled" style={{ padding: "0 16px" }}>✓</button>
              </div>
            )}
            {(pet.vaccines || []).length === 0 && !addVacc && <div style={{ textAlign: "center", color: "var(--muted)", padding: 20, fontSize: 13 }}>Sem vacinas registadas</div>}
            {(pet.vaccines || []).map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f0f7f2", borderRadius: 10, marginBottom: 8 }}>
                <span>💉</span>
                <span style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{v}</span>
                <Badge color="#16773a" bg="#dcf0e3">✓ Registada</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      {sub === "historial" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--forest)" }}>Visitas ao veterinário</span>
            <button onClick={() => setAddVisit(!addVisit)} className="btn btn-filled" style={{ padding: "6px 14px", fontSize: 12 }}>+ Nova visita</button>
          </div>
          {addVisit && (
            <div className="card" style={{ border: `2px solid var(--mint)` }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label className="label">Data *</label><input className="input" type="date" value={visitForm.date} onChange={e => setVisitForm(f => ({ ...f, date: e.target.value }))} /></div>
                  <div><label className="label">Veterinário *</label><input className="input" placeholder="Dr. Silva" value={visitForm.vet} onChange={e => setVisitForm(f => ({ ...f, vet: e.target.value }))} /></div>
                </div>
                <div><label className="label">Motivo</label><input className="input" placeholder="Consulta de rotina…" value={visitForm.reason} onChange={e => setVisitForm(f => ({ ...f, reason: e.target.value }))} /></div>
                <div><label className="label">Notas</label><textarea className="input" style={{ resize: "none", height: 60 }} placeholder="Diagnóstico, medicação…" value={visitForm.notes} onChange={e => setVisitForm(f => ({ ...f, notes: e.target.value }))} /></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveVisit} disabled={saving} className="btn btn-filled" style={{ flex: 1, padding: "10px 0" }}>{saving ? "A guardar…" : "Guardar visita"}</button>
                  <button onClick={() => setAddVisit(false)} className="btn" style={{ padding: "10px 16px" }}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
          {(pet.history || []).length === 0 && !addVisit && <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--muted)", fontSize: 13 }}>Sem historial registado</div>}
          {[...(pet.history || [])].reverse().map((h, i) => (
            <div key={i} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>🏥 {h.vet}</div>
                <Tag bg="#f0f4f8" color="#5a6a7a">{h.date}</Tag>
              </div>
              {h.reason && <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 4 }}>📋 {h.reason}</div>}
              {h.notes && <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>{h.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
