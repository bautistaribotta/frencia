-- B6 de la revision pre-produccion: indice para la FK session_sets.exercise_id.
-- Lo pide el advisor de rendimiento (unindexed_foreign_keys). Las consultas de
-- series de referencia filtran por ejercicio, y sin indice cada borrado o
-- cambio en exercises recorre session_sets entera para validar la FK.

create index if not exists session_sets_exercise_id_idx on public.session_sets (exercise_id);
