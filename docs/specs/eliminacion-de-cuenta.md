# Eliminacion de cuenta

Estado: propuesto
Fecha: 2026-09-21

No depende de ningun otro spec. Agrega una columna a `profiles`, dos RPCs y un
job programado en Postgres. No toca rutinas ni sesiones: se apoya en que todas
las tablas de `public` ya borran en cascada desde `auth.users`.

## 1. Problema

La pantalla de Configuracion tiene la fila "Eliminacion de cuenta" sin accion.
App Store exige que una app con registro permita borrar la cuenta desde
adentro. Ademas queremos un periodo de gracia: que un toque impulsivo no borre
anios de historial de entrenamiento sin vuelta atras.

## 2. Glosario

- **Solicitar eliminacion**: el usuario confirma que quiere borrar la cuenta.
  Se registra la fecha y se cierra la sesion. Nada se borra todavia.
- **Periodo de gracia**: 30 dias desde la solicitud. Durante ese lapso la
  cuenta existe pero no se puede usar: al iniciar sesion la app solo ofrece
  recuperarla o volver a salir.
- **Recuperar cuenta**: cancelar la solicitud dentro del periodo de gracia.
  La cuenta vuelve a estar como antes, con todos sus datos.
- **Purga**: borrado definitivo, ejecutado por un job diario en la base
  cuando la solicitud tiene mas de 30 dias. No es reversible.

## 3. Modelo de datos

### Actual

`profiles` no tiene ninguna marca de eliminacion. `auth.users` es el origen de
todas las cascadas:

| tabla                  | FK a                | on delete |
| ---------------------- | ------------------- | --------- |
| profiles               | auth.users          | cascade   |
| routines               | auth.users          | cascade   |
| training_days          | auth.users, routines| cascade   |
| training_day_weekdays  | training_days       | cascade   |
| training_day_exercises | training_days       | cascade   |
| workout_sessions       | auth.users          | cascade   |
| session_sets           | workout_sessions    | cascade   |

Lo unico fuera de la cascada es la foto de perfil en el bucket privado
`avatars`, en la ruta `{userId}/{aleatorio}.jpg`.

### Propuesto

```sql
alter table public.profiles
  add column deletion_requested_at timestamptz;
```

`null` = cuenta normal. Con valor = solicitud pendiente; la purga ocurre cuando
`deletion_requested_at < now() - interval '30 days'`.

No hace falta indice: el job diario recorre `profiles` una vez por dia y la
tabla tiene una fila por usuario.

## 4. Reglas de negocio

1. **Solicitar es reversible; purgar no.** Nada se borra al solicitar. La
   purga borra `auth.users` (y por cascada todo lo de `public`) y la fila del
   avatar en `storage.objects`.
2. **Durante la gracia la cuenta no se usa.** Con una solicitud pendiente el
   gate de auth manda siempre a la pantalla de recuperacion; no se llega a
   home, setup ni ninguna otra ruta. No hay "modo solo lectura".
3. **Recuperar deja todo como estaba.** Solo pone `deletion_requested_at` en
   null. No se toca ninguna otra columna ni se pierde nada.
4. **Solicitar dos veces no reinicia el plazo.** Si por alguna razon se llama
   la RPC con una solicitud ya pendiente, se conserva la fecha original.
5. **El plazo se cuenta en el servidor.** La fecha de purga que muestra la app
   es `deletion_requested_at + 30 dias` calculada del valor que viene de la
   base, nunca del reloj del telefono.
6. **La confirmacion es en dos pasos**, ambos con el modal de alerta de la app
   (`alerta()` de `src/lib/alerta.ts`, igual en iOS, Android y web), consistente
   con borrar rutina y borrar dia:
   - Paso 1 (antes de hacer nada): titulo "Eliminar cuenta", texto que explica
     el plazo de 30 dias y que despues los datos no se recuperan. Botones
     "Cancelar" y "Eliminar cuenta" (destructivo).
   - Paso 2 (despues de registrar la solicitud): titulo "Cuenta programada
     para eliminarse", texto con la fecha exacta y como recuperarla (volver a
     iniciar sesion antes de esa fecha). Un solo boton "Entendido" que cierra
     la sesion.
7. **Si la RPC falla, no se cierra la sesion** y se muestra el toast de error
   habitual ("No pudimos procesar la solicitud. Proba de nuevo.").
8. **Toda la escritura pasa por RPC.** Las politicas RLS de `profiles`
   permiten al usuario actualizar su propia fila, pero la columna se marca y
   desmarca solo via `solicitar_eliminacion_cuenta()` y
   `cancelar_eliminacion_cuenta()`, para que la regla 4 y el `now()` del
   servidor vivan en un solo lugar.
9. **Las cuentas que nunca aceptan los textos legales se purgan solas.** Sin
   aceptar no se entra a la app, asi que a los 30 dias de creada la cuenta
   solo guarda los datos del alta. `purgar_cuentas_sin_aceptacion()` (job
   diario, 03:30 UTC) borra `auth.users` de las cuentas creadas desde el
   26/09/2026 que no tienen ninguna fila en `aceptaciones_legales`. No toca
   cuentas anteriores a esa fecha (nunca tuvieron la pantalla) ni a quien
   acepto una version vieja y todavia no la vigente. No usa periodo de gracia:
   la cuenta no tiene contenido propio que recuperar.

