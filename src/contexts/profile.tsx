/* Frencia · Contexto de perfil.
   Trae una sola vez los datos del perfil del usuario logueado y los
   comparte con todas las rutas (saludo, avatar, completitud para el
   flujo de setup). Reemplaza el prop-drilling que antes bajaba desde
   el layout raiz. Expone `refresh` para releer tras editar, `applyAvatar`
   para reflejar cambios de foto al instante y `savePreferencias` para que
   un cambio de unidad o de medidor se vea en toda la app en el acto.
   Tambien lee la ultima aceptacion de los textos legales y expone
   `aceptarLegales` para registrar una nueva. */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { supabase } from '@/lib/supabase';
import { fechaNacimientoAEdad } from '@/lib/edad';
import { signAvatarUrl } from '@/lib/avatar';
import { TERMINOS_VERSION } from '@/lib/terminos';
import { PRIVACIDAD_VERSION } from '@/lib/privacidad';
import type { UnidadPeso } from '@/lib/peso';
import type { UnidadAltura } from '@/lib/altura';
import type { UnidadDistancia } from '@/lib/distancia';
import { useSession } from './session';

export interface ProfileData {
  name: string | null;
  surname: string | null;
  username: string | null;
  edad: number | null;
  sexo: string | null;
  altura: number | null;
  peso: number | null;
  avatarUrl: string | null;
  avatarSeed: string | null;
  onboardingCompleted: boolean;
  // Medidor de esfuerzo preferido. Decide la escala al cargar ejercicios.
  medidorEsfuerzo: 'rir' | 'rpe';
  // Unidad en la que se muestra y se escribe el peso. Lo guardado es siempre
  // kilo, ver seccion 4.4 de docs/specs/registro-de-sesion.md
  unidadPeso: UnidadPeso;
  // Idem para la altura: se guarda en cm y se muestra en cm o en pies y
  // pulgadas segun esta preferencia.
  unidadAltura: UnidadAltura;
  // Idem para la distancia de cardio e hibridos: se guarda en metros y se
  // muestra en km o en millas.
  unidadDistancia: UnidadDistancia;
  // Fecha en que pidio eliminar la cuenta. Mientras no sea null la cuenta esta
  // en periodo de gracia y el gate de auth solo deja ver /account-recovery.
  deletionRequestedAt: Date | null;
  // Versiones de la ultima aceptacion de los Terminos y la Politica de
  // Privacidad. null = nunca acepto. Ver public.aceptaciones_legales.
  aceptacionLegal: { terminos: string; privacidad: string } | null;
}

// Preferencias que se cambian desde un switch o una rueda y tienen que verse
// al instante en toda la app, sin esperar a releer el perfil.
export type Preferencias = Pick<ProfileData, 'medidorEsfuerzo' | 'unidadPeso' | 'unidadAltura' | 'unidadDistancia'>;

const COLUMNA_PREFERENCIA: Record<keyof Preferencias, string> = {
  medidorEsfuerzo: 'medidor_esfuerzo',
  unidadPeso: 'unidad_peso',
  unidadAltura: 'unidad_altura',
  unidadDistancia: 'unidad_distancia',
};

// Tiempo maximo de cada ida a Supabase al leer el perfil. Con la red colgada
// la consulta puede no volver nunca, y la app quedaba en la pantalla de carga
// sin salida. Pasado el limite se trata como un error de lectura.
const LIMITE_LECTURA_MS = 8000;

/** Resuelve con el resultado de la promesa, o con null si tarda mas que el
 *  limite. No la cancela: la respuesta tardia simplemente se ignora. */
async function conLimite<T>(promesa: PromiseLike<T>): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), LIMITE_LECTURA_MS);
  });
  try {
    return await Promise.race([Promise.resolve(promesa), limite]);
  } finally {
    clearTimeout(timer);
  }
}

