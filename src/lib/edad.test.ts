/* Conversion entre edad y fecha_nacimiento. Correr con `npm test`.
   El caso de ida y vuelta solo reproduce el bug viejo (leer la fecha en UTC)
   en una zona horaria al oeste de Greenwich, como la de Argentina. */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { edadAFechaNacimiento, fechaNacimientoAEdad } from './edad.ts';

test('la edad guardada se lee igual', () => {
  for (const edad of [0, 18, 26, 64]) {
    assert.equal(fechaNacimientoAEdad(edadAFechaNacimiento(edad)), edad);
  }
});

test('el 1 de enero se lee en hora local, no en UTC', () => {
  const anio = new Date().getFullYear() - 26;
  assert.equal(fechaNacimientoAEdad(`${anio}-01-01`), 26);
});

test('sin fecha o con formato invalido no hay edad', () => {
  assert.equal(fechaNacimientoAEdad(null), null);
  assert.equal(fechaNacimientoAEdad(''), null);
  assert.equal(fechaNacimientoAEdad('2000-1-1'), null);
  assert.equal(fechaNacimientoAEdad('no es fecha'), null);
});
