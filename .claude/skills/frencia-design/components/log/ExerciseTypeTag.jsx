import React from 'react';

const CSS = `
.frencia-extype{display:inline-flex;align-items:center;gap:6px;min-width:0;flex-wrap:wrap;row-gap:2px}
.frencia-extype__kind{display:inline-flex;align-items:center;gap:5px;font-family:var(--font-sans);font-weight:var(--fw-semibold);font-size:12px;color:var(--text-secondary);white-space:nowrap}
.frencia-extype__kind svg{width:14px;height:14px;stroke-width:2}
.frencia-extype__m{font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:10.5px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary);white-space:nowrap}
.frencia-extype__sep{color:var(--text-disabled);font-size:11px}
.frencia-extype--chip{padding:5px 10px;border-radius:var(--radius-pill);background:var(--surface-chip)}
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-extype-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-extype-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Tipo de ejercicio: ícono + nombre, sin color propio. Con `exercise` agrega
 * los datos que registra ("PESO · DIST.") porque las vistas dependen de eso.
 */
export function ExerciseTypeTag({ kind, exercise, showMetrics = true, variant = 'inline', className = '', ...rest }) {
  const M = (window.FrenciaDesignSystem_377129 || {}).ExerciseMetrics;
  if (!M) return null;
  const k = kind || (exercise && exercise.kind);
  const info = M.KINDS[k] || { label: k, icon: 'circle' };
  const ms = exercise && showMetrics ? M.metrics(exercise) : [];
  return (
    <span className={['frencia-extype', variant === 'chip' ? 'frencia-extype--chip' : '', className].filter(Boolean).join(' ')} {...rest}>
      <span className="frencia-extype__kind"><span key={info.icon} style={{ display: 'inline-flex' }}><i data-lucide={info.icon}></i></span>{info.label}</span>
      {ms.length ? <span className="frencia-extype__sep">·</span> : null}
      {ms.length ? <span className="frencia-extype__m">{ms.map((m) => M.SHORT[m]).join(' · ')}</span> : null}
    </span>
  );
}
