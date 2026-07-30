-- Guardado atomico de un dia de entrenamiento editado.
-- Ver docs/specs/rutinas-y-dias.md seccion 5.3
--
-- Guardar un dia es reemplazar su contenido: borrar los weekdays y ejercicios
-- viejos e insertar los nuevos. Hecho desde el cliente son cuatro llamadas
-- sueltas, y si la red se corta entre el delete y el insert el dia queda vacio.
-- Adentro de una funcion todo va en una transaccion: o entra entero o no entra
-- nada.
--
-- security invoker (el default) a proposito: las politicas RLS del usuario que
-- llama siguen aplicando, asi que la funcion no puede tocar el dia de otro.

create or replace function public.guardar_dia_entrenamiento(
  p_day_id uuid,
  p_name text,
  p_weekdays smallint[],
  p_exercises jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.training_days
    set name = p_name
    where id = p_day_id;

  -- Sin fila actualizada el dia no existe o es de otro usuario (RLS lo filtro).
  -- Cortamos antes de borrar nada.
  if not found then
    raise exception 'El dia de entrenamiento no existe o no es tuyo'
      using errcode = 'no_data_found';
  end if;

  delete from public.training_day_weekdays where training_day_id = p_day_id;

  insert into public.training_day_weekdays (training_day_id, weekday)
  select p_day_id, w
  from unnest(coalesce(p_weekdays, '{}'::smallint[])) as w;

  delete from public.training_day_exercises where training_day_id = p_day_id;

  insert into public.training_day_exercises (
    training_day_id, exercise_id, position, sets, reps,
    intensity_kind, intensity_value, rest_seconds
  )
  select
    p_day_id,
    (e->>'exercise_id')::uuid,
    (e->>'position')::smallint,
    (e->>'sets')::smallint,
    (e->>'reps')::smallint,
    e->>'intensity_kind',
    (e->>'intensity_value')::numeric,
    (e->>'rest_seconds')::smallint
  from jsonb_array_elements(coalesce(p_exercises, '[]'::jsonb)) as e;
end;
$$;

comment on function public.guardar_dia_entrenamiento is
  'Reemplaza nombre, weekdays y ejercicios de un dia en una sola transaccion.';

revoke all on function public.guardar_dia_entrenamiento(uuid, text, smallint[], jsonb) from public;
grant execute on function public.guardar_dia_entrenamiento(uuid, text, smallint[], jsonb) to authenticated;
