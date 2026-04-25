import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const PROFILE_CARDS = [
  { key: 'owner',    icon: '🐾', iconClass: 'green',  title: 'Pet Owner',        desc: 'Find and book services for your pets.' },
  { key: 'provider', icon: '🧑‍💼', iconClass: 'pink',   title: 'Service Provider', desc: 'Offer your skills to pet owners.' },
  { key: 'both',     icon: '✨', iconClass: 'yellow', title: 'Both',             desc: "I'm an owner AND a provider." },
];

export default function EditProfilePage({ onClose }) {
  const { currentUser, userProfile, saveUserProfile } = useAuth();

  const currentType = userProfile?.profileTypes?.length === 2
    ? 'both'
    : (userProfile?.profileTypes?.[0] || 'owner');

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio,         setBio]         = useState(userProfile?.ownerProfile?.bio || '');
  const [location,    setLocation]    = useState(userProfile?.ownerProfile?.location || '');
  const [profileType, setProfileType] = useState(currentType);
  const [saving,      setSaving]      = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState('');

  const handleSave = async () => {
    if (!displayName.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const profileTypes = profileType === 'both' ? ['owner', 'provider'] : [profileType];
      await saveUserProfile(currentUser.uid, {
        displayName: displayName.trim(),
        profileTypes,
        ownerProfile:    { bio, location },
        providerProfile: { bio, location },
      });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); if (onClose) onClose(); }, 1200);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(45,58,40,0.4)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 500, padding: 20, overflowY: 'auto',
    }} onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-lg)',
        padding: '36px 32px', margin: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 26, fontFamily: 'var(--font-display)' }}>Edit Profile</h2>
          {onClose && (
            <button onClick={onClose} style={{
              background: 'var(--bg-alt)', border: 'none', borderRadius: '50%',
              width: 32, height: 32, fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)',
            }}>×</button>
          )}
        </div>

        {/* Avatar placeholder */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--yellow), var(--green-mid))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: 'var(--text)',
            flexShrink: 0,
          }}>
            {displayName?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{displayName || 'Your name'}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{userProfile?.email}</div>
          </div>
        </div>

        {/* Fields */}
        <div className="field-group">
          <label className="label">Display name *</label>
          <input className="input-field" placeholder="e.g. Sofia Martins" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        </div>

        <div className="field-group">
          <label className="label">Bio</label>
          <textarea
            className="input-field" style={{ minHeight: 80, resize: 'vertical' }}
            placeholder="Tell the community a little about yourself…"
            value={bio} onChange={e => setBio(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label className="label">Location</label>
          <input className="input-field" placeholder="e.g. Porto, Portugal" value={location} onChange={e => setLocation(e.target.value)} />
        </div>

        {/* Profile type */}
        <label className="label" style={{ marginBottom: 10 }}>I am a…</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {PROFILE_CARDS.map(card => (
            <div
              key={card.key}
              className={`profile-card ${profileType === card.key ? 'selected' : ''}`}
              onClick={() => setProfileType(card.key)}
              style={{ padding: '14px 18px' }}
            >
              <div className={`profile-card-icon ${card.iconClass}`} style={{ width: 38, height: 38, fontSize: 18 }}>
                {card.icon}
              </div>
              <div className="profile-card-text">
                <h4 style={{ fontSize: 15 }}>{card.title}</h4>
                <p style={{ fontSize: 12 }}>{card.desc}</p>
              </div>
              <div className="profile-card-check">
                {profileType === card.key && <CheckIcon />}
              </div>
            </div>
          ))}
        </div>

        {error   && <p className="error-msg" style={{ marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ color: 'var(--success)', fontSize: 14, marginBottom: 12, fontWeight: 600 }}>✅ Profile saved!</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          {onClose && <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>}
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
