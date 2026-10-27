/* Frencia · Vista previa de una rutina compartida por link.
   El link (frencia.app/r/CODIGO) abre la app aca: quien la manda, que es y
   sus dias. Nada se agrega hasta tocar Agregar a mis rutinas.
   Si es la original, se avisa antes de aceptar que la va a editar otra
   persona. Ponerla en curso viene prendido si no tiene ninguna en curso; si ya
   tiene una, se pregunta antes: no es destructivo (la actual pasa a
   Anteriores con su historial), por eso la accion va en primario.
   Si el link vencio o el dueño dejo de compartirla, una tarjeta lo dice. */

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  agregarRutinaCompartida,
  cargarRutinaCompartida,
  resumenRutina,
  type ResultadoRutinaCompartida,
} from '@/lib/compartir-rutina';
import { nombreRutinaActiva } from '@/lib/rutinas';
import { useSession } from '@/contexts/session';
import { useToast } from '@/contexts/toast';
import { CargaCentrada } from '@/components/CargaCentrada';
import { DiasRutina } from '@/components/DiasRutina';
import { Dialogo } from '@/components/Dialogo';

import { Icon } from '@/design';
import {
  Fondo,
  LumeAvatar,
  LumeBadge,
  LumeButton,
  LumeSwitch,
  LumeText,
  lumeFuente,
  lumeLayout,
  lumeRadius,
  lumeSpace,
  useLume,
  useLumeStyles,
  type LumePalette,
} from '@/design/lume';

function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] ?? nombre;
}

