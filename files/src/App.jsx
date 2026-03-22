import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const PETS = [
  { id:1, name:"Rex",     species:"🐕", breed:"Labrador Retriever", age:3, weight:"32kg", color:"#dcf5e7", status:"Em casa",       vaccines:["Raiva","Parvovírus","Tosse das Canis"], nextVet:"15 Mar 2025", microchip:"941000024680123", notes:"Alérgico a frango. Adora brincar com bola." },
  { id:2, name:"Luna",    species:"🐈", breed:"Persa",               age:5, weight:"4.2kg",color:"#fde8d8", status:"Com cuidador",  vaccines:["Raiva","Panleucopenia"],                 nextVet:"02 Abr 2025", microchip:"941000031248900", notes:"Tímida com estranhos. Não gosta de barulhos." },
  { id:3, name:"Bolinha", species:"🐇", breed:"Holland Lop",          age:1, weight:"1.8kg",color:"#e8e0f8", status:"Em casa",       vaccines:["Mixomatose"],                             nextVet:"28 Mar 2025", microchip:"—",              notes:"Muito ativa. Come feno e vegetais frescos." },
];

const CAREGIVERS = [
  { id:1, name:"Ana Ferreira", avatar:"👩‍🦰", rating:4.9, reviews:87,  services:["Pet Sitting","Passeios","Banho"],              price:"12€/h", distance:"0.8km", verified:true,  badge:"Top Cuidador", available:true,  bio:"Veterinária de formação. 5 anos de experiência.", pets:["🐕","🐈"] },
  { id:2, name:"Carlos Mota",  avatar:"👨‍🦳", rating:4.7, reviews:54,  services:["Passeios","Treino"],                           price:"10€/h", distance:"1.2km", verified:true,  badge:null,          available:true,  bio:"Treinador certificado. Especialista em raças grandes.", pets:["🐕"] },
  { id:3, name:"Sofia Lopes",  avatar:"👩‍🦱", rating:5.0, reviews:120, services:["Pet Sitting","Hospedagem","Banho","Treino"],    price:"15€/h", distance:"2.1km", verified:true,  badge:"Super Host",  available:false, bio:"Casa com jardim. Aceito até 3 animais simultaneamente.", pets:["🐕","🐈","🐇"] },
  { id:4, name:"Tiago Costa",  avatar:"👨‍🦲", rating:4.5, reviews:31,  services:["Passeios","Pet Sitting"],                      price:"9€/h",  distance:"3.0km", verified:false, badge:null,          available:true,  bio:"Apaixonado por animais desde criança.", pets:["🐕"] },
];

const INIT_ALERTS = [
  { id:1, type:"perdido",    name:"Mimi",         photo:"🐈", area:"Porto, Cedofeita", time:"Há 2 horas", description:"Gato castrado, cor laranja com manchas brancas. Colar azul.", contact:"912 345 678", distance:"0.3km", reward:"50€" },
  { id:2, type:"encontrado", name:"Desconhecido", photo:"🐕", area:"Porto, Bonfim",    time:"Há 5 horas", description:"Encontrei este cão sem coleira. Parece bem tratado. Castanho claro.", contact:"934 567 890", distance:"1.1km", reward:null },
  { id:3, type:"perdido",    name:"Snowy",        photo:"🐇", area:"Matosinhos",       time:"Há 1 dia",   description:"Fugiu do jardim. Coelho anão branco com olhos vermelhos.", contact:"967 891 234", distance:"2.4km", reward:"30€" },
  { id:4, type:"perdido",    name:"Sombra",       photo:"🐈", area:"Porto, Paranhos",  time:"Há 3 dias",  description:"Gato preto castrado, muito tímido. Chip implantado.", contact:"921 456 789", distance:"4.2km", reward:null },
];

const INIT_BOOKINGS = [
  { id:1, caregiver:"Ana Ferreira",  avatar:"👩‍🦰", pet:"Rex",  service:"Passeio",    date:"Hoje, 17:00",           status:"confirmado", price:"12€" },
  { id:2, caregiver:"Sofia Lopes",   avatar:"👩‍🦱", pet:"Luna", service:"Pet Sitting", date:"Sáb, 09:00 – 18:00",    status:"a decorrer", price:"90€" },
  { id:3, caregiver:"Carlos Mota",   avatar:"👨‍🦳", pet:"Rex",  service:"Treino",      date:"Dom, 10:00",            status:"pendente",   price:"20€" },
];

