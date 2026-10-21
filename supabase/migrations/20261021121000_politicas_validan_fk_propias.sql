-- B3 de la revision pre-produccion: las politicas de escritura validan que la
-- FK apunte a algo propio.
--
-- training_days solo pedia user_id = auth.uid(), asi que alguien podia colgar
-- un dia suyo de la rutina de otro usuario (o mover uno existente) si conocia
-- el UUID de esa rutina. Lo mismo con workout_sessions.training_day_id. El
-- dueño de la rutina no veria el dia ajeno (las lecturas filtran por user_id),
-- pero la fila quedaria colgada de algo que no le pertenece al que la escribio.
--
-- Las RPCs guardar_rutina, guardar_dia_entrenamiento y activar_rutina son
-- security invoker y siempre escriben sobre rutinas y dias propios, asi que
-- siguen funcionando igual.

drop policy if exists training_days_insert_propios on public.training_days;
drop policy if exists training_days_update_propios on public.training_days;

create policy training_days_insert_propios on public.training_days
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.routines r
      where r.id = training_days.routine_id
        and r.user_id = (select auth.uid())
    )
  );

create policy training_days_update_propios on public.training_days
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.routines r
      where r.id = training_days.routine_id
        and r.user_id = (select auth.uid())
    )
  );

-- training_day_id es opcional: queda en null cuando se borra el dia (on delete
-- set null), y esa escritura la hace la FK, no pasa por estas politicas.
drop policy if exists workout_sessions_insert_propias on public.workout_sessions;
drop policy if exists workout_sessions_update_propias on public.workout_sessions;

create policy workout_sessions_insert_propias on public.workout_sessions
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      training_day_id is null
      or exists (
        select 1 from public.training_days d
        where d.id = workout_sessions.training_day_id
          and d.user_id = (select auth.uid())
      )
    )
  );

create policy workout_sessions_update_propias on public.workout_sessions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      training_day_id is null
      or exists (
        select 1 from public.training_days d
        where d.id = workout_sessions.training_day_id
          and d.user_id = (select auth.uid())
      )
    )
  );
