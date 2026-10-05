-- Primeros ejercicios de cardio del catalogo: correr al aire libre y en cinta,
-- plana y con dos inclinaciones. Registran tiempo y distancia.
-- Ver docs/specs/catalogo-de-ejercicios.md, seccion 6.
--
-- Las inclinaciones van como ejercicios separados y no como un dato de la
-- serie: cada una tiene su propio historial y su propia referencia de la vez
-- anterior. Van en porcentaje, que es lo que muestra la cinta.
--
-- Sin musculo objetivo: el filtro por grupo muscular mira solo el primario, y
-- correr no tiene que aparecer entre sentadillas y prensas. Los musculos que
-- trabaja van como asistentes y el buscador los agrupa con el filtro Cardio.

insert into public.exercises (
  slug, name, name_en, equipment,
  kind, tracks_weight, tracks_reps, tracks_duration, tracks_distance
) values
  ('correr', 'Correr', 'running', null,
    'cardio', false, false, true, true),
  ('correr-en-cinta', 'Correr en cinta', 'treadmill running', 'cinta',
    'cardio', false, false, true, true),
  ('correr-en-cinta-5', 'Correr en cinta 5%', 'incline treadmill running 5%', 'cinta',
    'cardio', false, false, true, true),
  ('correr-en-cinta-10', 'Correr en cinta 10%', 'incline treadmill running 10%', 'cinta',
    'cardio', false, false, true, true)
on conflict (slug) do nothing;

insert into public.exercise_muscles (exercise_id, muscle_group_id, is_primary)
select e.id, g.id, false
from (values
  ('correr', 'cuadriceps'),
  ('correr', 'gluteos'),
  ('correr', 'femoral'),
  ('correr', 'gemelos'),
  ('correr-en-cinta', 'cuadriceps'),
  ('correr-en-cinta', 'gluteos'),
  ('correr-en-cinta', 'femoral'),
  ('correr-en-cinta', 'gemelos'),
  -- Con pendiente el trabajo se corre hacia la cadena posterior.
  ('correr-en-cinta-5', 'gluteos'),
  ('correr-en-cinta-5', 'gemelos'),
  ('correr-en-cinta-5', 'cuadriceps'),
  ('correr-en-cinta-5', 'femoral'),
  ('correr-en-cinta-10', 'gluteos'),
  ('correr-en-cinta-10', 'gemelos'),
  ('correr-en-cinta-10', 'femoral'),
  ('correr-en-cinta-10', 'cuadriceps')
) as v (slug, grupo)
join public.exercises e on e.slug = v.slug
join public.muscle_groups g on g.slug = v.grupo
on conflict (exercise_id, muscle_group_id) do nothing;

update public.exercises e
set instructions = v.texto
from (values
  ('correr', 'Empieza con cinco minutos de trote suave para entrar en calor. Mantén el torso erguido, la mirada al frente y los hombros relajados. Apoya el pie debajo de la cadera, no por delante, y deja que los brazos acompañen el paso con los codos flexionados cerca de los 90 grados. Respira de forma rítmica y sostén un ritmo que puedas mantener durante todo el tiempo o la distancia planificados. Termina con unos minutos al paso para bajar las pulsaciones.'),
  ('correr-en-cinta', 'Sube a la cinta con los pies a los lados de la banda y engancha la llave de seguridad a la ropa. Arranca a paso de caminata y sube la velocidad de a poco hasta tu ritmo de carrera. Corre en el centro de la banda, con el torso erguido y sin sujetarte de las barras. Apoya el pie debajo de la cadera y mantén una cadencia constante. Al terminar, baja la velocidad gradualmente y camina unos minutos antes de bajarte.'),
  ('correr-en-cinta-5', 'Sube a la cinta, engancha la llave de seguridad y entra en calor unos minutos en plano. Ajusta la inclinación al 5 % y sube la velocidad hasta tu ritmo de trabajo, que va a ser algo más lento que en plano para el mismo esfuerzo. Inclina apenas el cuerpo hacia adelante desde los tobillos, acorta la zancada y empuja el suelo con la parte delantera del pie. No te sujetes de las barras. Al terminar, vuelve la cinta a plano y baja la velocidad de a poco.'),
  ('correr-en-cinta-10', 'Sube a la cinta, engancha la llave de seguridad y entra en calor unos minutos en plano. Ajusta la inclinación al 10 % y sube la velocidad hasta un ritmo que puedas sostener: con esta pendiente el esfuerzo sube mucho aunque la velocidad sea baja. Inclina el cuerpo hacia adelante desde los tobillos, acorta la zancada y trabaja con los glúteos y los gemelos en cada impulso. No te sujetes de las barras. Al terminar, vuelve la cinta a plano y baja la velocidad de a poco.')
) as v (slug, texto)
where e.slug = v.slug;
