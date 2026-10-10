import { test } from 'node:test';
import assert from 'node:assert/strict';

import { centrosFestones, pathSilueta, type MedidasSilueta } from './silueta-ticket.ts';

const base: MedidasSilueta = {
  ancho: 330,
  alto: 600,
  radio: 30,
  yMuesca: 200,
  radioRecorte: 11,
  festones: 11,
  margenFestones: 4,
};

test('los festones arrancan y terminan pegados al margen', () => {
  const c = centrosFestones(base);
  assert.equal(c.length, 11);
  assert.equal(c[0], 15);
  assert.equal(c[10], 315);
});

test('los festones se reparten parejo', () => {
  const c = centrosFestones(base);
  const pasos = c.slice(1).map((x, i) => x - c[i]);
  for (const p of pasos) assert.ok(Math.abs(p - pasos[0]) < 1e-9);
});

test('un solo feston va al centro y ninguno no deja centros', () => {
  assert.deepEqual(centrosFestones({ ...base, festones: 1 }), [165]);
  assert.deepEqual(centrosFestones({ ...base, festones: 0 }), []);
});

test('el path es cerrado y tiene un arco por recorte mas las dos esquinas', () => {
  const d = pathSilueta(base);
  assert.ok(d.startsWith('M 0 30'));
  assert.ok(d.endsWith('Z'));
  // 2 esquinas + 2 muescas + 11 festones.
  assert.equal(d.match(/A /g)?.length, 15);
});

test('las muescas quedan centradas en la perforacion', () => {
  const d = pathSilueta(base);
  assert.ok(d.includes('L 330 189 A 11 11 0 0 0 330 211'));
  assert.ok(d.includes('L 0 211 A 11 11 0 0 0 0 189'));
});
