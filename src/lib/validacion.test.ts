/* Correr con `npm test`. */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { conLimite, esCursorValido, esUuid, withTimeout } from './validacion.ts';

test('esUuid acepta UUIDs canonicos y rechaza textos invalidos', () => {
  assert.equal(esUuid('1a2b3c4d-5e6f-4a1b-8c2d-0123456789ab'), true);
  assert.equal(esUuid('1A2B3C4D-5E6F-4A1B-8C2D-0123456789AB'), true);
  assert.equal(esUuid('no-es-uuid'), false);
  assert.equal(esUuid(''), false);
});

test('esCursorValido exige UUID e ISO timestamp valido', () => {
  const id = '1a2b3c4d-5e6f-4a1b-8c2d-0123456789ab';
  assert.equal(esCursorValido(id, '2026-10-21T12:46:51.123456Z'), true);
  assert.equal(esCursorValido(id, '2026-10-21T09:46:51-03:00'), true);
  assert.equal(esCursorValido('invalido', '2026-10-21T12:46:51Z'), false);
  assert.equal(esCursorValido(id, '2026-99-99T12:46:51Z'), false);
  assert.equal(esCursorValido(id, '2026-10-21'), false);
});

test('withTimeout y conLimite resuelven a tiempo y cortan al vencer', async () => {
  assert.equal(await withTimeout(Promise.resolve(42), 50), 42);
  assert.equal(await conLimite(Promise.resolve('ok'), 50), 'ok');

  const lenta = new Promise<string>((resolve) => {
    setTimeout(() => resolve('tarde'), 80);
  });
  await assert.rejects(() => withTimeout(lenta, 10), /timeout/);
  assert.equal(await conLimite(lenta, 10), null);
});
