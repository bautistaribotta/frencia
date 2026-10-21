export type Pedido = 'inicio' | 'mas';

/** Campos que maneja la lista; el resto del estado lo define cada pantalla. */
export interface EstadoPaginado<C> {
  siguiente: C | null;
  loaded: boolean;
  cargando: Pedido | null;
  error: Pedido | null;
}

type Respuesta<R> = { estado: 'error' } | ({ estado: 'ok' } & R);

interface OpcionesLista<S extends EstadoPaginado<C>, C, R extends { siguiente: C | null }> {
  userId: string | null;
  inicial: Omit<S, keyof EstadoPaginado<C>>;
  consultar: (userId: string, cursor: C | null, signal: AbortSignal, tipo: Pedido, estado: S) => Promise<Respuesta<R>>;
  /** Arma lo propio de la pantalla con una respuesta ok. `unir` suma las
   * nuevas a las previas sin repetir ids ni devolver las ya borradas. */
  recibir: (
    estado: S,
    resultado: R,
    tipo: Pedido,
    unir: <T extends { id: string }>(previas: T[], nuevas: T[]) => T[],
    eliminadas: ReadonlySet<string>,
  ) => Partial<S>;
  /** Saca un elemento ya borrado en el servidor. */
  quitar: (estado: S, id: string) => Partial<S>;
}

/** Lista paginada por pantalla y usuario. La identidad de cada pedido protege
 * incluso si el transporte ignora AbortSignal y entrega una respuesta despues
 * de salir. */
export function crearListaPaginada<S extends EstadoPaginado<C>, C, R extends { siguiente: C | null }>(
  opciones: OpcionesLista<S, C, R>,
) {
  const { userId, consultar, recibir } = opciones;
  let estado = {
    ...opciones.inicial, siguiente: null, loaded: false, cargando: null, error: null,
  } as S;
  let activo = false;
  let pedido: AbortController | null = null;
  // Elementos borrados desde esta pantalla. Un pedido que salio antes de
  // borrar puede traerlos de vuelta; se filtran al publicar.
  const eliminadas = new Set<string>();
  const oyentes = new Set<() => void>();

  function publicar(cambio: Partial<S>) {
    estado = { ...estado, ...cambio };
    oyentes.forEach((oyente) => oyente());
  }

  function cancelar() {
    const anterior = pedido;
    pedido = null;
    anterior?.abort();
  }

  function unir<T extends { id: string }>(previas: T[], nuevas: T[]) {
    const vistos = new Set(previas.map((item) => item.id));
    const agregadas = nuevas.filter((item) => {
      if (vistos.has(item.id) || eliminadas.has(item.id)) return false;
      vistos.add(item.id);
      return true;
    });
    return [...previas, ...agregadas];
  }

  async function pedir(tipo: Pedido) {
    if (!activo || !userId) return;
    if (tipo === 'mas' && (pedido || !estado.loaded || !estado.siguiente || estado.error)) return;
    cancelar();
    const actual = new AbortController();
    pedido = actual;
    const cursor = tipo === 'mas' ? estado.siguiente : null;
    publicar({ cargando: tipo, error: null } as Partial<S>);

    try {
      const resultado = await consultar(userId, cursor, actual.signal, tipo, estado);
      if (!activo || pedido !== actual || actual.signal.aborted) return;
      if (resultado.estado === 'error') {
        publicar({ error: tipo, cargando: null } as Partial<S>);
        return;
      }
      publicar({
        ...recibir(estado, resultado, tipo, unir, eliminadas),
        siguiente: resultado.siguiente,
        loaded: true, cargando: null, error: null,
      });
    } catch {
      if (activo && pedido === actual && !actual.signal.aborted) publicar({ error: tipo, cargando: null } as Partial<S>);
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
    /** Con `conservar`, si ya hay datos no vuelve a pedir. */
    activar: (conservar = false) => {
      activo = true;
      if (!conservar || !estado.loaded) return pedir('inicio');
    },
    desactivar: () => {
      activo = false;
      cancelar();
      if (estado.cargando) publicar({ cargando: null } as Partial<S>);
    },
    recargar: () => pedir('inicio'),
    quitar: (id: string) => {
      eliminadas.add(id);
      publicar(opciones.quitar(estado, id));
    },
    cargarMas: () => pedir('mas'),
    reintentar: () => {
      if (!activo || pedido || !estado.error) return;
      const tipo = estado.error;
      publicar({ error: null } as Partial<S>);
      return pedir(tipo);
    },
  };
}
