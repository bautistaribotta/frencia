/* Frencia · Busqueda y filtro sobre el catalogo de ejercicios en memoria,
   para el selector. Vive mientras el selector esta abierto: volver de
   configurar un ejercicio encuentra la busqueda como se dejo. */

import { useCallback, useMemo, useState } from 'react';

import { TIPOS, contarTipo, foldText, muscleGroupsOf, type Exercise, type TipoEjercicio } from './exercises';

// Tipos que se ofrecen como filtro junto a los musculos. La fuerza no: es casi
// todo el catalogo y ya la cubren los grupos musculares.
const TIPOS_FILTRO: TipoEjercicio[] = ['cardio', 'isometrico', 'hibrido'];

export function useBusquedaCatalogo(catalog: Exercise[]) {
  const [query, setQuery] = useState('');
  // Filtro del catalogo: un grupo muscular o un tipo, uno a la vez (null en
  // los dos = todos).
  const [grupo, setGrupo] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoEjercicio | null>(null);
  // Fila del catalogo desplegada: una sola a la vez.
  const [abierta, setAbierta] = useState<string | null>(null);

  // Chips del filtro: solo grupos que son objetivo de algun ejercicio. El
  // conteo es sobre el catalogo entero, no sobre la busqueda, para que los
  // chips no bailen mientras se escribe.
  const grupos = useMemo(() => muscleGroupsOf(catalog), [catalog]);
  const grupoActivo = grupos.find((g) => g.group.slug === grupo)?.group ?? null;
  // Tipos con ejercicios, ofrecidos antes de los musculos: son otro eje y al
  // final de la tira quedarian fuera de la pantalla.
  const tipos = useMemo(
    () =>
      TIPOS_FILTRO.map((k) => ({ kind: k, count: contarTipo(catalog, k) })).filter(
        (t) => t.count > 0,
      ),
    [catalog],
  );
  const filtroActivo = tipo ? TIPOS[tipo].label : (grupoActivo?.name ?? null);

  // Clave de busqueda precalculada por ejercicio (nombre en espanol e ingles,
  // musculo objetivo y, fuera de fuerza, etiqueta del tipo) para no normalizar
  // todo el catalogo en cada tecla.
  const clavesBusqueda = useMemo(
    () =>
      catalog.map((e) =>
        foldText(
          [
            e.name,
            e.nameEn,
            e.primary?.name,
            e.kind !== 'fuerza' ? TIPOS[e.kind].label : null,
          ]
            .filter(Boolean)
            .join('\n'),
        ),
      ),
    [catalog],
  );

  // Busqueda instantanea: filtra el catalogo en memoria (sin acentos ni
  // mayusculas). Cero latencia, sin red por cada tecla. Mira tambien el nombre
  // en ingles, porque en el gimnasio se usan los dos ("jalon al pecho" y "lat
  // pulldown" tienen que encontrar el mismo ejercicio), y el musculo objetivo.
  // El filtro por grupo mira solo el musculo principal: "Triceps" no tiene que
  // traer todos los press de pecho. Los tipos que no son fuerza tambien se
  // encuentran escribiendo su nombre ("cardio").
  // Sin texto ni filtro se lista el catalogo entero por nombre: el usuario
  // puede explorar sin saber de antemano como se llama lo que busca.
  const results = useMemo(() => {
    const q = foldText(query.trim());
    return catalog.filter(
      (e, i) =>
        (grupo === null || e.primary?.slug === grupo) &&
        (tipo === null || e.kind === tipo) &&
        (q === '' || clavesBusqueda[i].includes(q)),
    );
  }, [query, grupo, tipo, catalog, clavesBusqueda]);

  function filtrarGrupo(slug: string | null) {
    setTipo(null);
    setGrupo((g) => (slug === null || g === slug ? null : slug));
  }

  function filtrarTipo(kind: TipoEjercicio) {
    setGrupo(null);
    setTipo((t) => (t === kind ? null : kind));
  }

  const toggleFila = useCallback((id: string) => {
    setAbierta((actual) => (actual === id ? null : id));
  }, []);

  return {
    query,
    setQuery,
    grupo,
    tipo,
    abierta,
    grupos,
    tipos,
    filtroActivo,
    results,
    filtrarGrupo,
    filtrarTipo,
    toggleFila,
  };
}

export type BusquedaCatalogo = ReturnType<typeof useBusquedaCatalogo>;
