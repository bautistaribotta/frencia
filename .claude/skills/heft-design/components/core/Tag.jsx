import React from 'react';

const CSS = `
.heft-tag {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-sans); font-weight: var(--fw-medium); font-size: 13px;
  padding: 7px 14px; border-radius: var(--radius-pill);
  background: var(--surface-chip); color: var(--text-secondary);
  border: 1px solid transparent; cursor: default; line-height: 1;
  transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.heft-tag--selectable { cursor: pointer; }
.heft-tag--selectable:hover { background: var(--surface-card-elevated); color: var(--text-primary); }
.heft-tag--selected { background: var(--surface-green-soft); color: var(--accent-text); border-color: var(--surface-green-line); }
.heft-tag__dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; opacity: 0.9; }
`;

if (typeof document !== 'undefined' && !document.getElementById('heft-tag-css')) {
  const s = document.createElement('style');
  s.id = 'heft-tag-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Pill tag for muscle groups, categories, filters. */
export function Tag({ selected = false, selectable = false, dot = false, children, className = '', ...rest }) {
  const cls = [
    'heft-tag',
    selectable ? 'heft-tag--selectable' : '',
    selected ? 'heft-tag--selected' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {dot ? <span className="heft-tag__dot"></span> : null}
      {children}
    </span>
  );
}
