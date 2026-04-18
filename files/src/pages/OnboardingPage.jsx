import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoIconDark } from './AuthPage';

const STEPS = ['Profile', 'Role', 'Pets', 'Done'];

const SPECIES = [
  { key:'dog',    emoji:'🐕', label:'Dog'    },
  { key:'cat',    emoji:'🐈', label:'Cat'    },
  { key:'rabbit', emoji:'🐇', label:'Rabbit' },
  { key:'bird',   emoji:'🐦', label:'Bird'   },
  { key:'fish',   emoji:'🐟', label:'Fish'   },
  { key:'other',  emoji:'🐾', label:'Other'  },
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
      <p style={{ fontWeight:500, fontSize:14, color:'var(--text-2)', marginBottom:14 }}>New pet</p>

      <label className="label">Species</label>
      <div className="species-grid" style={{ marginBottom:14 }}>
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
        <div className="field-group" style={{ marginBottom:0 }}>
          <label className="label">Name *</label>
          <input className="input-field" placeholder="e.g. Buddy" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="field-group" style={{ marginBottom:0 }}>
          <label className="label">Breed</label>
          <input className="input-field" placeholder="e.g. Labrador" value={breed} onChange={e => setBreed(e.target.value)} />
        </div>
        <div className="field-group" style={{ marginBottom:0 }}>
          <label className="label">Age (years)</label>
          <input className="input-field" type="number" min="0" max="30" placeholder="e.g. 3" value={age} onChange={e => setAge(e.target.value)} />
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div style={{ display:'flex', gap:10, marginTop:14 }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={submit}>Add Pet</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const { currentUser, saveUserProfile, logout } = useAuth();

  const [step,        setStep]        = useState(0);
  const [name,        setName]        = useState('');
  const [profileType, setProfileType] = useState('');   // 'owner' | 'provider' | 'both'
  const [pets,        setPets]        = useState([]);
  const [showAddPet,  setShowAddPet]  = useState(false);
  const [error,       setError]       = useState('');
  const [saving,      setSaving]      = useState(false);

  /* ── Step navigation ── */
  const next = () => { setError(''); setStep(s => s + 1); };
  const back = () => { setError(''); setStep(s => s - 1); };

  /* ── Step validations ── */
  const canNext = () => {
    if (step === 0) return name.trim().length >= 2;
    if (step === 1) return !!profileType;
    return true;
  };

  /* ── Remove pet ── */
  const removePet = (id) => setPets(ps => ps.filter(p => p.id !== id));

  /* ── Final save ── */
  const finish = async () => {
    // Safety: make sure we have a real authenticated user
    if (!currentUser?.uid) {
      setError('Session expired. Please sign out and sign in again.');
      return;
    }
    setSaving(true);
    try {
      const profileTypes = profileType === 'both' ? ['owner', 'provider'] : [profileType];
      await saveUserProfile(currentUser.uid, {
        displayName:        name.trim(),
        profileTypes,
        pets:               profileType === 'provider' ? [] : pets,
        onboardingComplete: true,
      });
      // saveUserProfile updates context → App.jsx auto-navigates to Dashboard
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Skip pets & finish ── */
  const skipAndFinish = () => finish();

  return (
    <div className="onboard-layout">
      <div className="onboard-logo">
        <LogoIconDark size={28} />
        <span>PetLink</span>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
          {currentUser?.email && (
            <span style={{ fontSize:13, color:'var(--text-3)' }}>{currentUser.email}</span>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={logout}
            title="Sign out"
            style={{ fontSize:13, color:'var(--text-3)' }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="onboard-card">
        {/* Progress dots */}
        {step < 3 && (
          <div className="onboard-progress">
            {STEPS.slice(0, 3).map((_, i) => (
              <div key={i} className={`onboard-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
            ))}
          </div>
        )}

        {/* ── Step 0: Name ── */}
        {step === 0 && (
          <>
            <p className="onboard-step-label">Step 1 of 3</p>
            <h2 className="onboard-step-title">What's your name?</h2>
            <p className="onboard-step-sub">This is how the community will know you.</p>

            <div className="field-group">
              <label className="label">Full name or nickname</label>
              <input
                className="input-field"
                style={{ fontSize:17 }}
                placeholder="e.g. Sofia Martins"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canNext() && next()}
                autoFocus
              />
            </div>

            <div className="onboard-actions">
              <button className="btn btn-primary btn-lg" onClick={next} disabled={!canNext()}>
                Continue →
              </button>
            </div>
          </>
        )}

        {/* ── Step 1: Profile type ── */}
        {step === 1 && (
          <>
            <p className="onboard-step-label">Step 2 of 3</p>
            <h2 className="onboard-step-title">How will you use PetLink?</h2>
            <p className="onboard-step-sub">You can always add or change this later.</p>

            <div className="profile-cards">
              {[
                {
                  key: 'owner',
                  icon: '🐾', iconClass: 'orange',
                  title: 'Pet Owner',
                  desc: 'Find and book services for your pets — grooming, walking, vet visits & more.',
                },
                {
                  key: 'provider',
                  icon: '🧑‍💼', iconClass: 'green',
                  title: 'Service Provider',
                  desc: 'Offer your skills and services to pet owners in your area.',
                },
                {
                  key: 'both',
                  icon: '✨', iconClass: 'both',
                  title: 'Both',
                  desc: "I'm a pet owner AND I'd also like to offer services.",
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

            <div className="onboard-actions">
              <button className="btn btn-secondary" onClick={back}>← Back</button>
              <button className="btn btn-primary btn-lg" onClick={next} disabled={!canNext()}>
                Continue →
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Add pets ── */}
        {step === 2 && (
          <>
            <p className="onboard-step-label">Step 3 of 3 · Optional</p>
            <h2 className="onboard-step-title">Add your pets</h2>
            <p className="onboard-step-sub">
              {profileType === 'provider'
                ? 'Skip this if you prefer — you can add pets to your profile anytime.'
                : "Let service providers know who they'll be caring for."}
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
              <button
                type="button"
                className="btn btn-secondary btn-full"
                style={{ marginBottom:8 }}
                onClick={() => setShowAddPet(true)}
              >
                + Add a pet
              </button>
            )}

            {error && <p className="error-msg" style={{ marginTop:8 }}>{error}</p>}

            <div className="onboard-actions">
              <button className="btn btn-secondary" onClick={back}>← Back</button>
              {pets.length === 0 ? (
                <button className="btn btn-ghost" onClick={skipAndFinish} disabled={saving}>
                  {saving ? <span className="spinner spinner-dark" /> : 'Skip for now'}
                </button>
              ) : (
                <button className="btn btn-primary btn-lg" onClick={finish} disabled={saving || showAddPet}>
                  {saving ? <span className="spinner" /> : `Finish →`}
                </button>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
