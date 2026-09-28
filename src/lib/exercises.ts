/* Frencia · Catalogo de ejercicios (client-side).
   El catalogo es chico y cambia poco, asi que lo bajamos entero una sola vez
   y filtramos en memoria: busqueda instantanea, sin pegarle a Supabase por
   cada tecla y funcional aunque la red este lenta.

   Estrategia stale-while-revalidate:
     1. Cache en memoria (sobrevive a la navegacion dentro de la sesion).
     2. Cache en AsyncStorage (sobrevive a reinicios): se muestra al instante.
     3. Refresco en segundo plano desde Supabase, que actualiza ambos caches
        solo cuando llego el catalogo completo (todas sus paginas). */

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';

export interface Exercise {
  id: string;
  name: string;
  /** Nombre original en ingles: en el gimnasio se usan los dos indistintamente. */
  nameEn: string | null;
}

// v2: el catalogo pasa a incluir name_en, asi que el cache viejo no sirve.
const STORAGE_KEY = 'frencia.exercises.catalog.v2';

// Cache en memoria compartido entre montajes del hook.
let memoryCache: Exercise[] | null = null;

// Tiene que coincidir con max_rows de Supabase (supabase/config.toml y el
// proyecto remoto). Si fuera mayor, la API recortaria cada pagina a max_rows,
// el bucle la tomaria por la ultima y el resto del catalogo quedaria afuera.
const CATALOGO_PAGINA = 1000;

/** Baja el catalogo entero, paginado para no truncarlo al limite de filas de
 *  la API. Devuelve null si falla cualquier pagina: un error de red no es un
 *  catalogo vacio ni uno parcial, y no tiene que pisar la copia que ya tenemos. */
async function fetchAll(): Promise<Exercise[] | null> {
  const todos: Exercise[] = [];
  for (let desde = 0; ; desde += CATALOGO_PAGINA) {
    // El id desempata nombres repetidos para que el orden sea estable entre
    // paginas y ningun ejercicio se repita o se pierda en el corte.
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name, name_en')
      .order('name')
      .order('id')
      .range(desde, desde + CATALOGO_PAGINA - 1);
    if (error || !data) return null;
    for (const e of data) todos.push({ id: e.id, name: e.name, nameEn: e.name_en });
    if (data.length < CATALOGO_PAGINA) break;
  }
  return todos;
}

/** Normaliza texto para comparar sin distinguir mayusculas ni acentos. */
export function foldText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u')
    .replace(/ñ/g, 'n');
}

/** Catalogo completo de ejercicios, listo para filtrar en memoria. */
export function useExerciseCatalog() {
  const [exercises, setExercises] = useState<Exercise[]>(memoryCache ?? []);
  const [loading, setLoading] = useState(memoryCache === null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      // 1. Si no hay cache en memoria, intentamos el de AsyncStorage para
      //    pintar resultados al instante mientras revalidamos.
      if (memoryCache === null) {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          if (raw && !cancelado) {
            const cached = JSON.parse(raw) as Exercise[];
            memoryCache = cached;
            setExercises(cached);
            setLoading(false);
          }
        } catch {
          // Cache corrupto o ausente: seguimos a la red.
        }
      }

      // 2. Refresco desde la fuente de verdad. Si falla, nos quedamos con la
      //    ultima copia valida (memoria o AsyncStorage) en vez de vaciarla.
      const fresh = await fetchAll();
      if (cancelado) return;
      if (fresh === null) {
        setLoading(false);
        return;
      }
      memoryCache = fresh;
      setExercises(fresh);
      setLoading(false);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)).catch(() => {});
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  return { exercises, loading };
}
