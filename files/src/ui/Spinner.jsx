import React from 'react';

/**
 * Spinner — wraps .spinner / .spinner-dark.
 *
 * Props:
 *   dark    — boolean, use dark variant (for light backgrounds)
 *   inline  — boolean, display as inline-block instead of block
 */
export default function Spinner({ dark = false, inline = false, style, ...rest }) {
  return (
    <span
      className={`spinner${dark ? ' spinner-dark' : ''}`}
      style={{ display: inline ? 'inline-block' : 'block', ...style }}
      {...rest}
    />
  );
}
