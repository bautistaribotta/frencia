-- Activar una rutina archivada, dejandola como la unica en curso.
-- Ver docs/specs/rutinas-y-dias.md
--
-- Poner una rutina como activa son dos operaciones: archivar la que estaba en
-- curso y desarchivar la elegida. El indice unico parcial routines_una_activa
-- no admite dos activas a la vez, asi que hechas sueltas desde el cliente una
-- red que se corta en el medio puede dejar al usuario sin ninguna rutina
-- activa. Adentro de una funcion las dos van en una transaccion.
--
-- security invoker (el default) a proposito: las politicas RLS del usuario que
-- llama siguen aplicando, asi que no puede activar la rutina de otro.

create or replace function public.activar_rutina(
  p_routine_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  -- Dueno de la rutina elegida. Con security invoker la RLS filtra: si la
  -- rutina no es del usuario, el select no devuelve fila.
  select user_id into v_user_id
    from public.routines
    where id = p_routine_id;

  if not found then
    raise exception 'La rutina no existe o no es tuya'
      using errcode = 'no_data_found';
  end if;

  -- Archiva la activa actual, salvo que sea la misma que se esta activando. Va
  -- primero: el indice unico parcial no tolera dos activas ni por un instante.
  update public.routines
    set archived_at = now()
    where user_id = v_user_id
      and archived_at is null
      and id <> p_routine_id;

  -- Desarchiva la elegida. Si ya estaba activa, este update no cambia nada.
  update public.routines
    set archived_at = null
    where id = p_routine_id;
end;
$$;

comment on function public.activar_rutina is
  'Deja una rutina como la unica activa, archivando la que estaba en curso, en una sola transaccion.';

-- Los privilegios por defecto de Supabase le dan execute a anon sobre toda
-- funcion nueva en public, asi que no alcanza con revocar de public.
revoke all on function public.activar_rutina(uuid) from public;
revoke execute on function public.activar_rutina(uuid) from anon;
grant execute on function public.activar_rutina(uuid) to authenticated;
