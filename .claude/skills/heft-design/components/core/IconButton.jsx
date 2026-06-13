import React from 'react';

const CSS = `
.heft-iconbtn {
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid transparent; cursor: pointer;
  border-radius: var(--radius-md);
  transition: transform var(--dur-fast) var(--ease-spring),
              background var(--dur-base) var(--ease-out),
              border-color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.heft-iconbtn:active:not(:disabled) { transform: scale(var(--press-scale)); }
.heft-iconbtn:disabled { opacity: 0.4; cursor: not-allowed; }
.heft-iconbtn svg { stroke-width: 2; }
.heft-iconbtn--round { border-radius: var(--radius-circle); }

.heft-iconbtn--sm { width: 36px; height: 36px; }
.heft-iconbtn--sm svg { width: 18px; height: 18px; }
.heft-iconbtn--md { width: 44px; height: 44px; }
.heft-iconbtn--md svg { width: 22px; height: 22px; }
.heft-iconbtn--lg { width: 52px; height: 52px; }
.heft-iconbtn--lg svg { width: 26px; height: 26px; }

.heft-iconbtn--primary { background: var(--accent); color: var(--text-on-accent); box-shadow: var(--glow-green-soft); }
.heft-iconbtn--primary:hover:not(:disabled) { background: var(--accent-hover); }
.heft-iconbtn--surface { background: var(--surface-chip); color: var(--text-primary); border-color: var(--border-subtle); }
.heft-iconbtn--surface:hover:not(:disabled) { background: var(--surface-card-elevated); }
.heft-iconbtn--ghost { background: transparent; color: var(--text-secondary); }
.heft-iconbtn--ghost:hover:not(:disabled) { background: var(--surface-chip); color: var(--text-primary); }
`;

if (typeof document !== 'undefined' && !document.getElementById('heft-iconbtn-css')) {
  const s = document.createElement('style');
  s.id = 'heft-iconbtn-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Square/round icon-only button. */
export function IconButton({
  icon,
  variant = 'surface',
  size = 'md',
  round = false,
  disabled = false,
  className = '',
  ...rest
}) {
  const cls = [
    'heft-iconbtn',
    `heft-iconbtn--${variant}`,
    `heft-iconbtn--${size}`,
    round ? 'heft-iconbtn--round' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button className={cls} disabled={disabled} {...rest}>
      <i data-lucide={icon}></i>
    </button>
  );
}
