-- Saca el EXECUTE de anon sobre guardar_dia_entrenamiento.
--
-- El proyecto tiene privilegios por defecto que otorgan EXECUTE sobre las
-- funciones nuevas de public a anon, authenticated y service_role, asi que el
-- `revoke ... from public` de la migracion anterior no alcanzo.
--
-- La funcion ya era inofensiva para un anonimo: es security invoker, RLS deja
-- el update en cero filas y la funcion corta con excepcion antes de borrar
-- nada. Igual no tiene por que estar expuesta a quien no inicio sesion.

revoke execute on function public.guardar_dia_entrenamiento(uuid, text, smallint[], jsonb) from anon;
