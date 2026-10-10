/* Lectura del detalle de una sesion terminada para una pantalla: la usan el
   detalle del historial y su ticket. */

import { useEffect, useState } from 'react';

import { useSession } from '@/contexts/session';
import { cargarDetalleSesion, type ResultadoDetalleSesion } from '@/lib/session-history';

interface Lectura {
  userId: string;
  sessionId: string;
  intento: number;
  resultado: ResultadoDetalleSesion | null;
}

export interface DetalleSesion {
  /** null mientras carga. */
  resultado: ResultadoDetalleSesion | null;
  /** No hay id valido, no hay cuenta o la sesion no existe para esta cuenta. */
  noEncontrada: boolean;
  reintentar: () => void;
}

export function useDetalleSesion(sessionId: string | null): DetalleSesion {
  const { user, initializing } = useSession();
  const userId = user?.id ?? null;
  const [lectura, setLectura] = useState<Lectura | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!userId || !sessionId) return;

    const controller = new AbortController();
    const propietario = { userId, sessionId, intento };

    async function cargar() {
      let resultado: ResultadoDetalleSesion;
      try {
        resultado = await cargarDetalleSesion(
          propietario.userId,
          propietario.sessionId,
          controller.signal,
        );
      } catch {
        resultado = { estado: 'error' };
      }
      if (!controller.signal.aborted) setLectura({ ...propietario, resultado });
    }

    void cargar();
    return () => controller.abort();
  }, [userId, sessionId, intento]);

  // Se comprueba el propietario antes del render: el efecto de una cuenta o
  // ruta nueva todavia puede no haberse ejecutado y conservar la lectura vieja.
  const resultado =
    lectura?.userId === userId &&
    lectura?.sessionId === sessionId &&
    lectura?.intento === intento
      ? lectura.resultado
      : null;
  const noEncontrada =
    !sessionId || (!userId && !initializing) || resultado?.estado === 'no-encontrada';

  return { resultado, noEncontrada, reintentar: () => setIntento((n) => n + 1) };
}
