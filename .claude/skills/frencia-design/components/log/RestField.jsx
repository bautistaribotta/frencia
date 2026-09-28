import React from 'react';

const ITEM = 44;
const VISIBLE = 7;
const MAX = 10 * 60 + 55;
const MINS = Array.from({ length: Math.floor(MAX / 60) + 1 }, (_, i) => i);
const SECS = Array.from({ length: 12 }, (_, i) => i * 5);

const CSS = `
.frencia-restfield{display:flex;flex-direction:column;gap:6px;width:100%}
.frencia-restfield__label{font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:11px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary)}
.frencia-restfield__field{display:flex;align-items:center;gap:12px;height:56px;padding:0 16px;border-radius:var(--radius-md);background:var(--surface-inset);border:1px solid var(--border-subtle);color:var(--text-tertiary);cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent;transition:background var(--dur-fast) var(--ease-out)}
.frencia-restfield__field:active{background:var(--surface-card-elevated)}
.frencia-restfield__field svg{width:20px;height:20px;flex-shrink:0}
.frencia-restfield__field svg:last-child{width:18px;height:18px}
.frencia-restfield__val{flex:1;font-family:var(--font-mono);font-weight:var(--fw-bold);font-size:28px;line-height:34px;color:var(--text-primary);font-variant-numeric:tabular-nums}
.frencia-restfield__none{flex:1;font:var(--text-body);color:var(--text-secondary)}
.frencia-restfield__overlay{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;justify-content:flex-end}
.frencia-restfield__scrim{flex:1;background:oklch(0 0 0 / 0.6);border:0;padding:0;cursor:pointer}
.frencia-restfield__sheet{display:flex;flex-direction:column;gap:20px;padding:20px 20px 40px;background:var(--surface-raised);border-radius:var(--radius-2xl) var(--radius-2xl) 0 0}
.frencia-restfield__head{display:flex;flex-direction:column;gap:4px;text-align:center}
.frencia-restfield__title{font:var(--text-title);color:var(--text-primary);margin:0}
.frencia-restfield__hint{font:var(--text-body-sm);color:var(--text-tertiary)}
.frencia-restfield__stage{position:relative;display:flex;align-items:center;justify-content:center;gap:4px;height:${ITEM * VISIBLE}px}
.frencia-restfield__bar{position:absolute;left:0;right:0;top:${(ITEM * VISIBLE - ITEM) / 2}px;height:${ITEM}px;border-radius:var(--radius-md);background:var(--surface-card-elevated);border:1px solid var(--border-subtle);pointer-events:none}
.frencia-restfield__wheel{position:relative;width:64px;height:100%;overflow-y:auto;scroll-snap-type:y mandatory;scrollbar-width:none;padding:${(ITEM * VISIBLE - ITEM) / 2}px 0;box-sizing:border-box;-webkit-mask-image:linear-gradient(to bottom,oklch(0 0 0 / 0.05),oklch(0 0 0) 42%,oklch(0 0 0) 58%,oklch(0 0 0 / 0.05));mask-image:linear-gradient(to bottom,oklch(0 0 0 / 0.05),oklch(0 0 0) 42%,oklch(0 0 0) 58%,oklch(0 0 0 / 0.05))}
.frencia-restfield__wheel::-webkit-scrollbar{display:none}
.frencia-restfield__item{height:${ITEM}px;display:flex;align-items:center;justify-content:flex-end;scroll-snap-align:center;font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:28px;color:var(--text-primary);cursor:pointer;font-variant-numeric:tabular-nums}
.frencia-restfield__unit{position:relative;font-family:var(--font-mono);font-size:18px;color:var(--text-secondary);width:34px}
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-restfield-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-restfield-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

const pad2 = (n) => String(n).padStart(2, '0');
const toClock = (sec) => `${Math.floor(sec / 60)}:${pad2(sec % 60)}`;

// Una rueda: scroll con snap, el item centrado es el elegido. Tocar un item
// lo lleva al centro.
function Wheel({ values, index, onChange, label, render }) {
  const ref = React.useRef(null);
  const timer = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.scrollTop = index * ITEM;
    // Solo la posicion inicial: despues manda el scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const settle = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      onChange(Math.max(0, Math.min(values.length - 1, Math.round(ref.current.scrollTop / ITEM))));
    }, 90);
  };
  return (
    <div className="frencia-restfield__wheel" ref={ref} onScroll={settle} role="listbox" aria-label={label}>
      {values.map((v, i) => (
        <div key={v} role="option" aria-selected={i === index} className="frencia-restfield__item"
          onClick={() => ref.current && ref.current.scrollTo({ top: i * ITEM, behavior: 'smooth' })}>
          {render(v)}
        </div>
      ))}
    </div>
  );
}

/**
 * Descanso entre series. El campo muestra el valor y abre una hoja inferior
 * con ruedas de minutos y segundos (cada 5 s, hasta 10:55), como la edad y el
 * peso del perfil. 0:00 guarda null: sin descanso. La hoja se posiciona contra
 * el ancestro con position: relative más cercano (la pantalla).
 */
export function RestField({ label = 'Descanso entre series', value, onChange, className = '', ...rest }) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(0);
  React.useEffect(() => { window.lucide && window.lucide.createIcons(); });

  const openSheet = () => {
    setDraft(Math.max(0, Math.min(MAX, Math.round((value || 0) / 5) * 5)));
    setOpen(true);
  };
  const confirm = () => { onChange && onChange(draft > 0 ? draft : null); setOpen(false); };

  return (
    <div className={['frencia-restfield', className].filter(Boolean).join(' ')} {...rest}>
      {label ? <span className="frencia-restfield__label">{label}</span> : null}
      <button type="button" className="frencia-restfield__field" onClick={openSheet}
        aria-label={label + ': ' + (value ? toClock(value) : 'sin descanso')}>
        <i data-lucide="timer"></i>
        {value ? <span className="frencia-restfield__val">{toClock(value)}</span> : <span className="frencia-restfield__none">Sin descanso</span>}
        <i data-lucide="chevron-right"></i>
      </button>

      {open ? (
        <div className="frencia-restfield__overlay" role="dialog" aria-modal="true" aria-label={label}>
          <button type="button" className="frencia-restfield__scrim" aria-label="Cerrar sin cambiar el descanso" onClick={() => setOpen(false)}></button>
          <div className="frencia-restfield__sheet">
            <div className="frencia-restfield__head">
              <h3 className="frencia-restfield__title">{label}</h3>
              <span className="frencia-restfield__hint">En 0:00 queda sin descanso.</span>
            </div>
            <div className="frencia-restfield__stage">
              <div className="frencia-restfield__bar"></div>
              <Wheel values={MINS} index={Math.floor(draft / 60)} label="Minutos" render={(m) => m}
                onChange={(i) => setDraft((d) => MINS[i] * 60 + (d % 60))} />
              <span className="frencia-restfield__unit">min</span>
              <Wheel values={SECS} index={(draft % 60) / 5} label="Segundos" render={pad2}
                onChange={(i) => setDraft((d) => Math.floor(d / 60) * 60 + SECS[i])} />
              <span className="frencia-restfield__unit">s</span>
            </div>
            <ButtonListo onClick={confirm} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ButtonListo({ onClick }) {
  const NS = window.FrenciaDesignSystem_377129 || {};
  const Button = NS.Button;
  return Button
    ? <Button variant="primary" size="lg" fullWidth onClick={onClick}>Listo</Button>
    : <button type="button" onClick={onClick}>Listo</button>;
}
