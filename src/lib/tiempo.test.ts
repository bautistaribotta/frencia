/* Correr con `npm test`. */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { duracionCompacta, reloj } from './tiempo.ts';

test('el reloj va en m:ss por debajo de una hora, sin cero inicial', () => {
  assert.equal(reloj(45), '0:45');
  assert.equal(reloj(90), '1:30');
  assert.equal(reloj(1800), '30:00');
});

test('desde una hora el reloj pasa a h:mm:ss', () => {
  assert.equal(reloj(3600), '1:00:00');
  assert.equal(reloj(3900), '1:05:00');
  assert.equal(reloj(5025), '1:23:45');
});

test('el resumen compacto usa segundos, minutos u horas segun el valor', () => {
  assert.equal(duracionCompacta(45), '45 s');
  assert.equal(duracionCompacta(120), '2 min');
  assert.equal(duracionCompacta(1800), '30 min');
  assert.equal(duracionCompacta(3600), '1 h');
  assert.equal(duracionCompacta(4500), '1 h 15 min');
});

test('lo que no cae en minutos exactos se resume como reloj', () => {
  assert.equal(duracionCompacta(90), '1:30');
  assert.equal(duracionCompacta(3630), '1:00:30');
});
