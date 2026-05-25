import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../ui';

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const PROFILE_CARDS = [
  { key: 'owner',    icon: '🐾',   iconClass: 'green',  title: 'Dono de Pet',        desc: 'Encontra e reserva serviços para os teus animais.' },
  { key: 'provider', icon: '🧑‍💼', iconClass: 'pink',   title: 'Prestador Individual', desc: 'Oferece os teus serviços a donos de pets.' },
  { key: 'company',  icon: '🏢',   iconClass: 'yellow', title: 'Empresa',            desc: 'Gere uma equipa de profissionais que prestam serviços.' },
  { key: 'both',     icon: '✨',   iconClass: 'yellow', title: 'Dono + Prestador',   desc: 'Sou dono de pets E também quero oferecer serviços.' },
];

export default function EditProfilePage({ onClose }) {
  const { currentUser, userProfile, saveUserProfile } = useAuth();

  // Derive current profile type
  const currentTypes = userProfile?.profileTypes || [];
  const currentType = currentTypes.includes('company')
    ? 'company'
    : currentTypes.length === 2
    ? 'both'
    : (currentTypes[0] || 'owner');

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio,         setBio]         = useState(userProfile?.ownerProfile?.bio || userProfile?.companyProfile?.bio || '');
  const [location,    setLocation]    = useState(userProfile?.ownerProfile?.location || userProfile?.companyProfile?.location || '');
  const [companyName, setCompanyName] = useState(userProfile?.companyProfile?.companyName || '');
  const [profileType, setProfileType] = useState(currentType);
  const [saving,      setSaving]      = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState('');

  const isCompany = profileType === 'company';

  const handleSave = async () => {
    if (!displayName.trim())               { setError('O nome é obrigatório.'); return; }
    if (isCompany && !companyName.trim())  { setError('O nome da empresa é obrigatório.'); return; }

    setSaving(true); setError('');
    try {
      const profileTypes = profileType === 'both'    ? ['owner', 'provider'] :
                           profileType === 'company' ? ['company']           : [profileType];

      const data = {
        displayName: displayName.trim(),
        profileTypes,
        ownerProfile:    { bio, location },
        providerProfile: { bio, location },
      };

      if (isCompany) {
        data.companyProfile = {
          ...(userProfile?.companyProfile || {}),
          companyName: companyName.trim(),
          bio,
          location,
        };
      }

      await saveUserProfile(currentUser.uid, data);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose?.(); }, 1200);
    } catch {
      setError('Algo correu mal. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(45,58,40,0.4)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 500, padding: 20, overflowY: 'auto',
      }}
      onClick={e => e.target === e.currentTarget && onClose?.()}
    >
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 500, boxShadow: 'var(--shadow-lg)',
        padding: '36px 32px', margin: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 26, fontFamily: 'var(--font-display)' }}>Editar Perfil</h2>
          {onClose && (
            <button onClick={onClose} style={{
              background: 'var(--bg-alt)', border: 'none', borderRadius: '50%',
              width: 32, height: 32, fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)',
            }}>×</button>
          )}
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: isCompany
              ? 'linear-gradient(135deg, var(--yellow), var(--primary))'
              : 'linear-gradient(135deg, var(--yellow), var(--green-mid))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isCompany ? 28 : 24, fontWeight: 700, color: 'var(--text)', flexShrink: 0,
          }}>
            {isCompany ? '🏢' : (displayName?.[0]?.toUpperCase() || '?')}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              {isCompany ? (companyName || 'Nome da empresa') : (displayName || 'O teu nome')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{userProfile?.email}</div>
          </div>
        </div>

        {/* Fields */}
        <Input label="O teu nome *" placeholder="ex: Sofia Martins"
          value={displayName} onChange={e => setDisplayName(e.target.value)} />

        {/* Company name field — only when company selected */}
        {isCompany && (
          <Input label="Nome da empresa *" placeholder="ex: PetCare Porto Lda."
            value={companyName} onChange={e => setCompanyName(e.target.value)} />
        )}

        <Input label={isCompany ? 'Descrição da empresa' : 'Bio'}
          as="textarea" style={{ minHeight: 80, resize: 'vertical' }}
          placeholder={isCompany
            ? 'Descreve os serviços e a missão da empresa…'
            : 'Conta um pouco sobre ti para a comunidade…'}
          value={bio} onChange={e => setBio(e.target.value)} />

        <Input label="Localização" placeholder="ex: Porto, Portugal"
          value={location} onChange={e => setLocation(e.target.value)} />

        {/* Profile type */}
        <label className="label" style={{ marginBottom: 10 }}>Tipo de perfil</label>
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

        {error   && <p className="error-msg"   style={{ marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ color: 'var(--success)', fontSize: 14, marginBottom: 12, fontWeight: 600 }}>✅ Perfil guardado!</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          {onClose && <Button variant="secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>}
          <Button variant="primary" style={{ flex: 2 }} onClick={handleSave} loading={saving}>
            Guardar alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
