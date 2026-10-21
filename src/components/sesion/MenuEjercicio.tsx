/* Frencia · Sesion · Menu del ejercicio. Lista de acciones con icono en
   lugar de una pila de botones: ninguna compite con la otra. */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Hoja } from '@/components/Hoja';
import { Icon, type IconName } from '@/design';
import { Cargando, LumeButton, LumeText, lumeFuente, lumeSpace, useLume } from '@/design/lume';

export function MenuEjercicio({
  visible,
  nombre,
  cardio,
  esSerie,
  textoSaltar,
  guardando,
  onCerrar,
  onSumarSerie,
  onSaltarSerie,
  onCortarEjercicio,
  onTerminarSesion,
}: {
  visible: boolean;
  nombre: string;
  cardio: boolean;
  esSerie: boolean;
  textoSaltar: string;
  guardando: boolean;
  onCerrar: () => void;
  onSumarSerie: () => void;
  onSaltarSerie: () => void;
  onCortarEjercicio: () => void;
  onTerminarSesion: () => void;
}) {
  const { t } = useLume();
  return (
    <Hoja visible={visible} onCerrar={onCerrar}>
      <LumeText rol="label" color={t.textTertiary} numberOfLines={1}>
        {nombre}
      </LumeText>
      <View>
        {/* El cardio es una sola serie continua: no se le suman series,
           y terminar el ejercicio en la serie actual no cambia nada. */}
        {!cardio ? <FilaMenu icono="plus" texto="Sumar una serie" onPress={onSumarSerie} /> : null}
        {esSerie ? (
          <FilaMenu icono="skip-forward" texto={textoSaltar} onPress={onSaltarSerie} />
        ) : null}
        {!cardio ? (
          <FilaMenu icono="check" texto="Terminar este ejercicio" onPress={onCortarEjercicio} />
        ) : null}
        <FilaMenu
          icono="flag"
          texto="Terminar la sesión"
          onPress={onTerminarSesion}
          cargando={guardando}
          ultima
        />
      </View>
      <LumeButton variant="secondary" size="lg" fullWidth onPress={onCerrar}>
        Cancelar
      </LumeButton>
    </Hoja>
  );
}

/** Una fila del menu del ejercicio. */
function FilaMenu({
  icono,
  texto,
  onPress,
  cargando = false,
  ultima = false,
}: {
  icono: IconName;
  texto: string;
  onPress: () => void;
  cargando?: boolean;
  ultima?: boolean;
}) {
  const { t } = useLume();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={cargando}
      style={({ pressed }) => [
        styles.filaMenu,
        !ultima && { borderBottomWidth: 1, borderBottomColor: t.divider },
        pressed && { backgroundColor: t.surfaceChip },
      ]}
    >
      <Icon name={icono} size={20} strokeWidth={1.75} color={t.textSecondary} />
      <LumeText rol="body" style={styles.filaMenuTexto}>
        {texto}
      </LumeText>
      {cargando ? <Cargando tam="sm" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filaMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    height: 56,
    paddingHorizontal: lumeSpace[2],
  },
  filaMenuTexto: { flex: 1, fontFamily: lumeFuente.medium, lineHeight: 20 },
});
