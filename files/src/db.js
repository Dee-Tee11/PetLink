// ─── MOCK DATABASE ────────────────────────────────────────────────────────────
// Simula uma base de dados real com relações entre entidades

export const USERS = [
  { id:1, name:"Diogo Silva",   email:"diogo@demo.com",   password:"1234", role:"dono",     avatar:"😊", phone:"912 345 678", location:"Porto, Cedofeita" },
  { id:2, name:"Rita Santos",   email:"rita@demo.com",    password:"1234", role:"dono",     avatar:"👩", phone:"923 456 789", location:"Porto, Bonfim" },
  { id:3, name:"Ana Ferreira",  email:"ana@demo.com",     password:"1234", role:"cuidador", avatar:"👩‍🦰", phone:"934 567 890", location:"Porto, Paranhos" },
  { id:4, name:"Carlos Mota",   email:"carlos@demo.com",  password:"1234", role:"cuidador", avatar:"👨‍🦳", phone:"945 678 901", location:"Porto, Campanhã" },
  { id:5, name:"Sofia Lopes",   email:"sofia@demo.com",   password:"1234", role:"cuidador", avatar:"👩‍🦱", phone:"956 789 012", location:"Matosinhos" },
  { id:6, name:"Tiago Costa",   email:"tiago@demo.com",   password:"1234", role:"cuidador", avatar:"👨‍🦲", phone:"967 890 123", location:"Vila Nova de Gaia" },
];

export const PETS = [
  { id:1, owner_id:1, name:"Rex",     species:"🐕", breed:"Labrador Retriever", age:3, weight:"32kg", color:"#dcf5e7", status:"Em casa",      vaccines:["Raiva","Parvovírus","Tosse das Canis"], nextVet:"15 Mar 2025", microchip:"941000024680123", notes:"Alérgico a frango. Adora brincar com bola." },
  { id:2, owner_id:1, name:"Luna",    species:"🐈", breed:"Persa",              age:5, weight:"4.2kg",color:"#fde8d8", status:"Em casa",      vaccines:["Raiva","Panleucopenia"],                 nextVet:"02 Abr 2025", microchip:"941000031248900", notes:"Tímida com estranhos." },
  { id:3, owner_id:1, name:"Bolinha", species:"🐇", breed:"Holland Lop",        age:1, weight:"1.8kg",color:"#e8e0f8", status:"Em casa",      vaccines:["Mixomatose"],                             nextVet:"28 Mar 2025", microchip:"—",              notes:"Muito ativa. Come feno e vegetais." },
  { id:4, owner_id:2, name:"Mel",     species:"🐕", breed:"Golden Retriever",   age:2, weight:"28kg", color:"#fff3e0", status:"Em casa",      vaccines:["Raiva","Parvovírus"],                     nextVet:"10 Abr 2025", microchip:"941000056789012", notes:"Muito sociável e energética." },
  { id:5, owner_id:2, name:"Simba",   species:"🐈", breed:"Siamês",             age:4, weight:"3.8kg",color:"#fde8d8", status:"Em casa",      vaccines:["Raiva","Panleucopenia"],                 nextVet:"20 Abr 2025", microchip:"941000067890123", notes:"Gosta de brincar à noite." },
];

export const CAREGIVER_PROFILES = [
  { user_id:3, rating:4.9, reviews:87,  services:["Pet Sitting","Passeios","Banho"],           price_per_hour:12, distance:"0.8km", verified:true,  badge:"Top Cuidador", available:true,  bio:"Veterinária de formação. 5 anos de experiência.", pets_accepted:["🐕","🐈"], max_pets:2, has_garden:false, description:"Ofereço serviços de qualidade com muito amor e atenção." },
  { user_id:4, rating:4.7, reviews:54,  services:["Passeios","Treino"],                        price_per_hour:10, distance:"1.2km", verified:true,  badge:null,           available:true,  bio:"Treinador certificado. Especialista em raças grandes.", pets_accepted:["🐕"], max_pets:1, has_garden:false, description:"Treino positivo baseado em recompensas." },
  { user_id:5, rating:5.0, reviews:120, services:["Pet Sitting","Hospedagem","Banho","Treino"], price_per_hour:15, distance:"2.1km", verified:true,  badge:"Super Host",  available:false, bio:"Casa com jardim. Aceito até 3 animais.", pets_accepted:["🐕","🐈","🐇"], max_pets:3, has_garden:true, description:"A minha casa é a segunda casa do teu pet." },
  { user_id:6, rating:4.5, reviews:31,  services:["Passeios","Pet Sitting"],                   price_per_hour:9,  distance:"3.0km", verified:false, badge:null,           available:true,  bio:"Apaixonado por animais desde criança.", pets_accepted:["🐕"], max_pets:2, has_garden:false, description:"Cuidados com atenção e carinho garantidos." },
];

