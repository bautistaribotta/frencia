import { cargarRutinas, RUTINAS_PAGINA, type CursorRutinas, type RutinaResumen } from './rutinas';

type Pedido = 'inicio' | 'mas';

export interface EstadoRutinas {
  activa: RutinaResumen | null;
  anteriores: RutinaResumen[];
  siguiente: CursorRutinas | null;
  loaded: boolean;
  cargando: Pedido | null;
  error: Pedido | null;
}

/** Instancia por pantalla y usuario, con el mismo esquema que el historial.
 * A diferencia de el, cada recarga vuelve a pedir desde el principio: al volver
 * de crear o editar una rutina el cambio tiene que verse. Para no achicar la
 * lista ni mover el scroll, la recarga trae de una vez todas las que ya estaban
 * a la vista. */
export function crearRutinas(userId: string | null, consultar = cargarRutinas) {
  let estado: EstadoRutinas = {
    activa: null, anteriores: [], siguiente: null,
    loaded: false, cargando: null, error: null,
  };
  let activo = false;
  let pedido: AbortController | null = null;
  // Rutinas borradas desde esta pantalla. Un pedido que salio antes de
  // borrar puede traerlas de vuelta; se filtran al publicar.
  const eliminadas = new Set<string>();
  const oyentes = new Set<() => void>();

  function publicar(cambio: Partial<EstadoRutinas>) {
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
    const limite = tipo === 'inicio' ? Math.max(RUTINAS_PAGINA, estado.anteriores.length) : RUTINAS_PAGINA;
    publicar({ cargando: tipo, error: null });

    try {
      const resultado = await consultar(userId, cursor, actual.signal, limite);
      if (!activo || pedido !== actual || actual.signal.aborted) return;
      if (resultado.estado === 'error') {
        publicar({ error: tipo, cargando: null });
        return;
      }
      const previas = tipo === 'mas' ? estado.anteriores : [];
      const vistos = new Set(previas.map((rutina) => rutina.id));
      const nuevas = resultado.anteriores.filter((rutina) => {
        if (vistos.has(rutina.id) || eliminadas.has(rutina.id)) return false;
        vistos.add(rutina.id);
        return true;
      });
      const activa = resultado.activa === undefined ? estado.activa : resultado.activa;
      publicar({
        activa: activa && eliminadas.has(activa.id) ? null : activa,
        anteriores: [...previas, ...nuevas],
        siguiente: resultado.siguiente,
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
    activar: () => {
      activo = true;
      return pedir('inicio');
    },
    desactivar: () => {
      activo = false;
      cancelar();
      if (estado.cargando) publicar({ cargando: null });
    },
    recargar: () => pedir('inicio'),
    /** Saca una rutina ya borrada en el servidor sin recargar las paginas. */
    quitar: (id: string) => {
      eliminadas.add(id);
      publicar({
        activa: estado.activa?.id === id ? null : estado.activa,
        anteriores: estado.anteriores.filter((rutina) => rutina.id !== id),
      });
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
