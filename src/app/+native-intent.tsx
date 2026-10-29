/* Frencia · Links que entran a la app desde el sistema.
   La vuelta del login con Google (frencia://oauth-callback?code=... o, en
   Expo Go, exp://.../--/oauth-callback) no es una pantalla: la lee
   signInWithProvider (lib/oauth) para canjear el code. En Android el sistema
   tambien se la pasa al router, que sin esto mostraria "ruta no encontrada"
   encima del login. Con la app abierta se ignora; si la app arranco por ese
   link (el sistema la cerro mientras estaba el navegador), va al inicio y el
   gate decide. */

export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }): string | null {
  try {
    if (!path.includes('oauth-callback')) return path;
    return initial ? '/' : null;
  } catch {
    return initial ? '/' : null;
  }
}
