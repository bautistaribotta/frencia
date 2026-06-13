import React from 'react';

const CSS = `
.heft-seg {
  display: inline-flex; padding: 4px; gap: 4px;
  background: var(--surface-inset); border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}
.heft-seg--full { display: flex; width: 100%; }
.heft-seg__opt {
  flex: 1; border: none; cursor: pointer; white-space: nowrap;
  padding: 8px 16px; border-radius: var(--radius-sm);
  font-family: var(--font-sans); font-weight: var(--fw-semibold); font-size: 14px;
  background: transparent; color: var(--text-tertiary);
  transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
}
.heft-seg__opt svg { width: 16px; height: 16px; stroke-width: 2; }
.heft-seg__opt:hover { color: var(--text-secondary); }
.heft-seg__opt--active { background: var(--surface-card-elevated); color: var(--text-primary); box-shadow: var(--shadow-sm); }
.heft-seg--accent .heft-seg__opt--active { background: var(--accent); color: var(--text-on-accent); }
`;

if (typeof document !== 'undefined' && !document.getElementById('heft-seg-css')) {
  const s = document.createElement('style');
  s.id = 'heft-seg-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/** iOS-style segmented control for switching views. */
export function SegmentedControl({ options = [], value, onChange, fullWidth = false, accent = false, className = '', ...rest }) {
  const cls = ['heft-seg', fullWidth ? 'heft-seg--full' : '', accent ? 'heft-seg--accent' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls} role="tablist" {...rest}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const lbl = typeof opt === 'string' ? opt : opt.label;
        const icon = typeof opt === 'string' ? null : opt.icon;
        return (
          <button
            key={val}
            role="tab"
            aria-selected={val === value}
            className={`heft-seg__opt ${val === value ? 'heft-seg__opt--active' : ''}`}
            onClick={() => onChange && onChange(val)}
          >
            {icon ? <i data-lucide={icon}></i> : null}{lbl}
          </button>
        );
      })}
    </div>
  );
}
