/* Frencia · Los dias de una rutina como filas al hilo.
   El rotulo "Dias de entrenamiento" y una fila por dia con su cantidad de
   ejercicios y los dias de la semana. Con `onEditar` cada fila abre el dia
   para editarlo y lleva el lapiz; sin el, la fila lleva el chevron (la
   rutina es de otro: la vista previa de un link o una vinculada).
   La usan el detalle de una rutina y la vista previa de un link. */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SEMANA_CORTA } from '@/lib/dia';
import type { DiaResumen } from '@/lib/rutinas';

import { Icon } from '@/design';
import { LumeText, lumeFuente, lumeSpace, useLume, useLumeStyles, type LumePalette } from '@/design/lume';

function resumenDia(ejercicios: number, weekdays: number[]): string {
  const cuenta = `${ejercicios} ${ejercicios === 1 ? 'ejercicio' : 'ejercicios'}`;
  if (weekdays.length === 0) return cuenta;
  return `${cuenta} · ${weekdays.map((w) => SEMANA_CORTA[w]).join(', ')}`;
}

export interface DiasRutinaProps {
  dias: DiaResumen[];
  onEditar?: (dia: DiaResumen) => void;
}

export function DiasRutina({ dias, onEditar }: DiasRutinaProps) {
  const { t } = useLume();
  const tema = useLumeStyles(makeStyles);

  return (
    <View style={styles.seccion}>
      <LumeText rol="label" color={t.textTertiary}>
        Días de entrenamiento
      </LumeText>

      <View>
        {dias.map((d, i) => {
          const contenido = (
            <>
              <View style={styles.filaTexto}>
                <LumeText rol="bodySm" style={styles.filaNombre} numberOfLines={1}>
                  {d.name}
                </LumeText>
                <LumeText rol="label" color={t.textTertiary}>
                  {resumenDia(d.ejercicios, d.weekdays)}
                </LumeText>
              </View>
              {/* Editable, lapiz y no chevron: la fila no lleva a ver el dia,
                 lo abre para editarlo. Es el mismo icono que en el home. */}
              <Icon
                name={onEditar ? 'pencil' : 'chevron-right'}
                size={17}
                strokeWidth={1.75}
                color={t.textTertiary}
              />
            </>
          );

          if (!onEditar) {
            return (
              <View key={d.id} style={[styles.fila, i > 0 && tema.filaConLinea]}>
                {contenido}
              </View>
            );
          }
          return (
            <Pressable
              key={d.id}
              onPress={() => onEditar(d)}
              accessibilityRole="button"
              accessibilityLabel={`Editar ${d.name}`}
              style={({ pressed }) => [styles.fila, i > 0 && tema.filaConLinea, pressed && styles.presionada]}
            >
              {contenido}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: { gap: lumeSpace[4] },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    paddingVertical: lumeSpace[4],
    paddingHorizontal: lumeSpace[1],
    minHeight: 60,
  },
  filaTexto: { flex: 1, gap: lumeSpace[1] },
  filaNombre: { fontFamily: lumeFuente.semibold },
  presionada: { opacity: 0.6 },
});

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    filaConLinea: { borderTopWidth: 1, borderTopColor: t.divider },
  });
