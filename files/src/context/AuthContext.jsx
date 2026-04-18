import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading,     setLoading]     = useState(true);

  /* ── Firestore helpers ── */
  const loadUserProfile = async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error loading profile:', err);
      return null;
    }
  };

  const saveUserProfile = async (uid, data) => {
    try {
      await setDoc(doc(db, 'users', uid), data, { merge: true });
      const next = { ...(userProfile || {}), ...data };
      setUserProfile(next);
      return next;
    } catch (err) {
      console.error('Error saving profile:', err);
      throw err;
    }
  };

  const createInitialProfile = async (uid, email, displayName = '') => {
    const profile = {
      uid,
      email,
      displayName,
      profileTypes:       [],
      ownerProfile:       { bio: '', location: '' },
      providerProfile:    { bio: '', services: [], location: '' },
      pets:               [],
      onboardingComplete: false,
      createdAt:          serverTimestamp(),
    };
    await setDoc(doc(db, 'users', uid), profile);
    setUserProfile(profile);
    return profile;
  };

  /* ── Auth methods ── */
  const signup = async (email, password) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await createInitialProfile(credential.user.uid, email);
    return credential;
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const { uid, email, displayName } = credential.user;

    // Check if profile already exists
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) {
      // New Google user → create profile
      await createInitialProfile(uid, email, displayName || '');
    } else {
      setUserProfile(snap.data());
    }
    setCurrentUser(credential.user);
    return credential;
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  /* ── Auth state listener ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await loadUserProfile(user.uid);

        if (!profile) {
          console.warn('Stale session — no Firestore profile found. Signing out.');
          await signOut(auth);
          setCurrentUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    resetPassword,
    logout,
    loadUserProfile,
    saveUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="loading-screen">
          <div className="spinner spinner-dark" />
        </div>
      )}
    </AuthContext.Provider>
  );
}
