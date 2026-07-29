# Programas de entrenamiento y rutinas

Estado: propuesto
Fecha: 2026-07-29

## 1. Problema

Hoy el modelo es plano: una `routine` es un dia de entrenamiento suelto, colgado
directo del usuario. El home lista todas las rutinas del usuario sin ningun
agrupamiento.

Eso no permite responder preguntas que son el corazon de la app:

- Que estoy entrenando **este mes**, y que entrenaba el mes pasado.
- Cuando termino un bloque de entrenamiento y empiezo otro.
- Que rutinas forman parte del mismo plan y cuales son restos de un plan viejo.

El usuario acumula rutinas sueltas y no hay forma de archivarlas en conjunto ni
de ver un plan como una unidad.

## 2. Glosario

La jerga tradicional del gimnasio llama "rutina" al microciclo completo (todo lo
que se hace en una semana), y no tiene un nombre corto para el dia suelto. Eso
resulta confuso en la interfaz. Esta app invierte deliberadamente esa
nomenclatura:

| Termino en la app | Equivale a | Significado |
|---|---|---|
| **Programa de entrenamiento** | microciclo (normalmente una semana) | Conjunto de rutinas que forman un plan |
| **Rutina** | dia de entrenamiento | Lista ordenada de ejercicios (ej "Push", "Lunes") |
| **Ejercicio de rutina** | serie de trabajo | Ejercicio con series, reps e intensidad |

Esta nomenclatura es vinculante: la UI, el codigo y la base de datos usan estos
terminos y no los de la jerga tradicional.

## 3. Modelo de datos

### 3.1 Estado actual

```
auth.users
  |
  +-- routines (id, user_id, name, position, created_at)
        |
        +-- routine_weekdays (routine_id, weekday 0..6)
        +-- routine_exercises (routine_id, exercise_id, position, sets, reps,
                               intensity_kind, intensity_value)
```

### 3.2 Estado propuesto

Se agrega un nivel por encima. `routines` **no cambia de semantica**: sigue
siendo un dia de entrenamiento. Solo gana la referencia a su programa.

```
auth.users
  |
  +-- programs (id, user_id, name, archived_at, created_at)   <-- NUEVO
        |
        +-- routines (id, user_id, program_id, name, position, created_at)
              |
              +-- routine_weekdays (sin cambios)
              +-- routine_exercises (sin cambios)
```

### 3.3 Tabla `programs`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid pk | `gen_random_uuid()` |
| `user_id` | uuid | FK a `auth.users`, on delete cascade |
| `name` | text | Nombre libre, ej "Fuerza 6 dias", "Volumen invierno" |
| `archived_at` | timestamptz null | `null` = programa activo |
| `created_at` | timestamptz | `now()` |

Regla "un solo programa activo por usuario", forzada en la base y no solo en el
front:

```sql
create unique index programs_un_activo_por_usuario
  on public.programs (user_id)
  where archived_at is null;
```

Esto hace imposible que un bug del cliente deje dos programas activos.

### 3.4 Cambios en `routines`

- Nueva columna `program_id uuid not null`, FK a `programs(id)` on delete cascade.
- Se **mantiene** `user_id` aunque sea derivable via `program_id -> programs.user_id`.
  Es una desnormalizacion deliberada: permite que las politicas RLS de `routines`
  sigan siendo `user_id = auth.uid()` sin un join, igual que hoy.
- `position` pasa a significar el orden **dentro del programa**, no dentro del
  usuario. La unicidad no se fuerza: posiciones repetidas se desempatan por
  `created_at`.

### 3.5 Reglas de negocio

1. Un usuario tiene **como maximo un programa activo** (`archived_at is null`).
2. Activar un programa archiva automaticamente el que estaba activo. No hay paso
   manual de "finalizar".
3. Una rutina pertenece a **exactamente un** programa. No se comparte entre
   programas; para reusar un dia se duplica.