export default function SharedRoutineScreen() {
  const { t } = useLume();
  const tema = useLumeStyles(makeStyles);
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useSession();
  const { codigo } = useLocalSearchParams<{ codigo: string }>();

  const [resultado, setResultado] = useState<ResultadoRutinaCompartida | null>(null);
  const [activa, setActiva] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState(true);
  const [agregando, setAgregando] = useState(false);
  const [preguntar, setPreguntar] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const [r, nombre] = await Promise.all([
        cargarRutinaCompartida(codigo ?? ''),
        user ? nombreRutinaActiva(user.id) : Promise.resolve(null),
      ]);
      if (cancelado) return;
      setResultado(r);
      setActiva(nombre);
      // Prendido solo si no tiene ninguna en curso.
      setEnCurso(!nombre);
    })();
    return () => {
      cancelado = true;
    };
  }, [codigo, user]);

  function cerrar() {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }

  function pedirAgregar() {
    if (enCurso && activa) setPreguntar(true);
    else agregar(enCurso);
  }

  async function agregar(ponerEnCurso: boolean) {
    if (resultado?.estado !== 'ok') return;
    setPreguntar(false);
    setAgregando(true);
    const id = await agregarRutinaCompartida(resultado.rutina.codigo, { enCurso: ponerEnCurso });
    setAgregando(false);
    // PENDIENTE: con backend, null es un error y el id lleva al detalle.
    showToast({ message: 'Rutina agregada', type: 'success' });
    if (id) router.replace({ pathname: '/routine', params: { id } });
    else router.replace(ponerEnCurso ? '/home' : '/routines');
  }

  const rutina = resultado?.estado === 'ok' ? resultado.rutina : null;
  const original = rutina?.modo === 'original';

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="cumbre" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <LumeButton variant="ghost" size="sm" icon="x" onPress={cerrar}>
            Cerrar
          </LumeButton>
        </View>

        {!resultado ? (
          <CargaCentrada texto="Abriendo la rutina…" />
        ) : !rutina ? (
          <View style={styles.caidoMarco}>
            <View style={[styles.caido, tema.punteada]}>
              <Icon name="link-2-off" size={26} strokeWidth={1.75} color={t.textTertiary} />
              <LumeText rol="subtitle" style={styles.centrado}>
                {resultado.estado === 'caido' ? 'Este link ya no funciona' : 'No pudimos abrir el link'}
              </LumeText>
              <LumeText rol="bodySm" color={t.textSecondary} style={[styles.centrado, styles.parrafo]}>
                {resultado.estado === 'caido'
                  ? 'Venció o quien te lo mandó dejó de compartir la rutina. Pedile uno nuevo.'
                  : 'Revisá tu conexión y probá de nuevo.'}
              </LumeText>
              <LumeButton variant="secondary" size="lg" onPress={() => router.replace('/home')}>
                Ir a Inicio
              </LumeButton>
            </View>
          </View>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              <View style={styles.autor}>
                <LumeAvatar size="sm" ring name={rutina.autor.nombre} src={rutina.autor.avatarUrl ?? undefined} />
                <View style={styles.autorTextos}>
                  <LumeText rol="bodySm" style={styles.semi} numberOfLines={1}>
                    {rutina.autor.nombre}
                  </LumeText>
                  <LumeText rol="label" color={t.textTertiary}>
                    Te compartió esta rutina
                  </LumeText>
                </View>
              </View>

              <View style={styles.titulo}>
                <LumeBadge tone="neutral" icon={original ? 'link' : 'copy'}>
                  {original ? 'Vinculada' : 'Copia'}
                </LumeBadge>
                <LumeText rol="display" style={styles.nombre} numberOfLines={3}>
                  {rutina.nombre}
                </LumeText>
                <LumeText rol="data" color={t.textSecondary}>
                  {resumenRutina(rutina.dias)}
                </LumeText>
              </View>

              {original ? (
                <View style={[styles.aviso, tema.punteada]}>
                  <Icon name="link" size={18} strokeWidth={1.75} color={t.textPrimary} />
                  <LumeText rol="bodySm" color={t.textSecondary} style={styles.avisoTexto}>
                    <LumeText rol="bodySm" style={styles.semi}>
                      {primerNombre(rutina.autor.nombre)} la actualiza.
                    </LumeText>{' '}
                    Vas a ver sus cambios apenas los haga. Vos la entrenás y registrás tus series, pero no la
                    podés editar.
                  </LumeText>
                </View>
              ) : null}

              <DiasRutina dias={rutina.dias} />
            </ScrollView>

            <View style={styles.acciones}>
              <View style={styles.filaSwitch}>
                <View style={styles.autorTextos}>
                  <LumeText rol="bodySm" style={styles.semi}>
                    Ponerla en curso
                  </LumeText>
                  <LumeText rol="label" color={t.textTertiary}>
                    Va a aparecer en Inicio
                  </LumeText>
                </View>
                <LumeSwitch
                  checked={enCurso}
                  onChange={setEnCurso}
                  disabled={agregando}
                  accessibilityLabel="Ponerla en curso"
                />
              </View>
              <LumeButton variant="primary" size="lg" icon="plus" fullWidth loading={agregando} onPress={pedirAgregar}>
                Agregar a mis rutinas
              </LumeButton>
            </View>
          </>
        )}
      </SafeAreaView>

      <Dialogo
        visible={preguntar}
        titulo="Ya tenés una rutina en curso"
        mensaje={
          activa && rutina
            ? `${activa} pasa a Anteriores y ${rutina.nombre} queda en curso. Tu historial no cambia.`
            : undefined
        }
        onDescartar={() => setPreguntar(false)}
      >
        <LumeButton variant="primary" size="lg" fullWidth onPress={() => agregar(true)}>
          Poner en curso
        </LumeButton>
        <LumeButton variant="secondary" size="lg" fullWidth onPress={() => agregar(false)}>
          Agregar sin ponerla en curso
        </LumeButton>
      </Dialogo>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  safe: { flex: 1 },

  // El boton ghost trae su propio padding: el margen corre la cruz al borde
  // del contenido, como el Atras del detalle.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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

  autor: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[4] },
  autorTextos: { flex: 1, gap: lumeSpace[1] },
  semi: { fontFamily: lumeFuente.semibold },

  titulo: { gap: lumeSpace[4], alignItems: 'flex-start' },
  nombre: { fontSize: 34, lineHeight: 36, letterSpacing: -1 },

  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: lumeSpace[3],
    padding: lumeSpace[4],
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  avisoTexto: { flex: 1 },

  acciones: {
    gap: lumeSpace[3],
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[4],
    paddingBottom: lumeSpace[2],
  },
  filaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    paddingHorizontal: lumeSpace[1],
    paddingBottom: lumeSpace[2],
  },

  caidoMarco: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: lumeLayout.padScreen,
    paddingBottom: lumeSpace[12],
  },
  caido: {
    alignItems: 'center',
    gap: lumeSpace[5],
    paddingVertical: lumeSpace[10],
    paddingHorizontal: lumeSpace[6],
    borderRadius: lumeRadius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  centrado: { textAlign: 'center' },
  parrafo: { maxWidth: 290 },
});

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    punteada: { backgroundColor: t.surfaceInset, borderColor: t.borderStrong },
  });
