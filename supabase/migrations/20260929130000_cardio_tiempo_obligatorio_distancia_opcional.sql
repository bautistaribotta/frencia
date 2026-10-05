-- En cardio el tiempo es obligatorio y la distancia, como el RPE, opcional.
-- Ver docs/specs/catalogo-de-ejercicios.md, seccion 6.3.
--
-- La regla anterior (20260929120000_cardio_en_planificacion_y_registro) pedia
-- tiempo o distancia en el plan y los dos en cada serie. Correr al aire libre
-- sin reloj con GPS deja la distancia sin saber, y eso no puede impedir
-- registrar la corrida; el tiempo, en cambio, siempre se sabe.
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
     or (new.distance_m is not null and not v.tracks_distance) then
    raise exception '% no registra alguno de los datos del plan', v.name
      using errcode = 'check_violation';
  end if;

  if v.kind = 'cardio' then
    -- Una sola serie continua, sin descanso: ver seccion 6.5 de la spec.
    if coalesce(new.sets, 1) <> 1 or new.rest_seconds is not null then
      raise exception 'El cardio se planifica como una sola serie sin descanso'
        using errcode = 'check_violation';
    end if;
    if v.tracks_duration and new.duration_seconds is null then
      raise exception 'El cardio necesita tiempo'
        using errcode = 'check_violation';
    end if;
    if new.intensity_kind is not null and new.intensity_kind <> 'rpe' then
      raise exception 'El cardio solo admite RPE'
        using errcode = 'check_violation';
    end if;
  elsif new.intensity_kind is null then
    raise exception '% necesita intensidad', v.name
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
  -- obligatorio salvo la distancia del cardio.
  if (new.weight_kg is null) = v.tracks_weight
     or (new.reps is null) = v.tracks_reps
     or (new.duration_seconds is null) = v.tracks_duration
     or (new.distance_m is not null and not v.tracks_distance)
     or (new.distance_m is null and v.tracks_distance and v.kind <> 'cardio') then
    raise exception 'La serie no coincide con los datos que registra %', v.name
      using errcode = 'check_violation';
  end if;

  if v.kind = 'cardio' then
    if new.intensity_kind is not null and new.intensity_kind <> 'rpe' then
      raise exception 'El cardio solo admite RPE'
        using errcode = 'check_violation';
    end if;
  elsif new.intensity_kind is null then
    raise exception '% necesita intensidad', v.name
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;
