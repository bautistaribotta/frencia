/* Frencia · Inicio — pantalla principal (Lume).
   Sin rutinas: una frase, la accion de crear la primera rutina y la guia
   de primeros pasos.
   Con rutinas: cada dia de la rutina activa es una tarjeta de vidrio con su
   tira de semana y Empezar. Solo el proximo dia lleva Empezar en lume (y su
   tarjeta en vidrio fuerte); los demas, en vidrio. Las rutinas se releen cada
   vez que la pantalla recupera el foco, asi reflejan lo recien creado en el
   wizard, y al tirar hacia abajo desde el inicio.
   Arriba a la derecha va la racha de entrenamientos planificados cumplidos
   (ver docs/specs/racha-de-entrenamientos.md): en tinta y con la llama si
   esta viva, neutra si hoy toca y todavia no se entreno.
   Fondo: cumbre, pleno, quieto. */

import React, { useCallback, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { useProfile } from '@/contexts/profile';
import { useSession } from '@/contexts/session';
import { SEMANA_CORTA, SEMANA_NOMBRES } from '@/lib/dia';
import { cargarFechasEntrenadas } from '@/lib/history';
import { calcularRacha, fechaLocal, type Racha } from '@/lib/streak';
import { cargarRutinaActiva, type DiaResumen, type RutinaDetalle } from '@/lib/rutinas';
import { indiceSemanaLunes, MESES_CORTO } from '@/lib/tiempo';
import { useVolverArribaAlRetocar } from '@/lib/volver-arriba';

import { Icon } from '@/design';
import {
  Fondo,
  LumeAvatar,
  LumeBadge,
  LumeButton,
  LumeIconButton,
  LumeText,
  Semana,
  Vidrio,
  lumeFuente,
  lumeLayout,
  lumeRadius,
  lumeSpace,
  useLume,
  useLumeStyles,
  type LumePalette,
  type LumeSombras,
} from '@/design/lume';

interface Step {
  n: number;
  title: string;
  sub: string;
  state: 'active' | 'locked';
}

const STEPS: Step[] = [
  { n: 1, title: 'Creá tu primera rutina', sub: 'Ejercicios, series y repeticiones', state: 'active' },
  { n: 2, title: 'Registrá una sesión', sub: 'Peso, reps y RIR mientras entrenás', state: 'locked' },
  { n: 3, title: 'Seguí tu progreso', sub: 'PR, volumen semanal y 1RM estimado', state: 'locked' },
];

/** "Jueves · 12 jun", la fecha de hoy en la linea del saludo. */
function fechaSaludo(d: Date): string {
  return `${SEMANA_NOMBRES[indiceSemanaLunes(d)]} · ${d.getDate()} ${MESES_CORTO[d.getMonth()]}`;
}

/** El dia que toca antes, contando desde hoy (hoy incluido). Sin dias de la
    semana asignados, el primero de la rutina. */
function indiceProximo(days: DiaResumen[], hoy: number): number {
  let mejor = 0;
  let distancia = 8;
  days.forEach((d, i) => {
    for (const w of d.weekdays) {
      const k = (w - hoy + 7) % 7;
      if (k < distancia) {
        distancia = k;
        mejor = i;
      }
    }
  });
  return mejor;
}

export default function HomeScreen() {
  const { t } = useLume();
  const tema = useLumeStyles(makeStyles);
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  useVolverArribaAlRetocar(scrollRef);
  const { displayName, profile } = useProfile();
  // El usuario sale de la sesion local: getUser() hace un pedido HTTP y falla
  // sin red.
  const { user } = useSession();
  const userId = user?.id ?? null;
  const first = displayName.split(' ')[0];

  const [routine, setRoutine] = useState<RutinaDetalle | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [racha, setRacha] = useState<Racha | null>(null);
  // Como en rutinas e historial: el RefreshControl solo se muestra cuando la
  // recarga la inicio el gesto de tirar hacia abajo, no en la del foco.
  const [refrescando, setRefrescando] = useState(false);
  // Numera las cargas: solo la ultima publica, asi una recarga del gesto y una
  // del foco que se pisan no dejan datos viejos.
  const ultimaCarga = useRef(0);

  // Lee la rutina activa y la racha. vigente() deja de ser verdadero si llego
  // otra carga despues o, en la del foco, si la pantalla lo perdio.
  const cargar = useCallback(async (vigente: () => boolean) => {
    if (!userId) {
      if (vigente()) {
        setRoutine(null);
        setRacha(null);
        setLoaded(true);
      }
      return;
    }
    const data = await cargarRutinaActiva(userId);
    if (!vigente()) return;
    setRoutine(data);
    setLoaded(true);

    // La racha se deriva de los weekdays de la rutina activa y de las
    // fechas con sesion terminada. Sin weekdays no hay contra que medir.
    const weekdays = (data?.dias ?? []).flatMap((d) => d.weekdays);
    if (weekdays.length === 0) {
      setRacha(null);
      return;
    }
    const fechas = await cargarFechasEntrenadas(userId);
    if (!vigente()) return;
    setRacha(fechas ? calcularRacha(weekdays, fechas, fechaLocal(Date.now())) : null);
  }, [userId]);

  // Relee la rutina activa al enfocar la pantalla (incluye volver del wizard).
  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      const id = ++ultimaCarga.current;
      void cargar(() => !cancelado && id === ultimaCarga.current);
      return () => {
        cancelado = true;
      };
    }, [cargar]),
  );

  async function refrescar() {
    setRefrescando(true);
    const id = ++ultimaCarga.current;
    try {
      await cargar(() => id === ultimaCarga.current);
    } finally {
      setRefrescando(false);
    }
  }

  // navigate y no push: el perfil es una pestania, asi que se cambia a ella en
  // vez de apilar otra copia encima.
  const openProfile = () => router.navigate('/profile');
  const onCreateRoutine = () => router.push('/create-routine');
  const hasRoutine = routine !== null && routine.dias.length > 0;
  const proximo = hasRoutine ? indiceProximo(routine.dias, indiceSemanaLunes(new Date())) : -1;

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="cumbre" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={() => { void refrescar(); }}
              tintColor={t.textPrimary}
              colors={[t.textPrimary]}
              progressBackgroundColor={t.surfaceRaisedOpaco}
            />
          }
        >
          {/* Saludo */}
          <View style={styles.saludo}>
            <Pressable
              style={styles.saludoIzq}
              onPress={openProfile}
              accessibilityRole="button"
              accessibilityLabel="Abrir perfil"
            >
              <LumeAvatar
                name={profile?.avatarSeed ?? displayName}
                src={profile?.avatarUrl ?? undefined}
                cacheKey={profile?.avatarPath}
                size="md"
                ring
              />
              <View style={styles.saludoTexto}>
                <LumeText rol="subtitle" numberOfLines={1}>
                  Hola, {first}
                </LumeText>
                <LumeText rol="label" color={t.textTertiary}>
                  {fechaSaludo(new Date())}
                </LumeText>
              </View>
            </Pressable>
            {/* Llama en tinta con la racha viva; neutra si hoy toca y todavia
                no entreno. Racha cero: no se muestra nada. */}
            {racha && racha.racha > 0 && (
              <View
                accessibilityRole="text"
                accessibilityLabel={`Racha de ${racha.racha} ${racha.racha === 1 ? 'entrenamiento' : 'entrenamientos'}${racha.pendienteHoy ? ', hoy pendiente' : ''}`}
              >
                <LumeBadge tone={racha.pendienteHoy ? 'neutral' : 'intensity'} icon="flame">
                  {racha.racha}
                </LumeBadge>
              </View>
            )}
          </View>

          {/* Hasta tener la primera lectura no decidimos que mostrar. */}
          {!loaded ? null : hasRoutine ? (
            /* Rutina activa y sus dias de entrenamiento */
            <View style={styles.bloque}>
              <View style={styles.encabezado}>
                <LumeText rol="subtitle" numberOfLines={1} style={styles.nombreRutina}>
                  {routine.name}
                </LumeText>
                <LumeText rol="label" color={t.textTertiary}>
                  {routine.dias.length} {routine.dias.length === 1 ? 'día' : 'días'}
                </LumeText>
              </View>

              {routine.dias.map((d, i) => {
                const esProximo = i === proximo;
                return (
                  <Vidrio key={d.id} nivel={esProximo ? 'fuerte' : 'normal'} style={styles.tarjeta}>
                    {/* El lapiz va en la tarjeta del dia, no en la cabecera de
                       la rutina: lo que se edita es este dia. Ghost para que no
                       le dispute la atencion a Empezar. */}
                    <View style={styles.tarjetaCabeza}>
                      <View style={styles.tarjetaTexto}>
                        <LumeText rol="subtitle" numberOfLines={1}>
                          {d.name}
                        </LumeText>
                        <LumeText rol="label" color={t.textTertiary} numberOfLines={1}>
                          {esProximo ? <LumeText rol="label" color={t.signalText}>Próximo · </LumeText> : null}
                          {d.ejercicios} {d.ejercicios === 1 ? 'ejercicio' : 'ejercicios'}
                          {d.weekdays.length > 0
                            ? ` · ${d.weekdays.map((w) => SEMANA_CORTA[w]).join(', ')}`
                            : ''}
                        </LumeText>
                      </View>
                      <LumeIconButton
                        icon="pencil"
                        variant="ghost"
                        size="sm"
                        accessibilityLabel={`Editar ${d.name}`}
                        onPress={() => router.push({ pathname: '/edit-day', params: { dia: d.id } })}
                      />
                    </View>

                    <Semana marcados={d.weekdays} />

                    <LumeButton
                      variant={esProximo ? 'primary' : 'secondary'}
                      size="lg"
                      icon="play"
                      fullWidth
                      onPress={() =>
                        router.push({ pathname: '/session', params: { dia: d.id, nombre: d.name } })
                      }
                    >
                      Empezar
                    </LumeButton>
                  </Vidrio>
                );
              })}

              {/* Solo puede haber una rutina activa: al crear otra el usuario
                 elige si reemplaza la actual o la guarda. Lo avisamos para que
                 no sea una sorpresa. */}
              <View style={styles.nuevaRutina}>
                <LumeButton variant="secondary" size="lg" icon="plus" fullWidth onPress={onCreateRoutine}>
                  Crear rutina nueva
                </LumeButton>
                <LumeText rol="label" color={t.textTertiary} style={styles.centrado}>
                  Podés reemplazar la actual o guardarla
                </LumeText>
              </View>
            </View>
          ) : (
            /* Cuenta nueva: una frase y una accion */
            <>
              <View style={styles.bloque}>
                <Vidrio radio={lumeRadius['2xl']} style={styles.hero}>
                  <View style={styles.heroTexto}>
                    <LumeText rol="label" color={t.textTertiary}>
                      Tu sesión de hoy
                    </LumeText>
                    <LumeText rol="display" style={styles.heroTitulo}>
                      Empezá por tu rutina.
                    </LumeText>
                    <LumeText rol="bodySm" color={t.textSecondary} style={styles.heroParrafo}>
                      Todavía no tenés rutinas. Cargá la que ya usás y registrá cada serie a tu manera.
                    </LumeText>
                  </View>
                  <LumeButton variant="primary" size="lg" icon="plus" fullWidth onPress={onCreateRoutine}>
                    Crear primera rutina
                  </LumeButton>
                </Vidrio>

                <View style={styles.sinSesiones}>
                  <Icon name="calendar-off" size={13} color={t.textTertiary} strokeWidth={1.75} />
                  <LumeText rol="label" color={t.textTertiary}>
                    Sin sesiones programadas
                  </LumeText>
                </View>
              </View>

              {/* Primeros pasos */}
              <View style={styles.bloque}>
                <View style={styles.encabezado}>
                  <LumeText rol="label" color={t.textTertiary}>
                    Primeros pasos
                  </LumeText>
                  <LumeText rol="label" color={t.textTertiary}>
                    0 / 3
                  </LumeText>
                </View>

                <Vidrio style={styles.pasos}>
                  {STEPS.map((s, i) => {
                    const active = s.state === 'active';
                    return (
                      <Pressable
                        key={s.n}
                        onPress={active ? onCreateRoutine : undefined}
                        disabled={!active}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: !active }}
                        style={({ pressed }) => [
                          styles.paso,
                          i > 0 && tema.pasoConLinea,
                          !active && styles.pasoBloqueado,
                          pressed && active && tema.presionado,
                        ]}
                      >
                        <View
                          style={[
                            styles.pasoNum,
                            active ? tema.pasoNumActivo : tema.pasoNumBloqueado,
                          ]}
                        >
                          <LumeText
                            rol="data"
                            color={active ? t.textOnAccent : t.textTertiary}
                            style={styles.pasoNumTexto}
                          >
                            {s.n}
                          </LumeText>
                        </View>
                        <View style={styles.pasoTexto}>
                          <LumeText rol="bodySm" style={styles.pasoTitulo}>
                            {s.title}
                          </LumeText>
                          <LumeText rol="bodySm" color={t.textTertiary} style={styles.pasoSub}>
                            {s.sub}
                          </LumeText>
                        </View>
                        <Icon
                          name={active ? 'chevron-right' : 'lock'}
                          size={17}
                          color={active ? t.textPrimary : t.textDisabled}
                          strokeWidth={1.75}
                        />
                      </Pressable>
                    );
                  })}
                </Vidrio>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  safe: { flex: 1 },
  // flexGrow: el contenido ocupa toda la altura aunque sea corto, asi el gesto
  // de tirar hacia abajo se toma desde cualquier punto.
  scroll: {
    flexGrow: 1,
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[6],
    paddingBottom: lumeSpace[12],
    gap: lumeSpace[7],
  },

  // Saludo
  saludo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: lumeSpace[4] },
  saludoIzq: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[4], flexShrink: 1 },
  saludoTexto: { flexShrink: 1 },

  bloque: { gap: lumeSpace[4] },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: lumeSpace[4],
    paddingHorizontal: lumeSpace[1],
  },
  // El nombre de la rutina se achica antes que la cuenta de dias.
  nombreRutina: { flexShrink: 1 },

  // Tarjeta de un dia
  tarjeta: { padding: lumeLayout.padCard, gap: lumeSpace[4] },
  tarjetaCabeza: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[3] },
  // Se achica antes que el lapiz: el boton mantiene su area de toque.
  tarjetaTexto: { flex: 1, gap: lumeSpace[1] },

  nuevaRutina: { gap: lumeSpace[3] },
  centrado: { textAlign: 'center' },

  // Cuenta nueva
  hero: {
    paddingTop: lumeSpace[8],
    paddingHorizontal: lumeSpace[6],
    paddingBottom: lumeSpace[6],
    gap: lumeSpace[6],
  },
  heroTexto: { gap: lumeSpace[4] },
  heroTitulo: { fontSize: 32, lineHeight: 35 },
  heroParrafo: { maxWidth: 280, marginTop: lumeSpace[1] },
  sinSesiones: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: lumeSpace[3] },

  // Primeros pasos
  pasos: { overflow: 'hidden' },
  paso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    paddingVertical: lumeSpace[4],
    paddingHorizontal: lumeSpace[5],
    minHeight: 64,
  },
  pasoBloqueado: { opacity: 0.55 },
  pasoNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pasoNumTexto: { fontFamily: lumeFuente.semibold, fontSize: 12, lineHeight: 14 },
  pasoTexto: { flex: 1, gap: lumeSpace[1] },
  pasoTitulo: { fontFamily: lumeFuente.semibold },
  pasoSub: { fontSize: 12.5, lineHeight: 17 },
});

const makeStyles = (t: LumePalette, sombras: LumeSombras) =>
  StyleSheet.create({
    pasoConLinea: { borderTopWidth: 1, borderTopColor: t.divider },
    presionado: { backgroundColor: t.surfaceChip },
    pasoNumActivo: { backgroundColor: t.accent, boxShadow: sombras.haloAccent },
    pasoNumBloqueado: { borderWidth: 1, borderColor: t.borderStrong },
  });
