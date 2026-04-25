import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function BookingModal({ provider, service, onClose, onSuccess }) {
  const { currentUser, userProfile } = useAuth();

  const pets = userProfile?.pets ?? [];

  const today = new Date().toISOString().split('T')[0];

  const [petId,    setPetId]    = useState(pets[0]?.id ?? '');
  const [date,     setDate]     = useState('');
  const [time,     setTime]     = useState('');
  const [notes,    setNotes]    = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const selectedPet = pets.find(p => p.id === petId);

  const handleBook = async () => {
    setError('');
    if (!date)  { setError('Escolhe uma data.'); return; }
    if (!time)  { setError('Escolhe uma hora.'); return; }
    if (pets.length > 0 && !petId) { setError('Seleciona o teu pet.'); return; }

    setLoading(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        owner_id:      currentUser.uid,
        owner_name:    userProfile?.displayName ?? '',
        caregiver_id:  provider.uid,
        caregiver_name: provider.displayName ?? '',
        pet_id:        petId || null,
        pet_name:      selectedPet?.name ?? null,
        service_id:    service.id,
        service_title: service.title,
        service_type:  service.type,
        price:         service.price,
        unit:          service.unit,
        date,
        time,
        notes:         notes.trim(),
        status:        'pendente',
        createdAt:     serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 1800);
    } catch (err) {
      console.error(err);
      setError('Erro ao criar reserva. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  const serviceTypeInfo = {
    grooming:  { emoji: '✂️',  color: 'var(--pink-soft)'   },
    walking:   { emoji: '🦮',  color: 'var(--green-soft)'  },
    sitting:   { emoji: '🏠',  color: 'var(--sky-soft)'    },
    vet:       { emoji: '🩺',  color: 'var(--yellow-soft)' },
    training:  { emoji: '🎓',  color: 'var(--green-soft)'  },
    bath:      { emoji: '🚿',  color: 'var(--sky-soft)'    },
    boarding:  { emoji: '🛏️',  color: 'var(--yellow-soft)' },
    transport: { emoji: '🚗',  color: 'var(--pink-soft)'   },
    other:     { emoji: '🐾',  color: 'var(--green-soft)'  },
  };
  const svcInfo = serviceTypeInfo[service.type] ?? serviceTypeInfo.other;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(45,58,40,0.45)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 600, padding: 20, overflowY: 'auto',
    }} onClick={e => e.target === e.currentTarget && !loading && onClose()}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${svcInfo.color}, var(--primary-soft))`,
          padding: '24px 24px 20px', position: 'relative',
        }}>
          <button onClick={onClose} disabled={loading} style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(255,255,255,0.7)', border: 'none',
            borderRadius: '50%', width: 32, height: 32, fontSize: 18,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text)',
          }}>×</button>

          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--radius)',
              background: 'rgba(255,255,255,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, flexShrink: 0,
            }}>{svcInfo.emoji}</div>
            <div>
              <h2 style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 2 }}>
                Agendar serviço
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
                <strong>{service.title}</strong> com <strong>{provider.displayName}</strong>
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>
                {service.price}€/{service.unit}
                {service.duration ? ` · ⏱ ${service.duration}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>

          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h3 style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 6 }}>
                Reserva enviada!
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
                O prestador irá confirmar em breve.
              </p>
            </div>
          ) : (
            <>
              {/* Pet selector */}
              {pets.length > 0 && (
                <div className="field-group">
                  <label className="label">Para qual pet?</label>
                  <select
                    className="input-field"
                    value={petId}
                    onChange={e => setPetId(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">— Seleciona um pet —</option>
                    {pets.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.species === 'dog' ? '🐕' : p.species === 'cat' ? '🐈' : p.species === 'rabbit' ? '🐇' : p.species === 'bird' ? '🐦' : p.species === 'fish' ? '🐟' : '🐾'} {p.name}
                        {p.breed ? ` (${p.breed})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {pets.length === 0 && (
                <div style={{
                  background: 'var(--yellow-soft)', border: '1.5px solid rgba(245,233,122,0.6)',
                  borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14,
                  fontSize: 13, color: '#7A6A1A',
                }}>
                  ⚠️ Não tens pets adicionados. Podes agendar na mesma, mas adiciona um pet no dashboard para melhor experiência.
                </div>
              )}

              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }}>
                <div className="field-group" style={{ marginBottom: 0 }}>
                  <label className="label">Data *</label>
                  <input
                    className="input-field"
                    type="date"
                    min={today}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                <div className="field-group" style={{ marginBottom: 0 }}>
                  <label className="label">Hora *</label>
                  <input
                    className="input-field"
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="field-group" style={{ marginTop: 12 }}>
                <label className="label">Notas para o prestador</label>
                <textarea
                  className="input-field"
                  style={{ minHeight: 80, resize: 'vertical', lineHeight: 1.6 }}
                  placeholder="Alergias, necessidades especiais, instruções de acesso…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              {/* Price summary */}
              <div style={{
                background: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)',
                padding: '12px 16px', marginBottom: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Valor estimado</span>
                <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                  {service.price}€
                  <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-3)', fontFamily: 'var(--font-body)' }}>
                    /{service.unit}
                  </span>
                </span>
              </div>

              {error && <p className="error-msg" style={{ marginBottom: 12 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
                  Cancelar
                </button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleBook} disabled={loading}>
                  {loading ? <span className="spinner" /> : '🗓 Confirmar reserva'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
