import React from 'react';

const CSS = `
.heft-tabbar {
  display: flex; align-items: flex-start; justify-content: space-around;
  background: color-mix(in srgb, var(--bg-app) 82%, transparent);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--divider);
  padding: 10px 8px calc(10px + env(safe-area-inset-bottom, 18px));
  position: relative;
}
.heft-tab {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  border: none; background: transparent; cursor: pointer; flex: 1;
  color: var(--text-tertiary); padding: 4px 0;
  -webkit-tap-highlight-color: transparent;
  transition: color var(--dur-base) var(--ease-out);
}
.heft-tab svg { width: 24px; height: 24px; stroke-width: 2; }
.heft-tab__label { font-family: var(--font-mono); font-weight: var(--fw-medium); font-size: 9px; letter-spacing: var(--ls-wide); text-transform: uppercase; }
.heft-tab--active { color: var(--accent); }
.heft-tab--fab {
  flex: 0 0 auto; margin-top: -28px;
}
.heft-tab--fab .heft-tab__btn {
  width: 56px; height: 56px; border-radius: var(--radius-circle);
  background: var(--accent); color: var(--text-on-accent);
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: var(--glow-green); border: 3px solid var(--bg-app);
  transition: transform var(--dur-fast) var(--ease-spring);
}
.heft-tab--fab .heft-tab__btn:active { transform: scale(0.94); }
.heft-tab--fab .heft-tab__btn svg { width: 26px; height: 26px; stroke-width: 2.5; }
`;

if (typeof document !== 'undefined' && !document.getElementById('heft-tabbar-css')) {
  const s = document.createElement('style');
  s.id = 'heft-tabbar-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** Bottom navigation bar with optional center action FAB. */
export function TabBar({ items = [], value, onChange, fab, className = '', ...rest }) {
  const cls = ['heft-tabbar', className].filter(Boolean).join(' ');
  const mid = Math.ceil(items.length / 2);
  const left = fab ? items.slice(0, mid) : items;
  const right = fab ? items.slice(mid) : [];

  const renderTab = (item) => (
    <button
      key={item.value}
      className={`heft-tab ${item.value === value ? 'heft-tab--active' : ''}`}
      onClick={() => onChange && onChange(item.value)}
    >
      <i data-lucide={item.icon}></i>
      <span className="heft-tab__label">{item.label}</span>
    </button>
  );

  return (
    <nav className={cls} {...rest}>
      {left.map(renderTab)}
      {fab ? (
        <div className="heft-tab heft-tab--fab">
          <button className="heft-tab__btn" onClick={fab.onClick} aria-label={fab.label || 'acción'}>
            <i data-lucide={fab.icon || 'plus'}></i>
          </button>
        </div>
      ) : null}
      {right.map(renderTab)}
    </nav>
  );
}
