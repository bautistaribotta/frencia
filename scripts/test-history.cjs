// Ejecutar: node scripts/test-history.cjs. Sin conexiones ni cambios en la base.
/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const { createClient } = require('@supabase/supabase-js');

function cargarModulo(nombre, dependencias) {
  const source = fs.readFileSync(path.join(__dirname, '../src/lib', nombre + '.ts'), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const sandbox = { exports: {}, AbortController, Date, Set, Map, require: (nombre) => {
    assert.ok(nombre in dependencias, `Dependencia inesperada: ${nombre}`);
    return dependencias[nombre];
  } };
  vm.runInNewContext(code, sandbox);
  return sandbox.exports;
}

const USER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const id = (n) => `bbbbbbbb-bbbb-4bbb-8bbb-${n.toString(16).padStart(12, '0')}`;
const fecha = '2026-09-18T12:00:00.123456+00:00';
const fila = (n, finished_at = fecha) => ({
  id: id(n), user_id: USER, started_at: '2026-09-18T11:00:00+00:00', finished_at,
  training_days: { name: 'Torso' },
});
const plain = (value) => JSON.parse(JSON.stringify(value));

function api(iniciales = [], responder) {
  const db = { filas: iniciales };
  const requests = [];
  const cliente = createClient('https://history-tests.invalid', 'test-key', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (input, init) => {
      const url = new URL(input);
      const params = url.searchParams;
      requests.push({ url, init });
      if (responder) return responder(url, init);
      assert.equal(params.get('order'), 'finished_at.desc,id.desc');
      assert.equal(params.get('limit'), '21');
      assert.equal(params.get('offset'), null);
      assert.equal(params.get('user_id'), `eq.${USER}`);
      assert.deepEqual(params.getAll('finished_at'), params.has('or') ? ['not.is.null', `lte.${fecha}`] : ['not.is.null']);
      assert.equal(params.get('select'), 'id,started_at,finished_at,training_days(name)');
      let filas = db.filas.filter((r) => r.user_id === USER && r.finished_at !== null);
      if (params.has('or')) {
        const match = params.get('or').match(/^\(finished_at.lt.(.+),and\(finished_at.eq.(.+),id.lt.([\da-f-]+)\)\)$/);
        assert.ok(match, 'Cursor PostgREST bien formado');
        assert.equal(match[1], match[2]);
        filas = filas.filter((r) => r.finished_at < match[1] || (r.finished_at === match[1] && r.id < match[3]));
      }
      filas.sort((a, b) => b.finished_at.localeCompare(a.finished_at) || b.id.localeCompare(a.id));
      return new Response(JSON.stringify(filas.slice(0, 21)), { headers: { 'Content-Type': 'application/json' } });
    } },
  });
  return { ...cargarModulo('history', { './supabase': { supabase: cliente } }), db, requests };
}

test('pagina acotada, datos del usuario, desempate por ID y precision de microsegundos', async () => {
  const h = api([...Array.from({ length: 26 }, (_, i) => fila(i + 1)), { ...fila(99), user_id: 'otro' }, fila(98, null)]);
  const primera = await h.cargarHistorial(USER);
  assert.equal(primera.estado, 'ok');
  assert.equal(primera.sesiones.length, 20);
  assert.equal(primera.siguiente.finishedAt, fecha);
  assert.equal(primera.siguiente.id, id(7));
  const segunda = await h.cargarHistorial(USER, primera.siguiente);
  assert.equal(segunda.siguiente, null);
  const ids = [...primera.sesiones, ...segunda.sesiones].map((s) => s.id);
  assert.equal(ids.length, 26);
  assert.equal(new Set(ids).size, 26);
  assert.equal(h.requests.length, 2);
});

test('insertar una sesion nueva entre paginas no repite ni saltea las anteriores', async () => {
  const h = api(Array.from({ length: 30 }, (_, i) => fila(i + 1)));
  const primera = await h.cargarHistorial(USER);
  h.db.filas.push(fila(99, '2026-09-19T12:00:00.000000+00:00'));
  const segunda = await h.cargarHistorial(USER, primera.siguiente);
  assert.deepEqual(plain([...primera.sesiones, ...segunda.sesiones].map((s) => s.id)),
    Array.from({ length: 30 }, (_, i) => id(30 - i)));
});

test('borrar registros de la pagina anterior, incluido el cursor, no saltea pendientes', async () => {
  const h = api(Array.from({ length: 30 }, (_, i) => fila(i + 1)));
  const primera = await h.cargarHistorial(USER);
  h.db.filas = h.db.filas.filter((r) => r.id !== id(30) && r.id !== primera.siguiente.id);
  const segunda = await h.cargarHistorial(USER, primera.siguiente);
  assert.deepEqual(plain(segunda.sesiones.map((s) => s.id)), Array.from({ length: 10 }, (_, i) => id(10 - i)));
});

