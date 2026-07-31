-- Guardado atomico de una rutina editada.
-- Ver docs/specs/rutinas-y-dias.md seccion 5.6
--
-- Guardar una rutina son cuatro operaciones: renombrarla, borrar los dias que
-- el usuario saco, reacomodar los que quedaron e insertar los nuevos. Borrar un
-- dia se lleva sus weekdays y sus ejercicios por cascada, asi que hechas
-- sueltas desde el cliente una red que se corta en el medio deja la rutina a
-- medio guardar, con dias ya destruidos. Adentro de una funcion va todo en una
-- transaccion.
--
-- security invoker (el default) a proposito: las politicas RLS del usuario que
-- llama siguen aplicando, asi que la funcion no puede tocar la rutina de otro.
--
-- p_dias es el orden final completo. Cada elemento:
--   { "id": uuid | null, "name": text }
-- id null = dia nuevo, entra vacio. La posicion es el indice en el arreglo.

create or replace function public.guardar_rutina(
  p_routine_id uuid,
  p_name text,
  p_dias jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_conservados uuid[];
begin
  update public.routines
    set name = p_name
    where id = p_routine_id
    returning user_id into v_user_id;

  -- Sin fila actualizada la rutina no existe o es de otro usuario (RLS la
  -- filtro). Cortamos antes de borrar ningun dia.
  if not found then
    raise exception 'La rutina no existe o no es tuya'
      using errcode = 'no_data_found';
  end if;

  -- Los dias que siguen en la lista. Los que no estan se van, y con ellos sus
  -- weekdays y ejercicios.
  select coalesce(array_agg((d->>'id')::uuid), '{}'::uuid[])
    into v_conservados
    from jsonb_array_elements(coalesce(p_dias, '[]'::jsonb)) as d
    where d->>'id' is not null;

  delete from public.training_days
    where routine_id = p_routine_id
      and not (id = any(v_conservados));

  -- Los que quedaron: nombre y orden nuevos.
  update public.training_days t
    set name = d.name,
        position = d.position
    from (
      select
        (x.valor->>'id')::uuid as id,
        x.valor->>'name' as name,
        (x.orden - 1)::smallint as position
      from jsonb_array_elements(coalesce(p_dias, '[]'::jsonb))
        with ordinality as x(valor, orden)
      where x.valor->>'id' is not null
    ) as d
    where t.id = d.id
      and t.routine_id = p_routine_id;

  -- Los nuevos entran vacios: los ejercicios se cargan desde la pantalla del
  -- dia, no desde aca.
  insert into public.training_days (routine_id, user_id, name, position)
  select
    p_routine_id,
    v_user_id,
    x.valor->>'name',
    (x.orden - 1)::smallint
  from jsonb_array_elements(coalesce(p_dias, '[]'::jsonb))
    with ordinality as x(valor, orden)
  where x.valor->>'id' is null;
end;
$$;

comment on function public.guardar_rutina is
  'Reemplaza nombre y dias de una rutina (alta, baja y orden) en una sola transaccion.';

-- Los privilegios por defecto de Supabase le dan execute a anon sobre toda
-- funcion nueva en public, asi que no alcanza con revocar de public.
revoke all on function public.guardar_rutina(uuid, text, jsonb) from public;
revoke execute on function public.guardar_rutina(uuid, text, jsonb) from anon;
grant execute on function public.guardar_rutina(uuid, text, jsonb) to authenticated;
