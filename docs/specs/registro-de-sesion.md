# Registro de sesion de entrenamiento

Estado: propuesto
Fecha: 2026-07-29

Depende de `programas-y-rutinas.md`, que define la jerarquia Programa > Rutina >
Ejercicio de rutina. Este spec cubre la ejecucion: que pasa cuando el usuario
toca Empezar.

## 1. Problema

Hoy la app permite planificar (crear rutinas con ejercicios, series, reps e
intensidad objetivo) pero no registrar. El boton Empezar del home no lleva a
ningun lado, y el paso 2 del onboarding ("Registra una sesion") esta bloqueado.

Sin registro no hay training log: no hay progresion, ni PRs, ni volumen, ni 1RM
estimado. Todo eso son lecturas derivadas de lo que efectivamente se levanto.

## 2. Concepto central: la fila de referencia

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

## 3. Reglas de negocio

1. Cada serie registra **peso, repeticiones e intensidad** (RIR o RPE, segun
   `profiles.medidor_esfuerzo`). Los tres son obligatorios para dar la serie por
   terminada.
2. La sesion es **libre**. La rutina precarga que ejercicios tocan, pero el
   usuario puede saltear ejercicios, agregar uno que no estaba, o hacer mas o
   menos series de las planificadas. La app no bloquea ni advierte.
3. Las series se agregan **de a una**. Al abrir un ejercicio hay una sola serie
   lista para completar; al terminarla aparece la siguiente. No se pre-generan
   filas vacias segun `routine_exercises.sets`, que pasa a ser solo una
   referencia visible ("planificado: 4 series").
4. La referencia es **serie por serie**: la serie 3 de hoy se compara contra la
   serie 3 de la vez pasada, no contra la mejor del ejercicio. Refleja la caida
   por fatiga dentro del ejercicio.
5. La referencia se busca en **la ultima sesion terminada de esta misma rutina**.
   Ver seccion 3.1 por el fallback.
6. Hay **como maximo una sesion en curso** por usuario, forzada en la base de
   datos igual que el programa activo.
7. Una sesion en curso se retoma donde quedo. Un entrenamiento dura una hora con
   la pantalla apagandose, salir de la app es normal y no debe perder nada.

### 3.1 Fallback de la referencia

Atar la referencia a la rutina da la comparacion mas limpia (mismo contexto, mismo
orden de ejercicios, misma fatiga acumulada), pero tiene un agujero: como las
rutinas cuelgan de un programa, estrenar un programa crea rutinas nuevas sin
historial. La fila de referencia queda vacia justo cuando mas se necesita.

Mitigacion, en dos niveles:

1. Ultima sesion terminada de **esta rutina** que incluya ese ejercicio.
2. Si no hay ninguna, ultima sesion terminada del usuario que incluya ese
   ejercicio, **en cualquier rutina**. Se muestra igual pero diferenciado
   visualmente (por ejemplo atenuado, o con la fecha explicita), para que quede
   claro que viene de otro contexto.

Si tampoco hay, no se muestra fila de referencia.

## 4. Modelo de datos

```
auth.users
  |
  +-- workout_sessions (id, user_id, routine_id, started_at, finished_at)
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
| `routine_id` | uuid null | FK a `routines` on delete set null. Nullable para que borrar una rutina no borre el historial |
| `started_at` | timestamptz | `now()` |
| `finished_at` | timestamptz null | `null` = sesion en curso |
| `created_at` | timestamptz | `now()` |

```sql
create unique index workout_sessions_una_en_curso
  on public.workout_sessions (user_id)
  where finished_at is null;
```

`routine_id` nullable con `on delete set null` es intencional: el historial de lo
que el usuario levanto sobrevive al borrado de la rutina que lo origino. Se
pierde el vinculo, no el dato.

### 4.2 `session_sets`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid pk | `gen_random_uuid()` |
| `session_id` | uuid | FK a `workout_sessions`, on delete cascade |
| `exercise_id` | uuid | FK a `exercises` |
| `set_index` | smallint | Numero de serie dentro del ejercicio, arranca en 1 |
| `weight_kg` | numeric | Siempre en kilos, ver 4.3 |
| `reps` | smallint | `> 0` |
| `intensity_kind` | text | `rir` o `rpe`, mismo check que `routine_exercises` |
| `intensity_value` | numeric | `>= -1`, mismo check que `routine_exercises` |
| `completed_at` | timestamptz | `now()` |

Indice para la consulta de referencia:

```sql
create index session_sets_session_ejercicio_idx
  on public.session_sets (session_id, exercise_id, set_index);
