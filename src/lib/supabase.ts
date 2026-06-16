// Cliente unico de Supabase para toda la app.
// Persiste la sesion en AsyncStorage y la refresca sola.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY en el .env',
  );
}

// En el prerender de web (Node) no existe `window`; AsyncStorage (build web)
// lo necesita. Usamos un storage en memoria para no romper el SSR.
const isServer = typeof window === 'undefined';
const memoryStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isServer ? memoryStorage : AsyncStorage,
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    // RN no tiene URL de redireccion para detectar la sesion.
    detectSessionInUrl: false,
    // OAuth por navegador: canjeamos el code manualmente (ver lib/oauth).
    flowType: 'pkce',
  },
});
