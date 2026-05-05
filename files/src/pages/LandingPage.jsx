import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoIcon, LogoIconDark } from '../ui/Logo';
import { Button, Input } from '../ui';
import './LandingPage.css';

/* ── Google Icon ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function LandingPage() {
  const { currentUser, signup, login, loginWithGoogle } = useAuth();
  
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setShowMode] = useState('signin'); // 'signin' or 'signup'
  
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const openAuth = (mode) => {
    setShowMode(mode);
    setShowAuth(true);
    document.body.style.overflow = 'hidden';
  };

  const closeAuth = () => {
    setShowAuth(false);
    document.body.style.overflow = '';
    setError('');
  };

  const handleSwitch = (mode) => {
    setShowMode(mode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || (authMode === 'signup' && !name)) {
      setError('Preenche todos os campos.');
      return;
    }
    setLoading(true);
    try {
      if (authMode === 'signup') {
        await signup(email, password);
        // Note: name handling could be added to signup if desired
      } else {
        await login(email, password);
      }
      closeAuth();
    } catch (err) {
      setError('Falha na autenticação. Verifica os teus dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
      closeAuth();
    } catch {
      setError('Falha ao entrar com Google.');
    }
  };

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') closeAuth(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="landing-wrapper">
      {/* ── NAV ── */}
      <nav className="landing-nav">
        <a className="logo" href="#">
          <LogoIconDark size={26} />
          <span>PetLink</span>
        </a>
        <div className="nav-r">
          {currentUser ? (
            <Button variant="primary" onClick={() => window.location.reload()}>Dashboard</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => openAuth('signin')}>Entrar</Button>
              <Button variant="primary" onClick={() => openAuth('signup')}>Começar grátis</Button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-blob b1"></div>
        <div className="hero-blob b2"></div>
        <div className="hero-blob b3"></div>
        <div className="hero-content">
          <div className="pill">🐾 A plataforma de cuidado de pets</div>
          <h1>Cada pet merece<br/><em>o melhor cuidado</em></h1>
          <p className="hero-sub">Conecta-te com profissionais locais de confiança — groomers, passeadores, veterinários e treinadores.</p>
          <div className="hero-btns">
            {currentUser ? (
              <Button variant="primary" size="lg" onClick={() => window.location.reload()}>🐾 Ir para o Dashboard</Button>
            ) : (
              <>
                <Button variant="primary" size="lg" onClick={() => openAuth('signup')}>🐾 Criar conta grátis</Button>
                <Button variant="secondary" size="lg" onClick={() => document.getElementById('servicos').scrollIntoView({behavior:'smooth'})} style={{background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.5)'}}>Ver serviços</Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <div id="servicos">
        <div className="section">
          <p className="s-label">O que podes reservar</p>
          <h2 className="s-title">Todos os serviços<br/><em>num só lugar</em></h2>
          <p className="s-sub">Desde o grooming ao transporte, encontra o profissional certo para o teu pet.</p>
          <div className="svcs">
            {[
              { ico: '✂️', label: 'Grooming', price: '15', bg: '#FCE8EB' },
              { ico: '🦮', label: 'Passeios', price: '10', bg: '#EBF3E5' },
              { ico: '🏠', label: 'Pet Sitting', price: '12', bg: '#E4EEF8' },
              { ico: '🩺', label: 'Consulta Vet', price: '30', bg: '#FDF8CF' },
              { ico: '🎓', label: 'Treino', price: '20', bg: '#EBF3E5' },
              { ico: '🚿', label: 'Banho', price: '18', bg: '#FCE8EB' },
              { ico: '🛏️', label: 'Hospedagem', price: '25', bg: '#FDF8CF' },
              { ico: '🚗', label: 'Transporte', price: '8', bg: '#E4EEF8' },
            ].map(s => (
              <div key={s.label} className="svc" onClick={() => !currentUser && openAuth('signup')}>
                <div className="svc-icon" style={{ background: s.bg }}>{s.ico}</div>
                <h4>{s.label}</h4>
                <p>A partir de €{s.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div style={{ background: 'var(--bg-alt)' }}>
        <div className="section center">
          <p className="s-label">Porquê o PetLink</p>
          <h2 className="s-title">Simples. Seguro. Rápido.</h2>
          <p className="s-sub">Pensámos em cada detalhe para que te concentres no que importa — o teu pet.</p>
          <div className="feats">
            {[
              { ico: '🔍', title: 'Pesquisa por localização', desc: 'Filtra por serviço, distância e disponibilidade. Encontra o prestador ideal em segundos.' },
              { ico: '💬', title: 'Chat em tempo real', desc: 'Fala directamente com os prestadores antes e durante o serviço, sem sair da plataforma.' },
              { ico: '📅', title: 'Reservas instantâneas', desc: 'Agenda em segundos e recebe confirmação imediata. Sem chamadas, sem espera.' },
              { ico: '🔒', title: 'Prestadores verificados', desc: 'Todos os profissionais passam por verificação de identidade antes de entrar na plataforma.' },
              { ico: '🐾', title: 'Perfil do teu pet', desc: 'Guarda vacinas, historial médico e necessidades especiais num só lugar.' },
              { ico: '💼', title: 'És prestador?', desc: 'Cria o teu perfil de serviços e começa a receber reservas. Grátis para começar.' },
            ].map(f => (
              <div key={f.title} className="feat">
                <span className="feat-ico">{f.ico}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW ── */}
      <div className="how-bg">
        <div className="how-inner">
          <p className="s-label how-label">Como funciona</p>
          <h2 className="how-title">Três passos para começar</h2>
          <div className="steps">
            {[
              { n: '01', t: 'Cria o teu perfil', p: 'Regista-te em menos de 2 minutos e adiciona os teus pets com as informações que precisas.' },
              { n: '02', t: 'Escolhe um prestador', p: 'Pesquisa por serviço e zona. Compara opções e reserva directamente na plataforma.' },
              { n: '03', t: 'Acompanha tudo', p: 'Usa o chat para coordenar detalhes e segue o estado da reserva em tempo real.' },
            ].map(step => (
              <div key={step.n} className="step">
                <div className="step-n">{step.n}</div>
                <h3>{step.t}</h3>
                <p>{step.p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ paddingTop: '100px' }}>
        <div className="cta-box">
          <div className="cta-inner">
            <h2>Pronto para começar?</h2>
            <p>Cria a tua conta gratuitamente e encontra o cuidado certo para o teu pet.</p>
            <div className="cta-btns">
              {currentUser ? (
                <Button variant="primary" size="lg" onClick={() => window.location.reload()}>🐾 Ir para o Dashboard</Button>
              ) : (
                <>
                  <Button id="cta-signup" variant="primary" size="lg" onClick={() => openAuth('signup')} style={{background:'#fff', color:'var(--green-dark)', fontWeight: 800}}>🐾 Criar conta grátis</Button>
                  <Button variant="secondary" size="lg" onClick={() => openAuth('signin')} style={{background: 'transparent', borderColor:'rgba(255,255,255,0.6)', color:'#fff', fontWeight: 700}}>Já tenho conta</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="foot-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <LogoIconDark size={22} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>PetLink</span>
          </div>
          <p>Conectando pets aos melhores profissionais.</p>
        </div>
        <div className="foot-links">
          <div className="foot-col">
            <h5>Serviços</h5>
            <a href="#">Grooming</a>
            <a href="#">Passeios</a>
            <a href="#">Pet Sitting</a>
            <a href="#">Hospedagem</a>
          </div>
          <div className="foot-col">
            <h5>Plataforma</h5>
            <a href="#">Para donos</a>
            <a href="#">Para prestadores</a>
            <a href="#">Como funciona</a>
          </div>
          <div className="foot-col">
            <h5>Legal</h5>
            <a href="#">Privacidade</a>
            <a href="#">Termos</a>
            <a href="#">Contacto</a>
          </div>
        </div>
      </footer>
      <div className="foot-bottom">© 2026 PetLink. Feito com 🐾 em Portugal.</div>

      {/* ── AUTH PANEL ── */}
      <div className={`auth-overlay ${showAuth ? 'on' : ''}`} onClick={(e) => e.target.classList.contains('auth-overlay') && closeAuth()}></div>
      <div className={`auth-panel ${showAuth ? 'on' : ''}`}>
        <div className="p-head">
          <button className="p-close" onClick={closeAuth}>×</button>
          <div className="p-logo">
            <LogoIcon size={20} />
            <span>PetLink</span>
          </div>
          <h2>{authMode === 'signup' ? 'Junta-te ao PetLink' : 'Bem-vindo de volta'}</h2>
          <p>{authMode === 'signup' ? 'Cria a tua conta e começa hoje.' : 'Entra para continuar na tua conta.'}</p>
        </div>

        <div className="p-body">
          <div className="tabs">
            <button className={`tab ${authMode === 'signin' ? 'on' : ''}`} onClick={() => handleSwitch('signin')}>Entrar</button>
            <button className={`tab ${authMode === 'signup' ? 'on' : ''}`} onClick={() => handleSwitch('signup')}>Criar conta</button>
          </div>

          <Button variant="google" full onClick={handleGoogle}>
            <GoogleIcon /> Continuar com Google
          </Button>

          <div className="divider">ou</div>

          <form onSubmit={handleSubmit}>
            {authMode === 'signup' && (
              <Input 
                label="Nome" 
                placeholder="O teu nome" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            )}
            <Input 
              label="Email" 
              type="email" 
              placeholder="tu@exemplo.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder={authMode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            
            {authMode === 'signin' && (
              <button type="button" className="forgot">Esqueci a password</button>
            )}

            {error && <p style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}

            <Button variant="primary" full type="submit" loading={loading} style={{ marginTop: '10px' }}>
              {authMode === 'signup' ? 'Criar conta grátis' : 'Entrar'}
            </Button>
          </form>

          <p style={{ fontSize: '12px', color: 'var(--text-3)', textAlign: 'center', marginTop: '18px' }}>
            {authMode === 'signin' ? (
              <>Não tens conta? <button onClick={() => handleSwitch('signup')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>Cria uma grátis →</button></>
            ) : (
              'Ao criares conta concordas com os Termos e Política de Privacidade.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
