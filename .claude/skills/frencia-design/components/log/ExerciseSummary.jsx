import React from 'react';

const CSS = `
.frencia-exsum{display:inline-flex;flex-wrap:wrap;align-items:center;column-gap:7px;row-gap:2px;font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:13px;color:var(--text-secondary);font-variant-numeric:tabular-nums}
.frencia-exsum__vol{color:var(--text-primary);font-weight:var(--fw-semibold)}
.frencia-exsum__sep{color:var(--text-disabled)}
.frencia-exsum__int{color:var(--intensity-text);font-weight:var(--fw-semibold)}
.frencia-exsum__rest{display:inline-flex;align-items:center;gap:4px;color:var(--text-tertiary)}
.frencia-exsum__rest svg{width:13px;height:13px;stroke-width:2}
.frencia-exsum--lg{font-size:15px}
.frencia-exsum--lg .frencia-exsum__rest svg{width:15px;height:15px}
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-exsum-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-exsum-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Resumen de una línea del plan: volumen · intensidad · descanso.
 * "4x10 · RIR 2 · 2 min", "3x45 s · RIR 1 · 1 min", "30 min · 5 km · RPE 6", "3x40 m · 1:30".
 * El descanso lleva ícono de reloj para no confundirse con un tiempo de trabajo.
 */
export function ExerciseSummary({ exercise, plan, prefs, size = 'md', className = '', ...rest }) {
  const M = (window.FrenciaDesignSystem_377129 || {}).ExerciseMetrics;
  if (!M) return null;
  const s = M.summary(exercise, plan, prefs);
  const sep = (k) => <span key={k} className="frencia-exsum__sep">·</span>;
  const out = [<span key="v" className="frencia-exsum__vol">{s.volume}</span>];
  if (s.intensity) out.push(sep('s1'), <span key="i" className="frencia-exsum__int">{s.intensity}</span>);
  if (s.rest) out.push(sep('s2'), <span key="r" className="frencia-exsum__rest" aria-label={`descanso ${s.rest}`}><span style={{ display: 'inline-flex' }}><i data-lucide="timer"></i></span>{s.rest}</span>);
  return <span className={['frencia-exsum', size === 'lg' ? 'frencia-exsum--lg' : '', className].filter(Boolean).join(' ')} title={s.text} {...rest}>{out}</span>;
}
