-- Cierra el bucket de avatares.
--
-- Estaba en public=true y con una policy de select para el rol `public` sobre
-- todo el bucket. Eso no solo servia las fotos sin autenticacion: tambien
-- habilitaba el endpoint de listado, con lo que cualquiera podia recorrer las
-- carpetas y sacar el uuid de todos los usuarios registrados, mas la foto de
-- cada uno.
--
-- Ahora el bucket es privado y la lectura se hace con URLs firmadas que
-- caducan. Como el archivo deja de tener una URL fija, el nombre pasa a ser
-- aleatorio y la columna del perfil guarda la ruta en vez de la URL.

update storage.buckets set public = false where id = 'avatars';

drop policy if exists "avatars_read_all" on storage.objects;

-- El dueno conserva select sobre su propia carpeta: sin eso, upsert y remove
-- no pueden resolver el objeto.
create policy "avatars_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

alter table public.profiles rename column avatar_url to avatar_path;

-- Lo guardado eran URLs publicas de un archivo de nombre fijo, asi que la ruta
-- equivalente se reconstruye desde el id. Las fotos que ya existen siguen
-- funcionando; la proxima subida les pone nombre aleatorio.
update public.profiles
  set avatar_path = id::text || '/avatar.jpg'
  where avatar_path is not null;

comment on column public.profiles.avatar_path is
  'Ruta del avatar dentro del bucket avatars. El bucket es privado: se firma al leer.';
comment on column public.profiles.avatar_seed is
  'Semilla del avatar generado (boring-avatars). Si hay avatar_path, la foto tiene prioridad.';
