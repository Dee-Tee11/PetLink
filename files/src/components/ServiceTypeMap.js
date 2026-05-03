/**
 * ServiceTypeMap — single source of truth for service type metadata.
 * Consumed by DashboardPage and BookingModal.
 */
export const SERVICE_TYPES = [
  { key: 'grooming',  emoji: '✂️',  label: 'Grooming',     color: 'var(--pink-soft)',   badge: 'Popular',   badgeClass: 'badge-pink',   badgeColor: 'pink'   },
  { key: 'walking',   emoji: '🦮',  label: 'Dog Walking',  color: 'var(--green-soft)',  badge: 'Diário',    badgeClass: 'badge-green',  badgeColor: 'green'  },
  { key: 'sitting',   emoji: '🏠',  label: 'Pet Sitting',  color: 'var(--sky-soft)',    badge: 'Flexível',  badgeClass: 'badge-blue',   badgeColor: 'blue'   },
  { key: 'vet',       emoji: '🩺',  label: 'Consulta Vet', color: 'var(--yellow-soft)', badge: 'Confiável', badgeClass: 'badge-yellow', badgeColor: 'yellow' },
  { key: 'training',  emoji: '🎓',  label: 'Treino',       color: 'var(--green-soft)',  badge: 'Novo',      badgeClass: 'badge-green',  badgeColor: 'green'  },
  { key: 'bath',      emoji: '🚿',  label: 'Bath & Brush', color: 'var(--sky-soft)',    badge: 'Rápido',    badgeClass: 'badge-blue',   badgeColor: 'blue'   },
  { key: 'boarding',  emoji: '🛏️',  label: 'Hospedagem',   color: 'var(--yellow-soft)', badge: 'Seguro',    badgeClass: 'badge-yellow', badgeColor: 'yellow' },
  { key: 'transport', emoji: '🚗',  label: 'Transporte',   color: 'var(--pink-soft)',   badge: 'Door2Door', badgeClass: 'badge-pink',   badgeColor: 'pink'   },
  { key: 'other',     emoji: '🐾',  label: 'Outro',        color: 'var(--green-soft)',  badge: '',          badgeClass: '',             badgeColor: 'green'  },
];

/** Returns the metadata object for a given service key, falling back to 'other'. */
export const getServiceType = (key) =>
  SERVICE_TYPES.find((t) => t.key === key) ?? SERVICE_TYPES[SERVICE_TYPES.length - 1];
