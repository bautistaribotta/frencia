import React from 'react';

const CSS = `
.heft-setrow {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: var(--radius-lg);
  background: var(--surface-card); border: 1px solid transparent;
  transition: background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.heft-setrow--active { border-color: var(--surface-green-line); background: var(--surface-card-elevated); }
.heft-setrow--done { background: var(--surface-green-soft); }
.heft-setrow__idx {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-weight: var(--fw-bold); font-size: 13px;
  background: var(--surface-inset); color: var(--text-tertiary);
}
.heft-setrow--active .heft-setrow__idx { background: var(--accent); color: var(--text-on-accent); }
.heft-setrow--done .heft-setrow__idx { background: transparent; color: var(--accent-text); }
.heft-setrow__main { flex: 1; display: flex; align-items: baseline; gap: 8px; }
.heft-setrow__load { font-family: var(--font-mono); font-weight: var(--fw-bold); font-size: 19px; color: var(--text-primary); font-variant-numeric: tabular-nums; }
.heft-setrow__x { font-family: var(--font-mono); color: var(--text-tertiary); font-size: 14px; }
.heft-setrow__reps { font-family: var(--font-mono); font-weight: var(--fw-bold); font-size: 19px; color: var(--text-primary); font-variant-numeric: tabular-nums; }
.heft-setrow__unit { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); margin-left: 2px; }
.heft-setrow__meta { display: flex; align-items: center; gap: 8px; }
.heft-setrow__rir {
  font-family: var(--font-mono); font-weight: var(--fw-semibold); font-size: 11px;
  letter-spacing: var(--ls-wide); text-transform: uppercase;
  padding: 3px 8px; border-radius: var(--radius-sm);
  background: var(--surface-orange-soft); color: var(--intensity-text); border: 1px solid var(--surface-orange-line);
}
.heft-setrow__check {
  width: 36px; height: 36px; flex-shrink: 0; border-radius: var(--radius-md);
  display: inline-flex; align-items: center; justify-content: center;
  border: 1.5px solid var(--border-default); background: transparent; cursor: pointer;
  color: var(--text-tertiary);
  transition: all var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.heft-setrow__check:active { transform: scale(var(--press-scale)); }
.heft-setrow__check svg { width: 20px; height: 20px; stroke-width: 2.5; }
.heft-setrow--done .heft-setrow__check { background: var(--accent); border-color: var(--accent); color: var(--text-on-accent); }
`;

if (typeof document !== 'undefined' && !document.getElementById('heft-setrow-css')) {
  const s = document.createElement('style');
  s.id = 'heft-setrow-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** A single logged set: index · load × reps · RIR · completion toggle. */
export function SetRow({ index, load, reps, unit = 'kg', rir, state = 'pending', onToggle, className = '', ...rest }) {
  const cls = ['heft-setrow', state === 'active' ? 'heft-setrow--active' : '', state === 'done' ? 'heft-setrow--done' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      <span className="heft-setrow__idx">{index}</span>
      <div className="heft-setrow__main">
        <span className="heft-setrow__load">{load}<span className="heft-setrow__unit">{unit}</span></span>
        <span className="heft-setrow__x">×</span>
        <span className="heft-setrow__reps">{reps}<span className="heft-setrow__unit">reps</span></span>
      </div>
      <div className="heft-setrow__meta">
        {rir != null ? <span className="heft-setrow__rir">RIR {rir}</span> : null}
        <button className="heft-setrow__check" onClick={onToggle} aria-label="completar serie">
          <i data-lucide="check"></i>
        </button>
      </div>
    </div>
  );
}
