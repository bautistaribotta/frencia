/* Correr con `npm test`. */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  distanciaACanonico,
  distanciaCompacta,
  distanciaTabla,
  mostrarDistancia,
} from './distancia.ts';

test('5 km se guardan como 5000 m y vuelven a mostrarse iguales', () => {
  const metros = distanciaACanonico(5, 'km');
  assert.equal(metros, 5000);
  assert.equal(mostrarDistancia(metros, 'km'), 5);
});

test('lo escrito en millas vuelve a mostrarse igual en millas', () => {
  const metros = distanciaACanonico(3.1, 'mi');
  assert.equal(metros, 4989);
  assert.equal(mostrarDistancia(metros, 'mi'), 3.1);
});

test('en grillas la distancia lleva siempre dos decimales, aunque sea chica', () => {
  assert.equal(distanciaTabla(4820, 'km'), '4.82');
  assert.equal(distanciaTabla(5000, 'km'), '5.00');
  assert.equal(distanciaTabla(800, 'km'), '0.80');
});

test('en resumenes se recortan los ceros y va la unidad', () => {
  assert.equal(distanciaCompacta(5000, 'km'), '5 km');
  assert.equal(distanciaCompacta(4820, 'km'), '4.82 km');
  assert.equal(distanciaCompacta(8047, 'mi'), '5 mi');
});
