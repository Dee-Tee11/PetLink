import React from 'react';

/**
 * Button — wraps the .btn CSS class system.
 *
 * Props:
 *   variant  — 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger' | 'google'
 *   size     — 'lg' | 'sm' | 'xs' | undefined (default)
 *   full     — boolean, adds btn-full
 *   loading  — boolean, replaces children with an inline spinner
 *   All other <button> props are forwarded (onClick, disabled, type, style, …)
 */
export default function Button({
  variant = 'primary',
  size,
  full = false,
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size ? `btn-${size}` : '',
    full ? 'btn-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading
        ? <span className={`spinner${variant === 'secondary' || variant === 'ghost' ? ' spinner-dark' : ''}`} />
        : children}
    </button>
  );
}
