/* @ds-bundle: {"format":3,"namespace":"FrenciaDesignSystem_377129","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"MetricPill","sourcePath":"components/data/MetricPill.jsx"},{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"SetRow","sourcePath":"components/data/SetRow.jsx"},{"name":"StatTile","sourcePath":"components/data/StatTile.jsx"},{"name":"Stepper","sourcePath":"components/data/Stepper.jsx"},{"name":"Switch","sourcePath":"components/feedback/Switch.jsx"},{"name":"SegmentedControl","sourcePath":"components/navigation/SegmentedControl.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"2e78b45d6e19","components/core/Badge.jsx":"f89c573136c1","components/core/Button.jsx":"8768246df3be","components/core/Card.jsx":"a6572f38f36a","components/core/IconButton.jsx":"5baa1760df16","components/core/Tag.jsx":"adfcdcb88ea6","components/data/MetricPill.jsx":"ee2529e33d0d","components/data/ProgressBar.jsx":"c265fdda63e8","components/data/SetRow.jsx":"647cb2c445ec","components/data/StatTile.jsx":"7f0f414363d8","components/data/Stepper.jsx":"c627d0a3d601","components/feedback/Switch.jsx":"9b36bfeb3766","components/navigation/SegmentedControl.jsx":"7c4c72012384","components/navigation/TabBar.jsx":"375e8a3345aa","ui_kits/ios_app/HomeScreen.jsx":"cf5ccf9e29e2","ui_kits/ios_app/ProgressScreen.jsx":"539203701a59","ui_kits/ios_app/SessionStub.jsx":"fde3f1defff6","ui_kits/ios_app/WorkoutLogScreen.jsx":"c4f403dc4786","ui_kits/ios_app/data.js":"03f3d64c3a06","ui_kits/ios_app/ios-frame.jsx":"be3343be4b51"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FrenciaDesignSystem_377129 = window.FrenciaDesignSystem_377129 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-avatar {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: var(--radius-circle); overflow: hidden;
  background: var(--green-deep); color: var(--green-300);
  font-family: var(--font-sans); font-weight: var(--fw-bold);
  border: 1px solid var(--border-subtle); flex-shrink: 0;
  text-transform: uppercase; line-height: 1;
}
.frencia-avatar img { width: 100%; height: 100%; object-fit: cover; }
.frencia-avatar--xs { width: 28px; height: 28px; font-size: 11px; }
.frencia-avatar--sm { width: 36px; height: 36px; font-size: 13px; }
.frencia-avatar--md { width: 44px; height: 44px; font-size: 16px; }
.frencia-avatar--lg { width: 64px; height: 64px; font-size: 22px; }
.frencia-avatar--ring { box-shadow: 0 0 0 2px var(--bg-app), 0 0 0 4px var(--accent); }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-avatar-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-avatar-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('');
}

/** User avatar — image or initials fallback. */
function Avatar({
  src,
  name = '',
  size = 'md',
  ring = false,
  className = '',
  ...rest
}) {
  const cls = ['frencia-avatar', `frencia-avatar--${size}`, ring ? 'frencia-avatar--ring' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-weight: var(--fw-semibold);
  font-size: 11px; letter-spacing: var(--ls-wide); text-transform: uppercase;
  padding: 4px 9px; border-radius: var(--radius-sm);
  border: 1px solid transparent; line-height: 1; white-space: nowrap;
}
.frencia-badge svg { width: 12px; height: 12px; stroke-width: 2.25; }
.frencia-badge--neutral { background: var(--surface-chip); color: var(--text-secondary); }
.frencia-badge--green { background: var(--surface-green-soft); color: var(--accent-text); border-color: var(--surface-green-line); }
.frencia-badge--green-solid { background: var(--accent); color: var(--text-on-accent); }
.frencia-badge--orange { background: var(--surface-orange-soft); color: var(--intensity-text); border-color: var(--surface-orange-line); }
.frencia-badge--orange-solid { background: var(--intensity); color: var(--text-on-accent); }
.frencia-badge--danger { background: rgba(239,68,68,0.12); color: #FCA5A5; border-color: rgba(239,68,68,0.3); }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-badge-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-badge-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Compact status marker — RIR, PR, set type, state. Mono, uppercase. */
function Badge({
  tone = 'neutral',
  icon,
  children,
  className = '',
  ...rest
}) {
  const cls = ['frencia-badge', `frencia-badge--${tone}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), icon ? /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--space-3);
  font-family: var(--font-sans); font-weight: var(--fw-semibold);
  border: 1px solid transparent; border-radius: var(--radius-md);
  cursor: pointer; white-space: nowrap; text-decoration: none;
  transition: transform var(--dur-fast) var(--ease-spring),
              background var(--dur-base) var(--ease-out),
              box-shadow var(--dur-base) var(--ease-out),
              border-color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent; user-select: none;
}
.frencia-btn:active:not(:disabled) { transform: scale(var(--press-scale)); }
.frencia-btn:disabled { cursor: not-allowed; opacity: 0.45; }
.frencia-btn svg { width: 1.15em; height: 1.15em; stroke-width: 2; }

/* sizes */
.frencia-btn--sm { height: var(--control-h-sm); padding: 0 16px; font-size: 14px; }
.frencia-btn--md { height: var(--control-h-md); padding: 0 22px; font-size: 16px; }
.frencia-btn--lg { height: var(--control-h-lg); padding: 0 28px; font-size: 17px; }
.frencia-btn--full { width: 100%; }

/* primary — emerald w/ glow */
.frencia-btn--primary { background: var(--accent); color: var(--text-on-accent); box-shadow: var(--glow-green-soft); }
.frencia-btn--primary:hover:not(:disabled) { background: var(--accent-hover); box-shadow: var(--glow-green); }
.frencia-btn--primary:active:not(:disabled) { background: var(--accent-press); }

/* intensity — orange */
.frencia-btn--intensity { background: var(--intensity); color: var(--text-on-accent); }
.frencia-btn--intensity:hover:not(:disabled) { background: var(--intensity-hover); box-shadow: var(--glow-orange); }
.frencia-btn--intensity:active:not(:disabled) { background: var(--intensity-press); }

/* secondary — outlined surface */
.frencia-btn--secondary { background: var(--surface-card); color: var(--text-primary); border-color: var(--border-default); }
.frencia-btn--secondary:hover:not(:disabled) { background: var(--surface-card-elevated); border-color: var(--border-strong); }

/* ghost — text only */
.frencia-btn--ghost { background: transparent; color: var(--text-secondary); }
.frencia-btn--ghost:hover:not(:disabled) { background: var(--surface-chip); color: var(--text-primary); }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-btn-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-btn-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Frencia primary action button. Black label rides the accent fill.
 */
function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconRight,
  disabled = false,
  children,
  className = '',
  ...rest
}) {
  const cls = ['frencia-btn', `frencia-btn--${variant}`, `frencia-btn--${size}`, fullWidth ? 'frencia-btn--full' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    disabled: disabled
  }, rest), icon ? /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon
  }) : null, children ? /*#__PURE__*/React.createElement("span", null, children) : null, iconRight ? /*#__PURE__*/React.createElement("i", {
    "data-lucide": iconRight
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-card {
  background: var(--surface-card);
  border: 1px solid transparent;
  border-radius: var(--radius-xl);
  padding: var(--pad-card);
  transition: background var(--dur-base) var(--ease-out),
              border-color var(--dur-base) var(--ease-out),
              transform var(--dur-fast) var(--ease-spring);
}
.frencia-card--hairline { border-color: var(--border-subtle); }
.frencia-card--elevated { background: var(--surface-card-elevated); box-shadow: var(--shadow-md); }
.frencia-card--inset { background: var(--surface-inset); }
.frencia-card--green { background: var(--surface-green-soft); border-color: var(--surface-green-line); }
.frencia-card--orange { background: var(--surface-orange-soft); border-color: var(--surface-orange-line); }
.frencia-card--interactive { cursor: pointer; }
.frencia-card--interactive:active { transform: scale(0.99); }
.frencia-card--interactive:hover { border-color: var(--border-default); }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-card-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-card-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Surface container — the base building block for grouped content. */
function Card({
  variant = 'default',
  hairline = false,
  interactive = false,
  className = '',
  children,
  ...rest
}) {
  const cls = ['frencia-card', variant !== 'default' ? `frencia-card--${variant}` : '', hairline ? 'frencia-card--hairline' : '', interactive ? 'frencia-card--interactive' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-iconbtn {
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid transparent; cursor: pointer;
  border-radius: var(--radius-md);
  transition: transform var(--dur-fast) var(--ease-spring),
              background var(--dur-base) var(--ease-out),
              border-color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.frencia-iconbtn:active:not(:disabled) { transform: scale(var(--press-scale)); }
.frencia-iconbtn:disabled { opacity: 0.4; cursor: not-allowed; }
.frencia-iconbtn svg { stroke-width: 2; }
.frencia-iconbtn--round { border-radius: var(--radius-circle); }

.frencia-iconbtn--sm { width: 36px; height: 36px; }
.frencia-iconbtn--sm svg { width: 18px; height: 18px; }
.frencia-iconbtn--md { width: 44px; height: 44px; }
.frencia-iconbtn--md svg { width: 22px; height: 22px; }
.frencia-iconbtn--lg { width: 52px; height: 52px; }
.frencia-iconbtn--lg svg { width: 26px; height: 26px; }

.frencia-iconbtn--primary { background: var(--accent); color: var(--text-on-accent); box-shadow: var(--glow-green-soft); }
.frencia-iconbtn--primary:hover:not(:disabled) { background: var(--accent-hover); }
.frencia-iconbtn--surface { background: var(--surface-chip); color: var(--text-primary); border-color: var(--border-subtle); }
.frencia-iconbtn--surface:hover:not(:disabled) { background: var(--surface-card-elevated); }
.frencia-iconbtn--ghost { background: transparent; color: var(--text-secondary); }
.frencia-iconbtn--ghost:hover:not(:disabled) { background: var(--surface-chip); color: var(--text-primary); }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-iconbtn-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-iconbtn-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Square/round icon-only button. */
function IconButton({
  icon,
  variant = 'surface',
  size = 'md',
  round = false,
  disabled = false,
  className = '',
  ...rest
}) {
  const cls = ['frencia-iconbtn', `frencia-iconbtn--${variant}`, `frencia-iconbtn--${size}`, round ? 'frencia-iconbtn--round' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    disabled: disabled
  }, rest), /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-tag {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-sans); font-weight: var(--fw-medium); font-size: 13px;
  padding: 7px 14px; border-radius: var(--radius-pill);
  background: var(--surface-chip); color: var(--text-secondary);
  border: 1px solid transparent; cursor: default; line-height: 1;
  transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.frencia-tag--selectable { cursor: pointer; }
.frencia-tag--selectable:hover { background: var(--surface-card-elevated); color: var(--text-primary); }
.frencia-tag--selected { background: var(--surface-green-soft); color: var(--accent-text); border-color: var(--surface-green-line); }
.frencia-tag__dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; opacity: 0.9; }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-tag-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-tag-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Pill tag for muscle groups, categories, filters. */
function Tag({
  selected = false,
  selectable = false,
  dot = false,
  children,
  className = '',
  ...rest
}) {
  const cls = ['frencia-tag', selectable ? 'frencia-tag--selectable' : '', selected ? 'frencia-tag--selected' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-tag__dot"
  }) : null, children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/MetricPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-metricpill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-radius: var(--radius-lg);
  background: var(--surface-chip); border: 1px solid transparent;
}
.frencia-metricpill svg { width: 16px; height: 16px; stroke-width: 2; color: var(--text-tertiary); }
.frencia-metricpill__body { display: flex; flex-direction: column; line-height: 1.1; }
.frencia-metricpill__label {
  font-family: var(--font-mono); font-weight: var(--fw-medium); font-size: 9px;
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary);
}
.frencia-metricpill__value { font-family: var(--font-mono); font-weight: var(--fw-bold); font-size: 15px; color: var(--text-primary); font-variant-numeric: tabular-nums; }
.frencia-metricpill--inline { padding: 6px 12px; }
.frencia-metricpill--inline .frencia-metricpill__body { flex-direction: row; align-items: baseline; gap: 6px; }
.frencia-metricpill--green { background: var(--surface-green-soft); border-color: var(--surface-green-line); }
.frencia-metricpill--green svg, .frencia-metricpill--green .frencia-metricpill__value { color: var(--accent-text); }
.frencia-metricpill--orange { background: var(--surface-orange-soft); border-color: var(--surface-orange-line); }
.frencia-metricpill--orange svg, .frencia-metricpill--orange .frencia-metricpill__value { color: var(--intensity-text); }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-metricpill-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-metricpill-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Inline metric chip — icon + label + value. Rest timer, RIR, pace, etc. */
function MetricPill({
  icon,
  label,
  value,
  tone = 'neutral',
  layout = 'stack',
  className = '',
  ...rest
}) {
  const cls = ['frencia-metricpill', tone !== 'neutral' ? `frencia-metricpill--${tone}` : '', layout === 'inline' ? 'frencia-metricpill--inline' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), icon ? /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon
  }) : null, /*#__PURE__*/React.createElement("span", {
    className: "frencia-metricpill__body"
  }, label ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-metricpill__label"
  }, label) : null, /*#__PURE__*/React.createElement("span", {
    className: "frencia-metricpill__value"
  }, value)));
}
Object.assign(__ds_scope, { MetricPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/MetricPill.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-progress { display: flex; flex-direction: column; gap: 8px; }
.frencia-progress__head { display: flex; justify-content: space-between; align-items: baseline; }
.frencia-progress__label {
  font-family: var(--font-mono); font-weight: var(--fw-medium); font-size: 11px;
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary);
}
.frencia-progress__val { font-family: var(--font-mono); font-weight: var(--fw-semibold); font-size: 12px; color: var(--text-secondary); }
.frencia-progress__track {
  height: var(--h); background: var(--data-track); border-radius: var(--radius-pill);
  overflow: hidden; box-shadow: var(--shadow-inset);
}
.frencia-progress__fill {
  height: 100%; border-radius: var(--radius-pill);
  background: var(--accent); transition: width var(--dur-slow) var(--ease-out);
}
.frencia-progress--orange .frencia-progress__fill { background: var(--intensity); }
.frencia-progress--segmented .frencia-progress__track { display: flex; gap: 4px; background: transparent; box-shadow: none; }
.frencia-progress__seg { flex: 1; height: 100%; border-radius: var(--radius-sm); background: var(--data-track); }
.frencia-progress__seg--on { background: var(--accent); }
.frencia-progress--orange .frencia-progress__seg--on { background: var(--intensity); }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-progress-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-progress-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Progress / completion bar. Continuous or segmented (e.g. sets done). */
function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  tone = 'green',
  size = 'md',
  segments,
  className = '',
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const h = size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px';
  const cls = ['frencia-progress', tone === 'orange' ? 'frencia-progress--orange' : '', segments ? 'frencia-progress--segmented' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    style: {
      '--h': h
    }
  }, rest), label || showValue ? /*#__PURE__*/React.createElement("div", {
    className: "frencia-progress__head"
  }, label ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-progress__label"
  }, label) : /*#__PURE__*/React.createElement("span", null), showValue ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-progress__val"
  }, segments ? `${value}/${segments}` : `${Math.round(pct)}%`) : null) : null, /*#__PURE__*/React.createElement("div", {
    className: "frencia-progress__track"
  }, segments ? Array.from({
    length: segments
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `frencia-progress__seg ${i < value ? 'frencia-progress__seg--on' : ''}`
  })) : /*#__PURE__*/React.createElement("div", {
    className: "frencia-progress__fill",
    style: {
      width: `${pct}%`
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/SetRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-setrow {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: var(--radius-lg);
  background: var(--surface-card); border: 1px solid transparent;
  transition: background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.frencia-setrow--active { border-color: var(--surface-green-line); background: var(--surface-card-elevated); }
.frencia-setrow--done { background: var(--surface-green-soft); }
.frencia-setrow__idx {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-weight: var(--fw-bold); font-size: 13px;
  background: var(--surface-inset); color: var(--text-tertiary);
}
.frencia-setrow--active .frencia-setrow__idx { background: var(--accent); color: var(--text-on-accent); }
.frencia-setrow--done .frencia-setrow__idx { background: transparent; color: var(--accent-text); }
.frencia-setrow__main { flex: 1; display: flex; align-items: baseline; gap: 8px; }
.frencia-setrow__load { font-family: var(--font-mono); font-weight: var(--fw-bold); font-size: 19px; color: var(--text-primary); font-variant-numeric: tabular-nums; }
.frencia-setrow__x { font-family: var(--font-mono); color: var(--text-tertiary); font-size: 14px; }
.frencia-setrow__reps { font-family: var(--font-mono); font-weight: var(--fw-bold); font-size: 19px; color: var(--text-primary); font-variant-numeric: tabular-nums; }
.frencia-setrow__unit { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); margin-left: 2px; }
.frencia-setrow__meta { display: flex; align-items: center; gap: 8px; }
.frencia-setrow__rir {
  font-family: var(--font-mono); font-weight: var(--fw-semibold); font-size: 11px;
  letter-spacing: var(--ls-wide); text-transform: uppercase;
  padding: 3px 8px; border-radius: var(--radius-sm);
  background: var(--surface-orange-soft); color: var(--intensity-text); border: 1px solid var(--surface-orange-line);
}
.frencia-setrow__check {
  width: 36px; height: 36px; flex-shrink: 0; border-radius: var(--radius-md);
  display: inline-flex; align-items: center; justify-content: center;
  border: 1.5px solid var(--border-default); background: transparent; cursor: pointer;
  color: var(--text-tertiary);
  transition: all var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.frencia-setrow__check:active { transform: scale(var(--press-scale)); }
.frencia-setrow__check svg { width: 20px; height: 20px; stroke-width: 2.5; }
.frencia-setrow--done .frencia-setrow__check { background: var(--accent); border-color: var(--accent); color: var(--text-on-accent); }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-setrow-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-setrow-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** A single logged set: index · load × reps · RIR · completion toggle. */
function SetRow({
  index,
  load,
  reps,
  unit = 'kg',
  rir,
  state = 'pending',
  onToggle,
  className = '',
  ...rest
}) {
  const cls = ['frencia-setrow', state === 'active' ? 'frencia-setrow--active' : '', state === 'done' ? 'frencia-setrow--done' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "frencia-setrow__idx"
  }, index), /*#__PURE__*/React.createElement("div", {
    className: "frencia-setrow__main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-setrow__load"
  }, load, /*#__PURE__*/React.createElement("span", {
    className: "frencia-setrow__unit"
  }, unit)), /*#__PURE__*/React.createElement("span", {
    className: "frencia-setrow__x"
  }, "\xD7"), /*#__PURE__*/React.createElement("span", {
    className: "frencia-setrow__reps"
  }, reps, /*#__PURE__*/React.createElement("span", {
    className: "frencia-setrow__unit"
  }, "reps"))), /*#__PURE__*/React.createElement("div", {
    className: "frencia-setrow__meta"
  }, rir != null ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-setrow__rir"
  }, "RIR ", rir) : null, /*#__PURE__*/React.createElement("button", {
    className: "frencia-setrow__check",
    onClick: onToggle,
    "aria-label": "completar serie"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check"
  }))));
}
Object.assign(__ds_scope, { SetRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/SetRow.jsx", error: String((e && e.message) || e) }); }

// components/data/StatTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-stat { display: flex; flex-direction: column; gap: 6px; }
.frencia-stat__label {
  font-family: var(--font-mono); font-weight: var(--fw-medium); font-size: 11px;
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary);
}
.frencia-stat__value {
  font-family: var(--font-display); color: var(--text-primary);
  line-height: 0.9; display: flex; align-items: baseline; gap: 6px;
}
.frencia-stat--green .frencia-stat__value { color: var(--accent); }
.frencia-stat--orange .frencia-stat__value { color: var(--intensity); }
.frencia-stat__unit { font-family: var(--font-mono); font-weight: var(--fw-medium); color: var(--text-tertiary); }
.frencia-stat--sm .frencia-stat__value { font-size: 32px; } .frencia-stat--sm .frencia-stat__unit { font-size: 13px; }
.frencia-stat--md .frencia-stat__value { font-size: 48px; } .frencia-stat--md .frencia-stat__unit { font-size: 16px; }
.frencia-stat--lg .frencia-stat__value { font-size: 72px; } .frencia-stat--lg .frencia-stat__unit { font-size: 20px; }
.frencia-stat--xl .frencia-stat__value { font-size: 92px; } .frencia-stat--xl .frencia-stat__unit { font-size: 24px; }
.frencia-stat__delta {
  display: inline-flex; align-items: center; gap: 3px;
  font-family: var(--font-mono); font-weight: var(--fw-semibold); font-size: 13px;
}
.frencia-stat__delta--up { color: var(--accent-text); }
.frencia-stat__delta--down { color: #FCA5A5; }
.frencia-stat__delta svg { width: 13px; height: 13px; stroke-width: 2.5; }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-stat-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-stat-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Big-number data display — Frencia's signature metric. Anton numerals + mono caption. */
function StatTile({
  label,
  value,
  unit,
  delta,
  deltaDir,
  size = 'md',
  tone = 'default',
  className = '',
  ...rest
}) {
  const cls = ['frencia-stat', `frencia-stat--${size}`, tone !== 'default' ? `frencia-stat--${tone}` : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), label ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-stat__label"
  }, label) : null, /*#__PURE__*/React.createElement("span", {
    className: "frencia-stat__value"
  }, value, unit ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-stat__unit"
  }, unit) : null, delta != null ? /*#__PURE__*/React.createElement("span", {
    className: `frencia-stat__delta frencia-stat__delta--${deltaDir === 'down' ? 'down' : 'up'}`
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": deltaDir === 'down' ? 'arrow-down-right' : 'arrow-up-right'
  }), delta) : null));
}
Object.assign(__ds_scope, { StatTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatTile.jsx", error: String((e && e.message) || e) }); }

// components/data/Stepper.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-stepper { display: inline-flex; flex-direction: column; gap: 6px; }
.frencia-stepper__label {
  font-family: var(--font-mono); font-weight: var(--fw-medium); font-size: 11px;
  letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary);
}
.frencia-stepper__row {
  display: inline-flex; align-items: center; gap: 0;
  background: var(--surface-inset); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md); overflow: hidden;
}
.frencia-stepper__btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 48px; border: none; background: transparent;
  color: var(--text-secondary); cursor: pointer; flex-shrink: 0;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.frencia-stepper__btn:hover:not(:disabled) { background: var(--surface-chip); color: var(--accent); }
.frencia-stepper__btn:active:not(:disabled) { background: var(--surface-card-elevated); }
.frencia-stepper__btn:disabled { opacity: 0.35; cursor: not-allowed; }
.frencia-stepper__btn svg { width: 20px; height: 20px; stroke-width: 2.5; }
.frencia-stepper__val {
  min-width: 64px; text-align: center;
  font-family: var(--font-mono); font-weight: var(--fw-bold); font-size: 22px;
  color: var(--text-primary); font-variant-numeric: tabular-nums;
}
.frencia-stepper__unit { font-size: 12px; color: var(--text-tertiary); margin-left: 3px; font-weight: var(--fw-medium); }
.frencia-stepper--lg .frencia-stepper__val { font-size: 28px; min-width: 80px; }
.frencia-stepper--lg .frencia-stepper__btn { height: 56px; width: 52px; }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-stepper-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-stepper-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Numeric stepper for logging reps / load. Tabular mono value, ± controls. */
function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = Infinity,
  unit,
  size = 'md',
  precision = 0,
  className = '',
  ...rest
}) {
  const set = next => {
    const clamped = Math.max(min, Math.min(max, next));
    onChange && onChange(Number(clamped.toFixed(precision)));
  };
  const cls = ['frencia-stepper', `frencia-stepper--${size}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), label ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-stepper__label"
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    className: "frencia-stepper__row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "frencia-stepper__btn",
    onClick: () => set(value - step),
    disabled: value <= min,
    "aria-label": "menos"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "minus"
  })), /*#__PURE__*/React.createElement("span", {
    className: "frencia-stepper__val"
  }, value, unit ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-stepper__unit"
  }, unit) : null), /*#__PURE__*/React.createElement("button", {
    className: "frencia-stepper__btn",
    onClick: () => set(value + step),
    disabled: value >= max,
    "aria-label": "m\xE1s"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "plus"
  }))));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-switch {
  position: relative; display: inline-flex; align-items: center;
  width: 52px; height: 32px; border-radius: var(--radius-pill);
  background: var(--surface-chip); border: 1px solid var(--border-subtle);
  cursor: pointer; padding: 0; flex-shrink: 0;
  transition: background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.frencia-switch__thumb {
  position: absolute; left: 3px; width: 24px; height: 24px; border-radius: 50%;
  background: var(--ink-100); box-shadow: var(--shadow-sm);
  transition: transform var(--dur-base) var(--ease-spring);
}
.frencia-switch--on { background: var(--accent); border-color: var(--accent); }
.frencia-switch--on .frencia-switch__thumb { transform: translateX(20px); background: var(--ink-1000); }
.frencia-switch:disabled { opacity: 0.4; cursor: not-allowed; }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-switch-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-switch-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** iOS toggle switch. */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...rest
}) {
  const cls = ['frencia-switch', checked ? 'frencia-switch--on' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    role: "switch",
    "aria-checked": checked,
    className: cls,
    disabled: disabled,
    onClick: () => !disabled && onChange && onChange(!checked)
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "frencia-switch__thumb"
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-seg {
  display: inline-flex; padding: 4px; gap: 4px;
  background: var(--surface-inset); border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}
.frencia-seg--full { display: flex; width: 100%; }
.frencia-seg__opt {
  flex: 1; border: none; cursor: pointer; white-space: nowrap;
  padding: 8px 16px; border-radius: var(--radius-sm);
  font-family: var(--font-sans); font-weight: var(--fw-semibold); font-size: 14px;
  background: transparent; color: var(--text-tertiary);
  transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color: transparent; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
}
.frencia-seg__opt svg { width: 16px; height: 16px; stroke-width: 2; }
.frencia-seg__opt:hover { color: var(--text-secondary); }
.frencia-seg__opt--active { background: var(--surface-card-elevated); color: var(--text-primary); box-shadow: var(--shadow-sm); }
.frencia-seg--accent .frencia-seg__opt--active { background: var(--accent); color: var(--text-on-accent); }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-seg-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-seg-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** iOS-style segmented control for switching views. */
function SegmentedControl({
  options = [],
  value,
  onChange,
  fullWidth = false,
  accent = false,
  className = '',
  ...rest
}) {
  const cls = ['frencia-seg', fullWidth ? 'frencia-seg--full' : '', accent ? 'frencia-seg--accent' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    role: "tablist"
  }, rest), options.map(opt => {
    const val = typeof opt === 'string' ? opt : opt.value;
    const lbl = typeof opt === 'string' ? opt : opt.label;
    const icon = typeof opt === 'string' ? null : opt.icon;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      role: "tab",
      "aria-selected": val === value,
      className: `frencia-seg__opt ${val === value ? 'frencia-seg__opt--active' : ''}`,
      onClick: () => onChange && onChange(val)
    }, icon ? /*#__PURE__*/React.createElement("i", {
      "data-lucide": icon
    }) : null, lbl);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TabBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-tabbar {
  display: flex; align-items: flex-start; justify-content: space-around;
  background: color-mix(in srgb, var(--bg-app) 82%, transparent);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--divider);
  padding: 10px 8px calc(10px + env(safe-area-inset-bottom, 18px));
  position: relative;
}
.frencia-tab {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  border: none; background: transparent; cursor: pointer; flex: 1;
  color: var(--text-tertiary); padding: 4px 0;
  -webkit-tap-highlight-color: transparent;
  transition: color var(--dur-base) var(--ease-out);
}
.frencia-tab svg { width: 24px; height: 24px; stroke-width: 2; }
.frencia-tab__label { font-family: var(--font-mono); font-weight: var(--fw-medium); font-size: 9px; letter-spacing: var(--ls-wide); text-transform: uppercase; }
.frencia-tab--active { color: var(--accent); }
.frencia-tab--fab {
  flex: 0 0 auto; margin-top: -28px;
}
.frencia-tab--fab .frencia-tab__btn {
  width: 56px; height: 56px; border-radius: var(--radius-circle);
  background: var(--accent); color: var(--text-on-accent);
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: var(--glow-green); border: 3px solid var(--bg-app);
  transition: transform var(--dur-fast) var(--ease-spring);
}
.frencia-tab--fab .frencia-tab__btn:active { transform: scale(0.94); }
.frencia-tab--fab .frencia-tab__btn svg { width: 26px; height: 26px; stroke-width: 2.5; }
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-tabbar-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-tabbar-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Bottom navigation bar with optional center action FAB. */
function TabBar({
  items = [],
  value,
  onChange,
  fab,
  className = '',
  ...rest
}) {
  const cls = ['frencia-tabbar', className].filter(Boolean).join(' ');
  const mid = Math.ceil(items.length / 2);
  const left = fab ? items.slice(0, mid) : items;
  const right = fab ? items.slice(mid) : [];
  const renderTab = item => /*#__PURE__*/React.createElement("button", {
    key: item.value,
    className: `frencia-tab ${item.value === value ? 'frencia-tab--active' : ''}`,
    onClick: () => onChange && onChange(item.value)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": item.icon
  }), /*#__PURE__*/React.createElement("span", {
    className: "frencia-tab__label"
  }, item.label));
  return /*#__PURE__*/React.createElement("nav", _extends({
    className: cls
  }, rest), left.map(renderTab), fab ? /*#__PURE__*/React.createElement("div", {
    className: "frencia-tab frencia-tab--fab"
  }, /*#__PURE__*/React.createElement("button", {
    className: "frencia-tab__btn",
    onClick: fab.onClick,
    "aria-label": fab.label || 'acción'
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": fab.icon || 'plus'
  }))) : null, right.map(renderTab));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TabBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/HomeScreen.jsx
