import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoIconDark } from '../pages/AuthPage';

export function UserMenu({ displayName, email, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
    : email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="user-menu-wrapper" ref={ref}>
      <div className="nav-avatar" onClick={() => setOpen(o => !o)} title={displayName || email}>
        {initials}
      </div>
      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-info">
            <strong>{displayName || 'User'}</strong>
            <span>{email}</span>
          </div>
          <button className="user-dropdown-item">⚙️ Account settings</button>
          <button className="user-dropdown-item">👤 Edit profile</button>
          <button className="user-dropdown-item danger" onClick={onLogout}>
            ← Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function MainLayout({ children, navCenter }) {
  const { userProfile, logout } = useAuth();
  
  const isOwner    = userProfile?.profileTypes?.includes('owner');
  const isProvider = userProfile?.profileTypes?.includes('provider');

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
  };

  return (
    <div className="dashboard-layout">
      {/* ── Nav ── */}
      <nav className="dashboard-nav">
        <div className="nav-logo">
          <LogoIconDark size={26} />
          <span>PetLink</span>
        </div>

        {/* Profile badges */}
        <div style={{ display:'flex', gap:8, marginLeft:16 }}>
          {isOwner    && <span className="tag">🐾 Pet Owner</span>}
          {isProvider && <span className="tag" style={{ borderColor:'var(--accent)', color:'var(--accent)' }}>💼 Provider</span>}
        </div>

        <div className="nav-spacer" />

        {navCenter}

        <UserMenu
          displayName={userProfile?.displayName}
          email={userProfile?.email}
          onLogout={handleLogout}
        />
      </nav>

      {/* ── Main content ── */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
