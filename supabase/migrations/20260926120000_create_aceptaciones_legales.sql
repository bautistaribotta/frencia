-- Aceptacion explicita de los Terminos y Condiciones y la Politica de
-- Privacidad. Es un registro: cada aceptacion es una fila nueva con las
-- versiones aceptadas y la fecha del servidor, y nunca se edita ni se borra
-- (salvo en cascada al eliminar la cuenta). La app pide aceptar de nuevo
-- cuando la ultima fila no coincide con las versiones vigentes.

create table public.aceptaciones_legales (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  version_terminos text not null check (version_terminos <> ''),
  version_privacidad text not null check (version_privacidad <> ''),
  aceptada_el timestamptz not null default now()
);

comment on table public.aceptaciones_legales is
  'Registro de aceptaciones de los Terminos y Condiciones y la Politica de Privacidad. Solo se agrega via registrar_aceptacion_legal().';

-- La app lee la ultima aceptacion de cada usuario.
create index aceptaciones_legales_user_id_aceptada_el_idx
  on public.aceptaciones_legales (user_id, aceptada_el desc);

alter table public.aceptaciones_legales enable row level security;

create policy "aceptaciones_legales_select_propias" on public.aceptaciones_legales
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Sin politicas de insert, update ni delete: nadie escribe la tabla directo.
revoke insert, update, delete on public.aceptaciones_legales from anon, authenticated;

-- Unica forma de registrar una aceptacion. Security definer para poder
-- insertar sin politica de insert; el usuario sale de auth.uid() y la fecha
-- de now(), asi el cliente no puede aceptar por otro ni elegir la fecha.
create or replace function public.registrar_aceptacion_legal(
  p_version_terminos text,
  p_version_privacidad text
)
returns timestamptz
language sql
security definer
set search_path = ''
as $$
  insert into public.aceptaciones_legales (user_id, version_terminos, version_privacidad)
  values (auth.uid(), p_version_terminos, p_version_privacidad)
  returning aceptada_el;
$$;

revoke execute on function public.registrar_aceptacion_legal(text, text) from public, anon;
grant execute on function public.registrar_aceptacion_legal(text, text) to authenticated;
