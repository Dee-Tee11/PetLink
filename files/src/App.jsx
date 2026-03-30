import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection, doc, getDocs, addDoc, updateDoc, setDoc,
  onSnapshot, query, where,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged,
} from "firebase/auth";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "./firebase";

// ─── GOOGLE FONT ─────────────────────────────────────────────────────────────
const _fl = document.createElement("link");
_fl.rel  = "stylesheet";
_fl.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap";
document.head.appendChild(_fl);

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const T = {
  forest:"#1a4d2e", moss:"#2d6b45", mint:"#a8d4b0",
  pale:"#e8f5ec",   cream:"#f4f8f5", border:"#d8ece0",
  muted:"#7a9a82",  text:"#1a2e22",  white:"#ffffff",
  amber:"#e8a84a",  red:"#c0392b",   redBg:"#fde8e8",
  violet:"#5f4bdb", violetBg:"#eeebff",
};
const FONT  = "'DM Sans', system-ui, sans-serif";
const SERIF = "'DM Serif Display', Georgia, serif";

const css = {
  card: { background:T.white, borderRadius:18, border:`1px solid ${T.border}`,
          padding:20, boxShadow:"0 1px 4px rgba(26,77,46,.05)" },
  input: { width:"100%", background:T.white, border:`1.5px solid ${T.border}`,
           borderRadius:12, padding:"11px 14px", fontSize:14, color:T.text,
           outline:"none", fontFamily:FONT, boxSizing:"border-box" },
  label: { fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase",
           letterSpacing:".06em", marginBottom:5, display:"block" },
  btn: (filled=true, accent=T.forest) => ({
    background: filled ? accent : "transparent",
    color:      filled ? T.white : accent,
    border:     filled ? "none" : `1.5px solid ${accent}`,
    borderRadius:100, padding:"11px 22px", fontWeight:700,
    fontSize:14, cursor:"pointer", fontFamily:FONT,
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
  }),
};

const STATUS = {
  "a decorrer":        { color:"#c47a00", bg:"#fff3e0" },
  "confirmado":        { color:"#16773a", bg:"#dcf0e3" },
  "pendente":          { color:"#5a6a7a", bg:"#f0f4f8" },
  "rejeitado":         { color:T.red,     bg:T.redBg   },
  "orçamento_enviado": { color:T.violet,  bg:T.violetBg},
};

// ─── SVG AVATAR (no images needed) ───────────────────────────────────────────
const GRADS = [
  ["#1a4d2e","#4caf78"],["#2d3561","#5b7bd5"],["#6d3b47","#c7748a"],
  ["#4a3728","#c09060"],["#1a4d4d","#4caaaa"],["#4d3d1a","#c0a040"],
  ["#3d1a4d","#9b6ad5"],["#1a3d4d","#4a9bc0"],["#4d1a1a","#c04040"],
  ["#1a4d38","#40b08a"],
];
function avatarGrad(name="") {
  let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))%GRADS.length;
  return GRADS[Math.abs(h)];
}
function initials(name="") {
  return name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join("");
}
function Avatar({ name="", photoURL=null, size=40, style={} }) {
  const id = `g${name.replace(/\W/g,"")}${size}`;
  const [c1,c2] = avatarGrad(name);
  const fs = Math.round(size*0.37);
  if (photoURL) return <img src={photoURL} alt={name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,display:"block",...style}}/>;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{borderRadius:"50%",flexShrink:0,display:"block",...style}}>
      <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/></linearGradient></defs>
      <circle cx="20" cy="20" r="20" fill={`url(#${id})`}/>
      <text x="20" y="20" dominantBaseline="central" textAnchor="middle" fill="white" fontSize={fs} fontFamily={FONT} fontWeight="700">{initials(name)}</text>
    </svg>
  );
}

// ─── PET DATA ─────────────────────────────────────────────────────────────────
const SPECIES = [
  {emoji:"🐕",label:"Cão"},{emoji:"🐈",label:"Gato"},{emoji:"🐇",label:"Coelho"},
  {emoji:"🐹",label:"Hamster"},{emoji:"🐦",label:"Pássaro"},{emoji:"🐢",label:"Tartaruga"},
  {emoji:"🐟",label:"Peixe"},{emoji:"🦎",label:"Réptil"},
];
const PET_BG = ["#dcf5e7","#fde8d8","#e8e0f8","#fff3e0","#e0f0ff","#fce4ec","#f3e5f5","#e0f7fa"];

