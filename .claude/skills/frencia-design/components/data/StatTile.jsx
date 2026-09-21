import React from 'react';

const CSS = `
.frencia-stat { display: flex; flex-direction: column; gap: 6px; }
.frencia-stat__label {
  font-family: var(--font-mono); font-weight: var(--fw-medium); font-size: 11px;
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary);
}
.frencia-stat__value {
  font-family: var(--font-display); color: var(--text-primary);
  line-height: 0.9; display: flex; align-items: baseline; gap: 6px;
}
.frencia-stat--green .frencia-stat__value { color: var(--accent); }
.frencia-stat--orange .frencia-stat__value { color: var(--intensity); }
.frencia-stat__unit { font-family: var(--font-mono); font-weight: var(--fw-medium); color: var(--text-tertiary); }
.frencia-stat--sm .frencia-stat__value { font-size: 32px; } .frencia-stat--sm .frencia-stat__unit { font-size: 13px; }
.frencia-stat--md .frencia-stat__value { font-size: 48px; } .frencia-stat--md .frencia-stat__unit { font-size: 16px; }
.frencia-stat--lg .frencia-stat__value { font-size: 72px; } .frencia-stat--lg .frencia-stat__unit { font-size: 20px; }
.frencia-stat--xl .frencia-stat__value { font-size: 92px; } .frencia-stat--xl .frencia-stat__unit { font-size: 24px; }
.frencia-stat__delta {
  display: inline-flex; align-items: center; gap: 3px;
  font-family: var(--font-mono); font-weight: var(--fw-semibold); font-size: 13px;
}
.frencia-stat__delta--up { color: var(--accent-text); }
.frencia-stat__delta--down { color: #FCA5A5; }
.frencia-stat__delta svg { width: 13px; height: 13px; stroke-width: 2.5; }
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-stat-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-stat-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Big-number data display — Frencia's signature metric. Anton numerals + mono caption. */
export function StatTile({ label, value, unit, delta, deltaDir, size = 'md', tone = 'default', className = '', ...rest }) {
  const cls = ['frencia-stat', `frencia-stat--${size}`, tone !== 'default' ? `frencia-stat--${tone}` : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {label ? <span className="frencia-stat__label">{label}</span> : null}
      <span className="frencia-stat__value">
        {value}{unit ? <span className="frencia-stat__unit">{unit}</span> : null}
        {delta != null ? (
          <span className={`frencia-stat__delta frencia-stat__delta--${deltaDir === 'down' ? 'down' : 'up'}`}>
            <i data-lucide={deltaDir === 'down' ? 'arrow-down-right' : 'arrow-up-right'}></i>{delta}
          </span>
        ) : null}
      </span>
    </div>
  );
}