4. Los dias de la semana se asignan **a nivel rutina** (`routine_weekdays`, como
   hoy). Una rutina puede repetirse en varios dias.
5. El orden de las rutinas dentro del programa es **manual** (drag-reorder sobre
   `position`), independiente de los dias de semana asignados.
6. Borrar un programa borra sus rutinas en cascada.
7. Archivar un programa **no** borra nada: sus rutinas quedan intactas y
   consultables como historial.

## 4. Migracion

Confirmado el 2026-07-29 con el proyecto ya restaurado: hay **datos reales**
(2 filas en `routines`, 4 en `routine_weekdays`, 1 en `routine_exercises`,
2 perfiles). El backfill de los pasos 2 y 3 se ejecuta de verdad, no en vacio.

```sql
-- 1. Tabla de programas
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.programs is
  'Programa de entrenamiento: microciclo que agrupa rutinas (dias).';
comment on column public.programs.archived_at is
  'null = programa activo. Solo puede haber uno activo por usuario.';

create unique index programs_un_activo_por_usuario
  on public.programs (user_id)
  where archived_at is null;

create index programs_user_id_idx on public.programs (user_id);

alter table public.programs enable row level security;

create policy "programs_select_propios" on public.programs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "programs_insert_propios" on public.programs
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "programs_update_propios" on public.programs
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "programs_delete_propios" on public.programs
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 2. Backfill: un programa por usuario que ya tenga rutinas
insert into public.programs (user_id, name)
select distinct user_id, 'Mi programa'
from public.routines;

-- 3. Vincular las rutinas existentes a ese programa
alter table public.routines add column program_id uuid references public.programs (id) on delete cascade;

update public.routines r
set program_id = p.id
from public.programs p
where p.user_id = r.user_id and r.program_id is null;

alter table public.routines alter column program_id set not null;

create index routines_program_id_idx on public.routines (program_id);
```

Cada usuario con rutinas termina con un programa activo llamado "Mi programa"
que contiene todo lo que tenia. Verificar despues de aplicar que ningun usuario
quedo con dos programas activos, aunque el indice unico parcial ya lo impide.

Las politicas RLS de `routines` no se tocan: siguen validando `user_id`.

Segun la convencion del repo, esta migracion se aplica directo al proyecto
remoto (no hay carpeta `supabase/migrations/` local).

## 5. Flujos de interfaz

### 5.1 Crear programa

Alta en **dos pasos separados**, no un wizard combinado:

1. El usuario crea el programa indicando solo el nombre. Queda activo y vacio.
2. Desde el detalle del programa agrega rutinas una por una, con el wizard que
   ya existe en `create-routine.tsx`.

Razon: el wizard actual ya tiene 3 pasos (nombre, dias, ejercicios). Meterle la
creacion del programa adentro lo vuelve un flujo de 5 pasos antes de ver algo
util.

### 5.2 Home

El home pasa de "lista plana de rutinas" a "programa activo con sus rutinas":

- Encabezado con el nombre del programa activo.
- Debajo, sus rutinas ordenadas por `position`, con el boton Empezar que ya
  existe.
- Si no hay programa activo, se muestra el estado vacio invitando a crear uno.

### 5.3 Historial

La pestana Historial (hoy declarada en `TABS` pero sin pantalla) lista los
programas archivados, del mas reciente al mas viejo, con sus fechas y la
cantidad de rutinas. Entrar a uno muestra sus rutinas en modo lectura.

## 6. Fuera de alcance

Este spec cubre **la estructura**: programas, rutinas y su jerarquia. No cubre
la **ejecucion**, que necesita su propio spec:

- Registro de sesion (que pasa al tocar Empezar: cargar peso, reps y RIR/RPE
  reales serie por serie).
- Progresion y PRs, volumen semanal, 1RM estimado.
- Duplicar un programa como punto de partida del siguiente bloque.
- Plantillas de programas predefinidos.

El paso 2 del onboarding del home ("Registra una sesion") depende de ese spec,
no de este.
