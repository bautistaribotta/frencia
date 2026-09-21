-- Eliminacion de cuenta con 30 dias de gracia. Ver docs/specs/eliminacion-de-cuenta.md

alter table public.profiles add column deletion_requested_at timestamptz;
comment on column public.profiles.deletion_requested_at is
  'Fecha en que el usuario pidio eliminar la cuenta. null = cuenta normal. La purga corre 30 dias despues via pg_cron.';

-- RPCs: corren como el usuario logueado (security invoker), asi RLS sigue
-- aplicando y nadie puede marcar la fila de otro. Solicitar dos veces conserva
-- la fecha original.
create or replace function public.solicitar_eliminacion_cuenta()
returns timestamptz
language sql
security invoker
set search_path = ''
as $$
  update public.profiles
     set deletion_requested_at = coalesce(deletion_requested_at, now())
   where id = auth.uid()
  returning deletion_requested_at;
$$;

create or replace function public.cancelar_eliminacion_cuenta()
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.profiles
     set deletion_requested_at = null
   where id = auth.uid();
$$;

-- Purga definitiva: security definer porque borra de auth.users y de
-- storage.objects, que el usuario final no puede tocar. Solo la llama pg_cron.
create or replace function public.purgar_cuentas_eliminadas()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  ids uuid[];
  borradas integer;
begin
  select array_agg(id) into ids
    from public.profiles
   where deletion_requested_at < now() - interval '30 days';

  if ids is null then
    return 0;
  end if;

  -- El avatar vive en avatars/{userId}/... y no cascadea desde auth.users.
  delete from storage.objects
   where bucket_id = 'avatars'
     and (storage.foldername(name))[1] = any(ids::text[]);

  -- Todo lo de public cascadea desde aca.
  delete from auth.users where id = any(ids);
  get diagnostics borradas = row_count;
  return borradas;
end;
$$;

revoke execute on function public.purgar_cuentas_eliminadas() from public, anon, authenticated;

-- Job diario a las 03:00 UTC.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule(
  'purgar-cuentas-eliminadas',
  '0 3 * * *',
  $$select public.purgar_cuentas_eliminadas()$$
);;