export const BOOKINGS = [
  { id:1, owner_id:1, caregiver_id:3, pet_id:1, service:"Passeio",    date:"2025-03-22", time:"17:00", duration:1, status:"confirmado", price:12,  notes:"",                         created_at:"2025-03-20" },
  { id:2, owner_id:1, caregiver_id:5, pet_id:2, service:"Pet Sitting", date:"2025-03-22", time:"09:00", duration:9, status:"a decorrer", price:135, notes:"Dar ração às 12h.",        created_at:"2025-03-18" },
  { id:3, owner_id:1, caregiver_id:4, pet_id:1, service:"Treino",      date:"2025-03-23", time:"10:00", duration:2, status:"pendente",   price:20,  notes:"Foco em andar à trela.",  created_at:"2025-03-21" },
  { id:4, owner_id:2, caregiver_id:3, pet_id:4, service:"Banho",       date:"2025-03-24", time:"14:00", duration:2, status:"confirmado", price:24,  notes:"",                         created_at:"2025-03-19" },
  { id:5, owner_id:2, caregiver_id:6, pet_id:4, service:"Passeio",     date:"2025-03-25", time:"08:00", duration:1, status:"pendente",   price:9,   notes:"Passeio de manhã cedo.",   created_at:"2025-03-21" },
];

export const ALERTS = [
  { id:1, owner_id:1, type:"perdido",    name:"Mimi",         photo:"🐈", area:"Porto, Cedofeita", time:"Há 2 horas", description:"Gato castrado, cor laranja com manchas brancas. Colar azul.", contact:"912 345 678", distance:"0.3km", reward:"50€",  active:true },
  { id:2, owner_id:null, type:"encontrado", name:"Desconhecido", photo:"🐕", area:"Porto, Bonfim",  time:"Há 5 horas", description:"Encontrei este cão sem coleira. Parece bem tratado. Castanho claro.", contact:"934 567 890", distance:"1.1km", reward:null,  active:true },
  { id:3, owner_id:2, type:"perdido",    name:"Snowy",        photo:"🐇", area:"Matosinhos",       time:"Há 1 dia",   description:"Fugiu do jardim. Coelho anão branco com olhos vermelhos.", contact:"967 891 234", distance:"2.4km", reward:"30€", active:true },
  { id:4, owner_id:null, type:"perdido", name:"Sombra",       photo:"🐈", area:"Porto, Paranhos",  time:"Há 3 dias",  description:"Gato preto castrado, muito tímido. Chip implantado.", contact:"921 456 789", distance:"4.2km", reward:null,  active:true },
];

export const REVIEWS = [
  { id:1, owner_id:1, caregiver_id:3, booking_id:1, rating:5, comment:"A Ana foi fantástica com o Rex! Muito profissional.", date:"2025-03-01" },
  { id:2, owner_id:2, caregiver_id:3, booking_id:4, rating:5, comment:"Excelente serviço, voltamos a marcar com certeza.", date:"2025-03-05" },
  { id:3, owner_id:1, caregiver_id:4, booking_id:3, rating:4, comment:"O Carlos é muito bom treinador. Rex adorou.", date:"2025-02-20" },
];

// ── HELPER FUNCTIONS ──────────────────────────────────────────────────────────

export const getUserById = (id, users) => users.find(u => u.id === id);
export const getPetsByOwner = (owner_id, pets) => pets.filter(p => p.owner_id === owner_id);
export const getCaregiverProfile = (user_id, profiles) => profiles.find(p => p.user_id === user_id);
export const getBookingsByOwner = (owner_id, bookings) => bookings.filter(b => b.owner_id === owner_id);
export const getBookingsByCaregiver = (caregiver_id, bookings) => bookings.filter(b => b.caregiver_id === caregiver_id);
export const getReviewsByCaregiver = (caregiver_id, reviews) => reviews.filter(r => r.caregiver_id === caregiver_id);
