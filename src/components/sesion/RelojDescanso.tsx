/* Frencia · Sesion · Esfera y controles del descanso. */

import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { RestRing } from '@/components/RestRing';
import { LumeButton, LumeText, lumeFuente, lumeSpace, useLume } from '@/design/lume';
import { reloj } from '@/lib/tiempo';

/** Cuanto suma o resta cada toque a los botones del descanso, en segundos. */
const PASO_AJUSTE = 10;

/* Aviso de fin del descanso: tres golpes fuertes en vez de la notificacion del
   sistema, que con el telefono en el bolsillo pasa desapercibida. Lo que lo
   hace reconocible es la repeticion, no la fuerza de cada golpe: uno solo, por
   fuerte que sea, se confunde con cualquier otra cosa. */
const AVISO_FIN = [0, 160, 320];

function avisarFinDescanso() {
  if (Platform.OS === 'web') return;
  AVISO_FIN.forEach((demora) => {
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }, demora);
  });
}

/** Esfera y controles del descanso. El reloj de medio segundo vive aca
 *  adentro para no volver a dibujar toda la pantalla en cada tick, igual
 *  que IsoTimer en las series isometricas. */
export function RelojDescanso({
  clave,
  base,
  inicio,
  ajuste,
  yaVibro,
  onAjustar,
  onTerminadoChange,
}: {
  clave: string;
  base: number;
  inicio: number | undefined;
  ajuste: number;
  yaVibro: React.MutableRefObject<Set<string>>;
  onAjustar: (clave: string, nuevoAjuste: number) => void;
  onTerminadoChange: (terminado: boolean) => void;
}) {
  const { t } = useLume();
  const [ahora, setAhora] = useState(() => Date.now());

  // Cada medio segundo para que el numero no se atrase visiblemente respecto
  // del segundo real que se muestra.
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  // Duracion del descanso con los ajustes a mano ya aplicados. El aro se
  // dibuja contra esto para que la parte llena siga siendo la proporcion real.
  const totalDescanso = base > 0 ? base + ajuste : 0;
  const restante =
    base > 0
      ? inicio
        ? Math.max(0, totalDescanso - Math.floor((ahora - inicio) / 1000))
        : totalDescanso
      : 0;
  // Momento en que termina, para que el aro anime contra un instante fijo en
  // vez de reaccionar al tick del texto.
  const finDescanso = base > 0 && inicio ? inicio + totalDescanso * 1000 : 0;
  const finDelDescanso = restante === 0;

  const avisarTerminado = useRef(onTerminadoChange);
  useEffect(() => {
    avisarTerminado.current = onTerminadoChange;
  });
  useEffect(() => {
    avisarTerminado.current(finDelDescanso);
    return () => avisarTerminado.current(false);
  }, [finDelDescanso]);

  useEffect(() => {
    if (restante > 0) return;
    if (yaVibro.current.has(clave)) return;
    yaVibro.current.add(clave);
    avisarFinDescanso();
  }, [clave, restante, yaVibro]);

  /** Suma o resta segundos al descanso que esta corriendo. */
  function ajustarDescanso(delta: number) {
    if (!base) return;
    // Restar cuando ya no queda nada no hace nada: el descanso termino.
    if (delta < 0 && restante === 0) return;

    // El piso es lo que ya paso, no cero: restar 10 sobre 4 segundos termina
    // el descanso y no deja una deuda que despues haya que compensar sumando.
    const transcurrido = totalDescanso - restante;
    const nuevo = Math.max(transcurrido, totalDescanso + delta);
    if (nuevo === totalDescanso) return;

    // Sumar tiempo despues de que sono devuelve el aviso del nuevo final.
    if (delta > 0) yaVibro.current.delete(clave);
    onAjustar(clave, nuevo - base);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }

  return (
    <>
      <RestRing total={totalDescanso} finAt={finDescanso} restante={restante}>
        <LumeText rol="label" color={finDelDescanso ? t.signalText : t.textTertiary}>
          {finDelDescanso ? 'Listo' : 'Descanso'}
        </LumeText>
        <Text
          style={[styles.reloj, { color: finDelDescanso ? t.signalText : t.textPrimary }]}
        >
          {reloj(restante)}
        </Text>
        <LumeText rol="bodySm" color={t.textTertiary} style={styles.deTotal}>
          de {reloj(totalDescanso)}
        </LumeText>
      </RestRing>

      {/* El descanso del plan es una guia y el gimnasio no siempre la respeta.
         Restar no puede dejar el reloj en negativo, asi que con el descanso
         terminado solo queda sumar. */}
      <View style={styles.ajustes}>
        <LumeButton
          variant="secondary"
          size="sm"
          icon="minus"
          disabled={restante === 0}
          onPress={() => ajustarDescanso(-PASO_AJUSTE)}
          accessibilityLabel={`Restar ${PASO_AJUSTE} segundos al descanso`}
        >
          {PASO_AJUSTE} s
        </LumeButton>
        <LumeButton
          variant="secondary"
          size="sm"
          icon="plus"
          onPress={() => ajustarDescanso(PASO_AJUSTE)}
          accessibilityLabel={`Sumar ${PASO_AJUSTE} segundos al descanso`}
        >
          {PASO_AJUSTE} s
        </LumeButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  reloj: {
    fontFamily: lumeFuente.condMedium,
    fontSize: 60,
    lineHeight: 64,
    letterSpacing: -2.4,
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
  deTotal: { fontSize: 12.5, lineHeight: 17, fontVariant: ['tabular-nums'] },
  // Al ancho del contenido y no estirados: dos botones anchos debajo de la
  // esfera le pelearian el peso, y aca la esfera es lo que se mira.
  ajustes: { flexDirection: 'row', gap: lumeSpace[3] },
});
