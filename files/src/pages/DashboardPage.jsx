import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
import PetSection from '../components/PetSection';

const BROWSE_SERVICES = [
  { icon:'✂️',  color:'var(--pink-soft)',    title:'Grooming',     desc:'Full grooming, baths, nail trims & styling.',    badge:'Popular',  badgeClass:'badge-pink'   },
  { icon:'🦮',  color:'var(--green-soft)',   title:'Dog Walking',  desc:'Daily or on-demand walks with GPS tracking.',    badge:'Daily',    badgeClass:'badge-green'  },
  { icon:'🏠',  color:'var(--sky-soft)',     title:'Pet Sitting',  desc:"In-home care while you're away.",                badge:'Flexible', badgeClass:'badge-blue'   },
  { icon:'🩺',  color:'var(--yellow-soft)',  title:'Vet Visits',   desc:'Vaccinations, check-ups & health advice.',       badge:'Trusted',  badgeClass:'badge-yellow' },
  { icon:'🎓',  color:'var(--green-soft)',   title:'Training',     desc:'Obedience, socialisation & trick training.',     badge:'New',      badgeClass:'badge-green'  },
  { icon:'🚿',  color:'var(--sky-soft)',     title:'Bath & Brush', desc:'Quick refresh baths between grooming sessions.', badge:'Quick',    badgeClass:'badge-blue'   },
];

function OwnerView({ pets, displayName }) {
  const firstName = displayName?.split(' ')[0] || 'there';
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
            <div className="service-card" key={s.title} onClick={() => alert('Coming soon: browse providers')}>
              <div className="service-card-icon" style={{ background: s.color }}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className={`service-badge ${s.badgeClass}`}>{s.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ProviderView({ displayName }) {
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
      <div className="section">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
          <h2 className="section-title" style={{ marginBottom:0 }}>My Services</h2>
          <button className="btn btn-primary btn-sm" onClick={() => alert('Coming soon')}>+ Add Service</button>
        </div>
        <p className="section-sub">Services you offer to pet owners.</p>
        <div className="empty-state">
          <span className="empty-state-icon">🛎️</span>
          <h3>No services yet</h3>
          <p>Add the services you offer so pet owners can find and book you.</p>
          <button className="btn btn-primary" style={{ marginTop:4 }} onClick={() => alert('Coming soon')}>Add your first service</button>
        </div>
      </div>
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
        : <ProviderView displayName={userProfile?.displayName} />
      }
    </MainLayout>
  );
}