test('vacio y error son resultados distintos; limite exacto no inventa otra pagina', async () => {
  const vacio = await api().cargarHistorial(USER);
  assert.equal(vacio.estado, 'ok');
  assert.equal(vacio.siguiente, null);
  const completa = await api(Array.from({ length: 20 }, (_, i) => fila(i))).cargarHistorial(USER);
  assert.equal(completa.sesiones.length, 20);
  assert.equal(completa.siguiente, null);
  const fallida = api([], () => new Response(JSON.stringify({ message: 'fallo' }), { status: 503 }));
  assert.equal((await fallida.cargarHistorial(USER)).estado, 'error');
});

test('cursor invalido y cancelacion previa no envian pedidos; el signal llega al cliente', async () => {
  const h = api();
  assert.equal((await h.cargarHistorial(USER, { id: 'x),id.gt.0', finishedAt: fecha })).estado, 'error');
  const controller = new AbortController();
  controller.abort();
  assert.equal((await h.cargarHistorial(USER, null, controller.signal)).estado, 'error');
  assert.equal(h.requests.length, 0);
  const activo = new AbortController();
  await h.cargarHistorial(USER, null, activo.signal);
  assert.equal(h.requests[0].init.signal, activo.signal);
});

const datos = (n, month = 8, year = 2026) => ({ id: id(n), dayName: 'Torso', startedAt: 0, finishedAt: new Date(year, month, 15, 12).getTime() });

test('contador mensual se oculta solo si el registro extra pertenece al mismo mes y anio', () => {
  const { agruparHistorial } = api();
  const sesiones = [datos(1), datos(2), datos(3, 7)];
  assert.deepEqual(plain(agruparHistorial(sesiones, datos(4, 7).finishedAt).map((m) => m.completo)), [true, false]);
  assert.deepEqual(plain(agruparHistorial(sesiones, datos(4, 6).finishedAt).map((m) => m.completo)), [true, true]);
  assert.deepEqual(plain(agruparHistorial(sesiones, null).map((m) => m.completo)), [true, true]);
  assert.equal(agruparHistorial([datos(1)], datos(2, 8, 2025).finishedAt)[0].completo, true);
  assert.equal(agruparHistorial([], null).length, 0);
});

test('limite mensual usa calendario local, no UTC', () => {
  const { agruparHistorial } = api();
  const fin = new Date(2026, 8, 30, 23, 59).getTime();
  const siguienteMes = new Date(2026, 9, 1, 0, 0).getTime();
  assert.equal(agruparHistorial([{ ...datos(1), finishedAt: siguienteMes }], fin)[0].completo, true);
});

function diferido() {
  let resolve, reject;
  const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; });
  return { promise, resolve, reject };
}
const pagina = (sesiones, mas = true) => ({
  estado: 'ok', sesiones, siguiente: mas ? { id: sesiones.at(-1).id, finishedAt: fecha } : null,
  proximaFecha: mas ? datos(999).finishedAt : null,
});
function controlador() {
  const requests = [];
  const consulta = (user, cursor, signal) => {
    const pending = diferido();
    requests.push({ user, cursor, signal, ...pending });
    return pending.promise;
  };
  const { crearHistorial } = cargarModulo('history-store', { './history': { cargarHistorial: consulta } });
  return { store: crearHistorial(USER), requests, crearHistorial };
}
async function iniciar(h) {
  const p = h.store.activar();
  h.requests[0].resolve(pagina([datos(1), datos(2)]));
  await p;
}

test('error inicial mantiene loaded falso y permite reintento hasta vacio real', async () => {
  const h = controlador();
  const inicial = h.store.activar();
  h.requests[0].resolve({ estado: 'error' });
  await inicial;
  assert.equal(h.store.getSnapshot().loaded, false);
  assert.equal(h.store.getSnapshot().error, 'inicio');
  await h.store.cargarMas();
  assert.equal(h.requests.length, 1);
  const retry = h.store.reintentar();
  h.requests[1].resolve(pagina([], false));
  await retry;
  assert.equal(h.store.getSnapshot().loaded, true);
  assert.equal(h.store.getSnapshot().error, null);
});

