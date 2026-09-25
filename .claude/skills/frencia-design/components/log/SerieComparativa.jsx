import React from 'react';

const CSS = `
.frencia-sc{display:flex;flex-direction:column;gap:6px}
.frencia-sc__title{display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:0 2px}
.frencia-sc__t{font-family:var(--font-mono);font-weight:var(--fw-semibold);font-size:11px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary)}
.frencia-sc__grid{display:grid;align-items:center;column-gap:0;border-radius:var(--radius-lg);background:var(--surface-card);border:1px solid var(--border-subtle);padding:6px}
.frencia-sc__h{font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:10px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary);padding:8px 6px 6px;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.frencia-sc__h small{font-size:10px;color:var(--text-disabled);margin-left:3px;letter-spacing:var(--ls-wide);text-transform:none}
.frencia-sc__rl{font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:11px;letter-spacing:var(--ls-wide);text-transform:uppercase;color:var(--text-tertiary);padding:0 6px;white-space:nowrap}
.frencia-sc__c{font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:15px;color:var(--text-secondary);font-variant-numeric:tabular-nums;text-align:right;padding:10px 6px;white-space:nowrap;border-radius:var(--radius-xs)}
.frencia-sc__c--dash{color:var(--text-disabled)}
.frencia-sc__c--int{color:var(--intensity-text)}
.frencia-sc__band{grid-column:1 / -1;display:contents}
.frencia-sc__today{background:var(--surface-card-elevated)}
.frencia-sc__today.frencia-sc__rl{color:var(--accent-text);font-weight:var(--fw-bold);border-radius:var(--radius-sm) 0 0 var(--radius-sm);align-self:stretch;display:flex;align-items:center}
.frencia-sc__today.frencia-sc__c{font-weight:var(--fw-bold);font-size:17px;color:var(--text-primary);border-radius:0}
.frencia-sc__today.frencia-sc__c--last{border-radius:0 var(--radius-sm) var(--radius-sm) 0}
.frencia-sc__today.frencia-sc__c--dash{color:var(--text-disabled)}
.frencia-sc__today.frencia-sc__c--int{color:var(--intensity-text)}
.frencia-sc__c--active{box-shadow:inset 0 -2px 0 var(--accent)}
.frencia-sc--dense .frencia-sc__c{font-size:14px;padding:10px 3px}
.frencia-sc--dense .frencia-sc__today.frencia-sc__c{font-size:15px}
.frencia-sc--dense .frencia-sc__h{padding:8px 3px 6px}
.frencia-sc--dense .frencia-sc__rl{padding:0 4px}
.frencia-sc--dense .frencia-sc__h small{display:block;margin:2px 0 0}
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-sc-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-sc-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Grilla Plan / Anterior / Hoy de una serie. Las columnas salen de los datos
 * que registra el ejercicio (2 a 4 + intensidad); las unidades van en el
 * encabezado para que las celdas entren en 375 px. El plan nunca trae peso.
 */
export function SerieComparativa({ exercise, plan = {}, previous, today = {}, intensity, prefs, activeKey, title, className = '', ...rest }) {
  const M = (window.FrenciaDesignSystem_377129 || {}).ExerciseMetrics;
  if (!M) return null;
  const scale = intensity !== undefined ? intensity : plan.intensity;
  const cols = M.columns(exercise, prefs, scale);
  const pick = (row, k) => (row ? (k === 'int' ? row.intensityValue : row[k]) : null);
  const rows = [
    { key: 'plan', label: 'Plan', data: plan, planRow: true },
    { key: 'prev', label: 'Anterior', data: previous },
    { key: 'today', label: 'Hoy', data: today },
  ];
  const cls = ['frencia-sc', cols.length >= 4 ? 'frencia-sc--dense' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {title ? <div className="frencia-sc__title"><span className="frencia-sc__t">{title}</span></div> : null}
      <div className="frencia-sc__grid" style={{ gridTemplateColumns: `minmax(62px,auto) repeat(${cols.length}, minmax(0,1fr))` }}>
        <span className="frencia-sc__h" style={{ textAlign: 'left' }}></span>
        {cols.map((c) => <span key={c.key} className="frencia-sc__h">{c.label}{c.unit ? <small>{c.unit}</small> : null}</span>)}
        {rows.map((r) => {
          const t = r.key === 'today' ? ' frencia-sc__today' : '';
          return (
            <React.Fragment key={r.key}>
              <span className={'frencia-sc__rl' + t}>{r.label}</span>
              {cols.map((c, i) => {
                const raw = r.planRow && c.key === 'peso' ? null : pick(r.data, c.key);
                const txt = M.value(c.key, raw, exercise, prefs, 'table');
                const dash = txt === M.DASH;
                const k = ['frencia-sc__c', t, dash ? ' frencia-sc__c--dash' : '', !dash && c.key === 'int' ? ' frencia-sc__c--int' : '',
                  i === cols.length - 1 ? ' frencia-sc__c--last' : '', r.key === 'today' && activeKey === c.key ? ' frencia-sc__c--active' : ''].join('');
                return <span key={c.key} className={k}>{txt}</span>;
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
