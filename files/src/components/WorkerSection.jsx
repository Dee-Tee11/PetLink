import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SERVICE_TYPES } from './ServiceTypeMap';

const typeInfo = (key) => SERVICE_TYPES.find(t => t.key === key) ?? SERVICE_TYPES[SERVICE_TYPES.length - 1];

// ── Service modal for a worker's services ────────────────────────────────────
function WorkerServiceModal({ service, onClose, onSave, onDelete }) {
  const editing = !!service;
  const [type,      setType]      = useState(service?.type      || 'grooming');
  const [title,     setTitle]     = useState(service?.title     || '');
  const [desc,      setDesc]      = useState(service?.desc      || '');
  const [price,     setPrice]     = useState(service?.price     ?? '');
  const [unit,      setUnit]      = useState(service?.unit      || 'session');
  const [duration,  setDuration]  = useState(service?.duration  || '');
  const [available, setAvailable] = useState(service?.available ?? true);
  const [error,     setError]     = useState('');
  const [saving,    setSaving]    = useState(false);

  const t = typeInfo(type);

  const handleSave = async () => {
    if (!title.trim()) { setError('Dá um título ao serviço.'); return; }
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
      setError('Insere um preço válido.'); return;
    }
    setSaving(true);
    try {
      await onSave({
        id:       service?.id || Date.now().toString(),
        type,     title: title.trim(), desc: desc.trim(),
        price:    Number(price), unit, duration: duration.trim(), available,
      });
      onClose();
    } catch {
      setError('Algo correu mal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(45,58,40,0.55)',
      backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 650, padding: 20, overflowY: 'auto',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 460, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${t.color}, var(--primary-soft))`,
          padding: '20px 24px', position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(255,255,255,0.7)', border: 'none',
            borderRadius: '50%', width: 30, height: 30, fontSize: 16,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--text)',
          }}>×</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>{t.emoji}</div>
            <h3 style={{ fontSize: 18, fontFamily: 'var(--font-display)' }}>
              {editing ? 'Editar Serviço' : 'Adicionar Serviço'}
            </h3>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <label className="label">Categoria</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {SERVICE_TYPES.map(s => (
              <button key={s.key} type="button"
                className={`species-btn ${type === s.key ? 'active' : ''}`}
                onClick={() => setType(s.key)} style={{ fontSize: 12 }}
              >{s.emoji} {s.label}</button>
            ))}
          </div>

          <div className="field-group">
            <label className="label">Título *</label>
            <input className="input-field" placeholder={`ex: ${t.label} profissional`}
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="field-group">
            <label className="label">Descrição</label>
            <textarea className="input-field" style={{ minHeight: 70, resize: 'vertical', lineHeight: 1.5 }}
              placeholder="O que está incluído?"
              value={desc} onChange={e => setDesc(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="label">Preço (€) *</label>
              <input className="input-field" type="number" min="0" step="0.5"
                placeholder="ex: 15" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="label">Por</label>
              <select className="input-field" value={unit} onChange={e => setUnit(e.target.value)}>
                <option value="session">Sessão</option>
                <option value="hour">Hora</option>
                <option value="day">Dia</option>
                <option value="night">Noite</option>
                <option value="visit">Visita</option>
              </select>
            </div>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="label">Duração</label>
              <input className="input-field" placeholder="ex: 1h30"
                value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', background: 'var(--bg-alt)',
            borderRadius: 'var(--radius-sm)', marginBottom: 14,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Disponível agora</span>
            <button type="button" onClick={() => setAvailable(v => !v)} style={{
              width: 44, height: 24, borderRadius: 12,
              background: available ? 'var(--primary)' : 'var(--border-mid)',
              border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: available ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff', transition: 'left 0.25s',
              }} />
            </button>
          </div>

          {error && <p className="error-msg" style={{ marginBottom: 10 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            {editing && onDelete && (
              <button className="btn btn-secondary"
                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                onClick={() => { if (window.confirm('Remover este serviço?')) onDelete(service.id); }}>
                Remover
              </button>
            )}
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : editing ? 'Guardar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Worker modal (details + services) ────────────────────────────────────────
function WorkerModal({ worker, onClose, onSave, onDelete }) {
  const editing = !!worker;
  const [name,            setName]            = useState(worker?.name      || '');
  const [bio,             setBio]             = useState(worker?.bio       || '');
  const [available,       setAvailable]       = useState(worker?.available ?? true);
  const [services,        setServices]        = useState(worker?.services  || []);
  const [selectedService, setSelectedService] = useState(null);
  const [showAddService,  setShowAddService]  = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [error,           setError]           = useState('');

  const handleServiceSave = (svc) => {
    const exists = services.find(s => s.id === svc.id);
    const next = exists
      ? services.map(s => s.id === svc.id ? svc : s)
      : [...services, svc];
    setServices(next);
    setSelectedService(null);
    setShowAddService(false);
  };

  const handleServiceDelete = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
    setSelectedService(null);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('O nome é obrigatório.'); return; }
    setSaving(true);
    try {
      await onSave({
        id:        worker?.id || 'w_' + Date.now(),
        name:      name.trim(),
        bio:       bio.trim(),
        available,
        services,
      });
      onClose();
    } catch {
      setError('Algo correu mal. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {(showAddService || selectedService) && (
        <WorkerServiceModal
          service={selectedService}
          onClose={() => { setSelectedService(null); setShowAddService(false); }}
          onSave={handleServiceSave}
          onDelete={handleServiceDelete}
        />
      )}

      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(45,58,40,0.48)',
        backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 580, padding: 20, overflowY: 'auto',
      }} onClick={e => e.target === e.currentTarget && !saving && onClose()}>
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-xl)',
          width: '100%', maxWidth: 500, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--sky-soft), var(--primary-soft))',
            padding: '22px 24px', position: 'relative',
          }}>
            <button onClick={onClose} disabled={saving} style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(255,255,255,0.7)', border: 'none',
              borderRadius: '50%', width: 32, height: 32, fontSize: 18,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--text)',
            }}>×</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--yellow), var(--green-mid))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: 'var(--text)', flexShrink: 0,
              }}>
                {name[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 2 }}>
                  {editing ? 'Editar Trabalhador' : 'Novo Trabalhador'}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  {editing ? `A gerir ${worker.name}` : 'Adiciona um membro à equipa'}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '24px' }}>
            <div className="field-group">
              <label className="label">Nome completo *</label>
              <input className="input-field" placeholder="ex: Ana Ferreira"
                value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="field-group">
              <label className="label">Bio / Especialidade</label>
              <textarea className="input-field"
                style={{ minHeight: 72, resize: 'vertical', lineHeight: 1.6 }}
                placeholder="ex: Especialista em grooming de cães de grande porte, 5 anos de experiência"
                value={bio} onChange={e => setBio(e.target.value)} />
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', background: 'var(--bg-alt)',
              borderRadius: 'var(--radius-sm)', marginBottom: 20,
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Disponível para reservas</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                  Clientes podem reservar este trabalhador
                </div>
              </div>
              <button type="button" onClick={() => setAvailable(v => !v)} style={{
                width: 44, height: 24, borderRadius: 12,
                background: available ? 'var(--primary)' : 'var(--border-mid)',
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s',
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: available ? 23 : 3,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.25s',
                }} />
              </button>
            </div>

            {/* Services sub-section */}
            <div style={{ marginBottom: 18 }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 10,
              }}>
                <label className="label" style={{ marginBottom: 0 }}>
                  Serviços ({services.length})
                </label>
                <button className="btn btn-primary btn-sm"
                  onClick={() => setShowAddService(true)}>
                  + Serviço
                </button>
              </div>

              {services.length === 0 ? (
                <div style={{
                  border: '2px dashed var(--border-mid)', borderRadius: 'var(--radius-sm)',
                  padding: '16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13,
                }}>
                  Ainda sem serviços. Adiciona os serviços que este trabalhador oferece.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {services.map(svc => {
                    const t = typeInfo(svc.type);
                    return (
                      <div key={svc.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', background: 'var(--bg-alt)',
                          borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                          border: '1.5px solid var(--border)',
                          transition: 'border-color var(--ease)',
                        }}
                        onClick={() => setSelectedService(svc)}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <div style={{
                          width: 34, height: 34, borderRadius: 8,
                          background: t.color, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 16, flexShrink: 0,
                        }}>{t.emoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                            {svc.title}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                            {svc.price}€/{svc.unit}
                            {svc.duration && ` · ⏱ ${svc.duration}`}
                          </div>
                        </div>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          background: svc.available ? 'var(--success)' : 'var(--text-3)',
                        }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {error && <p className="error-msg" style={{ marginBottom: 10 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              {editing && onDelete && (
                <button className="btn btn-secondary"
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  onClick={() => {
                    if (window.confirm(`Remover ${worker.name} da equipa?`)) onDelete(worker.id);
                  }}>
                  Remover
                </button>
              )}
              <button className="btn btn-secondary" style={{ flex: 1 }}
                onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              <button className="btn btn-primary" style={{ flex: 2 }}
                onClick={handleSave} disabled={saving}>
                {saving
                  ? <span className="spinner" />
                  : editing ? 'Guardar alterações' : 'Adicionar trabalhador'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Exported WorkerSection ───────────────────────────────────────────────────
export default function WorkerSection({ workers: initialWorkers }) {
  const { currentUser, userProfile, saveUserProfile } = useAuth();
  const [workers,  setWorkers]  = useState(initialWorkers || []);
  const [selected, setSelected] = useState(null);
  const [showAdd,  setShowAdd]  = useState(false);

  const persist = async (next) => {
    setWorkers(next);
    await saveUserProfile(currentUser.uid, {
      companyProfile: { ...(userProfile?.companyProfile || {}), workers: next },
    });
  };

  const handleSave = async (worker) => {
    const exists = workers.find(w => w.id === worker.id);
    const next = exists
      ? workers.map(w => w.id === worker.id ? worker : w)
      : [...workers, worker];
    await persist(next);
    setSelected(null);
    setShowAdd(false);
  };

  const handleDelete = async (id) => {
    await persist(workers.filter(w => w.id !== id));
    setSelected(null);
  };

  const totalServices = workers.reduce((acc, w) => acc + (w.services?.length || 0), 0);
  const activeWorkers = workers.filter(w => w.available).length;

  return (
    <>
      {showAdd && (
        <WorkerModal onClose={() => setShowAdd(false)} onSave={handleSave} />
      )}
      {selected && (
        <WorkerModal
          worker={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      <div className="section">
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 6,
        }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>A minha Equipa</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            + Adicionar Trabalhador
          </button>
        </div>
        <p className="section-sub">
          Gere a tua equipa e os serviços de cada membro. Clica num trabalhador para editar.
          {workers.length > 0 && ` · ${activeWorkers} disponíve${activeWorkers !== 1 ? 'is' : 'l'} · ${totalServices} serviço${totalServices !== 1 ? 's' : ''} no total`}
        </p>

        {workers.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🧑‍💼</span>
            <h3>Sem trabalhadores ainda</h3>
            <p>
              Adiciona membros à tua equipa. Cada trabalhador pode ter os seus próprios
              serviços e estará visível para os clientes reservarem.
            </p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              Adicionar primeiro trabalhador
            </button>
          </div>
        ) : (
          <div className="services-grid">
            {workers.map(worker => (
              <div key={worker.id} className="service-card"
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => setSelected(worker)}
              >
                {/* Availability dot */}
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  width: 10, height: 10, borderRadius: '50%',
                  background: worker.available ? 'var(--success)' : 'var(--text-3)',
                  boxShadow: worker.available ? '0 0 0 3px rgba(125,191,106,0.2)' : 'none',
                }} title={worker.available ? 'Disponível' : 'Indisponível'} />

                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--yellow), var(--green-mid))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 2,
                }}>
                  {worker.name[0]?.toUpperCase() || '?'}
                </div>

                <h3 style={{ paddingRight: 18 }}>{worker.name}</h3>

                {worker.bio && (
                  <p style={{
                    WebkitLineClamp: 2, display: '-webkit-box',
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{worker.bio}</p>
                )}

                <div style={{
                  marginTop: 'auto', paddingTop: 10,
                  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    🛎️ {worker.services?.length || 0} serviço{worker.services?.length !== 1 ? 's' : ''}
                  </span>
                  {!worker.available && (
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 10,
                      background: 'var(--bg-alt)', color: 'var(--text-3)', fontWeight: 600,
                    }}>Indisponível</span>
                  )}
                </div>
              </div>
            ))}

            {/* Add card */}
            <div className="service-card" style={{
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
              <p style={{ fontSize: 14, fontWeight: 600 }}>Adicionar trabalhador</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
