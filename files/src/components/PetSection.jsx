import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SPECIES = [
  { key:'dog',    emoji:'🐕', label:'Dog'    },
  { key:'cat',    emoji:'🐈', label:'Cat'    },
  { key:'rabbit', emoji:'🐇', label:'Rabbit' },
  { key:'bird',   emoji:'🐦', label:'Bird'   },
  { key:'fish',   emoji:'🐟', label:'Fish'   },
  { key:'other',  emoji:'🐾', label:'Other'  },
];

const speciesEmoji = (key) => SPECIES.find(s => s.key === key)?.emoji ?? '🐾';

/* ── Pill badge ── */
function Badge({ children, color = 'green' }) {
  const colors = {
    green:  { bg: 'var(--green-soft)',   color: '#4A7A3A' },
    pink:   { bg: 'var(--pink-soft)',    color: '#B04060' },
    blue:   { bg: 'var(--sky-soft)',     color: '#3A6A9A' },
    yellow: { bg: 'var(--yellow-soft)',  color: '#7A6A1A' },
  };
  const s = colors[color] || colors.green;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>{children}</span>
  );
}

/* ── Pet detail modal ── */
function PetModal({ pet, onClose, onDelete }) {
  const [notes, setNotes]   = useState(pet.notes || '');
  const [saving, setSaving] = useState(false);
  const { currentUser, userProfile, saveUserProfile } = useAuth();

  const saveNotes = async () => {
    setSaving(true);
    const updated = (userProfile.pets || []).map(p => p.id === pet.id ? { ...p, notes } : p);
    await saveUserProfile(currentUser.uid, { pets: updated });
    setSaving(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(45,58,40,0.4)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 500, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--green-soft), var(--yellow-soft))',
          padding: '24px 20px 20px', textAlign: 'center', position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.6)', border: 'none',
            borderRadius: '50%', width: 32, height: 32,
            fontSize: 18, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'var(--text)',
          }}>×</button>
          <div style={{
            fontSize: 42, width: 68, height: 68, background: 'var(--white)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 10px',
            boxShadow: '0 4px 12px rgba(45,58,40,0.1)',
          }}>{speciesEmoji(pet.species)}</div>
          <h2 style={{ fontSize: 22, fontFamily: 'var(--font-display)', marginBottom: 6 }}>{pet.name}</h2>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Badge color="green">{pet.species}</Badge>
            {pet.breed && <Badge color="blue">{pet.breed}</Badge>}
            {pet.age != null && <Badge color="yellow">{pet.age} yr{pet.age !== 1 ? 's' : ''}</Badge>}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>
          <label className="label" style={{ marginBottom: 8 }}>Health notes</label>
          <textarea
            className="input-field"
            style={{ minHeight: 100, resize: 'vertical', lineHeight: 1.6 }}
            placeholder="Vaccinations, medication, vet visits, allergies…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ flex: '1 1 120px' }} onClick={saveNotes} disabled={saving}>
              {saving ? <span className="spinner" /> : 'Save notes'}
            </button>
            <button
              className="btn btn-secondary"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)', flex: '1 1 80px' }}
              onClick={() => { if (window.confirm(`Remove ${pet.name}?`)) onDelete(pet.id); }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Add pet modal ── */
function AddPetModal({ onClose, onAdd }) {
  const [name,    setName]    = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed,   setBreed]   = useState('');
  const [age,     setAge]     = useState('');
  const [error,   setError]   = useState('');

  const submit = () => {
    if (!name.trim()) { setError('Give your pet a name.'); return; }
    onAdd({ id: Date.now().toString(), name: name.trim(), species, breed: breed.trim(), age: age ? Number(age) : null, notes: '' });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(45,58,40,0.4)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 500, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-lg)', padding: '24px 20px',
      }}>
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>Add a pet</h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>Tell us about your furry friend.</p>

        <label className="label">Species</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {SPECIES.map(s => (
            <button key={s.key} type="button"
              className={`species-btn ${species === s.key ? 'active' : ''}`}
              onClick={() => setSpecies(s.key)}
            >{s.emoji} {s.label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
          <div className="field-group" style={{ marginBottom: 0 }}>
            <label className="label">Name *</label>
            <input className="input-field" placeholder="e.g. Buddy" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field-group" style={{ marginBottom: 0 }}>
            <label className="label">Breed</label>
            <input className="input-field" placeholder="e.g. Labrador" value={breed} onChange={e => setBreed(e.target.value)} />
          </div>
          <div className="field-group" style={{ marginBottom: 0 }}>
            <label className="label">Age (years)</label>
            <input className="input-field" type="number" min="0" max="30" placeholder="e.g. 3" value={age} onChange={e => setAge(e.target.value)} />
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" style={{ flex: '1 1 120px' }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: '1 1 120px' }} onClick={submit}>Add Pet</button>
        </div>
      </div>
    </div>
  );
}

/* ── Exported section used inside DashboardPage ── */
export default function PetSection({ pets: initialPets }) {
  const { currentUser, userProfile, saveUserProfile } = useAuth();
  const [pets,      setPets]      = useState(initialPets || []);
  const [selected,  setSelected]  = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);

  const speciesEmoji2 = (s) =>
    ({ dog:'🐕', cat:'🐈', rabbit:'🐇', bird:'🐦', fish:'🐟', other:'🐾' }[s] ?? '🐾');

  const handleAdd = async (pet) => {
    const next = [...pets, pet];
    setPets(next);
    setShowAdd(false);
    await saveUserProfile(currentUser.uid, { pets: next });
  };

  const handleDelete = async (id) => {
    const next = pets.filter(p => p.id !== id);
    setPets(next);
    setSelected(null);
    await saveUserProfile(currentUser.uid, { pets: next });
  };

  return (
    <>
      {selected && (
        <PetModal
          pet={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}
      {showAdd && (
        <AddPetModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}

      <div className="section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>My Pets</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Pet</button>
        </div>
        <p className="section-sub">Click a pet to view details and health notes.</p>

        <div className="pets-grid">
          {pets.map(pet => (
            <div className="pet-card" key={pet.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(pet)}>
              <div className="pet-card-emoji">{speciesEmoji2(pet.species)}</div>
              <h3>{pet.name}</h3>
              <p>{pet.breed || pet.species}{pet.age != null ? `, ${pet.age} yr${pet.age !== 1 ? 's' : ''}` : ''}</p>
              {pet.notes && (
                <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>📝 has notes</span>
              )}
            </div>
          ))}
          <div className="pet-card pet-card-add" onClick={() => setShowAdd(true)}>
            <div style={{ fontSize: 28 }}>+</div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Add a pet</p>
          </div>
        </div>
      </div>
    </>
  );
}
