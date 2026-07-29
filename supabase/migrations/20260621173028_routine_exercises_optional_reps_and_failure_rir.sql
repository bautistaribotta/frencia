-- El wizard de rutina pide solo series + medidor de esfuerzo (sin reps por
-- ahora): reps pasa a ser opcional.
alter table public.routine_exercises
  alter column reps drop not null;

-- RIR admite "Fallo" como paso extra por debajo de 0 RIR. Lo guardamos como
-- -1 (centinela) para distinguirlo de 0 RIR; por eso relajamos el minimo.
alter table public.routine_exercises
  drop constraint routine_day_exercises_intensity_value_check;

alter table public.routine_exercises
  add constraint routine_day_exercises_intensity_value_check
  check (intensity_value >= -1::numeric);;
