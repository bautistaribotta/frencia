/* Frencia · Resumen de la sesion. Ver docs/specs/registro-de-sesion.md,
   seccion 6.4.

   Es el ultimo paso del wizard: se muestra antes de cerrar la sesion, asi un
   toque sin querer en Terminar no cierra nada. Hecho setea finished_at y
   vuelve al home; Volver a la sesion deja todo como estaba. El ticket y el
   marco de la pantalla son los mismos que el ticket de una sesion del
   historial. */

import React, { type RefObject } from 'react';
import { StyleSheet, View } from 'react-native';

import { MarcoTicket } from '@/components/MarcoTicket';
import { TicketSesion } from '@/components/TicketSesion';
import type { UnidadDistancia } from '@/lib/distancia';
import type { UnidadPeso } from '@/lib/peso';
import type { EjercicioResumen } from '@/lib/resumen-sesion';
import { Button } from '@/design';

export interface ResumenSesionProps {
  sessionId: string;
  nombreDia: string;
  /** Arranque de la sesion, en epoch ms. */
  inicio: number;
  duracionSegundos: number;
  ejercicios: EjercicioResumen[];
  unidad: UnidadPeso;
  unidadDistancia: UnidadDistancia;
  guardando: boolean;
  /** Lo que se captura como imagen al compartir. */
  capturaRef: RefObject<View | null>;
  compartiendo: boolean;
  onVolver: () => void;
  onCompartir: () => void;
  onHecho: () => void;
}

export function ResumenSesion({
  guardando,
  compartiendo,
  onVolver,
  onCompartir,
  onHecho,
  ...ticket
}: ResumenSesionProps) {
  return (
    <MarcoTicket
      encabezado={
        <Button variant="ghost" size="sm" icon="chevron-left" onPress={onVolver} disabled={guardando}>
          Volver a la sesión
        </Button>
      }
      acciones={
        <>
          <Button
            variant="secondary"
            size="lg"
            icon="share"
            style={styles.accion}
            onPress={onCompartir}
            loading={compartiendo}
            disabled={guardando}
          >
            Compartir
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon="check"
            style={styles.accion}
            onPress={onHecho}
            loading={guardando}
          >
            Hecho
          </Button>
        </>
      }
    >
      <TicketSesion {...ticket} />
    </MarcoTicket>
  );
}

const styles = StyleSheet.create({
  accion: { flex: 1 },
});