const ACTIVITY = [
  { icon:"🗓️", text:"Passeio do Rex confirmado com Ana", time:"5 min" },
  { icon:"📍", text:"Alerta: gato laranja perdido perto de ti", time:"2 h" },
  { icon:"💉", text:"Vacina da Luna vence em 14 dias", time:"1 d" },
  { icon:"⭐", text:"Avalia a última visita de Sofia", time:"2 d" },
];

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const C = {
  forest:"#1a4d2e", moss:"#2d6b45", sage:"#5c8a6a",
  mint:"#a8d4b0",   pale:"#e8f5ec", cream:"#f6faf7",
  border:"#dceee3", muted:"#7a9a82", text:"#1a2e22",
  amber:"#e8a84a",  red:"#c0392b",   redBg:"#fde8d8",
  white:"#ffffff",
};

/* ─────────────────────────────────────────────
   TINY HELPERS
───────────────────────────────────────────── */
const badge = (color, bg, text) => (
  <span style={{ background:bg, color, borderRadius:100, padding:"2px 9px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>{text}</span>
);

const tag = (text, bg="#e8f5ec", color="#2d6b45") => (
  <span key={text} style={{ background:bg, color, borderRadius:8, padding:"3px 9px", fontSize:11, fontWeight:500, whiteSpace:"nowrap" }}>{text}</span>
);

function Stars({ r }) {
  return <span style={{ fontSize:12 }}>{"★".repeat(Math.floor(r))}<span style={{ color:"#ddd" }}>{"★".repeat(5-Math.floor(r))}</span> <span style={{ color:C.muted }}>{r}</span></span>;
}

const card = { background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:16, marginBottom:0 };
const iBtn = (filled) => ({
  background: filled ? C.forest : "transparent",
  color: filled ? C.white : C.forest,
  border: filled ? "none" : `1.5px solid ${C.forest}`,
  borderRadius:100, padding:"9px 18px",
  fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit",
});

/* ─────────────────────────────────────────────
   SCREEN: DASHBOARD
───────────────────────────────────────────── */
function Dashboard({ setTab, pets, bookings, alerts }) {
  const active = bookings.find(b => b.status === "a decorrer");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* greeting */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <p style={{ color:C.muted, fontSize:13, margin:0 }}>Bom dia 👋</p>
          <h1 style={{ margin:0, fontSize:20, fontWeight:800 }}>Olá, Diogo</h1>
        </div>
        <div style={{ position:"relative", cursor:"pointer" }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:C.forest, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🔔</div>
          <div style={{ position:"absolute", top:-2, right:-2, width:16, height:16, background:C.amber, borderRadius:"50%", border:"2px solid "+C.cream, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff", fontWeight:700 }}>3</div>
        </div>
      </div>

      {/* stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
        {[{ label:"Pets",icon:"🐾",val:pets.length,tab:"pets",bg:"#e8f5ec" },
          { label:"Alertas",icon:"📍",val:alerts.length,tab:"alerts",bg:"#fff3e0" },
          { label:"Reservas",icon:"🗓️",val:bookings.length,tab:"bookings",bg:"#ede8fc" }].map(s=>(
          <div key={s.tab} onClick={()=>setTab(s.tab)} style={{ ...card, background:s.bg, border:"none", cursor:"pointer", padding:"14px 12px", textAlign:"center" }}>
            <div style={{ fontSize:22 }}>{s.icon}</div>
            <div style={{ fontWeight:800, fontSize:22, margin:"4px 0 0" }}>{s.val}</div>
            <div style={{ fontSize:11, color:C.muted, fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* active booking */}
      {active && (
        <div style={{ background:`linear-gradient(135deg,${C.forest},#2d7a48)`, borderRadius:16, padding:16, color:"#fff", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{active.avatar}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, opacity:.7 }}>A decorrer agora</div>
            <div style={{ fontWeight:700, fontSize:15 }}>{active.pet} com {active.caregiver}</div>
            <div style={{ fontSize:12, opacity:.8 }}>{active.service} · {active.date}</div>
          </div>
          <button style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", borderRadius:100, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>🗺️ Mapa</button>
        </div>
      )}

      {/* my pets */}
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={{ fontWeight:700, fontSize:15 }}>Os meus animais</span>
          <span onClick={()=>setTab("pets")} style={{ color:C.moss, fontSize:13, fontWeight:600, cursor:"pointer" }}>Ver todos →</span>
        </div>
        <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:4 }}>
          {pets.map(p=>(
            <div key={p.id} onClick={()=>setTab("pets")} style={{ ...card, minWidth:130, flexShrink:0, textAlign:"center", background:p.color, border:"none", cursor:"pointer" }}>
              <div style={{ fontSize:30, marginBottom:6 }}>{p.species}</div>
              <div style={{ fontWeight:700, fontSize:14 }}>{p.name}</div>
              <div style={{ fontSize:11, color:C.muted, margin:"2px 0 8px" }}>{p.breed}</div>
              {badge(p.status==="Em casa"?"#16773a":"#c47a00", p.status==="Em casa"?"#dcf0e3":"#fff3e0", p.status)}
            </div>
          ))}
          <div onClick={()=>setTab("pets")} style={{ ...card, minWidth:130, flexShrink:0, textAlign:"center", border:`2px dashed ${C.border}`, background:"transparent", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, color:C.muted }}>
            <span style={{ fontSize:26 }}>+</span>
            <span style={{ fontSize:12, fontWeight:600 }}>Adicionar</span>
          </div>
        </div>
      </div>

      {/* activity */}
      <div style={card}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Atividade recente</div>
        {ACTIVITY.map((a,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderTop: i>0?`1px solid ${C.border}`:"none" }}>
            <div style={{ width:32, height:32, borderRadius:9, background:C.pale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{a.icon}</div>
            <div style={{ flex:1, fontSize:13 }}>{a.text}</div>
            <div style={{ fontSize:11, color:"#bbb", whiteSpace:"nowrap" }}>{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCREEN: PETS
───────────────────────────────────────────── */
function PetsScreen() {
  const [sel, setSel] = useState(null);
  const [subTab, setSubTab] = useState("info");
  const pet = PETS.find(p=>p.id===sel);

  if (pet) return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <button onClick={()=>setSel(null)} style={{ alignSelf:"flex-start", background:C.pale, border:"none", borderRadius:100, padding:"7px 14px", fontWeight:600, fontSize:13, cursor:"pointer", color:C.forest, fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>← Voltar</button>

      <div style={{ ...card, background:pet.color, border:"none", display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ width:64, height:64, borderRadius:18, background:"rgba(255,255,255,0.55)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>{pet.species}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:800 }}>{pet.name}</div>
          <div style={{ color:C.muted, fontSize:13, margin:"2px 0 8px" }}>{pet.breed} · {pet.age} anos · {pet.weight}</div>
          {badge(pet.status==="Em casa"?"#16773a":"#c47a00", pet.status==="Em casa"?"#dcf0e3":"#fff3e0", pet.status)}
        </div>
      </div>

      <div style={{ display:"flex", background:"#f0f7f2", borderRadius:12, padding:4, gap:0 }}>
        {["info","vacinas","historial"].map(t=>(
          <button key={t} onClick={()=>setSubTab(t)} style={{ flex:1, background:subTab===t?C.white:"transparent", border:"none", borderRadius:9, padding:"8px 0", fontWeight:700, fontSize:13, color:subTab===t?C.forest:C.muted, cursor:"pointer", fontFamily:"inherit", textTransform:"capitalize" }}>{t}</button>
        ))}
      </div>

      {subTab==="info" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[["Microchip",pet.microchip],["Próxima consulta",pet.nextVet],["Raça",pet.breed],["Peso",pet.weight]].map(([k,v])=>(
              <div key={k} style={card}>
                <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", marginBottom:4 }}>{k}</div>
                <div style={{ fontWeight:600, fontSize:14 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>Notas</div>
            <div style={{ fontSize:14, color:C.text, lineHeight:1.6 }}>{pet.notes}</div>
          </div>
        </div>
      )}

      {subTab==="vacinas" && (
        <div style={card}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {pet.vaccines.map((v,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"#f0f7f2", borderRadius:10 }}>
                <span style={{ fontSize:18 }}>💉</span>
                <span style={{ flex:1, fontWeight:500, fontSize:14 }}>{v}</span>
                {badge("#16773a","#dcf0e3","✓ Ok")}
              </div>
            ))}
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"#fff3e0", borderRadius:10 }}>
              <span style={{ fontSize:18 }}>⚠️</span>
              <span style={{ flex:1, fontSize:14, fontWeight:500 }}>Reforço anual</span>
              <span style={{ fontSize:13, color:"#c47a00", fontWeight:600 }}>{pet.nextVet}</span>
            </div>
          </div>
        </div>
      )}

      {subTab==="historial" && (
        <div style={card}>
          {[{ date:"10 Jan 2025",title:"Consulta de rotina",vet:"Dr. Carvalho",note:"Tudo normal." },
            { date:"3 Out 2024",title:"Vacinação anual",vet:"Clínica VetPorto",note:"Vacinas em dia." },
            { date:"18 Jun 2024",title:"Otite leve",vet:"Dr. Carvalho",note:"Tratamento 10 dias." }].map((h,i)=>(
            <div key={i} style={{ display:"flex", gap:12, paddingBottom:12, borderBottom: i<2?`1px solid ${C.border}`:"none", marginBottom: i<2?12:0 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:C.moss, marginTop:5, flexShrink:0 }}/>
              <div>
                <div style={{ fontSize:11, color:C.muted }}>{h.date} · {h.vet}</div>
                <div style={{ fontWeight:600, fontSize:14, margin:"2px 0" }}>{h.title}</div>
                <div style={{ fontSize:13, color:C.muted }}>{h.note}</div>
              </div>
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
      {PETS.map(p=>(
        <div key={p.id} onClick={()=>{ setSel(p.id); setSubTab("info"); }} style={{ ...card, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
          <div style={{ width:52, height:52, borderRadius:14, background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{p.species}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:15 }}>{p.name}</div>
            <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{p.breed} · {p.age} anos</div>
          </div>
          {badge(p.status==="Em casa"?"#16773a":"#c47a00", p.status==="Em casa"?"#dcf0e3":"#fff3e0", p.status)}
          <span style={{ color:C.muted, fontSize:18 }}>›</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCREEN: CAREGIVERS
───────────────────────────────────────────── */
function CaregiversScreen() {
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState("Todos");
  const services = ["Todos","Pet Sitting","Passeios","Banho","Treino","Hospedagem"];
  const list = filter==="Todos" ? CAREGIVERS : CAREGIVERS.filter(c=>c.services.includes(filter));
  const cg = CAREGIVERS.find(c=>c.id===sel);

  if (cg) return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <button onClick={()=>setSel(null)} style={{ alignSelf:"flex-start", background:C.pale, border:"none", borderRadius:100, padding:"7px 14px", fontWeight:600, fontSize:13, cursor:"pointer", color:C.forest, fontFamily:"inherit" }}>← Voltar</button>

      <div style={{ ...card, textAlign:"center", padding:24 }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg,${C.mint},${C.moss})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 12px" }}>{cg.avatar}</div>
        <div style={{ fontWeight:800, fontSize:20 }}>{cg.name}</div>
        {cg.badge && <div style={{ marginTop:6 }}>{badge("#c47a00","#fff3e0",cg.badge)}</div>}
        <div style={{ marginTop:8 }}><Stars r={cg.rating}/> <span style={{ color:C.muted, fontSize:12 }}>({cg.reviews} avaliações)</span></div>
        <div style={{ color:C.muted, fontSize:13, marginTop:10, lineHeight:1.6 }}>{cg.bio}</div>
      </div>

      <div style={card}>
        <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", marginBottom:10 }}>Serviços</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{cg.services.map(sv=>tag(sv))}</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <div style={card}><div style={{ fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>Preço</div><div style={{ fontWeight:700,fontSize:18,color:C.forest }}>{cg.price}</div></div>
        <div style={card}><div style={{ fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>Distância</div><div style={{ fontWeight:700,fontSize:18,color:C.forest }}>{cg.distance}</div></div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <button style={{ ...iBtn(true), width:"100%", textAlign:"center", padding:"13px 0" }}>📅 Reservar agora</button>
        <button style={{ ...iBtn(false), width:"100%", textAlign:"center", padding:"13px 0" }}>💬 Enviar mensagem</button>
      </div>
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
      {list.map(c=>(
        <div key={c.id} onClick={()=>setSel(c.id)} style={{ ...card, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:`linear-gradient(135deg,${C.mint},${C.moss})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{c.avatar}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontWeight:700, fontSize:15 }}>{c.name}</span>
              {c.verified && <span style={{ fontSize:13 }}>✅</span>}
            </div>
            <div><Stars r={c.rating}/></div>
            <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap" }}>{c.services.slice(0,2).map(sv=>tag(sv))}</div>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <div style={{ fontWeight:700, color:C.forest, fontSize:15 }}>{c.price}</div>
            <div style={{ fontSize:12, color:"#bbb" }}>{c.distance}</div>
            {badge(c.available?"#16773a":"#888", c.available?"#dcf0e3":"#f0f4f8", c.available?"Disponível":"Ocupado")}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCREEN: ALERTS + SOS
───────────────────────────────────────────── */
const INPUT = { width:"100%", background:C.white, border:`1.5px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:C.text, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
const LBL  = { fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".05em", marginBottom:5, display:"block" };

function AlertsScreen() {
  const [view, setView] = useState("list");
  const [alerts, setAlerts] = useState(INIT_ALERTS);
  const [aType, setAType] = useState("perdido");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name:"", breed:"", area:"", contact:"", description:"", reward:"" });
  const ch = f => e => setForm(p=>({ ...p,[f]:e.target.value }));

  const submit = () => {
    if (!form.name||!form.area||!form.contact) return;
    setAlerts(a=>[{ id:a.length+1, type:aType, name:form.name, photo:aType==="perdido"?"🐾":"🐕", area:form.area, time:"Agora mesmo", description:form.description, contact:form.contact, distance:"—", reward:form.reward?form.reward+"€":null },...a]);
    setDone(true);
    setTimeout(()=>{ setDone(false); setView("list"); setForm({ name:"",breed:"",area:"",contact:"",description:"",reward:"" }); },2200);
  };

  if (view==="sos") return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <button onClick={()=>setView("list")} style={{ alignSelf:"flex-start", background:C.pale, border:"none", borderRadius:100, padding:"7px 14px", fontWeight:600, fontSize:13, cursor:"pointer", color:C.forest, fontFamily:"inherit" }}>← Voltar</button>
      <div>
        <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>🚨 SOS Pet</h2>
        <p style={{ color:C.muted, fontSize:13, margin:"4px 0 0" }}>Cria um alerta para a tua comunidade</p>
      </div>

      {done ? (
        <div style={{ ...card, textAlign:"center", padding:48, background:"#e8f5ec", border:`2px solid ${C.mint}` }}>
          <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
          <div style={{ fontWeight:800, fontSize:18, color:C.forest, marginBottom:6 }}>Alerta publicado!</div>
          <div style={{ color:C.muted, fontSize:14 }}>A tua comunidade foi notificada.</div>
        </div>
      ) : <>
        <div style={card}>
          <label style={LBL}>Tipo de alerta</label>
          <div style={{ display:"flex", gap:8 }}>
            {[["perdido","🔴 Perdido","#fde8d8",C.red],["encontrado","🟢 Encontrado","#dcf0e3","#16773a"]].map(([t,l,bg,col])=>(
              <button key={t} onClick={()=>setAType(t)} style={{ flex:1, background:aType===t?bg:"#f8faf9", border:`2px solid ${aType===t?col:C.border}`, borderRadius:12, padding:"11px 0", fontSize:13, fontWeight:700, color:aType===t?col:C.muted, cursor:"pointer", fontFamily:"inherit" }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={card}>
          <label style={LBL}>Informação do animal</label>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div><label style={LBL}>Nome *</label><input style={INPUT} placeholder="ex: Mimi" value={form.name} onChange={ch("name")}/></div>
              <div><label style={LBL}>Raça</label><input style={INPUT} placeholder="ex: Gato persa" value={form.breed} onChange={ch("breed")}/></div>
            </div>
            <div><label style={LBL}>Descrição</label><textarea style={{ ...INPUT, resize:"none", height:68 }} placeholder="Cor, marcas, coleira..." value={form.description} onChange={ch("description")}/></div>
          </div>
        </div>

        <div style={card}>
          <label style={LBL}>Localização e contacto</label>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div><label style={LBL}>Zona / Morada *</label><input style={INPUT} placeholder="ex: Porto, Cedofeita" value={form.area} onChange={ch("area")}/></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div><label style={LBL}>Contacto *</label><input style={INPUT} placeholder="912 345 678" value={form.contact} onChange={ch("contact")}/></div>
              <div><label style={LBL}>Recompensa (€)</label><input style={INPUT} type="number" placeholder="ex: 50" value={form.reward} onChange={ch("reward")}/></div>
            </div>
          </div>
        </div>

        <button onClick={submit} style={{ ...iBtn(true), width:"100%", textAlign:"center", padding:"14px 0", fontSize:14, background:C.red, opacity:(!form.name||!form.area||!form.contact)?.5:1 }}>🚨 Publicar alerta agora</button>
        <p style={{ textAlign:"center", color:"#bbb", fontSize:12, margin:0 }}>A comunidade nas redondezas será notificada.</p>
      </>}
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>Alertas</h2>
          <p style={{ color:C.muted, fontSize:13, margin:"2px 0 0" }}>Porto · {alerts.length} ativos</p>
        </div>
        <button onClick={()=>setView("sos")} style={{ background:C.red, color:C.white, border:"none", borderRadius:100, padding:"9px 16px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 14px rgba(192,57,43,0.35)", display:"flex", alignItems:"center", gap:6 }}>🚨 SOS Pet</button>
      </div>

      {alerts.map(a=>(
        <div key={a.id} style={{ ...card, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:54, height:54, borderRadius:14, background:a.type==="perdido"?"#fde8d8":"#dcf0e3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>{a.photo}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:3 }}>
              <span style={{ fontWeight:700, fontSize:15 }}>{a.name}</span>
              {badge(a.type==="perdido"?C.red:"#16773a", a.type==="perdido"?"#fde8d8":"#dcf0e3", a.type==="perdido"?"🔴 Perdido":"🟢 Encontrado")}
              {a.reward && badge("#c47a00","#fff3e0","🏆 "+a.reward)}
            </div>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.5, marginBottom:6 }}>{a.description}</div>
            <div style={{ display:"flex", gap:5, flexWrap:"nowrap", overflow:"hidden" }}>
              {tag("📍 "+a.area)}
              {tag("⏰ "+a.time,"#f0f4f8","#5a6a7a")}
              {tag("📏 "+a.distance,"#f0f4f8","#5a6a7a")}
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
   SCREEN: BOOKINGS
───────────────────────────────────────────── */
function BookingsScreen() {
  const [bookings] = useState(INIT_BOOKINGS);
  const SC = { "a decorrer":["#c47a00","#fff3e0"], "confirmado":["#16773a","#dcf0e3"], "pendente":["#5a6a7a","#f0f4f8"] };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>Reservas</h2>
        <button style={{ ...iBtn(true), padding:"8px 14px" }}>+ Nova</button>
      </div>

      {["a decorrer","confirmado","pendente"].map(status=>{
        const list = bookings.filter(b=>b.status===status);
        if (!list.length) return null;
        const labels = { "a decorrer":"A decorrer","confirmado":"Confirmado","pendente":"Pendente" };
        return (
          <div key={status}>
            <div style={{ fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8 }}>{labels[status]}</div>
            {list.map(b=>(
              <div key={b.id} style={{ ...card, display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                <div style={{ width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${C.mint},${C.moss})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{b.avatar}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{b.pet} com {b.caregiver}</div>
                  <div style={{ color:C.muted, fontSize:13, marginTop:2 }}>{b.service} · {b.date}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontWeight:700, color:C.forest, fontSize:15, marginBottom:4 }}>{b.price}</div>
                  {badge(...SC[b.status], b.status)}
                </div>
                {status==="a decorrer" && <button style={{ ...iBtn(true), padding:"7px 12px", fontSize:12 }}>🗺️</button>}
                {status==="pendente" && (
                  <div style={{ display:"flex", gap:6 }}>
                    <button style={{ ...iBtn(true), padding:"7px 10px" }}>✓</button>
                    <button style={{ ...iBtn(false), padding:"7px 10px" }}>✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP — mobile shell + responsive
───────────────────────────────────────────── */
const TABS = [
  { id:"dashboard", icon:"🏠", label:"Início" },
  { id:"pets",      icon:"🐾", label:"Pets" },
  { id:"caregivers",icon:"👤", label:"Cuidadores" },
  { id:"alerts",    icon:"📍", label:"Alertas" },
  { id:"bookings",  icon:"🗓️", label:"Reservas" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(()=>{
    const h = ()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",h);
    return ()=>window.removeEventListener("resize",h);
  },[]);

  const screens = {
    dashboard: <Dashboard setTab={setTab} pets={PETS} bookings={INIT_BOOKINGS} alerts={INIT_ALERTS}/>,
    pets:       <PetsScreen/>,
    caregivers: <CaregiversScreen/>,
    alerts:     <AlertsScreen/>,
    bookings:   <BookingsScreen/>,
  };

  /* ── MOBILE layout ── */
  if (isMobile) return (
    <div style={{ height:"100dvh", display:"flex", flexDirection:"column", background:C.cream, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.text }}>
      <div style={{ flex:1, overflowY:"auto", padding:"20px 16px 16px" }}>
        {screens[tab]}
      </div>
      {/* bottom nav */}
      <div style={{ display:"flex", background:C.white, borderTop:`1px solid ${C.border}`, padding:"6px 0 env(safe-area-inset-bottom,6px)" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"6px 0", fontFamily:"inherit" }}>
            <span style={{ fontSize:20, filter:tab===t.id?"none":"grayscale(1) opacity(.5)" }}>{t.icon}</span>
            <span style={{ fontSize:10, fontWeight:700, color:tab===t.id?C.forest:C.muted }}>{t.label}</span>
            {tab===t.id && <div style={{ width:20, height:3, background:C.forest, borderRadius:3, marginTop:1 }}/>}
          </button>
        ))}
      </div>
    </div>
  );

  /* ── DESKTOP layout ── */
  return (
    <div style={{ display:"flex", height:"100vh", background:C.cream, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.text }}>
      {/* sidebar */}
      <aside style={{ width:220, background:C.white, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", padding:"20px 12px", gap:4, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px 20px" }}>
          <div style={{ width:34, height:34, borderRadius:"50% 50% 50% 12%", background:C.forest, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>🐾</div>
          <span style={{ fontWeight:800, fontSize:18, color:C.forest }}>PetLink</span>
        </div>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:12, background:tab===t.id?"#e8f5ec":"transparent", color:tab===t.id?C.forest:"#6a8a72", border:"none", fontWeight:tab===t.id?700:500, fontSize:14, cursor:"pointer", fontFamily:"inherit", textAlign:"left", width:"100%", position:"relative" }}>
            <span style={{ fontSize:17 }}>{t.icon}</span>
            {t.label}
            {t.id==="alerts" && <span style={{ marginLeft:"auto", background:C.amber, color:"#fff", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700 }}>{INIT_ALERTS.length}</span>}
          </button>
        ))}
        <div style={{ marginTop:"auto", padding:12, background:"#f0f7f2", borderRadius:14, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${C.mint},${C.moss})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>😊</div>
          <div><div style={{ fontWeight:700, fontSize:13 }}>Diogo</div><div style={{ fontSize:11, color:C.muted }}>Premium</div></div>
          <span style={{ marginLeft:"auto", cursor:"pointer" }}>⚙️</span>
        </div>
      </aside>

      <main style={{ flex:1, overflowY:"auto", padding:"28px 32px" }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          {screens[tab]}
        </div>
      </main>
    </div>
  );
}
