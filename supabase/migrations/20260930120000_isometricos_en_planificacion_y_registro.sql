-- Planificacion y registro de isometricos (plancha).
-- Ver docs/specs/catalogo-de-ejercicios.md, seccion 6.
--
-- Un isometrico se hace en varias series con descanso, como la fuerza, pero lo
-- que se mide es el tiempo sostenido. Sus reglas:
--   Plan:  tiempo por serie obligatorio, RPE opcional (sin RIR: "repeticiones
--          en reserva" no aplica a sostener una posicion) y un peso opcional
--          para los que lo registran (una plancha con disco).
--   Serie: tiempo obligatorio; peso y RPE opcionales. Si el plan prescribe
--          peso, la sesion lo pide en cada serie, pero esa regla es de la
--          interfaz: el plan puede cambiar despues de registrada la serie y la
--          serie no guarda contra que plan se hizo.
--
-- El peso en el plan es solo de los isometricos. En fuerza el peso se elige
-- serie por serie en la sesion y la rutina no lo prescribe.

alter table public.training_day_exercises
  add column weight_kg numeric check (weight_kg is null or weight_kg > 0);

comment on column public.training_day_exercises.weight_kg is
  'Peso objetivo por serie, en kg. Solo en isometricos que registran peso; null = sin peso.';

-- Se reemplazan las dos funciones de trigger: los triggers siguen apuntando a
-- ellas y create or replace conserva los permisos revocados.

create or replace function public.validar_plan_de_ejercicio()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v public.exercises%rowtype;
begin
  select * into v from public.exercises where id = new.exercise_id;
  if not found then
    raise exception 'El ejercicio % no existe', new.exercise_id
      using errcode = 'foreign_key_violation';
  end if;

  if (new.reps is not null and not v.tracks_reps)
     or (new.duration_seconds is not null and not v.tracks_duration)
     or (new.distance_m is not null and not v.tracks_distance)
     or (new.weight_kg is not null and not (v.tracks_weight and v.kind = 'isometrico')) then
    raise exception '% no registra alguno de los datos del plan', v.name
      using errcode = 'check_violation';
  end if;

  if v.kind in ('cardio', 'isometrico') then
    if v.tracks_duration and new.duration_seconds is null then
      raise exception '% necesita tiempo', v.name
        using errcode = 'check_violation';
    end if;
    if new.intensity_kind is not null and new.intensity_kind <> 'rpe' then
      raise exception '% solo admite RPE', v.name
        using errcode = 'check_violation';
    end if;
  elsif new.intensity_kind is null then
    raise exception '% necesita intensidad', v.name
      using errcode = 'check_violation';
  end if;

  if v.kind = 'cardio'
     and (coalesce(new.sets, 1) <> 1 or new.rest_seconds is not null) then
    -- Una sola serie continua, sin descanso: ver seccion 6.5 de la spec.
    raise exception 'El cardio se planifica como una sola serie sin descanso'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create or replace function public.validar_serie_de_ejercicio()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v public.exercises%rowtype;
begin
  select * into v from public.exercises where id = new.exercise_id;
  if not found then
    raise exception 'El ejercicio % no existe', new.exercise_id
      using errcode = 'foreign_key_violation';
  end if;

  -- Nada que el ejercicio no registre. De lo que registra, todo es
  -- obligatorio salvo la distancia del cardio y el peso del isometrico.
  if (new.weight_kg is not null and not v.tracks_weight)
     or (new.weight_kg is null and v.tracks_weight and v.kind <> 'isometrico')
     or (new.reps is null) = v.tracks_reps
     or (new.duration_seconds is null) = v.tracks_duration
     or (new.distance_m is not null and not v.tracks_distance)
     or (new.distance_m is null and v.tracks_distance and v.kind <> 'cardio') then
    raise exception 'La serie no coincide con los datos que registra %', v.name
      using errcode = 'check_violation';
  end if;

  if v.kind in ('cardio', 'isometrico') then
    if new.intensity_kind is not null and new.intensity_kind <> 'rpe' then
      raise exception '% solo admite RPE', v.name
        using errcode = 'check_violation';
    end if;
  elsif new.intensity_kind is null then
    raise exception '% necesita intensidad', v.name
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

-- Guardado del dia -----------------------------------------------------------

-- Misma funcion que en 20260929120000_cardio_en_planificacion_y_registro, con
-- el peso del plan. create or replace conserva los permisos que ya tenia.
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
    duration_seconds, distance_m, weight_kg,
    intensity_kind, intensity_value, rest_seconds
  )
  select
    p_day_id,
    (e->>'exercise_id')::uuid,
    (e->>'position')::smallint,
    (e->>'sets')::smallint,
    (e->>'reps')::smallint,
    (e->>'duration_seconds')::integer,
    (e->>'distance_m')::integer,
    (e->>'weight_kg')::numeric,
    e->>'intensity_kind',
    (e->>'intensity_value')::numeric,
    (e->>'rest_seconds')::smallint
  from jsonb_array_elements(coalesce(p_exercises, '[]'::jsonb)) as e;
end;
$$;
