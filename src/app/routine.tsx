/* Frencia · Detalle de una rutina.
   Su nombre, si esta en curso o archivada, y los dias que la componen. Cada dia
   se toca para editarlo.

   Mantiene el idioma de la lista de rutinas —nombre grande en la sans, datos
   tabulares, dias como filas al hilo— y no el del home, donde un dia es una
   tarjeta con su tira de semana y su boton Empezar. Empezar el entrenamiento se
   hace desde el home; aca se mira y se corrige el plan.

   Compartir vive en la barra, lejos de Editar y de Eliminar, y no depende de
   si la rutina esta en curso o archivada. Si se comparte la original, una fila
   bajo el nombre dice con cuantos esta vinculada. Una rutina vinculada (la
   original de otro) se entrena igual pero no se edita ni se comparte: en vez
   de Editar y Eliminar lleva Hacer una copia editable y Dejar de seguirla. */

import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { cargarRutina, eliminarRutina, fechaCorta, type RutinaDetalle } from '@/lib/rutinas';
import {
  cargarVinculo,
  copiarLink,
  dejarDeCompartirCon,
  dejarDeCompartirConTodos,
  dejarDeSeguir,
  diaMes,
  haceDias,
  hacerCopiaEditable,
  vinculoDemo,
  type DemoVinculo,
  type PersonaVinculada,
  type VinculoRutina,
} from '@/lib/compartir-rutina';
import { useToast } from '@/contexts/toast';
import { alerta } from '@/lib/alerta';
import { CargaCentrada } from '@/components/CargaCentrada';
import { DiasRutina } from '@/components/DiasRutina';
import { HojaCompartir } from '@/components/compartir/HojaCompartir';
import { FilaCompartida, HojaPersonas } from '@/components/compartir/Vinculo';

import { Icon } from '@/design';
import {
  Fondo,
  LumeAvatar,
  LumeBadge,
  LumeButton,
  LumeIconButton,
  LumeText,
  lumeLayout,
  lumeRadius,
  lumeSpace,
  useLume,
  useLumeStyles,
  type LumePalette,
} from '@/design/lume';

/** "Bautista Ribotta" -> "Bautista". */
function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] ?? nombre;
}

