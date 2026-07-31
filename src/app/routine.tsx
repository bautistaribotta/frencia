/* Frencia · Detalle de una rutina.
   Su nombre, si esta en curso o archivada, y los dias que la componen. Cada dia
   se toca para editarlo.

   Mantiene el idioma de la lista de rutinas —nombre en display, datos en
   monoespaciada, dias como filas al hilo— y no el del home, donde un dia es una
   tarjeta con su tira de semana y su boton Empezar. Empezar el entrenamiento se
   hace desde el home; aca se mira y se corrige el plan. */

import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { useToast } from '@/contexts/toast';
import { cargarRutina, periodo, type RutinaDetalle } from '@/lib/rutinas';

import {
  Badge,
  Button,
  FrenciaText,
  Icon,
  display,
  radius,
  sans,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

// Nombres cortos de la semana. 0 = lunes, igual que el check de la tabla.
const SEMANA_CORTA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function resumenDia(ejercicios: number, weekdays: number[]): string {
  const cuenta = `${ejercicios} ${ejercicios === 1 ? 'ejercicio' : 'ejercicios'}`;
  if (weekdays.length === 0) return cuenta;
  return `${cuenta} · ${weekdays.map((w) => SEMANA_CORTA[w]).join(', ')}`;
}

export default function RoutineScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { showToast } = useToast();

  const { id } = useLocalSearchParams<{ id?: string }>();

  const [rutina, setRutina] = useState<RutinaDetalle | null>(null);
  const [cargando, setCargando] = useState(true);

  // Relee al enfocar: se vuelve aca despues de editar un dia.
  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      (async () => {
        if (!id) {
          if (!cancelado) setCargando(false);
          return;
        }
        const data = await cargarRutina(id);
        if (cancelado) return;
        setRutina(data);
        setCargando(false);
      })();
      return () => {
        cancelado = true;
      };
    }, [id]),
  );

  function volver() {
    if (router.canGoBack()) router.back();
    else router.replace('/routines');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Button variant="ghost" size="sm" icon="chevron-left" onPress={volver}>
          Atrás
        </Button>
        {rutina && (
          <Button
            variant="ghost"
            size="sm"
            icon="pencil"
            onPress={() =>
              showToast({ message: 'Editar la rutina todavía no está disponible', type: 'info' })
            }
          >
            Editar rutina
          </Button>
        )}
      </View>

      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : !rutina ? (
        <View style={styles.centro}>
          <FrenciaText role="subtitle" style={styles.centerText}>
            No encontramos esta rutina
          </FrenciaText>
          <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.centerText}>
            Puede que la hayas borrado desde otro dispositivo.
          </FrenciaText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.titulo}>
            <Badge tone={rutina.activa ? 'green' : 'neutral'}>
              {rutina.activa ? 'En curso' : 'Archivada'}
            </Badge>
            <FrenciaText role="display" style={styles.nombre} numberOfLines={3}>
              {rutina.name}
            </FrenciaText>
            <FrenciaText role="data" color={colors.textSecondary}>
              {rutina.dias.length} {rutina.dias.length === 1 ? 'día' : 'días'} · {periodo(rutina)}
            </FrenciaText>
          </View>

          {rutina.dias.length === 0 ? (
            <View style={styles.vacio}>
              <Icon name="calendar-off" size={22} color={colors.textTertiary} />
              <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.centerText}>
                Esta rutina no tiene días.
              </FrenciaText>
            </View>
          ) : (
            <View style={styles.seccion}>
              <FrenciaText role="dataLabel" color={colors.textTertiary}>
                Días de entrenamiento
              </FrenciaText>

              <View>
                {rutina.dias.map((d, i) => (
                  <Pressable
                    key={d.id}
                    onPress={() => router.push({ pathname: '/edit-day', params: { dia: d.id } })}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar ${d.name}`}
                    style={({ pressed }) => [
                      styles.fila,
                      i > 0 && styles.filaDivisor,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.filaTexto}>
                      <FrenciaText role="bodySm" style={styles.filaNombre} numberOfLines={1}>
                        {d.name}
                      </FrenciaText>
                      <FrenciaText role="dataLabel" color={colors.textTertiary}>
                        {resumenDia(d.ejercicios, d.weekdays)}
                      </FrenciaText>
                    </View>
                    <Icon name="chevron-right" size={17} color={colors.textTertiary} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.padScreen,
      paddingVertical: space[5],
      minHeight: 40,
    },

    scroll: {
      paddingHorizontal: spacing.padScreen,
      paddingTop: space[4],
      paddingBottom: space[10],
      gap: space[7],
    },

    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[3] },
    centerText: { textAlign: 'center' },
    pressed: { opacity: 0.75 },

    titulo: { gap: space[3], alignItems: 'flex-start' },
    // Anton no es de ancho fijo y el nombre lo pone el usuario, asi que se
    // achica respecto del display por defecto para que entre en pocas lineas.
    nombre: {
      fontFamily: display,
      fontSize: 34,
      lineHeight: 38,
      textTransform: 'uppercase',
      includeFontPadding: false,
    },

    seccion: { gap: space[3] },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      paddingVertical: space[4],
      paddingHorizontal: space[1],
    },
    filaDivisor: { borderTopWidth: 1, borderTopColor: colors.divider },
    filaTexto: { flex: 1, gap: space[1] },
    filaNombre: { fontFamily: sans.semibold, color: colors.textPrimary },

    vacio: {
      alignItems: 'center',
      gap: space[3],
      paddingVertical: space[8],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderSubtle,
    },
  });