```

RLS por dueño en ambas tablas. `session_sets` valida via join a
`workout_sessions.user_id`.

### 4.3 Descanso entre series

El descanso se define **al agregar el ejercicio a la rutina**, no durante la
sesion. Es un tiempo fijo, igual para todas las series de ese ejercicio.

Nueva columna en `routine_exercises`:

| Columna | Tipo | Notas |
|---|---|---|
| `rest_seconds` | smallint null | `null` = sin descanso configurado. Check `> 0` |

Es opcional: si el usuario no lo define, la sesion no muestra temporizador para
ese ejercicio.

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

## 5. Consulta de la fila de referencia

Dado `routine_id` y `exercise_id`, traer las series de la ultima sesion
terminada de esa rutina que incluya ese ejercicio:

```sql
select s.set_index, s.weight_kg, s.reps, s.intensity_kind, s.intensity_value
from public.session_sets s
where s.session_id = (
  select ws.id
  from public.workout_sessions ws
  join public.session_sets ss on ss.session_id = ws.id
  where ws.user_id = (select auth.uid())
    and ws.routine_id = :routine_id
    and ws.finished_at is not null
    and ss.exercise_id = :exercise_id
  order by ws.finished_at desc
  limit 1
)
and s.exercise_id = :exercise_id
order by s.set_index;
```

Conviene traer la referencia de **todos** los ejercicios de la rutina al abrir la
sesion, en una sola consulta, y no una por ejercicio a medida que se avanza. Son
pocos datos y evita un ida y vuelta en medio del entrenamiento, cuando la
conexion del gimnasio suele ser mala.

## 6. Flujos de interfaz

### 6.1 Empezar

Desde el home, Empezar sobre una rutina crea una `workout_session` con
`finished_at` en null y abre la pantalla de sesion.

Si ya hay una sesion en curso, no se crea otra: se ofrece retomarla o
descartarla.

### 6.2 Pantalla de sesion

- Lista de los ejercicios de la rutina, en orden.
- Por ejercicio: series ya registradas, y una serie activa a completar.
- Sobre la serie activa, la fila de referencia (seccion 2).
- Acciones: registrar serie, saltear ejercicio, agregar un ejercicio que no
  estaba en la rutina.
- Cerrar la app y volver retoma exactamente en este estado.

### 6.3 Temporizador de descanso

Al registrar una serie de un ejercicio que tiene `rest_seconds` definido, arranca
una cuenta regresiva.

- Se muestra de forma persistente mientras corre, sin bloquear la pantalla: el
  usuario tiene que poder seguir viendo sus series y la fila de referencia.
- Se puede saltear en cualquier momento.
- Al llegar a cero, vibracion y aviso visual. Sin notificacion del sistema por
  ahora, para no sumar dependencia ni pedir permisos.
- Si el usuario registra la serie siguiente antes de que termine, el
  temporizador se cancela solo.
- El descanso no se persiste: es estado efimero de la pantalla. Si el usuario
  cierra la app, al volver no hay temporizador corriendo.

### 6.4 Terminar

Setea `finished_at`. Resumen de la sesion: duracion, series totales, volumen
(suma de peso por reps) y ejercicios tocados.

## 7. Fuera de alcance

- Progresion en el tiempo, PRs y 1RM estimado. Son lecturas sobre `session_sets`
  y merecen su propio spec una vez que haya datos reales.
- Descanso variable por serie (hoy es un tiempo fijo por ejercicio).
- Registrar el descanso real que tomo el usuario.
- Superseries y series descendentes.
- Notas por ejercicio o por sesion.
- Sustituir un ejercicio dejando registro de que reemplazo a cual. Por ahora
  saltear y agregar alcanza.
