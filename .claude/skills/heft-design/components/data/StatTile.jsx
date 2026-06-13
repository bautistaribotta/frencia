import React from 'react';

const CSS = `
.heft-stat { display: flex; flex-direction: column; gap: 6px; }
.heft-stat__label {
  font-family: var(--font-mono); font-weight: var(--fw-medium); font-size: 11px;
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary);
}
.heft-stat__value {
  font-family: var(--font-display); color: var(--text-primary);
  line-height: 0.9; display: flex; align-items: baseline; gap: 6px;
}
.heft-stat--green .heft-stat__value { color: var(--accent); }
.heft-stat--orange .heft-stat__value { color: var(--intensity); }
.heft-stat__unit { font-family: var(--font-mono); font-weight: var(--fw-medium); color: var(--text-tertiary); }
.heft-stat--sm .heft-stat__value { font-size: 32px; } .heft-stat--sm .heft-stat__unit { font-size: 13px; }
.heft-stat--md .heft-stat__value { font-size: 48px; } .heft-stat--md .heft-stat__unit { font-size: 16px; }
.heft-stat--lg .heft-stat__value { font-size: 72px; } .heft-stat--lg .heft-stat__unit { font-size: 20px; }
.heft-stat--xl .heft-stat__value { font-size: 92px; } .heft-stat--xl .heft-stat__unit { font-size: 24px; }
.heft-stat__delta {
  display: inline-flex; align-items: center; gap: 3px;
  font-family: var(--font-mono); font-weight: var(--fw-semibold); font-size: 13px;
}
.heft-stat__delta--up { color: var(--accent-text); }
.heft-stat__delta--down { color: #FCA5A5; }
.heft-stat__delta svg { width: 13px; height: 13px; stroke-width: 2.5; }
`;

if (typeof document !== 'undefined' && !document.getElementById('heft-stat-css')) {
  const s = document.createElement('style');
  s.id = 'heft-stat-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Big-number data display — HEFT's signature metric. Anton numerals + mono caption. */
export function StatTile({ label, value, unit, delta, deltaDir, size = 'md', tone = 'default', className = '', ...rest }) {
  const cls = ['heft-stat', `heft-stat--${size}`, tone !== 'default' ? `heft-stat--${tone}` : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {label ? <span className="heft-stat__label">{label}</span> : null}
      <span className="heft-stat__value">
        {value}{unit ? <span className="heft-stat__unit">{unit}</span> : null}
        {delta != null ? (
          <span className={`heft-stat__delta heft-stat__delta--${deltaDir === 'down' ? 'down' : 'up'}`}>
            <i data-lucide={deltaDir === 'down' ? 'arrow-down-right' : 'arrow-up-right'}></i>{delta}
          </span>
        ) : null}
      </span>
    </div>
  );
}
