/* Frencia · Perfil — pantalla de perfil y ajustes.
   Es una pestania: se llega desde la barra de abajo o tocando el encabezado de
   saludo del home. Foto de perfil (Storage), editar perfil y ajustes. RIR/RPE,
   kg/lb y cm/ft se guardan en Supabase y se aplican en vivo via el contexto de
   perfil; el tema (oscuro/claro) igual, via el contexto de tema. */

import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfile, type Preferencias } from '@/contexts/profile';
import { useSession } from '@/contexts/session';
import { useToast } from '@/contexts/toast';
import { pickAndUploadAvatar, deleteAvatarFile, usarAvatarGenerado } from '@/lib/avatar';
import { supabase } from '@/lib/supabase';
import { useVolverArribaAlRetocar } from '@/lib/volver-arriba';

import { Icon, useTheme, type ThemePreference } from '@/design';
import {
  Fondo,
  LumeAvatar,
  LumeButton,
  LumeSwitch,
  LumeText,
  Segmentado,
  Vidrio,
  lumeFuente,
  lumeLayout,
  lumeSpace,
  useLume,
  useLumeStyles,
  type LumePalette,
} from '@/design/lume';
import { Hoja } from '@/components/Hoja';

const TEMA_OPTIONS = [
  { value: 'system', label: 'Sistema' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'light', label: 'Claro' },
];
const TEMA_SUB: Record<ThemePreference, string> = {
  system: 'Sigue al tema del teléfono',
  dark: 'Siempre oscuro',
  light: 'Siempre claro',
};

