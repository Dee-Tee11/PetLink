import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDsLPFwBbWrtfEDpcSJvVSNvk4sh0kjGHo",
  authDomain: "petlink-a497f.firebaseapp.com",
  projectId: "petlink-a497f",
  storageBucket: "petlink-a497f.firebasestorage.app",
  messagingSenderId: "302844777035",
  appId: "1:302844777035:web:360b66296ee43a6651b3ce",
};

const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);
export const auth = getAuth(app);
export default app;
