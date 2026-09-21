import React from 'react';

const CSS = `
.frencia-tag {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-sans); font-weight: var(--fw-medium); font-size: 13px;
  padding: 7px 14px; border-radius: var(--radius-pill);
  background: var(--surface-chip); color: var(--text-secondary);
  border: 1px solid transparent; cursor: default; line-height: 1;
  transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.frencia-tag--selectable { cursor: pointer; }
.frencia-tag--selectable:hover { background: var(--surface-card-elevated); color: var(--text-primary); }
.frencia-tag--selected { background: var(--surface-green-soft); color: var(--accent-text); border-color: var(--surface-green-line); }
.frencia-tag__dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; opacity: 0.9; }
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-tag-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-tag-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Pill tag for muscle groups, categories, filters. */
export function Tag({ selected = false, selectable = false, dot = false, children, className = '', ...rest }) {
  const cls = [
    'frencia-tag',
    selectable ? 'frencia-tag--selectable' : '',
    selected ? 'frencia-tag--selected' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {dot ? <span className="frencia-tag__dot"></span> : null}
      {children}
    </span>
  );
}