export default function ProfileScreen() {
  const { t } = useLume();
  const tema = useLumeStyles(makeStyles);
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  useVolverArribaAlRetocar(scrollRef);
  const { user } = useSession();
  // Datos del perfil compartidos (saludo, avatar, preferencias) + reflejo de
  // cambios.
  const { displayName, profile, applyAvatar, savePreferencias } = useProfile();
  // Nombre completo para la tarjeta: suma el apellido si esta cargado.
  const fullName = [profile?.name?.trim(), profile?.surname?.trim()]
    .filter(Boolean)
    .join(' ') || displayName;
  const { showToast } = useToast();
  // Tema: sistema / oscuro / claro. Lo maneja el contexto, persiste solo.
  const { preference, setPreference } = useTheme();
  // RIR/RPE, kg/lb, cm/ft y km/mi se leen del contexto y se persisten en profiles.
  // No hay estado local: el switch cambia el contexto y toda la app (sesion,
  // historial, editar perfil) recalcula con la unidad nueva en el acto.
  const useRpe = profile?.medidorEsfuerzo === 'rpe';
  const useLb = profile?.unidadPeso === 'lb';
  const useFeet = profile?.unidadAltura === 'ft';
  const useMiles = profile?.unidadDistancia === 'mi';
  // Avatar: foto subida (prioridad) o semilla del avatar generado, leidos del contexto.
  const photo = profile?.avatarUrl ?? undefined;
  const avatarPath = profile?.avatarPath ?? undefined;
  const seed = profile?.avatarSeed ?? undefined;
  const [busy, setBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  // En iOS hay que esperar a que el sheet termine de cerrarse antes de abrir
  // el image picker: presentar un modal nativo mientras otro se cierra deja
  // el picker sin aparecer y la promesa colgada.
  const [pendingPick, setPendingPick] = useState(false);

  // Cierra el sheet y deja el picker pendiente. En iOS el picker se abre
  // recien en onDismiss del Modal; en Android se puede abrir directo.
  function requestUploadPhoto() {
    setShowOptions(false);
    if (Platform.OS === 'ios') {
      setPendingPick(true);
    } else {
      uploadPhoto();
    }
  }

  // Elige una imagen, la sube a Storage y la fija como foto de perfil.
  async function uploadPhoto() {
    if (busy) return;
    setPhotoError('');
    if (!user) {
      setPhotoError('No pudimos identificar tu sesión.');
      return;
    }
    setBusy(true);
    const { url, path, error, canceled } = await pickAndUploadAvatar(user.id);
    setBusy(false);
    if (canceled) return;
    if (error || !url) {
      setPhotoError(error ?? 'No pudimos actualizar la foto.');
      return;
    }
    applyAvatar({ url, path: path ?? null });
    showToast({ message: 'Foto de perfil actualizada', type: 'success' });
  }

  // Genera un avatar nuevo: nueva semilla que sobreescribe la actual y
  // limpia la foto subida en Supabase.
  async function generateAvatar() {
    if (busy) return;
    setPhotoError('');
    if (!user) {
      setPhotoError('No pudimos identificar tu sesión.');
      return;
    }
    setBusy(true);
    const nuevaSeed = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    // Antes de soltar la referencia, porque la ruta sale de la propia fila.
    await deleteAvatarFile(user.id);
    const ok = await usarAvatarGenerado(user.id, nuevaSeed);
    setBusy(false);
    if (!ok) {
      setPhotoError('No pudimos generar el avatar.');
      return;
    }
    applyAvatar({ url: null, path: null, seed: nuevaSeed });
  }

  // Elimina la foto subida y vuelve al avatar generado por semilla.
  async function removePhoto() {
    if (busy) return;
    setPhotoError('');
    if (!user) {
      setPhotoError('No pudimos identificar tu sesión.');
      return;
    }
    setBusy(true);
    // Borra el archivo de Storage. Va antes del update porque la ruta sale de
    // la propia fila del perfil.
    await deleteAvatarFile(user.id);
    // Asegura una semilla para mostrar el avatar generado.
    const semilla = seed ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const ok = await usarAvatarGenerado(user.id, semilla);
    setBusy(false);
    if (!ok) {
      setPhotoError('No pudimos eliminar la foto.');
      return;
    }
    applyAvatar({ url: null, path: null, seed: semilla });
  }

  // El contexto aplica el cambio en el acto y lo persiste; si no pudo, ya lo
  // revirtio y aca solo queda avisar.
  async function cambiarPreferencia(next: Partial<Preferencias>) {
    const ok = await savePreferencias(next);
    if (!ok) showToast({ message: 'No pudimos guardar el ajuste. Probá de nuevo.', type: 'error' });
  }

  function toggleRpe(next: boolean) {
    cambiarPreferencia({ medidorEsfuerzo: next ? 'rpe' : 'rir' });
  }

  function toggleLb(next: boolean) {
    cambiarPreferencia({ unidadPeso: next ? 'lb' : 'kg' });
  }

  function toggleFeet(next: boolean) {
    cambiarPreferencia({ unidadAltura: next ? 'ft' : 'cm' });
  }

  function toggleMiles(next: boolean) {
    cambiarPreferencia({ unidadDistancia: next ? 'mi' : 'km' });
  }

  // Cierra la sesion. El cambio lo detecta SessionProvider y el gate del
  // layout raiz redirige al login automaticamente.
  async function handleSignOut() {
    showToast({ message: 'Sesión cerrada', type: 'info' });
    await supabase.auth.signOut();
  }

  // Una fila de ajuste con interruptor.
  const ajuste = (titulo: string, sub: string, on: boolean, onChange: (v: boolean) => void, primera = false) => (
    <View style={[styles.fila, !primera && tema.filaConLinea]}>
      <View style={styles.filaTexto}>
        <LumeText rol="bodySm" style={styles.filaTitulo}>
          {titulo}
        </LumeText>
        <LumeText rol="bodySm" color={t.textTertiary} style={styles.filaSub}>
          {sub}
        </LumeText>
      </View>
      <LumeSwitch checked={on} onChange={onChange} accessibilityLabel={titulo} />
    </View>
  );

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="cumbre" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Sin boton de volver: es una pestania y se sale tocando otra. */}
          <View style={styles.titulo}>
            <LumeText rol="title">Perfil</LumeText>
          </View>

          {/* Tarjeta de usuario */}
          <Vidrio style={styles.usuario}>
            <Pressable
              onPress={() => setShowOptions(true)}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel="Cambiar foto de perfil"
            >
              <LumeAvatar name={seed ?? displayName} src={photo} cacheKey={avatarPath} size="lg" ring />
              <View style={[styles.camara, tema.camara]}>
                <Icon name="camera" size={13} color={t.textOnAccent} strokeWidth={2} />
              </View>
            </Pressable>
            <View style={styles.usuarioTexto}>
              <LumeText rol="subtitle">{fullName}</LumeText>
              <LumeText rol="label" color={t.textTertiary}>
                {busy ? 'Actualizando avatar...' : 'Tocá la foto para cambiarla'}
              </LumeText>
              {photoError ? (
                <LumeText rol="bodySm" color={t.dangerText}>
                  {photoError}
                </LumeText>
              ) : null}
            </View>
          </Vidrio>

          <LumeButton variant="secondary" size="lg" icon="user" fullWidth onPress={() => router.push('/edit-profile')}>
            Editar perfil
          </LumeButton>

          {/* Ajustes */}
          <View style={styles.bloque}>
            <LumeText rol="label" color={t.textTertiary} style={styles.etiqueta}>
              Ajustes básicos
            </LumeText>
            <Vidrio style={styles.lista}>
              {ajuste('Usar RIR / RPE', useRpe ? 'Midiendo con RPE' : 'Midiendo con RIR', useRpe, toggleRpe, true)}
              {ajuste('Unidad de peso kg/lb', useLb ? 'En libras (lb)' : 'En kilogramos (kg)', useLb, toggleLb)}
              {ajuste(
                'Unidad de altura cm/ft',
                useFeet ? 'En pies y pulgadas (ft)' : 'En centímetros (cm)',
                useFeet,
                toggleFeet,
              )}
              {ajuste('Unidad de distancia km/mi', useMiles ? 'En millas (mi)' : 'En kilómetros (km)', useMiles, toggleMiles)}

              {/* Tema: tres opciones, asi que va en selector en vez de switch,
                  apilado debajo del titulo para que entre en cualquier ancho. */}
              <View style={[styles.filaApilada, tema.filaApilada]}>
                <View style={styles.filaTexto}>
                  <LumeText rol="bodySm" style={styles.filaTitulo}>
                    Tema
                  </LumeText>
                  <LumeText rol="bodySm" color={t.textTertiary} style={styles.filaSub}>
                    {TEMA_SUB[preference]}
                  </LumeText>
                </View>
                <Segmentado
                  opciones={TEMA_OPTIONS}
                  value={preference}
                  onChange={(v) => setPreference(v as ThemePreference)}
                />
              </View>
            </Vidrio>
          </View>

          {/* Configuracion de la cuenta: misma fila que Cerrar sesion, en neutro */}
          <Vidrio style={styles.lista}>
            <Pressable
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              accessibilityLabel="Configuración"
              style={({ pressed }) => [styles.fila, pressed && tema.presionada]}
            >
              <View style={styles.filaIzq}>
                <Icon name="settings" size={20} color={t.textPrimary} strokeWidth={1.75} />
                <LumeText rol="bodySm" style={styles.filaTitulo}>
                  Configuración
                </LumeText>
              </View>
              <Icon name="chevron-right" size={20} color={t.textTertiary} strokeWidth={1.75} />
            </Pressable>
          </Vidrio>

          {/* Cerrar sesion: recuadro propio, accion destructiva */}
          <Vidrio style={styles.lista}>
            <Pressable
              onPress={handleSignOut}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              style={({ pressed }) => [styles.fila, pressed && tema.presionada]}
            >
              <View style={styles.filaIzq}>
                <Icon name="log-out" size={20} color={t.dangerText} strokeWidth={1.75} />
                <LumeText rol="bodySm" color={t.dangerText} style={styles.filaTitulo}>
                  Cerrar sesión
                </LumeText>
              </View>
            </Pressable>
          </Vidrio>
        </ScrollView>
      </SafeAreaView>

      {/* Opciones de avatar */}
      <Hoja
        visible={showOptions}
        onCerrar={() => setShowOptions(false)}
        onDismiss={() => {
          if (pendingPick) {
            setPendingPick(false);
            uploadPhoto();
          }
        }}
      >
        {/* Vista previa grande del avatar actual, refleja los cambios en vivo */}
        <View style={styles.vista}>
          <LumeAvatar name={seed ?? displayName} src={photo} cacheKey={avatarPath} size="xl" ring />
        </View>
        <LumeText rol="subtitle" style={styles.hojaTitulo}>
          Foto de perfil
        </LumeText>
        <LumeButton variant="primary" size="lg" icon="repeat" fullWidth onPress={generateAvatar}>
          Generar nuevo avatar
        </LumeButton>
        <LumeButton variant="secondary" size="lg" icon="camera" fullWidth onPress={requestUploadPhoto}>
          Subir una foto
        </LumeButton>
        {photo ? (
          <LumeButton variant="ghost" size="lg" icon="x" fullWidth onPress={removePhoto}>
            Eliminar foto
          </LumeButton>
        ) : null}
        <LumeButton variant="ghost" size="md" fullWidth onPress={() => setShowOptions(false)}>
          Cancelar
        </LumeButton>
      </Hoja>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[6],
    paddingBottom: lumeSpace[12],
    gap: lumeSpace[7],
  },
  titulo: { justifyContent: 'center', minHeight: 40 },

  // Tarjeta de usuario
  usuario: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[4], padding: lumeSpace[5] },
  camara: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usuarioTexto: { flex: 1, gap: lumeSpace[1] },

  // Ajustes
  bloque: { gap: lumeSpace[4] },
  etiqueta: { paddingHorizontal: lumeSpace[1] },
  lista: { overflow: 'hidden' },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: lumeSpace[4],
    padding: lumeSpace[5],
    minHeight: 60,
  },
  filaApilada: { gap: lumeSpace[4], padding: lumeSpace[5], borderTopWidth: 1 },
  filaTexto: { flex: 1, gap: lumeSpace[1] },
  filaIzq: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[4] },
  filaTitulo: { fontFamily: lumeFuente.semibold },
  filaSub: { fontSize: 12.5, lineHeight: 17 },

  // Hoja de la foto
  vista: { alignItems: 'center', marginBottom: lumeSpace[2] },
  hojaTitulo: { marginBottom: lumeSpace[1] },
});

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    filaConLinea: { borderTopWidth: 1, borderTopColor: t.divider },
    filaApilada: { borderTopColor: t.divider },
    camara: { backgroundColor: t.accent, borderColor: t.surfaceCardOpaco },
    presionada: { backgroundColor: t.surfaceChip },
  });
