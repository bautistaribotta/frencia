# Catalogo de ejercicios

Estado: implementado
Fecha: 2026-07-29

## 1. Problema

El catalogo estaba vacio: `exercises` tenia 1 fila de prueba y `exercise_muscles`
ninguna, asi que no se podia armar una rutina real ni probar el registro de
sesion de punta a punta.

Resuelto el 2026-07-29. Estado actual:

| Tabla | Filas |
|---|---|
| `exercises` | 198 |
| `exercise_muscles` | 425 (198 primarios, 227 secundarios) |
| `muscle_groups` | 11 |

## 2. Fuente elegida

[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset),
1.324 ejercicios con metadatos, medios e instrucciones en 10 idiomas.

### 2.1 Licencia: leer antes de tocar los medios

El repositorio es **dual-licencia** y la distincion es critica:

| Parte | Licencia | Se puede usar |
|---|---|---|
| Datos (nombres, categorias, equipamiento, musculos, instrucciones) | MIT | Si, sin restriccion |
| GIFs y miniaturas | (c) Gym visual | **No sin licencia propia** |

El `NOTICE.md` del repositorio es explicito: clonar el repositorio no otorga
derechos sobre los medios. Usarlos exige licencia propia de Gym visual, obliga a
mantener la atribucion visible y limita la resolucion a 180x180.

**Decision:** se importan **solo los datos MIT**. Las columnas de medios quedan
creadas pero vacias. Asi el desarrollo no se bloquea por una negociacion de
licencia y el esquema ya esta listo para cuando se resuelva.

Alternativa evaluada y descartada por ahora:
[yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db)
(Unlicense, dominio publico real) tiene fotos JPG estaticas en vez de GIFs
animados. Queda como plan B si no se consigue la licencia de Gym visual.
`wger` se descarta por AGPL-3.0, que es viral sobre el codigo.

## 3. Curaduria

No se importan los 1.324. Se filtra a un subconjunto de entre 250 y 400
ejercicios de gimnasio comunes.

Criterio de exclusion:

- `body_part` igual a `cardio` o `neck`.
- Estiramientos (el dataset trae muchos "stretch", que no se registran con
  series y repeticiones).
- Variantes asistidas y ejercicios con equipamiento marginal (bosu, neumatico,
  trineo, rodillo).
- Ejercicios cuyo `target` no mapea a ninguno de los 11 grupos musculares
  existentes (ver 4.3).

Razon, mas alla de lo obvio: un picker con 1.324 filas es inusable, y ademas
**la curaduria salva la estrategia de busqueda actual**. La app carga el
catalogo entero en memoria y filtra ahi. Con 198 ejercicios y campos acotados
(el hook solo trae `id`, `name` y `name_en`) eso son unos 20 KB, perfectamente
viable. Con los 1.324 completos y sus instrucciones el JSON pesa 17 MB y habria
que rehacer la busqueda contra el servidor.

### 3.1 Por que la seleccion es manual

El primer intento fue filtrar por reglas (equipamiento comun, cupo por grupo, y
a igualdad de equipamiento el nombre mas corto como proxy de "ejercicio base").
El resultado no servia: dejaba entrar variantes de render del mismo movimiento
(`v. 2`, `(female)`, `(back pov)`), nombres que no son ejercicios de sala
(`quads`, `balance board`, `spell caster`), y sobre todo **dejaba afuera lo mas
basico** (dominadas, fondos, jalon al pecho, extension de triceps en polea,
prensa), porque son nombres largos o de equipamiento que quedaba abajo en el
orden de prioridad.

La seleccion final es una lista escrita a mano de 198 ejercicios, cada uno con
su nombre exacto del dataset y su traduccion. Un script valida que los 198
existan realmente en el origen antes de generar el SQL.

## 4. Modelo de datos

### 4.1 Columnas nuevas en `exercises`

| Columna | Tipo | Notas |
|---|---|---|
| `slug` | text unique | Identificador estable derivado del nombre, para referencias y reimportaciones |
| `name` | text | **En espanol**. Ya existe |
| `name_en` | text null | Nombre original del dataset. Se usa tambien para buscar |
| `source_id` | text null | El `id` del dataset (ej "0001"), para reimportar sin duplicar |
| `equipment` | text null | Equipamiento requerido (mancuerna, barra, peso corporal) |
| `instructions` | text null | Instrucciones en espanol, tomadas de `instructions.es` |
| `image_url` | text null | Vacio por ahora, ver 2.1 |
| `gif_url` | text null | Vacio por ahora, ver 2.1 |

