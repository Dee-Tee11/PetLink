import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SERVICE_TYPES = [
  { key: 'grooming',   emoji: '✂️',  label: 'Grooming',     color: 'var(--pink-soft)'   },
  { key: 'walking',    emoji: '🦮',  label: 'Dog Walking',  color: 'var(--green-soft)'  },
  { key: 'sitting',    emoji: '🏠',  label: 'Pet Sitting',  color: 'var(--sky-soft)'    },
  { key: 'vet',        emoji: '🩺',  label: 'Vet Visits',   color: 'var(--yellow-soft)' },
  { key: 'training',   emoji: '🎓',  label: 'Training',     color: 'var(--green-soft)'  },
  { key: 'bath',       emoji: '🚿',  label: 'Bath & Brush', color: 'var(--sky-soft)'    },
  { key: 'boarding',   emoji: '🛏️',  label: 'Boarding',     color: 'var(--yellow-soft)' },
  { key: 'transport',  emoji: '🚗',  label: 'Transport',    color: 'var(--pink-soft)'   },
  { key: 'other',      emoji: '🐾',  label: 'Other',        color: 'var(--green-soft)'  },
];

const typeInfo = (key) => SERVICE_TYPES.find(t => t.key === key) ?? SERVICE_TYPES[SERVICE_TYPES.length - 1];

