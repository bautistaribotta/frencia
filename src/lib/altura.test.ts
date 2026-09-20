/* Correr con `npm test`. */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { cmAPiesPulgadas, mostrarAltura, piesPulgadasACm } from './altura.ts';

test('cm a pies y pulgadas redondea a la pulgada entera', () => {
  assert.deepEqual(cmAPiesPulgadas(175), { pies: 5, pulgadas: 9 });
  assert.deepEqual(cmAPiesPulgadas(180), { pies: 5, pulgadas: 11 });
});

test('las pulgadas que redondean a 12 pasan al pie siguiente', () => {
  // 182.88 cm son exactamente 72 in: 6' 0", nunca 5' 12".
  assert.deepEqual(cmAPiesPulgadas(182.88), { pies: 6, pulgadas: 0 });
  assert.deepEqual(cmAPiesPulgadas(182.5), { pies: 6, pulgadas: 0 });
});

test('ida y vuelta conserva el valor de la rueda', () => {
  assert.equal(piesPulgadasACm(5, 10), 178);
  assert.deepEqual(cmAPiesPulgadas(178), { pies: 5, pulgadas: 10 });
});

test('mostrarAltura respeta la unidad elegida', () => {
  assert.equal(mostrarAltura(175, 'cm'), '175 cm');
  assert.equal(mostrarAltura(175, 'ft'), `5' 9"`);
});
