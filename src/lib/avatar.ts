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

// Corta la espera si la red se traba, para que la UI nunca quede colgada.
function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
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
    const contentType = asset.mimeType ?? 'image/jpeg';
    const path = `${userId}/avatar.jpg`;

    // Subimos via FormData con el uri del archivo: React Native lo sube en
    // streaming nativo, sin leerlo a memoria JS ni mandar un body binario por
    // fetch (ambas cosas cuelgan la subida en iOS).
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      name: 'avatar.jpg',
      type: contentType,
    } as unknown as Blob);

    const { error: uploadError } = await withTimeout(
      supabase.storage.from('avatars').upload(path, formData, { contentType, upsert: true }),
      30000,
    );

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
