/* Frencia · Perfil — pantalla de perfil y ajustes.
   Se abre al tocar el encabezado de saludo. Foto de perfil (Storage),
   editar perfil y ajustes. RIR/RPE y kg/lb se guardan en Supabase;
   el tema queda local hasta que exista el modo claro. */

import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { pickAndUploadAvatar } from '@/lib/avatar';

import {
  Avatar,
  Button,
  FrenciaText,
  Icon,
  Switch,
  colors,
  radius,
  sans,
  space,
  spacing,
} from '@/design';

interface ProfileScreenProps {
  userName?: string;
  avatarUrl?: string;
  onClose?: () => void;
  onEditProfile?: () => void;
  // Avisa al contenedor que cambio la foto, para reusarla en toda la app.
  onAvatarChange?: (url: string) => void;
}

export default function ProfileScreen({
  userName = 'Marco',
  avatarUrl,
  onClose,
  onEditProfile,
  onAvatarChange,
}: ProfileScreenProps) {
  // RIR/RPE y kg/lb se persisten en Supabase (profiles).
  const [useRpe, setUseRpe] = useState(false);
  const [useLb, setUseLb] = useState(false);
  // El tema queda local por ahora: el modo claro todavia no esta implementado.
  const [darkMode, setDarkMode] = useState(true);
  // Foto de perfil (se inicializa con la que viene del contenedor).
  const [photo, setPhoto] = useState<string | undefined>(avatarUrl);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  // Carga preferencias y foto guardadas del usuario al abrir el perfil.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('medidor_esfuerzo, unidad_peso, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelado || !data) return;
      setUseRpe(data.medidor_esfuerzo === 'rpe');
      setUseLb(data.unidad_peso === 'lb');
      if (data.avatar_url) setPhoto(data.avatar_url);
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  // Elige una imagen, la sube a Storage y la fija en el perfil.
  async function changePhoto() {
    if (uploadingPhoto) return;
    setPhotoError('');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPhotoError('No pudimos identificar tu sesión.');
      return;
    }
    setUploadingPhoto(true);
    const { url, error, canceled } = await pickAndUploadAvatar(user.id);
    setUploadingPhoto(false);
    if (canceled) return;
    if (error || !url) {
      setPhotoError(error ?? 'No pudimos actualizar la foto.');
      return;
    }
    setPhoto(url);
    onAvatarChange?.(url);
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado con cierre */}
        <View style={styles.header}>
          <Pressable
            hitSlop={10}
            onPress={onClose}
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
            onPress={changePhoto}
            disabled={uploadingPhoto}
            accessibilityRole="button"
            accessibilityLabel="Cambiar foto de perfil"
            style={styles.avatarWrap}
          >
            <Avatar name={userName} src={photo} size="lg" ring />
            <View style={styles.avatarBadge}>
              <Icon name="camera" size={13} color={colors.textOnAccent} />
            </View>
          </Pressable>
          <View style={styles.userText}>
            <FrenciaText role="subtitle">{userName}</FrenciaText>
            <FrenciaText role="dataLabel" color={colors.textTertiary}>
              {uploadingPhoto ? 'Subiendo foto...' : 'Tocá la foto para cambiarla'}
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
          onPress={onEditProfile}
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
                  {darkMode ? 'Modo oscuro' : 'Modo claro'}
                </FrenciaText>
              </View>
              <Switch checked={darkMode} onChange={setDarkMode} />
            </View>
          </View>
        </View>

        {/* Configuracion (sin accion por ahora) */}
        <Button
          variant="ghost"
          size="lg"
          icon="settings"
          fullWidth
          onPress={() => {}}
        >
          Configuracion
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgApp },
  scroll: {
    paddingHorizontal: spacing.padScreen,
    paddingTop: space[7],
    paddingBottom: space[12],
    gap: space[7],
  },

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
  settingTitle: { fontFamily: sans.semibold, color: colors.textPrimary },
  settingSub: { fontSize: 12.5, lineHeight: 17 },
});