// ─── MICRO COMPONENTS ────────────────────────────────────────────────────────
const Badge = ({color,bg,children}) => <span style={{background:bg,color,borderRadius:100,padding:"3px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>;
const Tag   = ({bg=T.pale,color=T.moss,children}) => <span style={{background:bg,color,borderRadius:8,padding:"3px 9px",fontSize:11,fontWeight:500,whiteSpace:"nowrap"}}>{children}</span>;
const Stars = ({r=0}) => <span style={{fontSize:12,color:T.amber}}>{"★".repeat(Math.floor(r))}<span style={{color:"#ddd"}}>{"★".repeat(5-Math.floor(r))}</span><span style={{color:T.muted,marginLeft:4,fontSize:11}}>{r}</span></span>;
const Back  = ({onClick}) => <button onClick={onClick} style={{alignSelf:"flex-start",background:T.pale,border:"none",borderRadius:100,padding:"7px 16px",fontWeight:600,fontSize:13,cursor:"pointer",color:T.forest,fontFamily:FONT}}>← Voltar</button>;

// ─── PHOTO UPLOAD ─────────────────────────────────────────────────────────────
function UploadBtn({photoURL,name,size=80,onUploaded,folder="avatars"}) {
  const ref = useRef();
  const [busy,setBusy] = useState(false);
  const handle = async (e) => {
    const file=e.target.files[0]; if(!file) return;
    setBusy(true);
    try {
      const r=storageRef(storage,`${folder}/${Date.now()}_${file.name}`);
      await uploadBytes(r,file); onUploaded(await getDownloadURL(r));
    } catch(e){console.error(e);}
    setBusy(false);
  };
  return (
    <div style={{position:"relative",display:"inline-block",cursor:"pointer"}} onClick={()=>ref.current?.click()}>
      <Avatar name={name} photoURL={photoURL} size={size}/>
      <div style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:T.forest,border:`2px solid ${T.white}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{busy?"⏳":"📷"}</div>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={handle}/>
    </div>
  );
}

// ─── LOADING ──────────────────────────────────────────────────────────────────
function Loading({msg="A carregar…"}) {
  return (
    <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.cream,fontFamily:FONT}}>
      <div style={{width:60,height:60,borderRadius:"50% 50% 50% 14%",background:T.forest,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,marginBottom:20,animation:"bob 1.6s ease-in-out infinite"}}>🐾</div>
      <p style={{color:T.muted,fontSize:14,fontWeight:600}}>{msg}</p>
      <style>{`@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({onLogin,onRegister}) {
  const [mode,setMode]=useState("login");
  const [role,setRole]=useState("dono");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const ERR={
    "auth/user-not-found":"Email não encontrado.",
    "auth/wrong-password":"Password incorreta.",
    "auth/invalid-credential":"Email ou password incorretos.",
    "auth/email-already-in-use":"Este email já está registado.",
    "auth/weak-password":"Password demasiado fraca (mín. 6 caracteres).",
    "auth/invalid-email":"Email inválido.",
    "auth/too-many-requests":"Demasiadas tentativas. Aguarda.",
  };
  const submit=async()=>{
    setErr("");
    if(!email||!pw) return setErr("Preenche todos os campos.");
    if(mode==="register"&&!name.trim()) return setErr("Introduz o teu nome.");
    if(mode==="register"&&pw.length<6) return setErr("Password demasiado curta.");
    setLoading(true);
    try { mode==="login" ? await onLogin(email,pw) : await onRegister(name.trim(),email,pw,role); }
    catch(e){ setErr(ERR[e.code]||"Ocorreu um erro."); setLoading(false); }
  };
  const onKey=(e)=>{ if(e.key==="Enter") submit(); };
  return (
    <div style={{minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:T.cream,padding:24,fontFamily:FONT}}>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:68,height:68,borderRadius:"50% 50% 50% 16%",background:`linear-gradient(135deg,${T.forest},${T.moss})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 16px",boxShadow:`0 8px 24px ${T.forest}40`}}>🐾</div>
          <h1 style={{margin:0,fontSize:28,fontWeight:800,fontFamily:SERIF,color:T.forest}}>PetLink</h1>
          <p style={{color:T.muted,fontSize:14,margin:"6px 0 0",fontWeight:500}}>Cuidados e proteção animal</p>
        </div>
        <div style={{display:"flex",background:"#ddeade",borderRadius:100,padding:4,marginBottom:24,gap:2}}>
          {[["login","Entrar"],["register","Criar conta"]].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,background:mode===m?T.white:"transparent",border:"none",borderRadius:100,padding:"10px 0",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:FONT,color:mode===m?T.forest:T.muted,boxShadow:mode===m?"0 1px 6px rgba(0,0,0,.10)":"none",transition:"all .18s"}}>{l}</button>
          ))}
        </div>
        <div style={{...css.card,padding:28,display:"flex",flexDirection:"column",gap:16}}>
          {mode==="register"&&<>
            <div>
              <label style={css.label}>Nome completo</label>
              <input style={css.input} placeholder="O teu nome" value={name} onChange={e=>setName(e.target.value)} onKeyDown={onKey} autoFocus/>
            </div>
            <div>
              <label style={css.label}>Tipo de conta</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[{r:"dono",icon:"🏡",title:"Dono de Pet",desc:"Gere animais e encontra cuidadores",accent:T.forest},
                  {r:"cuidador",icon:"🤝",title:"Cuidador",desc:"Oferece serviços de cuidado animal",accent:T.violet}].map(({r,icon,title,desc,accent})=>(
                  <button key={r} onClick={()=>setRole(r)} style={{background:role===r?(r==="dono"?T.pale:T.violetBg):"#f7faf8",border:`2px solid ${role===r?accent:T.border}`,borderRadius:14,padding:"14px 10px",cursor:"pointer",fontFamily:FONT,textAlign:"center",transition:"all .15s"}}>
                    <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
                    <div style={{fontWeight:700,fontSize:13,color:role===r?accent:T.text}}>{title}</div>
                    <div style={{fontSize:11,color:T.muted,marginTop:4,lineHeight:1.4}}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </>}
          <div>
            <label style={css.label}>Email</label>
            <input style={css.input} type="email" placeholder="o teu email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={onKey} autoFocus={mode==="login"}/>
          </div>
          <div>
            <label style={css.label}>Password</label>
            <input style={css.input} type="password" placeholder={mode==="register"?"mínimo 6 caracteres":"a tua password"} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={onKey}/>
          </div>
          {err&&<div style={{background:T.redBg,color:T.red,borderRadius:10,padding:"10px 14px",fontSize:13,fontWeight:600}}>⚠️ {err}</div>}
          <button onClick={submit} disabled={loading} style={{...css.btn(true),width:"100%",padding:"14px 0",fontSize:15,opacity:loading?.65:1}}>
            {loading?"A processar…":mode==="login"?"Entrar →":"Criar conta →"}
          </button>
          {mode==="login"&&<p style={{textAlign:"center",color:T.muted,fontSize:12,margin:0}}>Demo: <b>diogo@demo.com</b> · password <b>123456</b></p>}
          {mode==="login"&&<div style={{marginTop:20,borderTop:`1px solid ${T.border}`,paddingTop:20}}>
            <label style={{...css.label,textAlign:"center"}}>Acesso Rápido (Demo)</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
              {[
                { n:"Rita", e:"rita@demo.com", p:"123456", r:"Dono", i:"👩‍🦰" },
                { n:"Diogo", e:"diogo@demo.com", p:"123456", r:"Dono", i:"👨‍💻" },
                { n:"Carlos", e:"carlos@demo.com", p:"123456", r:"Cuidador", i:"🤝" },
                { n:"Ana", e:"ana@demo.com", p:"123456", r:"Cuidador", i:"🤝" }
              ].map(d=>(
                <button key={d.e} onClick={()=>{setEmail(d.e);setPw(d.p);}} style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:12,padding:10,cursor:"pointer",fontFamily:FONT,textAlign:"left",display:"flex",alignItems:"center",gap:8,transition:"all .15s"}} onMouseOver={e=>e.currentTarget.style.borderColor=T.forest} onMouseOut={e=>e.currentTarget.style.borderColor=T.border}>
                  <span style={{fontSize:20}}>{d.i}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,color:T.forest,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.n}</div>
                    <div style={{fontSize:10,color:T.muted}}>{d.r}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({user,onDone}) {
  const isDono=user.role==="dono";
  const [step,setStep]=useState(1);
  const [saving,setSaving]=useState(false);
  const [photoURL,setPhoto]=useState(null);
  const [phone,setPhone]=useState("");
  const [location,setLocation]=useState("");
  const [bio,setBio]=useState("");
  // pet
  const [pName,setPName]=useState("");
  const [pSpecies,setPSpecies]=useState("🐕");
  const [pBreed,setPBreed]=useState("");
  const [pAge,setPAge]=useState("");
  const [pWeight,setPWeight]=useState("");
  const [pNotes,setPNotes]=useState("");
  const [pPhoto,setPPhoto]=useState(null);
  const petRef=useRef();
  // cuidador
  const ALL_SVC=["Pet Sitting","Passeios","Banho","Treino","Hospedagem","Transporte"];
  const [services,setServices]=useState([]);
  const [price,setPrice]=useState("");
  const [maxPets,setMaxPets]=useState("1");
  const [garden,setGarden]=useState(false);
  const [avail,setAvail]=useState(true);
  const toggleSvc=(s)=>setServices(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);
  const handlePetPhoto=async(e)=>{
    const file=e.target.files[0]; if(!file) return;
    try { const r=storageRef(storage,`pets/${Date.now()}_${file.name}`); await uploadBytes(r,file); setPPhoto(await getDownloadURL(r)); } catch(e){console.error(e);}
  };
  const finish=async()=>{
    setSaving(true);
    try {
      await updateDoc(doc(db,"users",user.id),{phone,location,bio,photoURL:photoURL||null,onboarded:true});
      if(isDono&&pName.trim()) {
        await addDoc(collection(db,"pets"),{owner_id:user.id,name:pName.trim(),species:pSpecies,breed:pBreed||"—",age:parseInt(pAge)||0,weight:pWeight||"—",color:PET_BG[Math.floor(Math.random()*PET_BG.length)],status:"Em casa",vaccines:[],nextVet:"—",microchip:"—",notes:pNotes,photoURL:pPhoto||null});
      }
      if(!isDono&&services.length>0) {
        await setDoc(doc(db,"caregiver_profiles",String(user.id)),{user_id:user.id,rating:0,reviews:0,services,price_per_hour:parseFloat(price)||0,distance:"—",verified:false,badge:null,available:avail,bio,description:bio,pets_accepted:["🐕","🐈","🐇"],max_pets:parseInt(maxPets)||1,has_garden:garden});
      }
      onDone();
    } catch(e){console.error(e);setSaving(false);}
  };
  const LABELS=isDono?["Foto de perfil","Dados pessoais","O teu primeiro pet"]:["Foto de perfil","Dados pessoais","Os teus serviços"];
  const accent=isDono?T.forest:T.violet;
  return (
    <div style={{minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:T.cream,padding:20,fontFamily:FONT}}>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {[1,2,3].map(i=><div key={i} style={{flex:1,height:4,borderRadius:4,background:i<=step?accent:T.border,transition:"background .3s"}}/>)}
          </div>
          <p style={{margin:0,fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".07em"}}>Passo {step} de 3</p>
          <h2 style={{margin:"4px 0 0",fontSize:22,fontWeight:800,fontFamily:SERIF,color:T.forest}}>{LABELS[step-1]}</h2>
        </div>

        {step===1&&(
          <div style={{...css.card,padding:32,display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
            <p style={{color:T.muted,fontSize:14,textAlign:"center",margin:0,lineHeight:1.6}}>Adiciona uma foto ou mantém o avatar gerado automaticamente com as tuas iniciais.</p>
            <UploadBtn photoURL={photoURL} name={user.name} size={110} onUploaded={setPhoto} folder="avatars"/>
            <div style={{textAlign:"center"}}>
              <div style={{fontWeight:700,fontSize:17,color:T.text}}>{user.name}</div>
              <div style={{marginTop:6}}><Badge color={accent} bg={isDono?T.pale:T.violetBg}>{isDono?"🏡 Dono de Pet":"🤝 Cuidador"}</Badge></div>
            </div>
            <p style={{color:T.muted,fontSize:12,margin:0}}>Toca em 📷 para fazer upload</p>
            <div style={{display:"flex",gap:10,width:"100%"}}>
              <button onClick={()=>setStep(2)} style={{...css.btn(false,accent),flex:1,padding:"12px 0"}}>Saltar</button>
              <button onClick={()=>setStep(2)} style={{...css.btn(true,accent),flex:2,padding:"12px 0"}}>Continuar →</button>
            </div>
          </div>
        )}

        {step===2&&(
          <div style={{...css.card,padding:24,display:"flex",flexDirection:"column",gap:14}}>
            <div><label style={css.label}>Telemóvel</label><input style={css.input} type="tel" placeholder="912 345 678" value={phone} onChange={e=>setPhone(e.target.value)} autoFocus/></div>
            <div><label style={css.label}>Zona / Localização</label><input style={css.input} placeholder="ex: Porto, Cedofeita" value={location} onChange={e=>setLocation(e.target.value)}/></div>
            <div><label style={css.label}>Sobre ti</label><textarea style={{...css.input,resize:"none",height:88}} placeholder={isDono?"Conta-nos sobre ti e os teus animais…":"Conta-nos sobre a tua experiência com animais…"} value={bio} onChange={e=>setBio(e.target.value)}/></div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(1)} style={{...css.btn(false,accent),flex:1,padding:"12px 0"}}>← Voltar</button>
              <button onClick={()=>setStep(3)} style={{...css.btn(true,accent),flex:2,padding:"12px 0"}}>Continuar →</button>
            </div>
          </div>
        )}

        {step===3&&isDono&&(
          <div style={{...css.card,padding:24,display:"flex",flexDirection:"column",gap:14}}>
            <p style={{color:T.muted,fontSize:13,margin:0}}>Adiciona o teu primeiro animal. Podes adicionar mais depois.</p>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{position:"relative",cursor:"pointer",flexShrink:0}} onClick={()=>petRef.current?.click()}>
                <div style={{width:68,height:68,borderRadius:18,background:PET_BG[0],display:"flex",alignItems:"center",justifyContent:"center",fontSize:pPhoto?0:34,overflow:"hidden",border:`2px dashed ${T.border}`}}>
                  {pPhoto?<img src={pPhoto} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:pSpecies}
                </div>
                <div style={{position:"absolute",bottom:-4,right:-4,width:24,height:24,borderRadius:"50%",background:T.forest,border:`2px solid ${T.white}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>📷</div>
                <input ref={petRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePetPhoto}/>
              </div>
              <div style={{flex:1}}><label style={css.label}>Nome *</label><input style={css.input} placeholder="ex: Rex" value={pName} onChange={e=>setPName(e.target.value)} autoFocus/></div>
            </div>
            <div><label style={css.label}>Espécie</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
                {SPECIES.map(sp=><button key={sp.emoji} onClick={()=>setPSpecies(sp.emoji)} style={{background:pSpecies===sp.emoji?T.pale:"#f8faf9",border:`2px solid ${pSpecies===sp.emoji?T.forest:T.border}`,borderRadius:12,padding:"7px 11px",cursor:"pointer",fontFamily:FONT,fontSize:12,fontWeight:600,color:pSpecies===sp.emoji?T.forest:T.muted}}>{sp.emoji} {sp.label}</button>)}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={css.label}>Raça</label><input style={css.input} placeholder="ex: Labrador" value={pBreed} onChange={e=>setPBreed(e.target.value)}/></div>
              <div><label style={css.label}>Idade (anos)</label><input style={css.input} type="number" placeholder="3" value={pAge} onChange={e=>setPAge(e.target.value)}/></div>
              <div><label style={css.label}>Peso</label><input style={css.input} placeholder="ex: 8kg" value={pWeight} onChange={e=>setPWeight(e.target.value)}/></div>
            </div>
            <div><label style={css.label}>Notas especiais</label><textarea style={{...css.input,resize:"none",height:60}} placeholder="Alergias, medicação…" value={pNotes} onChange={e=>setPNotes(e.target.value)}/></div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(2)} style={{...css.btn(false,T.forest),flex:1,padding:"12px 0"}}>← Voltar</button>
              <button onClick={finish} disabled={saving} style={{...css.btn(true,T.forest),flex:2,padding:"12px 0",opacity:saving?.65:1}}>{saving?"A guardar…":"Entrar na app 🎉"}</button>
            </div>
            {!pName.trim()&&<button onClick={finish} disabled={saving} style={{...css.btn(false,T.muted),width:"100%",padding:"10px 0",fontSize:12}}>Saltar e entrar →</button>}
          </div>
        )}

        {step===3&&!isDono&&(
          <div style={{...css.card,padding:24,display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <label style={css.label}>Serviços que ofereces *</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
                {ALL_SVC.map(s=><button key={s} onClick={()=>toggleSvc(s)} style={{background:services.includes(s)?T.forest:"#f0f7f2",color:services.includes(s)?T.white:T.muted,border:"none",borderRadius:100,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FONT,transition:"all .15s"}}>{services.includes(s)?"✓ ":""}{s}</button>)}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={css.label}>Preço por hora (€) *</label><input style={css.input} type="number" placeholder="ex: 12" value={price} onChange={e=>setPrice(e.target.value)}/></div>
              <div><label style={css.label}>Máx. animais</label><select style={css.input} value={maxPets} onChange={e=>setMaxPets(e.target.value)}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} animal{n>1?"is":""}</option>)}</select></div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <label style={css.label}>Opções</label>
              {[{k:"g",v:garden,s:setGarden,l:"🌿 Tenho jardim / espaço exterior"},{k:"a",v:avail,s:setAvail,l:"✅ Estou disponível agora"}].map(({k,v,s,l})=>(
                <button key={k} onClick={()=>s(!v)} style={{display:"flex",alignItems:"center",gap:12,background:v?T.pale:"#f8faf9",border:`2px solid ${v?T.forest:T.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",fontFamily:FONT,textAlign:"left"}}>
                  <div style={{width:20,height:20,borderRadius:6,background:v?T.forest:T.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"white",flexShrink:0}}>{v?"✓":""}</div>
                  <span style={{fontSize:13,fontWeight:600,color:v?T.forest:T.muted}}>{l}</span>
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(2)} style={{...css.btn(false,T.violet),flex:1,padding:"12px 0"}}>← Voltar</button>
              <button onClick={finish} disabled={saving||services.length===0||!price} style={{...css.btn(true,T.violet),flex:2,padding:"12px 0",opacity:(saving||services.length===0||!price)?.5:1}}>{saving?"A guardar…":"Entrar na app 🎉"}</button>
            </div>
            {services.length===0&&<p style={{textAlign:"center",color:T.muted,fontSize:12,margin:0}}>Seleciona pelo menos um serviço</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ALERTS ───────────────────────────────────────────────────────────────────
function AlertsScreen({alerts,onAddAlert}) {
  const [view,setView]=useState("list");
  const [aType,setAType]=useState("perdido");
  const [done,setDone]=useState(false);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({name:"",breed:"",area:"",contact:"",description:"",reward:""});
  const ch=f=>e=>setForm(p=>({...p,[f]:e.target.value}));
  const submit=async()=>{
    if(!form.name||!form.area||!form.contact) return;
    setSaving(true);
    await onAddAlert({type:aType,name:form.name,photo:aType==="perdido"?"🐾":"🐕",area:form.area,time:"Agora mesmo",description:form.description,contact:form.contact,distance:"—",reward:form.reward?form.reward+"€":null,active:true});
    setSaving(false);setDone(true);
    setTimeout(()=>{setDone(false);setView("list");setForm({name:"",breed:"",area:"",contact:"",description:"",reward:""});},2200);
  };
  if(view==="sos") return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Back onClick={()=>setView("list")}/>
      <div><h2 style={{margin:0,fontSize:20,fontWeight:800,fontFamily:SERIF}}>🚨 SOS Pet</h2><p style={{color:T.muted,fontSize:13,margin:"4px 0 0"}}>Alerta para a tua comunidade</p></div>
      {done?<div style={{...css.card,textAlign:"center",padding:48,background:"#e8f5ec"}}><div style={{fontSize:48,marginBottom:12}}>✅</div><div style={{fontWeight:800,fontSize:18,color:T.forest}}>Alerta publicado!</div></div>:<>
        <div style={css.card}><label style={css.label}>Tipo</label><div style={{display:"flex",gap:8}}>{[["perdido","🔴 Perdido","#fde8e8",T.red],["encontrado","🟢 Encontrado","#dcf0e3","#16773a"]].map(([t,l,bg,col])=><button key={t} onClick={()=>setAType(t)} style={{flex:1,background:aType===t?bg:"#f8faf9",border:`2px solid ${aType===t?col:T.border}`,borderRadius:12,padding:"11px 0",fontSize:13,fontWeight:700,color:aType===t?col:T.muted,cursor:"pointer",fontFamily:FONT}}>{l}</button>)}</div></div>
        <div style={css.card}><div style={{display:"flex",flexDirection:"column",gap:10}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><label style={css.label}>Nome *</label><input style={css.input} placeholder="ex: Mimi" value={form.name} onChange={ch("name")}/></div><div><label style={css.label}>Raça</label><input style={css.input} placeholder="ex: Persa" value={form.breed} onChange={ch("breed")}/></div></div><div><label style={css.label}>Descrição</label><textarea style={{...css.input,resize:"none",height:68}} placeholder="Cor, marcas, coleira…" value={form.description} onChange={ch("description")}/></div></div></div>
        <div style={css.card}><div style={{display:"flex",flexDirection:"column",gap:10}}><div><label style={css.label}>Zona *</label><input style={css.input} placeholder="ex: Porto, Cedofeita" value={form.area} onChange={ch("area")}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><label style={css.label}>Contacto *</label><input style={css.input} placeholder="912 345 678" value={form.contact} onChange={ch("contact")}/></div><div><label style={css.label}>Recompensa (€)</label><input style={css.input} type="number" placeholder="50" value={form.reward} onChange={ch("reward")}/></div></div></div></div>
        <button onClick={submit} disabled={saving} style={{...css.btn(true,T.red),width:"100%",padding:"14px 0",fontSize:14,opacity:(!form.name||!form.area||!form.contact||saving)?.5:1}}>{saving?"A publicar…":"🚨 Publicar alerta"}</button>
      </>}
    </div>
  );
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:800,fontFamily:SERIF}}>Alertas</h2><p style={{color:T.muted,fontSize:13,margin:"2px 0 0"}}>{alerts.length} alertas ativos</p></div>
        <button onClick={()=>setView("sos")} style={{...css.btn(true,T.red),padding:"9px 16px",fontSize:13}}>🚨 SOS Pet</button>
      </div>
      {alerts.length===0&&<div style={{...css.card,textAlign:"center",padding:40,color:T.muted}}><div style={{fontSize:40,marginBottom:12}}>📭</div><div style={{fontWeight:600}}>Sem alertas ativos</div></div>}
      {alerts.map(a=>(
        <div key={a.id} style={{...css.card,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:54,height:54,borderRadius:14,background:a.type==="perdido"?"#fde8e8":"#dcf0e3",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{a.photo}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:3}}>
              <span style={{fontWeight:700,fontSize:15}}>{a.name}</span>
              <Badge color={a.type==="perdido"?T.red:"#16773a"} bg={a.type==="perdido"?"#fde8e8":"#dcf0e3"}>{a.type==="perdido"?"🔴 Perdido":"🟢 Encontrado"}</Badge>
              {a.reward&&<Badge color="#c47a00" bg="#fff3e0">🏆 {a.reward}</Badge>}
            </div>
            <div style={{fontSize:13,color:T.text,lineHeight:1.5,marginBottom:6}}>{a.description}</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}><Tag>📍 {a.area}</Tag><Tag bg="#f0f4f8" color="#5a6a7a">⏰ {a.time}</Tag></div>
          </div>
          <button style={{width:36,height:36,borderRadius:"50%",background:T.forest,border:"none",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>📞</button>
        </div>
      ))}
    </div>
  );
}

// ─── DONO: PETS ───────────────────────────────────────────────────────────────
function PetsScreen({user,ownerPets,onRefresh}) {
  const [sel,setSel]=useState(null);
  const [sub,setSub]=useState("info");
  const [addMode,setAddMode]=useState(false);
  const [saving,setSaving]=useState(false);
  const petRef=useRef();
  const [pName,setPName]=useState("");const [pSpecies,setPSpecies]=useState("🐕");const [pBreed,setPBreed]=useState("");const [pAge,setPAge]=useState("");const [pWeight,setPWeight]=useState("");const [pNotes,setPNotes]=useState("");const [pPhoto,setPPhoto]=useState(null);
  const reset=()=>{setPName("");setPSpecies("🐕");setPBreed("");setPAge("");setPWeight("");setPNotes("");setPPhoto(null);};
  const handlePetPhoto=async(e)=>{const file=e.target.files[0];if(!file)return;try{const r=storageRef(storage,`pets/${Date.now()}_${file.name}`);await uploadBytes(r,file);setPPhoto(await getDownloadURL(r));}catch(e){console.error(e);}};
  const save=async()=>{if(!pName.trim())return;setSaving(true);await addDoc(collection(db,"pets"),{owner_id:user.id,name:pName.trim(),species:pSpecies,breed:pBreed||"—",age:parseInt(pAge)||0,weight:pWeight||"—",color:PET_BG[Math.floor(Math.random()*PET_BG.length)],status:"Em casa",vaccines:[],nextVet:"—",microchip:"—",notes:pNotes,photoURL:pPhoto||null});setSaving(false);setAddMode(false);reset();onRefresh?.();};
  const pet=ownerPets.find(p=>p.id===sel);
  if(addMode) return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Back onClick={()=>{setAddMode(false);reset();}}/>
      <h2 style={{margin:0,fontSize:20,fontWeight:800,fontFamily:SERIF}}>🐾 Novo animal</h2>
      <div style={{...css.card,display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{position:"relative",cursor:"pointer",flexShrink:0}} onClick={()=>petRef.current?.click()}>
            <div style={{width:68,height:68,borderRadius:18,background:PET_BG[0],display:"flex",alignItems:"center",justifyContent:"center",fontSize:pPhoto?0:34,overflow:"hidden",border:`2px dashed ${T.border}`}}>{pPhoto?<img src={pPhoto} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:pSpecies}</div>
            <div style={{position:"absolute",bottom:-4,right:-4,width:24,height:24,borderRadius:"50%",background:T.forest,border:`2px solid ${T.white}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>📷</div>
            <input ref={petRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePetPhoto}/>
          </div>
          <div style={{flex:1}}><label style={css.label}>Nome *</label><input style={css.input} placeholder="Nome do animal" value={pName} onChange={e=>setPName(e.target.value)} autoFocus/></div>
        </div>
        <div><label style={css.label}>Espécie</label><div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>{SPECIES.map(sp=><button key={sp.emoji} onClick={()=>setPSpecies(sp.emoji)} style={{background:pSpecies===sp.emoji?T.pale:"#f8faf9",border:`2px solid ${pSpecies===sp.emoji?T.forest:T.border}`,borderRadius:12,padding:"7px 11px",cursor:"pointer",fontFamily:FONT,fontSize:12,fontWeight:600,color:pSpecies===sp.emoji?T.forest:T.muted}}>{sp.emoji} {sp.label}</button>)}</div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={css.label}>Raça</label><input style={css.input} placeholder="ex: Labrador" value={pBreed} onChange={e=>setPBreed(e.target.value)}/></div>
          <div><label style={css.label}>Idade (anos)</label><input style={css.input} type="number" placeholder="3" value={pAge} onChange={e=>setPAge(e.target.value)}/></div>
          <div><label style={css.label}>Peso</label><input style={css.input} placeholder="ex: 8kg" value={pWeight} onChange={e=>setPWeight(e.target.value)}/></div>
        </div>
        <div><label style={css.label}>Notas</label><textarea style={{...css.input,resize:"none",height:60}} placeholder="Alergias, medicação…" value={pNotes} onChange={e=>setPNotes(e.target.value)}/></div>
        <button onClick={save} disabled={saving||!pName.trim()} style={{...css.btn(true),width:"100%",padding:"13px 0",opacity:(saving||!pName.trim())?.5:1}}>{saving?"A guardar…":"Guardar animal"}</button>
      </div>
    </div>
  );
  if(pet) return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Back onClick={()=>setSel(null)}/>
      <div style={{...css.card,background:pet.color||T.pale,border:"none",display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:64,height:64,borderRadius:18,overflow:"hidden",flexShrink:0,background:"rgba(255,255,255,.55)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {pet.photoURL?<img src={pet.photoURL} alt={pet.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:36}}>{pet.species}</span>}
        </div>
        <div style={{flex:1}}><div style={{fontSize:20,fontWeight:800,fontFamily:SERIF}}>{pet.name}</div><div style={{color:T.muted,fontSize:13,margin:"2px 0 8px"}}>{pet.breed} · {pet.age} anos · {pet.weight}</div><Badge color={pet.status==="Em casa"?"#16773a":"#c47a00"} bg={pet.status==="Em casa"?"#dcf0e3":"#fff3e0"}>{pet.status}</Badge></div>
      </div>
      <div style={{display:"flex",background:"#edf5ef",borderRadius:12,padding:4}}>{["info","vacinas","historial"].map(t=><button key={t} onClick={()=>setSub(t)} style={{flex:1,background:sub===t?T.white:"transparent",border:"none",borderRadius:9,padding:"8px 0",fontWeight:700,fontSize:13,color:sub===t?T.forest:T.muted,cursor:"pointer",fontFamily:FONT,textTransform:"capitalize"}}>{t}</button>)}</div>
      {sub==="info"&&<div style={{display:"flex",flexDirection:"column",gap:10}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[["Microchip",pet.microchip||"—"],["Próxima consulta",pet.nextVet||"—"],["Raça",pet.breed||"—"],["Peso",pet.weight||"—"]].map(([k,v])=><div key={k} style={css.card}><div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{k}</div><div style={{fontWeight:600,fontSize:14}}>{v}</div></div>)}</div>{pet.notes&&<div style={css.card}><div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Notas</div><div style={{fontSize:14,color:T.text,lineHeight:1.6}}>{pet.notes}</div></div>}</div>}
      {sub==="vacinas"&&<div style={css.card}>{(pet.vaccines||[]).length===0?<div style={{textAlign:"center",color:T.muted,padding:20,fontSize:13}}>Sem vacinas registadas</div>:(pet.vaccines||[]).map((v,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#f0f7f2",borderRadius:10,marginBottom:8}}><span>💉</span><span style={{flex:1,fontWeight:500,fontSize:14}}>{v}</span><Badge color="#16773a" bg="#dcf0e3">✓ Ok</Badge></div>)}</div>}
      {sub==="historial"&&<div style={{...css.card,textAlign:"center",padding:40,color:T.muted,fontSize:13}}>Historial médico em breve</div>}
    </div>
  );
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:800,fontFamily:SERIF}}>Os meus animais</h2>
        <button onClick={()=>setAddMode(true)} style={{...css.btn(true),padding:"8px 16px",fontSize:13}}>+ Novo</button>
      </div>
      {ownerPets.length===0&&<div style={{...css.card,textAlign:"center",padding:40,color:T.muted}}><div style={{fontSize:48,marginBottom:12}}>🐾</div><div style={{fontWeight:700,fontSize:15}}>Sem animais ainda</div><button onClick={()=>setAddMode(true)} style={{...css.btn(true),marginTop:16,padding:"10px 22px"}}>Adicionar pet</button></div>}
      {ownerPets.map(p=>(
        <div key={p.id} onClick={()=>{setSel(p.id);setSub("info");}} style={{...css.card,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
          <div style={{width:52,height:52,borderRadius:14,background:p.color||T.pale,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>{p.photoURL?<img src={p.photoURL} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:28}}>{p.species}</span>}</div>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>{p.name}</div><div style={{fontSize:13,color:T.muted,marginTop:2}}>{p.breed} · {p.age} anos</div></div>
          <Badge color={p.status==="Em casa"?"#16773a":"#c47a00"} bg={p.status==="Em casa"?"#dcf0e3":"#fff3e0"}>{p.status}</Badge>
          <span style={{color:T.muted,fontSize:20}}>›</span>
        </div>
      ))}
    </div>
  );
}

// ─── DONO: CAREGIVERS ─────────────────────────────────────────────────────────
function CaregiversScreen({user,ownerPets,onAddBooking,appData}) {
  const {users,caregiverProfiles,reviews}=appData;
  const [sel,setSel]=useState(null);const [filter,setFilter]=useState("Todos");const [showBook,setShowBook]=useState(false);const [bookDone,setBookDone]=useState(false);const [saving,setSaving]=useState(false);const [bf,setBf]=useState({pet_id:"",service:"",date:"",time:"",notes:""});
  const svcList=["Todos","Pet Sitting","Passeios","Banho","Treino","Hospedagem"];
  const list=filter==="Todos"?caregiverProfiles:caregiverProfiles.filter(c=>c.services.includes(filter));
  const cgP=sel?caregiverProfiles.find(c=>c.user_id===sel):null;
  const cgU=sel?users.find(u=>u.id===sel):null;
  const cgRev=sel?reviews.filter(r=>r.caregiver_id===sel):[];
  const book=async()=>{if(!bf.pet_id||!bf.service||!bf.date||!bf.time)return;setSaving(true);await onAddBooking({owner_id:user.id,caregiver_id:sel,pet_id:bf.pet_id,service:bf.service,date:bf.date,time:bf.time,duration:1,status:"pendente",price:cgP.price_per_hour,notes:bf.notes,created_at:new Date().toISOString().split("T")[0]});setSaving(false);setBookDone(true);setTimeout(()=>{setBookDone(false);setShowBook(false);setBf({pet_id:"",service:"",date:"",time:"",notes:""});},2200);};
  if(cgP&&cgU) return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Back onClick={()=>{setSel(null);setShowBook(false);setBookDone(false);}}/>
      <div style={{...css.card,textAlign:"center",padding:28}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Avatar name={cgU.name} photoURL={cgU.photoURL} size={80}/></div>
        <div style={{fontWeight:800,fontSize:20,fontFamily:SERIF}}>{cgU.name}</div>
        {cgP.badge&&<div style={{marginTop:6}}><Badge color="#c47a00" bg="#fff3e0">{cgP.badge}</Badge></div>}
        {cgP.rating>0&&<div style={{marginTop:8}}><Stars r={cgP.rating}/><span style={{color:T.muted,fontSize:12}}> ({cgP.reviews} avaliações)</span></div>}
        <div style={{color:T.muted,fontSize:13,marginTop:10,lineHeight:1.6}}>{cgP.description||cgP.bio}</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12,flexWrap:"wrap"}}><Tag>📍 {cgU.location||"—"}</Tag>{cgP.has_garden&&<Tag bg="#dcf0e3" color="#16773a">🌿 Jardim</Tag>}</div>
      </div>
      <div style={css.card}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:10}}>Serviços</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{cgP.services.map(sv=><Tag key={sv}>{sv}</Tag>)}</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={css.card}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Preço/hora</div><div style={{fontWeight:800,fontSize:22,color:T.forest}}>{cgP.price_per_hour}€</div></div>
        <div style={css.card}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Disponível</div><Badge color={cgP.available?"#16773a":"#888"} bg={cgP.available?"#dcf0e3":"#f0f4f8"}>{cgP.available?"✅ Sim":"⏸ Não"}</Badge></div>
      </div>
      {cgRev.length>0&&<div style={css.card}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:12}}>Avaliações</div>{cgRev.map(r=>{const o=users.find(u=>u.id===r.owner_id);return(<div key={r.id} style={{paddingBottom:12,borderBottom:`1px solid ${T.border}`,marginBottom:12}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><Avatar name={o?.name||""} photoURL={o?.photoURL} size={28}/><span style={{fontWeight:600,fontSize:14}}>{o?.name}</span><Stars r={r.rating}/></div><p style={{fontSize:13,color:T.text,margin:0}}>"{r.comment}"</p></div>);})}</div>}
      {showBook?bookDone?<div style={{...css.card,textAlign:"center",padding:40,background:"#e8f5ec"}}><div style={{fontSize:48,marginBottom:12}}>✅</div><div style={{fontWeight:800,fontSize:17,color:T.forest}}>Pedido enviado!</div></div>:(
        <div style={{...css.card,border:`2px solid ${T.mint}`}}>
          <div style={{fontWeight:800,fontSize:16,marginBottom:14}}>📅 Reserva com {cgU.name}</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div><label style={css.label}>Animal *</label><select style={css.input} value={bf.pet_id} onChange={e=>setBf(f=>({...f,pet_id:e.target.value}))}><option value="">Seleciona o animal</option>{ownerPets.map(p=><option key={p.id} value={p.id}>{p.species} {p.name}</option>)}</select></div>
            <div><label style={css.label}>Serviço *</label><select style={css.input} value={bf.service} onChange={e=>setBf(f=>({...f,service:e.target.value}))}><option value="">Seleciona o serviço</option>{cgP.services.map(sv=><option key={sv} value={sv}>{sv}</option>)}</select></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><label style={css.label}>Data *</label><input style={css.input} type="date" value={bf.date} onChange={e=>setBf(f=>({...f,date:e.target.value}))}/></div><div><label style={css.label}>Hora *</label><input style={css.input} type="time" value={bf.time} onChange={e=>setBf(f=>({...f,time:e.target.value}))}/></div></div>
            <div><label style={css.label}>Notas</label><textarea style={{...css.input,resize:"none",height:60}} placeholder="Instruções especiais…" value={bf.notes} onChange={e=>setBf(f=>({...f,notes:e.target.value}))}/></div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:12}}><button onClick={book} disabled={saving} style={{...css.btn(true),flex:1,padding:"12px 0",opacity:(!bf.pet_id||!bf.service||!bf.date||!bf.time||saving)?.5:1}}>{saving?"A enviar…":"Enviar pedido"}</button><button onClick={()=>setShowBook(false)} style={{...css.btn(false),padding:"12px 16px"}}>Cancelar</button></div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <button onClick={()=>setShowBook(true)} disabled={!cgP.available} style={{...css.btn(true),width:"100%",padding:"13px 0",opacity:cgP.available?1:.5}}>📅 {cgP.available?"Reservar agora":"Indisponível"}</button>
          <button style={{...css.btn(false),width:"100%",padding:"13px 0"}}>💬 Enviar mensagem</button>
        </div>
      )}
    </div>
  );
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <h2 style={{margin:0,fontSize:20,fontWeight:800,fontFamily:SERIF}}>Cuidadores</h2>
      <div style={{display:"flex",alignItems:"center",gap:8,background:T.white,border:`1px solid ${T.border}`,borderRadius:100,padding:"10px 16px"}}><span>🔍</span><span style={{color:"#bbb",fontSize:13}}>Pesquisar cuidadores…</span></div>
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>{svcList.map(sv=><button key={sv} onClick={()=>setFilter(sv)} style={{background:filter===sv?T.forest:"#f0f7f2",color:filter===sv?T.white:T.muted,border:"none",borderRadius:100,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",fontFamily:FONT}}>{sv}</button>)}</div>
      {list.length===0&&<div style={{...css.card,textAlign:"center",padding:40,color:T.muted}}><div style={{fontSize:40,marginBottom:12}}>👤</div><div style={{fontWeight:600}}>Sem cuidadores</div></div>}
      {list.map(c=>{const u=users.find(us=>us.id===c.user_id);return(
        <div key={c.user_id} onClick={()=>setSel(c.user_id)} style={{...css.card,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
          <Avatar name={u?.name||""} photoURL={u?.photoURL} size={48}/>
          <div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontWeight:700,fontSize:15}}>{u?.name}</span>{c.verified&&<span>✅</span>}</div>{c.rating>0&&<Stars r={c.rating}/>}<div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>{c.services.slice(0,2).map(sv=><Tag key={sv}>{sv}</Tag>)}</div></div>
          <div style={{textAlign:"right",flexShrink:0}}><div style={{fontWeight:700,color:T.forest,fontSize:15,marginBottom:4}}>{c.price_per_hour}€/h</div><Badge color={c.available?"#16773a":"#888"} bg={c.available?"#dcf0e3":"#f0f4f8"}>{c.available?"Disponível":"Ocupado"}</Badge></div>
        </div>
      );})}
    </div>
  );
}

// ─── DONO: BOOKINGS ───────────────────────────────────────────────────────────
function DonoBookingsScreen({user,bookings,onUpdate,appData}) {
  const {users,pets}=appData;
  const mine=bookings.filter(b=>b.owner_id===user.id);
  const ORDER=["a decorrer","orçamento_enviado","confirmado","pendente","rejeitado"];
  const LABELS={"a decorrer":"A decorrer","orçamento_enviado":"Orçamento recebido","confirmado":"Confirmados","pendente":"A aguardar orçamento","rejeitado":"Rejeitados"};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <h2 style={{margin:0,fontSize:20,fontWeight:800,fontFamily:SERIF}}>As minhas reservas</h2>
      {mine.length===0&&<div style={{...css.card,textAlign:"center",padding:40,color:T.muted}}><div style={{fontSize:40,marginBottom:12}}>🗓️</div><div style={{fontWeight:600}}>Sem reservas ainda</div></div>}
      {ORDER.map(status=>{
        const list=mine.filter(b=>b.status===status);if(!list.length)return null;
        return(<div key={status}><div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>{LABELS[status]}</div>
          {list.map(b=>{const cU=users.find(u=>u.id===b.caregiver_id);const pet=pets.find(p=>p.id===b.pet_id);return(
            <div key={b.id} style={{...css.card,marginBottom:10,border:status==="orçamento_enviado"?`2px solid ${T.violet}`:`1px solid ${T.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:b.quote_price?12:0}}>
                <Avatar name={cU?.name||""} photoURL={cU?.photoURL} size={42}/>
                <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:14}}>{pet?.species} {pet?.name} com {cU?.name}</div><div style={{color:T.muted,fontSize:13,marginTop:2}}>{b.service} · {b.date} {b.time}</div></div>
                <div style={{textAlign:"right",flexShrink:0}}><div style={{fontWeight:700,color:T.forest,fontSize:15,marginBottom:4}}>{b.quote_price||b.price}€</div><Badge color={STATUS[b.status]?.color} bg={STATUS[b.status]?.bg}>{b.status}</Badge></div>
              </div>
              {status==="orçamento_enviado"&&b.quote_price&&(<>
                <div style={{background:T.violetBg,borderRadius:12,padding:14,marginBottom:12,border:`1px solid #c8b8f8`}}>
                  <div style={{fontSize:11,color:T.violet,fontWeight:700,textTransform:"uppercase",marginBottom:10}}>💶 Orçamento do cuidador</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {[["Valor",`${b.quote_price}€`],["Data",b.quote_date||b.date]].map(([k,v])=><div key={k} style={{background:"rgba(255,255,255,.7)",borderRadius:9,padding:"8px 10px"}}><div style={{fontSize:10,color:T.violet,fontWeight:700,textTransform:"uppercase"}}>{k}</div><div style={{fontWeight:700,fontSize:14,marginTop:2,color:T.violet}}>{v}</div></div>)}
                  </div>
                  {b.quote_notes&&<div style={{fontSize:13,color:T.violet,fontStyle:"italic",marginTop:8}}>📝 "{b.quote_notes}"</div>}
                </div>
                <div style={{display:"flex",gap:8}}><button onClick={()=>onUpdate(b.id,{status:"confirmado",price:b.quote_price})} style={{...css.btn(true),flex:1,padding:"12px 0"}}>✅ Aceitar</button><button onClick={()=>onUpdate(b.id,{status:"rejeitado"})} style={{...css.btn(true,T.red),padding:"12px 16px"}}>❌</button></div>
              </>)}
            </div>
          );})}
        </div>);
      })}
    </div>
  );
}

// ─── DONO: DASHBOARD ──────────────────────────────────────────────────────────
function DonoDashboard({user,setTab,ownerPets,bookings,alerts,appData}) {
  const {users,pets}=appData;
  const mine=bookings.filter(b=>b.owner_id===user.id);
  const active=mine.find(b=>b.status==="a decorrer");
  const pending=mine.filter(b=>b.status==="pendente").length;
  const quotePend=mine.filter(b=>b.status==="orçamento_enviado").length;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><p style={{color:T.muted,fontSize:13,margin:0,fontWeight:500}}>Bom dia 👋</p><h1 style={{margin:0,fontSize:22,fontWeight:800,fontFamily:SERIF}}>Olá, {user.name.split(" ")[0]}</h1></div>
        <Avatar name={user.name} photoURL={user.photoURL} size={44}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {[{label:"Pets",icon:"🐾",val:ownerPets.length,tab:"pets",bg:"#e8f5ec"},{label:"Alertas",icon:"📍",val:alerts.length,tab:"alerts",bg:"#fff3e0"},{label:"Reservas",icon:"🗓️",val:mine.length,tab:"bookings",bg:T.violetBg}].map(s=>(
          <div key={s.tab} onClick={()=>setTab(s.tab)} style={{...css.card,background:s.bg,border:"none",cursor:"pointer",padding:"14px 10px",textAlign:"center"}}>
            <div style={{fontSize:24}}>{s.icon}</div><div style={{fontWeight:800,fontSize:24,margin:"4px 0 0",fontFamily:SERIF}}>{s.val}</div><div style={{fontSize:11,color:T.muted,fontWeight:600}}>{s.label}</div>
          </div>
        ))}
      </div>
      {active&&<div style={{background:`linear-gradient(135deg,${T.forest},${T.moss})`,borderRadius:18,padding:16,color:"#fff",display:"flex",alignItems:"center",gap:12}}><Avatar name={users.find(u=>u.id===active.caregiver_id)?.name||""} photoURL={users.find(u=>u.id===active.caregiver_id)?.photoURL} size={44} style={{border:"2px solid rgba(255,255,255,.3)"}}/><div style={{flex:1}}><div style={{fontSize:11,opacity:.7,fontWeight:600}}>A DECORRER AGORA</div><div style={{fontWeight:700,fontSize:15}}>{pets.find(p=>p.id===active.pet_id)?.name} com {users.find(u=>u.id===active.caregiver_id)?.name}</div><div style={{fontSize:12,opacity:.8}}>{active.service} · {active.date}</div></div></div>}
      {quotePend>0&&<div onClick={()=>setTab("bookings")} style={{...css.card,background:T.violetBg,border:`2px solid #c8b8f8`,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:24}}>💶</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:T.violet}}>{quotePend} orçamento{quotePend>1?"s":""} por responder</div><div style={{fontSize:13,color:"#9b8fd4"}}>Toca para ver</div></div><span style={{fontSize:20,color:T.violet}}>›</span></div>}
      {pending>0&&<div onClick={()=>setTab("bookings")} style={{...css.card,background:"#fff3e0",border:"1px solid #f5d08a",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:24}}>⏳</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{pending} reserva{pending>1?"s":""} pendente{pending>1?"s":""}</div></div><span style={{fontSize:20,color:T.muted}}>›</span></div>}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontWeight:700,fontSize:15,fontFamily:SERIF}}>Os meus animais</span><span onClick={()=>setTab("pets")} style={{color:T.moss,fontSize:13,fontWeight:600,cursor:"pointer"}}>Ver todos →</span></div>
        {ownerPets.length===0?<div style={{...css.card,textAlign:"center",padding:28,color:T.muted,cursor:"pointer"}} onClick={()=>setTab("pets")}><div style={{fontSize:36,marginBottom:8}}>🐾</div><div style={{fontWeight:600,fontSize:14}}>Adiciona o teu primeiro pet</div></div>
        :<div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4}}>{ownerPets.map(p=><div key={p.id} onClick={()=>setTab("pets")} style={{...css.card,minWidth:130,flexShrink:0,textAlign:"center",background:p.color||T.pale,border:"none",cursor:"pointer"}}><div style={{width:42,height:42,borderRadius:14,overflow:"hidden",margin:"0 auto 8px",background:"rgba(255,255,255,.6)",display:"flex",alignItems:"center",justifyContent:"center"}}>{p.photoURL?<img src={p.photoURL} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:26}}>{p.species}</span>}</div><div style={{fontWeight:700,fontSize:14}}>{p.name}</div><div style={{fontSize:11,color:T.muted,margin:"2px 0 8px"}}>{p.breed}</div><Badge color={p.status==="Em casa"?"#16773a":"#c47a00"} bg={p.status==="Em casa"?"#dcf0e3":"#fff3e0"}>{p.status}</Badge></div>)}</div>}
      </div>
    </div>
  );
}

