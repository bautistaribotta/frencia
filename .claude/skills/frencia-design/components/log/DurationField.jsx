import React from 'react';

const CSS = `
.frencia-dur{display:inline-flex;flex-direction:column;gap:6px;min-width:0}
.frencia-dur--full{display:flex;width:100%}
.frencia-dur__label{display:flex;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:11px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary)}
.frencia-dur__fmt{color:var(--text-disabled);letter-spacing:var(--ls-wide);text-transform:none}
.frencia-dur__row{display:flex;align-items:center;background:var(--surface-inset);border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;transition:border-color var(--dur-fast) var(--ease-out)}
.frencia-dur__row--focus{border-color:var(--accent)}
.frencia-dur__btn{display:inline-flex;align-items:center;justify-content:center;width:44px;height:48px;border:none;background:transparent;color:var(--text-secondary);cursor:pointer;flex-shrink:0;font-family:var(--font-mono);font-size:11px;font-weight:var(--fw-semibold);gap:1px;-webkit-tap-highlight-color:transparent;transition:background-color var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.frencia-dur__btn:hover:not(:disabled){background:var(--surface-chip);color:var(--accent)}
.frencia-dur__btn:disabled{opacity:.35;cursor:not-allowed}
.frencia-dur__btn svg{width:16px;height:16px;stroke-width:2.5}
.frencia-dur__well{position:relative;flex:1;min-width:92px;height:48px;display:flex;align-items:center;justify-content:center;cursor:text}
.frencia-dur__input{position:absolute;inset:0;width:100%;height:100%;opacity:0;border:0;padding:0;font-size:16px;cursor:text}
.frencia-dur__val{font-family:var(--font-mono);font-weight:var(--fw-bold);font-size:22px;color:var(--text-primary);font-variant-numeric:tabular-nums;pointer-events:none;white-space:nowrap}
.frencia-dur__dim{color:var(--text-disabled)}
.frencia-dur__caret{display:inline-block;width:2px;height:.95em;background:var(--accent);margin-left:2px;vertical-align:-.1em;animation:frencia-dur-blink 1s steps(1) infinite}
@keyframes frencia-dur-blink{50%{opacity:0}}
.frencia-dur--lg .frencia-dur__val{font-size:28px}
.frencia-dur--lg .frencia-dur__btn,.frencia-dur--lg .frencia-dur__well{height:56px}
.frencia-dur--lg .frencia-dur__btn{width:56px}
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-dur-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-dur-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

const pad = (n) => String(n).padStart(2, '0');
function clock(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
function stepLabel(step) { return step < 60 ? `${step} s` : `${Math.round(step / 60)} min`; }

/**
 * Campo de duración. Escritura directa estilo temporizador de iOS (los dígitos
 * entran por la derecha: 4-5 → 0:45, 1-3-0 → 1:30) + ajuste rápido ± step.
 */
export function DurationField({
  label, value, onChange, step = 5, allowHours = false, size = 'md',
  fullWidth = false, showSteps = true, className = '', ...rest
}) {
  const maxDigits = allowHours ? 6 : 4;
  const max = allowHours ? 359999 : 3599;
  const [focus, setFocus] = React.useState(false);
  const [buf, setBuf] = React.useState('');

  const clamp = (v) => Math.max(0, Math.min(max, Math.round(v)));
  const emit = (v) => onChange && onChange(clamp(v));
  const toSec = (digits) => {
    const d = digits.padStart(maxDigits, '0');
    if (allowHours) return +d.slice(0, 2) * 3600 + +d.slice(2, 4) * 60 + +d.slice(4, 6);
    return +d.slice(0, 2) * 60 + +d.slice(2, 4);
  };
  const commit = () => { if (buf) emit(toSec(buf)); setBuf(''); setFocus(false); };

  let display;
  if (focus) {
    const padded = buf.padStart(maxDigits, '0');
    const firstTyped = maxDigits - buf.length;
    const chars = [];
    for (let i = 0; i < maxDigits; i++) {
      if (i > 0 && i % 2 === 0) chars.push(<span key={'c' + i} className={i <= firstTyped ? 'frencia-dur__dim' : ''}>:</span>);
      chars.push(<span key={i} className={i < firstTyped ? 'frencia-dur__dim' : ''}>{padded[i]}</span>);
    }
    display = <span className="frencia-dur__val">{chars}<span className="frencia-dur__caret"></span></span>;
  } else if (value == null) {
    display = <span className="frencia-dur__val frencia-dur__dim">{allowHours ? 'h:mm:ss' : 'm:ss'}</span>;
  } else {
    display = <span className="frencia-dur__val">{clock(value)}</span>;
  }

  const cls = ['frencia-dur', `frencia-dur--${size}`, fullWidth ? 'frencia-dur--full' : '', className].filter(Boolean).join(' ');
  const v = value || 0;
  return (
    <div className={cls} {...rest}>
      {label ? <span className="frencia-dur__label"><span>{label}</span><span className="frencia-dur__fmt">{allowHours ? 'h:mm:ss' : 'm:ss'}</span></span> : null}
      <div className={'frencia-dur__row' + (focus ? ' frencia-dur__row--focus' : '')}>
        {showSteps ? (
          <button type="button" className="frencia-dur__btn" onClick={() => emit(v - step)} disabled={v <= 0} aria-label={`menos ${stepLabel(step)}`}>
            <span style={{ display: 'inline-flex' }}><i data-lucide="minus"></i></span>{stepLabel(step).replace(' ', '')}
          </button>
        ) : null}
        <label className="frencia-dur__well">
          {display}
          <input
            className="frencia-dur__input" inputMode="numeric" pattern="[0-9]*" autoComplete="off"
            aria-label={label || 'Duración'} value={buf}
            onFocus={() => { setBuf(''); setFocus(true); }}
            onBlur={commit}
            onChange={(e) => setBuf(e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, maxDigits))}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') { setBuf(''); e.currentTarget.blur(); } }}
          />
        </label>
        {showSteps ? (
          <button type="button" className="frencia-dur__btn" onClick={() => emit(v + step)} disabled={v >= max} aria-label={`más ${stepLabel(step)}`}>
            <span style={{ display: 'inline-flex' }}><i data-lucide="plus"></i></span>{stepLabel(step).replace(' ', '')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
