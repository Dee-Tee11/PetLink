import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoIconDark } from '../ui/Logo';
import { Button, Input } from '../ui';

const STEPS = ['Profile', 'Role', 'Pets', 'Done'];

const SPECIES = [
  { key: 'dog',    emoji: '🐕', label: 'Dog'    },
  { key: 'cat',    emoji: '🐈', label: 'Cat'    },
  { key: 'rabbit', emoji: '🐇', label: 'Rabbit' },
  { key: 'bird',   emoji: '🐦', label: 'Bird'   },
  { key: 'fish',   emoji: '🐟', label: 'Fish'   },
  { key: 'other',  emoji: '🐾', label: 'Other'  },
];

const speciesEmoji = (key) => SPECIES.find(s => s.key === key)?.emoji ?? '🐾';

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ─── Add-pet inline form ─── */
function AddPetForm({ onAdd, onCancel }) {
  const [name,    setName]    = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed,   setBreed]   = useState('');
  const [age,     setAge]     = useState('');
  const [error,   setError]   = useState('');

  const submit = () => {
    if (!name.trim()) { setError('Please give your pet a name.'); return; }
    onAdd({ id: Date.now().toString(), name: name.trim(), species, breed: breed.trim(), age: age ? Number(age) : null });
  };

  return (
    <div className="add-pet-form">
      <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-2)', marginBottom: 14 }}>New pet</p>

      <label className="label">Species</label>
      <div className="species-grid" style={{ marginBottom: 14 }}>
        {SPECIES.map(s => (
          <button key={s.key} type="button"
            className={`species-btn ${species === s.key ? 'active' : ''}`}
            onClick={() => setSpecies(s.key)}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      <div className="add-pet-form-grid">
        <Input label="Name *"       placeholder="e.g. Buddy"    value={name}  onChange={e => setName(e.target.value)} />
        <Input label="Breed"        placeholder="e.g. Labrador" value={breed} onChange={e => setBreed(e.target.value)} />
        <Input label="Age (years)"  type="number" min="0" max="30" placeholder="e.g. 3" value={age} onChange={e => setAge(e.target.value)} />
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <Button variant="primary"   size="sm" type="button" onClick={submit}>Add Pet</Button>
        <Button variant="secondary" size="sm" type="button" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const { currentUser, saveUserProfile, logout } = useAuth();

  const [step,        setStep]        = useState(0);
  const [name,        setName]        = useState('');
  const [companyName, setCompanyName] = useState('');
  const [profileType, setProfileType] = useState('');
  const [pets,        setPets]        = useState([]);
  const [showAddPet,  setShowAddPet]  = useState(false);
  const [error,       setError]       = useState('');
  const [saving,      setSaving]      = useState(false);

  const next = () => { setError(''); setStep(s => s + 1); };
  const back = () => { setError(''); setStep(s => s - 1); };

  const canNext = () => {
    if (step === 0) return name.trim().length >= 2;
    if (step === 1) return !!profileType;
    return true;
  };

  const removePet = (id) => setPets(ps => ps.filter(p => p.id !== id));

  // Profiles that skip the pets step
  const skipPets = profileType === 'provider' || profileType === 'company';

  const finish = async () => {
    if (!currentUser?.uid) { setError('Session expired. Please sign out and sign in again.'); return; }
    setSaving(true);
    try {
      const profileTypes = profileType === 'both' ? ['owner', 'provider'] :
                           profileType === 'company' ? ['company'] : [profileType];

      const data = {
        displayName:        name.trim(),
        profileTypes,
        pets:               skipPets ? [] : pets,
        onboardingComplete: true,
      };

      // Initialise company profile with the entered company name
      if (profileType === 'company') {
        data.companyProfile = {
          companyName: companyName.trim() || name.trim(),
          bio:         '',
          location:    '',
          workers:     [],
        };
      }

      await saveUserProfile(currentUser.uid, data);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="onboard-layout">
      <div className="onboard-logo">
        <LogoIconDark size={28} />
        <span>PetLink</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {currentUser?.email && (
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{currentUser.email}</span>
          )}
          <Button variant="ghost" size="sm" onClick={logout} style={{ fontSize: 13, color: 'var(--text-3)' }}>
            Sign out
          </Button>
        </div>
      </div>

      <div className="onboard-card">
        {/* Progress dots */}
        {step < 3 && (
          <div className="onboard-progress">
            {STEPS.slice(0, skipPets ? 2 : 3).map((_, i) => (
              <div key={i} className={`onboard-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
            ))}
          </div>
        )}

        {/* ── Step 0: Name ── */}
        {step === 0 && (
          <>
            <p className="onboard-step-label">Passo 1</p>
            <h2 className="onboard-step-title">Como te chamas?</h2>
            <p className="onboard-step-sub">É assim que a comunidade te vai conhecer.</p>

            <Input
              label="Nome completo ou alcunha"
              style={{ fontSize: 17 }}
              placeholder="ex: Sofia Martins"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canNext() && next()}
              autoFocus
            />

            <div className="onboard-actions">
              <Button variant="primary" size="lg" onClick={next} disabled={!canNext()}>
                Continuar →
              </Button>
            </div>
          </>
        )}

        {/* ── Step 1: Profile type ── */}
        {step === 1 && (
          <>
            <p className="onboard-step-label">Passo 2</p>
            <h2 className="onboard-step-title">Como vais usar o PetLink?</h2>
            <p className="onboard-step-sub">Podes sempre alterar mais tarde.</p>

            <div className="profile-cards">
              {[
                {
                  key: 'owner',
                  icon: '🐾', iconClass: 'green',
                  title: 'Dono de Pet',
                  desc: 'Encontra e reserva serviços para os teus animais — grooming, passeios, consultas e mais.',
                },
                {
                  key: 'provider',
                  icon: '🧑‍💼', iconClass: 'pink',
                  title: 'Prestador Individual',
                  desc: 'Oferece os teus serviços a donos de pets na tua área.',
                },
                {
                  key: 'company',
                  icon: '🏢', iconClass: 'yellow',
                  title: 'Empresa',
                  desc: 'Gere uma equipa de profissionais que prestam serviços a animais. Adiciona trabalhadores e os seus serviços.',
                },
                {
                  key: 'both',
                  icon: '✨', iconClass: 'both',
                  title: 'Dono + Prestador',
                  desc: 'Sou dono de pets E também quero oferecer serviços.',
                },
              ].map(card => (
                <div
                  key={card.key}
                  className={`profile-card ${profileType === card.key ? 'selected' : ''}`}
                  onClick={() => setProfileType(card.key)}
                >
                  <div className={`profile-card-icon ${card.iconClass}`}>{card.icon}</div>
                  <div className="profile-card-text">
                    <h4>{card.title}</h4>
                    <p>{card.desc}</p>
                  </div>
                  <div className="profile-card-check">
                    {profileType === card.key && <CheckIcon />}
                  </div>
                </div>
              ))}
            </div>

            {/* Company name field shown inline when company is selected */}
            {profileType === 'company' && (
              <div style={{ marginTop: 16 }}>
                <Input
                  label="Nome da empresa *"
                  placeholder="ex: PetCare Porto Lda."
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            {error && <p className="error-msg" style={{ marginTop: 8 }}>{error}</p>}

            <div className="onboard-actions">
              <Button variant="secondary" onClick={back} disabled={saving}>← Voltar</Button>

              {/* Provider and company skip pets, go straight to finish */}
              {skipPets ? (
                <Button
                  variant="primary" size="lg"
                  onClick={finish}
                  disabled={!canNext() || saving || (profileType === 'company' && !companyName.trim())}
                  loading={saving}
                >
                  Concluir →
                </Button>
              ) : (
                <Button variant="primary" size="lg" onClick={next} disabled={!canNext()}>
                  Continuar →
                </Button>
              )}
            </div>
          </>
        )}

        {/* ── Step 2: Add pets (owner / both only) ── */}
        {step === 2 && !skipPets && (
          <>
            <p className="onboard-step-label">Passo 3 · Opcional</p>
            <h2 className="onboard-step-title">Adiciona os teus pets</h2>
            <p className="onboard-step-sub">
              Informa os prestadores de serviços sobre quem vão cuidar.
            </p>

            {pets.length > 0 && (
              <div className="pets-list">
                {pets.map(pet => (
                  <div className="pet-item" key={pet.id}>
                    <span className="pet-item-emoji">{speciesEmoji(pet.species)}</span>
                    <div className="pet-item-info">
                      <strong>{pet.name}</strong>
                      <span>
                        {pet.breed || pet.species}
                        {pet.age != null && `, ${pet.age} yr${pet.age !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                    <button className="pet-item-remove" onClick={() => removePet(pet.id)} title="Remove">×</button>
                  </div>
                ))}
              </div>
            )}

            {showAddPet ? (
              <AddPetForm
                onAdd={pet => { setPets(ps => [...ps, pet]); setShowAddPet(false); }}
                onCancel={() => setShowAddPet(false)}
              />
            ) : (
              <Button variant="secondary" full style={{ marginBottom: 8 }} onClick={() => setShowAddPet(true)}>
                + Adicionar pet
              </Button>
            )}

            {error && <p className="error-msg" style={{ marginTop: 8 }}>{error}</p>}

            <div className="onboard-actions">
              <Button variant="secondary" onClick={back}>← Voltar</Button>
              {pets.length === 0 ? (
                <Button variant="ghost" onClick={finish} loading={saving}>Saltar por agora</Button>
              ) : (
                <Button variant="primary" size="lg" onClick={finish} disabled={saving || showAddPet} loading={saving}>
                  Concluir →
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