// ─── CUIDADOR: DASHBOARD ──────────────────────────────────────────────────────
function CuidadorDashboard({user,profile,bookings,setTab,appData}) {
  const {users,pets}=appData;
  const mine=bookings.filter(b=>b.caregiver_id===user.id);
  const pending=mine.filter(b=>b.status==="pendente");
  const earning=mine.filter(b=>["confirmado","a decorrer"].includes(b.status)).reduce((s,b)=>s+b.price,0);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><p style={{color:T.muted,fontSize:13,margin:0,fontWeight:500}}>Painel do cuidador</p><h1 style={{margin:0,fontSize:22,fontWeight:800,fontFamily:SERIF}}>Olá, {user.name.split(" ")[0]}</h1></div><Avatar name={user.name} photoURL={user.photoURL} size={44}/></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {[{label:"Pedidos",icon:"📩",val:pending.length,tab:"requests",bg:"#fff3e0"},{label:"Confirmados",icon:"✅",val:mine.filter(b=>b.status==="confirmado").length,tab:"schedule",bg:T.pale},{label:"Ganhos",icon:"💶",val:`${earning}€`,tab:"schedule",bg:T.violetBg}].map(s=>(
          <div key={s.label} onClick={()=>setTab(s.tab)} style={{...css.card,background:s.bg,border:"none",cursor:"pointer",padding:"14px 10px",textAlign:"center"}}><div style={{fontSize:24}}>{s.icon}</div><div style={{fontWeight:800,fontSize:22,margin:"4px 0 0",fontFamily:SERIF}}>{s.val}</div><div style={{fontSize:11,color:T.muted,fontWeight:600}}>{s.label}</div></div>
        ))}
      </div>
      {pending.length>0&&<div style={{...css.card,background:"#fff3e0",border:"1px solid #f5d08a"}}><div style={{fontWeight:700,fontSize:15,marginBottom:12}}>📩 Novos pedidos ({pending.length})</div>{pending.slice(0,2).map(b=>{const owner=users.find(u=>u.id===b.owner_id);const pet=pets.find(p=>p.id===b.pet_id);return(<div key={b.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderTop:`1px solid #f5d08a`}}><Avatar name={owner?.name||""} photoURL={owner?.photoURL} size={36}/><div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{owner?.name}</div><div style={{fontSize:12,color:T.muted}}>{pet?.species} {pet?.name} · {b.service}</div></div><button onClick={()=>setTab("requests")} style={{...css.btn(true),padding:"6px 12px",fontSize:12}}>Ver</button></div>);})} {pending.length>2&&<div onClick={()=>setTab("requests")} style={{textAlign:"center",color:T.moss,fontSize:13,fontWeight:600,cursor:"pointer",paddingTop:8}}>+{pending.length-2} mais →</div>}</div>}
      <div style={css.card}><div style={{fontWeight:700,fontSize:15,marginBottom:12,fontFamily:SERIF}}>Resumo</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[["Total",mine.length],["Avaliação",profile?.rating||"—"],["Avaliações",profile?.reviews||0],["Preço/h",`${profile?.price_per_hour||0}€`]].map(([k,v])=><div key={k} style={{background:T.pale,borderRadius:12,padding:12}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase"}}>{k}</div><div style={{fontWeight:800,fontSize:20,color:T.forest,marginTop:4}}>{v}</div></div>)}</div></div>
    </div>
  );
}

