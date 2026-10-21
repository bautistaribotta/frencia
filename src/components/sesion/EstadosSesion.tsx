/* Frencia · Sesion · Pantallas de borde: otra sesion abierta y dia sin
   ejercicios. */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/design';
import { LumeButton, LumeText, Vidrio, lumeLayout, lumeRadius, lumeSpace, useLume } from '@/design/lume';
import type { ConflictoSesion } from '@/lib/sesion-estado';

export function SesionEnConflicto({
  conflicto,
  onRetomar,
  onDescartar,
  onVolver,
}: {
  conflicto: ConflictoSesion;
  onRetomar: () => void;
  onDescartar: () => void;
  onVolver: () => void;
}) {
  const { t } = useLume();
  return (
    <View style={styles.centro}>
      <Vidrio radio={lumeRadius.lg} style={styles.iconoCaja}>
        <Icon name="alert-triangle" size={24} strokeWidth={1.75} color={t.intensityText} />
      </Vidrio>
      <LumeText rol="title" style={styles.centrado}>
        Tenés una sesión sin terminar
      </LumeText>
      <LumeText rol="bodySm" color={t.textSecondary} style={styles.centrado}>
        Quedó abierta en {conflicto.nombre}. Solo puede haber una sesión a la vez, así que hay
        que cerrarla antes de empezar esta.
      </LumeText>
      {/* Retomar es la accion principal; descartar va delineado en carmin. */}
      {conflicto.diaId ? (
        <LumeButton variant="primary" size="lg" icon="play" fullWidth onPress={onRetomar}>
          Retomar la anterior
        </LumeButton>
      ) : null}
      <LumeButton variant="danger" size="lg" icon="trash-2" fullWidth onPress={onDescartar}>
        Descartarla y empezar esta
      </LumeButton>
      <LumeButton variant="ghost" size="lg" fullWidth onPress={onVolver}>
        Volver
      </LumeButton>
    </View>
  );
}

export function SesionSinEjercicios({ nombreDia, onVolver }: { nombreDia: string; onVolver: () => void }) {
  const { t } = useLume();
  return (
    <View style={styles.centro}>
      <Icon name="dumbbell" size={28} strokeWidth={1.75} color={t.textTertiary} />
      <LumeText rol="bodySm" color={t.textTertiary} style={styles.centrado}>
        {nombreDia} no tiene ejercicios cargados.
      </LumeText>
      <LumeButton variant="secondary" size="lg" fullWidth onPress={onVolver}>
        Volver
      </LumeButton>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: lumeSpace[5],
    padding: lumeLayout.padScreen,
  },
  centrado: { textAlign: 'center' },
  iconoCaja: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: lumeSpace[3],
  },
});
