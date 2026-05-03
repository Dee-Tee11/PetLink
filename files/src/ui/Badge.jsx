import React from 'react';

/**
 * Badge — wraps .service-badge colour variants.
 *
 * Props:
 *   color — 'green' | 'pink' | 'blue' | 'yellow'
 */
export default function Badge({ color = 'green', children, className = '', ...rest }) {
  return (
    <span className={`service-badge badge-${color} ${className}`} {...rest}>
      {children}
    </span>
  );
}
