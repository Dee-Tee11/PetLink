import React from 'react';

/**
 * TabBar — reusable underline tab navigation.
 *
 * Props:
 *   tabs      — array of { key: string, label: string }
 *   activeKey — the currently active tab key
 *   onChange  — (key: string) => void
 */
export default function TabBar({ tabs, activeKey, onChange }) {
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-bar__btn${activeKey === tab.key ? ' active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