## 5. Migracion

```sql
-- Marca de solicitud
alter table public.profiles add column deletion_requested_at timestamptz;
comment on column public.profiles.deletion_requested_at is
  'Fecha en que el usuario pidio eliminar la cuenta. null = cuenta normal. '
  'La purga corre 30 dias despues via pg_cron.';

-- RPCs: corren como el usuario logueado (security invoker), asi RLS sigue
-- aplicando y nadie puede marcar la fila de otro.
create or replace function public.solicitar_eliminacion_cuenta()
returns timestamptz language sql security invoker as $$
  update public.profiles
     set deletion_requested_at = coalesce(deletion_requested_at, now())
   where id = auth.uid()
  returning deletion_requested_at;
$$;

create or replace function public.cancelar_eliminacion_cuenta()
returns void language sql security invoker as $$
  update public.profiles
     set deletion_requested_at = null
   where id = auth.uid();
$$;

-- Purga: security definer porque borra de auth.users y storage.objects,
-- que el usuario final no puede tocar. Solo la llama pg_cron; se revoca
-- execute a los roles de la API.
create or replace function public.purgar_cuentas_eliminadas()
returns integer language plpgsql security definer set search_path = '' as $$
declare
  ids uuid[];
  borradas integer;
begin
  select array_agg(id) into ids from public.profiles
   where deletion_requested_at < now() - interval '30 days';
  if ids is null then return 0; end if;

  delete from storage.objects
   where bucket_id = 'avatars'
     and (storage.foldername(name))[1] = any(ids::text[]);

  delete from auth.users where id = any(ids);
  get diagnostics borradas = row_count;
  return borradas;
end;
$$;
revoke execute on function public.purgar_cuentas_eliminadas() from public, anon, authenticated;

-- Job diario a las 03:00 UTC.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('purgar-cuentas-eliminadas', '0 3 * * *',
  $$select public.purgar_cuentas_eliminadas()$$);
```

Limitacion conocida: borrar la fila de `storage.objects` deja el archivo
huerfano en el almacenamiento de Supabase (una fila borrada desde SQL no
dispara el borrado del objeto fisico). El bucket es privado y sin fila nadie
puede firmar una URL, asi que no es un problema de privacidad; es solo espacio
que no se recupera, del orden de decenas de KB por usuario. Si en algun momento
molesta, la purga se muda a una edge function que use la API de Storage.

## 6. Flujos de UI

### 6.1 Solicitar (Configuracion o aceptacion legal)

El flujo vive en `usePedirEliminarCuenta()` (`src/lib/pedir-eliminar-cuenta.ts`)
y se usa desde dos lugares: Configuracion y la pantalla `/legal-consent`, donde
quien no acepta los textos legales no puede llegar a Configuracion.

1. Toca "Eliminacion de cuenta" (o "Eliminar mi cuenta" en `/legal-consent`).
2. Alerta paso 1. Cancelar no hace nada.
3. Confirmar llama `solicitar_eliminacion_cuenta()`.
   - Error: toast de error, se queda en la pantalla.
   - Ok: Alerta paso 2 con la fecha (`deletion_requested_at + 30 dias`,
     formateada en espaniol, ej. "21 de octubre de 2026").
4. "Entendido" cierra la sesion. El gate del layout raiz lleva al login.

### 6.2 Iniciar sesion con solicitud pendiente

1. El usuario inicia sesion normalmente (email o proveedor).
2. `ProfileProvider` lee `deletion_requested_at` junto con el resto del
   perfil y lo expone como `deletionRequestedAt: Date | null`.
3. `useAuthRedirect`, con sesion y perfil cargado, si `deletionRequestedAt`
   no es null manda a `/account-recovery` desde cualquier ruta. Esta regla
   va antes que la de setup/home.
4. Pantalla `/account-recovery` (sin gesto de volver):
   - Titulo: "Tu cuenta se elimina el <fecha>".
   - Texto: la solicitud sigue vigente; recuperarla deja todo como estaba;
     pasada esa fecha los datos no se pueden recuperar.
   - Boton primario "Recuperar cuenta": llama `cancelar_eliminacion_cuenta()`,
     hace `refresh()` del perfil y navega a home (o setup si corresponde).
     Error: toast, se queda.
   - Boton secundario "Cerrar sesion": `signOut()`.

### 6.3 Iniciar sesion despues de la purga

El usuario ya no existe en `auth.users`. Email/password devuelve credenciales
invalidas; un proveedor OAuth crea una cuenta nueva y vacia, como un registro.
No hay nada que hacer en la app.

## 7. Fuera de alcance

- Mail de confirmacion o de recordatorio antes de la purga. No hay
  infraestructura de correo en el proyecto.
- Exportar los datos antes de borrar.
- Borrado inmediato sin periodo de gracia.
- Limpieza del objeto fisico huerfano en Storage (ver limitacion en 5).
