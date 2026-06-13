import React from 'react';

const CSS = `
.heft-metricpill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-radius: var(--radius-lg);
  background: var(--surface-chip); border: 1px solid transparent;
}
.heft-metricpill svg { width: 16px; height: 16px; stroke-width: 2; color: var(--text-tertiary); }
.heft-metricpill__body { display: flex; flex-direction: column; line-height: 1.1; }
.heft-metricpill__label {
  font-family: var(--font-mono); font-weight: var(--fw-medium); font-size: 9px;
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary);
}
.heft-metricpill__value { font-family: var(--font-mono); font-weight: var(--fw-bold); font-size: 15px; color: var(--text-primary); font-variant-numeric: tabular-nums; }
.heft-metricpill--inline { padding: 6px 12px; }
.heft-metricpill--inline .heft-metricpill__body { flex-direction: row; align-items: baseline; gap: 6px; }
.heft-metricpill--green { background: var(--surface-green-soft); border-color: var(--surface-green-line); }
.heft-metricpill--green svg, .heft-metricpill--green .heft-metricpill__value { color: var(--accent-text); }
.heft-metricpill--orange { background: var(--surface-orange-soft); border-color: var(--surface-orange-line); }
.heft-metricpill--orange svg, .heft-metricpill--orange .heft-metricpill__value { color: var(--intensity-text); }
`;

if (typeof document !== 'undefined' && !document.getElementById('heft-metricpill-css')) {
  const s = document.createElement('style');
  s.id = 'heft-metricpill-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Inline metric chip — icon + label + value. Rest timer, RIR, pace, etc. */
export function MetricPill({ icon, label, value, tone = 'neutral', layout = 'stack', className = '', ...rest }) {
  const cls = ['heft-metricpill', tone !== 'neutral' ? `heft-metricpill--${tone}` : '', layout === 'inline' ? 'heft-metricpill--inline' : '', className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {icon ? <i data-lucide={icon}></i> : null}
      <span className="heft-metricpill__body">
        {label ? <span className="heft-metricpill__label">{label}</span> : null}
        <span className="heft-metricpill__value">{value}</span>
      </span>
    </span>
  );
}