interface ProfileContextValue {
  profile: ProfileData | null;
  loading: boolean;
  // Nombre listo para mostrar, con fallback si el perfil aun no cargo.
  displayName: string;
  // El usuario todavia no paso por el setup inicial (primer ingreso).
  needsOnboarding: boolean;
  // No acepto las versiones vigentes de los Terminos y la Politica de
  // Privacidad (nunca acepto, o cambiaron desde la ultima vez). El gate lo
  // manda a /legal-consent antes que a cualquier otra pantalla de la app.
  needsLegalAcceptance: boolean;
  // La lectura del perfil fallo (red, Supabase caido, consulta rota) y no hay
  // una copia previa que mostrar. No es lo mismo que una cuenta sin perfil: el
  // gate manda a /profile-error en vez de al setup, que pisaria los datos.
  loadError: boolean;
  // Relee el perfil. Devuelve false si la lectura fallo.
  refresh: () => Promise<boolean>;
  applyAvatar: (next: { url?: string | null; seed?: string | null }) => void;
  // Cambia una o mas preferencias: primero en el contexto, para que toda la
  // app recalcule pesos y alturas en el mismo render que el switch, y despues
  // en profiles. Si la escritura falla vuelve al valor anterior y devuelve
  // false, asi el contexto nunca queda distinto de la base.
  savePreferencias: (next: Partial<Preferencias>) => Promise<boolean>;
  // Registra la aceptacion de las versiones vigentes. Devuelve false si fallo.
  aceptarLegales: () => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  loading: true,
  displayName: 'Atleta',
  needsOnboarding: false,
  needsLegalAcceptance: false,
  loadError: false,
  refresh: async () => false,
  applyAvatar: () => {},
  savePreferencias: async () => false,
  aceptarLegales: async () => false,
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  // Id del usuario cuyo perfil ya terminamos de leer. `loading` se deriva de
  // compararlo con el de la sesion, en vez de ser un booleano suelto: los
  // efectos de los hijos corren antes que los del provider, y el gate de auth
  // llegaba a ver loading=false con el perfil todavia sin leer. Interpretaba
  // ese null como "sin onboarding" y mandaba al setup en cada ingreso.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  // Ultimo usuario leido. Lo usa la firma del avatar, que resuelve tarde, para
  // no pisar el perfil de otra cuenta si el usuario cambio mientras tanto.
  const ultimoUsuario = useRef<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  // Perfil vigente, para decidir sin depender del render si un error de
  // lectura tiene una copia previa que conservar.
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const refresh = useCallback(async (): Promise<boolean> => {
    const auth = await conLimite(supabase.auth.getUser());

    // Un error de lectura no es un perfil vacio. Si ya habia un perfil de este
    // usuario se conserva (un refresco fallido despues de editar no tiene por
    // que sacarlo de la app); si no, se marca el error para que el gate no lo
    // confunda con un primer ingreso.
    const marcarFallo = (conservar: boolean) => {
      if (conservar && profileRef.current) return;
      setProfile(null);
      setLoadError(true);
    };

    // Sin red getUser tambien falla, y devuelve el mismo user null que un
    // usuario deslogueado. Por eso se mira el error (o el limite de tiempo)
    // antes de concluir que no hay sesion.
    if (!auth || auth.error) {
      marcarFallo(ultimoUsuario.current !== null);
      return false;
    }
    const current = auth.data.user;

    if (!current) {
      ultimoUsuario.current = null;
      setProfile(null);
      setLoadedFor(null);
      setLoadError(false);
      return false;
    }

    const mismoUsuario = ultimoUsuario.current === current.id;
    ultimoUsuario.current = current.id;

    // Recien creada la cuenta, la fila del profile la inserta un trigger. Si la
    // leemos demasiado pronto puede no estar todavia: reintentamos unas veces
    // para no asumir por error que el usuario ya hizo el onboarding.
    let data = null;
    let fallo = false;
    for (let intento = 0; intento < 3; intento++) {
      const res = await conLimite(
        supabase
          .from('profiles')
          .select('name, surname, username, fecha_nacimiento, sexo, altura, peso, avatar_path, avatar_seed, onboarding_completed, medidor_esfuerzo, unidad_peso, unidad_altura, unidad_distancia, deletion_requested_at, aceptaciones_legales(version_terminos, version_privacidad)')
          .eq('id', current.id)
          // De las aceptaciones solo importa la ultima.
          .order('aceptada_el', { referencedTable: 'aceptaciones_legales', ascending: false })
          .limit(1, { referencedTable: 'aceptaciones_legales' })
          .maybeSingle(),
      );
      // Se paso del limite: ya se espero bastante, no se reintenta.
      if (!res) {
        fallo = true;
        break;
      }
      if (res.data) {
        data = res.data;
        break;
      }
      // Un error tambien se reintenta: puede ser un corte de red pasajero.
      fallo = res.error !== null;
      await new Promise((r) => setTimeout(r, 400));
    }

    if (!data && fallo) {
      marcarFallo(mismoUsuario);
      setLoadedFor(current.id);
      return false;
    }

    setProfile(
      data
        ? {
            name: data.name,
            surname: data.surname,
            username: data.username,
            edad: fechaNacimientoAEdad(data.fecha_nacimiento),
            sexo: data.sexo,
            altura: data.altura,
            peso: data.peso,
            // Se completa despues, ver abajo.
            avatarUrl: null,
            avatarSeed: data.avatar_seed,
            onboardingCompleted: data.onboarding_completed ?? false,
            medidorEsfuerzo: data.medidor_esfuerzo === 'rpe' ? 'rpe' : 'rir',
            unidadPeso: data.unidad_peso === 'lb' ? 'lb' : 'kg',
            unidadAltura: data.unidad_altura === 'ft' ? 'ft' : 'cm',
            unidadDistancia: data.unidad_distancia === 'mi' ? 'mi' : 'km',
            deletionRequestedAt: data.deletion_requested_at ? new Date(data.deletion_requested_at) : null,
            aceptacionLegal: data.aceptaciones_legales?.[0]
              ? {
                  terminos: data.aceptaciones_legales[0].version_terminos,
                  privacidad: data.aceptaciones_legales[0].version_privacidad,
                }
              : null,
          }
        : null,
    );
    // Marcamos contra el id que efectivamente leimos, no contra el de la
    // sesion: si el usuario cambio a mitad de la lectura, el perfil viejo no
    // cuenta como cargado para el nuevo.
    setLoadedFor(current.id);
    setLoadError(false);

    // Firmar el avatar es otra ida a Storage. Va despues de publicar el perfil
    // y sin bloquearlo: el nombre no tiene por que esperar a una foto, ni
    // desaparecer si Storage esta caido. Llega unos milisegundos mas tarde y
    // hasta entonces se ve el avatar generado por semilla.
    if (data?.avatar_path) {
      const paraUsuario = current.id;
      signAvatarUrl(data.avatar_path).then((url) => {
        if (!url || ultimoUsuario.current !== paraUsuario) return;
        setProfile((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
      });
    }
    return true;
  }, []);

  // Recarga el perfil cada vez que cambia el usuario (login/logout).
  const userId = user?.id;
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoadedFor(null);
      setLoadError(false);
      return;
    }
    let cancelado = false;
    (async () => {
      try {
        await refresh();
      } catch {
        if (!cancelado) {
          setProfile(null);
          setLoadError(true);
        }
      } finally {
        // Falle o no la lectura, damos el perfil por resuelto: el gate de auth
        // espera a que `loading` sea false para decidir ruta, y sin esto una
        // caida de red lo dejaria esperando para siempre.
        if (!cancelado) setLoadedFor(userId);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [userId, refresh]);

  // Hay sesion pero todavia no leimos el perfil de ese usuario. Sin sesion no
  // hay nada que esperar.
  const loading = userId ? loadedFor !== userId : false;

  const applyAvatar = useCallback(
    (next: { url?: string | null; seed?: string | null }) => {
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          avatarUrl: next.url !== undefined ? next.url : prev.avatarUrl,
          avatarSeed: next.seed !== undefined ? next.seed : prev.avatarSeed,
        };
      });
    },
    [],
  );

