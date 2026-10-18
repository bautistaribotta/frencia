/* Frencia · Purga diaria de cuentas.
   Ver docs/specs/eliminacion-de-cuenta.md, seccion 5.

   La invoca pg_cron una vez por dia (job `purgar-cuentas`). Para cada cuenta
   que public.motivo_de_purga() marca como vencida:
     1. vuelve a preguntar si sigue vencida (pudo recuperarla en el medio),
     2. borra los archivos de su carpeta en el bucket avatars por la API de
        Storage, que es la unica forma de borrar tambien el archivo fisico,
     3. borra el usuario de auth.users; todo lo de public cascadea desde ahi.
   Si un paso falla, la cuenta se saltea entera y se reintenta al dia
   siguiente: nunca se borra el usuario dejando la foto atras.

   No usa verify_jwt: las claves nuevas (sb_secret_...) no son JWT. La llamada
   se autoriza con un token propio de la purga (secreto PURGA_CRON_SECRET),
   que pg_cron lee de Vault y manda en el header x-purga-secret. */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2.108.2';

const BUCKET_AVATARES = 'avatars';
// Tope de archivos por pedido de listado en Storage.
const PAGINA_STORAGE = 100;

type Motivo = 'eliminada' | 'sin_aceptacion';

interface Candidata {
  user_id: string;
  motivo: Motivo;
}

interface Fallo {
  userId: string;
  motivo: Motivo;
  error: string;
}

/** Clave secreta para el cliente admin. Prefiere la clave nueva y cae a la
 *  legacy mientras siga activa. */
function claveSecreta(): string {
  const nuevas = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (nuevas) {
    const clave = (JSON.parse(nuevas) as Record<string, string>)['default'];
    if (clave) return clave;
  }
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacy) return legacy;
  throw new Error('No hay clave secreta disponible para el cliente admin.');
}

/** Compara dos textos sin cortar en la primera diferencia, para no filtrar por
 *  tiempo de respuesta cuanto del token coincide. */
function igualesEnTiempoConstante(a: string, b: string): boolean {
  const ba = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  let diferencia = ba.length ^ bb.length;
  const largo = Math.max(ba.length, bb.length);
  for (let i = 0; i < largo; i++) {
    diferencia |= (ba[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diferencia === 0;
}

function autorizada(req: Request): boolean {
  const esperado = Deno.env.get('PURGA_CRON_SECRET');
  // Sin secreto configurado no se acepta ninguna llamada.
  if (!esperado) return false;
  const recibido = req.headers.get('x-purga-secret') ?? '';
  return igualesEnTiempoConstante(recibido, esperado);
}

/** Borra todo lo que haya en avatars/{userId}/. Lista de a paginas y borra
 *  cada pagina, hasta que la carpeta quede vacia. */
async function borrarAvatares(admin: SupabaseClient, userId: string): Promise<void> {
  for (;;) {
    const { data, error } = await admin.storage
      .from(BUCKET_AVATARES)
      .list(userId, { limit: PAGINA_STORAGE });
    if (error) throw new Error(`listar avatares: ${error.message}`);
    if (!data || data.length === 0) return;

    const rutas = data.map((archivo) => `${userId}/${archivo.name}`);
    const { error: errorBorrado } = await admin.storage.from(BUCKET_AVATARES).remove(rutas);
    if (errorBorrado) throw new Error(`borrar avatares: ${errorBorrado.message}`);
    // Como se borra lo listado, la siguiente vuelta vuelve a pedir desde el
    // principio. Si vino una pagina incompleta ya no queda nada.
    if (data.length < PAGINA_STORAGE) return;
  }
}

/** Punto de extension para revocar el token de Sign in with Apple (hallazgo
 *  A5 de la revision). Apple exige revocarlo al eliminar la cuenta, pero hace
 *  falta el refresh token de Apple, que Supabase no guarda: hay que capturarlo
 *  en el login y persistirlo antes de poder implementar esto. Mientras tanto
 *  solo deja constancia en el log y no frena la purga. */
async function revocarTokenApple(usuario: User): Promise<void> {
  const tieneApple = usuario.identities?.some((identidad) => identidad.provider === 'apple') ?? false;
  if (!tieneApple) return;
  console.warn(`[purga] ${usuario.id}: identidad Apple sin revocar (pendiente A5).`);
}

async function purgarCuenta(admin: SupabaseClient, candidata: Candidata): Promise<'purgada' | 'salteada'> {
  const userId = candidata.user_id;

  // Entre el listado y este momento el usuario pudo recuperar la cuenta.
  const { data: motivo, error: errorMotivo } = await admin.rpc('motivo_de_purga', {
    p_user_id: userId,
  });
  if (errorMotivo) throw new Error(`verificar motivo: ${errorMotivo.message}`);
  if (motivo === null) return 'salteada';

  const { data: usuario, error: errorUsuario } = await admin.auth.admin.getUserById(userId);
  if (errorUsuario) throw new Error(`leer usuario: ${errorUsuario.message}`);

  await borrarAvatares(admin, userId);
  await revocarTokenApple(usuario.user);

  // Borrado definitivo (no soft delete): la cascada de auth.users se lleva
  // profiles, rutinas, dias, sesiones, series y aceptaciones legales.
  const { error: errorBorrado } = await admin.auth.admin.deleteUser(userId, false);
  if (errorBorrado) throw new Error(`borrar usuario: ${errorBorrado.message}`);
  return 'purgada';
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Metodo no permitido.' }, { status: 405 });
  }
  if (!autorizada(req)) {
    return Response.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, claveSecreta(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.rpc('cuentas_a_purgar');
  if (error) {
    console.error('[purga] no se pudieron listar las candidatas:', error.message);
    return Response.json({ error: 'No se pudieron listar las candidatas.' }, { status: 500 });
  }

  const candidatas = (data ?? []) as Candidata[];
  let purgadas = 0;
  let salteadas = 0;
  const fallos: Fallo[] = [];

  // De a una: son pocas por dia y asi un fallo no arrastra a las demas.
  for (const candidata of candidatas) {
    try {
      const resultado = await purgarCuenta(admin, candidata);
      if (resultado === 'purgada') purgadas += 1;
      else salteadas += 1;
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : String(e);
      console.error(`[purga] ${candidata.user_id} (${candidata.motivo}): ${mensaje}`);
      fallos.push({ userId: candidata.user_id, motivo: candidata.motivo, error: mensaje });
    }
  }

  console.log(`[purga] candidatas=${candidatas.length} purgadas=${purgadas} salteadas=${salteadas} fallos=${fallos.length}`);

  // Con algun fallo responde 500, asi la corrida aparece en las consultas de
  // net._http_response por status >= 400.
  return Response.json(
    { candidatas: candidatas.length, purgadas, salteadas, fallos },
    { status: fallos.length > 0 ? 500 : 200 },
  );
});
