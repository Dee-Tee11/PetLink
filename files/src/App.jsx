import { useState, useEffect, useCallback } from "react";
import {
  collection, getDocs, updateDoc, doc, setDoc,
  onSnapshot, query, where, addDoc
} from "firebase/firestore";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged,
} from "firebase/auth";
import { db, auth } from "./firebase";

import { T } from "./styles/theme";
import Avatar from "./components/ui/Avatar";
import Loading from "./components/ui/Loading";

import AuthScreen from "./screens/AuthScreen";
import Onboarding from "./screens/Onboarding";
import ChatScreen from "./screens/ChatScreen";
import EmpresaDashboard from "./screens/EmpresaDashboard";
import EmpresaPedidos from "./screens/EmpresaPedidos";
import EmpresaAgenda from "./screens/EmpresaAgenda";
import AlertasScreen from "./screens/AlertasScreen";
import PerfilScreen from "./screens/PerfilScreen";
import DonoDashboard from "./screens/DonoDashboard";
import ServicosScreen from "./screens/ServicosScreen";
import DonoReservas from "./screens/DonoReservas";

// ─── GOOGLE FONT ─────────────────────────────────────────────────────────────
if (!document.getElementById("google-fonts-petlink")) {
  const _fl = document.createElement("link");
  _fl.id = "google-fonts-petlink";
  _fl.rel = "stylesheet";
  _fl.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,400&display=swap";
  document.head.appendChild(_fl);
}

const DONO_TABS = [
  { id: "dashboard", icon: "🏠", label: "Início" },
  { id: "servicos", icon: "🐾", label: "Serviços" },
  { id: "reservas", icon: "🗓️", label: "Reservas" },
  { id: "chat", icon: "💬", label: "Chat" },
  { id: "alertas", icon: "📍", label: "Alertas" },
  { id: "perfil", icon: "😊", label: "Perfil" },
];

const EMPRESA_TABS = [
  { id: "dashboard", icon: "🏠", label: "Início" },
  { id: "pedidos", icon: "📩", label: "Pedidos" },
  { id: "agenda", icon: "🗓️", label: "Agenda" },
  { id: "chat", icon: "💬", label: "Chat" },
  { id: "alertas", icon: "📍", label: "Alertas" },
  { id: "perfil", icon: "😊", label: "Perfil" },
];

