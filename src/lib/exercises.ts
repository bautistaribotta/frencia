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

export interface MuscleGroup {
  slug: string;
  name: string;
  /** Orden fijo del catalogo de musculos (pecho, espalda, hombros...). */
  position: number;
}

export interface Exercise {
  id: string;
  name: string;
  /** Nombre original en ingles: en el gimnasio se usan los dos indistintamente. */
  nameEn: string | null;
  /** Equipamiento tal como esta en la base (barra, mancuernas, polea...). */
  equipment: string | null;
  /** Musculo objetivo. Es el que usa el filtro por grupo muscular. */
  primary: MuscleGroup | null;
  /** Musculos que asisten, en el orden del catalogo. */
  secondary: MuscleGroup[];
}

// v3: el catalogo pasa a incluir musculos y equipamiento, asi que el cache
// viejo no sirve.
const STORAGE_KEY = 'frencia.exercises.catalog.v3';

// Cache en memoria compartido entre montajes del hook.
let memoryCache: Exercise[] | null = null;

// Tiene que coincidir con max_rows de Supabase (supabase/config.toml y el
// proyecto remoto). Si fuera mayor, la API recortaria cada pagina a max_rows,
// el bucle la tomaria por la ultima y el resto del catalogo quedaria afuera.
const CATALOGO_PAGINA = 1000;

interface FilaEjercicio {
  id: string;
  name: string;
  name_en: string | null;
  equipment: string | null;
  // Sin tipos generados, supabase-js tipa la relacion como arreglo aunque
  // muscle_groups es muchos-a-uno y en runtime llega un objeto: se aceptan
  // las dos formas.
  exercise_muscles:
    | { is_primary: boolean; muscle_groups: MuscleGroup | MuscleGroup[] | null }[]
    | null;
}

function porPosicion(a: MuscleGroup, b: MuscleGroup) {
  return a.position - b.position;
}

function aEjercicio(e: FilaEjercicio): Exercise {
  const primarios: MuscleGroup[] = [];
  const secundarios: MuscleGroup[] = [];
  for (const m of e.exercise_muscles ?? []) {
    const g = Array.isArray(m.muscle_groups) ? m.muscle_groups[0] : m.muscle_groups;
    if (!g) continue;
    (m.is_primary ? primarios : secundarios).push(g);
  }
  primarios.sort(porPosicion);
  secundarios.sort(porPosicion);
  return {
    id: e.id,
    name: e.name,
    nameEn: e.name_en,
    equipment: e.equipment,
    // Cada ejercicio tiene un unico objetivo; si alguno trajera dos, el resto
    // pasa a secundarios en vez de perderse.
    primary: primarios[0] ?? null,
    secondary: [...primarios.slice(1), ...secundarios],
  };
}

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
      .select('id, name, name_en, equipment, exercise_muscles(is_primary, muscle_groups(slug, name, position))')
      .order('name')
      .order('id')
      .range(desde, desde + CATALOGO_PAGINA - 1);
    if (error || !data) return null;
    for (const e of data) todos.push(aEjercicio(e as unknown as FilaEjercicio));
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

const EQUIPAMIENTO: Record<string, string> = {
  barra: 'Barra',
  mancuernas: 'Mancuernas',
  maquina: 'Máquina',
  multipower: 'Multipower',
  polea: 'Polea',
  'peso corporal': 'Peso corporal',
};

/** Equipamiento para mostrar. Si aparece uno nuevo, sale capitalizado. */
export function equipmentLabel(equipment: string | null): string | null {
  if (!equipment) return null;
  return EQUIPAMIENTO[equipment] ?? equipment.charAt(0).toUpperCase() + equipment.slice(1);
}

/** Grupos musculares que son objetivo de al menos un ejercicio del catalogo,
 *  en el orden fijo del catalogo de musculos y con cuantos ejercicios tiene
 *  cada uno. Un grupo sin ejercicios no se ofrece como filtro. */
export function muscleGroupsOf(catalog: Exercise[]): { group: MuscleGroup; count: number }[] {
  const porSlug = new Map<string, { group: MuscleGroup; count: number }>();
  for (const e of catalog) {
    if (!e.primary) continue;
    const g = porSlug.get(e.primary.slug);
    if (g) g.count += 1;
    else porSlug.set(e.primary.slug, { group: e.primary, count: 1 });
  }
  return [...porSlug.values()].sort((a, b) => porPosicion(a.group, b.group));
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