export default function RoutineScreen() {
  const { t } = useLume();
  const tema = useLumeStyles(makeStyles);
  const router = useRouter();
  const { showToast } = useToast();

  // demo: solo en desarrollo, para ver los estados de compartir sin backend.
  const { id, demo } = useLocalSearchParams<{ id?: string; demo?: DemoVinculo }>();

  const [rutina, setRutina] = useState<RutinaDetalle | null>(null);
  const [vinculo, setVinculo] = useState<VinculoRutina | null>(null);
  const [cargando, setCargando] = useState(true);
  const [borrando, setBorrando] = useState(false);
  const [compartirAbierta, setCompartirAbierta] = useState(false);
  const [personasAbierta, setPersonasAbierta] = useState(false);
  const [cortando, setCortando] = useState(false);
  const [desvinculando, setDesvinculando] = useState(false);

  // Relee al enfocar: se vuelve aca despues de editar un dia.
  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      (async () => {
        if (!id) {
          if (!cancelado) setCargando(false);
          return;
        }
        const [data, v] = await Promise.all([cargarRutina(id), cargarVinculo(id)]);
        if (cancelado) return;
        setRutina(data);
        setVinculo(__DEV__ && demo ? vinculoDemo(demo) : v);
        setCargando(false);
      })();
      return () => {
        cancelado = true;
      };
    }, [id, demo]),
  );

  const vinculada = vinculo?.tipo === 'vinculada' ? vinculo : null;
  const propia = vinculo?.tipo === 'propia' ? vinculo : null;
  const ocupado = borrando || desvinculando;

  function volver() {
    if (router.canGoBack()) router.back();
    else router.replace('/routines');
  }

  function editar() {
    if (!rutina) return;
    router.push({ pathname: '/edit-routine', params: { id: rutina.id } });
  }

  // El peso destructivo va al modal de alerta, no al color del boton.
  function pedirEliminar() {
    if (!rutina || borrando) return;
    const n = rutina.dias.length;
    const detalle =
      n > 0 ? ` con sus ${n} ${n === 1 ? 'día' : 'días'} y los ejercicios de cada uno` : '';
    alerta(
      `Eliminar ${rutina.name}`,
      `Se va a borrar la rutina${detalle}. No se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: confirmarEliminar },
      ],
    );
  }

  async function confirmarEliminar() {
    if (!rutina) return;
    setBorrando(true);
    const ok = await eliminarRutina(rutina.id);
    if (ok) {
      showToast({ message: 'Rutina eliminada', type: 'success' });
      // replace y no back: volver no tiene que aterrizar en la rutina borrada.
      router.replace('/routines');
    } else {
      setBorrando(false);
      showToast({ message: 'No pudimos eliminar la rutina. Probá de nuevo.', type: 'error' });
    }
  }

  /* ---------- Original compartida ---------- */

  function pedirQuitar(persona: PersonaVinculada) {
    alerta(
      `Dejar de compartir con ${primerNombre(persona.nombre)}`,
      'Se queda con una copia de la rutina tal como está hoy. Tus cambios ya no le llegan.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Dejar de compartir', style: 'destructive', onPress: () => quitar(persona) },
      ],
    );
  }

  async function quitar(persona: PersonaVinculada) {
    if (!rutina || !propia) return;
    const ok = await dejarDeCompartirCon(rutina.id, persona.id);
    if (!ok) {
      showToast({ message: 'No pudimos dejar de compartirla. Probá de nuevo.', type: 'error' });
      return;
    }
    const resto = propia.personas.filter((p) => p.id !== persona.id);
    setVinculo({ ...propia, personas: resto });
    if (resto.length === 0) setPersonasAbierta(false);
    showToast({ message: `Ya no la compartís con ${primerNombre(persona.nombre)}`, type: 'success' });
  }

  function pedirCortarConTodos() {
    alerta(
      'Dejar de compartir con todos',
      'Cada persona se queda con una copia de la rutina tal como está hoy y el link deja de funcionar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Dejar de compartir', style: 'destructive', onPress: cortarConTodos },
      ],
    );
  }

  async function cortarConTodos() {
    if (!rutina) return;
    setCortando(true);
    const ok = await dejarDeCompartirConTodos(rutina.id);
    setCortando(false);
    if (!ok) {
      showToast({ message: 'No pudimos dejar de compartirla. Probá de nuevo.', type: 'error' });
      return;
    }
    setVinculo({ tipo: 'propia', codigo: null, personas: [] });
    setPersonasAbierta(false);
    showToast({ message: 'Dejaste de compartir la rutina', type: 'success' });
  }

  async function copiarOtraVez() {
    if (!propia?.codigo) return;
    const ok = await copiarLink(propia.codigo);
    showToast(
      ok ? { message: 'Link copiado', type: 'success' } : { message: 'No pudimos copiar el link.', type: 'error' },
    );
  }

  /* ---------- Rutina vinculada ---------- */

  function pedirCopiaEditable() {
    if (!vinculada) return;
    alerta(
      'Hacer una copia editable',
      `La rutina deja de seguir a ${primerNombre(vinculada.autor.nombre)}: sus cambios ya no te llegan y la vas a poder editar. Tu historial no cambia.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Hacer la copia', onPress: copiaEditable },
      ],
    );
  }

  async function copiaEditable() {
    if (!rutina) return;
    setDesvinculando(true);
    const ok = await hacerCopiaEditable(rutina.id);
    setDesvinculando(false);
    if (!ok) {
      showToast({ message: 'No pudimos hacer la copia. Probá de nuevo.', type: 'error' });
      return;
    }
    setVinculo({ tipo: 'propia', codigo: null, personas: [] });
    showToast({ message: 'La rutina ahora es tuya', type: 'success' });
  }

  function pedirDejarDeSeguir() {
    if (!rutina) return;
    alerta(
      `Dejar de seguir ${rutina.name}`,
      'La rutina sale de tus rutinas. Tu historial de entrenamientos no cambia.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Dejar de seguirla', style: 'destructive', onPress: confirmarDejarDeSeguir },
      ],
    );
  }

  async function confirmarDejarDeSeguir() {
    if (!rutina) return;
    setDesvinculando(true);
    const ok = await dejarDeSeguir(rutina.id);
    if (ok) {
      showToast({ message: 'Dejaste de seguir la rutina', type: 'success' });
      router.replace('/routines');
    } else {
      setDesvinculando(false);
      showToast({ message: 'No pudimos dejar de seguirla. Probá de nuevo.', type: 'error' });
    }
  }

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="cumbre" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <LumeButton variant="ghost" size="sm" icon="chevron-left" onPress={volver}>
            Atrás
          </LumeButton>
          {/* Una vinculada es la original de otro: no se comparte. */}
          {!cargando && rutina && propia ? (
            <LumeIconButton
              icon="share"
              variant="ghost"
              size="md"
              onPress={() => setCompartirAbierta(true)}
              accessibilityLabel="Compartir rutina"
            />
          ) : null}
        </View>

        {cargando ? (
          <CargaCentrada texto="Cargando rutina…" />
        ) : !rutina ? (
          <View style={styles.centro}>
            <LumeText rol="subtitle" style={styles.centrado}>
              No encontramos esta rutina
            </LumeText>
            <LumeText rol="bodySm" color={t.textSecondary} style={styles.centrado}>
              Puede que la hayas borrado desde otro dispositivo.
            </LumeText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.titulo}>
              <View style={styles.badges}>
                <LumeBadge tone={rutina.activa ? 'signal' : 'neutral'}>
                  {rutina.activa ? 'En curso' : 'Archivada'}
                </LumeBadge>
                {vinculada ? (
                  <LumeBadge tone="neutral" icon="link">
                    Vinculada
                  </LumeBadge>
                ) : null}
              </View>
              <LumeText rol="display" style={styles.nombre} numberOfLines={3}>
                {rutina.name}
              </LumeText>
              {vinculada ? (
                <View style={styles.autor}>
                  <LumeAvatar
                    size="2xs"
                    name={vinculada.autor.nombre}
                    src={vinculada.autor.avatarUrl ?? undefined}
                  />
                  <LumeText rol="label" color={t.textTertiary} style={styles.autorTexto} numberOfLines={1}>
                    La actualiza {primerNombre(vinculada.autor.nombre)} · cambió {haceDias(vinculada.cambioEl)}
                  </LumeText>
                </View>
              ) : (
                <LumeText rol="data" color={t.textSecondary}>
                  {rutina.dias.length} {rutina.dias.length === 1 ? 'día' : 'días'} · {fechaCorta(rutina.creadaEl)}
                </LumeText>
              )}
            </View>

            {propia && propia.personas.length > 0 ? (
              <FilaCompartida personas={propia.personas} onPress={() => setPersonasAbierta(true)} />
            ) : null}

            {/* La primera vez que entra despues de un cambio del dueño. */}
            {vinculada?.novedad ? (
              <View style={[styles.novedad, tema.novedad]}>
                <LumeText rol="label" color={t.accent}>
                  Novedades · {diaMes(vinculada.novedad.fecha)}
                </LumeText>
                <LumeText rol="bodySm">{primerNombre(vinculada.autor.nombre)} cambió la rutina.</LumeText>
                <View style={styles.cambios}>
                  {vinculada.novedad.cambios.map((c) => (
                    <LumeText key={c} rol="bodySm" color={t.textSecondary}>
                      {c}
                    </LumeText>
                  ))}
                </View>
              </View>
            ) : null}

            {rutina.dias.length === 0 ? (
              <View style={[styles.vacio, tema.vacio]}>
                <Icon name="calendar-off" size={22} strokeWidth={1.75} color={t.textTertiary} />
                <LumeText rol="bodySm" color={t.textTertiary} style={styles.centrado}>
                  Esta rutina no tiene días.
                </LumeText>
              </View>
            ) : (
              <DiasRutina
                dias={rutina.dias}
                onEditar={
                  vinculada ? undefined : (d) => router.push({ pathname: '/edit-day', params: { dia: d.id } })
                }
              />
            )}
          </ScrollView>
        )}

        {/* Acciones de la rutina: al pie, a todo el ancho. La irreversible
           abajo, mas lejos del pulgar. */}
        {!cargando && rutina && vinculada ? (
          <View style={styles.acciones}>
            <LumeButton
              variant="secondary"
              size="lg"
              icon="copy"
              fullWidth
              disabled={ocupado}
              onPress={pedirCopiaEditable}
            >
              Hacer una copia editable
            </LumeButton>
            <LumeButton
              variant="danger"
              size="lg"
              icon="unlink"
              fullWidth
              loading={desvinculando}
              onPress={pedirDejarDeSeguir}
            >
              Dejar de seguirla
            </LumeButton>
          </View>
        ) : !cargando && rutina ? (
          <View style={styles.acciones}>
            <LumeButton variant="secondary" size="lg" icon="pencil" fullWidth disabled={ocupado} onPress={editar}>
              Editar rutina
            </LumeButton>
            <LumeButton
              variant="danger"
              size="lg"
              icon="trash-2"
              fullWidth
              loading={borrando}
              onPress={pedirEliminar}
            >
              Eliminar rutina
            </LumeButton>
          </View>
        ) : null}
      </SafeAreaView>

      {/* Las hojas van al final, superpuestas: el toast de la raiz queda encima. */}
      {rutina ? (
        <HojaCompartir visible={compartirAbierta} onCerrar={() => setCompartirAbierta(false)} rutina={rutina} />
      ) : null}
      {propia ? (
        <HojaPersonas
          visible={personasAbierta}
          onCerrar={() => setPersonasAbierta(false)}
          personas={propia.personas}
          onQuitar={pedirQuitar}
          onCopiarLink={copiarOtraVez}
          onDejarConTodos={pedirCortarConTodos}
          cortando={cortando}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  safe: { flex: 1 },

  // El boton ghost trae su propio padding: el margen lo corre 10 px a la
  // izquierda para que el chevron quede alineado con el borde del contenido.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: lumeLayout.padScreen - 10,
    paddingVertical: lumeSpace[4],
    minHeight: 44,
  },

  scroll: {
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[4],
    paddingBottom: lumeSpace[10],
    gap: lumeSpace[7],
  },

  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: lumeSpace[3] },
  centrado: { textAlign: 'center' },

  titulo: { gap: lumeSpace[4], alignItems: 'flex-start' },
  badges: { flexDirection: 'row', gap: lumeSpace[2] },
  // El nombre lo pone el usuario: en la sans de display, ajustado para que
  // entre en pocas lineas.
  nombre: { fontSize: 34, lineHeight: 36, letterSpacing: -1 },
  autor: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[3], alignSelf: 'stretch' },
  autorTexto: { flex: 1 },

  // Tarjeta de novedades: vidrio fuerte con el filo izquierdo en signal.
  novedad: {
    gap: lumeSpace[3],
    padding: lumeLayout.padCard,
    borderRadius: lumeRadius.xl,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  cambios: { gap: lumeSpace[1] },

  vacio: {
    alignItems: 'center',
    gap: lumeSpace[3],
    paddingVertical: lumeSpace[8],
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },

  // Pie fijo con las acciones de la rutina.
  acciones: {
    gap: lumeSpace[3],
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[4],
    paddingBottom: lumeSpace[2],
  },
});

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    vacio: { backgroundColor: t.surfaceInset, borderColor: t.borderStrong },
    novedad: {
      backgroundColor: t.surfaceCardElevated,
      borderColor: t.surfaceSignalLine,
      borderLeftColor: t.signal,
    },
  });
