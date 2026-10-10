/* Correr con `npm test`. */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  agruparPorEjercicio,
  barrasTicket,
  codigoTicket,
  duracionEnSegundos,
  ejerciciosDelHistorial,
  fechaTicket,
  mejorMarca,
  miles,
  tieneVolumen,
  volumenKg,
  type EjercicioDelPlan,
} from './resumen-sesion.ts';
import type { SerieRegistrada } from './session.ts';

const FUERZA = { weight: true, reps: true, duration: false, distance: false };
const ISO = { weight: true, reps: false, duration: true, distance: false };
const CARDIO = { weight: false, reps: false, duration: true, distance: true };

function serie(exerciseId: string, setIndex: number, datos: Partial<SerieRegistrada>): SerieRegistrada {
  return {
    exerciseId,
    setIndex,
    weightKg: null,
    reps: null,
    durationSeconds: null,
    distanceM: null,
    intensityKind: null,
    intensityValue: null,
    ...datos,
  };
}

const plan: EjercicioDelPlan[] = [
  { exerciseId: 'banca', name: 'Press banca', kind: 'fuerza', tracks: FUERZA },
  { exerciseId: 'dominadas', name: 'Dominadas', kind: 'fuerza', tracks: FUERZA },
  { exerciseId: 'plancha', name: 'Plancha', kind: 'isometrico', tracks: ISO },
  { exerciseId: 'correr', name: 'Correr', kind: 'cardio', tracks: CARDIO },
];

test('el tonelaje suma peso por reps y deja afuera lo que no tiene reps', () => {
  const series = [
    serie('banca', 1, { weightKg: 80, reps: 10 }),
    serie('banca', 2, { weightKg: 85, reps: 8 }),
    serie('plancha', 1, { weightKg: 10, durationSeconds: 60 }),
    serie('correr', 1, { durationSeconds: 1800, distanceM: 5000 }),
  ];
  assert.equal(volumenKg(series), 80 * 10 + 85 * 8);
  assert.equal(tieneVolumen(series), true);
});

test('sin series de fuerza no hay tonelaje que mostrar', () => {
  assert.equal(tieneVolumen([serie('correr', 1, { durationSeconds: 1800 })]), false);
  // Peso corporal cargado en 0 cuenta como fuerza, aunque sume 0.
  assert.equal(tieneVolumen([serie('dominadas', 1, { weightKg: 0, reps: 10 })]), true);
});

test('agrupa en el orden del plan y omite los ejercicios no tocados', () => {
  const grupos = agruparPorEjercicio(plan, [
    serie('plancha', 1, { durationSeconds: 45 }),
    serie('banca', 2, { weightKg: 85, reps: 8 }),
    serie('banca', 1, { weightKg: 80, reps: 10 }),
  ]);
  assert.deepEqual(grupos.map((g) => g.exerciseId), ['banca', 'plancha']);
  assert.deepEqual(grupos[0].series.map((s) => s.setIndex), [1, 2]);
});

test('un ejercicio repetido en el plan se lista una sola vez', () => {
  const grupos = agruparPorEjercicio([plan[0], plan[0]], [serie('banca', 1, { weightKg: 80, reps: 10 })]);
  assert.equal(grupos.length, 1);
});

test('la mejor marca depende del tipo de ejercicio', () => {
  const [banca, dominadas, plancha, correr] = agruparPorEjercicio(plan, [
    serie('banca', 1, { weightKg: 80, reps: 10 }),
    serie('banca', 2, { weightKg: 85, reps: 8 }),
    serie('dominadas', 1, { weightKg: 0, reps: 12 }),
    serie('plancha', 1, { durationSeconds: 90 }),
    serie('correr', 1, { durationSeconds: 1800, distanceM: 5040 }),
  ]);
  assert.equal(mejorMarca(banca, 'kg', 'km'), '85 kg');
  assert.equal(mejorMarca(banca, 'lb', 'km'), '187.4 lb');
  assert.equal(mejorMarca(dominadas, 'kg', 'km'), '12 reps');
  assert.equal(mejorMarca(plancha, 'kg', 'km'), '1:30');
  assert.equal(mejorMarca(correr, 'kg', 'km'), '5.04 km');
});

test('los miles van separados con espacio duro', () => {
  assert.equal(miles(950), '950');
  assert.equal(miles(12480), '12 480');
  assert.equal(miles(1234567.4), '1 234 567');
});

test('la fecha del ticket va con el mes abreviado en mayusculas', () => {
  const { fecha, hora } = fechaTicket(new Date(2026, 9, 9, 7, 42).getTime());
  assert.equal(fecha, '9 OCT 2026');
  assert.equal(hora, '07:42');
});

test('el codigo y las barras salen del id y son estables', () => {
  const id = '1a2b3c4d-5e6f-4a1b-8c2d-0123456789ab';
  assert.equal(codigoTicket(id), 'FRENCIA-1A2B-3C4D5E6');
  assert.deepEqual(barrasTicket(id), barrasTicket(id));
  assert.equal(barrasTicket(id).length, 32);
  for (const b of barrasTicket(id)) {
    assert.ok(b.barra >= 1 && b.barra <= 3);
    assert.ok(b.espacio >= 1 && b.espacio <= 4);
  }
});

test('el detalle del historial pasa al ticket con el ejercicio en cada serie', () => {
  const realizada = {
    id: 's1',
    setIndex: 1,
    weightKg: 80,
    reps: 8,
    durationSeconds: null,
    distanceM: null,
    intensityKind: 'rir' as const,
    intensityValue: 2,
    completedAt: 1000,
  };
  const ticket = ejerciciosDelHistorial([
    { exerciseId: 'banca', name: 'Press banca', kind: 'fuerza', tracks: FUERZA, series: [realizada] },
    { exerciseId: 'vacio', name: 'Sin series', kind: 'fuerza', tracks: FUERZA, series: [] },
  ]);
  assert.equal(ticket.length, 1);
  assert.deepEqual(ticket[0].series[0], serie('banca', 1, {
    weightKg: 80,
    reps: 8,
    intensityKind: 'rir',
    intensityValue: 2,
  }));
  assert.equal(volumenKg(ticket[0].series), 640);
});

test('la duracion del ticket se redondea a segundos y nunca es negativa', () => {
  assert.equal(duracionEnSegundos(0, 90_400), 90);
  assert.equal(duracionEnSegundos(5000, 1000), 0);
});
