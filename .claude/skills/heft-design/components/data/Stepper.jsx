import React from 'react';

const CSS = `
.heft-stepper { display: inline-flex; flex-direction: column; gap: 6px; }
.heft-stepper__label {
  font-family: var(--font-mono); font-weight: var(--fw-medium); font-size: 11px;
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary);
}
.heft-stepper__row {
  display: inline-flex; align-items: center; gap: 0;
  background: var(--surface-inset); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md); overflow: hidden;
}
.heft-stepper__btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 48px; border: none; background: transparent;
  color: var(--text-secondary); cursor: pointer; flex-shrink: 0;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.heft-stepper__btn:hover:not(:disabled) { background: var(--surface-chip); color: var(--accent); }
.heft-stepper__btn:active:not(:disabled) { background: var(--surface-card-elevated); }
.heft-stepper__btn:disabled { opacity: 0.35; cursor: not-allowed; }
.heft-stepper__btn svg { width: 20px; height: 20px; stroke-width: 2.5; }
.heft-stepper__val {
  min-width: 64px; text-align: center;
  font-family: var(--font-mono); font-weight: var(--fw-bold); font-size: 22px;
  color: var(--text-primary); font-variant-numeric: tabular-nums;
}
.heft-stepper__unit { font-size: 12px; color: var(--text-tertiary); margin-left: 3px; font-weight: var(--fw-medium); }
.heft-stepper--lg .heft-stepper__val { font-size: 28px; min-width: 80px; }
.heft-stepper--lg .heft-stepper__btn { height: 56px; width: 52px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('heft-stepper-css')) {
  const s = document.createElement('style');
  s.id = 'heft-stepper-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Numeric stepper for logging reps / load. Tabular mono value, ± controls. */
export function Stepper({ label, value, onChange, step = 1, min = 0, max = Infinity, unit, size = 'md', precision = 0, className = '', ...rest }) {
  const set = (next) => {
    const clamped = Math.max(min, Math.min(max, next));
    onChange && onChange(Number(clamped.toFixed(precision)));
  };
  const cls = ['heft-stepper', `heft-stepper--${size}`, className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {label ? <span className="heft-stepper__label">{label}</span> : null}
      <div className="heft-stepper__row">
        <button className="heft-stepper__btn" onClick={() => set(value - step)} disabled={value <= min} aria-label="menos">
          <i data-lucide="minus"></i>
        </button>
        <span className="heft-stepper__val">{value}{unit ? <span className="heft-stepper__unit">{unit}</span> : null}</span>
        <button className="heft-stepper__btn" onClick={() => set(value + step)} disabled={value >= max} aria-label="más">
          <i data-lucide="plus"></i>
        </button>
      </div>
    </div>
  );
}
