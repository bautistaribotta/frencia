import React from 'react';

const CSS = `
.frencia-rest{display:flex;align-items:center;gap:18px;padding:16px 18px;border-radius:var(--radius-xl);background:var(--surface-green-soft);border:1px solid var(--surface-green-line)}
.frencia-rest__ring{position:relative;flex-shrink:0}
.frencia-rest__ring svg{display:block;transform:rotate(-90deg)}
.frencia-rest__num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.frencia-rest__digits{font-family:var(--font-mono);font-weight:var(--fw-bold);font-size:24px;color:var(--text-primary);font-variant-numeric:tabular-nums}
.frencia-rest__of{font-family:var(--font-mono);font-size:10px;color:var(--text-tertiary);letter-spacing:var(--ls-wide)}
.frencia-rest__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}
.frencia-rest__cap{font-family:var(--font-mono);font-weight:var(--fw-semibold);font-size:11px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--accent-text)}
.frencia-rest__next{font-family:var(--font-sans);font-size:14px;color:var(--text-secondary);line-height:1.35}
.frencia-rest__acts{display:flex;flex-wrap:wrap;gap:8px}
.frencia-rest__btn{height:44px;padding:0 14px;border-radius:var(--radius-md);border:1px solid var(--border-default);background:transparent;color:var(--text-primary);font-family:var(--font-sans);font-weight:var(--fw-semibold);font-size:14px;white-space:nowrap;cursor:pointer;-webkit-tap-highlight-color:transparent}
.frencia-rest__btn:active{transform:scale(var(--press-scale))}
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-rest-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-rest-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

const pad = (n) => String(n).padStart(2, '0');
const clock = (sec) => `${Math.floor(sec / 60)}:${pad(sec % 60)}`;

/** Descanso: anillo verde que se vacía, cuenta regresiva. No se registra como dato de la serie. */
export function RestRing({ total = 120, remaining, running = true, next, onSkip, onDone, size = 108, className = '', ...rest }) {
  const [left, setLeft] = React.useState(remaining != null ? remaining : total);
  const [tot, setTot] = React.useState(total);
  React.useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setLeft((l) => {
      if (l <= 1) { clearInterval(id); onDone && onDone(); return 0; }
      return l - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running]);

  const stroke = 8, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const frac = tot ? left / tot : 0;
  return (
    <div className={['frencia-rest', className].filter(Boolean).join(' ')} {...rest}>
      <div className="frencia-rest__ring" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--data-track)" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - frac)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div className="frencia-rest__num">
          <span className="frencia-rest__digits">{clock(left)}</span>
          <span className="frencia-rest__of">de {clock(tot)}</span>
        </div>
      </div>
      <div className="frencia-rest__body">
        <span className="frencia-rest__cap">Descanso</span>
        {next ? <span className="frencia-rest__next">{next}</span> : null}
        <div className="frencia-rest__acts">
          <button type="button" className="frencia-rest__btn" onClick={() => { setLeft((l) => l + 15); setTot((t) => t + 15); }}>+15 s</button>
          <button type="button" className="frencia-rest__btn" onClick={onSkip}>Saltar</button>
        </div>
      </div>
    </div>
  );
}