// ─── CUIDADOR: PEDIDOS ────────────────────────────────────────────────────────
function CuidadorPedidos({user,bookings,onUpdate,appData}) {
  const {users,pets}=appData;
  const [open,setOpen]=useState(null);const [qf,setQf]=useState({price:"",notes:"",date:"",time:""});const [saving,setSaving]=useState(false);
  const mine=bookings.filter(b=>b.caregiver_id===user.id&&["pendente","orçamento_enviado","rejeitado"].includes(b.status));
  const send=async(b)=>{if(!qf.price)return;setSaving(true);await onUpdate(b.id,{status:"orçamento_enviado",quote_price:parseFloat(qf.price),quote_notes:qf.notes,quote_date:qf.date||b.date,quote_time:qf.time||b.time});setSaving(false);setOpen(null);setQf({price:"",notes:"",date:"",time:""});};
  const LABELS={"pendente":"🔵 Novos pedidos","orçamento_enviado":"🟣 Orçamento enviado","rejeitado":"❌ Rejeitados"};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div><h2 style={{margin:0,fontSize:20,fontWeight:800,fontFamily:SERIF}}>📩 Pedidos</h2><p style={{color:T.muted,fontSize:13,margin:"4px 0 0"}}>Analisa e envia orçamentos</p></div>
      {mine.length===0&&<div style={{...css.card,textAlign:"center",padding:40,color:T.muted}}><div style={{fontSize:40,marginBottom:12}}>📭</div><div style={{fontWeight:600}}>Sem pedidos de momento</div></div>}
      {["pendente","orçamento_enviado","rejeitado"].map(status=>{
        const list=mine.filter(b=>b.status===status);if(!list.length)return null;
        return(<div key={status}><div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>{LABELS[status]} ({list.length})</div>
          {list.map(b=>{const owner=users.find(u=>u.id===b.owner_id);const pet=pets.find(p=>p.id===b.pet_id);const isOpen=open===b.id;return(
            <div key={b.id} style={{...css.card,marginBottom:10,border:status==="pendente"?`2px solid ${T.mint}`:`1px solid ${T.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><Avatar name={owner?.name||""} photoURL={owner?.photoURL} size={42}/><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{owner?.name}</div><div style={{color:T.muted,fontSize:12}}>📞 {owner?.phone||"—"}</div></div><Badge color={STATUS[b.status]?.color} bg={STATUS[b.status]?.bg}>{b.status}</Badge></div>
              <div style={{background:T.pale,borderRadius:12,padding:12,marginBottom:10}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Pedido</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{[["Animal",`${pet?.species} ${pet?.name}`],["Serviço",b.service],["Data",b.date],["Hora",b.time]].map(([k,v])=><div key={k}><div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase"}}>{k}</div><div style={{fontWeight:600,fontSize:13,marginTop:2}}>{v}</div></div>)}</div>{b.notes&&<div style={{marginTop:8,fontSize:13,color:T.muted,fontStyle:"italic"}}>📝 "{b.notes}"</div>}</div>
              {b.quote_price&&<div style={{background:T.violetBg,borderRadius:12,padding:12,marginBottom:10,border:`1px solid #c8b8f8`}}><div style={{fontSize:11,color:T.violet,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Orçamento enviado</div><div style={{fontWeight:700,fontSize:16,color:T.violet}}>{b.quote_price}€ · {b.quote_date||b.date}</div>{b.quote_notes&&<div style={{fontSize:13,color:T.violet,fontStyle:"italic",marginTop:4}}>📝 "{b.quote_notes}"</div>}</div>}
              {status==="pendente"&&(isOpen?(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{fontWeight:700,fontSize:13,color:T.forest}}>💶 Enviar orçamento</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><label style={css.label}>Valor (€) *</label><input style={css.input} type="number" placeholder="25" value={qf.price} onChange={e=>setQf(f=>({...f,price:e.target.value}))}/></div><div><label style={css.label}>Data</label><input style={css.input} type="date" value={qf.date} onChange={e=>setQf(f=>({...f,date:e.target.value}))}/></div><div><label style={css.label}>Hora</label><input style={css.input} type="time" value={qf.time} onChange={e=>setQf(f=>({...f,time:e.target.value}))}/></div><div><label style={css.label}>Nota</label><input style={css.input} placeholder="ex: Trazer ração" value={qf.notes} onChange={e=>setQf(f=>({...f,notes:e.target.value}))}/></div></div>
                  <div style={{display:"flex",gap:8}}><button onClick={()=>send(b)} disabled={saving} style={{...css.btn(true),flex:1,padding:"11px 0",opacity:(!qf.price||saving)?.5:1}}>{saving?"A enviar…":"📤 Enviar"}</button><button onClick={()=>{setOpen(null);setQf({price:"",notes:"",date:"",time:""}); }} style={{...css.btn(false),padding:"11px 16px"}}>Cancelar</button></div>
                  <button onClick={()=>{setOpen(null);onUpdate(b.id,{status:"rejeitado"});}} style={{...css.btn(true,T.red),width:"100%",padding:"10px 0"}}>❌ Recusar pedido</button>
                </div>
              ):(
                <div style={{display:"flex",gap:8}}><button onClick={()=>{setOpen(b.id);setQf({price:String(b.price),notes:"",date:b.date,time:b.time});}} style={{...css.btn(true),flex:1,padding:"11px 0"}}>💶 Enviar orçamento</button><button onClick={()=>onUpdate(b.id,{status:"rejeitado"})} style={{...css.btn(true,T.red),padding:"11px 14px"}}>❌</button></div>
              ))}
              {status==="orçamento_enviado"&&<div style={{display:"flex",alignItems:"center",gap:8,background:"#f8f7ff",borderRadius:10,padding:"10px 14px",fontSize:13,color:T.violet}}><span>⏳</span> A aguardar confirmação…</div>}
            </div>
          );})}
        </div>);
      })}
    </div>
  );
}

