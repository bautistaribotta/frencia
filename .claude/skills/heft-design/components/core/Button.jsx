import React from 'react';

const CSS = `
.heft-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--space-3);
  font-family: var(--font-sans); font-weight: var(--fw-semibold);
  border: 1px solid transparent; border-radius: var(--radius-md);
  cursor: pointer; white-space: nowrap; text-decoration: none;
  transition: transform var(--dur-fast) var(--ease-spring),
              background var(--dur-base) var(--ease-out),
              box-shadow var(--dur-base) var(--ease-out),
              border-color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent; user-select: none;
}
.heft-btn:active:not(:disabled) { transform: scale(var(--press-scale)); }
.heft-btn:disabled { cursor: not-allowed; opacity: 0.45; }
.heft-btn svg { width: 1.15em; height: 1.15em; stroke-width: 2; }

/* sizes */
.heft-btn--sm { height: var(--control-h-sm); padding: 0 16px; font-size: 14px; }
.heft-btn--md { height: var(--control-h-md); padding: 0 22px; font-size: 16px; }
.heft-btn--lg { height: var(--control-h-lg); padding: 0 28px; font-size: 17px; }
.heft-btn--full { width: 100%; }

/* primary — emerald w/ glow */
.heft-btn--primary { background: var(--accent); color: var(--text-on-accent); box-shadow: var(--glow-green-soft); }
.heft-btn--primary:hover:not(:disabled) { background: var(--accent-hover); box-shadow: var(--glow-green); }
.heft-btn--primary:active:not(:disabled) { background: var(--accent-press); }

/* intensity — orange */
.heft-btn--intensity { background: var(--intensity); color: var(--text-on-accent); }
.heft-btn--intensity:hover:not(:disabled) { background: var(--intensity-hover); box-shadow: var(--glow-orange); }
.heft-btn--intensity:active:not(:disabled) { background: var(--intensity-press); }

/* secondary — outlined surface */
.heft-btn--secondary { background: var(--surface-card); color: var(--text-primary); border-color: var(--border-default); }
.heft-btn--secondary:hover:not(:disabled) { background: var(--surface-card-elevated); border-color: var(--border-strong); }

/* ghost — text only */
.heft-btn--ghost { background: transparent; color: var(--text-secondary); }
.heft-btn--ghost:hover:not(:disabled) { background: var(--surface-chip); color: var(--text-primary); }
`;

if (typeof document !== 'undefined' && !document.getElementById('heft-btn-css')) {
  const s = document.createElement('style');
  s.id = 'heft-btn-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * HEFT primary action button. Black label rides the accent fill.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconRight,
  disabled = false,
  children,
  className = '',
  ...rest
}) {
  const cls = [
    'heft-btn',
    `heft-btn--${variant}`,
    `heft-btn--${size}`,
    fullWidth ? 'heft-btn--full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={cls} disabled={disabled} {...rest}>
      {icon ? <i data-lucide={icon}></i> : null}
      {children ? <span>{children}</span> : null}
      {iconRight ? <i data-lucide={iconRight}></i> : null}
    </button>
  );
}
