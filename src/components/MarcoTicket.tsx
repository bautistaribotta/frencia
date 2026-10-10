/* Frencia · Pantalla de un ticket: el boton de volver arriba, el ticket en un
   scroll que se funde contra el fondo en los dos bordes y las acciones abajo.
   La usan el resumen al terminar la sesion y el ticket de una sesion del
   historial; cada una pone su propio encabezado y sus acciones. */

import React, { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ANCHO_TICKET, MARGEN_CAPTURA } from '@/components/TicketSesion';
import { space, spacing, useColors, useThemedStyles, withAlpha } from '@/design';

export interface MarcoTicketProps {
  /** El boton de volver, alineado a la izquierda. */
  encabezado: ReactNode;
  /** Botones de abajo; cada uno ocupa el mismo ancho. */
  acciones: ReactNode;
  /** El ticket. */
  children: ReactNode;
}

export function MarcoTicket({ encabezado, acciones, children }: MarcoTicketProps) {
  const styles = useThemedStyles(makeStyles);
  const colors = useColors();

  return (
    <View style={styles.flex}>
      <View style={styles.header}>{encabezado}</View>

      <View style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {/* Funde el ticket contra el fondo en los dos bordes del scroll: arriba
           bajo el boton de volver y abajo antes de los botones, en lugar del
           corte seco. No interceptan toques. */}
        <LinearGradient
          colors={[colors.bgApp, withAlpha(colors.bgApp, 0)]}
          style={styles.fadeTop}
        />
        <LinearGradient
          colors={[withAlpha(colors.bgApp, 0), colors.bgApp]}
          style={styles.fadeBottom}
        />
      </View>

      <View style={styles.acciones}>{acciones}</View>
    </View>
  );
}

// Alto de los degradados que funden el scroll contra el encabezado y los botones.
const FUNDIDO_ARRIBA = space[7];
const FUNDIDO = space[9];

const makeStyles = () =>
  StyleSheet.create({
    flex: { flex: 1 },
    header: {
      flexDirection: 'row',
      paddingHorizontal: spacing.padScreen,
      paddingVertical: space[5],
    },
    scroll: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      // En los extremos del scroll el ticket tiene que poder salir de los
      // degradados; la captura ya pone parte de ese aire.
      paddingTop: FUNDIDO_ARRIBA - MARGEN_CAPTURA.arriba,
      paddingBottom: FUNDIDO - MARGEN_CAPTURA.abajo,
    },
    fadeTop: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: FUNDIDO_ARRIBA,
      pointerEvents: 'none',
    },
    fadeBottom: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: FUNDIDO,
      pointerEvents: 'none',
    },
    acciones: {
      flexDirection: 'row',
      gap: 10,
      alignSelf: 'center',
      width: '100%',
      maxWidth: ANCHO_TICKET + spacing.padScreen * 2,
      paddingHorizontal: spacing.padScreen,
      paddingBottom: space[5],
    },
  });
