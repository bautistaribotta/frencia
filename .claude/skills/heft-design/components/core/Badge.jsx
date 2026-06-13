import React from 'react';

const CSS = `
.heft-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-weight: var(--fw-semibold);
  font-size: 11px; letter-spacing: var(--ls-wide); text-transform: uppercase;
  padding: 4px 9px; border-radius: var(--radius-sm);
  border: 1px solid transparent; line-height: 1; white-space: nowrap;
}
.heft-badge svg { width: 12px; height: 12px; stroke-width: 2.25; }
.heft-badge--neutral { background: var(--surface-chip); color: var(--text-secondary); }
.heft-badge--green { background: var(--surface-green-soft); color: var(--accent-text); border-color: var(--surface-green-line); }
.heft-badge--green-solid { background: var(--accent); color: var(--text-on-accent); }
.heft-badge--orange { background: var(--surface-orange-soft); color: var(--intensity-text); border-color: var(--surface-orange-line); }
.heft-badge--orange-solid { background: var(--intensity); color: var(--text-on-accent); }
.heft-badge--danger { background: rgba(239,68,68,0.12); color: #FCA5A5; border-color: rgba(239,68,68,0.3); }
`;

if (typeof document !== 'undefined' && !document.getElementById('heft-badge-css')) {
  const s = document.createElement('style');
  s.id = 'heft-badge-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Compact status marker — RIR, PR, set type, state. Mono, uppercase. */
export function Badge({ tone = 'neutral', icon, children, className = '', ...rest }) {
  const cls = ['heft-badge', `heft-badge--${tone}`, className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {icon ? <i data-lucide={icon}></i> : null}
      {children}
    </span>
  );
}