### 4.2 Nombres en espanol

El dataset trae `name` **solo en ingles**; unicamente las instrucciones estan
traducidas. La app esta integramente en espanol, asi que los nombres se traducen
una vez durante la importacion y se guardan en `name`.

Se conserva `name_en` porque en el gimnasio mucha gente usa el nombre en ingles
("lat pulldown", "hip thrust"). La busqueda mira los dos campos, asi el usuario
encuentra el ejercicio escriba como escriba.

### 4.3 Mapeo de musculos

El campo `body_part` del dataset es demasiado grueso para los 11 grupos
existentes: `upper arms` mezcla biceps y triceps, `upper legs` mezcla
cuadriceps, gluteos y femoral. **No sirve para mapear.**

Se usa `target` (musculo primario) y `secondary_muscles`:

| `target` del dataset | `muscle_groups.slug` |
|---|---|
| pectorals | pecho |
| lats, upper back, traps, spine | espalda |
| delts | hombros |
| biceps | biceps |
| triceps | triceps |
| forearms | antebrazo |
| quads | cuadriceps |
| glutes | gluteos |
| hamstrings | femoral |
| calves | gemelos |
| abs | abdomen |

Los `target` que no aparecen en la tabla (`cardiovascular system`,
`levator scapulae`, `adductors`, `abductors`, `serratus anterior`) no tienen
grupo equivalente. Sus ejercicios se excluyen de la importacion en vez de
forzarlos a un grupo que no corresponde.

### 4.4 Primario contra secundario

`exercise_muscles` hoy no distingue el musculo principal de los asistentes.
Agregar:

| Columna | Tipo | Notas |
|---|---|---|
| `is_primary` | boolean not null default false | `true` para el `target`, `false` para los `secondary_muscles` |

Permite que el filtro por grupo muscular ofrezca "principalmente pecho" en vez
de devolver todo ejercicio donde el pecho participe de refilon.

## 5. Importacion

El `data/exercises.json` del repositorio fuente (17 MB) **no se versiona**: solo
hace falta para generar el SQL. Un script lo lee, valida que los 198 nombres
elegidos existan, y emite las migraciones.

Migraciones aplicadas el 2026-07-29:

| Migracion | Contenido |
|---|---|
| `add_catalog_columns_to_exercises` | Columnas nuevas e `is_primary` |
| `seed_exercises_catalog_curated` | Borra la fila de prueba e inserta los 198 |
| `seed_exercise_muscles` | 425 relaciones musculares |
| `seed_exercise_instructions_1..4` | Instrucciones en espanol, en cuatro tandas |
| `mark_hip_abduction_primary_muscle` | Correccion, ver abajo |

Se dividio en varias migraciones porque el SQL completo son ~148 KB, de los
cuales 100 KB son las instrucciones. Se aplicaron con `npx supabase db push`.

**Correccion necesaria:** "Abductores en maquina" quedo sin musculo primario. Su
`target` en el dataset es `abductors`, que no tiene equivalente entre los 11
grupos, asi que el `join` del seed no encontro fila. Se promovio su relacion con
gluteos (que ya existia como secundaria) a primaria, porque la abduccion de
cadera trabaja sobre todo el gluteo medio. Vale como recordatorio: **todo
ejercicio tiene que terminar con exactamente un primario**, y conviene
verificarlo despues de cada importacion.

## 5.1 Busqueda por los dos nombres

`useExerciseCatalog` trae `id`, `name` y `name_en`, y el filtro del wizard mira
los dos campos. Asi "jalon al pecho" y "lat pulldown" encuentran el mismo
ejercicio, que es como se habla en el gimnasio.

La clave del cache en AsyncStorage subio a `v2` al sumar `name_en`: con la `v1`
los usuarios existentes hubieran quedado con objetos sin ese campo.

## 6. Fuera de alcance

- Ejercicios creados por el usuario. El catalogo sigue siendo cerrado y de
  escritura administrada.
- GIFs y miniaturas, hasta resolver la licencia (seccion 2.1).
- Instrucciones en otros idiomas: solo se importa espanol.
- Buscar contra el servidor. La curaduria mantiene viable el filtrado en
  memoria; si el catalogo crece mucho, habra que revisarlo.
