-- Endurece profiles: B1, B2 y B5 de la revision pre-produccion.
--
-- B1: la politica de UPDATE dejaba editar cualquier columna de la fila propia,
-- incluida deletion_requested_at. Con un PATCH a la API un usuario podia
-- ponerse una fecha de hace 31 dias y saltearse el periodo de gracia. Ahora
-- authenticated solo puede escribir las columnas que la app edita, y la
-- solicitud de eliminacion se toca unicamente por las RPCs, que pasan a ser
-- security definer.
--
-- B2: la politica de DELETE dejaba borrar la fila propia de profiles. La purga
-- (motivo_de_purga y cuentas_a_purgar, que usa la Edge Function
-- purgar-cuentas) parte de esa tabla: una cuenta sin perfil nunca aparece como
-- candidata y su auth.users queda para siempre. La app nunca borra el perfil
-- (lo hace la cascada desde auth.users cuando purga), asi que se saca la
-- politica y el privilegio. La purga corre con service_role y no se ve
-- afectada.
--
-- B5: las politicas usaban auth.uid() sin (select ...), que Postgres reevalua
-- por fila. Se recrean con el patron del resto de las tablas y solo para
-- authenticated: anon no tiene nada que hacer en profiles.

drop policy if exists "Los usuarios pueden ver su propio perfil" on public.profiles;
drop policy if exists "Los usuarios pueden insertar su propio perfil" on public.profiles;
drop policy if exists "Los usuarios pueden actualizar su propio perfil" on public.profiles;
drop policy if exists "Los usuarios pueden borrar su propio perfil" on public.profiles;

create policy profiles_select_propio on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_insert_propio on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy profiles_update_propio on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Privilegios por columna. Quedan afuera created_at y deletion_requested_at.
-- id entra en el UPDATE porque el upsert del setup (perfil.ts, guardarSetup)
-- lo manda en el SET del ON CONFLICT; la politica impide cambiarlo por otro.
-- Una columna nueva que la app tenga que escribir hay que sumarla aca.
revoke insert, update, delete on public.profiles from anon, authenticated;

grant insert (
  id, username, name, surname, avatar_path, avatar_seed, peso, altura, sexo,
  fecha_nacimiento, medidor_esfuerzo, unidad_peso, unidad_altura,
  unidad_distancia, tema, onboarding_completed
) on public.profiles to authenticated;

grant update (
  id, username, name, surname, avatar_path, avatar_seed, peso, altura, sexo,
  fecha_nacimiento, medidor_esfuerzo, unidad_peso, unidad_altura,
  unidad_distancia, tema, onboarding_completed
) on public.profiles to authenticated;

-- Las RPCs de eliminacion ya no pueden escribir la columna como el usuario:
-- pasan a security definer. Siguen tocando solo la fila de quien llama.
-- Solicitar dos veces conserva la fecha original.
create or replace function public.solicitar_eliminacion_cuenta()
returns timestamptz
language sql
security definer
set search_path = ''
as $$
  update public.profiles
     set deletion_requested_at = coalesce(deletion_requested_at, now())
   where id = (select auth.uid())
  returning deletion_requested_at;
$$;

create or replace function public.cancelar_eliminacion_cuenta()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
     set deletion_requested_at = null
   where id = (select auth.uid());
$$;

revoke execute on function public.solicitar_eliminacion_cuenta() from public, anon;
revoke execute on function public.cancelar_eliminacion_cuenta() from public, anon;
grant execute on function public.solicitar_eliminacion_cuenta() to authenticated;
grant execute on function public.cancelar_eliminacion_cuenta() to authenticated;
