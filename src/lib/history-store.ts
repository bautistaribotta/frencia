import { cargarHistorial, type CursorHistorial, type PaginaHistorial, type SesionTerminada } from './history';
import { crearListaPaginada, type EstadoPaginado } from './lista-paginada';

export interface EstadoHistorial extends EstadoPaginado<CursorHistorial> {
  sesiones: SesionTerminada[];
  proximaFecha: number | null;
}

/** Instancia por pantalla y usuario. */
export function crearHistorial(userId: string | null, consultar = cargarHistorial) {
  return crearListaPaginada<EstadoHistorial, CursorHistorial, Extract<PaginaHistorial, { estado: 'ok' }>>({
    userId,
    inicial: { sesiones: [], proximaFecha: null },
    consultar: (usuario, cursor, signal) => consultar(usuario, cursor, signal),
    recibir: (estado, resultado, tipo, unir) => ({
      sesiones: unir(tipo === 'mas' ? estado.sesiones : [], resultado.sesiones),
      proximaFecha: resultado.proximaFecha,
    }),
    quitar: (estado, id) => ({ sesiones: estado.sesiones.filter((sesion) => sesion.id !== id) }),
  });
}
