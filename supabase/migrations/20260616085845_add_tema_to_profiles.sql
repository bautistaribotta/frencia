alter table public.profiles
  add column if not exists tema text not null default 'oscuro'
  check (tema in ('oscuro', 'claro'));

comment on column public.profiles.tema is 'Tema de la interfaz preferido: oscuro o claro.';;
