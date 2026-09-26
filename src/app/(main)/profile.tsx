/* Frencia · Perfil — pantalla de perfil y ajustes.
   Es una pestania: se llega desde la barra de abajo o tocando el encabezado de
   saludo del home. Foto de perfil (Storage), editar perfil y ajustes. RIR/RPE,
   kg/lb y cm/ft se guardan en Supabase y se aplican en vivo via el contexto de
   perfil; el tema (oscuro/claro) igual, via el contexto de tema. */

import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfile, type Preferencias } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { pickAndUploadAvatar, signAvatarUrl, deleteAvatarFile } from '@/lib/avatar';
import { supabase } from '@/lib/supabase';
import { useVolverArribaAlRetocar } from '@/lib/volver-arriba';

import {
  Avatar,
  Button,
  FrenciaText,
  Icon,
  radius,
  sans,
  SegmentedControl,
  space,
  spacing,
  Switch,
  useColors,
  useTheme,
  useThemedStyles,
  type Palette,
  type ThemePreference,
} from '@/design';

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
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  useVolverArribaAlRetocar(scrollRef);
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
  // Avatar: foto subida (prioridad) o semilla del avatar generado.
  const [photo, setPhoto] = useState<string | undefined>(profile?.avatarUrl ?? undefined);
  const [seed, setSeed] = useState<string | undefined>(profile?.avatarSeed ?? undefined);
  const [busy, setBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  // En iOS hay que esperar a que el sheet termine de cerrarse antes de abrir
  // el image picker: presentar un modal nativo mientras otro se cierra deja
  // el picker sin aparecer y la promesa colgada.
  const [pendingPick, setPendingPick] = useState(false);

  // Carga el avatar guardado del usuario al abrir el perfil.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('avatar_path, avatar_seed')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelado || !data) return;
      if (data.avatar_seed) setSeed(data.avatar_seed);
      if (data.avatar_path) {
        const url = await signAvatarUrl(data.avatar_path);
        if (!cancelado && url) setPhoto(url);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPhotoError('No pudimos identificar tu sesión.');
      return;
    }
    setBusy(true);
    const { url, error, canceled } = await pickAndUploadAvatar(user.id);
    setBusy(false);
    if (canceled) return;
    if (error || !url) {
      setPhotoError(error ?? 'No pudimos actualizar la foto.');
      return;
    }
    setPhoto(url);
    applyAvatar({ url });
    showToast({ message: 'Foto de perfil actualizada', type: 'success' });
  }

  // Genera un avatar nuevo: nueva semilla que sobreescribe la actual y
  // limpia la foto subida en Supabase.
  async function generateAvatar() {
    if (busy) return;
    setPhotoError('');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPhotoError('No pudimos identificar tu sesión.');
      return;
    }
    setBusy(true);
    const nuevaSeed = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    // Antes de soltar la referencia, porque la ruta sale de la propia fila.
    await deleteAvatarFile(user.id);
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_seed: nuevaSeed, avatar_path: null })
      .eq('id', user.id);
    setBusy(false);
    if (error) {
      setPhotoError('No pudimos generar el avatar.');
      return;
    }
    setPhoto(undefined);
    setSeed(nuevaSeed);
    applyAvatar({ url: null, seed: nuevaSeed });
  }

  // Elimina la foto subida y vuelve al avatar generado por semilla.
  async function removePhoto() {
    if (busy) return;
    setPhotoError('');
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_path: null, avatar_seed: semilla })
      .eq('id', user.id);
    setBusy(false);
    if (error) {
      setPhotoError('No pudimos eliminar la foto.');
      return;
    }
    setPhoto(undefined);
    setSeed(semilla);
    applyAvatar({ url: null, seed: semilla });
  }

  // El contexto aplica el cambio en el acto y lo persiste; si no pudo, ya lo
  // revirtio y aca solo queda avisar.
  async function cambiarPreferencia(next: Partial<Preferencias>) {
    const ok = await savePreferencias(next);
    if (!ok) showToast({ message: 'No pudimos guardar el ajuste. Proba de nuevo.', type: 'error' });
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
    showToast({ message: 'Sesion cerrada', type: 'info' });
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Sin boton de volver: es una pestania y se sale tocando otra. */}
        <View style={styles.header}>
          <FrenciaText role="title">Perfil</FrenciaText>
        </View>

        {/* Tarjeta de usuario */}
        <View style={styles.userCard}>
          <Pressable
            onPress={() => setShowOptions(true)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Cambiar foto de perfil"
            style={styles.avatarWrap}
          >
            <Avatar name={seed ?? displayName} src={photo} size="lg" ring />
            <View style={styles.avatarBadge}>
              <Icon name="camera" size={13} color={colors.textOnAccent} />
            </View>
          </Pressable>
          <View style={styles.userText}>
            <FrenciaText role="subtitle">{fullName}</FrenciaText>
            <FrenciaText role="dataLabel" color={colors.textTertiary}>
              {busy ? 'Actualizando avatar...' : 'Tocá la foto para cambiarla'}
            </FrenciaText>
            {photoError ? (
              <FrenciaText role="bodySm" color={colors.dangerText}>
                {photoError}
              </FrenciaText>
            ) : null}
          </View>
        </View>

        {/* Editar perfil */}
        <Button
          variant="secondary"
          size="lg"
          icon="user"
          fullWidth
          onPress={() => router.push('/edit-profile')}
        >
          Editar perfil
        </Button>

        {/* Ajustes */}
        <View style={styles.settingsBlock}>
          <FrenciaText
            role="dataLabel"
            color={colors.textTertiary}
            style={styles.settingsLabel}
          >
            Ajustes básicos
          </FrenciaText>

          <View style={styles.settingsList}>
            {/* Fila: RIR / RPE */}
            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <FrenciaText role="bodySm" style={styles.settingTitle}>
                  Usar RIR / RPE
                </FrenciaText>
                <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.settingSub}>
                  {useRpe ? 'Midiendo con RPE' : 'Midiendo con RIR'}
                </FrenciaText>
              </View>
              <Switch checked={useRpe} onChange={toggleRpe} />
            </View>

            {/* Fila: unidad de peso */}
            <View style={[styles.settingRow, styles.settingRowDivider]}>
              <View style={styles.settingText}>
                <FrenciaText role="bodySm" style={styles.settingTitle}>
                  Unidad de peso kg/lb
                </FrenciaText>
                <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.settingSub}>
                  {useLb ? 'En libras (lb)' : 'En kilogramos (kg)'}
                </FrenciaText>
              </View>
              <Switch checked={useLb} onChange={toggleLb} />
            </View>

            {/* Fila: unidad de altura */}
            <View style={[styles.settingRow, styles.settingRowDivider]}>
              <View style={styles.settingText}>
                <FrenciaText role="bodySm" style={styles.settingTitle}>
                  Unidad de altura cm/ft
                </FrenciaText>
                <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.settingSub}>
                  {useFeet ? 'En pies y pulgadas (ft)' : 'En centímetros (cm)'}
                </FrenciaText>
              </View>
              <Switch checked={useFeet} onChange={toggleFeet} />
            </View>

            {/* Fila: unidad de distancia */}
            <View style={[styles.settingRow, styles.settingRowDivider]}>
              <View style={styles.settingText}>
                <FrenciaText role="bodySm" style={styles.settingTitle}>
                  Unidad de distancia km/mi
                </FrenciaText>
                <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.settingSub}>
                  {useMiles ? 'En millas (mi)' : 'En kilómetros (km)'}
                </FrenciaText>
              </View>
              <Switch checked={useMiles} onChange={toggleMiles} />
            </View>

            {/* Fila: tema. Tres opciones, asi que va en selector en vez de switch,
                apilado debajo del titulo para que entre en cualquier ancho. */}
            <View style={[styles.settingRowStacked, styles.settingRowDivider]}>
              <View style={styles.settingText}>
                <FrenciaText role="bodySm" style={styles.settingTitle}>
                  Tema
                </FrenciaText>
                <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.settingSub}>
                  {TEMA_SUB[preference]}
                </FrenciaText>
              </View>
              <SegmentedControl
                fullWidth
                options={TEMA_OPTIONS}
                value={preference}
                onChange={(v) => setPreference(v as ThemePreference)}
              />
            </View>
          </View>
        </View>

        {/* Configuracion de la cuenta: misma fila que Cerrar sesion, en neutro */}
        <Pressable
          style={styles.settingsList}
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Configuracion"
        >
          <View style={styles.settingRow}>
            <View style={styles.configLeft}>
              <Icon name="settings" size={20} color={colors.textPrimary} />
              <FrenciaText role="bodySm" style={styles.settingTitle}>
                Configuración
              </FrenciaText>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textTertiary} />
          </View>
        </Pressable>

        {/* Cerrar sesion: recuadro propio, accion destructiva */}
        <Pressable
          style={styles.settingsList}
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesion"
        >
          <View style={styles.settingRow}>
            <View style={styles.configLeft}>
              <Icon name="log-out" size={20} color={colors.dangerText} />
              <FrenciaText role="bodySm" style={styles.signOutTitle}>
                Cerrar sesion
              </FrenciaText>
            </View>
          </View>
        </Pressable>
      </ScrollView>

      {/* Opciones de avatar */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
        onDismiss={() => {
          if (pendingPick) {
            setPendingPick(false);
            uploadPhoto();
          }
        }}
      >
        <Pressable style={styles.backdrop} onPress={() => setShowOptions(false)}>
          <Pressable style={styles.sheet}>
            {/* Vista previa grande del avatar actual, refleja los cambios en vivo */}
            <View style={styles.preview}>
              <Avatar name={seed ?? displayName} src={photo} size="xl" ring />
            </View>
            <FrenciaText role="subtitle" style={styles.sheetTitle}>
              Foto de perfil
            </FrenciaText>
            <Button variant="primary" size="lg" icon="repeat" fullWidth onPress={generateAvatar}>
              Generar nuevo avatar
            </Button>
            <Button variant="secondary" size="lg" icon="camera" fullWidth onPress={requestUploadPhoto}>
              Subir una foto
            </Button>
            {photo ? (
              <Button variant="ghost" size="lg" icon="x" fullWidth onPress={removePhoto}>
                Eliminar foto
              </Button>
            ) : null}
            <Button variant="ghost" size="md" fullWidth onPress={() => setShowOptions(false)}>
              Cancelar
            </Button>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgApp },
  scroll: {
    paddingHorizontal: spacing.padScreen,
    paddingTop: space[7],
    paddingBottom: space[12],
    gap: space[7],
  },

  // Modal de opciones de avatar
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: space[5],
    paddingBottom: space[8],
    gap: space[3],
  },
  preview: { alignItems: 'center', marginBottom: space[2] },
  sheetTitle: { marginBottom: space[1] },

  // Encabezado
  header: {
    justifyContent: 'center',
    minHeight: 40,
  },

  // Tarjeta de usuario
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: space[5],
  },
  avatarWrap: { position: 'relative' },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceCard,
  },
  userText: { flex: 1, gap: space[1] },

  // Ajustes
  settingsBlock: { gap: space[4] },
  settingsLabel: { paddingHorizontal: space[1] },
  settingsList: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[4],
    padding: space[5],
  },
  settingRowStacked: { gap: space[4], padding: space[5] },
  settingRowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  settingText: { flex: 1, gap: space[1] },
  configLeft: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  settingTitle: { fontFamily: sans.semibold, color: colors.textPrimary },
  settingSub: { fontSize: 12.5, lineHeight: 17 },
  signOutTitle: { fontFamily: sans.semibold, color: colors.dangerText },
});
