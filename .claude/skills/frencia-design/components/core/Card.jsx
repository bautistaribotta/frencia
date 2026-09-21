import React from 'react';

const CSS = `
.frencia-card {
  background: var(--surface-card);
  border: 1px solid transparent;
  border-radius: var(--radius-xl);
  padding: var(--pad-card);
  transition: background var(--dur-base) var(--ease-out),
              border-color var(--dur-base) var(--ease-out),
              transform var(--dur-fast) var(--ease-spring);
}
.frencia-card--hairline { border-color: var(--border-subtle); }
.frencia-card--elevated { background: var(--surface-card-elevated); box-shadow: var(--shadow-md); }
.frencia-card--inset { background: var(--surface-inset); }
.frencia-card--green { background: var(--surface-green-soft); border-color: var(--surface-green-line); }
.frencia-card--orange { background: var(--surface-orange-soft); border-color: var(--surface-orange-line); }
.frencia-card--interactive { cursor: pointer; }
.frencia-card--interactive:active { transform: scale(0.99); }
.frencia-card--interactive:hover { border-color: var(--border-default); }
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-card-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-card-css'; s.textContent = CSS;
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
    'frencia-card',
    variant !== 'default' ? `frencia-card--${variant}` : '',
    hairline ? 'frencia-card--hairline' : '',
    interactive ? 'frencia-card--interactive' : '',
    className,
  ].filter(Boolean).join(' ');
  return <div className={cls} {...rest}>{children}</div>;
}
