-- El tema pasa a tener tres opciones: seguir al sistema (default), oscuro o claro.
alter table public.profiles drop constraint if exists profiles_tema_check;
alter table public.profiles
  add constraint profiles_tema_check check (tema in ('sistema', 'oscuro', 'claro'));
alter table public.profiles alter column tema set default 'sistema';

comment on column public.profiles.tema is 'Tema de la interfaz preferido: sistema, oscuro o claro.';;
