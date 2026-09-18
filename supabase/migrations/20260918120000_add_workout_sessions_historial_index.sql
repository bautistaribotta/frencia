-- Historial: sesiones terminadas de un usuario, de la mas reciente a la mas
-- vieja y paginadas. El indice parcial existente solo cubre la sesion en curso
-- y el de training_day_id no sirve para ordenar por usuario.
create index workout_sessions_historial_idx
  on public.workout_sessions (user_id, finished_at desc)
  where finished_at is not null;
