import React from 'react';

const CSS = `
.frencia-metricpill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-radius: var(--radius-lg);
  background: var(--surface-chip); border: 1px solid transparent;
}
.frencia-metricpill svg { width: 16px; height: 16px; stroke-width: 2; color: var(--text-tertiary); }
.frencia-metricpill__body { display: flex; flex-direction: column; line-height: 1.1; }
.frencia-metricpill__label {
  font-family: var(--font-mono); font-weight: var(--fw-medium); font-size: 9px;
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary);
}
.frencia-metricpill__value { font-family: var(--font-mono); font-weight: var(--fw-bold); font-size: 15px; color: var(--text-primary); font-variant-numeric: tabular-nums; }
.frencia-metricpill--inline { padding: 6px 12px; }
.frencia-metricpill--inline .frencia-metricpill__body { flex-direction: row; align-items: baseline; gap: 6px; }
.frencia-metricpill--green { background: var(--surface-green-soft); border-color: var(--surface-green-line); }
.frencia-metricpill--green svg, .frencia-metricpill--green .frencia-metricpill__value { color: var(--accent-text); }
.frencia-metricpill--orange { background: var(--surface-orange-soft); border-color: var(--surface-orange-line); }
.frencia-metricpill--orange svg, .frencia-metricpill--orange .frencia-metricpill__value { color: var(--intensity-text); }
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-metricpill-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-metricpill-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Inline metric chip — icon + label + value. Rest timer, RIR, pace, etc. */
export function MetricPill({ icon, label, value, tone = 'neutral', layout = 'stack', className = '', ...rest }) {
  const cls = ['frencia-metricpill', tone !== 'neutral' ? `frencia-metricpill--${tone}` : '', layout === 'inline' ? 'frencia-metricpill--inline' : '', className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {icon ? <i data-lucide={icon}></i> : null}
      <span className="frencia-metricpill__body">
        {label ? <span className="frencia-metricpill__label">{label}</span> : null}
        <span className="frencia-metricpill__value">{value}</span>
      </span>
    </span>
  );
}
