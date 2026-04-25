import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

function Section({ title, children }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1.5px solid var(--border-mid)',
      borderRadius: 'var(--radius-lg)', padding: '24px 24px', marginBottom: 16,
    }}>
      <h3 style={{ fontSize: 17, fontFamily: 'var(--font-display)', marginBottom: 18 }}>{title}</h3>
      {children}
    </div>
  );
}

export default function AccountSettingsPage({ onClose }) {
  const { currentUser, userProfile, logout } = useAuth();

  /* Password change */
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [pwError,    setPwError]    = useState('');
  const [pwSuccess,  setPwSuccess]  = useState(false);
  const [pwLoading,  setPwLoading]  = useState(false);

  /* Notifications (local toggle — hook up to Firestore if needed) */
  const [emailNotifs, setEmailNotifs] = useState(userProfile?.notifications?.email !== false);
  const [notifSaved,  setNotifSaved]  = useState(false);

  /* Delete account */
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError,   setDeleteError]   = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isGoogle = currentUser?.providerData?.some(p => p.providerId === 'google.com');

  const handlePasswordChange = async () => {
    setPwError(''); setPwSuccess(false);
    if (!currentPw || !newPw || !confirmPw) { setPwError('Fill in all fields.'); return; }
    if (newPw.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    setPwLoading(true);
    try {
      const cred = EmailAuthProvider.credential(currentUser.email, currentPw);
      await reauthenticateWithCredential(currentUser, cred);
      await updatePassword(currentUser, newPw);
      setPwSuccess(true);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      const msgs = {
        'auth/wrong-password':     'Current password is incorrect.',
        'auth/too-many-requests':  'Too many attempts. Try again later.',
        'auth/invalid-credential': 'Current password is incorrect.',
      };
      setPwError(msgs[err.code] || 'Something went wrong.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { setDeleteError('Type DELETE to confirm.'); return; }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid));
      await deleteUser(currentUser);
      await logout();
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        setDeleteError('Please sign out and sign back in before deleting your account.');
      } else {
        setDeleteError('Could not delete account. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(45,58,40,0.4)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center', zIndex: 500, padding: '40px 20px', overflowY: 'auto',
    }} onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Account Settings</h2>
          {onClose && (
            <button onClick={onClose} style={{
              background: 'var(--white)', border: '1.5px solid var(--border-mid)',
              borderRadius: '50%', width: 36, height: 36, fontSize: 20,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text)',
            }}>×</button>
          )}
        </div>

        {/* Account info */}
        <Section title="Account">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--yellow), var(--green-mid))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: 'var(--text)', flexShrink: 0,
            }}>
              {userProfile?.displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{userProfile?.displayName || '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{currentUser?.email}</div>
            </div>
            <span style={{
              marginLeft: 'auto', fontSize: 12, padding: '3px 10px',
              background: isGoogle ? 'var(--sky-soft)' : 'var(--green-soft)',
              color: isGoogle ? '#3A6A9A' : '#4A7A3A',
              borderRadius: 20, fontWeight: 600,
            }}>
              {isGoogle ? '🔗 Google' : '✉️ Email'}
            </span>
          </div>
        </Section>

        {/* Change password — only for email accounts */}
        {!isGoogle && (
          <Section title="Change Password">
            <div className="field-group">
              <label className="label">Current password</label>
              <input className="input-field" type="password" placeholder="••••••••"
                value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field-group" style={{ marginBottom: 0 }}>
                <label className="label">New password</label>
                <input className="input-field" type="password" placeholder="6+ chars"
                  value={newPw} onChange={e => setNewPw(e.target.value)} />
              </div>
              <div className="field-group" style={{ marginBottom: 0 }}>
                <label className="label">Confirm</label>
                <input className="input-field" type="password" placeholder="Repeat"
                  value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
              </div>
            </div>
            {pwError   && <p className="error-msg" style={{ marginTop: 10 }}>{pwError}</p>}
            {pwSuccess  && <p style={{ color: 'var(--success)', fontSize: 13, marginTop: 10, fontWeight: 600 }}>✅ Password updated!</p>}
            <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }}
              onClick={handlePasswordChange} disabled={pwLoading}>
              {pwLoading ? <span className="spinner" /> : 'Update password'}
            </button>
          </Section>
        )}

        {isGoogle && (
          <Section title="Password">
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
              You signed in with Google — password management is handled by your Google account.
            </p>
          </Section>
        )}

        {/* Notifications */}
        <Section title="Notifications">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Email notifications</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>Booking updates, messages, and news</div>
            </div>
            <button
              onClick={() => { setEmailNotifs(v => !v); setNotifSaved(true); setTimeout(() => setNotifSaved(false), 2000); }}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: emailNotifs ? 'var(--primary)' : 'var(--border-mid)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.25s',
              }}
            >
              <div style={{
                position: 'absolute', top: 3,
                left: emailNotifs ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff', transition: 'left 0.25s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }} />
            </button>
          </div>
          {notifSaved && (
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
              {emailNotifs ? '✅ Notifications enabled' : '🔕 Notifications disabled'}
            </p>
          )}
        </Section>

        {/* Danger zone */}
        <div style={{
          background: 'rgba(232,90,106,0.05)', border: '1.5px solid rgba(232,90,106,0.3)',
          borderRadius: 'var(--radius-lg)', padding: '24px',
        }}>
          <h3 style={{ fontSize: 17, fontFamily: 'var(--font-display)', color: 'var(--danger)', marginBottom: 8 }}>
            Danger Zone
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.6 }}>
            Deleting your account is permanent and cannot be undone. All your data, pets and profile will be removed.
          </p>
          <div className="field-group" style={{ marginBottom: 10 }}>
            <label className="label" style={{ color: 'var(--danger)' }}>Type DELETE to confirm</label>
            <input className="input-field" placeholder="DELETE"
              value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
              style={{ borderColor: deleteConfirm === 'DELETE' ? 'var(--danger)' : undefined }}
            />
          </div>
          {deleteError && <p className="error-msg" style={{ marginBottom: 10 }}>{deleteError}</p>}
          <button
            className="btn btn-danger btn-sm"
            disabled={deleteLoading || deleteConfirm !== 'DELETE'}
            onClick={handleDeleteAccount}
          >
            {deleteLoading ? <span className="spinner" /> : 'Delete my account'}
          </button>
        </div>
      </div>
    </div>
  );
}
