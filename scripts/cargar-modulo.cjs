// Carga un modulo de src/lib transpilado en un sandbox para los tests de scripts/.
// Las dependencias relativas se cargan de verdad (recursivamente); solo se
// reemplazan las que se pasan en `dobles` (./supabase) y las nativas de React
// Native, que no corren en Node.
/* global __dirname */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const LIB = path.join(__dirname, '../src/lib');

// Lo minimo para que los modulos que las importan se puedan evaluar; ningun
// test las ejercita.
const NATIVAS = {
  react: { useEffect() {}, useState: (v) => [v, () => {}] },
  '@react-native-async-storage/async-storage': {
    default: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} },
  },
};

function cargarModulo(nombre, dobles = {}, globales = {}) {
  const cache = new Map();

  function cargar(relativo) {
    if (cache.has(relativo)) return cache.get(relativo).exports;
    const source = fs.readFileSync(path.join(LIB, relativo + '.ts'), 'utf8');
    const code = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText;
    const module = { exports: {} };
    cache.set(relativo, module);
    vm.runInNewContext(code, {
      module,
      exports: module.exports,
      require(pedido) {
        // '@/lib/x' y './x' son el mismo modulo.
        const dep = pedido.startsWith('@/lib/') ? './' + pedido.slice('@/lib/'.length) : pedido;
        if (dep in dobles) return dobles[dep];
        if (dep in NATIVAS) return NATIVAS[dep];
        if (dep.startsWith('./')) return cargar(dep.slice(2));
        throw new Error(`Dependencia inesperada: ${dep}`);
      },
      AbortController, AbortSignal, Date, Map, Set, Number, Infinity, DOMException,
      ...globales,
    }, { filename: relativo + '.ts' });
    return module.exports;
  }

  return cargar(nombre);
}

module.exports = { cargarModulo };
