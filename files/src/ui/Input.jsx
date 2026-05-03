import React from 'react';

/**
 * Input — wraps .input-field with an optional label and error message.
 *
 * Props:
 *   label      — string label rendered above the field
 *   error      — string error message rendered below the field
 *   as         — 'input' | 'textarea' | 'select' (default: 'input')
 *   All other props forwarded to the underlying element
 */
export default function Input({ label, error, as: Tag = 'input', className = '', children, ...rest }) {
  return (
    <div className="field-group">
      {label && <label className="label">{label}</label>}
      <Tag className={`input-field ${className}`} {...rest}>
        {children}
      </Tag>
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}
