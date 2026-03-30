// ─── PETLINK · SEED SCRIPT (ALIVE & UID-BASED) ──────────────────────────────────
// Populate Firestore with rich demo data and correct permission handling.

import { initializeApp }                                from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword,
         signInWithEmailAndPassword, signOut }          from 'firebase/auth';
import { getFirestore, doc, setDoc,
         collection, addDoc, getDocs }                  from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyDsLPFwBbWrtfEDpcSJvVSNvk4sh0kjGHo",
  authDomain:        "petlink-a497f.firebaseapp.com",
  projectId:         "petlink-a497f",
  storageBucket:     "petlink-a497f.firebasestorage.app",
  messagingSenderId: "302844777035",
  appId:             "1:302844777035:web:360b66296ee43a6651b3ce",
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── DATA ──────────────────────────────────────────────────────────────────────

const USERS = [
  { id:"1", name:"Diogo Silva",  email:"diogo@demo.com",  pw:"123456", role:"dono",      phone:"912 345 678", loc:"Porto, Cedofeita" },
  { id:"2", name:"Rita Santos",  email:"rita@demo.com",   pw:"123456", role:"dono",      phone:"923 456 789", loc:"Porto, Bonfim" },
  { id:"3", name:"Ana Ferreira", email:"ana@demo.com",    pw:"123456", role:"cuidador",  phone:"934 567 890", loc:"Porto, Paranhos" },
  { id:"4", name:"Carlos Mota",  email:"carlos@demo.com", pw:"123456", role:"cuidador",  phone:"945 678 901", loc:"Porto, Campanhã" },
  { id:"5", name:"Sofia Lopes",  email:"sofia@demo.com",  pw:"123456", role:"cuidador",  phone:"956 789 012", loc:"Matosinhos" },
];

const PETS = [
  { id:"p1", owner:"1", name:"Rex",     species:"🐕", breed:"Labrador", age:3, weight:"32kg", status:"Em casa" },
  { id:"p2", owner:"1", name:"Luna",    species:"🐈", breed:"Persa",    age:5, weight:"4kg",  status:"Em casa" },
  { id:"p3", owner:"2", name:"Mel",     species:"🐕", breed:"Golden",   age:2, weight:"28kg", status:"Em casa" },
  { id:"p4", owner:"2", name:"Simba",   species:"🐈", breed:"Siamês",   age:4, weight:"4kg",  status:"Em casa" },
  { id:"p5", owner:"1", name:"Bolinha", species:"🐇", breed:"Holland",  age:1, weight:"2kg",  status:"Em casa" },
];

const PROFILES = [
  { user:"3", rating:4.9, revs:88, svcs:["Pet Sitting","Passeios","Banho"], price:12, avail:true, bio:"Veterinária apaixonada por animais." },
  { user:"4", rating:4.7, revs:42, svcs:["Passeios","Treino"],             price:10, avail:true, bio:"Treinador certificado." },
  { user:"5", rating:5.0, revs:15, svcs:["Hospedagem","Transporte"],       price:15, avail:true, bio:"Ampla casa com jardim." },
];

const BOOKINGS = [
  { owner:"1", cg:"3", pet:"p1", svc:"Passeio",     date:"2026-04-05", time:"10:00", status:"confirmado", price:12 },
  { owner:"1", cg:"4", pet:"p1", svc:"Treino",       date:"2026-04-06", time:"15:00", status:"pendente",   price:20 },
  { owner:"2", cg:"3", pet:"p3", svc:"Pet Sitting",  date:"2026-04-07", time:"09:00", status:"confirmado", price:36 },
  { owner:"2", cg:"5", pet:"p4", svc:"Hospedagem",   date:"2026-04-10", time:"18:00", status:"pendente",   price:45 },
];

const ALERTS = [
  { owner:"1", type:"perdido",    name:"Fofy",  photo:"🐕", area:"Porto", time:"2h atrás", desc:"Cão pequeno, fugiu do parque.", contact:"912 345 678", active:true },
  { owner:null,type:"encontrado", name:"Gato",  photo:"🐈", area:"Maia",  time:"5h atrás", desc:"Gato preto encontrado perto da igreja.", contact:"923 456 789", active:true },
];

// ── SEED ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("\n🌱  Semeando PetLink (Vivo & UID-based)...\n");
  const idMap = {}; 

  // 1. Criar/Login Users
  for (const u of USERS) {
    let uid;
    try {
      const cred = await createUserWithEmailAndPassword(auth, u.email, u.pw);
      uid = cred.user.uid;
      console.log(`   ✅ Auth: ${u.email}`);
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        const cred = await signInWithEmailAndPassword(auth, u.email, u.pw);
        uid = cred.user.uid;
        console.log(`   ⏭️ Auth: ${u.email} (Ready)`);
      } else { console.error(`   ❌ Auth ${u.email}:`, e.message); continue; }
    }
    idMap[u.id] = uid;
    try {
      await setDoc(doc(db, 'users', uid), { 
        id: uid, uid, name: u.name, email: u.email, role: u.role, 
        phone: u.phone, location: u.loc, onboarded: true, bio: u.bio||"Utilizador PetLink."
      });
    } catch (e) { console.error(`   ❌ UserDoc ${uid}:`, e.message); }
    // IMPORTANTE: NÃO Sair aqui para podermos escrever o resto dos dados com permissão
  }

  // Já estamos logados como o último usuário (Sofia Lopes). 
  // Se as regras permitirem qualquer user autenticado escrever em pets/etc, isto funcionará.
  
  console.log("\n🐾 Pets...");
  for (const p of PETS) {
    try {
      const owner_id = idMap[p.owner]; if (!owner_id) continue;
      const { owner, ...data } = p;
      await setDoc(doc(db, 'pets', p.id), { ...data, owner_id });
      console.log(`   ✅ Pet: ${p.name}`);
    } catch (e) { console.error(`   ❌ Pet ${p.name}:`, e.message); }
  }

  console.log("\n🤝 Perfis...");
  for (const cp of PROFILES) {
    try {
      const user_id = idMap[cp.user]; if (!user_id) continue;
      const { user, ...data } = cp;
      await setDoc(doc(db, 'caregiver_profiles', user_id), { ...data, user_id });
      console.log(`   ✅ Profile: ${user_id.slice(0,5)}`);
    } catch (e) { console.error(`   ❌ Profile:`, e.message); }
  }

  console.log("\n🗓️ Reservas...");
  for (const b of BOOKINGS) {
    try {
      const owner_id = idMap[b.owner]; const caregiver_id = idMap[b.cg];
      if (!owner_id || !caregiver_id) continue;
      const { owner, cg, pet, ...data } = b;
      await addDoc(collection(db, 'bookings'), { ...data, owner_id, caregiver_id, pet_id: pet });
      console.log(`   ✅ Booking: ${b.svc}`);
    } catch (e) { console.error(`   ❌ Booking:`, e.message); }
  }

  console.log("\n📍 Alertas...");
  for (const a of ALERTS) {
    try {
      const owner_id = a.owner ? idMap[a.owner] : null;
      const { owner, ...data } = a;
      await addDoc(collection(db, 'alerts'), { ...data, owner_id });
      console.log(`   ✅ Alert: ${a.name}`);
    } catch (e) { console.error(`   ❌ Alert:`, e.message); }
  }

  console.log("\n🎉 Seed Completo!\n");
  await signOut(auth);
  process.exit(0);
}

seed().catch(console.error);
