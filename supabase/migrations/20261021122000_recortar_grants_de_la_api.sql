-- B4 de la revision pre-produccion: recorta los privilegios de anon y
-- authenticated en public.
--
-- Los privilegios por defecto del proyecto le daban a anon y authenticated
-- todo (incluidos TRUNCATE, TRIGGER y REFERENCES) sobre cada tabla nueva, y
-- EXECUTE sobre cada funcion nueva. RLS frenaba las filas, pero TRUNCATE no
-- pasa por RLS y la seguridad no deberia depender de una sola capa.
--
-- Despues de esta migracion:
--   - anon no tiene ningun privilegio sobre tablas, secuencias ni funciones de
--     public. La app no consulta nada antes de iniciar sesion.
--   - authenticated conserva SELECT/INSERT/UPDATE/DELETE en sus tablas (RLS
--     decide que filas), solo lectura en el catalogo de ejercicios, y pierde
--     TRUNCATE, TRIGGER y REFERENCES en todo.
--   - Las funciones nuevas de public ya no se pueden ejecutar desde la API
--     salvo que la migracion que las crea haga el grant explicito a
--     authenticated (como ya hacen guardar_rutina o activar_rutina).

revoke truncate, trigger, references on all tables in schema public from authenticated;
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

-- El catalogo es de solo lectura: no hay politicas de escritura, pero tampoco
-- tiene por que haber privilegio.
revoke insert, update, delete on public.exercises, public.muscle_groups, public.exercise_muscles
  from authenticated;

-- Las funciones de trigger no necesitan EXECUTE para dispararse, y las RPCs
-- que usa la app tienen su grant explicito a authenticated.
revoke execute on all functions in schema public from public, anon;

-- Lo mismo para lo que se cree de aca en adelante. Postgres no permite sacarle
-- a PUBLIC el EXECUTE por defecto en un solo esquema: se hace a nivel global
-- para las funciones que cree el rol postgres (el que corre las migraciones).
alter default privileges for role postgres in schema public
  revoke truncate, trigger, references on tables from authenticated;
alter default privileges for role postgres in schema public
  revoke all on tables from anon;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon;
alter default privileges for role postgres
  revoke execute on functions from public;
