// Seleccion y subida de la foto de perfil al Storage de Supabase.
// La imagen se guarda en avatars/{userId}/avatar.jpg (un solo archivo,
// se sobrescribe) y la URL publica versionada queda en profiles.avatar_url.
import * as ImagePicker from 'expo-image-picker';

import { supabase } from './supabase';

interface UploadResult {
  url?: string;
  error?: string;
  canceled?: boolean;
}

export async function pickAndUploadAvatar(userId: string): Promise<UploadResult> {
  // En nativo pide permiso de galeria; en web se resuelve como concedido.
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    return { error: 'Necesitamos permiso para acceder a tus fotos.' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.length) {
    return { canceled: true };
  }

  const asset = result.assets[0];

  try {
    const res = await fetch(asset.uri);
    const arrayBuffer = await res.arrayBuffer();
    const contentType = asset.mimeType ?? 'image/jpeg';
    const path = `${userId}/avatar.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, arrayBuffer, { contentType, upsert: true });

    if (uploadError) {
      return { error: 'No pudimos subir la imagen. Proba de nuevo.' };
    }

    // Cache-bust: al sobrescribir el mismo path, el CDN podria servir la vieja.
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${data.publicUrl}?v=${Date.now()}`;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', userId);

    if (profileError) {
      return { error: 'Subimos la imagen pero no pudimos guardarla en tu perfil.' };
    }

    return { url };
  } catch {
    return { error: 'No pudimos procesar la imagen.' };
  }
}
