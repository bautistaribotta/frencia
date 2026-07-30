# Registro de sesion de entrenamiento

Estado: propuesto
Fecha: 2026-07-29
Revisado: 2026-07-30 (el registro pasa de lista a wizard, ver seccion 6)

Depende de `rutinas-y-dias.md`, que define la jerarquia Rutina > Dia de
entrenamiento > Ejercicio. Este spec cubre la ejecucion: que pasa cuando el
usuario toca Empezar sobre un dia.

## 1. Problema

Hoy la app permite planificar (crear rutinas con sus dias, ejercicios, series,
reps e intensidad objetivo) pero no registrar. El boton Empezar del home no
lleva a ningun lado, y el paso 2 del onboarding ("Registra una sesion") esta
bloqueado.

Sin registro no hay training log: no hay progresion, ni PRs, ni volumen, ni 1RM
estimado. Todo eso son lecturas derivadas de lo que efectivamente se levanto.

## 2. Concepto central: la serie fantasma

El patron de interfaz que define esta pantalla. Al registrar una serie, el
usuario ve los campos vacios y, arriba de ellos, lo que hizo en esa misma serie
la vez anterior.

```
  Anterior:  80 kg  x  8  ·  RIR 2
  ---------------------------------
  Serie 3    [    ] kg  [  ] reps  [  ] RIR
```

Los campos arrancan **vacios**, no precargados. Es deliberado: precargar empuja
a repetir lo mismo por inercia. Mostrar la referencia al lado obliga a una
decision consciente sobre donde progresar, que puede ser subir el peso, sumar
una repeticion o bajar el RIR con el mismo peso. Las tres son progresion valida
y la app no elige por el usuario.

La comparacion es **serie contra serie**: la serie 3 de hoy contra la serie 3 de
la vez pasada, no contra la mejor del ejercicio. Refleja la caida por fatiga
dentro del ejercicio.

## 3. Reglas de negocio

1. Cada serie registra **peso, repeticiones e intensidad** (RIR o RPE, segun
   `profiles.medidor_esfuerzo`). Los tres son obligatorios para dar la serie por
   terminada.
2. La sesion es **libre**. El dia de entrenamiento precarga que ejercicios
   tocan, pero el usuario puede sumar una serie extra, cortar un ejercicio antes
   de lo planificado o saltearlo entero. La app no bloquea ni advierte.
3. Los pasos del wizard se **pre-generan desde el plan**: si el ejercicio tiene
   4 series planificadas, arranca con 4 pasos. La cantidad es editable en vivo
   (sumar una serie, cortar el ejercicio), pero siempre hay un total conocido,
   que es lo que permite mostrar cuanto falta.
4. La serie fantasma sale de **la ultima sesion terminada de este mismo dia de
   entrenamiento, dentro de los ultimos 10 dias**. Ver 3.1.
5. Hay **como maximo una sesion en curso** por usuario, forzada en la base de
   datos igual que la rutina activa.
6. Una sesion en curso se retoma donde quedo. Un entrenamiento dura una hora con
   la pantalla apagandose, salir de la app es normal y no debe perder nada. Cada
   serie se escribe al pasar al paso siguiente, no al terminar la sesion.

### 3.1 Ventana de 10 dias

La referencia se limita al **mismo dia de entrenamiento** y a los **ultimos 10
dias**. Sin las dos condiciones no se muestra fantasma y los campos van solos.

Los 10 dias son la holgura de una rutina semanal: cubren la semana normal y una
sesion salteada. Mas alla de eso la comparacion deja de ser util, porque contra
un peso de hace tres semanas no se progresa, se recupera.

No hay fallback a otros dias de entrenamiento. Se evaluo comparar contra el
mismo ejercicio hecho en cualquier dia, para tapar el agujero de estrenar rutina
(dias nuevos, sin historial), y se descarto: mezcla contextos distintos, con
otro orden de ejercicios y otra fatiga acumulada, y hace que el numero de
referencia signifique dos cosas segun el caso. Preferimos no mostrar nada a
mostrar algo que no es comparable.

Consecuencia aceptada: al estrenar una rutina, las primeras sesiones de cada dia
van sin fantasma.

## 4. Modelo de datos

```
auth.users
  |
  +-- workout_sessions (id, user_id, training_day_id, started_at, finished_at)
        |
        +-- session_sets (id, session_id, exercise_id, set_index, weight_kg,
                          reps, intensity_kind, intensity_value, completed_at)
```

Dos tablas, sin nivel intermedio de "ejercicio de la sesion". El orden y la
agrupacion por ejercicio se derivan de `session_sets`. Se puede agregar despues
si hacen falta notas por ejercicio.

