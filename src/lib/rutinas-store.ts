import { crearListaPaginada, type EstadoPaginado } from './lista-paginada';
import { cargarRutinas, RUTINAS_PAGINA, type CursorRutinas, type PaginaRutinas, type RutinaResumen } from './rutinas';

export interface EstadoRutinas extends EstadoPaginado<CursorRutinas> {
  activa: RutinaResumen | null;
  anteriores: RutinaResumen[];
}

/** Instancia por pantalla y usuario, con el mismo esquema que el historial.
 * A diferencia de el, cada recarga vuelve a pedir desde el principio: al volver
 * de crear o editar una rutina el cambio tiene que verse. Para no achicar la
 * lista ni mover el scroll, la recarga trae de una vez todas las que ya estaban
 * a la vista. */
export function crearRutinas(userId: string | null, consultar = cargarRutinas) {
  return crearListaPaginada<EstadoRutinas, CursorRutinas, Extract<PaginaRutinas, { estado: 'ok' }>>({
    userId,
    inicial: { activa: null, anteriores: [] },
    consultar: (usuario, cursor, signal, tipo, estado) => {
      const limite = tipo === 'inicio' ? Math.max(RUTINAS_PAGINA, estado.anteriores.length) : RUTINAS_PAGINA;
      return consultar(usuario, cursor, signal, limite);
    },
    recibir: (estado, resultado, tipo, unir, eliminadas) => {
      const activa = resultado.activa === undefined ? estado.activa : resultado.activa;
      return {
        activa: activa && eliminadas.has(activa.id) ? null : activa,
        anteriores: unir(tipo === 'mas' ? estado.anteriores : [], resultado.anteriores),
      };
    },
    quitar: (estado, id) => ({
      activa: estado.activa?.id === id ? null : estado.activa,
      anteriores: estado.anteriores.filter((rutina) => rutina.id !== id),
    }),
  });
}
