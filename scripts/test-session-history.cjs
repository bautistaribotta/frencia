// Run: node scripts/test-session-history.cjs (in-process runner also works in restricted Windows sandboxes).
// Uses the installed Supabase client against a local fetch double; never connects to a database.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { test } = require('node:test');

const project = process.env.HISTORY_TEST_PROJECT || path.resolve(__dirname, '..');
const projectRequire = createRequire(path.join(project, 'package.json'));
const ts = projectRequire('typescript');
const { createClient } = projectRequire('@supabase/supabase-js');
const source = fs.readFileSync(path.join(project, 'src/lib/session-history.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

const USER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SESSION = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const EARLY = '2026-09-17T12:00:00.000Z';
const LATE = '2026-09-17T12:30:00.000Z';
const plain = value => JSON.parse(JSON.stringify(value));
const sessionRow = (extra = {}) => ({
  id: SESSION,
  user_id: USER,
  started_at: EARLY,
  finished_at: LATE,
  training_days: { name: 'Piernas' },
  ...extra,
});
const setRow = (extra = {}) => ({
  id: 'set-1', exercise_id: 'exercise-a', set_index: 1, weight_kg: '82.50', reps: 8,
  intensity_kind: 'rir', intensity_value: '-1', completed_at: EARLY,
  exercises: { name: 'Sentadilla' }, ...extra,
});

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}

function setup({ session = sessionRow(), rows = [], onRequest } = {}) {
  const requests = [];
  const fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    const request = { url, init, table: url.pathname.split('/').at(-1) };
    requests.push(request);
    const override = await onRequest?.(request, requests);
    if (override) return override;
    if (init.signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    if (request.table === 'workout_sessions') {
      const match = session && url.searchParams.get('id') === `eq.${session.id}`
        && url.searchParams.get('user_id') === `eq.${session.user_id}`
        && url.searchParams.get('finished_at') === 'not.is.null'
        && session.finished_at !== null;
      return jsonResponse(match ? [session] : []);
    }
    assert.equal(request.table, 'session_sets', 'no unrelated table request');
    assert.equal(url.searchParams.get('session_id'), `eq.${SESSION}`);
    assert.equal(url.searchParams.get('order'), 'exercise_id.asc,set_index.asc');
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    assert.equal(limit, 200, 'series requests stay bounded');
    const sorted = [...rows].sort((a, b) => a.exercise_id.localeCompare(b.exercise_id) || a.set_index - b.set_index);
    return jsonResponse(sorted.slice(offset, offset + limit));
  };
  const supabase = createClient('https://history-tests.invalid', 'test-anon-key', {
    global: { fetch }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports,
    require(name) {
      assert.equal(name, './supabase');
      return { supabase };
    },
    Date, Map, Number, Infinity, AbortController, AbortSignal,
  }, { filename: 'session-history.ts' });
  return { ...module.exports, requests };
}

test('requests only the owned, completed session and joins names in existing requests', async () => {
  const h = setup({ rows: [setRow()] });
  const result = await h.cargarDetalleSesion(USER, SESSION);
  assert.equal(result.estado, 'ok');
  assert.equal(h.requests.length, 2);
  const header = h.requests[0].url.searchParams;
  assert.equal(header.get('id'), `eq.${SESSION}`);
  assert.equal(header.get('user_id'), `eq.${USER}`);
  assert.equal(header.get('finished_at'), 'not.is.null');
  assert.equal(header.get('select'), 'id,started_at,finished_at,training_days(name)');
  assert.equal(h.requests[1].url.searchParams.get('select'), 'id,exercise_id,set_index,weight_kg,reps,intensity_kind,intensity_value,completed_at,exercises(name)');
  assert.equal(h.requests[1].url.searchParams.get('offset'), '0');
});

test('invalid identifiers and absent user return not found without making requests', async () => {
  const h = setup();
  for (const [user, id] of [[USER, ''], [USER, 'not-a-uuid'], [USER, '../sessions'], ['', SESSION]]) {
    assert.deepEqual(plain(await h.cargarDetalleSesion(user, id)), { estado: 'no-encontrada' });
  }
  assert.equal(h.requests.length, 0);
});

test('missing, unfinished, and another user session never request series', async () => {
  for (const session of [null, sessionRow({ finished_at: null }), sessionRow({ user_id: 'someone-else' })]) {
    const h = setup({ session });
    assert.deepEqual(plain(await h.cargarDetalleSesion(USER, SESSION)), { estado: 'no-encontrada' });
    assert.equal(h.requests.length, 1);
  }
});

test('maps decimal kg, zero kg, negative RIR, RPE, repetition count, and timestamps', async () => {
  const h = setup({ rows: [
    setRow(),
    setRow({ id: 'set-2', set_index: 2, weight_kg: '0', reps: 12, intensity_kind: 'rpe', intensity_value: '9.5', completed_at: LATE }),
  ] });
  const result = await h.cargarDetalleSesion(USER, SESSION);
  assert.equal(result.estado, 'ok');
  assert.equal(result.sesion.startedAt, Date.parse(EARLY));
  assert.equal(result.sesion.finishedAt, Date.parse(LATE));
  assert.deepEqual(plain(result.sesion.ejercicios[0].series), [
    { id: 'set-1', setIndex: 1, weightKg: 82.5, reps: 8, intensityKind: 'rir', intensityValue: -1, completedAt: Date.parse(EARLY) },
    { id: 'set-2', setIndex: 2, weightKg: 0, reps: 12, intensityKind: 'rpe', intensityValue: 9.5, completedAt: Date.parse(LATE) },
  ]);
});

test('supports object, array, and absent name joins', async () => {
  for (const [trainingDays, exercise, expectedDay, expectedExercise] of [
    [{ name: 'A' }, { name: 'B' }, 'A', 'B'],
    [[{ name: 'C' }], [{ name: 'D' }], 'C', 'D'],
    [null, null, null, 'Ejercicio'],
    [[], [], null, 'Ejercicio'],
  ]) {
    const h = setup({ session: sessionRow({ training_days: trainingDays }), rows: [setRow({ exercises: exercise })] });
    const result = await h.cargarDetalleSesion(USER, SESSION);
    assert.equal(result.estado, 'ok');
    assert.equal(result.sesion.dayName, expectedDay);
    assert.equal(result.sesion.ejercicios[0].name, expectedExercise);
  }
});

test('groups by exercise, keeps series in numeric order, and exercises in performed order', async () => {
  const h = setup({ rows: [
    setRow({ id: 'a-2', set_index: 2, completed_at: LATE }),
    setRow({ id: 'z-2', exercise_id: 'exercise-z', set_index: 2, completed_at: LATE }),
    setRow({ id: 'a-1', set_index: 1, completed_at: LATE }),
    setRow({ id: 'z-1', exercise_id: 'exercise-z', set_index: 1, completed_at: EARLY }),
  ] });
  const result = await h.cargarDetalleSesion(USER, SESSION);
  assert.equal(result.estado, 'ok');
  assert.deepEqual(plain(result.sesion.ejercicios.map(e => [e.exerciseId, e.series.map(s => s.id)])), [
    ['exercise-z', ['z-1', 'z-2']], ['exercise-a', ['a-1', 'a-2']],
  ]);
});

test('reads all 405 series across three pages without dropping or duplicating a set', async () => {
  const rows = Array.from({ length: 405 }, (_, i) => setRow({ id: `set-${i + 1}`, set_index: i + 1 }));
  const h = setup({ rows });
  const result = await h.cargarDetalleSesion(USER, SESSION);
  assert.equal(result.estado, 'ok');
  const sets = result.sesion.ejercicios[0].series;
  assert.equal(sets.length, 405);
  assert.equal(new Set(sets.map(s => s.id)).size, 405);
  assert.deepEqual(plain(sets.map(s => s.setIndex)), rows.map(s => s.set_index));
  assert.deepEqual(h.requests.slice(1).map(r => r.url.searchParams.get('offset')), ['0', '200', '400']);
});

test('an exact full page terminates after the following empty page', async () => {
  const h = setup({ rows: Array.from({ length: 200 }, (_, i) => setRow({ id: `set-${i}`, set_index: i + 1 })) });
  const result = await h.cargarDetalleSesion(USER, SESSION);
  assert.equal(result.estado, 'ok');
  assert.equal(result.sesion.ejercicios[0].series.length, 200);
  assert.equal(h.requests.length, 3);
});

test('later page failure returns an error, never a partial workout', async () => {
  const h = setup({
    rows: Array.from({ length: 205 }, (_, i) => setRow({ id: `set-${i}`, set_index: i + 1 })),
    onRequest: ({ table, url }) => table === 'session_sets' && url.searchParams.get('offset') === '200'
      ? jsonResponse({ message: 'Denied', code: '42501' }, 403) : undefined,
  });
  assert.deepEqual(plain(await h.cargarDetalleSesion(USER, SESSION)), { estado: 'error' });
  assert.equal(h.requests.length, 3);
});

test('empty completed workout succeeds while header/series failures remain errors', async () => {
  const empty = setup();
  const result = await empty.cargarDetalleSesion(USER, SESSION);
  assert.equal(result.estado, 'ok');
  assert.deepEqual(plain(result.sesion.ejercicios), []);
  for (const failedTable of ['workout_sessions', 'session_sets']) {
    const h = setup({ onRequest: ({ table }) => table === failedTable
      ? jsonResponse({ message: 'Invalid request', code: '22000' }, 400) : undefined });
    assert.deepEqual(plain(await h.cargarDetalleSesion(USER, SESSION)), { estado: 'error' });
  }
});

test('already cancelled loading makes no requests', async () => {
  const h = setup();
  const controller = new AbortController();
  controller.abort();
  assert.deepEqual(plain(await h.cargarDetalleSesion(USER, SESSION, controller.signal)), { estado: 'error' });
  assert.equal(h.requests.length, 0);
});

test('cancellation reaches the Supabase request and interrupts a pending series page', async () => {
  const controller = new AbortController();
  let pending;
  const reachedPage = new Promise(resolve => { pending = resolve; });
  const h = setup({ onRequest: ({ table, init }) => {
    assert.ok(init.signal, 'abort signal is supplied to both requests');
    if (table !== 'session_sets') return;
    return new Promise((resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true });
      pending();
    });
  } });
  const loading = h.cargarDetalleSesion(USER, SESSION, controller.signal);
  await reachedPage;
  controller.abort();
  assert.deepEqual(plain(await loading), { estado: 'error' });
  assert.equal(h.requests.length, 2);
});