### 4.1 `workout_sessions`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid pk | `gen_random_uuid()` |
| `user_id` | uuid | FK a `auth.users`, on delete cascade |
| `training_day_id` | uuid null | FK a `training_days` on delete set null. Nullable para que borrar un dia no borre el historial |
| `started_at` | timestamptz | `now()` |
| `finished_at` | timestamptz null | `null` = sesion en curso |
| `created_at` | timestamptz | `now()` |

```sql
create unique index workout_sessions_una_en_curso
  on public.workout_sessions (user_id)
  where finished_at is null;
```

`training_day_id` nullable con `on delete set null` es intencional: el historial
de lo que el usuario levanto sobrevive al borrado del dia que lo origino, y como
archivar una rutina no borra sus dias, las sesiones viejas conservan el vinculo.
Se pierde la referencia solo si el dia se elimina de verdad.

### 4.2 `session_sets`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid pk | `gen_random_uuid()` |
| `session_id` | uuid | FK a `workout_sessions`, on delete cascade |
| `exercise_id` | uuid | FK a `exercises` |
| `set_index` | smallint | Numero de serie dentro del ejercicio, arranca en 1 |
| `weight_kg` | numeric | Siempre en kilos, ver 4.4 |
| `reps` | smallint | `> 0` |
| `intensity_kind` | text | `rir` o `rpe`, mismo check que `training_day_exercises` |
| `intensity_value` | numeric | `>= -1`, mismo check que `training_day_exercises` |
| `completed_at` | timestamptz | `now()` |

```sql
create unique index session_sets_unico
  on public.session_sets (session_id, exercise_id, set_index);
```

El indice es **unico**, no solo de busqueda. Dentro de una sesion, la serie 3 del
press de banca es una sola cosa. Ademas habilita el upsert que necesita la regla
6: volver atras y corregir un peso reescribe la fila en vez de duplicarla.

RLS por dueño en ambas tablas. `session_sets` valida via join a
`workout_sessions.user_id`.

### 4.3 Descanso entre series

El descanso se define **al agregar el ejercicio al dia**, no durante la sesion.
Es un tiempo fijo, igual para todas las series de ese ejercicio.

Columna en `training_day_exercises`, ya creada por la migracion de
`rutinas-y-dias.md`:

| Columna | Tipo | Notas |
|---|---|---|
| `rest_seconds` | smallint null | `null` = sin descanso configurado. Check `> 0` |

Es opcional: si el usuario elige "Sin", la columna queda en `null` y la sesion
no genera paso de descanso para ese ejercicio.

El configurador ofrece una lista cerrada de descansos (30s, 45s, y de ahi en
adelante la grilla de 30 segundos hasta 5:00) en vez de un campo libre. Ningun
descanso real cae fuera de esa grilla, y elegir de una lista es un toque contra
varios de un stepper. Es lo que hacen las apps del rubro.

Por defecto viene en **2:00**, el descanso tipico de hipertrofia. No arranca en
`null`: la mayoria de los ejercicios quiere temporizador, y pedirlo ejercicio
por ejercicio para el caso comun es friccion al pedo.

Deliberadamente **no** se guarda el descanso real que el usuario tomo. Eso
implicaria registrar tiempos entre series y no aporta a la progresion, que se
mide por peso, reps e intensidad.

### 4.4 Unidad de peso

El peso se guarda **siempre en kilos** en `weight_kg`, sin importar la
preferencia del usuario. `profiles.unidad_peso` decide como se muestra y como se
interpreta lo que se escribe, convirtiendo en el front.

Razon: si se guardara en la unidad ingresada, cambiar la preferencia rompe todo
calculo historico (volumen, PRs) o exige arrastrar la unidad en cada fila y
convertir en cada consulta. Guardar canonico y convertir al borde es mas simple
y no ensucia las agregaciones.

## 5. Consulta de las series fantasma

Se traen **todas** las series de las sesiones terminadas de ese dia dentro de la
ventana, en una sola consulta al abrir la sesion, y se resuelve en memoria cual
corresponde a cada (ejercicio, numero de serie). Son pocas filas (una rutina
semanal deja una o dos sesiones en 10 dias) y evita una ida y vuelta por
ejercicio en medio del entrenamiento, cuando la conexion del gimnasio suele ser
mala.

```sql
select s.exercise_id, s.set_index, s.weight_kg, s.reps,
       s.intensity_kind, s.intensity_value, ws.finished_at
from public.session_sets s
join public.workout_sessions ws on ws.id = s.session_id
where ws.user_id = (select auth.uid())
  and ws.training_day_id = :training_day_id
  and ws.finished_at is not null
  and ws.finished_at >= now() - interval '10 days'
order by ws.finished_at desc;
```

