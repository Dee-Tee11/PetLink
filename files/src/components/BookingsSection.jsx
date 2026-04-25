import React, { useState, useEffect } from 'react';
import {
  collection, query, where, getDocs, doc, updateDoc, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  pendente:    { label: 'Pendente',    bg: 'var(--yellow-soft)', color: '#7A6A1A' },
  confirmado:  { label: 'Confirmado',  bg: 'var(--green-soft)',  color: '#4A7A3A' },
  cancelado:   { label: 'Cancelado',   bg: 'var(--pink-soft)',   color: '#B04060' },
  concluido:   { label: 'Concluído',   bg: 'var(--sky-soft)',    color: '#3A6A9A' },
};

const SERVICE_EMOJI = {
  grooming: '✂️', walking: '🦮', sitting: '🏠', vet: '🩺',
  training: '🎓', bath: '🚿', boarding: '🛏️', transport: '🚗', other: '🐾',
};

function BookingCard({ booking, onCancel, role }) {
  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pendente;
  const emoji  = SERVICE_EMOJI[booking.service_type] ?? '🐾';

  const formatDate = (d) => {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  return (
    <div style={{
      background: 'var(--white)', border: '1.5px solid var(--border-mid)',
      borderRadius: 'var(--radius-lg)', padding: '18px 20px',
      display: 'flex', gap: 16, alignItems: 'flex-start',
      transition: 'box-shadow var(--ease)',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-alt)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 22, flexShrink: 0,
      }}>{emoji}</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              {booking.service_title}
            </h4>
            <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
              {role === 'owner'
                ? `Com ${booking.caregiver_name || 'Prestador'}`
                : `De ${booking.owner_name || 'Cliente'}`}
              {booking.pet_name ? ` · 🐾 ${booking.pet_name}` : ''}
            </p>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            background: status.bg, color: status.color, flexShrink: 0,
          }}>{status.label}</span>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>📅 {formatDate(booking.date)}</span>
          {booking.time && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>🕐 {booking.time}</span>}
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
            {booking.price}€/{booking.unit}
          </span>
        </div>

        {booking.notes && (
          <p style={{
            fontSize: 12, color: 'var(--text-3)', marginTop: 6,
            fontStyle: 'italic', lineHeight: 1.5,
          }}>"{booking.notes}"</p>
        )}

        {/* Actions */}
        {booking.status === 'pendente' && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {role === 'provider' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onCancel(booking.id, 'confirmado')}
              >✓ Confirmar</button>
            )}
            <button
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
              onClick={() => onCancel(booking.id, 'cancelado')}
            >✕ Cancelar</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingsSection({ role = 'owner' }) {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  const fetchBookings = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const field = role === 'owner' ? 'owner_id' : 'caregiver_id';
      const q = query(
        collection(db, 'bookings'),
        where(field, '==', currentUser.uid),
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by date desc client-side (avoids composite index requirement)
      list.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
      setBookings(list);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [currentUser, role]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error('Error updating booking:', err);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  const filters = [
    { key: 'all',       label: `Todos (${bookings.length})` },
    { key: 'pendente',  label: `Pendente${counts.pendente ? ` (${counts.pendente})` : ''}` },
    { key: 'confirmado',label: `Confirmado${counts.confirmado ? ` (${counts.confirmado})` : ''}` },
    { key: 'concluido', label: `Concluído${counts.concluido ? ` (${counts.concluido})` : ''}` },
    { key: 'cancelado', label: `Cancelado${counts.cancelado ? ` (${counts.cancelado})` : ''}` },
  ];

  return (
    <div className="section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          {role === 'owner' ? 'As minhas reservas' : 'Reservas recebidas'}
        </h2>
        <button className="btn btn-secondary btn-sm" onClick={fetchBookings}>↻ Atualizar</button>
      </div>
      <p className="section-sub">
        {role === 'owner'
          ? 'Historial de reservas e agendamentos activos.'
          : 'Pedidos de reserva dos clientes.'}
      </p>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: '1.5px solid',
              borderColor: filter === f.key ? 'var(--primary)' : 'var(--border-mid)',
              background: filter === f.key ? 'var(--primary-soft)' : 'var(--white)',
              color: filter === f.key ? 'var(--text)' : 'var(--text-3)',
              cursor: 'pointer', transition: 'all var(--ease)',
            }}
          >{f.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <span className="spinner spinner-dark" style={{ display: 'inline-block' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📅</span>
          <h3>{filter === 'all' ? 'Sem reservas ainda' : `Nenhuma reserva "${filter}"`}</h3>
          <p>
            {role === 'owner'
              ? 'Explora os serviços disponíveis e faz a tua primeira reserva!'
              : 'Quando tiveres reservas, aparecerão aqui.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(b => (
            <BookingCard
              key={b.id}
              booking={b}
              role={role}
              onCancel={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
