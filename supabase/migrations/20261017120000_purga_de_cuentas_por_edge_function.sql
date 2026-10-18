-- Purga de cuentas por Edge Function. Ver docs/specs/eliminacion-de-cuenta.md,
-- seccion 5.
--
-- Reemplaza purgar_cuentas_eliminadas() y purgar_cuentas_sin_aceptacion().
-- La primera nunca llego a borrar nada: hacia `delete from storage.objects`, y
-- Supabase bloquea el borrado directo de esa tabla con el trigger
-- storage.protect_delete(). Como es un trigger por sentencia, saltaba aunque
-- el usuario no tuviera avatar y deshacia tambien el delete de auth.users.
-- Ademas, aun pudiendo, borrar la fila deja el archivo fisico en el
-- almacenamiento. La foto solo se borra de verdad por la API de Storage, y
-- esa API no se puede llamar desde SQL: la purga pasa a la Edge Function
-- purgar-cuentas, que pg_cron invoca una vez por dia via pg_net.
--
-- Antes de que el job funcione hay que cargar en Vault dos secretos (ver
-- seccion 5 del spec): project_url y purga_cron_secret. Sin ellos el job falla
-- y queda registrado en cron.job_run_details; no borra nada.

create extension if not exists pg_net with schema extensions;

-- Unica fuente de la regla de purga. Devuelve el motivo por el que la cuenta
-- se tiene que purgar hoy, o null si no corresponde. La Edge Function la usa
-- dos veces: para listar candidatas y para volver a preguntar justo antes de
-- borrar cada una, por si el usuario recupero la cuenta en el medio.
--   'eliminada': pidio eliminar la cuenta hace mas de 30 dias.
--   'sin_aceptacion': creada desde el 26/09/2026, con mas de 30 dias, y nunca
--   acepto ninguna version de los textos legales. Las cuentas anteriores a
--   esa fecha no tuvieron la pantalla de aceptacion y no se tocan.
create or replace function public.motivo_de_purga(p_user_id uuid)
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when p.deletion_requested_at < now() - interval '30 days' then 'eliminada'
    when p.created_at >= timestamptz '2026-09-26 00:00:00-03'
     and p.created_at < now() - interval '30 days'
     and not exists (
       select 1 from public.aceptaciones_legales a where a.user_id = p.id
     )
      then 'sin_aceptacion'
  end
  from public.profiles p
  where p.id = p_user_id;
$$;

-- Candidatas a purgar, las mas viejas primero. El limite acota cada corrida
-- al tiempo maximo de una Edge Function; lo que no entra sale al dia
-- siguiente.
create or replace function public.cuentas_a_purgar(p_limite integer default 100)
returns table (user_id uuid, motivo text)
language sql
stable
security invoker
set search_path = ''
as $$
  select c.id, c.motivo
  from (
    select p.id, p.created_at, public.motivo_de_purga(p.id) as motivo
    from public.profiles p
  ) c
  where c.motivo is not null
  order by c.created_at
  limit p_limite;
$$;

-- Solo las llama la Edge Function con la clave secreta. Ningun rol de la API
-- publica las puede ejecutar.
revoke execute on function public.motivo_de_purga(uuid) from public, anon, authenticated;
revoke execute on function public.cuentas_a_purgar(integer) from public, anon, authenticated;
grant execute on function public.motivo_de_purga(uuid) to service_role;
grant execute on function public.cuentas_a_purgar(integer) to service_role;

-- Fuera los jobs y las funciones viejas.
select cron.unschedule(jobname)
from cron.job
where jobname in ('purgar-cuentas-eliminadas', 'purgar-cuentas-sin-aceptacion');

drop function if exists public.purgar_cuentas_eliminadas();
drop function if exists public.purgar_cuentas_sin_aceptacion();

-- Job diario a las 03:00 UTC. pg_net es asincronico: el job figura como
-- exitoso apenas encola el pedido. El resultado real de la purga queda en
-- net._http_response (6 horas) y en los logs de la Edge Function.
select cron.schedule(
  'purgar-cuentas',
  '0 3 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/purgar-cuentas',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-purga-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'purga_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $$
);
