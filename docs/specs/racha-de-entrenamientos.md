# Racha de entrenamientos

Estado: propuesto
Fecha: 2026-09-19

Depende de `rutinas-y-dias.md` (weekdays de cada dia de entrenamiento) y de
`registro-de-sesion.md` (sesiones terminadas en `workout_sessions`). No agrega
esquema: la racha es una lectura derivada de datos que ya existen.

## 1. Problema

En la esquina superior derecha del home hay un badge que dice "Dia 1",
hardcodeado, sin significado. Y "Dia 1" ademas es el nombre por defecto de un
dia de entrenamiento, asi que se leeria como "hoy toca el Dia 1" aunque el
usuario lo haya renombrado. En ese lugar conviene mostrar lo unico que cambia
por lo que hace el usuario: cuantos entrenamientos planificados seguidos lleva
sin faltar.

Mostrar el dia de la semana ahi se descarto: la linea del saludo ya tiene la
fecha (hoy tambien hardcodeada, "Jueves · 12 jun"; se corrige en este mismo
trabajo).

## 2. Definicion

La racha cuenta **sesiones planificadas cumplidas de forma ininterrumpida**. No
son dias calendario ni semanas: si la rutina es lunes, miercoles y viernes, una
racha de 6 son dos semanas completas. Los dias de descanso que el usuario
diseno no la afectan.

Un dia esta **planificado** si su weekday aparece en algun dia de entrenamiento
de la rutina activa. Un dia planificado esta **cumplido** si hay al menos una
sesion terminada (`finished_at` no nulo) cuya fecha local es ese dia.

## 3. Reglas de negocio

1. **Cualquier sesion cumple el dia.** Si el lunes tocaba Push e hizo Pull,
   igual entreno. No se exige que `training_day_id` sea el dia asignado a ese
   weekday. Deliberadamente permisivo: reordenar la semana no es faltar.
2. **Un dia planificado se pierde recien cuando termina.** Hoy pendiente no
   rompe la racha ni la suma; se muestra el fuego en gris hasta que entrene.
3. **Varias sesiones el mismo dia cuentan una vez.**
4. **Sesiones en dias no planificados no suman ni rompen.** La racha mide
   cumplimiento del plan, no volumen. (Decision reversible: si se quiere que
   sumen, es un cambio de una linea en el recorrido.)
5. **Dias de entrenamiento sin weekday asignado no participan.** No hay contra
   que medirlos.
6. **Sin rutina activa, o si la rutina no tiene ningun weekday, no hay racha.**
7. **Cambiar la rutina recalcula hacia atras con los weekdays actuales.** No se
   guarda ni se resetea nada a mano. Si el usuario agrega el martes y no
   entreno el martes pasado, la racha se acorta hasta ahi; es el precio de no
   tener estado. Predecible y sin migracion.
8. **Racha 0 se oculta.** El badge no aparece; nunca se muestra "0".
9. **Tope de un anio.** El recorrido no mira mas de 366 dias hacia atras. Una
   racha mayor se muestra igual como el numero alcanzado en ese tope.

## 4. Calculo

Entradas:

- `W`: conjunto de weekdays (0 = lunes .. 6 = domingo, la convencion de
  `training_day_weekdays`) de todos los dias de la rutina activa.
- `S`: conjunto de fechas locales (`YYYY-MM-DD`) con al menos una sesion
  terminada, de la mas reciente hacia atras.
- `hoy`: fecha local del dispositivo.

Recorrido, dia por dia desde `hoy` hacia atras:

```
racha = 0
pendienteHoy = false
para d desde hoy, retrocediendo hasta 366 dias:
  planificado = weekday(d) en W
  cumplido    = d en S
  si no planificado: continuar
  si cumplido:       racha += 1; continuar
  si d == hoy:       pendienteHoy = true; continuar
  cortar
```

Resultado: `{ racha, pendienteHoy }`. Es una funcion pura en `src/lib/streak.ts`
con tests unitarios sobre los casos de la seccion 3 (dia pendiente, sesion
extra en descanso, dos sesiones el mismo dia, rutina sin weekdays, cambio de
weekdays).

Zona horaria: todo en hora local del dispositivo. `finished_at` es
`timestamptz`; se convierte a fecha local antes de comparar. Una sesion que
termina a las 00:30 cuenta para el dia en que termino, no en el que empezo; es
el mismo criterio con que el historial agrupa por mes.

### 4.1 Consulta

Una lectura liviana, separada del historial paginado:

```sql
select finished_at
from workout_sessions
where user_id = auth.uid() and finished_at is not null
  and finished_at >= now() - interval '366 days'
order by finished_at desc
```

Los weekdays ya los trae el home para pintar las tarjetas de la rutina activa;
se reutilizan. Se recalcula cada vez que el home recupera el foco, igual que
las rutinas: al volver de terminar una sesion la racha ya refleja el dia.

Si la consulta falla, el badge se oculta. La racha no es critica: no se muestra
error ni reintento.

## 5. Interfaz

Reemplaza el badge "Dia 1" del home, misma posicion.

- Icono `flame` + numero. Sin texto "racha": el fuego con numero ya se entiende.
- **Encendido** (`tone="green"`): racha mayor a cero y hoy no esta pendiente
  (ya entreno hoy, o hoy no es dia planificado). El verde es el color de exito y
  completado del design system; el naranja queda reservado a intensidad.
- **En gris** (`tone="neutral"`): racha mayor a cero pero hoy es dia planificado
  y todavia no entreno. El numero es el de la racha vigente, que sigue viva.
- **Oculto**: racha cero, sin rutina activa, o consulta fallida.
- Accesibilidad: `accessibilityLabel` "Racha de N entrenamientos" y, en gris,
  "Racha de N entrenamientos, hoy pendiente".

En el mismo cambio, la linea de fecha del saludo pasa a mostrar la fecha real
del dispositivo con el formato ya usado en el historial ("Jue 12 jun" en
`history.tsx` usa dia corto; aqui va "Jueves · 12 jun", dia largo y mes corto).

## 6. Fuera de alcance

- Guardar la racha maxima historica ("mejor racha").
- Notificaciones o recordatorios cuando la racha esta por romperse.
- Dias de "perdon" o congelar la racha (vacaciones, enfermedad).
- Mostrar la racha en el historial o en el perfil.
