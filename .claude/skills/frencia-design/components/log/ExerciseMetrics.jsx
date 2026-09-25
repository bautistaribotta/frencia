import React from 'react';

// Fuente única de reglas: qué datos registra un ejercicio, en qué orden van
// las columnas y cómo se formatean tiempo, distancia y resúmenes.

const ORDER = ['peso', 'reps', 'tiempo', 'distancia'];

const KINDS = {
  fuerza:     { label: 'Fuerza',     icon: 'dumbbell',    intensity: 'required', scales: ['RIR', 'RPE'] },
  isometrico: { label: 'Isométrico', icon: 'hourglass',   intensity: 'required', scales: ['RIR', 'RPE'] },
  cardio:     { label: 'Cardio',     icon: 'heart-pulse', intensity: 'optional', scales: ['RPE'] },
  hibrido:    { label: 'Híbrido',    icon: 'combine',     intensity: 'optional', scales: ['RIR', 'RPE'] },
};

const LABELS = { peso: 'Peso', reps: 'Reps', tiempo: 'Tiempo', distancia: 'Distancia' };
const SHORT  = { peso: 'Peso', reps: 'Reps', tiempo: 'Tiempo', distancia: 'Dist.' };

const DASH = '—';
const pad = (n) => String(n).padStart(2, '0');
const isNil = (v) => v == null || (typeof v === 'number' && isNaN(v));

/** Reloj: m:ss por debajo de una hora, h:mm:ss desde una hora. Grillas y campos. */
function clock(sec) {
  if (isNil(sec)) return DASH;
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Compacto para resúmenes: 45 s · 2 min · 1 h · 1 h 15 min · 1:30. */
function durCompact(sec) {
  if (isNil(sec)) return DASH;
  sec = Math.max(0, Math.round(sec));
  if (sec < 60) return `${sec} s`;
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (s === 0 && h && !m) return `${h} h`;
  if (s === 0 && h) return `${h} h ${m} min`;
  if (s === 0) return `${m} min`;
  return clock(sec);
}

/** La escala es del ejercicio, no del valor: corta → m siempre; larga → km o mi del usuario. */
function distUnit(ex, prefs) {
  if (ex && ex.distScale === 'corta') return 'm';
  return (prefs && prefs.dist) || 'km';
}

/** m: entero. km/mi: 2 decimales en grillas, recortados en resúmenes. */
function dist(v, unit, mode) {
  if (isNil(v)) return DASH;
  if (unit === 'm') return String(Math.round(v));
  return mode === 'compact' ? String(Number(v.toFixed(2))) : v.toFixed(2);
}

function weight(v) {
  if (isNil(v)) return DASH;
  return String(Number(Number(v).toFixed(2)));
}

/** Datos que registra el ejercicio, en orden canónico. */
function metrics(ex) { return ORDER.filter((k) => (ex.metrics || []).includes(k)); }

/** Lo que el plan puede prescribir: todo menos el peso. */
function planMetrics(ex) { return metrics(ex).filter((k) => k !== 'peso'); }

/** Columnas fijas del ejercicio. La de intensidad existe si el plan eligió escala. */
function columns(ex, prefs, intensity) {
  const cols = metrics(ex).map((k) => ({
    key: k,
    label: SHORT[k],
    unit: k === 'peso' ? ((prefs && prefs.weight) || 'kg') : k === 'distancia' ? distUnit(ex, prefs) : '',
  }));
  if (intensity) cols.push({ key: 'int', label: intensity, unit: '' });
  return cols;
}

function value(key, v, ex, prefs, mode) {
  if (key === 'peso') return weight(v);
  if (key === 'tiempo') return mode === 'compact' ? durCompact(v) : clock(v);
  if (key === 'distancia') return dist(v, distUnit(ex, prefs), mode);
  return isNil(v) ? DASH : String(v);
}

/** El descanso no aparece solo en cardio de una sola serie. */
function restVisible(ex, sets) { return !(ex.kind === 'cardio' && sets === 1); }

/** El prefijo "Nx" se omite en el mismo caso en que se omite el descanso. */
function summary(ex, plan, prefs) {
  const sets = plan.sets || 1;
  const unit = distUnit(ex, prefs);
  const parts = planMetrics(ex).filter((k) => !isNil(plan[k])).map((k) => {
    if (k === 'reps') return String(plan.reps);
    if (k === 'tiempo') return durCompact(plan.tiempo);
    return `${dist(plan.distancia, unit, 'compact')} ${unit}`;
  });
  const counted = restVisible(ex, sets);
  if (counted && parts.length) parts[0] = `${sets}x${parts[0]}`;
  if (counted && !parts.length) parts.push(`${sets} series`);
  const volume = parts.join(' · ');
  const intensity = plan.intensity && !isNil(plan.intensityValue) ? `${plan.intensity} ${plan.intensityValue}` : null;
  const rest = counted && plan.rest ? durCompact(plan.rest) : null;
  return { volume, intensity, rest, text: [volume, intensity, rest].filter(Boolean).join(' · ') };
}

const REST_OPTIONS = [30, 60, 90, 120, 180, 300];

export const ExerciseMetrics = {
  ORDER, KINDS, LABELS, SHORT, DASH, REST_OPTIONS,
  clock, durCompact, distUnit, dist, weight,
  metrics, planMetrics, columns, value, restVisible, summary,
};
