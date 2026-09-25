Texto de una línea para nombres de ejercicio. **Un nombre de ejercicio nunca hace salto de línea**: si entra, queda quieto; si no entra, se desplaza de derecha a izquierda como una cinta (marquee), lento (28 px/s), con una pausa de 2 s en la posición inicial al comienzo de cada vuelta. Dos copias separadas 40 px hacen que el reinicio no se note. Con `prefers-reduced-motion` no se anima y muestra puntos suspensivos.

```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
  <i data-lucide="dumbbell"></i>
  <MarqueeText text="Curl de bíceps con mancuernas en banco inclinado"
    style={{ flex: 1, font: 'var(--fw-semibold) 16px var(--font-sans)', color: 'var(--text-primary)' }} />
</div>
```

Hereda tipografía y color del contenedor o de `style`. Dentro de una fila, dale `flex: 1` (ya trae `min-width: 0`) para que ocupe lo que dejan los íconos. Usalo en todo lugar que muestre el nombre de un ejercicio: listas del día, buscador, tarjeta del ejercicio elegido, título de la sesión e historial. No lo uses para párrafos ni para textos que pueden ocupar varias líneas.
