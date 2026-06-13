import React from 'react';

const CSS = `
.heft-progress { display: flex; flex-direction: column; gap: 8px; }
.heft-progress__head { display: flex; justify-content: space-between; align-items: baseline; }
.heft-progress__label {
  font-family: var(--font-mono); font-weight: var(--fw-medium); font-size: 11px;
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary);
}
.heft-progress__val { font-family: var(--font-mono); font-weight: var(--fw-semibold); font-size: 12px; color: var(--text-secondary); }
.heft-progress__track {
  height: var(--h); background: var(--data-track); border-radius: var(--radius-pill);
  overflow: hidden; box-shadow: var(--shadow-inset);
}
.heft-progress__fill {
  height: 100%; border-radius: var(--radius-pill);
  background: var(--accent); transition: width var(--dur-slow) var(--ease-out);
}
.heft-progress--orange .heft-progress__fill { background: var(--intensity); }
.heft-progress--segmented .heft-progress__track { display: flex; gap: 4px; background: transparent; box-shadow: none; }
.heft-progress__seg { flex: 1; height: 100%; border-radius: var(--radius-sm); background: var(--data-track); }
.heft-progress__seg--on { background: var(--accent); }
.heft-progress--orange .heft-progress__seg--on { background: var(--intensity); }
`;

if (typeof document !== 'undefined' && !document.getElementById('heft-progress-css')) {
  const s = document.createElement('style');
  s.id = 'heft-progress-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Progress / completion bar. Continuous or segmented (e.g. sets done). */
export function ProgressBar({ value = 0, max = 100, label, showValue = false, tone = 'green', size = 'md', segments, className = '', ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const h = size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px';
  const cls = ['heft-progress', tone === 'orange' ? 'heft-progress--orange' : '', segments ? 'heft-progress--segmented' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls} style={{ '--h': h }} {...rest}>
      {(label || showValue) ? (
        <div className="heft-progress__head">
          {label ? <span className="heft-progress__label">{label}</span> : <span></span>}
          {showValue ? <span className="heft-progress__val">{segments ? `${value}/${segments}` : `${Math.round(pct)}%`}</span> : null}
        </div>
      ) : null}
      <div className="heft-progress__track">
        {segments
          ? Array.from({ length: segments }).map((_, i) => (
              <div key={i} className={`heft-progress__seg ${i < value ? 'heft-progress__seg--on' : ''}`}></div>
            ))
          : <div className="heft-progress__fill" style={{ width: `${pct}%` }}></div>}
      </div>
    </div>
  );
}
