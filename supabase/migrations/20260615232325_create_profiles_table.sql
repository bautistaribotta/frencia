create table public.profiles (
  id uuid not null references auth.users (id) on delete cascade,
  username text unique,
  name text,
  surname text,
  avatar_url text,
  edad smallint check (edad >= 0 and edad <= 150),
  peso numeric(5,2) check (peso > 0),
  altura numeric(5,2) check (altura > 0),
  sexo text check (sexo in ('masculino', 'femenino', 'otro')),
  created_at timestamptz not null default now(),
  primary key (id)
);

comment on table public.profiles is 'Datos de perfil del usuario, ligados a auth.users';

alter table public.profiles enable row level security;

create policy "Los usuarios pueden ver su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Los usuarios pueden insertar su propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Los usuarios pueden actualizar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Los usuarios pueden borrar su propio perfil"
  on public.profiles for delete
  using (auth.uid() = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();;
