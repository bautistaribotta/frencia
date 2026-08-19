/* Frencia · Perfil — pantalla de perfil y ajustes.
   Es una pestania: se llega desde la barra de abajo o tocando el encabezado de
   saludo del home. Foto de perfil (Storage), editar perfil y ajustes. RIR/RPE,
   kg/lb, cm/ft y el tema (oscuro/claro) se guardan en Supabase; el tema ademas
   se aplica en vivo via contexto. */

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { pickAndUploadAvatar, signAvatarUrl, deleteAvatarFile } from '@/lib/avatar';
import { supabase } from '@/lib/supabase';

import {
  Avatar,
  Button,
  FrenciaText,
  Icon,
  radius,
  sans,
  space,
  spacing,
  Switch,
  useColors,
  useTheme,
  useThemedStyles,
  type Palette,
} from '@/design';

export default function ProfileScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  // Datos del perfil compartidos (saludo, avatar) + reflejo de cambios.
  const { displayName, profile, applyAvatar } = useProfile();
  // Nombre completo para la tarjeta: suma el apellido si esta cargado.
  const fullName = [profile?.name?.trim(), profile?.surname?.trim()]
    .filter(Boolean)
    .join(' ') || displayName;
  const { showToast } = useToast();
  // Tema activo (oscuro/claro): lo maneja el contexto, persiste solo.
  const { mode, setMode } = useTheme();
  const isDark = mode === 'dark';
  // RIR/RPE y kg/lb se persisten en Supabase (profiles).
  const [useRpe, setUseRpe] = useState(false);
  const [useLb, setUseLb] = useState(false);
  // Unidad de medida corporal (altura): se persiste en profiles (cm/ft).
  const [useFeet, setUseFeet] = useState(false);
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
        .select('medidor_esfuerzo, unidad_peso, unidad_altura, avatar_path, avatar_seed')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelado || !data) return;
      setUseRpe(data.medidor_esfuerzo === 'rpe');
      setUseLb(data.unidad_peso === 'lb');
      setUseFeet(data.unidad_altura === 'ft');
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

  function toggleFeet(next: boolean) {
    setUseFeet(next);
    persistPref({ unidad_altura: next ? 'ft' : 'cm' });
  }

  // Cierra la sesion. El cambio lo detecta SessionProvider y el gate del
  // layout raiz redirige al login automaticamente.
  async function handleSignOut() {
    showToast({ message: 'Sesion cerrada', type: 'info' });
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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

            {/* Fila: unidad de medida corporal (solo front por ahora) */}
            <View style={[styles.settingRow, styles.settingRowDivider]}>
              <View style={styles.settingText}>
                <FrenciaText role="bodySm" style={styles.settingTitle}>
                  Unidad de medida cm/in
                </FrenciaText>
                <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.settingSub}>
                  {useFeet ? 'En pies y pulgadas' : 'En centímetros (cm)'}
                </FrenciaText>
              </View>
              <Switch checked={useFeet} onChange={toggleFeet} />
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
  settingRowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  settingText: { flex: 1, gap: space[1] },
  configLeft: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  settingTitle: { fontFamily: sans.semibold, color: colors.textPrimary },
  settingSub: { fontSize: 12.5, lineHeight: 17 },
  signOutTitle: { fontFamily: sans.semibold, color: colors.dangerText },
});