  const savePreferencias = useCallback(
    async (next: Partial<Preferencias>): Promise<boolean> => {
      if (!profile || !userId) return false;
      const claves = Object.keys(next) as (keyof Preferencias)[];
      // Solo se revierten las claves que se tocaron: otro cambio en vuelo sobre
      // una preferencia distinta no tiene por que perderse si este falla.
      const anterior = Object.fromEntries(claves.map((k) => [k, profile[k]])) as Partial<Preferencias>;
      setProfile((prev) => (prev ? { ...prev, ...next } : prev));

      const patch = Object.fromEntries(claves.map((k) => [COLUMNA_PREFERENCIA[k], next[k]]));
      const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
      if (error) {
        setProfile((prev) => (prev ? { ...prev, ...anterior } : prev));
        return false;
      }
      return true;
    },
    [profile, userId],
  );

  const aceptarLegales = useCallback(async (): Promise<boolean> => {
    // La fecha y el usuario los pone la base; aca solo van las versiones.
    const { error } = await supabase.rpc('registrar_aceptacion_legal', {
      p_version_terminos: TERMINOS_VERSION,
      p_version_privacidad: PRIVACIDAD_VERSION,
    });
    if (error) return false;
    setProfile((prev) =>
      prev ? { ...prev, aceptacionLegal: { terminos: TERMINOS_VERSION, privacidad: PRIVACIDAD_VERSION } } : prev,
    );
    return true;
  }, []);

  const displayName = profile?.name?.trim() || 'Atleta';
  const legalesVigentes =
    profile?.aceptacionLegal?.terminos === TERMINOS_VERSION &&
    profile.aceptacionLegal.privacidad === PRIVACIDAD_VERSION;

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        displayName,
        // Sin fila de perfil es un primer ingreso. Con la lectura fallida no se
        // sabe, y mandar al setup pisaria los datos de una cuenta existente.
        needsOnboarding: profile ? !profile.onboardingCompleted : !loadError,
        // Mismo criterio: con la lectura fallida no se sabe, y decide el error.
        needsLegalAcceptance: profile ? !legalesVigentes : !loadError,
        loadError,
        refresh,
        applyAvatar,
        savePreferencias,
        aceptarLegales,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  return useContext(ProfileContext);
}
