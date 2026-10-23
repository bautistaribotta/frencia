/* Frencia · Estados de las pestanias con lista (Rutinas e Historial), en Lume.
   - CargaPestania: la primera lectura. El titulo queda en el mismo lugar que
     tendra en la lista y el circulo con su leyenda ocupa el resto.
   - ErrorPestania: fallo la primera lectura (o la recarga). Tarjeta de vidrio
     con Reintentar en secundario; sin carmin, los datos no corren peligro.
   - VacioPestania: todavia no hay nada. Recuadro punteado sobre inset.
   - AvisoPie: fallo la pagina siguiente. Aviso chico en vidrio al pie de lo
     que ya estaba cargado, que queda como esta. */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/design';
import {
  Cargando,
  LumeButton,
  LumeText,
  Vidrio,
  lumeLayout,
  lumeRadius,
  lumeSpace,
  useLume,
  useLumeStyles,
  type LumePalette,
} from '@/design/lume';

export function CargaPestania({ titulo, texto }: { titulo: string; texto: string }) {
  const { t } = useLume();
  return (
    <>
      <View style={styles.tituloCarga}>
        <LumeText rol="label" color={t.textTertiary}>
          {titulo}
        </LumeText>
      </View>
      <View style={styles.carga}>
        <Cargando texto={texto} />
      </View>
    </>
  );
}

export function ErrorPestania({
  titulo,
  texto,
  onReintentar,
}: {
  titulo: string;
  texto: string;
  onReintentar: () => void;
}) {
  const { t } = useLume();
  return (
    <Vidrio style={styles.error} accessibilityLiveRegion="polite">
      <LumeText rol="bodySm" style={styles.centrado}>
        {titulo}
      </LumeText>
      <LumeText rol="bodySm" color={t.textSecondary} style={styles.centrado}>
        {texto}
      </LumeText>
      <LumeButton variant="secondary" onPress={onReintentar}>
        Reintentar
      </LumeButton>
    </Vidrio>
  );
}

export function VacioPestania({
  icono,
  titulo,
  texto,
  children,
}: {
  icono: IconName;
  titulo: string;
  texto: string;
  children?: React.ReactNode;
}) {
  const { t } = useLume();
  const tema = useLumeStyles(makeStyles);
  return (
    <View style={[styles.vacio, tema.vacio]}>
      <Icon name={icono} size={26} color={t.textTertiary} strokeWidth={1.75} />
      <LumeText rol="subtitle" style={styles.centrado}>
        {titulo}
      </LumeText>
      <LumeText rol="bodySm" color={t.textSecondary} style={[styles.centrado, styles.vacioParrafo]}>
        {texto}
      </LumeText>
      {children}
    </View>
  );
}

export function AvisoPie({ texto, onReintentar }: { texto: string; onReintentar: () => void }) {
  const { t } = useLume();
  return (
    <Vidrio radio={lumeRadius.lg} style={styles.aviso} accessibilityLiveRegion="polite">
      <LumeText rol="bodySm" color={t.textSecondary} style={styles.avisoTexto}>
        {texto}
      </LumeText>
      <LumeButton variant="soft" size="sm" icon="rotate-ccw" onPress={onReintentar}>
        Reintentar
      </LumeButton>
    </Vidrio>
  );
}

const styles = StyleSheet.create({
  tituloCarga: { paddingHorizontal: lumeLayout.padScreen, paddingTop: lumeSpace[6] },
  carga: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centrado: { textAlign: 'center' },
  error: { alignItems: 'center', gap: lumeSpace[5], padding: lumeLayout.padCard },
  vacio: {
    alignItems: 'center',
    gap: lumeSpace[5],
    paddingVertical: lumeSpace[10],
    paddingHorizontal: lumeSpace[6],
    borderRadius: lumeRadius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  vacioParrafo: { maxWidth: 290 },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[3],
    paddingVertical: lumeSpace[3],
    paddingRight: lumeSpace[3],
    paddingLeft: lumeSpace[5],
  },
  avisoTexto: { flex: 1 },
});

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    vacio: { backgroundColor: t.surfaceInset, borderColor: t.borderStrong },
  });
