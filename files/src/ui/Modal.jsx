import React from 'react';

/**
 * Modal — standard overlay + box.
 *
 * Props:
 *   onClose    — called when backdrop is clicked
 *   maxWidth   — CSS max-width for the box (default: '380px')
 *   style      — extra styles for the inner box
 *   children   — modal body content
 *   noBox      — boolean, render children directly inside overlay (for custom layouts)
 */
export default function Modal({ onClose, maxWidth = '380px', style, children, noBox = false }) {
  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      {noBox ? (
        children
      ) : (
        <div
          className="modal-box"
          style={{ maxWidth, width: '100%', ...style }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}
