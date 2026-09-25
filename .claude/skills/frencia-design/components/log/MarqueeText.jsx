import React from 'react';

const CSS = `
.frencia-mq{position:relative;display:block;overflow:hidden;white-space:nowrap;min-width:0}
.frencia-mq__still{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.frencia-mq__track{display:inline-flex;will-change:transform}
.frencia-mq__copy{flex-shrink:0;white-space:nowrap}
.frencia-mq__gap{flex-shrink:0;width:40px}
.frencia-mq__measure{position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;left:0;top:0}
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-mq-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-mq-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

// Pixeles por segundo: lento, se tiene que poder leer en movimiento.
const SPEED = 28;
// Pausa al comienzo de cada vuelta, con el texto en su posicion inicial.
const PAUSE_MS = 2000;
// Espacio entre el final del texto y la copia que lo sigue.
const GAP = 40;

/**
 * Texto de una linea que nunca hace salto de linea. Si entra, queda quieto.
 * Si no entra, se desplaza de derecha a izquierda como una cinta (marquee):
 * dos copias seguidas para que el reinicio no se note, con una pausa de 2 s al
 * comienzo de cada vuelta. Con prefers-reduced-motion vuelve a los puntos
 * suspensivos. Se usa en todo nombre de ejercicio.
 */
export function MarqueeText({ text, className = '', style, ...rest }) {
  const boxRef = React.useRef(null);
  const measureRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const [overflow, setOverflow] = React.useState(0);
  const reduce = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  React.useLayoutEffect(() => {
    const box = boxRef.current, m = measureRef.current;
    if (!box || !m) return undefined;
    const check = () => {
      const tw = m.getBoundingClientRect().width;
      const bw = box.getBoundingClientRect().width;
      setOverflow(tw > bw + 0.5 ? tw : 0);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(box);
    return () => ro.disconnect();
  }, [text]);

  const run = overflow > 0 && !reduce;

  React.useEffect(() => {
    if (!run || !trackRef.current) return undefined;
    const dist = overflow + GAP;
    const total = PAUSE_MS + (dist / SPEED) * 1000;
    const anim = trackRef.current.animate([
      { transform: 'translateX(0)', offset: 0 },
      { transform: 'translateX(0)', offset: PAUSE_MS / total },
      { transform: `translateX(${-dist}px)`, offset: 1 },
    ], { duration: total, iterations: Infinity, easing: 'linear' });
    return () => anim.cancel();
  }, [run, overflow]);

  return (
    <span ref={boxRef} className={['frencia-mq', className].filter(Boolean).join(' ')} style={style} title={text} aria-label={text} {...rest}>
      <span ref={measureRef} className="frencia-mq__measure" aria-hidden="true">{text}</span>
      {run ? (
        <span ref={trackRef} className="frencia-mq__track" aria-hidden="true">
          <span className="frencia-mq__copy">{text}</span>
          <span className="frencia-mq__gap" />
          <span className="frencia-mq__copy">{text}</span>
        </span>
      ) : (
        <span className="frencia-mq__still" aria-hidden="true">{text}</span>
      )}
    </span>
  );
}
