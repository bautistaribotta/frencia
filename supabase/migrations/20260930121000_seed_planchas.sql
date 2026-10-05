-- Primeros isometricos del catalogo: plancha frontal y lateral.
-- Ver docs/specs/catalogo-de-ejercicios.md, seccion 6.
--
-- Registran tiempo y peso: el peso es opcional en cada serie (un disco sobre
-- la espalda o la cadera) y la mayoria de las veces va vacio.
--
-- La lateral es un solo ejercicio y no uno por lado: el tiempo de la serie es
-- el de un lado, y el otro se hace igual antes del descanso. Asi el objetivo
-- se lee igual que en la frontal ("3x30 s").

insert into public.exercises (
  slug, name, name_en, equipment,
  kind, tracks_weight, tracks_reps, tracks_duration, tracks_distance
) values
  ('plancha-frontal', 'Plancha frontal', 'front plank', 'peso corporal',
    'isometrico', true, false, true, false),
  ('plancha-lateral', 'Plancha lateral', 'side plank', 'peso corporal',
    'isometrico', true, false, true, false)
on conflict (slug) do nothing;

insert into public.exercise_muscles (exercise_id, muscle_group_id, is_primary)
select e.id, g.id, v.primario
from (values
  ('plancha-frontal', 'abdomen', true),
  ('plancha-frontal', 'hombros', false),
  ('plancha-frontal', 'gluteos', false),
  ('plancha-lateral', 'abdomen', true),
  ('plancha-lateral', 'hombros', false),
  ('plancha-lateral', 'gluteos', false)
) as v (slug, grupo, primario)
join public.exercises e on e.slug = v.slug
join public.muscle_groups g on g.slug = v.grupo
on conflict (exercise_id, muscle_group_id) do nothing;

update public.exercises e
set instructions = v.texto
from (values
  ('plancha-frontal', 'Apoya los antebrazos en el suelo con los codos debajo de los hombros y estira las piernas hacia atrás, con los pies juntos o apenas separados. Eleva la cadera hasta que el cuerpo forme una línea recta de la cabeza a los talones. Aprieta el abdomen y los glúteos, lleva el ombligo hacia la columna y no dejes que la cadera se hunda ni suba. Mira al suelo, un poco por delante de las manos, y respira de forma pareja. Sostén la posición el tiempo indicado. Si usas peso, pide que te apoyen el disco sobre la parte alta de la espalda, nunca sobre la zona lumbar.'),
  ('plancha-lateral', 'Acuéstate de lado y apoya el antebrazo en el suelo con el codo justo debajo del hombro. Estira las piernas y apila un pie sobre el otro, o apóyalos uno delante del otro para ganar estabilidad. Eleva la cadera hasta que el cuerpo forme una línea recta de la cabeza a los pies, sin que la cadera caiga hacia el suelo ni se vaya hacia atrás. Aprieta el abdomen y los glúteos y respira de forma pareja. Sostén el tiempo indicado y repite del otro lado antes de descansar: el tiempo de la serie es por lado. Si usas peso, apoya el disco sobre la cadera de arriba y sujétalo con la mano libre.')
) as v (slug, texto)
where e.slug = v.slug;
