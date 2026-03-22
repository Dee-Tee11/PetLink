import { useState, useEffect } from "react";
import {
  USERS, PETS, CAREGIVER_PROFILES, BOOKINGS as INIT_BOOKINGS,
  ALERTS as INIT_ALERTS, REVIEWS,
  getPetsByOwner, getCaregiverProfile,
} from "./db";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const C = {
  forest:"#1a4d2e", moss:"#2d6b45", mint:"#a8d4b0",
  pale:"#e8f5ec",   cream:"#f6faf7", border:"#dceee3",
  muted:"#7a9a82",  text:"#1a2e22", white:"#ffffff",
  amber:"#e8a84a",  red:"#c0392b",  redBg:"#fde8d8",
  purple:"#6c5ce7", purpleBg:"#ede8fc",
};

const card = { background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:16 };
const iBtn = (filled, color) => ({
  background: filled ? (color||C.forest) : "transparent",
  color: filled ? C.white : (color||C.forest),
  border: filled ? "none" : `1.5px solid ${color||C.forest}`,
  borderRadius:100, padding:"9px 18px",
  fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit",
});
const INPUT = { width:"100%", background:C.white, border:`1.5px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
const LBL   = { fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".05em", marginBottom:5, display:"block" };
const STATUS_COLORS = { "a decorrer":["#c47a00","#fff3e0"], "confirmado":["#16773a","#dcf0e3"], "pendente":["#5a6a7a","#f0f4f8"], "rejeitado":[C.red,"#fde8d8"], "orçamento_enviado":["#6c5ce7","#ede8fc"] };

const Badge = ({ color, bg, children }) => (
  <span style={{ background:bg, color, borderRadius:100, padding:"2px 9px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>{children}</span>
);
const Tag = ({ bg="#e8f5ec", color="#2d6b45", children }) => (
  <span style={{ background:bg, color, borderRadius:8, padding:"3px 9px", fontSize:11, fontWeight:500, whiteSpace:"nowrap" }}>{children}</span>
);
const Stars = ({ r }) => (
  <span style={{ fontSize:12, color:C.amber }}>
    {"★".repeat(Math.floor(r))}<span style={{ color:"#ddd" }}>{"★".repeat(5-Math.floor(r))}</span>
    <span style={{ color:C.muted, marginLeft:4 }}>{r}</span>
  </span>
);
const BackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ alignSelf:"flex-start", background:C.pale, border:"none", borderRadius:100, padding:"7px 14px", fontWeight:600, fontSize:13, cursor:"pointer", color:C.forest, fontFamily:"inherit" }}>← Voltar</button>
);

/* ─────────────────────────────────────────────
   LOGIN
───────────────────────────────────────────── */
function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handle = (em, pw="1234") => {
    setLoading(true); setError("");
    setTimeout(() => {
      const u = USERS.find(u => u.email===em && u.password===pw);
      u ? onLogin(u) : (setError("Email ou password incorretos."), setLoading(false));
    }, 500);
  };

  const demos = [
    { label:"Dono — Diogo",    email:"diogo@demo.com",  role:"dono",     emoji:"🐾" },
    { label:"Dono — Rita",     email:"rita@demo.com",   role:"dono",     emoji:"🐾" },
    { label:"Cuidadora — Ana", email:"ana@demo.com",    role:"cuidador", emoji:"👩‍🦰" },
    { label:"Cuidador — Carlos",email:"carlos@demo.com",role:"cuidador", emoji:"👨‍🦳" },
  ];

  return (
    <div style={{ minHeight:"100dvh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:C.cream, padding:24, fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:64, height:64, borderRadius:"50% 50% 50% 14%", background:C.forest, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 14px" }}>🐾</div>
          <h1 style={{ margin:0, fontSize:26, fontWeight:800, color:C.forest }}>PetLink</h1>
          <p style={{ color:C.muted, fontSize:14, margin:"6px 0 0" }}>Cuidados e proteção animal</p>
        </div>

        <div style={{ ...card, padding:24, display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={LBL}>Email</label>
            <input style={INPUT} type="email" placeholder="o teu email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle(email,password)}/>
          </div>
          <div>
            <label style={LBL}>Password</label>
            <input style={INPUT} type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle(email,password)}/>
          </div>
          {error && <div style={{ background:C.redBg, color:C.red, borderRadius:10, padding:"9px 14px", fontSize:13, fontWeight:600 }}>⚠️ {error}</div>}
          <button onClick={()=>handle(email,password)} disabled={loading} style={{ ...iBtn(true), width:"100%", textAlign:"center", padding:"13px 0", fontSize:14, opacity:loading?.7:1 }}>
            {loading?"A entrar...":"Entrar →"}
          </button>
        </div>

        <div style={{ marginTop:20 }}>
          <p style={{ textAlign:"center", color:C.muted, fontSize:12, marginBottom:12 }}>Contas de demo (password: 1234)</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {demos.map((d,i)=>(
              <button key={i} onClick={()=>handle(d.email)} style={{ background:d.role==="dono"?C.pale:C.purpleBg, border:`1px solid ${d.role==="dono"?C.border:C.purple+"44"}`, borderRadius:12, padding:"10px 12px", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{d.emoji}</div>
                <div style={{ fontWeight:700, fontSize:12, color:d.role==="dono"?C.forest:C.purple }}>{d.label}</div>
                <div style={{ fontSize:11, color:C.muted }}>{d.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SHARED: ALERTS
───────────────────────────────────────────── */
function AlertsScreen({ alerts, setAlerts }) {
  const [view, setView] = useState("list");
  const [aType, setAType] = useState("perdido");
  const [done, setDone]   = useState(false);
  const [form, setForm]   = useState({ name:"", breed:"", area:"", contact:"", description:"", reward:"" });
  const ch = f => e => setForm(p=>({...p,[f]:e.target.value}));

  const submit = () => {
    if (!form.name||!form.area||!form.contact) return;
    setAlerts(a=>[{ id:Date.now(), type:aType, name:form.name, photo:aType==="perdido"?"🐾":"🐕", area:form.area, time:"Agora mesmo", description:form.description, contact:form.contact, distance:"—", reward:form.reward?form.reward+"€":null, active:true },...a]);
    setDone(true);
    setTimeout(()=>{ setDone(false); setView("list"); setForm({ name:"",breed:"",area:"",contact:"",description:"",reward:"" }); },2200);
  };

  if (view==="sos") return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <BackBtn onClick={()=>setView("list")}/>
      <div><h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>🚨 SOS Pet</h2><p style={{ color:C.muted, fontSize:13, margin:"4px 0 0" }}>Cria um alerta para a tua comunidade</p></div>
      {done ? (
        <div style={{ ...card, textAlign:"center", padding:48, background:"#e8f5ec", border:`2px solid ${C.mint}` }}>
          <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
          <div style={{ fontWeight:800, fontSize:18, color:C.forest }}>Alerta publicado!</div>
        </div>
      ) : <>
        <div style={card}>
          <label style={LBL}>Tipo</label>
          <div style={{ display:"flex", gap:8 }}>
            {[["perdido","🔴 Perdido","#fde8d8",C.red],["encontrado","🟢 Encontrado","#dcf0e3","#16773a"]].map(([t,l,bg,col])=>(
              <button key={t} onClick={()=>setAType(t)} style={{ flex:1, background:aType===t?bg:"#f8faf9", border:`2px solid ${aType===t?col:C.border}`, borderRadius:12, padding:"11px 0", fontSize:13, fontWeight:700, color:aType===t?col:C.muted, cursor:"pointer", fontFamily:"inherit" }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={card}>
          <label style={LBL}>Animal</label>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div><label style={LBL}>Nome *</label><input style={INPUT} placeholder="ex: Mimi" value={form.name} onChange={ch("name")}/></div>
              <div><label style={LBL}>Raça</label><input style={INPUT} placeholder="ex: Persa" value={form.breed} onChange={ch("breed")}/></div>
            </div>
            <div><label style={LBL}>Descrição</label><textarea style={{ ...INPUT, resize:"none", height:68 }} placeholder="Cor, marcas, coleira..." value={form.description} onChange={ch("description")}/></div>
          </div>
        </div>
        <div style={card}>
          <label style={LBL}>Localização e contacto</label>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div><label style={LBL}>Zona *</label><input style={INPUT} placeholder="ex: Porto, Cedofeita" value={form.area} onChange={ch("area")}/></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div><label style={LBL}>Contacto *</label><input style={INPUT} placeholder="912 345 678" value={form.contact} onChange={ch("contact")}/></div>
              <div><label style={LBL}>Recompensa (€)</label><input style={INPUT} type="number" placeholder="50" value={form.reward} onChange={ch("reward")}/></div>
            </div>
          </div>
        </div>
        <button onClick={submit} style={{ ...iBtn(true), background:C.red, width:"100%", textAlign:"center", padding:"14px 0", fontSize:14, opacity:(!form.name||!form.area||!form.contact)?.5:1 }}>🚨 Publicar alerta</button>
      </>}
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div><h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>Alertas</h2><p style={{ color:C.muted, fontSize:13, margin:"2px 0 0" }}>Porto · {alerts.length} ativos</p></div>
        <button onClick={()=>setView("sos")} style={{ background:C.red, color:C.white, border:"none", borderRadius:100, padding:"9px 16px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>🚨 SOS Pet</button>
      </div>
      {alerts.map(a=>(
        <div key={a.id} style={{ ...card, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:54, height:54, borderRadius:14, background:a.type==="perdido"?"#fde8d8":"#dcf0e3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>{a.photo}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:3 }}>
              <span style={{ fontWeight:700, fontSize:15 }}>{a.name}</span>
              <Badge color={a.type==="perdido"?C.red:"#16773a"} bg={a.type==="perdido"?"#fde8d8":"#dcf0e3"}>{a.type==="perdido"?"🔴 Perdido":"🟢 Encontrado"}</Badge>
              {a.reward && <Badge color="#c47a00" bg="#fff3e0">🏆 {a.reward}</Badge>}
            </div>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.5, marginBottom:6 }}>{a.description}</div>
            <div style={{ display:"flex", gap:5, overflow:"hidden" }}>
              <Tag>📍 {a.area}</Tag>
              <Tag bg="#f0f4f8" color="#5a6a7a">⏰ {a.time}</Tag>
              <Tag bg="#f0f4f8" color="#5a6a7a">📏 {a.distance}</Tag>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
            <button title="Contactar" style={{ width:36,height:36,borderRadius:"50%",background:C.forest,border:"none",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>📞</button>
            <button title="Partilhar"  style={{ width:36,height:36,borderRadius:"50%",background:"transparent",border:`1.5px solid ${C.forest}`,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>🔁</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DONO: PETS
───────────────────────────────────────────── */
function PetsScreen({ ownerPets }) {
  const [sel, setSel]     = useState(null);
  const [sub, setSub]     = useState("info");
  const pet = ownerPets.find(p=>p.id===sel);

  if (pet) return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <BackBtn onClick={()=>setSel(null)}/>
      <div style={{ ...card, background:pet.color, border:"none", display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ width:64, height:64, borderRadius:18, background:"rgba(255,255,255,.55)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>{pet.species}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:800 }}>{pet.name}</div>
          <div style={{ color:C.muted, fontSize:13, margin:"2px 0 8px" }}>{pet.breed} · {pet.age} anos · {pet.weight}</div>
          <Badge color={pet.status==="Em casa"?"#16773a":"#c47a00"} bg={pet.status==="Em casa"?"#dcf0e3":"#fff3e0"}>{pet.status}</Badge>
        </div>
      </div>
      <div style={{ display:"flex", background:"#f0f7f2", borderRadius:12, padding:4 }}>
        {["info","vacinas","historial"].map(t=>(
          <button key={t} onClick={()=>setSub(t)} style={{ flex:1, background:sub===t?C.white:"transparent", border:"none", borderRadius:9, padding:"8px 0", fontWeight:700, fontSize:13, color:sub===t?C.forest:C.muted, cursor:"pointer", fontFamily:"inherit", textTransform:"capitalize" }}>{t}</button>
        ))}
      </div>
      {sub==="info" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[["Microchip",pet.microchip],["Próxima consulta",pet.nextVet],["Raça",pet.breed],["Peso",pet.weight]].map(([k,v])=>(
              <div key={k} style={card}><div style={{ fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4 }}>{k}</div><div style={{ fontWeight:600,fontSize:14 }}>{v}</div></div>
            ))}
          </div>
          <div style={card}><div style={{ fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6 }}>Notas</div><div style={{ fontSize:14,color:C.text,lineHeight:1.6 }}>{pet.notes}</div></div>
        </div>
      )}
      {sub==="vacinas" && (
        <div style={card}>
          {pet.vaccines.map((v,i)=>(
            <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#f0f7f2",borderRadius:10,marginBottom:8 }}>
              <span>💉</span><span style={{ flex:1,fontWeight:500,fontSize:14 }}>{v}</span><Badge color="#16773a" bg="#dcf0e3">✓ Ok</Badge>
            </div>
          ))}
          <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#fff3e0",borderRadius:10 }}>
            <span>⚠️</span><span style={{ flex:1,fontSize:14,fontWeight:500 }}>Reforço anual</span><span style={{ fontSize:13,color:"#c47a00",fontWeight:600 }}>{pet.nextVet}</span>
          </div>
        </div>
      )}
      {sub==="historial" && (
        <div style={card}>
          {[{ date:"10 Jan 2025",title:"Consulta de rotina",vet:"Dr. Carvalho",note:"Tudo normal." },
            { date:"3 Out 2024",title:"Vacinação anual",vet:"VetPorto",note:"Vacinas em dia." },
            { date:"18 Jun 2024",title:"Otite leve",vet:"Dr. Carvalho",note:"Tratamento 10 dias." }].map((h,i)=>(
            <div key={i} style={{ display:"flex",gap:12,paddingBottom:12,borderBottom:i<2?`1px solid ${C.border}`:"none",marginBottom:i<2?12:0 }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:C.moss,marginTop:5,flexShrink:0 }}/>
              <div><div style={{ fontSize:11,color:C.muted }}>{h.date} · {h.vet}</div><div style={{ fontWeight:600,fontSize:14,margin:"2px 0" }}>{h.title}</div><div style={{ fontSize:13,color:C.muted }}>{h.note}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>Os meus animais</h2>
        <button style={{ ...iBtn(true), padding:"8px 14px" }}>+ Novo</button>
      </div>
      {ownerPets.map(p=>(
        <div key={p.id} onClick={()=>{ setSel(p.id); setSub("info"); }} style={{ ...card, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
          <div style={{ width:52,height:52,borderRadius:14,background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26 }}>{p.species}</div>
          <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:15 }}>{p.name}</div><div style={{ fontSize:13,color:C.muted,marginTop:2 }}>{p.breed} · {p.age} anos</div></div>
          <Badge color={p.status==="Em casa"?"#16773a":"#c47a00"} bg={p.status==="Em casa"?"#dcf0e3":"#fff3e0"}>{p.status}</Badge>
          <span style={{ color:C.muted, fontSize:18 }}>›</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DONO: CAREGIVERS + BOOKING REQUEST
───────────────────────────────────────────── */
function CaregiversScreen({ user, ownerPets, bookings, setBookings }) {
  const [sel, setSel]           = useState(null);
  const [filter, setFilter]     = useState("Todos");
  const [showBook, setShowBook] = useState(false);
  const [bookDone, setBookDone] = useState(false);
  const [bf, setBf]             = useState({ pet_id:"", service:"", date:"", time:"", notes:"" });

  const services = ["Todos","Pet Sitting","Passeios","Banho","Treino","Hospedagem"];
  const list = filter==="Todos" ? CAREGIVER_PROFILES : CAREGIVER_PROFILES.filter(c=>c.services.includes(filter));
  const cgP = sel ? CAREGIVER_PROFILES.find(c=>c.user_id===sel) : null;
  const cgU = sel ? USERS.find(u=>u.id===sel) : null;
  const cgReviews = sel ? REVIEWS.filter(r=>r.caregiver_id===sel) : [];

  const submitBooking = () => {
    if (!bf.pet_id||!bf.service||!bf.date||!bf.time) return;
    setBookings(b=>[...b,{ id:Date.now(), owner_id:user.id, caregiver_id:sel, pet_id:parseInt(bf.pet_id), service:bf.service, date:bf.date, time:bf.time, duration:1, status:"pendente", price:cgP.price_per_hour, notes:bf.notes, created_at:new Date().toISOString().split("T")[0] }]);
    setBookDone(true);
    setTimeout(()=>{ setBookDone(false); setShowBook(false); setBf({ pet_id:"",service:"",date:"",time:"",notes:"" }); },2200);
  };

  if (cgP && cgU) return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <BackBtn onClick={()=>{ setSel(null); setShowBook(false); setBookDone(false); }}/>
      <div style={{ ...card, textAlign:"center", padding:24 }}>
        <div style={{ width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg,${C.mint},${C.moss})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 12px" }}>{cgU.avatar}</div>
        <div style={{ fontWeight:800, fontSize:20 }}>{cgU.name}</div>
        {cgP.badge && <div style={{ marginTop:6 }}><Badge color="#c47a00" bg="#fff3e0">{cgP.badge}</Badge></div>}
        <div style={{ marginTop:8 }}><Stars r={cgP.rating}/> <span style={{ color:C.muted, fontSize:12 }}>({cgP.reviews} avaliações)</span></div>
        <div style={{ color:C.muted, fontSize:13, marginTop:10, lineHeight:1.6 }}>{cgP.description}</div>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:12, flexWrap:"wrap" }}>
          <Tag>📍 {cgU.location}</Tag><Tag bg="#f0f4f8" color="#5a6a7a">🏃 {cgP.distance}</Tag>
          {cgP.has_garden && <Tag bg="#dcf0e3" color="#16773a">🌿 Jardim</Tag>}
        </div>
      </div>
      <div style={card}><div style={{ fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:10 }}>Serviços</div><div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{cgP.services.map(sv=><Tag key={sv}>{sv}</Tag>)}</div></div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <div style={card}><div style={{ fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>Preço/hora</div><div style={{ fontWeight:800,fontSize:20,color:C.forest }}>{cgP.price_per_hour}€</div></div>
        <div style={card}><div style={{ fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>Disponível</div><Badge color={cgP.available?"#16773a":"#888"} bg={cgP.available?"#dcf0e3":"#f0f4f8"}>{cgP.available?"Sim":"Não"}</Badge></div>
      </div>
      {cgReviews.length>0 && (
        <div style={card}>
          <div style={{ fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:12 }}>Avaliações</div>
          {cgReviews.map(r=>{ const o=USERS.find(u=>u.id===r.owner_id); return (
            <div key={r.id} style={{ paddingBottom:12,borderBottom:`1px solid ${C.border}`,marginBottom:12 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}><span>{o?.avatar}</span><span style={{ fontWeight:600,fontSize:14 }}>{o?.name}</span><Stars r={r.rating}/></div>
              <p style={{ fontSize:13,color:C.text,margin:0 }}>"{r.comment}"</p>
            </div>
          );})}
        </div>
      )}

      {/* BOOKING FORM */}
      {showBook ? (
        bookDone ? (
          <div style={{ ...card, textAlign:"center", padding:40, background:"#e8f5ec", border:`2px solid ${C.mint}` }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <div style={{ fontWeight:800, fontSize:17, color:C.forest }}>Pedido enviado!</div>
            <div style={{ color:C.muted, fontSize:14, marginTop:6 }}>O cuidador irá confirmar em breve.</div>
          </div>
        ) : (
          <div style={{ ...card, border:`2px solid ${C.mint}` }}>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:14 }}>📅 Fazer reserva com {cgU.name}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div>
                <label style={LBL}>Animal *</label>
                <select style={INPUT} value={bf.pet_id} onChange={e=>setBf(f=>({...f,pet_id:e.target.value}))}>
                  <option value="">Seleciona o animal</option>
                  {ownerPets.map(p=><option key={p.id} value={p.id}>{p.species} {p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>Serviço *</label>
                <select style={INPUT} value={bf.service} onChange={e=>setBf(f=>({...f,service:e.target.value}))}>
                  <option value="">Seleciona o serviço</option>
                  {cgP.services.map(sv=><option key={sv} value={sv}>{sv}</option>)}
                </select>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div><label style={LBL}>Data *</label><input style={INPUT} type="date" value={bf.date} onChange={e=>setBf(f=>({...f,date:e.target.value}))}/></div>
                <div><label style={LBL}>Hora *</label><input style={INPUT} type="time" value={bf.time} onChange={e=>setBf(f=>({...f,time:e.target.value}))}/></div>
              </div>
              <div><label style={LBL}>Notas para o cuidador</label><textarea style={{ ...INPUT,resize:"none",height:60 }} placeholder="Instruções especiais..." value={bf.notes} onChange={e=>setBf(f=>({...f,notes:e.target.value}))}/></div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <button onClick={submitBooking} style={{ ...iBtn(true), flex:1, textAlign:"center", padding:"12px 0", opacity:(!bf.pet_id||!bf.service||!bf.date||!bf.time)?.5:1 }}>Enviar pedido</button>
              <button onClick={()=>setShowBook(false)} style={{ ...iBtn(false), padding:"12px 16px" }}>Cancelar</button>
            </div>
          </div>
        )
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <button onClick={()=>setShowBook(true)} disabled={!cgP.available} style={{ ...iBtn(true), width:"100%", textAlign:"center", padding:"13px 0", opacity:cgP.available?1:.5 }}>📅 {cgP.available?"Reservar agora":"Indisponível"}</button>
          <button style={{ ...iBtn(false), width:"100%", textAlign:"center", padding:"13px 0" }}>💬 Enviar mensagem</button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>Cuidadores</h2>
      <div style={{ display:"flex", alignItems:"center", gap:8, background:C.white, border:`1px solid ${C.border}`, borderRadius:100, padding:"9px 14px" }}>
        <span>🔍</span><span style={{ color:"#bbb", fontSize:13 }}>Pesquisar cuidadores...</span>
      </div>
      <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:2 }}>
        {services.map(sv=>(
          <button key={sv} onClick={()=>setFilter(sv)} style={{ background:filter===sv?C.forest:"#f0f7f2", color:filter===sv?C.white:C.muted, border:"none", borderRadius:100, padding:"6px 14px", fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit" }}>{sv}</button>
        ))}
      </div>
      {list.map(c=>{ const u=USERS.find(us=>us.id===c.user_id); return (
        <div key={c.user_id} onClick={()=>setSel(c.user_id)} style={{ ...card, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
          <div style={{ width:48,height:48,borderRadius:"50%",background:`linear-gradient(135deg,${C.mint},${C.moss})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0 }}>{u?.avatar}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontWeight:700,fontSize:15 }}>{u?.name}</span>{c.verified&&<span>✅</span>}</div>
            <Stars r={c.rating}/>
            <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap" }}>{c.services.slice(0,2).map(sv=><Tag key={sv}>{sv}</Tag>)}</div>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <div style={{ fontWeight:700,color:C.forest,fontSize:15 }}>{c.price_per_hour}€/h</div>
            <div style={{ fontSize:12,color:"#bbb" }}>{c.distance}</div>
            <Badge color={c.available?"#16773a":"#888"} bg={c.available?"#dcf0e3":"#f0f4f8"}>{c.available?"Disponível":"Ocupado"}</Badge>
          </div>
        </div>
      );})}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DONO: BOOKINGS
