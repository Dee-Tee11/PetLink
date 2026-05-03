import React from 'react';

/**
 * EmptyState — wraps .empty-state.
 *
 * Props:
 *   icon     — emoji or JSX
 *   title    — string
 *   body     — string
 *   action   — JSX (optional button / link)
 *   style    — extra styles on the wrapper
 */
export default function EmptyState({ icon, title, body, action, style }) {
  return (
    <div className="empty-state" style={style}>
      {icon && <span className="empty-state-icon">{icon}</span>}
      {title && <h3>{title}</h3>}
      {body  && <p>{body}</p>}
      {action}
    </div>
  );
}
