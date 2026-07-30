/* Frencia · Contexto de perfil.
   Trae una sola vez los datos del perfil del usuario logueado y los
   comparte con todas las rutas (saludo, avatar, completitud para el
   flujo de setup). Reemplaza el prop-drilling que antes bajaba desde
   el layout raiz. Expone `refresh` para releer tras editar y
   `applyAvatar` para reflejar cambios de foto al instante. */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { supabase } from '@/lib/supabase';
import { fechaNacimientoAEdad } from '@/lib/edad';
import { useSession } from './session';

export interface ProfileData {
  name: string | null;
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
}

interface ProfileContextValue {
  profile: ProfileData | null;
  loading: boolean;
  // Nombre listo para mostrar, con fallback si el perfil aun no cargo.
  displayName: string;
  // El usuario todavia no paso por el setup inicial (primer ingreso).
  needsOnboarding: boolean;
  refresh: () => Promise<void>;
  applyAvatar: (next: { url?: string | null; seed?: string | null }) => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  loading: true,
  displayName: 'Atleta',
  needsOnboarding: false,
  refresh: async () => {},
  applyAvatar: () => {},
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

  const refresh = useCallback(async () => {
    const {
      data: { user: current },
    } = await supabase.auth.getUser();

    if (!current) {
      setProfile(null);
      setLoadedFor(null);
      return;
    }

    // Recien creada la cuenta, la fila del profile la inserta un trigger. Si la
    // leemos demasiado pronto puede no estar todavia: reintentamos unas veces
    // para no asumir por error que el usuario ya hizo el onboarding.
    let data = null;
    for (let intento = 0; intento < 3; intento++) {
      const res = await supabase
        .from('profiles')
        .select('name, username, fecha_nacimiento, sexo, altura, peso, avatar_url, avatar_seed, onboarding_completed, medidor_esfuerzo')
        .eq('id', current.id)
        .maybeSingle();
      if (res.data) {
        data = res.data;
        break;
      }
      await new Promise((r) => setTimeout(r, 400));
    }

    setProfile(
      data
        ? {
            name: data.name,
            username: data.username,
            edad: fechaNacimientoAEdad(data.fecha_nacimiento),
            sexo: data.sexo,
            altura: data.altura,
            peso: data.peso,
            avatarUrl: data.avatar_url,
            avatarSeed: data.avatar_seed,
            onboardingCompleted: data.onboarding_completed ?? false,
            medidorEsfuerzo: data.medidor_esfuerzo === 'rpe' ? 'rpe' : 'rir',
          }
        : null,
    );
    // Marcamos contra el id que efectivamente leimos, no contra el de la
    // sesion: si el usuario cambio a mitad de la lectura, el perfil viejo no
    // cuenta como cargado para el nuevo.
    setLoadedFor(current.id);
  }, []);

  // Recarga el perfil cada vez que cambia el usuario (login/logout).
  const userId = user?.id;
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoadedFor(null);
      return;
    }
    let cancelado = false;
    (async () => {
      try {
        await refresh();
      } catch {
        if (!cancelado) setProfile(null);
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

  const displayName = profile?.name?.trim() || 'Atleta';

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        displayName,
        // Con sesion pero sin fila legible lo tratamos como primer ingreso:
        // mejor mandar al setup que saltarlo por una lectura fallida.
        needsOnboarding: profile ? !profile.onboardingCompleted : true,
        refresh,
        applyAvatar,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  return useContext(ProfileContext);
}
