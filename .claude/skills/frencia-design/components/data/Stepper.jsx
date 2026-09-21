import React from 'react';

const CSS = `
.frencia-stepper { display: inline-flex; flex-direction: column; gap: 6px; }
.frencia-stepper__label {
  font-family: var(--font-mono); font-weight: var(--fw-medium); font-size: 11px;
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary);
}
.frencia-stepper__row {
  display: inline-flex; align-items: center; gap: 0;
  background: var(--surface-inset); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md); overflow: hidden;
}
.frencia-stepper__btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 48px; border: none; background: transparent;
  color: var(--text-secondary); cursor: pointer; flex-shrink: 0;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.frencia-stepper__btn:hover:not(:disabled) { background: var(--surface-chip); color: var(--accent); }
.frencia-stepper__btn:active:not(:disabled) { background: var(--surface-card-elevated); }
.frencia-stepper__btn:disabled { opacity: 0.35; cursor: not-allowed; }
.frencia-stepper__btn svg { width: 20px; height: 20px; stroke-width: 2.5; }
.frencia-stepper__val {
  min-width: 64px; text-align: center;
  font-family: var(--font-mono); font-weight: var(--fw-bold); font-size: 22px;
  color: var(--text-primary); font-variant-numeric: tabular-nums;
}
.frencia-stepper__unit { font-size: 12px; color: var(--text-tertiary); margin-left: 3px; font-weight: var(--fw-medium); }
.frencia-stepper--lg .frencia-stepper__val { font-size: 28px; min-width: 80px; }
.frencia-stepper--lg .frencia-stepper__btn { height: 56px; width: 52px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-stepper-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-stepper-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Numeric stepper for logging reps / load. Tabular mono value, ± controls. */
export function Stepper({ label, value, onChange, step = 1, min = 0, max = Infinity, unit, size = 'md', precision = 0, className = '', ...rest }) {
  const set = (next) => {
    const clamped = Math.max(min, Math.min(max, next));
    onChange && onChange(Number(clamped.toFixed(precision)));
  };
  const cls = ['frencia-stepper', `frencia-stepper--${size}`, className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {label ? <span className="frencia-stepper__label">{label}</span> : null}
      <div className="frencia-stepper__row">
        <button className="frencia-stepper__btn" onClick={() => set(value - step)} disabled={value <= min} aria-label="menos">
          <i data-lucide="minus"></i>
        </button>
        <span className="frencia-stepper__val">{value}{unit ? <span className="frencia-stepper__unit">{unit}</span> : null}</span>
        <button className="frencia-stepper__btn" onClick={() => set(value + step)} disabled={value >= max} aria-label="más">
          <i data-lucide="plus"></i>
        </button>
      </div>
    </div>
  );
}