try { (() => {
function HomeScreen({
  onStart
}) {
  const {
    Avatar,
    Badge,
    Card,
    Button,
    StatTile,
    ProgressBar,
    Tag,
    MetricPill
  } = window.FrenciaDesignSystem_377129;
  const d = window.FRENCIA_DATA;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '56px 20px 120px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: d.user.name,
    size: "md",
    ring: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-subtitle)',
      color: 'var(--text-primary)'
    }
  }, "Hola, ", d.user.name.split(' ')[0]), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Jueves \xB7 12 jun"))), /*#__PURE__*/React.createElement(Badge, {
    tone: "orange",
    icon: "flame"
  }, d.user.streak, " d\xEDas")), /*#__PURE__*/React.createElement(Card, {
    variant: "elevated",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Sesi\xF3n de hoy"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-title)',
      color: 'var(--text-primary)',
      marginTop: 4
    }
  }, d.today.routine)), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "\xDAltima ", d.today.lastDone)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, d.today.tags.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    dot: true
  }, t))), /*#__PURE__*/React.createElement(ProgressBar, {
    segments: d.today.exercisesTotal,
    value: d.today.exercisesDone,
    label: "Ejercicios",
    showValue: true
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    icon: "play",
    fullWidth: true,
    onClick: onStart
  }, "Empezar entrenamiento")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label",
    style: {
      display: 'block',
      marginBottom: 10
    }
  }, "Esta semana"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Card, {
    hairline: true,
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    label: "Volumen",
    value: d.weekStats.volume,
    unit: d.weekStats.volumeUnit,
    size: "sm"
  })), /*#__PURE__*/React.createElement(Card, {
    hairline: true,
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    label: "Sesiones",
    value: d.weekStats.sessions,
    size: "sm",
    tone: "green"
  })), /*#__PURE__*/React.createElement(Card, {
    hairline: true,
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    label: "RIR medio",
    value: d.weekStats.rir,
    size: "sm"
  })))), /*#__PURE__*/React.createElement(Card, {
    variant: "orange",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label",
    style: {
      color: 'var(--intensity-text)'
    }
  }, "\xDAltimo PR \xB7 ", d.lastPR.date), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-bold) 18px var(--font-sans)',
      color: 'var(--text-primary)',
      marginTop: 4
    }
  }, d.lastPR.exercise)), /*#__PURE__*/React.createElement(StatTile, {
    value: d.lastPR.value,
    unit: d.lastPR.unit,
    size: "md",
    tone: "orange"
  })));
}
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/ProgressScreen.jsx
try { (() => {
function ProgressScreen() {
  const {
    Card,
    StatTile,
    SegmentedControl,
    Badge,
    Tag
  } = window.FrenciaDesignSystem_377129;
  const p = window.FRENCIA_DATA.progress;
  const [range, setRange] = React.useState('mes');
  const maxV = Math.max(...p.bars.map(b => b.v));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '56px 20px 120px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Progreso"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-title)',
      color: 'var(--text-primary)',
      marginTop: 4
    }
  }, p.exercise)), /*#__PURE__*/React.createElement(SegmentedControl, {
    fullWidth: true,
    value: range,
    onChange: setRange,
    options: [{
      value: 'semana',
      label: 'Semana'
    }, {
      value: 'mes',
      label: 'Mes'
    }, {
      value: 'año',
      label: 'Año'
    }]
  }), /*#__PURE__*/React.createElement(Card, {
    variant: "elevated",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    label: "1RM estimado",
    value: p.oneRM,
    unit: "kg",
    size: "lg",
    tone: "green",
    delta: p.oneRMDelta,
    deltaDir: "up"
  }), /*#__PURE__*/React.createElement(Badge, {
    tone: "green-solid",
    icon: "trending-up"
  }, "+18% / 6 sem")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      height: 120,
      paddingTop: 8
    }
  }, p.bars.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.label,
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      height: '100%',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: `${b.v / maxV * 100}%`,
      background: b.pr ? 'var(--intensity)' : 'var(--accent)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: b.pr ? 'var(--glow-orange)' : 'none',
      transition: 'height var(--dur-slow) var(--ease-out)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '10px var(--font-mono)',
      color: b.pr ? 'var(--intensity-text)' : 'var(--text-tertiary)',
      letterSpacing: 'var(--ls-wide)'
    }
  }, b.label))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label",
    style: {
      display: 'block',
      marginBottom: 10
    }
  }, "Historial de r\xE9cords"), /*#__PURE__*/React.createElement(Card, {
    variant: "inset",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      padding: 0,
      overflow: 'hidden'
    }
  }, p.prs.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      borderBottom: i < p.prs.length - 1 ? '1px solid var(--divider)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-bold) 17px var(--font-mono)',
      color: 'var(--text-primary)'
    }
  }, r.value, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--text-tertiary)'
    }
  }, r.unit, " \xD7 ", r.reps)), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label",
    style: {
      marginTop: 2
    }
  }, r.date, " \xB7 est. ", r.est, " kg")), i === 0 ? /*#__PURE__*/React.createElement(Badge, {
    tone: "orange-solid",
    icon: "flame"
  }, "PR") : /*#__PURE__*/React.createElement("span", {
    style: {
      font: '11px var(--font-mono)',
      color: 'var(--text-tertiary)'
    }
  }, "\u2014"))))));
}
window.ProgressScreen = ProgressScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/ProgressScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/SessionStub.jsx
try { (() => {
// app-bg colored circle that "cuts" a notch into the ticket
function Notch({
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: 'var(--bg-app)',
      ...style
    }
  });
}
function StubStat({
  label,
  value,
  unit,
  tone
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label",
    style: {
      fontSize: 9
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      fontSize: 18,
      color: tone || 'var(--text-primary)'
    }
  }, value, unit ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'var(--text-tertiary)',
      marginLeft: 2
    }
  }, unit) : null));
}
function SessionStub({
  onDone
}) {
  const {
    Button,
    Badge
  } = window.FrenciaDesignSystem_377129;
  const s = window.FRENCIA_DATA.session;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '52px 20px 120px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: 330
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: 'var(--surface-card-elevated)',
      borderTopLeftRadius: 'var(--radius-2xl)',
      borderTopRightRadius: 'var(--radius-2xl)',
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '26px 24px 20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 18,
      letterSpacing: 1,
      color: 'var(--text-primary)',
      textTransform: 'uppercase'
    }
  }, "FRENCIA"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--accent)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 38,
      lineHeight: 0.92,
      color: 'var(--accent)',
      textTransform: 'uppercase'
    }
  }, "Sesi\xF3n", /*#__PURE__*/React.createElement("br", null), "completa"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '11px var(--font-mono)',
      letterSpacing: 'var(--ls-wide)',
      color: 'var(--text-tertiary)',
      marginTop: 12
    }
  }, s.routine, " \xB7 ", s.date, " \xB7 ", s.time)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-around',
      padding: '4px 24px 22px',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 40,
      color: 'var(--text-primary)',
      lineHeight: 0.9
    }
  }, s.dur), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label",
    style: {
      fontSize: 9
    }
  }, "Duraci\xF3n")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      background: 'var(--divider)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 40,
      color: 'var(--text-primary)',
      lineHeight: 0.9
    }
  }, s.volume), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label",
    style: {
      fontSize: 9
    }
  }, "Volumen \xB7 ", s.volumeUnit))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 24
    }
  }, /*#__PURE__*/React.createElement(Notch, {
    style: {
      left: -11,
      top: 1
    }
  }), /*#__PURE__*/React.createElement(Notch, {
    style: {
      right: -11,
      top: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 18,
      right: 18,
      top: 12,
      borderTop: '2px dashed var(--border-default)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 16,
      padding: '18px 24px 8px'
    }
  }, /*#__PURE__*/React.createElement(StubStat, {
    label: "Ejercicios",
    value: s.exercises
  }), /*#__PURE__*/React.createElement(StubStat, {
    label: "Series",
    value: s.sets
  }), /*#__PURE__*/React.createElement(StubStat, {
    label: "RIR medio",
    value: s.rir,
    tone: "var(--accent)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 24px 4px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0
    }
  }, s.log.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '9px 0',
      borderBottom: i < s.log.length - 1 ? '1px solid var(--divider)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '13px var(--font-sans)',
      color: 'var(--text-secondary)',
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '11px var(--font-mono)',
      color: 'var(--text-tertiary)'
    }
  }, l.sets), l.name, l.pr ? /*#__PURE__*/React.createElement(Badge, {
    tone: "orange-solid"
  }, "PR") : null), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) 13px var(--font-mono)',
      color: 'var(--text-primary)'
    }
  }, l.top)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 24px 14px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: 46,
      backgroundImage: 'repeating-linear-gradient(90deg, var(--ink-100) 0 2px, transparent 2px 4px, var(--ink-100) 4px 5px, transparent 5px 9px, var(--ink-100) 9px 12px, transparent 12px 14px)',
      opacity: 0.92
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '11px var(--font-mono)',
      letterSpacing: 'var(--ls-widest)',
      color: 'var(--text-tertiary)'
    }
  }, s.id)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: -11,
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 4px'
    }
  }, Array.from({
    length: 11
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: 'var(--bg-app)'
    }
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      width: '100%',
      maxWidth: 330
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    icon: "share",
    style: {
      flex: 1
    }
  }, "Compartir"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    icon: "check",
    style: {
      flex: 1
    },
    onClick: onDone
  }, "Hecho")));
}
window.SessionStub = SessionStub;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/SessionStub.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/WorkoutLogScreen.jsx
try { (() => {
function WorkoutLogScreen({
  onFinish
}) {
  const {
    Card,
    Button,
    IconButton,
    StatTile,
    Stepper,
    SetRow,
    SegmentedControl,
    MetricPill,
    Badge,
    ProgressBar
  } = window.FrenciaDesignSystem_377129;
  const ex = window.FRENCIA_DATA.exercise;
  const [sets, setSets] = React.useState(() => ex.sets.map(s => ({
    ...s
  })));
  const active = sets.findIndex(s => s.state === 'active');
  const cur = active >= 0 ? sets[active] : null;
  const [peso, setPeso] = React.useState(cur ? cur.load : 85);
  const [reps, setReps] = React.useState(cur ? cur.reps : 6);
  const [rir, setRir] = React.useState('2');
  const [resting, setResting] = React.useState(false);
  const doneCount = sets.filter(s => s.state === 'done').length;
  const register = () => {
    if (active < 0) return;
    setSets(prev => prev.map((s, i) => {
      if (i === active) return {
        ...s,
        load: peso,
        reps,
        rir: Number(rir),
        state: 'done'
      };
      if (i === active + 1) return {
        ...s,
        state: 'active'
      };
      return s;
    }));
    const nx = sets[active + 1];
    if (nx) {
      setPeso(nx.load);
      setReps(nx.reps);
    }
    setResting(true);
    setTimeout(() => setResting(false), 2600);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '56px 20px 120px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Ejercicio 1 / 5 \xB7 ", ex.muscle), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-title)',
      color: 'var(--text-primary)',
      marginTop: 4
    }
  }, ex.name), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-data)',
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, "Objetivo ", ex.target, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)'
    }
  }, "\xB7 ", ex.note))), /*#__PURE__*/React.createElement(IconButton, {
    icon: "more-horizontal",
    variant: "surface"
  })), /*#__PURE__*/React.createElement(ProgressBar, {
    segments: sets.length,
    value: doneCount,
    tone: "green"
  }), resting ? /*#__PURE__*/React.createElement(Card, {
    variant: "green",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(MetricPill, {
    icon: "timer",
    label: "Descanso",
    value: "2:00",
    tone: "green"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body-sm)',
      color: 'var(--accent-text)'
    }
  }, "Respira. Siguiente serie pronto."), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => setResting(false)
  }, "Saltar")) : cur ? /*#__PURE__*/React.createElement(Card, {
    variant: "elevated",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-bold) 18px var(--font-sans)',
      color: 'var(--text-primary)'
    }
  }, "Serie ", active + 1), /*#__PURE__*/React.createElement(Badge, {
    tone: "green"
  }, "En curso")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    label: "Peso",
    value: peso,
    onChange: setPeso,
    step: 2.5,
    precision: 1,
    unit: "kg",
    size: "lg"
  }), /*#__PURE__*/React.createElement(Stepper, {
    label: "Reps",
    value: reps,
    onChange: setReps,
    step: 1,
    size: "lg"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "RIR \xB7 repeticiones en reserva"), /*#__PURE__*/React.createElement(SegmentedControl, {
    fullWidth: true,
    value: rir,
    onChange: setRir,
    options: [{
      value: '0',
      label: '0'
    }, {
      value: '1',
      label: '1'
    }, {
      value: '2',
      label: '2'
    }, {
      value: '3',
      label: '3'
    }, {
      value: '4',
      label: '4+'
    }]
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    icon: "check",
    fullWidth: true,
    onClick: register
  }, "Registrar serie")) : /*#__PURE__*/React.createElement(Card, {
    variant: "green",
    style: {
      textAlign: 'center',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 28,
      color: 'var(--accent)',
      textTransform: 'uppercase'
    }
  }, "Ejercicio completo"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, "Siguiente: ", ex.next)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Series"), sets.map((s, i) => /*#__PURE__*/React.createElement(SetRow, {
    key: i,
    index: i + 1,
    load: s.load,
    reps: s.reps,
    rir: s.rir,
    state: s.state,
    onToggle: () => setSets(prev => prev.map((x, j) => j === i ? {
      ...x,
      state: x.state === 'done' ? 'pending' : 'done'
    } : x))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    icon: "arrow-right",
    style: {
      flex: 1
    }
  }, "Siguiente"), /*#__PURE__*/React.createElement(Button, {
    variant: "intensity",
    size: "lg",
    icon: "flag",
    onClick: onFinish
  }, "Terminar")));
}
window.WorkoutLogScreen = WorkoutLogScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/WorkoutLogScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/data.js
try { (() => {
// Frencia iOS kit — shared mock data (plain globals; loaded before the babel screens)
window.FRENCIA_DATA = {
  user: {
    name: 'Marco Ríos',
    initials: 'MR',
    streak: 12
  },
  today: {
    routine: 'Empuje · A',
    tags: ['Pecho', 'Hombro', 'Tríceps'],
    exercisesTotal: 5,
    exercisesDone: 0,
    lastDone: 'hace 3 días'
  },
  weekStats: {
    volume: '24.6',
    volumeUnit: 't',
    sessions: 4,
    rir: '1.8'
  },
  lastPR: {
    exercise: 'Press banca',
    value: '85',
    unit: 'kg',
    date: '9 jun',
    reps: 5
  },
  // Active workout — Press banca
  exercise: {
    name: 'Press banca',
    target: '4 × 6–8',
    note: 'Pausa 1s en el pecho',
    muscle: 'Pecho',
    sets: [{
      load: 82.5,
      reps: 8,
      rir: 2,
      state: 'done'
    }, {
      load: 82.5,
      reps: 8,
      rir: 1,
      state: 'done'
    }, {
      load: 85.0,
      reps: 6,
      rir: null,
      state: 'active'
    }, {
      load: 85.0,
      reps: 6,
      rir: null,
      state: 'pending'
    }],
    next: 'Aperturas en polea'
  },
  // Progression — Press banca est. 1RM by week
  progress: {
    exercise: 'Press banca',
    oneRM: '102',
    oneRMDelta: '+4',
    bars: [{
      label: 'S1',
      v: 64
    }, {
      label: 'S2',
      v: 70
    }, {
      label: 'S3',
      v: 68
    }, {
      label: 'S4',
      v: 78
    }, {
      label: 'S5',
      v: 84
    }, {
      label: 'S6',
      v: 100,
      pr: true
    }],
    prs: [{
      date: '9 jun',
      value: '85',
      unit: 'kg',
      reps: 5,
      est: '98'
    }, {
      date: '26 may',
      value: '82.5',
      unit: 'kg',
      reps: 6,
      est: '96'
    }, {
      date: '12 may',
      value: '80',
      unit: 'kg',
      reps: 6,
      est: '93'
    }]
  },
  // Completed session — the stub
  session: {
    date: '12 JUN 2026',
    time: '07:42',
    dur: '58:21',
    routine: 'EMPUJE · A',
    volume: '12 480',
    volumeUnit: 'kg',
    exercises: 5,
    sets: 18,
    rir: '1.6',
    prs: 1,
    id: 'FRENCIA-0418-2773610',
    log: [{
      name: 'Press banca',
      sets: '4×',
      top: '85 kg',
      pr: true
    }, {
      name: 'Press inclinado mancuernas',
      sets: '3×',
      top: '34 kg',
      pr: false
    }, {
      name: 'Aperturas en polea',
      sets: '3×',
      top: '20 kg',
      pr: false
    }, {
      name: 'Press militar',
      sets: '4×',
      top: '52.5 kg',
      pr: false
    }, {
      name: 'Fondos lastrados',
      sets: '4×',
      top: '+20 kg',
      pr: false
    }]
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/data.js", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/ios-frame.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/ios-frame.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.MetricPill = __ds_scope.MetricPill;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.SetRow = __ds_scope.SetRow;

__ds_ns.StatTile = __ds_scope.StatTile;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.TabBar = __ds_scope.TabBar;

})();