───────────────────────────────────────────── */
function DonoBookingsScreen({ user, bookings, setBookings }) {
  const mine = bookings.filter(b=>b.owner_id===user.id);
  const update = (id, fields) => setBookings(bs => bs.map(b => b.id===id ? {...b,...fields} : b));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>As minhas reservas</h2>
      {mine.length===0 && (
        <div style={{ ...card, textAlign:"center", padding:40, color:C.muted }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🗓️</div>
          <div style={{ fontWeight:600 }}>Sem reservas ainda</div>
          <div style={{ fontSize:13, marginTop:6 }}>Vai a Cuidadores para fazer a primeira reserva!</div>
        </div>
      )}
      {["a decorrer","orçamento_enviado","confirmado","pendente","rejeitado"].map(status=>{
        const list = mine.filter(b=>b.status===status);
        if (!list.length) return null;
        const labels={ "a decorrer":"A decorrer","orçamento_enviado":"Orçamento recebido — aguarda a tua resposta","confirmado":"Confirmado","pendente":"Aguarda orçamento","rejeitado":"Rejeitado" };
        return (
          <div key={status}>
            <div style={{ fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8 }}>{labels[status]}</div>
            {list.map(b=>{ const cU=USERS.find(u=>u.id===b.caregiver_id); const pet=PETS.find(p=>p.id===b.pet_id); return (
              <div key={b.id} style={{ ...card, marginBottom:10, border: status==="orçamento_enviado" ? `2px solid ${C.purple}` : `1px solid ${C.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom: b.quote_price ? 12 : 0 }}>
                  <div style={{ width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${C.mint},${C.moss})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{cU?.avatar}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700,fontSize:14 }}>{pet?.species} {pet?.name} com {cU?.name}</div>
                    <div style={{ color:C.muted,fontSize:13,marginTop:2 }}>{b.service} · {b.date} {b.time}</div>
                    {b.notes&&<div style={{ fontSize:12,color:C.muted,fontStyle:"italic",marginTop:2 }}>"{b.notes}"</div>}
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontWeight:700,color:C.forest,fontSize:15,marginBottom:4 }}>{b.quote_price||b.price}€</div>
                    <Badge color={STATUS_COLORS[b.status]?.[0]} bg={STATUS_COLORS[b.status]?.[1]}>{b.status}</Badge>
                  </div>
                </div>

                {/* Quote details for dono to review */}
                {status==="orçamento_enviado" && b.quote_price && (
                  <>
                    <div style={{ background:"#ede8fc", borderRadius:12, padding:14, marginBottom:12, border:"1px solid #c8b8f8" }}>
                      <div style={{ fontSize:11, color:C.purple, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>💶 Orçamento do cuidador</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom: b.quote_notes ? 10 : 0 }}>
                        {[["Valor",`${b.quote_price}€`],["Data",`${b.quote_date||b.date}`],["Hora",`${b.quote_time||b.time}`],["Cuidador",cU?.name]].map(([k,v])=>(
                          <div key={k} style={{ background:"rgba(255,255,255,0.7)", borderRadius:9, padding:"8px 10px" }}>
                            <div style={{ fontSize:10,color:C.purple,fontWeight:700,textTransform:"uppercase" }}>{k}</div>
                            <div style={{ fontWeight:700,fontSize:14,marginTop:2,color:C.purple }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {b.quote_notes && <div style={{ fontSize:13, color:"#6c5ce7", fontStyle:"italic" }}>📝 "{b.quote_notes}"</div>}
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>update(b.id,{status:"confirmado",price:b.quote_price,date:b.quote_date||b.date,time:b.quote_time||b.time})} style={{ ...iBtn(true),flex:1,textAlign:"center",padding:"12px 0" }}>✅ Aceitar orçamento</button>
                      <button onClick={()=>update(b.id,{status:"rejeitado"})} style={{ ...iBtn(true),background:C.red,padding:"12px 16px" }}>❌</button>
                    </div>
                  </>
                )}
              </div>
            );})}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DONO: DASHBOARD
───────────────────────────────────────────── */
function DonoDashboard({ user, setTab, ownerPets, bookings, alerts }) {
  const mine    = bookings.filter(b=>b.owner_id===user.id);
  const active  = mine.find(b=>b.status==="a decorrer");
  const pending = mine.filter(b=>b.status==="pendente").length;
  const quotePending = mine.filter(b=>b.status==="orçamento_enviado").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div><p style={{ color:C.muted,fontSize:13,margin:0 }}>Bom dia 👋</p><h1 style={{ margin:0,fontSize:20,fontWeight:800 }}>Olá, {user.name.split(" ")[0]}</h1></div>
        <div style={{ position:"relative", cursor:"pointer" }}>
          <div style={{ width:40,height:40,borderRadius:"50%",background:C.forest,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🔔</div>
          {(pending+quotePending)>0&&<div style={{ position:"absolute",top:-2,right:-2,width:16,height:16,background:C.amber,borderRadius:"50%",border:"2px solid "+C.cream,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:700 }}>{pending+quotePending}</div>}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
        {[{ label:"Pets",icon:"🐾",val:ownerPets.length,tab:"pets",bg:"#e8f5ec" },
          { label:"Alertas",icon:"📍",val:alerts.length,tab:"alerts",bg:"#fff3e0" },
          { label:"Reservas",icon:"🗓️",val:mine.length,tab:"bookings",bg:"#ede8fc" }].map(s=>(
          <div key={s.tab} onClick={()=>setTab(s.tab)} style={{ ...card,background:s.bg,border:"none",cursor:"pointer",padding:"14px 12px",textAlign:"center" }}>
            <div style={{ fontSize:22 }}>{s.icon}</div><div style={{ fontWeight:800,fontSize:22,margin:"4px 0 0" }}>{s.val}</div><div style={{ fontSize:11,color:C.muted,fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {active&&(
        <div style={{ background:`linear-gradient(135deg,${C.forest},#2d7a48)`,borderRadius:16,padding:16,color:"#fff",display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>{USERS.find(u=>u.id===active.caregiver_id)?.avatar}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11,opacity:.7 }}>A decorrer agora</div>
            <div style={{ fontWeight:700,fontSize:15 }}>{PETS.find(p=>p.id===active.pet_id)?.name} com {USERS.find(u=>u.id===active.caregiver_id)?.name}</div>
            <div style={{ fontSize:12,opacity:.8 }}>{active.service} · {active.date}</div>
          </div>
        </div>
      )}
      {quotePending>0&&(
        <div onClick={()=>setTab("bookings")} style={{ ...card,background:"#ede8fc",border:"2px solid #c8b8f8",cursor:"pointer",display:"flex",alignItems:"center",gap:12 }}>
          <span style={{ fontSize:24 }}>💶</span>
          <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:14,color:C.purple }}>{quotePending} orçamento{quotePending>1?"s":""} a aguardar a tua resposta</div><div style={{ fontSize:13,color:"#9b8fd4" }}>Toca para ver e aceitar</div></div>
          <span style={{ fontSize:18,color:C.purple }}>›</span>
        </div>
      )}
      {pending>0&&(
        <div onClick={()=>setTab("bookings")} style={{ ...card,background:"#fff3e0",border:"1px solid #f5d08a",cursor:"pointer",display:"flex",alignItems:"center",gap:12 }}>
          <span style={{ fontSize:24 }}>⏳</span>
          <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:14 }}>{pending} reserva{pending>1?"s":""} a aguardar confirmação</div><div style={{ fontSize:13,color:C.muted }}>Toca para ver detalhes</div></div>
          <span style={{ fontSize:18,color:C.muted }}>›</span>
        </div>
      )}
      <div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
          <span style={{ fontWeight:700,fontSize:15 }}>Os meus animais</span>
          <span onClick={()=>setTab("pets")} style={{ color:C.moss,fontSize:13,fontWeight:600,cursor:"pointer" }}>Ver todos →</span>
        </div>
        <div style={{ display:"flex",gap:10,overflowX:"auto",paddingBottom:4 }}>
          {ownerPets.map(p=>(
            <div key={p.id} onClick={()=>setTab("pets")} style={{ ...card,minWidth:130,flexShrink:0,textAlign:"center",background:p.color,border:"none",cursor:"pointer" }}>
              <div style={{ fontSize:30,marginBottom:6 }}>{p.species}</div>
              <div style={{ fontWeight:700,fontSize:14 }}>{p.name}</div>
              <div style={{ fontSize:11,color:C.muted,margin:"2px 0 8px" }}>{p.breed}</div>
              <Badge color={p.status==="Em casa"?"#16773a":"#c47a00"} bg={p.status==="Em casa"?"#dcf0e3":"#fff3e0"}>{p.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CUIDADOR: DASHBOARD
───────────────────────────────────────────── */
function CuidadorDashboard({ user, profile, bookings, setTab }) {
  const mine    = bookings.filter(b=>b.caregiver_id===user.id);
  const pending = mine.filter(b=>b.status==="pendente");
  const earning = mine.filter(b=>["confirmado","a decorrer"].includes(b.status)).reduce((s,b)=>s+b.price,0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div><p style={{ color:C.muted,fontSize:13,margin:0 }}>Painel do cuidador</p><h1 style={{ margin:0,fontSize:20,fontWeight:800 }}>Olá, {user.name.split(" ")[0]} {user.avatar}</h1></div>
        <Badge color={profile?.available?"#16773a":"#888"} bg={profile?.available?"#dcf0e3":"#f0f4f8"}>{profile?.available?"● Disponível":"● Ocupado"}</Badge>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
        {[{ label:"Pedidos",icon:"📩",val:pending.length,tab:"requests",bg:"#fff3e0" },
          { label:"Confirmados",icon:"✅",val:mine.filter(b=>b.status==="confirmado").length,tab:"requests",bg:"#e8f5ec" },
          { label:"Ganhos €",icon:"💶",val:earning,tab:"requests",bg:"#ede8fc" }].map(s=>(
          <div key={s.label} onClick={()=>setTab(s.tab)} style={{ ...card,background:s.bg,border:"none",cursor:"pointer",padding:"14px 12px",textAlign:"center" }}>
            <div style={{ fontSize:22 }}>{s.icon}</div><div style={{ fontWeight:800,fontSize:22,margin:"4px 0 0" }}>{s.val}{s.label==="Ganhos €"?"€":""}</div><div style={{ fontSize:11,color:C.muted,fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {pending.length>0&&(
        <div style={{ ...card,background:"#fff3e0",border:"1px solid #f5d08a" }}>
          <div style={{ fontWeight:700,fontSize:15,marginBottom:12 }}>📩 Novos pedidos ({pending.length})</div>
          {pending.slice(0,2).map(b=>{ const owner=USERS.find(u=>u.id===b.owner_id); const pet=PETS.find(p=>p.id===b.pet_id); return (
            <div key={b.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderTop:`1px solid #f5d08a` }}>
              <span style={{ fontSize:22 }}>{owner?.avatar}</span>
              <div style={{ flex:1 }}><div style={{ fontWeight:600,fontSize:14 }}>{owner?.name}</div><div style={{ fontSize:12,color:C.muted }}>{pet?.species} {pet?.name} · {b.service} · {b.date}</div></div>
              <button onClick={()=>setTab("requests")} style={{ ...iBtn(true),padding:"6px 12px",fontSize:12 }}>Ver</button>
            </div>
          );})}
          {pending.length>2&&<div onClick={()=>setTab("requests")} style={{ textAlign:"center",color:C.moss,fontSize:13,fontWeight:600,cursor:"pointer",paddingTop:8 }}>+{pending.length-2} mais →</div>}
        </div>
      )}
      <div style={card}>
        <div style={{ fontWeight:700,fontSize:15,marginBottom:12 }}>📊 Resumo geral</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[["Total reservas",mine.length],["Avaliação",profile?.rating||"—"],["Avaliações",profile?.reviews||0],["Preço/h",`${profile?.price_per_hour||0}€`]].map(([k,v])=>(
            <div key={k} style={{ background:C.pale,borderRadius:12,padding:12 }}>
              <div style={{ fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase" }}>{k}</div>
              <div style={{ fontWeight:800,fontSize:20,color:C.forest,marginTop:4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CUIDADOR: AGENDA (confirmed/active only)
───────────────────────────────────────────── */
function CuidadorAgenda({ user, bookings, setBookings }) {
  const mine = bookings.filter(b => b.caregiver_id===user.id && ["confirmado","a decorrer"].includes(b.status));
  const update = (id, status) => setBookings(bs => bs.map(b => b.id===id ? {...b, status} : b));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>📅 Agenda</h2>
      {mine.length===0 && (
        <div style={{ ...card, textAlign:"center", padding:40, color:C.muted }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🗓️</div>
          <div style={{ fontWeight:600 }}>Sem serviços confirmados</div>
          <div style={{ fontSize:13, marginTop:6 }}>Os pedidos aceites aparecem aqui.</div>
        </div>
      )}
      {["a decorrer","confirmado"].map(status => {
        const list = mine.filter(b => b.status===status);
        if (!list.length) return null;
        const labels = { "a decorrer":"🟠 A decorrer", "confirmado":"✅ Confirmados" };
        return (
          <div key={status}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>{labels[status]} ({list.length})</div>
            {list.map(b => {
              const owner = USERS.find(u => u.id===b.owner_id);
              const pet   = PETS.find(p => p.id===b.pet_id);
              return (
                <div key={b.id} style={{ ...card, marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <div style={{ width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${C.mint},${C.moss})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{owner?.avatar}</div>
                    <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:14 }}>{owner?.name}</div><div style={{ color:C.muted, fontSize:12 }}>{owner?.phone}</div></div>
                    <Badge color={STATUS_COLORS[b.status]?.[0]} bg={STATUS_COLORS[b.status]?.[1]}>{b.status}</Badge>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:10 }}>
                    {[["Animal",`${pet?.species} ${pet?.name}`],["Serviço",b.service],["Data",`${b.date} ${b.time}`],["Valor",`${b.quote_price||b.price}€`]].map(([k,v])=>(
                      <div key={k} style={{ background:C.pale,borderRadius:10,padding:"8px 10px" }}><div style={{ fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase" }}>{k}</div><div style={{ fontWeight:600,fontSize:13,marginTop:2 }}>{v}</div></div>
                    ))}
                  </div>
                  {b.notes && <div style={{ background:"#f8faf9",borderRadius:10,padding:"8px 12px",fontSize:13,color:C.muted,marginBottom:10,fontStyle:"italic" }}>📝 "{b.notes}"</div>}
                  {status==="confirmado" && <button onClick={()=>update(b.id,"a decorrer")} style={{ ...iBtn(true),width:"100%",textAlign:"center",padding:"10px 0",background:C.amber }}>▶ Iniciar serviço</button>}
                  {status==="a decorrer" && <button onClick={()=>update(b.id,"concluido")}  style={{ ...iBtn(false),width:"100%",textAlign:"center",padding:"10px 0" }}>✓ Concluir serviço</button>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CUIDADOR: PEDIDOS (quote flow)
───────────────────────────────────────────── */
function CuidadorPedidos({ user, bookings, setBookings }) {
  const [quoteOpen, setQuoteOpen] = useState(null); // booking id
  const [qForm, setQForm]         = useState({ price:"", notes:"", visit_date:"", visit_time:"" });

  const mine = bookings.filter(b => b.caregiver_id===user.id && ["pendente","orçamento_enviado","rejeitado"].includes(b.status));
  const update = (id, fields) => setBookings(bs => bs.map(b => b.id===id ? {...b, ...fields} : b));

  const sendQuote = (b) => {
    if (!qForm.price) return;
    update(b.id, {
      status: "orçamento_enviado",
      quote_price: parseFloat(qForm.price),
      quote_notes: qForm.notes,
      quote_date:  qForm.visit_date || b.date,
      quote_time:  qForm.visit_time || b.time,
    });
    setQuoteOpen(null);
    setQForm({ price:"", notes:"", visit_date:"", visit_time:"" });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div>
        <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>📩 Pedidos</h2>
        <p style={{ color:C.muted, fontSize:13, margin:"4px 0 0" }}>Analisa cada pedido e envia um orçamento ao dono</p>
      </div>

      {mine.length===0 && (
        <div style={{ ...card, textAlign:"center", padding:40, color:C.muted }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
          <div style={{ fontWeight:600 }}>Sem pedidos de momento</div>
        </div>
      )}

      {["pendente","orçamento_enviado","rejeitado"].map(status => {
        const list = mine.filter(b => b.status===status);
        if (!list.length) return null;
        const labels = { "pendente":"🔵 Novos pedidos", "orçamento_enviado":"🟣 Orçamento enviado — aguarda dono", "rejeitado":"❌ Rejeitados" };
        return (
          <div key={status}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>{labels[status]} ({list.length})</div>
            {list.map(b => {
              const owner = USERS.find(u => u.id===b.owner_id);
              const pet   = PETS.find(p => p.id===b.pet_id);
              const isOpen = quoteOpen===b.id;
              return (
                <div key={b.id} style={{ ...card, marginBottom:10, border: status==="pendente" ? `2px solid ${C.mint}` : `1px solid ${C.border}` }}>
                  {/* header */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${C.mint},${C.moss})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{owner?.avatar}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>{owner?.name}</div>
                      <div style={{ color:C.muted, fontSize:12 }}>📞 {owner?.phone}</div>
                    </div>
                    <Badge color={STATUS_COLORS[b.status]?.[0]} bg={STATUS_COLORS[b.status]?.[1]}>{b.status}</Badge>
                  </div>

                  {/* request details */}
                  <div style={{ background:C.pale, borderRadius:12, padding:12, marginBottom:10 }}>
                    <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Pedido do dono</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                      {[["Animal",`${pet?.species} ${pet?.name}`],["Serviço",b.service],["Data pedida",`${b.date}`],["Hora pedida",b.time]].map(([k,v])=>(
                        <div key={k}><div style={{ fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase" }}>{k}</div><div style={{ fontWeight:600,fontSize:13,marginTop:2 }}>{v}</div></div>
                      ))}
                    </div>
                    {b.notes && <div style={{ marginTop:8, fontSize:13, color:C.muted, fontStyle:"italic" }}>📝 "{b.notes}"</div>}
                  </div>

                  {/* sent quote summary */}
                  {b.quote_price && (
                    <div style={{ background:"#ede8fc", borderRadius:12, padding:12, marginBottom:10, border:"1px solid #c8b8f8" }}>
                      <div style={{ fontSize:11, color:C.purple, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Orçamento enviado</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                        {[["Valor proposto",`${b.quote_price}€`],["Data proposta",`${b.quote_date||b.date} ${b.quote_time||b.time}`]].map(([k,v])=>(
                          <div key={k}><div style={{ fontSize:10,color:C.purple,fontWeight:700,textTransform:"uppercase" }}>{k}</div><div style={{ fontWeight:700,fontSize:14,marginTop:2,color:C.purple }}>{v}</div></div>
                        ))}
                      </div>
                      {b.quote_notes && <div style={{ marginTop:8, fontSize:13, color:"#6c5ce7", fontStyle:"italic" }}>📝 "{b.quote_notes}"</div>}
                    </div>
                  )}

                  {/* QUOTE FORM */}
                  {status==="pendente" && (
                    isOpen ? (
                      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:C.forest }}>💶 Enviar orçamento</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                          <div>
                            <label style={LBL}>Valor (€) *</label>
                            <input style={INPUT} type="number" placeholder="ex: 25" value={qForm.price} onChange={e=>setQForm(f=>({...f,price:e.target.value}))}/>
                          </div>
                          <div>
                            <label style={LBL}>Data confirmada</label>
                            <input style={INPUT} type="date" value={qForm.visit_date} onChange={e=>setQForm(f=>({...f,visit_date:e.target.value}))}/>
                          </div>
                          <div>
                            <label style={LBL}>Hora confirmada</label>
                            <input style={INPUT} type="time" value={qForm.visit_time} onChange={e=>setQForm(f=>({...f,visit_time:e.target.value}))}/>
                          </div>
                          <div>
                            <label style={LBL}>Notas ao dono</label>
                            <input style={INPUT} placeholder="ex: Trazer ração" value={qForm.notes} onChange={e=>setQForm(f=>({...f,notes:e.target.value}))}/>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={()=>sendQuote(b)} style={{ ...iBtn(true), flex:1, textAlign:"center", padding:"11px 0", opacity:!qForm.price?.5:1 }}>📤 Enviar orçamento</button>
                          <button onClick={()=>{setQuoteOpen(null);setQForm({price:"",notes:"",visit_date:"",visit_time:""}); }} style={{ ...iBtn(false), padding:"11px 16px" }}>Cancelar</button>
                        </div>
                        <button onClick={()=>{setQuoteOpen(null); update(b.id,{status:"rejeitado"}); }} style={{ ...iBtn(true), background:C.red, width:"100%", textAlign:"center", padding:"10px 0" }}>❌ Recusar pedido</button>
                      </div>
                    ) : (
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={()=>{ setQuoteOpen(b.id); setQForm({price:String(b.price),notes:"",visit_date:b.date,visit_time:b.time}); }} style={{ ...iBtn(true), flex:1, textAlign:"center", padding:"11px 0" }}>💶 Enviar orçamento</button>
                        <button onClick={()=>update(b.id,{status:"rejeitado"})} style={{ ...iBtn(true), background:C.red, padding:"11px 14px" }}>❌</button>
                      </div>
                    )
                  )}

                  {status==="orçamento_enviado" && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f8f7ff", borderRadius:10, padding:"10px 14px", fontSize:13, color:C.purple }}>
                      <span>⏳</span> A aguardar confirmação do dono...
                    </div>
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

/* ─────────────────────────────────────────────
   CUIDADOR: PROFILE
───────────────────────────────────────────── */
function CuidadorProfile({ user, profile }) {
  const myReviews = REVIEWS.filter(r=>r.caregiver_id===user.id);
  if (!profile) return <div style={{ ...card,textAlign:"center",padding:40,color:C.muted }}><div style={{ fontSize:40 }}>🔧</div><div style={{ fontWeight:600,marginTop:12 }}>Perfil não encontrado</div></div>;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>O meu perfil</h2>
      <div style={{ ...card,textAlign:"center",padding:24 }}>
        <div style={{ width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg,${C.mint},${C.moss})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 12px" }}>{user.avatar}</div>
        <div style={{ fontWeight:800,fontSize:20 }}>{user.name}</div>
        {profile.badge&&<div style={{ marginTop:6 }}><Badge color="#c47a00" bg="#fff3e0">{profile.badge}</Badge></div>}
        <div style={{ marginTop:8 }}><Stars r={profile.rating}/> <span style={{ color:C.muted,fontSize:12 }}>({profile.reviews} avaliações)</span></div>
        <div style={{ color:C.muted,fontSize:13,marginTop:10,lineHeight:1.6 }}>{profile.bio}</div>
        <div style={{ display:"flex",gap:8,justifyContent:"center",marginTop:10 }}><Tag>📍 {user.location}</Tag><Tag bg="#f0f4f8" color="#5a6a7a">📞 {user.phone}</Tag></div>
      </div>
      <div style={card}><div style={{ fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:10 }}>Serviços</div><div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{profile.services.map(sv=><Tag key={sv}>{sv}</Tag>)}</div></div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
        <div style={card}><div style={{ fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>Preço/hora</div><div style={{ fontWeight:800,fontSize:20,color:C.forest }}>{profile.price_per_hour}€</div></div>
        <div style={card}><div style={{ fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>Máx. animais</div><div style={{ fontWeight:800,fontSize:20,color:C.forest }}>{profile.max_pets}</div></div>
      </div>
      {myReviews.length>0&&(
        <div style={card}>
          <div style={{ fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:12 }}>Avaliações recentes</div>
          {myReviews.map(r=>{ const o=USERS.find(u=>u.id===r.owner_id); return (
            <div key={r.id} style={{ paddingBottom:12,borderBottom:`1px solid ${C.border}`,marginBottom:12 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}><span>{o?.avatar}</span><span style={{ fontWeight:600,fontSize:14 }}>{o?.name}</span><Stars r={r.rating}/></div>
              <p style={{ fontSize:13,color:C.text,margin:0 }}>"{r.comment}"</p>
              <p style={{ fontSize:11,color:C.muted,margin:"4px 0 0" }}>{r.date}</p>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
const DONO_TABS = [
  { id:"dashboard",  icon:"🏠", label:"Início" },
  { id:"pets",       icon:"🐾", label:"Pets" },
  { id:"caregivers", icon:"👤", label:"Cuidadores" },
  { id:"alerts",     icon:"📍", label:"Alertas" },
  { id:"bookings",   icon:"🗓️", label:"Reservas" },
];
const CUIDADOR_TABS = [
  { id:"dashboard", icon:"🏠", label:"Início" },
  { id:"requests",  icon:"📩", label:"Pedidos" },
  { id:"schedule",  icon:"🗓️", label:"Agenda" },
  { id:"alerts",    icon:"📍", label:"Alertas" },
  { id:"profile",   icon:"👤", label:"Perfil" },
];

export default function App() {
  const [user,     setUser]     = useState(null);
  const [tab,      setTab]      = useState("dashboard");
  const [bookings, setBookings] = useState(INIT_BOOKINGS);
  const [alerts,   setAlerts]   = useState(INIT_ALERTS);
  const [mobile,   setMobile]   = useState(window.innerWidth < 768);

  useEffect(()=>{
    const h=()=>setMobile(window.innerWidth<768);
    window.addEventListener("resize",h); return ()=>window.removeEventListener("resize",h);
  },[]);

  if (!user) return <LoginScreen onLogin={u=>{ setUser(u); setTab("dashboard"); }}/>;

  const isDono    = user.role==="dono";
  const TABS      = isDono ? DONO_TABS : CUIDADOR_TABS;
  const ownerPets = getPetsByOwner(user.id, PETS);
  const cgProfile = getCaregiverProfile(user.id, CAREGIVER_PROFILES);
  const pendingCount = bookings.filter(b=>b.caregiver_id===user.id&&b.status==="pendente").length;

  const screens = isDono ? {
    dashboard:  <DonoDashboard   user={user} setTab={setTab} ownerPets={ownerPets} bookings={bookings} alerts={alerts}/>,
    pets:       <PetsScreen      ownerPets={ownerPets}/>,
    caregivers: <CaregiversScreen user={user} ownerPets={ownerPets} bookings={bookings} setBookings={setBookings}/>,
    alerts:     <AlertsScreen    alerts={alerts} setAlerts={setAlerts}/>,
    bookings:   <DonoBookingsScreen user={user} bookings={bookings} setBookings={setBookings}/>,
  } : {
    dashboard: <CuidadorDashboard user={user} profile={cgProfile} bookings={bookings} setTab={setTab}/>,
    requests:  <CuidadorPedidos   user={user} bookings={bookings} setBookings={setBookings}/>,
    schedule:  <CuidadorAgenda    user={user} bookings={bookings} setBookings={setBookings}/>,
    alerts:    <AlertsScreen      alerts={alerts} setAlerts={setAlerts}/>,
    profile:   <CuidadorProfile   user={user} profile={cgProfile}/>,
  };

  const Sidebar = () => (
    <>
      <div style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 12px 20px" }}>
        <div style={{ width:34,height:34,borderRadius:"50% 50% 50% 12%",background:C.forest,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17 }}>🐾</div>
        <span style={{ fontWeight:800,fontSize:18,color:C.forest }}>PetLink</span>
      </div>
      <div style={{ marginBottom:8,padding:"4px 12px" }}>
        <span style={{ fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".08em",background:isDono?C.pale:C.purpleBg,color:isDono?C.forest:C.purple,borderRadius:100,padding:"3px 10px" }}>{isDono?"🐾 Dono":"🤝 Cuidador"}</span>
      </div>
      {TABS.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,background:tab===t.id?C.pale:"transparent",color:tab===t.id?C.forest:"#6a8a72",border:"none",fontWeight:tab===t.id?700:500,fontSize:14,cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%" }}>
          <span style={{ fontSize:17 }}>{t.icon}</span>{t.label}
          {t.id==="requests"&&pendingCount>0&&<span style={{ marginLeft:"auto",background:C.amber,color:"#fff",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700 }}>{pendingCount}</span>}
        </button>
      ))}
      <div style={{ marginTop:"auto",padding:12,background:"#f0f7f2",borderRadius:14,display:"flex",alignItems:"center",gap:10 }}>
        <div style={{ width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.mint},${C.moss})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>{user.avatar}</div>
        <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:13 }}>{user.name.split(" ")[0]}</div><div style={{ fontSize:11,color:C.muted,textTransform:"capitalize" }}>{user.role}</div></div>
        <button onClick={()=>{ setUser(null); setTab("dashboard"); }} title="Sair" style={{ background:"none",border:"none",cursor:"pointer",fontSize:16,color:C.muted }}>🚪</button>
      </div>
    </>
  );

  if (mobile) return (
    <div style={{ height:"100dvh",display:"flex",flexDirection:"column",background:C.cream,fontFamily:"'Segoe UI',system-ui,sans-serif",color:C.text }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:C.white, borderBottom:`1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50% 50% 50% 12%", background: C.forest, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🐾</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: C.forest }}>PetLink</span>
        </div>
        <button onClick={() => { setUser(null); setTab("dashboard"); }} title="Sair" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>🚪</button>
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:"20px 16px 16px" }}>{screens[tab]}</div>
      <div style={{ display:"flex",background:C.white,borderTop:`1px solid ${C.border}`,padding:"6px 0 env(safe-area-inset-bottom,6px)" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 0",fontFamily:"inherit",position:"relative" }}>
            <span style={{ fontSize:20,filter:tab===t.id?"none":"grayscale(1) opacity(.5)" }}>{t.icon}</span>
            <span style={{ fontSize:10,fontWeight:700,color:tab===t.id?C.forest:C.muted }}>{t.label}</span>
            {tab===t.id&&<div style={{ width:20,height:3,background:C.forest,borderRadius:3,marginTop:1 }}/>}
            {t.id==="requests"&&pendingCount>0&&<div style={{ position:"absolute",top:4,right:"22%",width:8,height:8,background:C.red,borderRadius:"50%" }}/>}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex",height:"100vh",background:C.cream,fontFamily:"'Segoe UI',system-ui,sans-serif",color:C.text }}>
      <aside style={{ width:220,background:C.white,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"20px 12px",gap:4,flexShrink:0 }}><Sidebar/></aside>
      <main style={{ flex:1,overflowY:"auto",padding:"28px 32px" }}>
        <div style={{ maxWidth:720,margin:"0 auto" }}>{screens[tab]}</div>
      </main>
    </div>
  );
}