Resolucion en memoria: para cada par (ejercicio, numero de serie) gana la fila de
la sesion mas reciente que lo tenga. Se hace asi, y no tomando la ultima sesion
entera, para que saltear un ejercicio una vez no borre su referencia: si la
semana pasada salteaste dominadas pero la anterior las hiciste, la comparacion
sigue estando.

## 6. Flujos de interfaz

### 6.1 Empezar

Desde el home, Empezar sobre un dia de entrenamiento crea una `workout_session`
con `finished_at` en null y abre la pantalla de sesion.

Si ya hay una sesion en curso, no se crea otra: se ofrece retomarla o
descartarla.

### 6.2 La sesion es un wizard

El registro es **paso a paso**, un paso por pantalla, con Anterior y Siguiente.
No hay lista de todos los ejercicios del dia.

Se eligio wizard sobre lista porque el telefono en el gimnasio se mira de a
segundos entre serie y serie, muchas veces con una mano y transpirado. Una sola
decision por pantalla, con los campos grandes, se completa sin leer. Una lista
con todos los ejercicios obliga a buscar donde estabas cada vez que se prende la
pantalla.

Los pasos se generan del plan del dia, en orden:

```
Ejercicio 1 · serie 1
Ejercicio 1 · descanso
Ejercicio 1 · serie 2
Ejercicio 1 · descanso
...
Ejercicio 1 · ultima serie
Ejercicio 1 · descanso        <- tambien al cambiar de ejercicio
Ejercicio 2 · serie 1
...
```

Un paso de serie muestra:

- En que ejercicio y serie esta, sobre cuantos.
- El nombre del ejercicio y lo planificado (reps e intensidad objetivo).
- La serie fantasma, si la hay (seccion 2).
- Tres campos: peso, reps e intensidad. Vacios.
- Un menu con: sumar una serie a este ejercicio, cortar el ejercicio aca,
  terminar la sesion.

Al tocar Siguiente la serie se escribe en `session_sets`. Anterior vuelve al paso
previo con lo que se habia cargado, editable: corregir un peso mal anotado
reescribe la fila (de ahi el indice unico de 4.2).

Una serie se puede dejar incompleta y avanzar igual: no se escribe nada y no
cuenta. La app no bloquea (regla 2).

### 6.3 El descanso es un paso mas

El temporizador **no** es un banner sobre la pantalla de registro: es su propio
paso, con la misma navegacion que los demas. Al tocar Siguiente sobre una serie
se llega al descanso; al tocar Siguiente sobre el descanso se llega a la serie
que viene.

- Cuenta regresiva desde el `rest_seconds` del ejercicio.
- El tiempo se calcula contra el momento en que se entro al paso, no
  descontando de a un segundo. Asi el numero es correcto aunque el hilo de JS se
  haya trabado o la app haya estado en segundo plano.
- Volver atras muestra la serie que se acaba de cargar, editable. Volver a
  avanzar retoma la cuenta donde iba, no la reinicia.
- Al llegar a cero, vibracion y aviso visual. **No avanza solo**: cambiar de
  pantalla sin que el usuario toque nada, en medio del gimnasio, es peor que
  esperar. Sin notificacion del sistema por ahora, para no sumar dependencia ni
  pedir permisos.
- Sin `rest_seconds` (el usuario eligio "Sin") no se genera el paso.
- Hay descanso **tambien al pasar de un ejercicio al siguiente**, usando el del
  ejercicio que acaba de terminar. No hay descanso despues de la ultima serie
  del ultimo ejercicio: no queda nada para lo que descansar.
- El descanso no se persiste: es estado efimero de la pantalla. Si el usuario
  cierra la app, al volver no hay temporizador corriendo.

### 6.4 Terminar

Setea `finished_at`. Resumen de la sesion: duracion, series totales, volumen
(suma de peso por reps) y ejercicios tocados.

## 7. Fuera de alcance

- Progresion en el tiempo, PRs y 1RM estimado. Son lecturas sobre `session_sets`
  y merecen su propio spec una vez que haya datos reales.
- Agregar durante la sesion un ejercicio que no estaba en el dia. El modelo lo
  soporta (`session_sets.exercise_id` no exige que el ejercicio pertenezca al
  dia), falta la interfaz.
- Descanso variable por serie (hoy es un tiempo fijo por ejercicio).
- Registrar el descanso real que tomo el usuario.
- Superseries y series descendentes.
- Notas por ejercicio o por sesion.
- Sustituir un ejercicio dejando registro de que reemplazo a cual.
