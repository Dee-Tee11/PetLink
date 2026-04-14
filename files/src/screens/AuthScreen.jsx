import React, { useState } from "react";
import { T } from "../styles/theme";

export default function AuthScreen({ onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("dono");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  
  const ERR = {
    "auth/user-not-found": "Email não encontrado.",
    "auth/wrong-password": "Password incorreta.",
    "auth/invalid-credential": "Email ou password incorretos.",
    "auth/email-already-in-use": "Este email já está registado.",
    "auth/weak-password": "Password demasiado fraca (mín. 6 caracteres).",
    "auth/invalid-email": "Email inválido.",
    "auth/too-many-requests": "Demasiadas tentativas. Aguarda.",
  };

  const submit = async () => {
    setErr("");
    if (!email || !pw) return setErr("Preenche todos os campos.");
    if (mode === "register" && !name.trim()) return setErr("Introduz o teu nome.");
    setLoading(true);
    try {
      mode === "login" ? await onLogin(email, pw) : await onRegister(name.trim(), email, pw, role);
    } catch (e) {
      setErr(ERR[e.code] || "Ocorreu um erro.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)", padding: 24, fontFamily: "var(--font-dm-sans)" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50% 50% 50% 16%", background: `linear-gradient(135deg,var(--forest),var(--moss))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, margin: "0 auto 16px", boxShadow: `0 8px 24px ${T.forest}40` }}>🐾</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, fontFamily: "var(--font-fraunces)", color: "var(--forest)" }}>PetLink</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: "6px 0 0", fontWeight: 500 }}>Cuidados e proteção animal</p>
        </div>
        <div style={{ display: "flex", background: "#ddeade", borderRadius: 100, padding: 4, marginBottom: 24, gap: 2 }}>
          {[["login", "Iniciar sessão"], ["register", "Criar conta"]].map(([m, l]) => (
            <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{ flex: 1, background: mode === m ? "var(--white)" : "transparent", border: "none", borderRadius: 100, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-dm-sans)", color: mode === m ? "var(--forest)" : "var(--muted)", boxShadow: mode === m ? "0 1px 6px rgba(0,0,0,.10)" : "none", transition: "all .18s" }}>{l}</button>
          ))}
        </div>
        <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "register" && <>
            <div>
              <label className="label">Nome completo</label>
              <input className="input" placeholder="O teu nome" value={name} onChange={e => setName(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="label">Tipo de conta</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[{ r: "dono", icon: "🏡", title: "Dono de Pet", desc: "Gere animais e encontra serviços", accent: T.forest },
                { r: "empresa", icon: "🏢", title: "Empresa / Prestador", desc: "Oferece serviços profissionais", accent: T.violet }].map(({ r, icon, title, desc, accent }) => (
                  <button key={r} onClick={() => setRole(r)} style={{ background: role === r ? (r === "dono" ? "var(--pale)" : "var(--violet-bg)") : "#f7faf8", border: `2px solid ${role === r ? accent : "var(--border)"}`, borderRadius: 14, padding: "14px 10px", cursor: "pointer", fontFamily: "var(--font-dm-sans)", textAlign: "center", transition: "all .15s" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: role === r ? accent : "var(--text)" }}>{title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, lineHeight: 1.4 }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </>}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="o teu email" value={email} onChange={e => setEmail(e.target.value)} autoFocus={mode === "login"} onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          {err && <div style={{ background: "var(--red-bg)", color: "var(--red)", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>⚠️ {err}</div>}
          <button onClick={submit} disabled={loading} className="btn btn-filled" style={{ width: "100%", padding: "14px 0", fontSize: 15, opacity: loading ? .65 : 1 }}>
            {loading ? "A processar…" : mode === "login" ? "Iniciar sessão →" : "Criar conta →"}
          </button>
          {mode === "login" && <div style={{ borderTop: `1px solid var(--border)`, paddingTop: 20 }}>
            <label className="label" style={{ textAlign: "center", marginBottom: 10 }}>Acesso Rápido Demo</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { n: "Diogo", e: "diogo@demo.com", r: "Dono", i: "🏡" },
                { n: "Rita", e: "rita@demo.com", r: "Dono", i: "🏡" },
                { n: "Ana", e: "ana@demo.com", r: "Cuidador", i: "🤝" },
                { n: "Carlos", e: "carlos@demo.com", r: "Cuidador", i: "🤝" },
              ].map(d => (
                <button key={d.e} onClick={() => { setEmail(d.e); setPw("123456"); }} style={{ background: "var(--white)", border: `1px solid var(--border)`, borderRadius: 12, padding: 10, cursor: "pointer", fontFamily: "var(--font-dm-sans)", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{d.i}</span>
                  <div><div style={{ fontWeight: 700, fontSize: 13, color: "var(--forest)" }}>{d.n}</div><div style={{ fontSize: 10, color: "var(--muted)" }}>{d.r}</div></div>
                </button>
              ))}
            </div>
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 11, margin: "12px 0 0" }}>Password: <b>123456</b></p>
          </div>}
        </div>
      </div>
    </div>
  );
}
