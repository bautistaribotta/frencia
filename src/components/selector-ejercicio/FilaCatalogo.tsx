/* Frencia · Selector de ejercicio · Fila del catalogo. */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ExerciseTypeTag, Icon, Tag } from '@/design';
import {
  LumeButton,
  LumeText,
  lumeFuente,
  lumeMotion,
  lumeRadius,
  lumeSpace,
  useLume,
  useLumeStyles,
  type LumePalette,
  type LumeSombras,
} from '@/design/lume';
import { TIPOS, datosAbreviados, equipmentLabel, type Exercise } from '@/lib/exercises';

interface FilaCatalogoProps {
  exercise: Exercise;
  abierta: boolean;
  onToggle: (id: string) => void;
  onAdd: (exercise: Exercise) => void;
}

/** Fila del catalogo. Plegada: nombre en una linea y musculo objetivo.
 *  Desplegada: nombre completo, musculos (el objetivo con punto) y
 *  equipamiento, y el boton que pasa a configurarlo; sube a vidrio fuerte.
 *  Lo tocable es la cabecera, no la fila entera: un boton adentro de otro es
 *  HTML invalido en web, y en iOS VoiceOver agrupa la fila en un solo
 *  elemento y el boton Anadir queda inalcanzable. */
export const FilaCatalogo = React.memo(function FilaCatalogo({
  exercise,
  abierta,
  onToggle,
  onAdd,
}: FilaCatalogoProps) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);
  const equipo = equipmentLabel(exercise.equipment);
  // La fuerza es casi todo el catalogo: su tipo no se anuncia en cada fila.
  // Los demas si, porque cambian lo que se carga en la sesion.
  const tipo = exercise.kind === 'fuerza' ? null : TIPOS[exercise.kind];

  return (
    <View
      style={[styles.fila, abierta && styles.filaAbierta]}
    >
      <Pressable
        onPress={() => onToggle(exercise.id)}
        accessibilityRole="button"
        accessibilityState={{ expanded: abierta }}
        accessibilityLabel={[exercise.name, exercise.primary?.name, tipo?.label].filter(Boolean).join(', ')}
        style={({ pressed }) => [
          styles.filaCabeza,
          abierta && styles.filaCabezaAbierta,
          pressed && !abierta && styles.filaPresionada,
        ]}
      >
        <View style={styles.filaPrincipal}>
          <LumeText rol="body" style={styles.filaNombre} numberOfLines={abierta ? undefined : 1}>
            {exercise.name}
          </LumeText>
          {tipo && !abierta ? (
            <ExerciseTypeTag label={tipo.label} icon={tipo.icon} metrics={datosAbreviados(exercise.tracks)} />
          ) : null}
        </View>
        {!abierta && exercise.primary && (
          <LumeText rol="bodySm" color={t.textTertiary} style={styles.filaMusculo} numberOfLines={1}>
            {exercise.primary.name}
          </LumeText>
        )}
        <Icon
          name={abierta ? 'chevron-up' : 'chevron-down'}
          size={18}
          strokeWidth={1.75}
          color={t.textTertiary}
        />
      </Pressable>

      {abierta && (
        <Animated.View entering={FadeIn.duration(lumeMotion.durBase)} style={styles.filaDetalle}>
          <View style={styles.filaMeta}>
            <View style={styles.filaMusculos}>
              {exercise.primary && <Tag dot>{exercise.primary.name}</Tag>}
              {exercise.secondary.map((m) => (
                <Tag key={m.slug}>{m.name}</Tag>
              ))}
            </View>
            {equipo && (
              <LumeText rol="bodySm" color={t.textTertiary}>
                {equipo}
              </LumeText>
            )}
          </View>
          <LumeButton variant="primary" size="md" icon="plus" fullWidth onPress={() => onAdd(exercise)}>
            Añadir
          </LumeButton>
        </Animated.View>
      )}
    </View>
  );
});

const makeStyles = (t: LumePalette, sombras: LumeSombras) =>
  StyleSheet.create({
    // Filas planas con divisor. Desplegada sube a vidrio fuerte; el margen
    // negativo compensa su padding para que el texto no se corra. El alto lo da
    // la cabecera, asi toda la fila plegada responde al toque.
    fila: { borderBottomWidth: 1, borderBottomColor: t.divider },
    filaAbierta: {
      marginHorizontal: -lumeSpace[4],
      marginVertical: lumeSpace[2],
      paddingHorizontal: lumeSpace[4],
      paddingBottom: lumeSpace[5],
      borderRadius: lumeRadius.lg,
      borderWidth: 1,
      backgroundColor: t.surfaceCardElevated,
      borderColor: t.glassLine,
      borderTopColor: t.glassHighlight,
      boxShadow: sombras.glass,
    },
    filaPresionada: { opacity: 0.6 },
    filaCabeza: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[4], paddingVertical: 14 },
    filaCabezaAbierta: { paddingVertical: lumeSpace[5] },
    filaPrincipal: { flex: 1, minWidth: 0, gap: 5 },
    filaNombre: { fontFamily: lumeFuente.medium, lineHeight: 22 },
    filaMusculo: { maxWidth: 104, fontSize: 13, lineHeight: 18, textAlign: 'right' },
    filaDetalle: { gap: lumeSpace[5] },
    filaMeta: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[4] },
    filaMusculos: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: lumeSpace[3] },
  });
