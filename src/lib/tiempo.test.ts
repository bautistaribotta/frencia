/* Correr con `npm test`. */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { duracionCompacta, duracionSesion, indiceSemanaLunes, reloj } from './tiempo.ts';

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

test('el reloj trunca decimales y acota negativos a cero', () => {
  assert.equal(reloj(-5), '0:00');
  assert.equal(reloj(45.9), '0:45');
});

test('duracionSesion formatea en minutos u horas y redondea como minimo a 1 min', () => {
  assert.equal(duracionSesion(0, 10_000), '1 min');
  assert.equal(duracionSesion(0, 48 * 60_000), '48 min');
  assert.equal(duracionSesion(0, 60 * 60_000), '1 h');
  assert.equal(duracionSesion(0, 72 * 60_000), '1 h 12 min');
});

test('indiceSemanaLunes devuelve 0 para lunes y 6 para domingo', () => {
  assert.equal(indiceSemanaLunes(new Date(2026, 9, 19)), 0); // Lunes 19 oct 2026
  assert.equal(indiceSemanaLunes(new Date(2026, 9, 25)), 6); // Domingo 25 oct 2026
});
