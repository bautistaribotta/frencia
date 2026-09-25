import React from 'react';

const CSS = `
.frencia-dist{display:inline-flex;flex-direction:column;gap:6px;min-width:0}
.frencia-dist--full{display:flex;width:100%}
.frencia-dist__label{display:flex;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:11px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary)}
.frencia-dist__fmt{color:var(--text-disabled);letter-spacing:var(--ls-wide);text-transform:none}
.frencia-dist__row{display:flex;align-items:center;background:var(--surface-inset);border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;transition:border-color var(--dur-fast) var(--ease-out)}
.frencia-dist__row--focus{border-color:var(--accent)}
.frencia-dist__btn{display:inline-flex;align-items:center;justify-content:center;gap:1px;width:44px;height:48px;border:none;background:transparent;color:var(--text-secondary);cursor:pointer;flex-shrink:0;font-family:var(--font-mono);font-size:11px;font-weight:var(--fw-semibold);-webkit-tap-highlight-color:transparent;transition:background-color var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.frencia-dist__btn:hover:not(:disabled){background:var(--surface-chip);color:var(--accent)}
.frencia-dist__btn:disabled{opacity:.35;cursor:not-allowed}
.frencia-dist__btn svg{width:16px;height:16px;stroke-width:2.5}
.frencia-dist__well{flex:1;min-width:92px;height:48px;display:flex;align-items:baseline;justify-content:center;gap:4px;cursor:text;padding-top:10px;box-sizing:border-box}
.frencia-dist__input{border:0;background:transparent;outline:none;padding:0;text-align:right;font-family:var(--font-mono);font-weight:var(--fw-bold);font-size:22px;color:var(--text-primary);font-variant-numeric:tabular-nums;caret-color:var(--accent);min-width:2ch}
.frencia-dist__input::placeholder{color:var(--text-disabled)}
.frencia-dist__unit{font-family:var(--font-mono);font-size:12px;font-weight:var(--fw-medium);color:var(--text-tertiary)}
.frencia-dist--lg .frencia-dist__input{font-size:28px}
.frencia-dist--lg .frencia-dist__btn,.frencia-dist--lg .frencia-dist__well{height:56px}
.frencia-dist--lg .frencia-dist__btn{width:56px}
.frencia-dist--lg .frencia-dist__well{padding-top:12px}
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-dist-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-dist-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Campo de distancia. La unidad la decide el ejercicio (m para distancias
 * cortas) o la preferencia del usuario (km / mi). Acepta coma o punto.
 */
export function DistanceField({ label = 'Distancia', value, onChange, unit = 'km', step, size = 'md', fullWidth = false, className = '', ...rest }) {
  const isM = unit === 'm';
  const st = step != null ? step : (isM ? 10 : 0.1);
  const dec = isM ? 0 : 2;
  const fmt = (v) => (v == null ? '' : v.toFixed(dec));
  const [focus, setFocus] = React.useState(false);
  const [buf, setBuf] = React.useState('');

  const emit = (v) => onChange && onChange(Math.max(0, Number(Math.max(0, v).toFixed(dec))));
  const commit = () => {
    const n = parseFloat(buf.replace(',', '.'));
    if (!isNaN(n)) emit(n);
    setFocus(false);
  };
  const text = focus ? buf : fmt(value);
  const placeholder = isM ? '0' : '0.00';
  const width = Math.max(2, (text || placeholder).length) + 0.3 + 'ch';
  const v = value || 0;
  const stepTxt = isM ? `${st}` : `${st}`;
  const cls = ['frencia-dist', `frencia-dist--${size}`, fullWidth ? 'frencia-dist--full' : '', className].filter(Boolean).join(' ');

  return (
    <div className={cls} {...rest}>
      {label ? <span className="frencia-dist__label"><span>{label}</span><span className="frencia-dist__fmt">{unit}</span></span> : null}
      <div className={'frencia-dist__row' + (focus ? ' frencia-dist__row--focus' : '')}>
        <button type="button" className="frencia-dist__btn" onClick={() => emit(v - st)} disabled={v <= 0} aria-label={`menos ${st} ${unit}`}>
          <span style={{ display: 'inline-flex' }}><i data-lucide="minus"></i></span>{stepTxt}
        </button>
        <label className="frencia-dist__well">
          <input
            className="frencia-dist__input" style={{ width }} inputMode={isM ? 'numeric' : 'decimal'} autoComplete="off"
            aria-label={`${label} en ${unit}`} placeholder={placeholder} value={text}
            onFocus={(e) => { setBuf(fmt(value)); setFocus(true); const t = e.currentTarget; setTimeout(() => t.select(), 0); }}
            onBlur={commit}
            onChange={(e) => setBuf(e.target.value.replace(isM ? /[^\d]/g : /[^\d.,]/g, '').slice(0, 7))}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          />
          <span className="frencia-dist__unit">{unit}</span>
        </label>
        <button type="button" className="frencia-dist__btn" onClick={() => emit(v + st)} aria-label={`más ${st} ${unit}`}>
          <span style={{ display: 'inline-flex' }}><i data-lucide="plus"></i></span>{stepTxt}
        </button>
      </div>
    </div>
  );
}
