// Seleccion y subida de la foto de perfil al Storage de Supabase.
//
// El bucket avatars es privado: la imagen va a avatars/{userId}/{aleatorio}.jpg
// y en profiles.avatar_path queda la ruta, no una URL. Para mostrarla hay que
// firmarla (ver signAvatarUrl).
//
// Lo que sale del selector nunca se sube tal cual: se reprocesa antes. Ver
// prepararImagen.
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as Crypto from 'expo-crypto';

import { supabase } from './supabase';

// Lado maximo del avatar guardado. El tamano mas grande con el que se dibuja
// es 120pt (Avatar size="xl"), o sea 360px en una pantalla 3x. 512 deja
// margen para crecer y sigue pesando decimas de lo que pesa una foto de
// camara.
const LADO_MAX = 512;

// 0.85 en JPEG es el punto donde los artefactos dejan de verse a simple vista.
// Bajar mas se nota en la piel y en los degradados.
const CALIDAD = 0.85;

// Tope de entrada. No es el tamano final (eso lo define el reprocesado) sino
// un corte para no ponerse a decodificar un archivo absurdo en un telefono
// modesto.
const MAX_BYTES_ENTRADA = 25 * 1024 * 1024;

// Vigencia de la URL firmada. Una semana es de sobra para que no se venza con
// la app abierta, y corta para que una URL que se filtre no sirva para siempre.
const FIRMA_SEGUNDOS = 60 * 60 * 24 * 7;

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

/**
 * Reprocesa la imagen elegida antes de subirla y devuelve el uri del archivo
 * nuevo, siempre JPEG.
 *
 * El paso importante no es el resize sino el reencodeado: el manipulador
 * decodifica a bitmap y vuelve a escribir el archivo desde cero, asi que todo
 * lo que no sean pixeles se pierde. Eso incluye el EXIF, y en el EXIF de una
 * foto de celular viaja la geolocalizacion exacta de donde fue tomada, la
 * fecha, el modelo del telefono y a veces el numero de serie. Nada de eso
 * tiene por que terminar en un bucket publico.
 *
 * Al decodificar tambien se aplica la orientacion del EXIF, asi que la foto
 * queda derecha en los pixeles y no depende de una etiqueta que acabamos de
 * tirar.
 */
async function prepararImagen(asset: ImagePicker.ImagePickerAsset): Promise<string> {
  const contexto = ImageManipulator.manipulate(asset.uri);

  // Solo se achica, nunca se agranda: estirar una foto chica no suma detalle
  // y si suma bytes. Se fija un solo lado para no deformar si el recorte no
  // salio perfectamente cuadrado.
  // El selector puede devolver las medidas en cero si el sistema no se las
  // informo. En ese caso achicamos igual: agrandar de mas una foto chica es
  // mejor que subir a ciegas una de 12 megapixeles.
  const ladoMayor = Math.max(asset.width, asset.height);
  if (ladoMayor === 0 || ladoMayor > LADO_MAX) {
    if (asset.width >= asset.height) contexto.resize({ width: LADO_MAX });
    else contexto.resize({ height: LADO_MAX });
  }

  const imagen = await contexto.renderAsync();
  const salida = await imagen.saveAsync({ format: SaveFormat.JPEG, compress: CALIDAD });
  return salida.uri;
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
    // Sin compresion en el selector: la unica compresion que queremos es la
    // del reprocesado. Comprimir dos veces apila artefactos sobre artefactos.
    quality: 1,
  });

  if (result.canceled || !result.assets?.length) {
    return { canceled: true };
  }

  const asset = result.assets[0];

  if (asset.fileSize !== undefined && asset.fileSize > MAX_BYTES_ENTRADA) {
    return { error: 'Esa imagen es demasiado grande. Elegi una mas liviana.' };
  }

  try {
    // Siempre JPEG: el reprocesado normaliza el formato, asi que el nombre del
    // archivo y el content-type no pueden discrepar con el contenido.
    const contentType = 'image/jpeg';
    // Nombre aleatorio y no reutilizado. Antes era siempre avatar.jpg, o sea
    // una ruta deducible desde el uuid del usuario. Ademas evita el
    // cache-busting: cada subida es un archivo nuevo, no hay version vieja que
    // el CDN pueda seguir sirviendo.
    const path = `${userId}/${Crypto.randomUUID()}.jpg`;
    const anterior = await rutaGuardada(userId);
    const uri = await prepararImagen(asset);

    // Subimos via FormData con el uri del archivo: React Native lo sube en
    // streaming nativo, sin leerlo a memoria JS ni mandar un body binario por
    // fetch (ambas cosas cuelgan la subida en iOS).
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'avatar.jpg',
      type: contentType,
    } as unknown as Blob);

    const { error: uploadError } = await withTimeout(
      supabase.storage.from('avatars').upload(path, formData, { contentType }),
      30000,
    );

    if (uploadError) {
      return { error: 'No pudimos subir la imagen. Proba de nuevo.' };
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_path: path })
      .eq('id', userId);

    if (profileError) {
      // El perfil sigue apuntando a la foto anterior, asi que la que acabamos
      // de subir no la referencia nadie: la sacamos en vez de dejarla colgada.
      await supabase.storage.from('avatars').remove([path]);
      return { error: 'Subimos la imagen pero no pudimos guardarla en tu perfil.' };
    }

    // Recien con el perfil ya apuntando al archivo nuevo se borra el viejo.
    if (anterior && anterior !== path) {
      await supabase.storage.from('avatars').remove([anterior]);
    }

    const url = await signAvatarUrl(path);
    if (!url) {
      return { error: 'Subimos la imagen pero no pudimos mostrarla. Volve a entrar al perfil.' };
    }

    return { url };
  } catch {
    return { error: 'No pudimos procesar la imagen.' };
  }
}

/** Ruta del avatar que el perfil tiene guardado hoy, o null si no hay foto. */
async function rutaGuardada(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', userId)
    .maybeSingle();
  return data?.avatar_path ?? null;
}

/**
 * Convierte la ruta guardada en una URL que se pueda mostrar. El bucket es
 * privado, asi que sin firma no hay forma de leer el archivo.
 */
export async function signAvatarUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  try {
    const { data, error } = await supabase.storage
      .from('avatars')
      .createSignedUrl(path, FIRMA_SEGUNDOS);
    if (error || !data) return null;
    return data.signedUrl;
  } catch {
    // Nunca propaga. Quedarse sin foto es un problema chico; que la caida de
    // Storage se lleve puesto al perfil entero de quien llama, no.
    return null;
  }
}

/**
 * Borra del bucket la foto que el perfil tenga guardada. No toca la fila del
 * perfil: eso lo hace quien llama, y tiene que hacerlo despues, porque de aca
 * sale la ruta.
 *
 * Si el borrado falla queda un archivo huerfano, al que no llega nadie porque
 * el bucket es privado y ninguna fila lo referencia.
 */
export async function deleteAvatarFile(userId: string): Promise<void> {
  const path = await rutaGuardada(userId);
  if (!path) return;
  await supabase.storage.from('avatars').remove([path]);
}
