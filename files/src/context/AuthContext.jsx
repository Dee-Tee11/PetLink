import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

const isPopupUnreliable = () => {
  const ua = navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod|android/.test(ua) ||
    /instagram|fban|fbav|twitter/.test(ua) ||
    window.innerWidth < 768
  );
};

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
    // Request profile + email scopes explicitly
    provider.addScope('profile');
    provider.addScope('email');
    // Force account selector even if already signed in
    provider.setCustomParameters({ prompt: 'select_account' });

    // On mobile / in-app browsers → redirect is more reliable
    if (isPopupUnreliable()) {
      // Store flag so we know to handle redirect result on next load
      sessionStorage.setItem('pendingGoogleRedirect', '1');
      await signInWithRedirect(auth, provider);
      return; // page will reload after redirect
    }

    // Desktop: try popup first
    try {
      const credential = await signInWithPopup(auth, provider);
      await handleGoogleCredential(credential);
      return credential;
    } catch (err) {
      // Popup was blocked or closed — fall back to redirect
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        sessionStorage.setItem('pendingGoogleRedirect', '1');
        await signInWithRedirect(auth, provider);
        return;
      }
      // Any other error — re-throw so the UI can show it
      throw err;
    }
  };

  // Shared logic after any Google credential (popup or redirect)
  const handleGoogleCredential = async (credential) => {
    const { uid, email, displayName } = credential.user;
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) {
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
    let unsub = null;

    const initAuth = async () => {
      // 1. Always attempt to consume a pending Google redirect result.
      //    getRedirectResult returns null when there's no pending redirect,
      //    so it's safe to call on every load. We do NOT rely solely on the
      //    sessionStorage flag because mobile browsers can clear it mid-redirect.
      sessionStorage.removeItem('pendingGoogleRedirect');
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await handleGoogleCredential(result);
        }
      } catch (err) {
        console.error('Google redirect error:', err);
      }

      // 2. Setup the persistent auth listener
      unsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          await loadUserProfile(user.uid);
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });
    };

    initAuth();
    return () => unsub && unsub();
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
