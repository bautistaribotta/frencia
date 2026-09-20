/* Correr con `npm test`. */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mostrarPeso, pesoACanonico } from './peso.ts';

test('100 kg registrados se muestran como 220.5 lb al cambiar la preferencia', () => {
  assert.equal(mostrarPeso(100, 'kg'), 100);
  assert.equal(mostrarPeso(100, 'lb'), 220.5);
});

test('lo escrito en libras vuelve a mostrarse igual en libras', () => {
  const kg = pesoACanonico(225, 'lb');
  assert.equal(kg, 102.06);
  assert.equal(mostrarPeso(kg, 'lb'), 225);
});

test('en kilos no hay conversion, solo redondeo', () => {
  assert.equal(pesoACanonico(82.5, 'kg'), 82.5);
  assert.equal(mostrarPeso(82.5, 'kg'), 82.5);
});
