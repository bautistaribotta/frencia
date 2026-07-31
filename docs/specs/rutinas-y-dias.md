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

Cada tarjeta de dia lleva ademas un lapiz que abre la edicion de ese dia. Va en
la tarjeta y no en la cabecera de la rutina porque lo que se edita es el dia, y
va en variante ghost para no disputarle la atencion a Empezar, que es la accion
principal de la tarjeta.

El boton de crear avisa explicitamente que archiva la rutina actual, porque no
es obvio y no tiene vuelta atras desde la interfaz.

Si no hay rutina activa, se muestra el onboarding de cuenta nueva.

### 5.3 Editar un dia

Implementado en `src/app/edit-day.tsx`, con el dia como parametro de ruta.

Es la **misma vista** que el paso 3 del wizard. El armado de un dia vive en
`src/components/DayEditor.tsx` (nombre, dias de la semana, lista arrastrable de
ejercicios y el boton de agregar) y el buscador en
`src/components/ExercisePickerModal.tsx`. Ninguno de los dos sabe de la base:
reciben el dia y avisan cada cambio. Quien los monta decide si eso va a memoria
(wizard) o a la base (edicion).

Los tipos y helpers compartidos —`TrainingDay`, `DayExercise`, las opciones de
intensidad, la grilla de descansos y el resumen de un ejercicio— viven en
`src/lib/dia.ts`, junto con `cargarDia` y `guardarDia`.

#### Editar un ejercicio ya cargado

Un toque corto sobre una fila abre el mismo modal directo en la cara de
configurar, con los valores de ese ejercicio puestos. Mantenerla apretada sigue
levantandola para reordenar: las separa el mismo umbral de 200ms que ya existia
para no pelear con el scroll. Como ninguna de las dos acciones tiene icono
propio, se enuncian arriba de la lista.

Editando no hay vuelta al buscador. El ejercicio ya esta elegido y lo que se
cambia son los numeros; para cambiar el ejercicio se quita y se agrega otro.

Dos reglas del modal en modo edicion:

1. **Conserva el uid** de la fila, y quien recibe el ejercicio reemplaza por uid
   (`aplicarEjercicio`) en vez de por indice. Asi el reemplazo no depende de que
   la lista no se haya movido.
2. **Conserva el medidor con el que se guardo el ejercicio**, no la preferencia
   actual del perfil. Si el usuario paso de RIR a RPE, reetiquetar un "2 RIR"
   como "2 RPE" cambiaria el dato sin que nadie lo pida. Ademas el centinela
   `-1` ("al fallo") solo existe en RIR y hay que poder mostrarlo.

Los ejercicios **nuevos** si usan la preferencia actual del perfil, asi que un
dia puede terminar mezclando RIR y RPE. El resumen de cada fila muestra el suyo.

Diferencias respecto del paso del wizard:

1. El contenido arranca arriba en vez de centrado: el dia ya tiene ejercicios,
   asi que la pantalla nace larga y centrarla la haria saltar segun cuantos haya.
2. El encabezado dice a que rutina pertenece el dia. Sin ese dato el campo de
   nombre no ubica nada.
3. Guardar esta deshabilitado si no hay cambios o si el nombre quedo vacio.
4. Salir con cambios sin guardar pregunta antes de descartarlos. No hay
   borrador: la pantalla edita en memoria y recien escribe al confirmar.

#### Guardado

Guardar un dia es **reemplazar** su contenido: borrar weekdays y ejercicios e
insertar los nuevos. Hecho desde el cliente son cuatro llamadas sueltas, y si la
red se corta entre el delete y el insert el dia queda vacio. Por eso va por la
funcion `public.guardar_dia_entrenamiento(uuid, text, smallint[], jsonb)`, que
corre todo en una transaccion: o entra entero o no entra nada.

Es `security invoker`, asi que las politicas RLS del usuario que llama siguen
aplicando y la funcion no puede tocar el dia de otro. Si el `update` inicial no
afecta ninguna fila (el dia no existe o no es suyo), corta con excepcion antes
de borrar nada. `anon` no tiene permiso de ejecucion.

Reemplazar los ejercicios **no** toca el historial: `session_sets` referencia
`exercises` y `workout_sessions`, no `training_day_exercises`. Editar un dia no
borra lo que ya se levanto en el.

### 5.4 Lista de rutinas

Implementada en `src/app/(main)/routines.tsx`, con su tab propio en la barra
inferior.

