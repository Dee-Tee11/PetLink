import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoIconDark } from './AuthPage';

/* ── Species emoji helper ── */
const speciesEmoji = (s) =>
  ({ dog:'🐕', cat:'🐈', rabbit:'🐇', bird:'🐦', fish:'🐟', other:'🐾' }[s] ?? '🐾');

/* ── Sample services for MVP browsing ── */
const BROWSE_SERVICES = [
  { icon:'✂️',  color:'#FFF0E8', title:'Grooming',      desc:'Full grooming, baths, nail trims & styling.', badge:'Popular', badgeClass:'badge-orange' },
  { icon:'🦮',  color:'#EDF5EE', title:'Dog Walking',   desc:'Daily or on-demand walks with GPS tracking.',  badge:'Daily',   badgeClass:'badge-green'  },
  { icon:'🏠',  color:'#EAF0FF', title:'Pet Sitting',   desc:'In-home care while you\'re away.',             badge:'Flexible',badgeClass:'badge-blue'   },
  { icon:'🩺',  color:'#FFF0E8', title:'Vet Visits',    desc:'Vaccinations, check-ups & health advice.',     badge:'Trusted', badgeClass:'badge-orange' },
  { icon:'🎓',  color:'#EDF5EE', title:'Training',      desc:'Obedience, socialisation & trick training.',   badge:'New',     badgeClass:'badge-green'  },
  { icon:'🚿',  color:'#EAF0FF', title:'Bath & Brush',  desc:'Quick refresh baths between grooming sessions.',badge:'Quick',  badgeClass:'badge-blue'   },
];

import MainLayout from '../components/MainLayout';

/* ── Owner view ── */
function OwnerView({ pets, displayName }) {
  const firstName = displayName?.split(' ')[0] || 'there';

  return (
    <>
      <div className="dashboard-welcome">
        <h1>Hey, {firstName} 👋</h1>
        <p>Welcome to your PetLink dashboard. Find the best care for your furry family.</p>
      </div>

      {/* My Pets */}
      <div className="section">
        <h2 className="section-title">My Pets</h2>
        <p className="section-sub">Your pet profiles — providers will see this when you book.</p>
        <div className="pets-grid">
          {pets.map(pet => (
            <div className="pet-card" key={pet.id}>
              <div className="pet-card-emoji">{speciesEmoji(pet.species)}</div>
              <h3>{pet.name}</h3>
              <p>{pet.breed || pet.species}{pet.age != null ? `, ${pet.age} yr${pet.age !== 1 ? 's' : ''}` : ''}</p>
              <span className="tag" style={{ marginTop:4 }}>{pet.species}</span>
            </div>
          ))}
          <div className="pet-card pet-card-add" onClick={() => alert('Coming soon: add a pet from dashboard')}>
            <div style={{ fontSize:28 }}>+</div>
            <p style={{ fontSize:14, fontWeight:500 }}>Add a pet</p>
          </div>
        </div>
      </div>

      {/* Browse Services */}
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

/* ── Provider view ── */
function ProviderView({ displayName }) {
  const firstName = displayName?.split(' ')[0] || 'there';

  return (
    <>
      <div className="dashboard-welcome">
        <h1>Your Business, {firstName} 🚀</h1>
        <p>Manage your services and grow your pet care business.</p>
      </div>

      {/* Quick stats */}
      <div className="stats-row">
        {[
          { label:'Bookings this month', value:'0',   change:'—' },
          { label:'Profile views',       value:'0',   change:'—' },
          { label:'Avg. rating',         value:'—',   change:'New account' },
          { label:'Revenue (€)',         value:'0',   change:'—' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <span className="stat-card-label">{s.label}</span>
            <span className="stat-card-value">{s.value}</span>
            <span className="stat-card-change">{s.change}</span>
          </div>
        ))}
      </div>

      {/* My Services */}
      <div className="section">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
          <h2 className="section-title" style={{ marginBottom:0 }}>My Services</h2>
          <button className="btn btn-primary btn-sm" onClick={() => alert('Coming soon: add a service')}>
            + Add Service
          </button>
        </div>
        <p className="section-sub">Services you offer to pet owners.</p>
        <div className="empty-state">
          <span className="empty-state-icon">🛎️</span>
          <h3>No services yet</h3>
          <p>Add the services you offer — grooming, walking, training and more — so pet owners can find and book you.</p>
          <button className="btn btn-primary" onClick={() => alert('Coming soon')}>Add your first service</button>
        </div>
      </div>

      {/* Upcoming Bookings */}
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

/* ── Main Dashboard ── */
export default function DashboardPage() {
  const { userProfile, logout } = useAuth();

  const isOwner    = userProfile?.profileTypes?.includes('owner');
  const isProvider = userProfile?.profileTypes?.includes('provider');
  const isBoth     = isOwner && isProvider;

  const navCenter = isBoth ? (
    <div className="profile-switcher">
      <button className={`switcher-btn ${activeView === 'owner' ? 'active' : ''}`} onClick={() => setActiveView('owner')}>
        🐾 Pet Owner
      </button>
      <button className={`switcher-btn ${activeView === 'provider' ? 'active' : ''}`} onClick={() => setActiveView('provider')}>
        💼 Provider
      </button>
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
