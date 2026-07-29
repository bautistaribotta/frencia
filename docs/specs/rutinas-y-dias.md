# Rutinas y dias de entrenamiento

Estado: implementado (esquema y wizard)
Fecha: 2026-07-29

Reemplaza al spec anterior `programas-y-rutinas.md`, que llamaba "programa" al
contenedor y "rutina" al dia. La jerarquia de tres niveles se mantiene; cambian
los nombres.

## 1. Problema

El modelo original era plano: una `routine` era un dia de entrenamiento suelto,
colgado directo del usuario, y el home listaba todos los dias sin agrupar.

Eso no permite responder lo basico:

- Que estoy entrenando **ahora**, y que entrenaba antes.
- Cuando termina un bloque de entrenamiento y empieza otro.
- Que dias forman parte del mismo plan y cuales son restos de uno viejo.

## 2. Glosario

La jerga tradicional del gimnasio llama "rutina" al microciclo completo (todo lo
que se hace en una semana) y no tiene nombre corto para el dia suelto. Esta app
usa los terminos asi:

| Termino en la app | Equivale a | Significado |
|---|---|---|
| **Rutina** | microciclo / plan | Conjunto de dias de entrenamiento |
| **Dia de entrenamiento** | dia | Lista ordenada de ejercicios ("Push", "Dia 1") |
| **Ejercicio** | serie de trabajo | Ejercicio con series, reps e intensidad |

Vinculante: UI, codigo y base de datos usan estos terminos.

## 3. Modelo de datos

```
auth.users
  |
  +-- routines (id, user_id, name, archived_at, created_at)
        |
        +-- training_days (id, routine_id, user_id, name, position, created_at)
              |
              +-- training_day_weekdays (training_day_id, weekday 0..6)
              +-- training_day_exercises (training_day_id, exercise_id, position,
                                          sets, reps, intensity_kind,
                                          intensity_value, rest_seconds)
```

### 3.1 `routines`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid pk | |
| `user_id` | uuid | FK a `auth.users`, on delete cascade |
| `name` | text | Nombre libre, ej "Push Pull Legs" |
| `archived_at` | timestamptz null | `null` = rutina activa |
| `created_at` | timestamptz | |

Regla "una sola rutina activa por usuario", forzada en la base:

```sql
create unique index routines_una_activa_por_usuario
  on public.routines (user_id)
  where archived_at is null;
```

Esto hace imposible que un bug del cliente deje dos rutinas activas. El front
tiene que contemplarlo: si no archiva la anterior antes de insertar, el insert
falla.

### 3.2 `training_days`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid pk | |
| `routine_id` | uuid | FK a `routines`, on delete cascade |
| `user_id` | uuid | Desnormalizado, ver abajo |
| `name` | text | Arranca como "Dia 1", renombrable a "Push" |
| `position` | smallint | Orden manual dentro de la rutina |
| `created_at` | timestamptz | |

`user_id` es derivable via `routine_id`, pero se guarda igual: permite que las
politicas RLS sean `user_id = (select auth.uid())` sin un join.

### 3.3 `training_day_exercises`

Ademas de `sets`, `reps`, `intensity_kind` e `intensity_value`, incluye
`rest_seconds` (nullable): el descanso fijo entre series de ese ejercicio. Ver
`registro-de-sesion.md` seccion 4.3.

`intensity_value` admite `-1` como centinela de "al fallo" en RIR.

### 3.4 Reglas de negocio

1. Un usuario tiene **como maximo una rutina activa**.
2. Crear una rutina archiva automaticamente la anterior. No hay paso manual.
3. Un dia pertenece a **exactamente una** rutina. Para reusarlo se duplica.
4. Los dias de la semana se asignan **a nivel dia**, y son opcionales. Un dia
   puede repetirse en varios dias de la semana.
5. El orden de los dias dentro de la rutina es manual (`position`).
6. Borrar una rutina borra sus dias en cascada.
7. Archivar **no** borra nada: los dias quedan intactos como historial.

## 4. Migracion aplicada

`restructure_routine_as_container_with_training_days`, aplicada el 2026-07-29 al
proyecto remoto.

Como las tablas solo tenian datos de prueba (1 rutina, 1 weekday, 0 ejercicios),
se hizo `drop ... cascade` de `routines`, `routine_weekdays` y
`routine_exercises`, y se recrearon con la estructura nueva. No hubo backfill.

Todas las tablas con RLS habilitada. `routines` y `training_days` validan por
`user_id` directo; `training_day_weekdays` y `training_day_exercises` validan
con un `exists` contra `training_days`.

Migracion complementaria:
`add_training_day_exercises_exercise_id_index`, que agrega el indice sobre la FK
a `exercises` (el indice compuesto arranca por `training_day_id` y no la cubria).

## 5. Interfaz

### 5.1 Wizard de creacion

Implementado en `src/app/create-routine.tsx`. Dos pasos fijos y uno por dia:

1. **Nombre de la rutina.** Unico campo obligatorio.
2. **Cantidad de dias** (1 a 7, por defecto 3). Al cambiarla se conservan los
   dias ya cargados; recortar pierde los del final.
3. **Un paso por dia.** Nombre del dia (precargado "Dia N"), dias de la semana
   opcionales, y la lista de ejercicios con su buscador.

Todo se acumula en memoria. Recien al finalizar se persiste en una tanda:
archivar la rutina anterior, insertar la rutina, insertar los dias, y despues
weekdays y ejercicios. Cancelar a mitad no deja basura.

Los dias se insertan juntos y los ids se aparean por indice, aprovechando que
Supabase devuelve las filas en el orden en que se enviaron.

### 5.2 Home

Muestra el nombre de la rutina activa y, debajo, sus dias ordenados por
`position`, cada uno con su tira de semana, la cuenta de ejercicios y el boton
Empezar.

El boton de crear avisa explicitamente que archiva la rutina actual, porque no
es obvio y no tiene vuelta atras desde la interfaz.

Si no hay rutina activa, se muestra el onboarding de cuenta nueva.

## 6. Fuera de alcance

Este spec cubre la **estructura**. La **ejecucion** vive en
`registro-de-sesion.md`:

- Registro de sesion (que pasa al tocar Empezar).
- Progresion, PRs, volumen semanal, 1RM estimado.

Tampoco cubre, por ahora:

- Editar una rutina ya creada (agregar o quitar dias, reordenarlos).
- Duplicar una rutina como punto de partida de la siguiente.
- Desarchivar una rutina vieja.
- Plantillas de rutinas predefinidas.
