/* Frencia · Catalogo de ejercicios (client-side).
   El catalogo es chico y cambia poco, asi que lo bajamos entero una sola vez
   y filtramos en memoria: busqueda instantanea, sin pegarle a Supabase por
   cada tecla y funcional aunque la red este lenta.

   Estrategia stale-while-revalidate:
     1. Cache en memoria (sobrevive a la navegacion dentro de la sesion).
     2. Cache en AsyncStorage (sobrevive a reinicios): se muestra al instante.
     3. Refresco en segundo plano desde Supabase, que actualiza ambos caches. */

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';

export interface Exercise {
  id: string;
  name: string;
}

const STORAGE_KEY = 'frencia.exercises.catalog.v1';

// Cache en memoria compartido entre montajes del hook.
let memoryCache: Exercise[] | null = null;

async function fetchAll(): Promise<Exercise[]> {
  const { data } = await supabase.from('exercises').select('id, name').order('name');
  return data ?? [];
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

      // 2. Refresco desde la fuente de verdad.
      const fresh = await fetchAll();
      if (cancelado) return;
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
