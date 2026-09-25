# Texto en cinta (marquee)

Estado: implementado
Fecha: 2026-09-25

## 1. Problema

Los nombres de ejercicio pueden ser largos ("Curl de biceps con mancuernas en
banco inclinado"). En los lugares angostos se cortaban con puntos suspensivos,
y en la tarjeta del ejercicio al editarlo se partian en dos lineas. Con puntos
suspensivos el nombre no se puede leer entero; con salto de linea las filas
cambian de alto y la lista pierde ritmo.

## 2. Decision

Un nombre de ejercicio **nunca hace salto de linea**. Si entra en el ancho
disponible se muestra quieto. Si no entra, se desplaza como una cinta
(patron conocido como *marquee* o *ticker*) para mostrarse completo.

Componente: `MarqueeText` en `src/components/MarqueeText.tsx`.

## 3. Comportamiento

| Aspecto | Valor |
|---|---|
| Cuando se mueve | Solo si el texto mide mas que su caja (medio pixel de tolerancia) |
| Direccion | De derecha a izquierda |
| Velocidad | 28 px/s, lineal. Lento a proposito: se tiene que poder leer en movimiento |
| Pausa | 2 s al comienzo de cada vuelta, con el texto en su posicion inicial |
| Continuidad | Dos copias seguidas, separadas 40 px. Cuando la primera sale, la segunda ocupa su lugar y el reinicio no se nota |
| Reducir movimiento | Con la preferencia del sistema activada no se anima: vuelve a una linea con puntos suspensivos |
| Accesibilidad | El lector de pantalla lee el nombre una sola vez; la segunda copia esta oculta |

### 3.1 Detalle de implementacion

- Un medidor invisible renderiza el texto entero dentro de una fila de 10000 px
  para saber cuanto ocupa sin cortar.
- Cada copia y la cinta llevan ancho explicito. En iOS el texto se mide contra
  el ancho del padre, y sin eso la copia se partia en dos lineas en vez de
  salirse de la caja.
- La animacion corre en el hilo de UI (Reanimated): `withRepeat` de una
  secuencia pausa, desplazamiento y vuelta a 0 sin animar.

## 4. Donde se usa

Todo lugar que muestra el nombre de un ejercicio:

| Pantalla | Lugar |
|---|---|
| Crear y editar dia | Filas de la lista de ejercicios (`DraggableRowList`) |
| Buscador de ejercicios | Filas de resultados y tarjeta del ejercicio elegido (`ExercisePickerModal`) |
| Sesion | Titulo del ejercicio en curso y menu del ejercicio |
| Detalle del historial | Titulo de cada ejercicio |

## 5. API

```tsx
<MarqueeText text={ejercicio.name} role="subtitle" boxStyle={{ flex: 1 }} />
```

| Prop | Uso |
|---|---|
| `text` | Texto a mostrar |
| `role`, `color` | Igual que `FrenciaText` |
| `style` | Estilo del texto |
| `boxStyle` | Estilo de la caja que recorta; `flex: 1` cuando va dentro de una fila |

## 6. Design system

Registrado en el proyecto Frencia de Claude Design como
`components/log/MarqueeText` (`.jsx`, `.d.ts` y `.prompt.md`).
