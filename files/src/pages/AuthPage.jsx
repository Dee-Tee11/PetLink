import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoIcon, LogoIconDark } from '../ui/Logo';
import { Button, Input, Modal } from '../ui';

/* ── Google Icon ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

/* Keep legacy named exports so any other importers still work */
export { LogoIcon, LogoIconDark };

/* ── Password Reset Modal ── */
function ResetModal({ onClose, onSend }) {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true);
    try {
      await onSend(email);
      setSent(true);
    } catch {
      setError('Could not send reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="modal-title">Reset password</h2>
      {sent ? (
        <>
          <p className="modal-sub" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            ✅ Check your inbox! We sent a reset link to <strong>{email}</strong>.
          </p>
          <Button variant="primary" full onClick={onClose}>Done</Button>
        </>
      ) : (
        <>
          <p className="modal-sub">Enter the email you signed up with and we'll send you a reset link.</p>
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            error={error}
            autoFocus
          />
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSend} loading={loading}>Send link</Button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default function AuthPage() {
  const { signup, login, loginWithGoogle, resetPassword } = useAuth();

  const [tab,        setTab]        = useState('signin');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [showReset,  setShowReset]  = useState(false);

  const isSignUp = tab === 'signup';

  const clearForm = () => { setEmail(''); setPassword(''); setConfirm(''); setError(''); };
  const switchTab = (t) => { setTab(t); clearForm(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (isSignUp) {
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirm) { setError('Passwords do not match.'); return; }
    }
    setLoading(true);
    try {
      isSignUp ? await signup(email, password) : await login(email, password);
    } catch (err) {
      const msgs = {
        'auth/user-not-found':       'No account with this email.',
        'auth/wrong-password':       'Incorrect password.',
        'auth/invalid-credential':   'Invalid email or password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email':        'Please enter a valid email address.',
        'auth/too-many-requests':    'Too many attempts. Please try again later.',
      };
      setError(msgs[err.code] || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoad(true);
    try {
      await loginWithGoogle();
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoad(false);
    }
  };

  return (
    <>
      {showReset && (
        <ResetModal onClose={() => setShowReset(false)} onSend={resetPassword} />
      )}

      <div className="auth-layout">
        {/* ── Left brand panel ── */}
        <div className="auth-brand">
          <div className="auth-brand-blob-pink" />

          <div className="auth-brand-logo">
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

          <div className="auth-brand-stats" style={{ display: 'flex', gap: '32px', position: 'relative', zIndex: 1 }}>
            {[['500+', 'Professionals'], ['12k+', 'Happy pets'], ['4.9★', 'Avg. rating']].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: '#fff' }}>{val}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="auth-form-panel">
          <div className="auth-form-inner">

            <div className="auth-tabs">
              <button className={`auth-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => switchTab('signin')}>Sign In</button>
              <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => switchTab('signup')}>Create Account</button>
            </div>

            <h2 className="auth-heading">
              {isSignUp ? 'Join PetLink' : 'Welcome back'}
            </h2>
            <p className="auth-sub">
              {isSignUp ? 'Create your account to get started.' : 'Sign in to continue to your account.'}
            </p>

            {/* Google button */}
            <Button
              id="btn-google"
              variant="google"
              full
              loading={googleLoad}
              onClick={handleGoogle}
              style={{ marginBottom: 4 }}
            >
              <GoogleIcon /> Continue with Google
            </Button>

            <div className="auth-divider">or</div>

            <form onSubmit={handleSubmit}>
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              <div className="field-group" style={{ marginBottom: isSignUp ? 16 : 8 }}>
                <label className="label">Password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {!isSignUp && (
                <div style={{ textAlign: 'right', marginBottom: 16 }}>
                  <button type="button" className="auth-forgot" onClick={() => setShowReset(true)}>
                    Forgot password?
                  </button>
                </div>
              )}

              {isSignUp && (
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              )}

              {error && <p className="error-msg">{error}</p>}

              <Button
                id="btn-auth-submit"
                variant="primary"
                size="lg"
                full
                type="submit"
                loading={loading}
                style={{ marginTop: 8 }}
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            {isSignUp && (
              <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
                By signing up you agree to our Terms of Service and Privacy Policy.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
