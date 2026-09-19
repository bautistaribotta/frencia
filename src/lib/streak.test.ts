/* Casos de docs/specs/racha-de-entrenamientos.md, seccion 3.
   Correr con `npm test`. Semana de referencia: 2026-09-14 es lunes. */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { calcularRacha, fechaLocal, RACHA_TOPE_DIAS } from './streak.ts';

const LUN = 0, MIE = 2, VIE = 4;
const LMV = [LUN, MIE, VIE];

test('sin weekdays no hay racha', () => {
  assert.deepEqual(calcularRacha([], ['2026-09-14'], '2026-09-14'), { racha: 0, pendienteHoy: false });
});

test('sin sesiones la racha es cero y no se marca pendiente', () => {
  assert.deepEqual(calcularRacha(LMV, [], '2026-09-14'), { racha: 0, pendienteHoy: false });
});

test('cuenta sesiones planificadas seguidas y saltea los descansos', () => {
  // Lun 14, mie 16, vie 18; hoy sabado 19 (no planificado).
  const r = calcularRacha(LMV, ['2026-09-14', '2026-09-16', '2026-09-18'], '2026-09-19');
  assert.deepEqual(r, { racha: 3, pendienteHoy: false });
});

test('faltar a un dia planificado corta la racha', () => {
  // Falto el miercoles 16: solo cuenta el viernes 18.
  const r = calcularRacha(LMV, ['2026-09-14', '2026-09-18'], '2026-09-19');
  assert.deepEqual(r, { racha: 1, pendienteHoy: false });
});

test('hoy planificado y sin entrenar queda pendiente, no corta', () => {
  // Hoy viernes 18, entreno lun y mie.
  const r = calcularRacha(LMV, ['2026-09-14', '2026-09-16'], '2026-09-18');
  assert.deepEqual(r, { racha: 2, pendienteHoy: true });
});

test('hoy planificado y ya entrenado suma y no queda pendiente', () => {
  const r = calcularRacha(LMV, ['2026-09-16', '2026-09-18'], '2026-09-18');
  assert.deepEqual(r, { racha: 2, pendienteHoy: false });
});

test('una sesion extra en dia de descanso no suma ni corta', () => {
  // Martes 15 no esta planificado.
  const r = calcularRacha(LMV, ['2026-09-14', '2026-09-15', '2026-09-16'], '2026-09-17');
  assert.deepEqual(r, { racha: 2, pendienteHoy: false });
});

test('dos sesiones el mismo dia cuentan una vez', () => {
  const r = calcularRacha(LMV, ['2026-09-14', '2026-09-14'], '2026-09-15');
  assert.deepEqual(r, { racha: 1, pendienteHoy: false });
});

test('cambiar los weekdays recalcula con los actuales', () => {
  // Con L-M-V la racha es 3; si se agrega el martes, el martes 15 sin sesion la corta.
  const fechas = ['2026-09-14', '2026-09-16', '2026-09-18'];
  assert.equal(calcularRacha(LMV, fechas, '2026-09-19').racha, 3);
  assert.equal(calcularRacha([LUN, 1, MIE, VIE], fechas, '2026-09-19').racha, 2);
});

test('cualquier sesion cumple el dia: solo importa la fecha', () => {
  // La funcion no recibe training_day_id; basta con que haya fecha.
  assert.equal(calcularRacha([LUN], ['2026-09-14'], '2026-09-14').racha, 1);
});

test('no mira mas alla del tope', () => {
  // Entrena todos los dias durante dos anios: la racha se corta en el tope.
  const fechas: string[] = [];
  const hoy = new Date(2026, 8, 19);
  for (let i = 0; i < 800; i++) {
    fechas.push(fechaLocal(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i).getTime()));
  }
  const r = calcularRacha([0, 1, 2, 3, 4, 5, 6], fechas, '2026-09-19');
  assert.equal(r.racha, RACHA_TOPE_DIAS);
});

test('fechaLocal usa la hora local del dispositivo', () => {
  const ms = new Date(2026, 0, 5, 0, 30).getTime();
  assert.equal(fechaLocal(ms), '2026-01-05');
});
