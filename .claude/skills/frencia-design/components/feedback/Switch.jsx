import React from 'react';

const CSS = `
.frencia-switch {
  position: relative; display: inline-flex; align-items: center;
  width: 52px; height: 32px; border-radius: var(--radius-pill);
  background: var(--surface-chip); border: 1px solid var(--border-subtle);
  cursor: pointer; padding: 0; flex-shrink: 0;
  transition: background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.frencia-switch__thumb {
  position: absolute; left: 3px; width: 24px; height: 24px; border-radius: 50%;
  background: var(--ink-100); box-shadow: var(--shadow-sm);
  transition: transform var(--dur-base) var(--ease-spring);
}
.frencia-switch--on { background: var(--accent); border-color: var(--accent); }
.frencia-switch--on .frencia-switch__thumb { transform: translateX(20px); background: var(--ink-1000); }
.frencia-switch:disabled { opacity: 0.4; cursor: not-allowed; }
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-switch-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-switch-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** iOS toggle switch. */
export function Switch({ checked = false, onChange, disabled = false, className = '', ...rest }) {
  const cls = ['frencia-switch', checked ? 'frencia-switch--on' : '', className].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cls}
      disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      {...rest}
    >
      <span className="frencia-switch__thumb"></span>
    </button>
  );
}
