# Roadmap de funcionalidades

Estado: pendiente. Nada de lo que sigue esta implementado ni tiene fecha; falta
definir cuando se hace cada punto.
Fecha: 2026-09-18
Seguimiento: https://github.com/bautistaribotta/frencia/issues/21 (issue fijado)

Ideas acordadas para las proximas etapas. Cada una, cuando se encare, tendra su
propio spec en esta carpeta; aca queda solo el resumen y el porque.

## 1. Compartir rutinas entre usuarios

La identidad publica ya existe: `profiles.username` es unico. Es lo que un
usuario escribe para buscar a otro; el UUID de `profiles.id` queda interno.

### 1.1 Compartir por link (copia)

- El dueno genera un link a una rutina. Quien lo abre la ve en solo lectura y
  puede "copiar a mis rutinas".
- Esquema: tabla `routine_shares (routine_id, token, created_at)` y una funcion
  que clona rutina + dias + ejercicios al usuario destino.
- Sin amigos, seguidores ni permisos: funciona entre entrenador y alumno o
  entre dos amigos, compartiendo por WhatsApp.
- Es la primera capa: cubre la mayor parte del valor con poco trabajo.

### 1.2 Rutina "viva" (seguir una rutina)

- El alumno no copia sino que *sigue* la rutina: si el entrenador la cambia, al
  alumno le cambia.
- Requiere definir que pasa con las sesiones ya hechas contra un dia que
  despues se edito o se borro.
- Se hace despues de validar 1.1.

## 2. Sacarle jugo a los datos que ya se guardan

Nada de esto requiere esquema nuevo: `session_sets`, `exercise_muscles` y
`muscle_groups` ya tienen todo.

- **Progresion por ejercicio**: grafico de peso y reps a lo largo del tiempo
  para un ejercicio. Hoy solo se compara serie contra serie (fantasma).
- **Records personales**: mejor peso y mejor 1RM estimado (Epley) por
  ejercicio. Avisar "PR" en el momento en que se hace. El naranja del design
  system ya esta reservado para esta semantica.
- **Resumen al terminar la sesion**: volumen total, duracion, series hechas vs
  planificadas, PRs del dia. Hoy termina con un toast y vuelve a home.
- **Volumen semanal por grupo muscular**: "esta semana: 12 series de pecho, 4
  de espalda". Usa las relaciones musculares ya cargadas y sin uso en la UI.

## 3. Friccion en el gimnasio

- **Notificacion al terminar el descanso** con la pantalla apagada. Hoy
  `RestRing` vibra solo con la app en primer plano. Notificacion local con
  `expo-notifications`.
- **Notas por ejercicio** ("banco en posicion 3", "agarre ancho"). Columna
  `notes` en `training_day_exercises`.
- **Reemplazar ejercicio sobre la marcha** cuando la maquina esta ocupada, sin
  editar la rutina.
- **Modo offline completo**: la cola de series pendientes (ver
  `registro-de-sesion.md`) es el primer paso; el siguiente es poder abrir la
  sesion sin red, cacheando el plan del dia.

## 4. Peso corporal

- Registro de peso corporal con grafico.
- Permite relativizar los PRs (fuerza / peso corporal).

## 5. Orden sugerido

1. Compartir por link (1.1)
2. Progresion + PRs por ejercicio (2)
3. Notificacion de fin de descanso (3)
4. Resto de 3, peso corporal (4) y rutina viva (1.2)

Las dos primeras le dan valor a la app fuera del gimnasio; la tercera evita que
se abandone adentro.
