import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import MainLayout from '../components/MainLayout';
import PetSection from '../components/PetSection';
import ServiceSection from '../components/ServiceSection';
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
        const q = query(
          collection(db, 'users'),
          where('profileTypes', 'array-contains', 'provider'),
        );
        const snap = await getDocs(q);
        const result = [];
        snap.forEach(docSnap => {
          if (docSnap.id === currentUser?.uid) return;
          const user = docSnap.data();
          const matching = (user.services ?? []).filter(
            s => s.type === serviceType.key && s.available !== false,
          );
          if (matching.length > 0) result.push({ ...user, uid: docSnap.id, matchingServices: matching });
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
      <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: typeInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{typeInfo.emoji}</div>
          <div>
            <h2 className="modal-title" style={{ marginBottom: 0 }}>Prestadores de {typeInfo.label}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Seleciona um prestador para agendar</p>
          </div>
        </div>

        <div style={{ margin: '16px 0', height: 1, background: 'var(--border)' }} />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Spinner dark inline />
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 12 }}>A procurar prestadores…</p>
          </div>
        ) : providers.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Nenhum prestador encontrado"
            body={`Ainda não há prestadores disponíveis para ${typeInfo.label}. Tenta mais tarde!`}
            style={{ padding: '24px 16px' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
            {providers.map(provider => (
              <div key={provider.uid} style={{ border: '1.5px solid var(--border-mid)', borderRadius: 'var(--radius)', padding: '16px', background: 'var(--bg-alt)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--yellow), var(--green-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>
                    {(provider.displayName || 'P')[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{provider.displayName || 'Prestador'}</h4>
                    {(provider.ownerProfile?.location || provider.providerProfile?.location) && (
                      <p style={{ fontSize: 12, color: 'var(--text-3)' }}>📍 {provider.ownerProfile?.location || provider.providerProfile?.location}</p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {provider.matchingServices.map(svc => (
                    <div key={svc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--white)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{svc.title}</p>
                        {svc.desc && <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.desc}</p>}
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginTop: 4, fontFamily: 'var(--font-display)' }}>
                          {svc.price}€<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-3)', fontFamily: 'var(--font-body)' }}>/{svc.unit}</span>
                          {svc.duration && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-3)', fontFamily: 'var(--font-body)', marginLeft: 6 }}>· ⏱ {svc.duration}</span>}
                        </p>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => setBooking({ provider, service: svc })}>🗓 Agendar</Button>
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
  { key: 'pets',     label: '🐾 Os meus pets' },
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

      {ownerTab === 'pets' && <PetSection pets={pets} />}

      {ownerTab === 'explore' && (
        <div className="section">
          <h2 className="section-title">Explorar Serviços</h2>
          <p className="section-sub">Clica numa categoria para ver os prestadores disponíveis.</p>
          <div className="services-grid">
            {SERVICE_TYPES.filter(t => t.key !== 'other').map(s => (
              <div className="service-card" key={s.key} onClick={() => setSelectedType(s)} style={{ cursor: 'pointer' }}>
                <div className="service-card-icon" style={{ background: s.color }}>{s.emoji}</div>
                <h3>{s.label}</h3>
                {s.badge && <span className={`service-badge ${s.badgeClass}`}>{s.badge}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {ownerTab === 'bookings' && <BookingsSection role="owner" />}

      {selectedType && (
        <BrowseProvidersModal serviceType={selectedType} onClose={() => setSelectedType(null)} />
      )}
    </>
  );
}

// ── Provider View ────────────────────────────────────────────────────────────
const PROVIDER_TABS = [
  { key: 'services', label: '🛎️ Os meus serviços' },
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
          { label: 'Reservas este mês', value: bookingCount ?? '0',  change: bookingCount > 0 ? '↑ Activo' : '—' },
          { label: 'Serviços activos',  value: (services ?? []).filter(s => s.available !== false).length.toString(), change: 'Visíveis para clientes' },
          { label: 'Avaliação média',   value: '—', change: 'Conta nova' },
          { label: 'Receita (€)',       value: '0', change: '—' },
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

// ── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { userProfile, currentUser } = useAuth();
  const isOwner    = userProfile?.profileTypes?.includes('owner');
  const isProvider = userProfile?.profileTypes?.includes('provider');
  const isBoth     = isOwner && isProvider;

  const [activeView,   setActiveView]   = useState(isOwner ? 'owner' : 'provider');
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    if (!isProvider || !currentUser) return;
    (async () => {
      try {
        const { getDocs, query, collection, where } = await import('firebase/firestore');
        const q = query(
          collection(db, 'bookings'),
          where('caregiver_id', '==', currentUser.uid),
          where('status', '!=', 'cancelado'),
        );
        const snap = await getDocs(q);
        setBookingCount(snap.size);
      } catch { /* non-critical */ }
    })();
  }, [isProvider, currentUser]);

  const navCenter = isBoth ? (
    <div className="profile-switcher">
      <button className={`switcher-btn ${activeView === 'owner' ? 'active' : ''}`} onClick={() => setActiveView('owner')}>🐾 Pet Owner</button>
      <button className={`switcher-btn ${activeView === 'provider' ? 'active' : ''}`} onClick={() => setActiveView('provider')}>💼 Prestador</button>
    </div>
  ) : null;

  return (
    <MainLayout navCenter={navCenter}>
      {activeView === 'owner'
        ? <OwnerView pets={userProfile?.pets ?? []} displayName={userProfile?.displayName} />
        : <ProviderView displayName={userProfile?.displayName} services={userProfile?.services ?? []} bookingCount={bookingCount} />
      }
    </MainLayout>
  );
}