El home y esta pantalla responden preguntas distintas, y por eso no comparten
forma. El home responde "que entreno hoy": su fila es un **dia**, con la tira de
semana y el boton Empezar. Aca la pregunta es "que planes tuve y cual esta
corriendo": la fila es la **rutina entera**.

| | Home | Rutinas |
|---|---|---|
| Fila | Dia de entrenamiento | Rutina |
| Estructura | Pila de tarjetas iguales | Una activa destacada + registro |
| Accion en la fila | Empezar | Ninguna; se entra tocando |
| Tira de semana | Si | No |
| Nombre | `subtitle` (Archivo) | Activa en `display` (Anton) |
| Datos | Cuenta de ejercicios | Fechas en monoespaciada |

La rutina activa es el unico plan corriendo, asi que se lleva el nombre en
display y el peso visual de la pantalla. Las anteriores van como filas al hilo
separadas por una linea fina: son historial, no cosas que se accionan.

Cada rutina muestra su periodo: "desde 29 jul" si sigue activa, "15 jun – 29
jul" si ya se archivo.

Sin rutinas, la pantalla invita a crear la primera. Si hay archivadas pero
ninguna activa —posible despues de archivar— se avisa y se ofrece crear.

### 5.5 Detalle de una rutina

Implementado en `src/app/routine.tsx`, con la rutina como parametro de ruta.

Nombre, estado (en curso o archivada), periodo y los dias que la componen. Cada
dia se toca para editarlo, y va a la pantalla de la seccion 5.3.

Mantiene el idioma de la lista —nombre en display, datos en monoespaciada, dias
como filas al hilo— y no el del home. Empezar el entrenamiento se hace desde el
home; aca se mira y se corrige el plan.

Editar los dias de una rutina archivada esta permitido a proposito: son datos
del usuario y no hay razon para bloquearlos.

El boton **Editar rutina** existe pero todavia no hace nada: avisa que la
funcion no esta disponible. Un boton que no responde al toque se lee como roto,
asi que dice que le falta en vez de quedarse mudo.

### 5.6 Barra de navegacion

Tres tabs: Hoy, Rutinas y Perfil, con el boton de crear al centro. Falta
Historial, que se suma cuando exista su pantalla.

Con una cantidad impar de tabs, el `TabBar` reparte dos a la izquierda y uno a
la derecha. Los dos lados van en grupos de ancho igual para que el boton central
quede centrado; sueltos, el lado con menos items se llevaba mas ancho y lo
corria. La contra es que el tab solitario queda centrado en su mitad y no a la
misma distancia que los otros dos. Se acomoda solo cuando entre el cuarto tab.

**La barra vive en el layout, no en las pantallas.** El grupo `(main)` es un
navegador de pestanias (`Tabs`) con una barra propia: se monta una sola vez y
cambiar de pestania intercambia la pantalla debajo sin desmontarla ni volver a
animarla. Antes cada pantalla dibujaba su `TabBar` y el cambio era un `push` en
el stack, asi que la barra entraba deslizandose con la pantalla nueva.

Consecuencias del modelo:

- **Perfil es una pestania**, no una pantalla apilada. Perdio el boton Volver y
  el gesto de arrastrar hacia abajo para cerrar: con la barra siempre visible,
  se sale tocando otra pestania.
- Las pestanias **quedan montadas** despues de la primera visita. Los datos
  igual se releen con `useFocusEffect`, asi que volver a una pestania muestra lo
  que se creo o edito mientras tanto.
- Solo son pestanias los destinos de primer nivel. El wizard, la sesion, el
  detalle de una rutina y las pantallas de edicion siguen en el stack de arriba
  y **tapan la barra a proposito**: se entra a hacer una cosa y se sale.

## 6. Fuera de alcance

Este spec cubre la **estructura**. La **ejecucion** vive en
`registro-de-sesion.md`:

- Registro de sesion (que pasa al tocar Empezar).
- Progresion, PRs, volumen semanal, 1RM estimado.

Tampoco cubre, por ahora:

- Editar la rutina en si: renombrarla, agregar o quitar dias, reordenarlos.
  Editar un **dia** ya existe (seccion 5.3) y el boton del detalle ya esta
  puesto (seccion 5.5); lo que falta es la funcion atras.
- Duplicar una rutina como punto de partida de la siguiente.
- Desarchivar una rutina vieja.
- Plantillas de rutinas predefinidas.