// ─── CUIDADOR: AGENDA ─────────────────────────────────────────────────────────
function CuidadorAgenda({user,bookings,onUpdate,appData}) {
  const {users,pets}=appData;
  const mine=bookings.filter(b=>b.caregiver_id===user.id&&["confirmado","a decorrer"].includes(b.status));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <h2 style={{margin:0,fontSize:20,fontWeight:800,fontFamily:SERIF}}>📅 Agenda</h2>
      {mine.length===0&&<div style={{...css.card,textAlign:"center",padding:40,color:T.muted}}><div style={{fontSize:40,marginBottom:12}}>🗓️</div><div style={{fontWeight:600}}>Sem serviços confirmados</div></div>}
      {["a decorrer","confirmado"].map(status=>{
        const list=mine.filter(b=>b.status===status);if(!list.length)return null;
        return(<div key={status}><div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>{status==="a decorrer"?"🟠 A decorrer":"✅ Confirmados"} ({list.length})</div>
          {list.map(b=>{const owner=users.find(u=>u.id===b.owner_id);const pet=pets.find(p=>p.id===b.pet_id);return(
            <div key={b.id} style={{...css.card,marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><Avatar name={owner?.name||""} photoURL={owner?.photoURL} size={40}/><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{owner?.name}</div><div style={{color:T.muted,fontSize:12}}>{owner?.phone||"—"}</div></div><Badge color={STATUS[b.status]?.color} bg={STATUS[b.status]?.bg}>{b.status}</Badge></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>{[["Animal",`${pet?.species} ${pet?.name}`],["Serviço",b.service],["Data",`${b.date} ${b.time}`],["Valor",`${b.quote_price||b.price}€`]].map(([k,v])=><div key={k} style={{background:T.pale,borderRadius:10,padding:"8px 10px"}}><div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase"}}>{k}</div><div style={{fontWeight:600,fontSize:13,marginTop:2}}>{v}</div></div>)}</div>
              {status==="confirmado"&&<button onClick={()=>onUpdate(b.id,{status:"a decorrer"})} style={{...css.btn(true,T.amber),width:"100%",padding:"10px 0"}}>▶ Iniciar serviço</button>}
              {status==="a decorrer"&&<button onClick={()=>onUpdate(b.id,{status:"concluido"})} style={{...css.btn(false),width:"100%",padding:"10px 0"}}>✓ Concluir serviço</button>}
            </div>
          );})}
        </div>);
      })}
    </div>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
function ProfileScreen({user,profile,appData,onUpdatePhoto,onLogout}) {
  const {reviews,users}=appData;
  const myReviews=reviews.filter(r=>r.caregiver_id===user.id);
  const isCuidador=user.role==="cuidador";
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <h2 style={{margin:0,fontSize:20,fontWeight:800,fontFamily:SERIF}}>O meu perfil</h2>
      <div style={{...css.card,textAlign:"center",padding:28}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><UploadBtn photoURL={user.photoURL} name={user.name} size={88} onUploaded={onUpdatePhoto} folder="avatars"/></div>
        <div style={{fontWeight:800,fontSize:20,fontFamily:SERIF}}>{user.name}</div>
        <div style={{marginTop:8}}><Badge color={isCuidador?T.violet:T.forest} bg={isCuidador?T.violetBg:T.pale}>{isCuidador?"🤝 Cuidador":"🏡 Dono de Pet"}</Badge></div>
        {isCuidador&&profile&&<div style={{marginTop:6}}><Stars r={profile.rating}/><span style={{color:T.muted,fontSize:12}}> ({profile.reviews} avaliações)</span></div>}
        <div style={{color:T.muted,fontSize:13,marginTop:10,lineHeight:1.6}}>{user.bio||"Sem bio ainda."}</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12,flexWrap:"wrap"}}><Tag>📍 {user.location||"—"}</Tag><Tag bg="#f0f4f8" color="#5a6a7a">📞 {user.phone||"—"}</Tag></div>
      </div>
      {isCuidador&&profile&&<>
        <div style={css.card}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:10}}>Serviços</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{profile.services.map(sv=><Tag key={sv}>{sv}</Tag>)}</div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={css.card}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Preço/hora</div><div style={{fontWeight:800,fontSize:22,color:T.forest}}>{profile.price_per_hour}€</div></div>
          <div style={css.card}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Disponível</div><Badge color={profile.available?"#16773a":"#888"} bg={profile.available?"#dcf0e3":"#f0f4f8"}>{profile.available?"✅ Sim":"⏸ Não"}</Badge></div>
        </div>
        {myReviews.length>0&&<div style={css.card}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:12}}>Avaliações</div>{myReviews.map(r=>{const o=users.find(u=>u.id===r.owner_id);return(<div key={r.id} style={{paddingBottom:12,borderBottom:`1px solid ${T.border}`,marginBottom:12}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><Avatar name={o?.name||""} photoURL={o?.photoURL} size={28}/><span style={{fontWeight:600,fontSize:14}}>{o?.name}</span><Stars r={r.rating}/></div><p style={{fontSize:13,color:T.text,margin:0}}>"{r.comment}"</p></div>);})}</div>}
      </>}
      <button onClick={onLogout} style={{...css.btn(false,T.red),width:"100%",padding:"12px 0",textAlign:"center"}}>🚪 Terminar sessão</button>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
const DONO_TABS=[{id:"dashboard",icon:"🏠",label:"Início"},{id:"pets",icon:"🐾",label:"Pets"},{id:"caregivers",icon:"👤",label:"Cuidadores"},{id:"alerts",icon:"📍",label:"Alertas"},{id:"profile",icon:"😊",label:"Perfil"}];
const CUIDADOR_TABS=[{id:"dashboard",icon:"🏠",label:"Início"},{id:"requests",icon:"📩",label:"Pedidos"},{id:"schedule",icon:"🗓️",label:"Agenda"},{id:"alerts",icon:"📍",label:"Alertas"},{id:"profile",icon:"😊",label:"Perfil"}];

export default function App() {
  const [userProfile,setUserProfile]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [needsOnboarding,setNeedsOnboarding]=useState(false);
  const [tab,setTab]=useState("dashboard");
  const [bookings,setBookings]=useState([]);
  const [alerts,setAlerts]=useState([]);
  const [appData,setAppData]=useState({users:[],pets:[],caregiverProfiles:[],reviews:[]});
  const [mobile,setMobile]=useState(window.innerWidth<768);

  useEffect(()=>{const h=()=>setMobile(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);

  useEffect(()=>{
    return onAuthStateChanged(auth,async fbUser=>{
      if(fbUser){
        const q=query(collection(db,"users"),where("uid","==",fbUser.uid));
        const snap=await getDocs(q);
        if(!snap.empty){const raw=snap.docs[0].data();const data={...raw,id:snap.docs[0].id};setUserProfile(data);setNeedsOnboarding(!data.onboarded);}
      } else {setUserProfile(null);setNeedsOnboarding(false);}
      setAuthLoading(false);
    });
  },[]);

  const loadData=useCallback(async()=>{
    const [uS,pS,cS,rS]=await Promise.all([getDocs(collection(db,"users")),getDocs(collection(db,"pets")),getDocs(collection(db,"caregiver_profiles")),getDocs(collection(db,"reviews"))]);
    setAppData({
      users:uS.docs.map(d=>({...d.data(),id:d.id})),
      pets:pS.docs.map(d=>({id:d.id,...d.data()})),
      caregiverProfiles:cS.docs.map(d=>({...d.data(),user_id:d.id})),
      reviews:rS.docs.map(d=>({id:d.id,...d.data()})),
    });
  },[]);

  useEffect(()=>{if(userProfile) loadData();},[userProfile?.id]);

  useEffect(()=>{
    if(!userProfile) return;
    const u1=onSnapshot(collection(db,"bookings"),s=>setBookings(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(collection(db,"alerts"),s=>setAlerts(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u3=onSnapshot(collection(db,"pets"),s=>setAppData(prev=>({...prev,pets:s.docs.map(d=>({id:d.id,...d.data()}))})));
    return()=>{u1();u2();u3();};
  },[userProfile?.id]);

  const handleLogin=(email,pw)=>signInWithEmailAndPassword(auth,email,pw);
  const handleLogout=()=>{signOut(auth);setTab("dashboard");};
  const handleRegister=async(name,email,pw,role)=>{
    const cred=await createUserWithEmailAndPassword(auth,email,pw);
    const uid=cred.user.uid;
    const data={uid,name,email,role,phone:"",location:"",bio:"",photoURL:null,onboarded:false,id:uid};
    await setDoc(doc(db,"users",uid),data);
    setUserProfile(data);setNeedsOnboarding(true);
  };
  const handleOnboardDone=async()=>{
    const q=query(collection(db,"users"),where("uid","==",auth.currentUser?.uid));
    const snap=await getDocs(q);
    if(!snap.empty){const raw=snap.docs[0].data();setUserProfile({...raw,id:snap.docs[0].id});}
    setNeedsOnboarding(false);loadData();
  };
  const handleUpdatePhoto=async(url)=>{
    await updateDoc(doc(db,"users",String(userProfile.id)),{photoURL:url});
    setUserProfile(p=>({...p,photoURL:url}));
    setAppData(d=>({...d,users:d.users.map(u=>u.id===userProfile.id?{...u,photoURL:url}:u)}));
  };
  const handleAddBooking=data=>addDoc(collection(db,"bookings"),data);
  const handleUpdate=(id,fields)=>updateDoc(doc(db,"bookings",id),fields);
  const handleAddAlert=data=>addDoc(collection(db,"alerts"),data);

  if(authLoading) return <Loading msg="A verificar sessão…"/>;
  if(!userProfile) return <AuthScreen onLogin={handleLogin} onRegister={handleRegister}/>;
  if(needsOnboarding) return <Onboarding user={userProfile} onDone={handleOnboardDone}/>;

  const isDono=userProfile.role==="dono";
  const TABS=isDono?DONO_TABS:CUIDADOR_TABS;
  const ownerPets=appData.pets.filter(p=>p.owner_id===userProfile.id);
  const cgProfile=appData.caregiverProfiles.find(p=>p.user_id===userProfile.id);
  const pendingCount=bookings.filter(b=>b.caregiver_id===userProfile.id&&b.status==="pendente").length;
  const sp={user:userProfile,appData,bookings,alerts};

  const screens=isDono?{
    dashboard:<DonoDashboard {...sp} setTab={setTab} ownerPets={ownerPets}/>,
    pets:<PetsScreen {...sp} ownerPets={ownerPets} onRefresh={loadData}/>,
    caregivers:<CaregiversScreen {...sp} ownerPets={ownerPets} onAddBooking={handleAddBooking}/>,
    alerts:<AlertsScreen alerts={alerts} onAddAlert={handleAddAlert}/>,
    profile:<ProfileScreen {...sp} profile={cgProfile} onUpdatePhoto={handleUpdatePhoto} onLogout={handleLogout}/>,
  }:{
    dashboard:<CuidadorDashboard {...sp} profile={cgProfile} setTab={setTab}/>,
    requests:<CuidadorPedidos {...sp} onUpdate={handleUpdate}/>,
    schedule:<CuidadorAgenda {...sp} onUpdate={handleUpdate}/>,
    alerts:<AlertsScreen alerts={alerts} onAddAlert={handleAddAlert}/>,
    profile:<ProfileScreen {...sp} profile={cgProfile} onUpdatePhoto={handleUpdatePhoto} onLogout={handleLogout}/>,
  };

  const Sidebar=()=>(
    <>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 12px 20px"}}>
        <div style={{width:34,height:34,borderRadius:"50% 50% 50% 12%",background:`linear-gradient(135deg,${T.forest},${T.moss})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🐾</div>
        <span style={{fontWeight:800,fontSize:18,color:T.forest,fontFamily:SERIF}}>PetLink</span>
      </div>
      {TABS.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,background:tab===t.id?T.pale:"transparent",color:tab===t.id?T.forest:"#6a8a72",border:"none",fontWeight:tab===t.id?700:500,fontSize:14,cursor:"pointer",fontFamily:FONT,textAlign:"left",width:"100%",transition:"background .15s"}}>
          <span style={{fontSize:18}}>{t.icon}</span>{t.label}
          {t.id==="requests"&&pendingCount>0&&<span style={{marginLeft:"auto",background:T.amber,color:"#fff",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{pendingCount}</span>}
        </button>
      ))}
      <div style={{marginTop:"auto",padding:12,background:"#f0f7f2",borderRadius:14,display:"flex",alignItems:"center",gap:10}}>
        <Avatar name={userProfile.name} photoURL={userProfile.photoURL} size={34}/>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{userProfile.name.split(" ")[0]}</div><div style={{fontSize:11,color:T.muted,textTransform:"capitalize"}}>{userProfile.role}</div></div>
        <button onClick={handleLogout} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:T.muted}}>🚪</button>
      </div>
    </>
  );

  if(mobile) return (
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:T.cream,fontFamily:FONT,color:T.text}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:T.white,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:"50% 50% 50% 12%",background:`linear-gradient(135deg,${T.forest},${T.moss})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🐾</div>
          <span style={{fontWeight:800,fontSize:16,color:T.forest,fontFamily:SERIF}}>PetLink</span>
        </div>
        <Avatar name={userProfile.name} photoURL={userProfile.photoURL} size={32}/>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 16px"}}>{screens[tab]}</div>
      <div style={{display:"flex",background:T.white,borderTop:`1px solid ${T.border}`,padding:"6px 0 env(safe-area-inset-bottom,6px)"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 0",fontFamily:FONT,position:"relative"}}>
            <span style={{fontSize:20,filter:tab===t.id?"none":"grayscale(1) opacity(.45)"}}>{t.icon}</span>
            <span style={{fontSize:10,fontWeight:700,color:tab===t.id?T.forest:T.muted}}>{t.label}</span>
            {tab===t.id&&<div style={{width:20,height:3,background:T.forest,borderRadius:3,marginTop:1}}/>}
            {t.id==="requests"&&pendingCount>0&&<div style={{position:"absolute",top:4,right:"20%",width:8,height:8,background:T.red,borderRadius:"50%"}}/>}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",height:"100vh",background:T.cream,fontFamily:FONT,color:T.text}}>
      <aside style={{width:224,background:T.white,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",padding:"20px 12px",gap:4,flexShrink:0}}><Sidebar/></aside>
      <main style={{flex:1,overflowY:"auto",padding:"32px"}}><div style={{maxWidth:720,margin:"0 auto"}}>{screens[tab]}</div></main>
    </div>
  );
}
