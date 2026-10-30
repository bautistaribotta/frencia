/* Frencia · Pantalla de un ticket: el boton de volver arriba, el ticket en un
   scroll que se funde en los dos bordes y las acciones abajo.
   La usan el resumen al terminar la sesion y el ticket de una sesion del
   historial; cada una pone su propio encabezado y sus acciones.
   Va en Lume: los bordes del scroll se funden con una mascara y no con un
   degradado al color de fondo, porque debajo hay luces, no un color plano. */

import React, { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaskedView } from '@/components/MaskedView';

import { ANCHO_TICKET, MARGEN_CAPTURA } from '@/components/TicketSesion';
import { MASCARA_LLENA, MASCARA_VACIA, lumeLayout, lumeSpace } from '@/design/lume';

export interface MarcoTicketProps {
  /** El boton de volver, alineado a la izquierda. */
  encabezado: ReactNode;
  /** Botones de abajo; cada uno ocupa el mismo ancho. */
  acciones: ReactNode;
  /** El ticket. */
  children: ReactNode;
}

// Alto de los fundidos contra el encabezado y contra los botones.
const FUNDIDO_ARRIBA = lumeSpace[7];
const FUNDIDO = lumeSpace[9];

export function MarcoTicket({ encabezado, acciones, children }: MarcoTicketProps) {
  return (
    <View style={styles.flex}>
      <View style={styles.header}>{encabezado}</View>

      <MaskedView
        style={styles.flex}
        maskElement={
          <View style={styles.flex}>
            <LinearGradient colors={[MASCARA_VACIA, MASCARA_LLENA]} style={styles.fundidoArriba} />
            <View style={styles.mascaraLlena} />
            <LinearGradient colors={[MASCARA_LLENA, MASCARA_VACIA]} style={styles.fundidoAbajo} />
          </View>
        }
      >
        <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </MaskedView>

      <View style={styles.acciones}>{acciones}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // El boton ghost trae su propio padding: el margen lo corre 10 px a la
  // izquierda para que el chevron quede alineado con el borde del contenido.
  header: {
    flexDirection: 'row',
    paddingHorizontal: lumeLayout.padScreen - 10,
    paddingVertical: lumeSpace[3],
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // En los extremos del scroll el ticket tiene que poder salir de los
    // fundidos; la captura ya pone parte de ese aire.
    paddingTop: FUNDIDO_ARRIBA - MARGEN_CAPTURA.arriba,
    paddingBottom: FUNDIDO - MARGEN_CAPTURA.abajo,
  },
  fundidoArriba: { height: FUNDIDO_ARRIBA },
  mascaraLlena: { flex: 1, backgroundColor: MASCARA_LLENA },
  fundidoAbajo: { height: FUNDIDO },
  acciones: {
    flexDirection: 'row',
    gap: lumeSpace[3],
    alignSelf: 'center',
    width: '100%',
    maxWidth: ANCHO_TICKET + lumeLayout.padScreen * 2,
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[3],
    paddingBottom: lumeSpace[5],
  },
});
