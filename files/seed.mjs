// ─── PETLINK · SEED SCRIPT ────────────────────────────────────────────────────
// Corre UMA vez para popular o Firebase com os dados de demo.
//
// Pré-requisitos:
//   node >= 18   (fetch nativo)
//   firebase instalado no projecto  →  npm install firebase
//
// Execução:
//   node seed.mjs

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

// ── DADOS DE DEMO ─────────────────────────────────────────────────────────────

const USERS_DATA = [
  { id:1, name:"Diogo Silva",  email:"diogo@demo.com",  password:"1234", role:"dono",     avatar:"😊", phone:"912 345 678", location:"Porto, Cedofeita" },
  { id:2, name:"Rita Santos",  email:"rita@demo.com",   password:"1234", role:"dono",     avatar:"👩", phone:"923 456 789", location:"Porto, Bonfim" },
  { id:3, name:"Ana Ferreira", email:"ana@demo.com",    password:"1234", role:"cuidador", avatar:"👩‍🦰", phone:"934 567 890", location:"Porto, Paranhos" },
  { id:4, name:"Carlos Mota",  email:"carlos@demo.com", password:"1234", role:"cuidador", avatar:"👨‍🦳", phone:"945 678 901", location:"Porto, Campanhã" },
  { id:5, name:"Sofia Lopes",  email:"sofia@demo.com",  password:"1234", role:"cuidador", avatar:"👩‍🦱", phone:"956 789 012", location:"Matosinhos" },
  { id:6, name:"Tiago Costa",  email:"tiago@demo.com",  password:"1234", role:"cuidador", avatar:"👨‍🦲", phone:"967 890 123", location:"Vila Nova de Gaia" },
];

const PETS_DATA = [
  { id:1, owner_id:1, name:"Rex",     species:"🐕", breed:"Labrador Retriever", age:3, weight:"32kg",  color:"#dcf5e7", status:"Em casa", vaccines:["Raiva","Parvovírus","Tosse das Canis"], nextVet:"15 Mar 2025", microchip:"941000024680123", notes:"Alérgico a frango. Adora brincar com bola." },
  { id:2, owner_id:1, name:"Luna",    species:"🐈", breed:"Persa",              age:5, weight:"4.2kg", color:"#fde8d8", status:"Em casa", vaccines:["Raiva","Panleucopenia"],                 nextVet:"02 Abr 2025", microchip:"941000031248900", notes:"Tímida com estranhos." },
  { id:3, owner_id:1, name:"Bolinha", species:"🐇", breed:"Holland Lop",        age:1, weight:"1.8kg", color:"#e8e0f8", status:"Em casa", vaccines:["Mixomatose"],                             nextVet:"28 Mar 2025", microchip:"—",              notes:"Muito ativa. Come feno e vegetais." },
  { id:4, owner_id:2, name:"Mel",     species:"🐕", breed:"Golden Retriever",   age:2, weight:"28kg",  color:"#fff3e0", status:"Em casa", vaccines:["Raiva","Parvovírus"],                     nextVet:"10 Abr 2025", microchip:"941000056789012", notes:"Muito sociável e energética." },
  { id:5, owner_id:2, name:"Simba",   species:"🐈", breed:"Siamês",             age:4, weight:"3.8kg", color:"#fde8d8", status:"Em casa", vaccines:["Raiva","Panleucopenia"],                 nextVet:"20 Abr 2025", microchip:"941000067890123", notes:"Gosta de brincar à noite." },
];

const CAREGIVER_PROFILES_DATA = [
  { user_id:3, rating:4.9, reviews:87,  services:["Pet Sitting","Passeios","Banho"],            price_per_hour:12, distance:"0.8km", verified:true,  badge:"Top Cuidador", available:true,  bio:"Veterinária de formação. 5 anos de experiência.", pets_accepted:["🐕","🐈"], max_pets:2, has_garden:false, description:"Ofereço serviços de qualidade com muito amor e atenção." },
  { user_id:4, rating:4.7, reviews:54,  services:["Passeios","Treino"],                         price_per_hour:10, distance:"1.2km", verified:true,  badge:null,           available:true,  bio:"Treinador certificado. Especialista em raças grandes.", pets_accepted:["🐕"], max_pets:1, has_garden:false, description:"Treino positivo baseado em recompensas." },
  { user_id:5, rating:5.0, reviews:120, services:["Pet Sitting","Hospedagem","Banho","Treino"],  price_per_hour:15, distance:"2.1km", verified:true,  badge:"Super Host",   available:false, bio:"Casa com jardim. Aceito até 3 animais.", pets_accepted:["🐕","🐈","🐇"], max_pets:3, has_garden:true, description:"A minha casa é a segunda casa do teu pet." },
  { user_id:6, rating:4.5, reviews:31,  services:["Passeios","Pet Sitting"],                    price_per_hour:9,  distance:"3.0km", verified:false, badge:null,           available:true,  bio:"Apaixonado por animais desde criança.", pets_accepted:["🐕"], max_pets:2, has_garden:false, description:"Cuidados com atenção e carinho garantidos." },
];

