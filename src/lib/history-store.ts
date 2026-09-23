import { cargarHistorial, type CursorHistorial } from './history';
import type { SesionTerminada } from './session';

type Pedido = 'inicio' | 'mas';

export interface EstadoHistorial {
  sesiones: SesionTerminada[];
  siguiente: CursorHistorial | null;
  proximaFecha: number | null;
  loaded: boolean;
  cargando: Pedido | null;
  error: Pedido | null;
}

/** Instancia por pantalla y usuario. La identidad de cada pedido protege incluso
 * si el transporte ignora AbortSignal y entrega una respuesta despues de salir. */
export function crearHistorial(userId: string | null, consultar = cargarHistorial) {
  let estado: EstadoHistorial = {
    sesiones: [], siguiente: null, proximaFecha: null,
    loaded: false, cargando: null, error: null,
  };
  let activo = false;
  let pedido: AbortController | null = null;
  // Sesiones borradas desde esta pantalla. Un pedido que salio antes de
  // borrar puede traerlas de vuelta; se filtran al publicar.
  const eliminadas = new Set<string>();
  const oyentes = new Set<() => void>();

  function publicar(cambio: Partial<EstadoHistorial>) {
    estado = { ...estado, ...cambio };
    oyentes.forEach((oyente) => oyente());
  }

  function cancelar() {
    const anterior = pedido;
    pedido = null;
    anterior?.abort();
  }

  async function pedir(tipo: Pedido) {
    if (!activo || !userId) return;
    if (tipo === 'mas' && (pedido || !estado.loaded || !estado.siguiente || estado.error)) return;
    cancelar();
    const actual = new AbortController();
    pedido = actual;
    const cursor = tipo === 'mas' ? estado.siguiente : null;
    publicar({ cargando: tipo, error: null });

    try {
      const resultado = await consultar(userId, cursor, actual.signal);
      if (!activo || pedido !== actual || actual.signal.aborted) return;
      if (resultado.estado === 'error') {
        publicar({ error: tipo, cargando: null });
        return;
      }
      const anteriores = tipo === 'mas' ? estado.sesiones : [];
      const vistos = new Set(anteriores.map((sesion) => sesion.id));
      const nuevas = resultado.sesiones.filter((sesion) => {
        if (vistos.has(sesion.id) || eliminadas.has(sesion.id)) return false;
        vistos.add(sesion.id);
        return true;
      });
      publicar({
        sesiones: [...anteriores, ...nuevas],
        siguiente: resultado.siguiente,
        proximaFecha: resultado.proximaFecha,
        loaded: true, cargando: null, error: null,
      });
    } catch {
      if (activo && pedido === actual && !actual.signal.aborted) publicar({ error: tipo, cargando: null });
    } finally {
      if (pedido === actual) pedido = null;
    }
  }

  return {
    getSnapshot: () => estado,
    subscribe: (oyente: () => void) => {
      oyentes.add(oyente);
      return () => { oyentes.delete(oyente); };
    },
    activar: (conservar = false) => {
      activo = true;
      if (!conservar || !estado.loaded) return pedir('inicio');
    },
    desactivar: () => {
      activo = false;
      cancelar();
      if (estado.cargando) publicar({ cargando: null });
    },
    recargar: () => pedir('inicio'),
    /** Saca una sesion ya borrada en el servidor sin recargar las paginas. */
    quitar: (id: string) => {
      eliminadas.add(id);
      publicar({ sesiones: estado.sesiones.filter((sesion) => sesion.id !== id) });
    },
    cargarMas: () => pedir('mas'),
    reintentar: () => {
      if (!activo || pedido || !estado.error) return;
      const tipo = estado.error;
      publicar({ error: null });
      return pedir(tipo);
    },
  };
}
