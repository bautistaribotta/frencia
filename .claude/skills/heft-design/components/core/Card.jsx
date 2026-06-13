import React from 'react';

const CSS = `
.heft-card {
  background: var(--surface-card);
  border: 1px solid transparent;
  border-radius: var(--radius-xl);
  padding: var(--pad-card);
  transition: background var(--dur-base) var(--ease-out),
              border-color var(--dur-base) var(--ease-out),
              transform var(--dur-fast) var(--ease-spring);
}
.heft-card--hairline { border-color: var(--border-subtle); }
.heft-card--elevated { background: var(--surface-card-elevated); box-shadow: var(--shadow-md); }
.heft-card--inset { background: var(--surface-inset); }
.heft-card--green { background: var(--surface-green-soft); border-color: var(--surface-green-line); }
.heft-card--orange { background: var(--surface-orange-soft); border-color: var(--surface-orange-line); }
.heft-card--interactive { cursor: pointer; }
.heft-card--interactive:active { transform: scale(0.99); }
.heft-card--interactive:hover { border-color: var(--border-default); }
`;

if (typeof document !== 'undefined' && !document.getElementById('heft-card-css')) {
  const s = document.createElement('style');
  s.id = 'heft-card-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Surface container — the base building block for grouped content. */
export function Card({
  variant = 'default',
  hairline = false,
  interactive = false,
  className = '',
  children,
  ...rest
}) {
  const cls = [
    'heft-card',
    variant !== 'default' ? `heft-card--${variant}` : '',
    hairline ? 'heft-card--hairline' : '',
    interactive ? 'heft-card--interactive' : '',
    className,
  ].filter(Boolean).join(' ');
  return <div className={cls} {...rest}>{children}</div>;
}
