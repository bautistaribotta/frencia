-- Guardado atomico de una rutina entera: alta o edicion, con sus dias, los
-- dias de la semana de cada uno y sus ejercicios.
--
-- Lo usa el constructor de rutinas de la web, que arma toda la rutina en un
-- borrador y la guarda de una vez. Con las RPCs que ya existian eran varias
-- llamadas (guardar_rutina para los dias y guardar_dia_entrenamiento por cada
-- uno), y una red que se corta en el medio deja la rutina a medio guardar. La
-- app movil crea rutinas con inserts sueltos (issue 18); puede pasarse a esta
-- funcion mas adelante.
--
-- security invoker (el default) a proposito: las politicas RLS del usuario que
-- llama siguen aplicando, asi que no puede tocar la rutina de otro. Los
-- triggers de training_day_exercises validan cada ejercicio contra lo que
-- registra, igual que en guardar_dia_entrenamiento.
--
-- p_routine_id null = rutina nueva. Con p_activar archiva antes la que estaba
-- en curso y la nueva queda activa; sin p_activar nace archivada. Editando,
-- p_activar se ignora: para eso esta activar_rutina.
--
-- p_dias es el orden final completo. Cada elemento:
--   {
--     "id": uuid | null,           -- null = dia nuevo
--     "name": text,
--     "weekdays": [smallint],      -- 0 = lunes ... 6 = domingo
--     "exercises": [ { exercise_id, sets, reps, duration_seconds, distance_m,
--                      weight_kg, intensity_kind, intensity_value,
--                      rest_seconds } ]
--   }
-- La posicion de cada dia y de cada ejercicio es su indice en el arreglo.
-- Los dias que no esten se borran, con sus weekdays y ejercicios (cascada); el
-- contenido de los que quedan se reemplaza entero.
--
-- Devuelve el id de la rutina (el nuevo, si se creo).

create or replace function public.guardar_rutina_completa(
  p_routine_id uuid,
  p_name text,
  p_dias jsonb,
  p_activar boolean default false
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_routine_id uuid := p_routine_id;
  v_dias jsonb := coalesce(p_dias, '[]'::jsonb);
  v_conservados uuid[];
  v_dia record;
  v_day_id uuid;
begin
  if v_user_id is null then
    raise exception 'Hace falta una sesion'
      using errcode = 'insufficient_privilege';
  end if;

  if jsonb_array_length(v_dias) = 0 then
    raise exception 'La rutina necesita al menos un dia'
      using errcode = 'check_violation';
  end if;

  if v_routine_id is null then
    -- Rutina nueva. Si queda activa, la anterior se archiva primero: el indice
    -- unico parcial no tolera dos activas ni por un instante.
    if p_activar then
      update public.routines
        set archived_at = now()
        where user_id = v_user_id
          and archived_at is null;
    end if;

    insert into public.routines (user_id, name, archived_at)
      values (v_user_id, p_name, case when p_activar then null else now() end)
      returning id into v_routine_id;
  else
    update public.routines
      set name = p_name
      where id = v_routine_id;

    -- Sin fila actualizada la rutina no existe o es de otro usuario (RLS la
    -- filtro). Cortamos antes de borrar ningun dia.
    if not found then
      raise exception 'La rutina no existe o no es tuya'
        using errcode = 'no_data_found';
    end if;

    select coalesce(array_agg((d->>'id')::uuid), '{}'::uuid[])
      into v_conservados
      from jsonb_array_elements(v_dias) as d
      where d->>'id' is not null;

    delete from public.training_days
      where routine_id = v_routine_id
        and not (id = any(v_conservados));
  end if;

  for v_dia in
    select x.valor, (x.orden - 1)::smallint as position
    from jsonb_array_elements(v_dias) with ordinality as x(valor, orden)
  loop
    v_day_id := (v_dia.valor->>'id')::uuid;

    if v_day_id is null then
      insert into public.training_days (routine_id, user_id, name, position)
        values (v_routine_id, v_user_id, v_dia.valor->>'name', v_dia.position)
        returning id into v_day_id;
    else
      update public.training_days
        set name = v_dia.valor->>'name',
            position = v_dia.position
        where id = v_day_id
          and routine_id = v_routine_id;

      if not found then
        raise exception 'El dia % no es de esta rutina', v_day_id
          using errcode = 'no_data_found';
      end if;

      delete from public.training_day_weekdays where training_day_id = v_day_id;
      delete from public.training_day_exercises where training_day_id = v_day_id;
    end if;

    insert into public.training_day_weekdays (training_day_id, weekday)
    select distinct v_day_id, w::smallint
    from jsonb_array_elements_text(coalesce(v_dia.valor->'weekdays', '[]'::jsonb)) as w;

    insert into public.training_day_exercises (
      training_day_id, exercise_id, position, sets, reps,
      duration_seconds, distance_m, weight_kg,
      intensity_kind, intensity_value, rest_seconds
    )
    select
      v_day_id,
      (e.valor->>'exercise_id')::uuid,
      (e.orden - 1)::smallint,
      (e.valor->>'sets')::smallint,
      (e.valor->>'reps')::smallint,
      (e.valor->>'duration_seconds')::integer,
      (e.valor->>'distance_m')::integer,
      (e.valor->>'weight_kg')::numeric,
      e.valor->>'intensity_kind',
      (e.valor->>'intensity_value')::numeric,
      (e.valor->>'rest_seconds')::smallint
    from jsonb_array_elements(coalesce(v_dia.valor->'exercises', '[]'::jsonb))
      with ordinality as e(valor, orden);
  end loop;

  return v_routine_id;
end;
$$;

comment on function public.guardar_rutina_completa is
  'Crea o reemplaza una rutina con sus dias, weekdays y ejercicios en una sola transaccion. Devuelve su id.';

revoke all on function public.guardar_rutina_completa(uuid, text, jsonb, boolean) from public;
revoke execute on function public.guardar_rutina_completa(uuid, text, jsonb, boolean) from anon;
grant execute on function public.guardar_rutina_completa(uuid, text, jsonb, boolean) to authenticated;
