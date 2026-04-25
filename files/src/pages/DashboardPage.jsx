import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import MainLayout from '../components/MainLayout';
import PetSection from '../components/PetSection';
import ServiceSection from '../components/ServiceSection';

const BROWSE_SERVICES = [
  { type: 'grooming', icon:'✂️',  color:'var(--pink-soft)',    title:'Grooming',     desc:'Full grooming, baths, nail trims & styling.',    badge:'Popular',  badgeClass:'badge-pink'   },
  { type: 'walking',  icon:'🦮',  color:'var(--green-soft)',   title:'Dog Walking',  desc:'Daily or on-demand walks with GPS tracking.',    badge:'Daily',    badgeClass:'badge-green'  },
  { type: 'sitting',  icon:'🏠',  color:'var(--sky-soft)',     title:'Pet Sitting',  desc:"In-home care while you're away.",                badge:'Flexible', badgeClass:'badge-blue'   },
  { type: 'vet',      icon:'🩺',  color:'var(--yellow-soft)',  title:'Vet Visits',   desc:'Vaccinations, check-ups & health advice.',       badge:'Trusted',  badgeClass:'badge-yellow' },
  { type: 'training', icon:'🎓',  color:'var(--green-soft)',   title:'Training',     desc:'Obedience, socialisation & trick training.',     badge:'New',      badgeClass:'badge-green'  },
  { type: 'bath',     icon:'🚿',  color:'var(--sky-soft)',     title:'Bath & Brush', desc:'Quick refresh baths between grooming sessions.', badge:'Quick',    badgeClass:'badge-blue'   },
];

function BrowseProvidersModal({ service, onClose }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const q = query(collection(db, 'users'), where('profileTypes', 'array-contains', 'provider'));
        const snap = await getDocs(q);
        const fetched = [];
        snap.forEach(doc => {
          const user = doc.data();
          const matchingService = user.services?.find(s => s.type === service.type && s.available !== false);
          if (matchingService) {
            fetched.push({ ...user, matchingService });
          }
        });
        setProviders(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProviders();
  }, [service]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Providers for {service.title}</h2>
        <p className="modal-sub">Professionals offering {service.title.toLowerCase()} services.</p>

        {loading ? (
          <div style={{ textAlign:'center', padding: '20px 0' }}>
            <span className="spinner spinner-dark" style={{ display:'inline-block' }} />
          </div>
        ) : providers.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px' }}>
            <p>No providers found yet.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap: 12, maxHeight: '300px', overflowY:'auto' }}>
            {providers.map((p, i) => (
              <div key={p.uid || i} style={{ border:'1.5px solid var(--border-mid)', borderRadius:'var(--radius-sm)', padding:'12px', display:'flex', alignItems:'center', gap:'12px' }}>
                <div className="nav-avatar" style={{ flexShrink:0 }}>
                  {(p.displayName || 'P')[0].toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontSize:15, color:'var(--text)', margin:0 }}>{p.displayName || 'Provider'}</h4>
                  <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>{p.matchingService.title} · {p.matchingService.price}€/{p.matchingService.unit}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function OwnerView({ pets, displayName }) {
  const firstName = displayName?.split(' ')[0] || 'there';
  const [selectedService, setSelectedService] = useState(null);

  return (
    <>
      <div className="dashboard-welcome">
        <h1>Hey, {firstName} 👋</h1>
        <p>Welcome to your PetLink dashboard. Find the best care for your furry family.</p>
      </div>
      <PetSection pets={pets} />
      <div className="section">
        <h2 className="section-title">Explore Services</h2>
        <p className="section-sub">Find the right professionals for your pets.</p>
        <div className="services-grid">
          {BROWSE_SERVICES.map(s => (
            <div className="service-card" key={s.title} onClick={() => setSelectedService(s)}>
              <div className="service-card-icon" style={{ background: s.color }}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className={`service-badge ${s.badgeClass}`}>{s.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedService && (
        <BrowseProvidersModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}
    </>
  );
}

function ProviderView({ displayName, services }) {
  const firstName = displayName?.split(' ')[0] || 'there';
  return (
    <>
      <div className="dashboard-welcome">
        <h1>Your Business, {firstName} 🚀</h1>
        <p>Manage your services and grow your pet care business.</p>
      </div>
      <div className="stats-row">
        {[
          { label:'Bookings this month', value:'0', change:'—' },
          { label:'Profile views',       value:'0', change:'—' },
          { label:'Avg. rating',         value:'—', change:'New account' },
          { label:'Revenue (€)',         value:'0', change:'—' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <span className="stat-card-label">{s.label}</span>
            <span className="stat-card-value">{s.value}</span>
            <span className="stat-card-change">{s.change}</span>
          </div>
        ))}
      </div>

      <ServiceSection services={services} />

      <div className="section">
        <h2 className="section-title">Upcoming Bookings</h2>
        <p className="section-sub">Your scheduled appointments.</p>
        <div className="empty-state">
          <span className="empty-state-icon">📅</span>
          <h3>No upcoming bookings</h3>
          <p>Once you add services and get discovered, your bookings will appear here.</p>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const isOwner    = userProfile?.profileTypes?.includes('owner');
  const isProvider = userProfile?.profileTypes?.includes('provider');
  const isBoth     = isOwner && isProvider;
  const [activeView, setActiveView] = useState(isOwner ? 'owner' : 'provider');

  const navCenter = isBoth ? (
    <div className="profile-switcher">
      <button className={`switcher-btn ${activeView === 'owner' ? 'active' : ''}`} onClick={() => setActiveView('owner')}>🐾 Pet Owner</button>
      <button className={`switcher-btn ${activeView === 'provider' ? 'active' : ''}`} onClick={() => setActiveView('provider')}>💼 Provider</button>
    </div>
  ) : null;

  return (
    <MainLayout navCenter={navCenter}>
      {activeView === 'owner'
        ? <OwnerView pets={userProfile?.pets ?? []} displayName={userProfile?.displayName} />
        : <ProviderView displayName={userProfile?.displayName} services={userProfile?.services ?? []} />
      }
    </MainLayout>
  );
}
