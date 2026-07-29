# Catalogo de ejercicios

Estado: propuesto
Fecha: 2026-07-29

## 1. Problema

El catalogo esta vacio. Verificado el 2026-07-29 contra el proyecto remoto:

| Tabla | Filas |
|---|---|
| `exercises` | 1 ("Press banca plano con barra") |
| `exercise_muscles` | 0 |
| `muscle_groups` | 11 |

Con un solo ejercicio no se puede armar una rutina real, el filtro por grupo
muscular no filtra nada, y no hay forma de probar de punta a punta el registro de
sesion. Bloquea todo lo demas.

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
**la curaduria salva la estrategia de busqueda actual**. Hoy la app carga el
catalogo entero en memoria y filtra ahi. Con ~300 ejercicios y campos acotados
eso son unos 50 KB, perfectamente viable. Con los 1.324 completos y sus
instrucciones el JSON pesa 17 MB y habria que rehacer la busqueda contra el
servidor.

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

Se resuelve con un script que lee el dataset, aplica la curaduria y la
traduccion, y **genera el SQL**. La migracion resultante se versiona y se aplica
al proyecto remoto, para que la carga sea reproducible y no dependa de una
ejecucion manual.

Pasos:

1. Descargar `data/exercises.json` del repositorio fuente. No se versiona en
   este repo: pesa 17 MB y solo se necesita para generar la migracion.
2. Filtrar segun los criterios de la seccion 3.
3. Traducir los nombres al espanol.
4. Mapear `target` y `secondary_muscles` a `muscle_groups`, marcando
   `is_primary`.
5. Emitir el SQL de insercion en `exercises` y `exercise_muscles`.

Queda una unica fila en `exercises` ("Press banca plano con barra"). La
reestructuracion de `rutinas-y-dias.md` borro las tablas que la referenciaban,
asi que ya no hay nada que preservar: se puede reemplazar o dejar que el dataset
la duplique y limpiarla despues.

## 6. Fuera de alcance

- Ejercicios creados por el usuario. El catalogo sigue siendo cerrado y de
  escritura administrada.
- GIFs y miniaturas, hasta resolver la licencia (seccion 2.1).
- Instrucciones en otros idiomas: solo se importa espanol.
- Buscar contra el servidor. La curaduria mantiene viable el filtrado en
  memoria; si el catalogo crece mucho, habra que revisarlo.