test('error de pagina conserva filas/cursor y no reintenta en bucle por onEndReached', async () => {
  const h = controlador(); await iniciar(h);
  const antes = h.store.getSnapshot();
  const mas = h.store.cargarMas();
  await h.store.cargarMas();
  assert.equal(h.requests.length, 2);
  h.requests[1].resolve({ estado: 'error' }); await mas;
  assert.equal(h.store.getSnapshot().sesiones, antes.sesiones);
  assert.equal(h.store.getSnapshot().siguiente, antes.siguiente);
  await h.store.cargarMas();
  assert.equal(h.requests.length, 2);
  const retry = h.store.reintentar();
  assert.deepEqual(h.requests[2].cursor, antes.siguiente);
  h.requests[2].resolve(pagina([datos(3)], false)); await retry;
  assert.equal(h.store.getSnapshot().sesiones.length, 3);
});

test('respuesta antigua no se mezcla con refresco, aunque ignore AbortSignal', async () => {
  const h = controlador(); await iniciar(h);
  const mas = h.store.cargarMas();
  h.store.desactivar();
  assert.equal(h.requests[1].signal.aborted, true);
  const nuevo = h.store.activar();
  h.requests[2].resolve(pagina([datos(10)], false)); await nuevo;
  h.requests[1].resolve(pagina([datos(3)])); await mas;
  assert.deepEqual(plain(h.store.getSnapshot().sesiones.map((s) => s.id)), [id(10)]);
  assert.equal(h.store.getSnapshot().siguiente, null);
});

test('volver del detalle conserva paginas/cursor sin consulta y puede retomar una pagina cancelada', async () => {
  const h = controlador(); await iniciar(h);
  const mas = h.store.cargarMas();
  h.store.desactivar();
  const antes = h.store.getSnapshot();
  await h.store.activar(true);
  assert.equal(h.store.getSnapshot(), antes);
  assert.equal(h.requests.length, 2);
  h.requests[1].resolve(pagina([datos(3)])); await mas;
  assert.equal(h.store.getSnapshot(), antes);
  const siguiente = h.store.cargarMas();
  h.requests[2].resolve(pagina([datos(3)], false)); await siguiente;
  assert.equal(h.store.getSnapshot().sesiones.length, 3);
});

test('refresco fallido conserva datos y reintento reemplaza en vez de anexar', async () => {
  const h = controlador(); await iniciar(h);
  const antes = h.store.getSnapshot();
  const p = h.store.recargar();
  h.requests[1].reject(new Error('sin conexion')); await p;
  assert.equal(h.store.getSnapshot().sesiones, antes.sesiones);
  assert.equal(h.store.getSnapshot().error, 'inicio');
  const retry = h.store.reintentar();
  assert.equal(h.requests[2].cursor, null);
  h.requests[2].resolve(pagina([datos(9)], false)); await retry;
  assert.deepEqual(plain(h.store.getSnapshot().sesiones.map((s) => s.id)), [id(9)]);
});

test('refrescar durante paginacion invalida la respuesta anterior sin bloquear solicitudes nuevas', async () => {
  const h = controlador(); await iniciar(h);
  const mas = h.store.cargarMas();
  const refresh = h.store.recargar();
  assert.equal(h.requests[1].signal.aborted, true);
  h.requests[1].reject(new Error('cancelada')); await mas;
  assert.equal(h.store.getSnapshot().cargando, 'inicio');
  h.requests[2].resolve(pagina([datos(9)], false)); await refresh;
  assert.equal(h.store.getSnapshot().error, null);
});

test('instancias separadas no muestran datos de otra cuenta y salir cancela la carga inicial', async () => {
  const h = controlador();
  const primera = h.store.activar();
  h.store.desactivar();
  const otra = h.crearHistorial('otra-cuenta');
  const siguiente = otra.activar(true);
  h.requests[0].resolve(pagina([datos(1)])); await primera;
  assert.equal(h.store.getSnapshot().loaded, false);
  assert.equal(otra.getSnapshot().sesiones.length, 0);
  h.requests[1].resolve(pagina([datos(20)], false)); await siguiente;
  assert.equal(otra.getSnapshot().sesiones[0].id, id(20));
});

test('deduplica IDs defensivamente, notifica suscriptores y permite desuscribirse', async () => {
  const h = controlador(); let avisos = 0;
  const off = h.store.subscribe(() => avisos++);
  await iniciar(h);
  const mas = h.store.cargarMas();
  h.requests[1].resolve(pagina([datos(2), datos(3), datos(3)], false)); await mas;
  assert.equal(h.store.getSnapshot().sesiones.length, 3);
  assert.ok(avisos >= 4);
  off(); const previos = avisos;
  h.store.desactivar();
  assert.equal(avisos, previos);
});