export default function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [chatTarget, setChatTarget] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [appData, setAppData] = useState({ users: [], pets: [], caregiverProfiles: [], reviews: [] });
  const [mobile, setMobile] = useState(window.innerWidth < 768);

  useEffect(() => { const h = () => setMobile(window.innerWidth < 768); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        const q = query(collection(db, "users"), where("uid", "==", fbUser.uid));
        const snap = await getDocs(q);
        if (!snap.empty) { const raw = snap.docs[0].data(); const data = { ...raw, id: snap.docs[0].id }; setUserProfile(data); setNeedsOnboarding(!data.onboarded); }
      } else { setUserProfile(null); setNeedsOnboarding(false); }
      setAuthLoading(false);
    });
  }, []);

  const loadData = useCallback(async () => {
    const [uS, pS, cS, rS] = await Promise.all([getDocs(collection(db, "users")), getDocs(collection(db, "pets")), getDocs(collection(db, "caregiver_profiles")), getDocs(collection(db, "reviews"))]);
    setAppData({
      users: uS.docs.map(d => ({ ...d.data(), id: d.id })),
      pets: pS.docs.map(d => ({ id: d.id, ...d.data() })),
      caregiverProfiles: cS.docs.map(d => ({ ...d.data(), user_id: d.id })),
      reviews: rS.docs.map(d => ({ id: d.id, ...d.data() })),
    });
  }, []);

  useEffect(() => { if (userProfile) loadData(); }, [userProfile?.id]);

  useEffect(() => {
    if (!userProfile) return;
    const u1 = onSnapshot(collection(db, "bookings"), s => setBookings(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(collection(db, "alerts"), s => setAlerts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(collection(db, "pets"), s => setAppData(prev => ({ ...prev, pets: s.docs.map(d => ({ id: d.id, ...d.data() })) })));
    const u4 = onSnapshot(collection(db, "caregiver_profiles"), s => setAppData(prev => ({ ...prev, caregiverProfiles: s.docs.map(d => ({ ...d.data(), user_id: d.id })) })));
    return () => { u1(); u2(); u3(); u4(); };
  }, [userProfile?.id]);

  const handleLogin = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
  const handleLogout = () => { signOut(auth); setTab("dashboard"); };
  const handleRegister = async (name, email, pw, role) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    const uid = cred.user.uid;
    const data = { uid, name, email, role, phone: "", location: "", bio: "", photoURL: null, onboarded: false, id: uid };
    await setDoc(doc(db, "users", uid), data);
    setUserProfile(data); setNeedsOnboarding(true);
  };
  const handleOnboardDone = async () => {
    const q = query(collection(db, "users"), where("uid", "==", auth.currentUser?.uid));
    const snap = await getDocs(q);
    if (!snap.empty) { const raw = snap.docs[0].data(); setUserProfile({ ...raw, id: snap.docs[0].id }); }
    setNeedsOnboarding(false); loadData();
  };
  const handleUpdatePhoto = async (url) => {
    await updateDoc(doc(db, "users", String(userProfile.id)), { photoURL: url });
    setUserProfile(p => ({ ...p, photoURL: url }));
    setAppData(d => ({ ...d, users: d.users.map(u => u.id === userProfile.id ? { ...u, photoURL: url } : u) }));
  };
  const handleAddBooking = data => addDoc(collection(db, "bookings"), data);
  const handleUpdate = (id, fields) => updateDoc(doc(db, "bookings", id), fields);
  const handleAddAlert = data => addDoc(collection(db, "alerts"), data);

  const openChat = (userId) => { setChatTarget(userId); setTab("chat"); };

  if (authLoading) return <Loading msg="A verificar sessão…" />;
  if (!userProfile) return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />;
  if (needsOnboarding) return <Onboarding user={userProfile} onDone={handleOnboardDone} />;

  const isEmpresa = userProfile.role === "empresa" || userProfile.role === "cuidador";
  const TABS = isEmpresa ? EMPRESA_TABS : DONO_TABS;
  const cgProfile = appData.caregiverProfiles.find(p => p.user_id === userProfile.id);
  const pendingCount = bookings.filter(b => b.caregiver_id === userProfile.id && b.status === "pendente").length;
  const sp = { user: userProfile, appData, bookings, alerts };

  const screens = isEmpresa ? {
    dashboard: <EmpresaDashboard {...sp} profile={cgProfile} setTab={setTab} />,
    pedidos: <EmpresaPedidos {...sp} onUpdate={handleUpdate} />,
    agenda: <EmpresaAgenda {...sp} onUpdate={handleUpdate} />,
    chat: <ChatScreen {...sp} />,
    alertas: <AlertasScreen alerts={alerts} onAddAlert={handleAddAlert} />,
    perfil: <PerfilScreen {...sp} onUpdatePhoto={handleUpdatePhoto} onLogout={handleLogout} onRefresh={loadData} />,
  } : {
    dashboard: <DonoDashboard {...sp} setTab={setTab} />,
    servicos: <ServicosScreen {...sp} onAddBooking={handleAddBooking} onChat={openChat} />,
    reservas: <DonoReservas {...sp} onUpdate={handleUpdate} />,
    chat: <ChatScreen {...sp} />,
    alertas: <AlertasScreen alerts={alerts} onAddAlert={handleAddAlert} />,
    perfil: <PerfilScreen {...sp} onUpdatePhoto={handleUpdatePhoto} onLogout={handleLogout} onRefresh={loadData} />,
  };

  const Sidebar = () => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 20px" }}>
        <div style={{ width: 34, height: 34, borderRadius: "50% 50% 50% 12%", background: `linear-gradient(135deg,var(--forest),var(--moss))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🐾</div>
        <span style={{ fontWeight: 700, fontSize: 18, color: "var(--forest)", fontFamily: "var(--font-fraunces)" }}>PetLink</span>
      </div>
      {TABS.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} className="sidebar-tab" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: tab === t.id ? "var(--pale)" : "transparent", color: tab === t.id ? "var(--forest)" : "#6a8a72", border: "none", fontWeight: tab === t.id ? 700 : 500, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-dm-sans)", textAlign: "left", width: "100%", transition: "background .15s" }}>
          <span style={{ fontSize: 18 }}>{t.icon}</span>{t.label}
          {t.id === "pedidos" && pendingCount > 0 && <span style={{ marginLeft: "auto", background: "var(--amber)", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{pendingCount}</span>}
        </button>
      ))}
      <div style={{ marginTop: "auto", padding: 12, background: "#f0f7f2", borderRadius: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={userProfile.name} photoURL={userProfile.photoURL} size={34} />
        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{userProfile.name.split(" ")[0]}</div><div style={{ fontSize: 11, color: "var(--muted)", textTransform: "capitalize" }}>{userProfile.role}</div></div>
        <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--muted)" }}>🚪</button>
      </div>
    </>
  );

  if (mobile) return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "var(--cream)", fontFamily: "var(--font-dm-sans)", color: "var(--text)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--white)", borderBottom: `1px solid var(--border)`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50% 50% 50% 12%", background: `linear-gradient(135deg,var(--forest),var(--moss))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🐾</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--forest)", fontFamily: "var(--font-fraunces)" }}>PetLink</span>
        </div>
        <Avatar name={userProfile.name} photoURL={userProfile.photoURL} size={32} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 16px" }}>{screens[tab]}</div>
      <div style={{ display: "flex", background: "var(--white)", borderTop: `1px solid var(--border)`, padding: "6px 0 env(safe-area-inset-bottom,6px)", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: "1 0 auto", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 8px", fontFamily: "var(--font-dm-sans)", position: "relative", minWidth: 52 }}>
            <span style={{ fontSize: 20, filter: tab === t.id ? "none" : "grayscale(1) opacity(.45)" }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: tab === t.id ? "var(--forest)" : "var(--muted)" }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 20, height: 3, background: "var(--forest)", borderRadius: 3, marginTop: 1 }} />}
            {t.id === "pedidos" && pendingCount > 0 && <div style={{ position: "absolute", top: 4, right: "15%", width: 8, height: 8, background: "var(--red)", borderRadius: "50%" }} />}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--cream)", fontFamily: "var(--font-dm-sans)", color: "var(--text)" }}>
      <aside style={{ width: 220, background: "var(--white)", borderRight: `1px solid var(--border)`, display: "flex", flexDirection: "column", padding: "20px 12px", gap: 4, flexShrink: 0 }}><Sidebar /></aside>
      <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}><div style={{ maxWidth: 720, margin: "0 auto" }}>{screens[tab]}</div></main>
    </div>
  );
}
