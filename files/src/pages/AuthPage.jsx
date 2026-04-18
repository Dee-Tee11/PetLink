import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/* ── Brand panel decorative paw SVG ─── */
const PawPrint = ({ size = 80, opacity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
    <ellipse cx="35" cy="20" rx="9" ry="12" fill="white" />
    <ellipse cx="65" cy="20" rx="9" ry="12" fill="white" />
    <ellipse cx="18" cy="38" rx="7" ry="10" fill="white" />
    <ellipse cx="82" cy="38" rx="7" ry="10" fill="white" />
    <ellipse cx="50" cy="68" rx="22" ry="26" fill="white" />
    <ellipse cx="30" cy="52" rx="10" ry="14" fill="white" />
    <ellipse cx="70" cy="52" rx="10" ry="14" fill="white" />
  </svg>
);

const LogoIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.2)" />
    <ellipse cx="15" cy="9"  rx="4"  ry="5"  fill="white" />
    <ellipse cx="25" cy="9"  rx="4"  ry="5"  fill="white" />
    <ellipse cx="8"  cy="17" rx="3"  ry="4"  fill="white" />
    <ellipse cx="32" cy="17" rx="3"  ry="4"  fill="white" />
    <ellipse cx="20" cy="28" rx="10" ry="11" fill="white" />
    <ellipse cx="12" cy="22" rx="5"  ry="6"  fill="white" />
    <ellipse cx="28" cy="22" rx="5"  ry="6"  fill="white" />
  </svg>
);

const LogoIconDark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="var(--primary)" />
    <ellipse cx="15" cy="9"  rx="4"  ry="5"  fill="white" />
    <ellipse cx="25" cy="9"  rx="4"  ry="5"  fill="white" />
    <ellipse cx="8"  cy="17" rx="3"  ry="4"  fill="white" />
    <ellipse cx="32" cy="17" rx="3"  ry="4"  fill="white" />
    <ellipse cx="20" cy="28" rx="10" ry="11" fill="white" />
    <ellipse cx="12" cy="22" rx="5"  ry="6"  fill="white" />
    <ellipse cx="28" cy="22" rx="5"  ry="6"  fill="white" />
  </svg>
);

export { LogoIcon, LogoIconDark };

export default function AuthPage() {
  const { signup, login } = useAuth();

  const [tab,      setTab]      = useState('signin');  // 'signin' | 'signup'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const isSignUp = tab === 'signup';

  const clearForm = () => { setEmail(''); setPassword(''); setConfirm(''); setError(''); };

  const switchTab = (t) => { setTab(t); clearForm(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) { setError('Please fill in all fields.'); return; }

    if (isSignUp) {
      if (password.length < 6)      { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirm)      { setError('Passwords do not match.'); return; }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      const msgs = {
        'auth/user-not-found':     'No account found with this email.',
        'auth/wrong-password':     'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email':      'Please enter a valid email address.',
        'auth/too-many-requests':  'Too many attempts. Please try again later.',
      };
      setError(msgs[err.code] || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ── Left brand panel ── */}
      <div className="auth-brand">
        <div className="auth-brand-noise" />

        {/* paw decorations */}
        <div style={{ position:'absolute', top:'-30px', right:'-30px', transform:'rotate(20deg)' }}>
          <PawPrint size={160} opacity={0.06} />
        </div>
        <div style={{ position:'absolute', bottom:'100px', left:'-40px', transform:'rotate(-15deg)' }}>
          <PawPrint size={130} opacity={0.06} />
        </div>
        <div style={{ position:'absolute', top:'40%', right:'10px', transform:'rotate(10deg)' }}>
          <PawPrint size={90} opacity={0.05} />
        </div>

        <div className="auth-brand-logo" style={{ position:'relative', zIndex:1 }}>
          <LogoIcon size={36} />
          <span>PetLink</span>
        </div>

        <div className="auth-brand-center">
          <p className="auth-brand-headline">
            Every pet deserves <em>the best care</em> possible.
          </p>
          <p className="auth-brand-sub">
            Connect with trusted local pet professionals — from groomers and walkers to vets and trainers — all in one place.
          </p>

          <div className="auth-brand-card">
            <div className="auth-brand-card-avatar">🐕</div>
            <div className="auth-brand-card-text">
              <p>Max just had his grooming session</p>
              <p>Booked through PetLink · 2 min ago</p>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:'32px', position:'relative', zIndex:1 }}>
          {[['500+', 'Professionals'], ['12k+', 'Happy pets'], ['4.9', 'Avg. rating']].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'28px', fontWeight:600, color:'#fff' }}>{val}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginTop:2 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">

          {/* Mobile logo */}
          <div style={{ display:'none' }} className="auth-mobile-logo">
            <LogoIconDark size={28} />
            <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:600 }}>PetLink</span>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => switchTab('signin')}>Sign In</button>
            <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => switchTab('signup')}>Create Account</button>
          </div>

          <h2 className="auth-heading">
            {isSignUp ? 'Join PetLink' : 'Welcome back'}
          </h2>
          <p className="auth-sub">
            {isSignUp
              ? 'Create your account to get started.'
              : 'Sign in to continue to your account.'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="label">Email address</label>
              <input
                className="input-field"
                type="email" placeholder="you@example.com" autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
            </div>

            <div className="field-group">
              <label className="label">Password</label>
              <input
                className="input-field"
                type="password" placeholder={isSignUp ? 'At least 6 characters' : '••••••••'} autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password} onChange={e => setPassword(e.target.value)} required
              />
            </div>

            {isSignUp && (
              <div className="field-group">
                <label className="label">Confirm Password</label>
                <input
                  className="input-field"
                  type="password" placeholder="Repeat your password" autoComplete="new-password"
                  value={confirm} onChange={e => setConfirm(e.target.value)} required
                />
              </div>
            )}

            {error && <p className="error-msg">{error}</p>}

            <button
              className="btn btn-primary btn-lg btn-full"
              type="submit" disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading
                ? <span className="spinner" />
                : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {!isSignUp && (
            <div className="auth-footer">
              <span style={{ color:'var(--text-3)' }}>Don't have an account? </span>
              <button className="btn-ghost btn btn-sm" onClick={() => switchTab('signup')} style={{ padding:'0 4px' }}>
                Sign up free
              </button>
            </div>
          )}

          {isSignUp && (
            <p style={{ fontSize:12, color:'var(--text-3)', textAlign:'center', marginTop:16, lineHeight:1.5 }}>
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
