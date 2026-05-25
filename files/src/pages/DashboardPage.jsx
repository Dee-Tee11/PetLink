import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import MainLayout from '../components/MainLayout';
import PetSection from '../components/PetSection';
import ServiceSection from '../components/ServiceSection';
import WorkerSection from '../components/WorkerSection';
import BookingModal from '../components/BookingModal';
import BookingsSection from '../components/BookingsSection';
import { Button, Spinner, EmptyState, TabBar } from '../ui';
import { SERVICE_TYPES, getServiceType } from '../components/ServiceTypeMap';

// ── Browse Providers Modal ───────────────────────────────────────────────────
function BrowseProvidersModal({ serviceType, onClose }) {
  const { currentUser } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [booking,   setBooking]   = useState(null);

  const typeInfo = getServiceType(serviceType.key);

  useEffect(() => {
    async function loadProviders() {
      try {
        const result = [];

        // ── 1. Individual providers ──────────────────────────────────────────
        const q1 = query(
          collection(db, 'users'),
          where('profileTypes', 'array-contains', 'provider'),
        );
        const snap1 = await getDocs(q1);
        snap1.forEach(docSnap => {
          if (docSnap.id === currentUser?.uid) return;
          const user = docSnap.data();
          const matching = (user.services ?? []).filter(
            s => s.type === serviceType.key && s.available !== false,
          );
          if (matching.length > 0) {
            result.push({
              ...user,
              uid: docSnap.id,
              isCompanyWorker: false,
              matchingServices: matching,
            });
          }
        });

        // ── 2. Company workers ───────────────────────────────────────────────
        const q2 = query(
          collection(db, 'users'),
          where('profileTypes', 'array-contains', 'company'),
        );
        const snap2 = await getDocs(q2);
        snap2.forEach(docSnap => {
          if (docSnap.id === currentUser?.uid) return;
          const companyUser = docSnap.data();
          const companyName = companyUser.companyProfile?.companyName
            || companyUser.displayName
            || 'Empresa';
          const companyLocation = companyUser.companyProfile?.location || '';
          const workers = companyUser.companyProfile?.workers || [];

          workers.forEach(worker => {
            if (!worker.available) return;
            const matching = (worker.services ?? []).filter(
              s => s.type === serviceType.key && s.available !== false,
            );
            if (matching.length > 0) {
              result.push({
                // Use company uid so bookings route to the company
                uid:            docSnap.id,
                worker_id:      worker.id,
                displayName:    worker.name,
                companyName,
                companyUid:     docSnap.id,
                isCompanyWorker: true,
                bio:            worker.bio || '',
                ownerProfile:   { location: companyLocation },
                matchingServices: matching,
              });
            }
          });
        });

        setProviders(result);
      } catch (err) {
        console.error('Error fetching providers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProviders();
  }, [serviceType.key, currentUser?.uid]);

  if (booking) {
    return (
      <BookingModal
        provider={booking.provider}
        service={booking.service}
        onClose={() => setBooking(null)}
        onSuccess={() => { setBooking(null); onClose(); }}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-sm)',
            background: typeInfo.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>{typeInfo.emoji}</div>
          <div>
            <h2 className="modal-title" style={{ marginBottom: 0 }}>
              Prestadores de {typeInfo.label}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
              Seleciona um prestador para agendar
            </p>
          </div>
        </div>

        <div style={{ margin: '16px 0', height: 1, background: 'var(--border)' }} />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Spinner dark inline />
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 12 }}>
              A procurar prestadores…
            </p>
          </div>
        ) : providers.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Nenhum prestador encontrado"
            body={`Ainda não há prestadores disponíveis para ${typeInfo.label}. Tenta mais tarde!`}
            style={{ padding: '24px 16px' }}
          />
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 12,
            maxHeight: 420, overflowY: 'auto',
          }}>
            {providers.map((provider, idx) => (
              <div key={`${provider.uid}-${provider.worker_id || idx}`}
                style={{
                  border: '1.5px solid var(--border-mid)', borderRadius: 'var(--radius)',
                  padding: '16px', background: 'var(--bg-alt)',
                }}
              >
                {/* Provider / Worker header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: provider.isCompanyWorker
                      ? 'linear-gradient(135deg, var(--sky), var(--primary))'
                      : 'linear-gradient(135deg, var(--yellow), var(--green-mid))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: 'var(--text)', flexShrink: 0,
                  }}>
                    {(provider.displayName || 'P')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                      {provider.displayName || 'Prestador'}
                    </h4>
                    {/* Company badge for workers */}
                    {provider.isCompanyWorker && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 600, padding: '2px 8px',
                        borderRadius: 10, background: 'var(--sky-soft)', color: '#3A6A9A',
                        marginBottom: 2,
                      }}>
                        🏢 {provider.companyName}
                      </span>
                    )}
                    {(provider.ownerProfile?.location || provider.providerProfile?.location) && (
                      <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        📍 {provider.ownerProfile?.location || provider.providerProfile?.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Services */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {provider.matchingServices.map(svc => (
                    <div key={svc.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'var(--white)', borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px', gap: 10, flexWrap: 'wrap',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                          {svc.title}
                        </p>
                        {svc.desc && (
                          <p style={{
                            fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{svc.desc}</p>
                        )}
                        <p style={{
                          fontSize: 13, fontWeight: 700, color: 'var(--text)',
                          marginTop: 4, fontFamily: 'var(--font-display)',
                        }}>
                          {svc.price}€
                          <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-3)', fontFamily: 'var(--font-body)' }}>
                            /{svc.unit}
                          </span>
                          {svc.duration && (
                            <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-3)', fontFamily: 'var(--font-body)', marginLeft: 6 }}>
                              · ⏱ {svc.duration}
                            </span>
                          )}
                        </p>
                      </div>
                      <Button
                        variant="primary" size="sm"
                        onClick={() => setBooking({ provider, service: svc })}
                      >
                        🗓 Agendar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}

// ── Owner View ───────────────────────────────────────────────────────────────
const OWNER_TABS = [
  { key: 'explore',  label: '🔍 Explorar serviços' },
  { key: 'pets',     label: '🐾 Os meus pets'       },
  { key: 'bookings', label: '📅 As minhas reservas' },
];

function OwnerView({ pets, displayName }) {
  const firstName = displayName?.split(' ')[0] || 'aí';
  const [selectedType, setSelectedType] = useState(null);
  const [ownerTab,     setOwnerTab]     = useState('explore');

  return (
    <>
      <div className="dashboard-welcome">
        <h1>Olá, {firstName} 👋</h1>
        <p>Bem-vindo ao teu dashboard. Encontra o melhor cuidado para os teus pets.</p>
      </div>

      <TabBar tabs={OWNER_TABS} activeKey={ownerTab} onChange={setOwnerTab} />

      {ownerTab === 'pets'     && <PetSection pets={pets} />}
      {ownerTab === 'bookings' && <BookingsSection role="owner" />}

      {ownerTab === 'explore' && (
        <div className="section">
          <h2 className="section-title">Explorar Serviços</h2>
          <p className="section-sub">
            Clica numa categoria para ver prestadores individuais e equipas disponíveis.
          </p>
          <div className="services-grid">
            {SERVICE_TYPES.filter(t => t.key !== 'other').map(s => (
              <div className="service-card" key={s.key}
                onClick={() => setSelectedType(s)} style={{ cursor: 'pointer' }}>
                <div className="service-card-icon" style={{ background: s.color }}>{s.emoji}</div>
                <h3>{s.label}</h3>
                {s.badge && <span className={`service-badge ${s.badgeClass}`}>{s.badge}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedType && (
        <BrowseProvidersModal serviceType={selectedType} onClose={() => setSelectedType(null)} />
      )}
    </>
  );
}

// ── Provider View ────────────────────────────────────────────────────────────
const PROVIDER_TABS = [
  { key: 'services', label: '🛎️ Os meus serviços'  },
  { key: 'bookings', label: '📅 Reservas recebidas' },
];

function ProviderView({ displayName, services, bookingCount }) {
  const firstName = displayName?.split(' ')[0] || 'aí';
  const [providerTab, setProviderTab] = useState('services');

  return (
    <>
      <div className="dashboard-welcome">
        <h1>O teu negócio, {firstName} 🚀</h1>
        <p>Gere os teus serviços e faz crescer o teu negócio de cuidados a animais.</p>
      </div>

      <div className="stats-row">
        {[
          { label: 'Reservas este mês',  value: bookingCount ?? '0', change: bookingCount > 0 ? '↑ Activo' : '—' },
          { label: 'Serviços activos',   value: (services ?? []).filter(s => s.available !== false).length.toString(), change: 'Visíveis para clientes' },
          { label: 'Avaliação média',    value: '—',  change: 'Conta nova' },
          { label: 'Receita (€)',        value: '0',  change: '—' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <span className="stat-card-label">{s.label}</span>
            <span className="stat-card-value">{s.value}</span>
            <span className="stat-card-change">{s.change}</span>
          </div>
        ))}
      </div>

      <TabBar tabs={PROVIDER_TABS} activeKey={providerTab} onChange={setProviderTab} />
      {providerTab === 'services' && <ServiceSection services={services} />}
      {providerTab === 'bookings' && <BookingsSection role="provider" />}
    </>
  );
}

// ── Company View ─────────────────────────────────────────────────────────────
const COMPANY_TABS = [
  { key: 'workers',  label: '🧑‍💼 A minha Equipa'    },
  { key: 'bookings', label: '📅 Reservas recebidas' },
];

function CompanyView({ displayName, companyProfile, bookingCount }) {
  const workers     = companyProfile?.workers   || [];
  const companyName = companyProfile?.companyName || displayName || 'Empresa';
  const [companyTab, setCompanyTab] = useState('workers');

  const activeWorkers  = workers.filter(w => w.available).length;
  const totalServices  = workers.reduce((acc, w) => acc + (w.services?.length || 0), 0);

  return (
    <>
      <div className="dashboard-welcome">
        <h1>🏢 {companyName}</h1>
        <p>Gere a tua equipa, define os seus serviços e acompanha as reservas recebidas.</p>
      </div>

      <div className="stats-row">
        {[
          { label: 'Trabalhadores activos', value: activeWorkers.toString(),    change: `${workers.length} no total`         },
          { label: 'Reservas este mês',      value: (bookingCount ?? 0).toString(), change: bookingCount > 0 ? '↑ Activo' : '—' },
          { label: 'Serviços da equipa',     value: totalServices.toString(),   change: 'Em todos os trabalhadores'          },
          { label: 'Avaliação média',        value: '—',                        change: 'Conta nova'                         },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <span className="stat-card-label">{s.label}</span>
            <span className="stat-card-value">{s.value}</span>
            <span className="stat-card-change">{s.change}</span>
          </div>
        ))}
      </div>

      <TabBar tabs={COMPANY_TABS} activeKey={companyTab} onChange={setCompanyTab} />
      {companyTab === 'workers'  && <WorkerSection workers={workers} />}
      {companyTab === 'bookings' && <BookingsSection role="provider" />}
    </>
  );
}

// ── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { userProfile, currentUser } = useAuth();

  const isOwner    = userProfile?.profileTypes?.includes('owner');
  const isProvider = userProfile?.profileTypes?.includes('provider');
  const isCompany  = userProfile?.profileTypes?.includes('company');

  // Default to whichever profile type exists
  const defaultView = isOwner ? 'owner' : isProvider ? 'provider' : isCompany ? 'company' : 'owner';
  const [activeView,   setActiveView]   = useState(defaultView);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    if ((!isProvider && !isCompany) || !currentUser) return;
    (async () => {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('caregiver_id', '==', currentUser.uid),
          where('status', '!=', 'cancelado'),
        );
        const snap = await getDocs(q);
        setBookingCount(snap.size);
      } catch { /* non-critical */ }
    })();
  }, [isProvider, isCompany, currentUser]);

  // Build switcher buttons for every active profile type
  const viewOptions = [
    isOwner    && { key: 'owner',    label: '🐾 Pet Owner' },
    isProvider && { key: 'provider', label: '💼 Prestador' },
    isCompany  && { key: 'company',  label: '🏢 Empresa'   },
  ].filter(Boolean);

  const navCenter = viewOptions.length > 1 ? (
    <div className="profile-switcher">
      {viewOptions.map(opt => (
        <button
          key={opt.key}
          className={`switcher-btn ${activeView === opt.key ? 'active' : ''}`}
          onClick={() => setActiveView(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <MainLayout navCenter={navCenter}>
      {activeView === 'owner' && (
        <OwnerView
          pets={userProfile?.pets ?? []}
          displayName={userProfile?.displayName}
        />
      )}
      {activeView === 'provider' && (
        <ProviderView
          displayName={userProfile?.displayName}
          services={userProfile?.services ?? []}
          bookingCount={bookingCount}
        />
      )}
      {activeView === 'company' && (
        <CompanyView
          displayName={userProfile?.displayName}
          companyProfile={userProfile?.companyProfile}
          bookingCount={bookingCount}
        />
      )}
    </MainLayout>
  );
}
