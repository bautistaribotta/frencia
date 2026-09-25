import React from 'react';

const CSS = `
.frencia-st{display:grid;align-items:center;column-gap:6px}
.frencia-st__h{font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:10px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary);padding:0 6px 6px;text-align:right;white-space:nowrap}
.frencia-st__h small{font-size:10px;color:var(--text-disabled);margin-left:3px;text-transform:none}
.frencia-st__i{font-family:var(--font-mono);font-weight:var(--fw-bold);font-size:12px;color:var(--text-tertiary);padding:9px 6px;border-top:1px solid var(--divider)}
.frencia-st__c{font-family:var(--font-mono);font-weight:var(--fw-semibold);font-size:15px;color:var(--text-primary);font-variant-numeric:tabular-nums;text-align:right;padding:9px 6px;white-space:nowrap;border-top:1px solid var(--divider)}
.frencia-st__c--dash{color:var(--text-disabled);font-weight:var(--fw-medium)}
.frencia-st__c--int{color:var(--intensity-text)}
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-st-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-st-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Series registradas de un ejercicio (historial). Mismas columnas que SerieComparativa. */
export function SeriesTable({ exercise, sets = [], intensity, prefs, className = '', ...rest }) {
  const M = (window.FrenciaDesignSystem_377129 || {}).ExerciseMetrics;
  if (!M) return null;
  const cols = M.columns(exercise, prefs, intensity);
  return (
    <div className={['frencia-st', className].filter(Boolean).join(' ')} style={{ gridTemplateColumns: `28px repeat(${cols.length}, minmax(0,1fr))` }} {...rest}>
      <span className="frencia-st__h" style={{ textAlign: 'left' }}>#</span>
      {cols.map((c) => <span key={c.key} className="frencia-st__h">{c.label}{c.unit ? <small>{c.unit}</small> : null}</span>)}
      {sets.map((s, i) => (
        <React.Fragment key={i}>
          <span className="frencia-st__i">{i + 1}</span>
          {cols.map((c) => {
            const txt = M.value(c.key, c.key === 'int' ? s.intensityValue : s[c.key], exercise, prefs, 'table');
            const dash = txt === M.DASH;
            return <span key={c.key} className={'frencia-st__c' + (dash ? ' frencia-st__c--dash' : c.key === 'int' ? ' frencia-st__c--int' : '')}>{txt}</span>;
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