const BOOKINGS_DATA = [
  { owner_id:1, caregiver_id:3, pet_id:1, service:"Passeio",     date:"2025-03-22", time:"17:00", duration:1, status:"confirmado", price:12,  notes:"",                        created_at:"2025-03-20" },
  { owner_id:1, caregiver_id:5, pet_id:2, service:"Pet Sitting",  date:"2025-03-22", time:"09:00", duration:9, status:"a decorrer", price:135, notes:"Dar ração às 12h.",       created_at:"2025-03-18" },
  { owner_id:1, caregiver_id:4, pet_id:1, service:"Treino",       date:"2025-03-23", time:"10:00", duration:2, status:"pendente",   price:20,  notes:"Foco em andar à trela.", created_at:"2025-03-21" },
  { owner_id:2, caregiver_id:3, pet_id:4, service:"Banho",        date:"2025-03-24", time:"14:00", duration:2, status:"confirmado", price:24,  notes:"",                        created_at:"2025-03-19" },
  { owner_id:2, caregiver_id:6, pet_id:4, service:"Passeio",      date:"2025-03-25", time:"08:00", duration:1, status:"pendente",   price:9,   notes:"Passeio de manhã cedo.",  created_at:"2025-03-21" },
];

const ALERTS_DATA = [
  { owner_id:1,    type:"perdido",    name:"Mimi",         photo:"🐈", area:"Porto, Cedofeita", time:"Há 2 horas", description:"Gato castrado, cor laranja com manchas brancas. Colar azul.",   contact:"912 345 678", distance:"0.3km", reward:"50€",  active:true },
  { owner_id:null, type:"encontrado", name:"Desconhecido", photo:"🐕", area:"Porto, Bonfim",    time:"Há 5 horas", description:"Encontrei este cão sem coleira. Parece bem tratado. Castanho claro.", contact:"934 567 890", distance:"1.1km", reward:null,  active:true },
  { owner_id:2,    type:"perdido",    name:"Snowy",        photo:"🐇", area:"Matosinhos",       time:"Há 1 dia",   description:"Fugiu do jardim. Coelho anão branco com olhos vermelhos.",       contact:"967 891 234", distance:"2.4km", reward:"30€", active:true },
  { owner_id:null, type:"perdido",    name:"Sombra",       photo:"🐈", area:"Porto, Paranhos",  time:"Há 3 dias",  description:"Gato preto castrado, muito tímido. Chip implantado.",             contact:"921 456 789", distance:"4.2km", reward:null,  active:true },
];

const REVIEWS_DATA = [
  { owner_id:1, caregiver_id:3, booking_id:1, rating:5, comment:"A Ana foi fantástica com o Rex! Muito profissional.", date:"2025-03-01" },
  { owner_id:2, caregiver_id:3, booking_id:4, rating:5, comment:"Excelente serviço, voltamos a marcar com certeza.",    date:"2025-03-05" },
  { owner_id:1, caregiver_id:4, booking_id:3, rating:4, comment:"O Carlos é muito bom treinador. Rex adorou.",         date:"2025-02-20" },
];

// ── SEED ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("\n🌱  PetLink — a popular a base de dados Firebase...\n");

  // 1. Verificar se já foi feito o seed
  const existingSnap = await getDocs(collection(db, 'users'));
  if (!existingSnap.empty) {
    console.log("⚠️  A coleção 'users' já tem documentos. Seed cancelado.");
    console.log("   (apaga a coleção no Firebase Console se quiseres re-seed)\n");
    process.exit(0);
  }

  // 2. Criar utilizadores no Firebase Auth e Firestore
  console.log("👤  A criar utilizadores Auth + Firestore...");
  for (const u of USERS_DATA) {
    let uid;
    try {
      const cred = await createUserWithEmailAndPassword(auth, u.email, u.password);
      uid = cred.user.uid;
      console.log(`   ✅  Auth: ${u.name}  (${uid.slice(0,8)}...)`);
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        const cred = await signInWithEmailAndPassword(auth, u.email, u.password);
        uid = cred.user.uid;
        console.log(`   ⏭️   Auth já existe: ${u.email}`);
      } else throw e;
    }

    // Guardar doc com id numérico como document ID (relações funcionam com números)
    await setDoc(doc(db, 'users', String(u.id)), {
      id: u.id, uid,
      name: u.name, email: u.email, role: u.role,
      avatar: u.avatar, phone: u.phone, location: u.location,
    });
    await signOut(auth);
  }

  // 3. Pets
  console.log("\n🐾  A criar pets...");
  for (const p of PETS_DATA) {
    await setDoc(doc(db, 'pets', String(p.id)), p);
    console.log(`   ✅  ${p.species} ${p.name}`);
  }

  // 4. Perfis de cuidador
  console.log("\n🤝  A criar perfis de cuidador...");
  for (const cp of CAREGIVER_PROFILES_DATA) {
    await setDoc(doc(db, 'caregiver_profiles', String(cp.user_id)), cp);
    console.log(`   ✅  cuidador user_id=${cp.user_id}`);
  }

  // 5. Reservas
  console.log("\n🗓️   A criar reservas...");
  for (const b of BOOKINGS_DATA) {
    const ref = await addDoc(collection(db, 'bookings'), b);
    console.log(`   ✅  ${b.service} (${b.status})  — id: ${ref.id.slice(0,8)}...`);
  }

  // 6. Alertas
  console.log("\n📍  A criar alertas...");
  for (const a of ALERTS_DATA) {
    const ref = await addDoc(collection(db, 'alerts'), a);
    console.log(`   ✅  ${a.type}: ${a.name}  — id: ${ref.id.slice(0,8)}...`);
  }

  // 7. Reviews
  console.log("\n⭐  A criar reviews...");
  for (const r of REVIEWS_DATA) {
    const ref = await addDoc(collection(db, 'reviews'), r);
    console.log(`   ✅  rating ${r.rating}★  — id: ${ref.id.slice(0,8)}...`);
  }

  console.log("\n🎉  Seed completo! Podes fazer login na app.\n");
  process.exit(0);
}

seed().catch(e => { console.error("\n❌ Erro:", e.message); process.exit(1); });
