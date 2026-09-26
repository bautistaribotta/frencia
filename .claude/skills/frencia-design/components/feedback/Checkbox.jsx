import React from 'react';

const CSS = `
.frencia-checkbox {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: var(--radius-sm);
  background: transparent; border: 1.5px solid var(--border-default);
  padding: 0; flex-shrink: 0; cursor: pointer;
  transition: background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.frencia-checkbox--static { cursor: default; }
.frencia-checkbox--on { background: var(--surface-green-soft); border-color: var(--surface-green-line); color: var(--accent-text); }
.frencia-checkbox svg { width: 16px; height: 16px; }
.frencia-checkbox:disabled { opacity: 0.4; cursor: not-allowed; }
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-checkbox-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-checkbox-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Square checkbox. Checked = soft green, same as the history "done" mark. Without onChange it is a static indicator. */
export function Checkbox({ checked = false, onChange, disabled = false, className = '', ...rest }) {
  const cls = [
    'frencia-checkbox',
    checked ? 'frencia-checkbox--on' : '',
    onChange ? '' : 'frencia-checkbox--static',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={cls}
      disabled={disabled}
      tabIndex={onChange ? undefined : -1}
      onClick={() => !disabled && onChange && onChange(!checked)}
      {...rest}
    >
      {checked ? <Check /> : null}
    </button>
  );
}