/* ── Add / Edit Service Modal ── */
function ServiceModal({ service, onClose, onSave, onDelete }) {
  const editing = !!service;

  const [type,        setType]        = useState(service?.type        || 'grooming');
  const [title,       setTitle]       = useState(service?.title       || '');
  const [desc,        setDesc]        = useState(service?.desc        || '');
  const [price,       setPrice]       = useState(service?.price       ?? '');
  const [unit,        setUnit]        = useState(service?.unit        || 'session');
  const [duration,    setDuration]    = useState(service?.duration    || '');
  const [available,   setAvailable]   = useState(service?.available   ?? true);
  const [error,       setError]       = useState('');
  const [saving,      setSaving]      = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { setError('Give your service a title.'); return; }
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
      setError('Enter a valid price (0 or more).'); return;
    }
    setSaving(true);
    try {
      await onSave({
        id:        service?.id || Date.now().toString(),
        type, title: title.trim(), desc: desc.trim(),
        price: Number(price), unit, duration: duration.trim(),
        available,
      });
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const t = typeInfo(type);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(45,58,40,0.4)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 500, padding: 20, overflowY: 'auto',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden', margin: 'auto',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--green-soft), var(--sky-soft))',
          padding: '24px 24px 20px', position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.7)', border: 'none',
            borderRadius: '50%', width: 32, height: 32,
            fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)',
          }}>×</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--radius)',
              background: t.color, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 26, flexShrink: 0,
            }}>{t.emoji}</div>
            <div>
              <h2 style={{ fontSize: 20, fontFamily: 'var(--font-display)' }}>
                {editing ? 'Edit Service' : 'Add Service'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-body)' }}>
                {editing ? 'Update the details of your service.' : 'Describe what you offer to pet owners.'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Type picker */}
          <label className="label">Category</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {SERVICE_TYPES.map(s => (
              <button
                key={s.key} type="button"
                className={`species-btn ${type === s.key ? 'active' : ''}`}
                onClick={() => setType(s.key)}
                style={{ fontSize: 12 }}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="field-group">
            <label className="label">Service title *</label>
            <input
              className="input-field"
              placeholder={`e.g. ${t.label} for small dogs`}
              value={title} onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="field-group">
            <label className="label">Description</label>
            <textarea
              className="input-field"
              style={{ minHeight: 80, resize: 'vertical', lineHeight: 1.6 }}
              placeholder="What's included? Any special conditions, experience, equipment…"
              value={desc} onChange={e => setDesc(e.target.value)}
            />
          </div>

          {/* Price + unit + duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="label">Price (€) *</label>
              <input
                className="input-field" type="number" min="0" step="0.5"
                placeholder="e.g. 15" value={price} onChange={e => setPrice(e.target.value)}
              />
            </div>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="label">Per</label>
              <select
                className="input-field" value={unit} onChange={e => setUnit(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="session">Session</option>
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="night">Night</option>
                <option value="visit">Visit</option>
                <option value="km">Km</option>
              </select>
            </div>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="label">Duration</label>
              <input
                className="input-field" placeholder="e.g. 1h30"
                value={duration} onChange={e => setDuration(e.target.value)}
              />
            </div>
          </div>

          {/* Availability toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', background: 'var(--bg-alt)',
            borderRadius: 'var(--radius-sm)', marginBottom: 16,
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Available now</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                Pet owners can see and book this service
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAvailable(v => !v)}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: available ? 'var(--primary)' : 'var(--border-mid)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.25s', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 3,
                left: available ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff', transition: 'left 0.25s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }} />
            </button>
          </div>

          {error && <p className="error-msg" style={{ marginBottom: 12 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {editing && onDelete && (
              <button
                className="btn btn-secondary"
                style={{ color: 'var(--danger)', borderColor: 'var(--danger)', flex: '0 0 auto' }}
                onClick={() => { if (window.confirm('Remove this service?')) onDelete(service.id); }}
              >
                Remove
              </button>
            )}
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : editing ? 'Save changes' : 'Add Service'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Service card ── */
function ServiceCard({ service, onClick }) {
  const t = typeInfo(service.type);
  return (
    <div
      className="service-card"
      style={{ position: 'relative', cursor: 'pointer' }}
      onClick={onClick}
    >
      {/* availability pill */}
      <div style={{
        position: 'absolute', top: 14, right: 14,
        width: 10, height: 10, borderRadius: '50%',
        background: service.available ? 'var(--success)' : 'var(--text-3)',
        boxShadow: service.available ? '0 0 0 3px rgba(125,191,106,0.2)' : 'none',
      }} title={service.available ? 'Available' : 'Unavailable'} />

      <div className="service-card-icon" style={{ background: t.color }}>
        {t.emoji}
      </div>
      <h3 style={{ paddingRight: 20 }}>{service.title}</h3>
      {service.desc && (
        <p style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {service.desc}
        </p>
      )}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 }}>
        <span style={{
          fontSize: 16, fontWeight: 700, color: 'var(--text)',
          fontFamily: 'var(--font-display)',
        }}>
          {service.price}€
          <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-3)', fontFamily: 'var(--font-body)' }}>
            /{service.unit}
          </span>
        </span>
        {service.duration && (
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>⏱ {service.duration}</span>
        )}
      </div>
    </div>
  );
}

/* ── Main exported section ── */
export default function ServiceSection({ services: initialServices }) {
  const { currentUser, saveUserProfile } = useAuth();
  const [services,  setServices]  = useState(initialServices || []);
  const [selected,  setSelected]  = useState(null);   // service being edited
  const [showAdd,   setShowAdd]   = useState(false);

  const persist = async (next) => {
    setServices(next);
    await saveUserProfile(currentUser.uid, { services: next });
  };

  const handleSave = async (svc) => {
    const exists = services.find(s => s.id === svc.id);
    const next = exists
      ? services.map(s => s.id === svc.id ? svc : s)
      : [...services, svc];
    await persist(next);
    setSelected(null);
    setShowAdd(false);
  };

  const handleDelete = async (id) => {
    await persist(services.filter(s => s.id !== id));
    setSelected(null);
  };

  return (
    <>
      {showAdd && (
        <ServiceModal
          onClose={() => setShowAdd(false)}
          onSave={handleSave}
        />
      )}
      {selected && (
        <ServiceModal
          service={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      <div className="section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>My Services</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            + Add Service
          </button>
        </div>
        <p className="section-sub">Click a service to edit it. The green dot means it's visible to pet owners.</p>

        {services.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🛎️</span>
            <h3>No services yet</h3>
            <p>Add the services you offer so pet owners can find and book you.</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              Add your first service
            </button>
          </div>
        ) : (
          <div className="services-grid">
            {services.map(svc => (
              <ServiceCard key={svc.id} service={svc} onClick={() => setSelected(svc)} />
            ))}
            {/* Add card */}
            <div
              className="service-card"
              style={{
                border: '2px dashed var(--border-mid)', background: 'transparent',
                cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-3)', gap: 8,
                transition: 'border-color var(--ease), color var(--ease), background var(--ease)',
              }}
              onClick={() => setShowAdd(true)}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.background = 'var(--primary-soft)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-mid)';
                e.currentTarget.style.color = 'var(--text-3)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ fontSize: 28 }}>+</div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Add a service</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
