import React, { useState } from "react";
import { collection, doc, addDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { T, PET_BG, SPECIES } from "../styles/theme";
import UploadBtn from "../components/ui/UploadBtn";
import { Badge } from "../components/ui/Elements";

export default function Onboarding({ user, onDone }) {
  const isDono = user.role === "dono";
  const isEmpresa = user.role === "empresa";
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [photoURL, setPhoto] = useState(null);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  
  // pet
  const [pName, setPName] = useState(""); 
  const [pSpecies, setPSpecies] = useState("🐕"); 
  const [pBreed, setPBreed] = useState(""); 
  const [pAge, setPAge] = useState(""); 
  const [pWeight, setPWeight] = useState("");
  
  // empresa
  const ALL_SVC = ["Pet Sitting", "Passeios", "Banho & Tosa", "Treino", "Hospedagem", "Transporte", "Veterinária", "Comportamento"];
  const [services, setServices] = useState([]); 
  const [price, setPrice] = useState(""); 
  const [website, setWebsite] = useState(""); 
  const [schedule, setSchedule] = useState("Seg-Sex 9h-18h");
  
  const toggleSvc = (s) => setServices(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const accent = isDono ? T.forest : T.violet;
  const accentVar = isDono ? "var(--forest)" : "var(--violet)";
  
  const finish = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.id), { phone, location, bio, photoURL: photoURL || null, onboarded: true, website: website || null });
      if (isDono && pName.trim()) {
        await addDoc(collection(db, "pets"), { owner_id: user.id, name: pName.trim(), species: pSpecies, breed: pBreed || "—", age: parseInt(pAge) || 0, weight: pWeight || "—", color: PET_BG[Math.floor(Math.random() * PET_BG.length)], status: "Em casa", vaccines: [], notes: "" });
      }
      if (isEmpresa && services.length > 0) {
        await setDoc(doc(db, "caregiver_profiles", String(user.id)), { user_id: user.id, rating: 0, reviews: 0, services, price_per_hour: parseFloat(price) || 0, available: true, bio, schedule, website: website || null });
      }
      onDone();
    } catch (e) { 
      console.error(e); 
      setSaving(false); 
    }
  };
  
  const LABELS = isDono ? ["Foto de perfil", "Dados pessoais", "Primeiro animal"] : ["Foto / Logo", "Dados da empresa", "Serviços oferecidos"];
  
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)", padding: 20, fontFamily: "var(--font-dm-sans)" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {[1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= step ? accentVar : "var(--border)", transition: "background .3s" }} />)}
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-fraunces)", color: "var(--forest)" }}>{LABELS[step - 1]}</h2>
        </div>
        
        {step === 1 && (
          <div className="card" style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <UploadBtn photoURL={photoURL} name={user.name} size={100} onUploaded={setPhoto} folder="avatars" />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text)" }}>{user.name}</div>
              <div style={{ marginTop: 6 }}>
                <Badge color={accent} bg={isDono ? T.pale : T.violetBg}>{isDono ? "🏡 Dono" : "🏢 Empresa"}</Badge>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button onClick={() => setStep(2)} className="btn" style={{ '--accent': accent, flex: 1, padding: "12px 0" }}>Saltar</button>
              <button onClick={() => setStep(2)} className="btn btn-filled" style={{ '--accent': accent, flex: 2, padding: "12px 0" }}>Continuar →</button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label className="label">Telemóvel / Contacto</label><input className="input" type="tel" placeholder="912 345 678" value={phone} onChange={e => setPhone(e.target.value)} autoFocus /></div>
            <div><label className="label">Localização</label><input className="input" placeholder="ex: Porto, Cedofeita" value={location} onChange={e => setLocation(e.target.value)} /></div>
            {isEmpresa && <div><label className="label">Website</label><input className="input" placeholder="https://..." value={website} onChange={e => setWebsite(e.target.value)} /></div>}
            <div><label className="label">{isDono ? "Sobre ti" : "Descrição da empresa"}</label><textarea className="input" style={{ resize: "none", height: 88 }} placeholder={isDono ? "Conta-nos sobre ti…" : "Descreve os teus serviços e diferenciais…"} value={bio} onChange={e => setBio(e.target.value)} /></div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} className="btn" style={{ '--accent': accent, flex: 1, padding: "12px 0" }}>← Voltar</button>
              <button onClick={() => setStep(3)} className="btn btn-filled" style={{ '--accent': accent, flex: 2, padding: "12px 0" }}>Continuar →</button>
            </div>
          </div>
        )}
        
        {step === 3 && isDono && (
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>Adiciona o teu primeiro animal (opcional).</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ gridColumn: "1/-1" }}><label className="label">Nome</label><input className="input" placeholder="ex: Rex" value={pName} onChange={e => setPName(e.target.value)} autoFocus /></div>
              <div style={{ gridColumn: "1/-1" }}><label className="label">Espécie</label><div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                {SPECIES.slice(0, 4).map(sp => (
                  <button key={sp.emoji} onClick={() => setPSpecies(sp.emoji)} style={{ background: pSpecies === sp.emoji ? "var(--pale)" : "#f8faf9", border: `2px solid ${pSpecies === sp.emoji ? "var(--forest)" : "var(--border)"}`, borderRadius: 12, padding: "7px 11px", cursor: "pointer", fontFamily: "var(--font-dm-sans)", fontSize: 12, fontWeight: 600, color: pSpecies === sp.emoji ? "var(--forest)" : "var(--muted)" }}>
                    {sp.emoji} {sp.label}
                  </button>
                ))}
              </div></div>
              <div><label className="label">Raça</label><input className="input" placeholder="ex: Labrador" value={pBreed} onChange={e => setPBreed(e.target.value)} /></div>
              <div><label className="label">Idade</label><input className="input" type="number" placeholder="3" value={pAge} onChange={e => setPAge(e.target.value)} /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(2)} className="btn" style={{ '--accent': T.forest, flex: 1, padding: "12px 0" }}>← Voltar</button>
              <button onClick={finish} disabled={saving} className="btn btn-filled" style={{ '--accent': T.forest, flex: 2, padding: "12px 0", opacity: saving ? .65 : 1 }}>{saving ? "A guardar…" : "Entrar na app 🎉"}</button>
            </div>
          </div>
        )}
        
        {step === 3 && isEmpresa && (
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">Serviços que ofereces *</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                {ALL_SVC.map(s => (
                  <button key={s} onClick={() => toggleSvc(s)} style={{ background: services.includes(s) ? "var(--forest)" : "#f0f7f2", color: services.includes(s) ? "var(--white)" : "var(--muted)", border: "none", borderRadius: 100, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-dm-sans)" }}>
                    {services.includes(s) ? "✓ " : ""}{s}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label className="label">Preço base/hora (€)</label><input className="input" type="number" placeholder="ex: 15" value={price} onChange={e => setPrice(e.target.value)} /></div>
              <div><label className="label">Horário</label><input className="input" placeholder="Seg-Sex 9h-18h" value={schedule} onChange={e => setSchedule(e.target.value)} /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(2)} className="btn" style={{ '--accent': T.violet, flex: 1, padding: "12px 0" }}>← Voltar</button>
              <button onClick={finish} disabled={saving || services.length === 0} className="btn btn-filled" style={{ '--accent': T.violet, flex: 2, padding: "12px 0", opacity: (saving || services.length === 0) ? .5 : 1 }}>
                {saving ? "A guardar…" : "Entrar na app 🎉"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
