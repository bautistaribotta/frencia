/* Frencia · Perfil — pantalla de perfil y ajustes.
   Se abre al tocar el encabezado de saludo. Foto de perfil (Storage),
   editar perfil y ajustes. RIR/RPE, kg/lb y el tema (oscuro/claro) se
   guardan en Supabase; el tema ademas se aplica en vivo via contexto. */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { pickAndUploadAvatar } from '@/lib/avatar';
import { useProfile } from '@/contexts/profile';

import {
  Avatar,
  Button,
  FrenciaText,
  Icon,
  Switch,
  useColors,
  useTheme,
  useThemedStyles,
  radius,
  sans,
  space,
  spacing,
  type Palette,
} from '@/design';

export default function ProfileScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  // Datos del perfil compartidos (saludo, avatar) + reflejo de cambios.
  const { displayName, profile, applyAvatar } = useProfile();
  // Tema activo (oscuro/claro): lo maneja el contexto, persiste solo.
  const { mode, setMode } = useTheme();
  const isDark = mode === 'dark';
  // RIR/RPE y kg/lb se persisten en Supabase (profiles).
  const [useRpe, setUseRpe] = useState(false);
  const [useLb, setUseLb] = useState(false);
  // Avatar: foto subida (prioridad) o semilla del avatar generado.
  const [photo, setPhoto] = useState<string | undefined>(profile?.avatarUrl ?? undefined);
  const [seed, setSeed] = useState<string | undefined>(profile?.avatarSeed ?? undefined);
  const [busy, setBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  function closeProfile() {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }

  // Gesto vertical para volver: solo activo con el scroll arriba del todo,
  // asi no compite con el desplazamiento del contenido. El swipe horizontal
  // (izquierda a derecha) lo maneja el gesto nativo del Stack.
  const [atTop, setAtTop] = useState(true);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setAtTop(e.nativeEvent.contentOffset.y <= 0);
  }

  const swipeDownGesture = Gesture.Pan()
    .enabled(atTop)
    .activeOffsetY(20)
    .failOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.translationY > 120) runOnJS(closeProfile)();
    });

  // Carga preferencias y avatar guardados del usuario al abrir el perfil.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('medidor_esfuerzo, unidad_peso, avatar_url, avatar_seed')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelado || !data) return;
      setUseRpe(data.medidor_esfuerzo === 'rpe');
      setUseLb(data.unidad_peso === 'lb');
      if (data.avatar_url) setPhoto(data.avatar_url);
      if (data.avatar_seed) setSeed(data.avatar_seed);
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  // Elige una imagen, la sube a Storage y la fija como foto de perfil.
  async function uploadPhoto() {
    if (busy) return;
    setShowOptions(false);
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
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_seed: nuevaSeed, avatar_url: null })
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
    // Borra el archivo de Storage (no falla si no existe).
    await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`]);
    // Asegura una semilla para mostrar el avatar generado.
    const semilla = seed ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null, avatar_seed: semilla })
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

  // Guarda una preferencia en profiles sin bloquear la UI (optimista).
  async function persistPref(patch: Record<string, string>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update(patch).eq('id', user.id);
  }

  function toggleRpe(next: boolean) {
    setUseRpe(next);
    persistPref({ medidor_esfuerzo: next ? 'rpe' : 'rir' });
  }

  function toggleLb(next: boolean) {
    setUseLb(next);
    persistPref({ unidad_peso: next ? 'lb' : 'kg' });
  }

  // Cierra la sesion. El cambio lo detecta SessionProvider y el gate del
  // layout raiz redirige al login automaticamente.
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <GestureDetector gesture={swipeDownGesture}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Encabezado con cierre */}
        <View style={styles.header}>
          <Pressable
            hitSlop={10}
            onPress={closeProfile}
            accessibilityRole="button"
            accessibilityLabel="Cerrar perfil"
            style={styles.closeBtn}
          >
            <Icon name="chevron-left" size={24} color={colors.textPrimary} />
          </Pressable>
          <FrenciaText role="title">Perfil</FrenciaText>
          {/* Espaciador para centrar el titulo */}
          <View style={styles.closeBtn} />
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
            <FrenciaText role="subtitle">{displayName}</FrenciaText>
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
            Ajustes
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

            {/* Fila: tema */}
            <View style={[styles.settingRow, styles.settingRowDivider]}>
              <View style={styles.settingText}>
                <FrenciaText role="bodySm" style={styles.settingTitle}>
                  Modo oscuro / claro
                </FrenciaText>
                <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.settingSub}>
                  {isDark ? 'Modo oscuro' : 'Modo claro'}
                </FrenciaText>
              </View>
              <Switch checked={isDark} onChange={(next) => setMode(next ? 'dark' : 'light')} />
            </View>
          </View>
        </View>

        {/* Configuracion: recuadro propio, una sola fila (sin accion por ahora) */}
        <Pressable style={styles.settingsList} onPress={() => {}}>
          <View style={styles.settingRow}>
            <View style={styles.configLeft}>
              <Icon name="settings" size={20} color={colors.textSecondary} />
              <FrenciaText role="bodySm" style={styles.settingTitle}>
                Configuracion
              </FrenciaText>
            </View>
            <Icon name="chevron-right" size={18} color={colors.textTertiary} />
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
      </GestureDetector>

      {/* Opciones de avatar */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
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
              Generar avatar nuevo
            </Button>
            <Button variant="secondary" size="lg" icon="camera" fullWidth onPress={uploadPhoto}>
              Subir una foto
            </Button>
            {photo ? (
              <Button variant="ghost" size="lg" icon="x" fullWidth onPress={removePhoto}>
                Eliminar foto
              </Button>
            ) : null}
            <Button variant="ghost" size="md" fullWidth onPress={() => setShowOptions(false)}>
              Volver atras
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  settingRowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  settingText: { flex: 1, gap: space[1] },
  configLeft: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  settingTitle: { fontFamily: sans.semibold, color: colors.textPrimary },
  settingSub: { fontSize: 12.5, lineHeight: 17 },
  signOutTitle: { fontFamily: sans.semibold, color: colors.dangerText },
});
