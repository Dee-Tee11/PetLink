import React from 'react';

/** White-on-green logo — used on the Auth page's coloured brand panel */
export const LogoIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.25)" />
    <ellipse cx="15" cy="9"  rx="4"  ry="5"  fill="white" />
    <ellipse cx="25" cy="9"  rx="4"  ry="5"  fill="white" />
    <ellipse cx="8"  cy="17" rx="3"  ry="4"  fill="white" />
    <ellipse cx="32" cy="17" rx="3"  ry="4"  fill="white" />
    <ellipse cx="20" cy="28" rx="10" ry="11" fill="white" />
    <ellipse cx="12" cy="22" rx="5"  ry="6"  fill="white" />
    <ellipse cx="28" cy="22" rx="5"  ry="6"  fill="white" />
  </svg>
);

/** Primary-bg logo — used on light backgrounds (nav, onboarding) */
export const LogoIconDark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="var(--primary)" />
    <ellipse cx="15" cy="9"  rx="4"  ry="5"  fill="white" />
    <ellipse cx="25" cy="9"  rx="4"  ry="5"  fill="white" />
    <ellipse cx="8"  cy="17" rx="3"  ry="4"  fill="white" />
    <ellipse cx="32" cy="17" rx="3"  ry="4"  fill="white" />
    <ellipse cx="20" cy="28" rx="10" ry="11" fill="white" />
    <ellipse cx="12" cy="22" rx="5"  ry="6"  fill="white" />
    <ellipse cx="28" cy="22" rx="5"  ry="6"  fill="white" />
  </svg>
);
