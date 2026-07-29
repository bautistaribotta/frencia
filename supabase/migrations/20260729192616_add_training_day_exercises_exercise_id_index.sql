-- La FK a exercises no tenia indice propio: el indice compuesto arranca por
-- training_day_id, asi que no cubre las consultas ni los borrados por ejercicio.
create index training_day_exercises_exercise_id_idx
  on public.training_day_exercises (exercise_id);;
