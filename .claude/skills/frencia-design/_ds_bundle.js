/* @ds-bundle: {"format":4,"namespace":"FrenciaDesignSystem_377129","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"MetricPill","sourcePath":"components/data/MetricPill.jsx"},{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"SetRow","sourcePath":"components/data/SetRow.jsx"},{"name":"StatTile","sourcePath":"components/data/StatTile.jsx"},{"name":"Stepper","sourcePath":"components/data/Stepper.jsx"},{"name":"Switch","sourcePath":"components/feedback/Switch.jsx"},{"name":"DistanceField","sourcePath":"components/log/DistanceField.jsx"},{"name":"DurationField","sourcePath":"components/log/DurationField.jsx"},{"name":"ExerciseConfig","sourcePath":"components/log/ExerciseConfig.jsx"},{"name":"ExerciseMetrics","sourcePath":"components/log/ExerciseMetrics.jsx"},{"name":"ExerciseSummary","sourcePath":"components/log/ExerciseSummary.jsx"},{"name":"ExerciseTypeTag","sourcePath":"components/log/ExerciseTypeTag.jsx"},{"name":"IsoTimer","sourcePath":"components/log/IsoTimer.jsx"},{"name":"RestRing","sourcePath":"components/log/RestRing.jsx"},{"name":"SerieComparativa","sourcePath":"components/log/SerieComparativa.jsx"},{"name":"SeriesTable","sourcePath":"components/log/SeriesTable.jsx"},{"name":"SegmentedControl","sourcePath":"components/navigation/SegmentedControl.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"2e78b45d6e19","components/core/Badge.jsx":"f89c573136c1","components/core/Button.jsx":"0405efe59e10","components/core/Card.jsx":"a6572f38f36a","components/core/IconButton.jsx":"5baa1760df16","components/core/Tag.jsx":"adfcdcb88ea6","components/data/MetricPill.jsx":"ee2529e33d0d","components/data/ProgressBar.jsx":"c265fdda63e8","components/data/SetRow.jsx":"647cb2c445ec","components/data/StatTile.jsx":"7f0f414363d8","components/data/Stepper.jsx":"c627d0a3d601","components/feedback/Switch.jsx":"9b36bfeb3766","components/log/DistanceField.jsx":"3a1c13c46fc9","components/log/DurationField.jsx":"a010222bf4ff","components/log/ExerciseConfig.jsx":"1584549fd048","components/log/ExerciseMetrics.jsx":"975f241994fd","components/log/ExerciseSummary.jsx":"3e635de29e2a","components/log/ExerciseTypeTag.jsx":"f1659e2447b2","components/log/IsoTimer.jsx":"04fb10d60930","components/log/RestRing.jsx":"c0bf760f1058","components/log/SerieComparativa.jsx":"7770bab607b1","components/log/SeriesTable.jsx":"c692bbb6b7af","components/navigation/SegmentedControl.jsx":"7c4c72012384","components/navigation/TabBar.jsx":"375e8a3345aa","design_handoff_hoy_empty_state/data.js":"c5ce1f5ae0b5","design_handoff_hoy_empty_state/ios-frame.jsx":"be3343be4b51","design_handoff_tipos_de_ejercicio/ui_kits/ios_app/log-fallback.js":"257b2b3f104b","design_handoff_tipos_de_ejercicio/ui_kits/ios_app/tipos.data.js":"ceeb794cce6c","ui_kits/ios_app/CatalogScreen.jsx":"e0a482db2a42","ui_kits/ios_app/CreateRoutineWizard.jsx":"af8834e3fadb","ui_kits/ios_app/HistoryDetailScreen.jsx":"ee27c0d016c3","ui_kits/ios_app/HomeEmpty.jsx":"8800637d7840","ui_kits/ios_app/HomeScreen.jsx":"d5b7081dab92","ui_kits/ios_app/ProgressScreen.jsx":"539203701a59","ui_kits/ios_app/RoutinesScreen.jsx":"b4454c62d642","ui_kits/ios_app/SessionStub.jsx":"fde3f1defff6","ui_kits/ios_app/SessionTypedScreen.jsx":"127e47b6eb6a","ui_kits/ios_app/WorkoutLogScreen.jsx":"c4f403dc4786","ui_kits/ios_app/data.js":"c5ce1f5ae0b5","ui_kits/ios_app/design-canvas.jsx":"bd8746af6e58","ui_kits/ios_app/ios-frame.jsx":"be3343be4b51","ui_kits/ios_app/log-fallback.js":"a426d265c066","ui_kits/ios_app/theme-toggle.jsx":"4e3bfa069591","ui_kits/ios_app/tipos.data.js":"ceeb794cce6c"},"inlinedExternals":[],"unexposedExports":[]} */

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
              background-color var(--dur-base) var(--ease-out),
              color var(--dur-base) var(--ease-out),
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

// components/log/DistanceField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  s.id = 'frencia-dist-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Campo de distancia. La unidad la decide el ejercicio (m para distancias
 * cortas) o la preferencia del usuario (km / mi). Acepta coma o punto.
 */
function DistanceField({
  label = 'Distancia',
  value,
  onChange,
  unit = 'km',
  step,
  size = 'md',
  fullWidth = false,
  className = '',
  ...rest
}) {
  const isM = unit === 'm';
  const st = step != null ? step : isM ? 10 : 0.1;
  const dec = isM ? 0 : 2;
  const fmt = v => v == null ? '' : v.toFixed(dec);
  const [focus, setFocus] = React.useState(false);
  const [buf, setBuf] = React.useState('');
  const emit = v => onChange && onChange(Math.max(0, Number(Math.max(0, v).toFixed(dec))));
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
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), label ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-dist__label"
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    className: "frencia-dist__fmt"
  }, unit)) : null, /*#__PURE__*/React.createElement("div", {
    className: 'frencia-dist__row' + (focus ? ' frencia-dist__row--focus' : '')
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "frencia-dist__btn",
    onClick: () => emit(v - st),
    disabled: v <= 0,
    "aria-label": `menos ${st} ${unit}`
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "minus"
  })), stepTxt), /*#__PURE__*/React.createElement("label", {
    className: "frencia-dist__well"
  }, /*#__PURE__*/React.createElement("input", {
    className: "frencia-dist__input",
    style: {
      width
    },
    inputMode: isM ? 'numeric' : 'decimal',
    autoComplete: "off",
    "aria-label": `${label} en ${unit}`,
    placeholder: placeholder,
    value: text,
    onFocus: e => {
      setBuf(fmt(value));
      setFocus(true);
      const t = e.currentTarget;
      setTimeout(() => t.select(), 0);
    },
    onBlur: commit,
    onChange: e => setBuf(e.target.value.replace(isM ? /[^\d]/g : /[^\d.,]/g, '').slice(0, 7)),
    onKeyDown: e => {
      if (e.key === 'Enter') e.currentTarget.blur();
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "frencia-dist__unit"
  }, unit)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "frencia-dist__btn",
    onClick: () => emit(v + st),
    "aria-label": `más ${st} ${unit}`
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "plus"
  })), stepTxt)));
}
Object.assign(__ds_scope, { DistanceField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/log/DistanceField.jsx", error: String((e && e.message) || e) }); }

// components/log/DurationField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  s.id = 'frencia-dur-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
const pad = n => String(n).padStart(2, '0');
function clock(sec) {
  const h = Math.floor(sec / 3600),
    m = Math.floor(sec % 3600 / 60),
    s = sec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
function stepLabel(step) {
  return step < 60 ? `${step} s` : `${Math.round(step / 60)} min`;
}

/**
 * Campo de duración. Escritura directa estilo temporizador de iOS (los dígitos
 * entran por la derecha: 4-5 → 0:45, 1-3-0 → 1:30) + ajuste rápido ± step.
 */
function DurationField({
  label,
  value,
  onChange,
  step = 5,
  allowHours = false,
  size = 'md',
  fullWidth = false,
  showSteps = true,
  className = '',
  ...rest
}) {
  const maxDigits = allowHours ? 6 : 4;
  const max = allowHours ? 359999 : 3599;
  const [focus, setFocus] = React.useState(false);
  const [buf, setBuf] = React.useState('');
  const clamp = v => Math.max(0, Math.min(max, Math.round(v)));
  const emit = v => onChange && onChange(clamp(v));
  const toSec = digits => {
    const d = digits.padStart(maxDigits, '0');
    if (allowHours) return +d.slice(0, 2) * 3600 + +d.slice(2, 4) * 60 + +d.slice(4, 6);
    return +d.slice(0, 2) * 60 + +d.slice(2, 4);
  };
  const commit = () => {
    if (buf) emit(toSec(buf));
    setBuf('');
    setFocus(false);
  };
  let display;
  if (focus) {
    const padded = buf.padStart(maxDigits, '0');
    const firstTyped = maxDigits - buf.length;
    const chars = [];
    for (let i = 0; i < maxDigits; i++) {
      if (i > 0 && i % 2 === 0) chars.push(/*#__PURE__*/React.createElement("span", {
        key: 'c' + i,
        className: i <= firstTyped ? 'frencia-dur__dim' : ''
      }, ":"));
      chars.push(/*#__PURE__*/React.createElement("span", {
        key: i,
        className: i < firstTyped ? 'frencia-dur__dim' : ''
      }, padded[i]));
    }
    display = /*#__PURE__*/React.createElement("span", {
      className: "frencia-dur__val"
    }, chars, /*#__PURE__*/React.createElement("span", {
      className: "frencia-dur__caret"
    }));
  } else if (value == null) {
    display = /*#__PURE__*/React.createElement("span", {
      className: "frencia-dur__val frencia-dur__dim"
    }, allowHours ? 'h:mm:ss' : 'm:ss');
  } else {
    display = /*#__PURE__*/React.createElement("span", {
      className: "frencia-dur__val"
    }, clock(value));
  }
  const cls = ['frencia-dur', `frencia-dur--${size}`, fullWidth ? 'frencia-dur--full' : '', className].filter(Boolean).join(' ');
  const v = value || 0;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), label ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-dur__label"
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    className: "frencia-dur__fmt"
  }, allowHours ? 'h:mm:ss' : 'm:ss')) : null, /*#__PURE__*/React.createElement("div", {
    className: 'frencia-dur__row' + (focus ? ' frencia-dur__row--focus' : '')
  }, showSteps ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "frencia-dur__btn",
    onClick: () => emit(v - step),
    disabled: v <= 0,
    "aria-label": `menos ${stepLabel(step)}`
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "minus"
  })), stepLabel(step).replace(' ', '')) : null, /*#__PURE__*/React.createElement("label", {
    className: "frencia-dur__well"
  }, display, /*#__PURE__*/React.createElement("input", {
    className: "frencia-dur__input",
    inputMode: "numeric",
    pattern: "[0-9]*",
    autoComplete: "off",
    "aria-label": label || 'Duración',
    value: buf,
    onFocus: () => {
      setBuf('');
      setFocus(true);
    },
    onBlur: commit,
    onChange: e => setBuf(e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, maxDigits)),
    onKeyDown: e => {
      if (e.key === 'Enter') e.currentTarget.blur();
      if (e.key === 'Escape') {
        setBuf('');
        e.currentTarget.blur();
      }
    }
  })), showSteps ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "frencia-dur__btn",
    onClick: () => emit(v + step),
    disabled: v >= max,
    "aria-label": `más ${stepLabel(step)}`
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "plus"
  })), stepLabel(step).replace(' ', '')) : null));
}
Object.assign(__ds_scope, { DurationField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/log/DurationField.jsx", error: String((e && e.message) || e) }); }

// components/log/ExerciseConfig.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-excfg{display:flex;flex-direction:column;gap:22px;padding:8px 20px 28px;background:var(--bg-app);min-height:100%;box-sizing:border-box}
.frencia-excfg__nav{display:flex;align-items:center;gap:6px;margin:0 -8px}
.frencia-excfg__navt{font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:11px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary)}
.frencia-excfg__head{display:flex;flex-direction:column;gap:8px}
.frencia-excfg__name{font:var(--text-title);color:var(--text-primary);margin:0;text-wrap:balance}
.frencia-excfg__sec{display:flex;flex-direction:column;gap:10px}
.frencia-excfg__cap{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:11px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary)}
.frencia-excfg__opt{color:var(--text-disabled);text-transform:none;letter-spacing:var(--ls-wide)}
.frencia-excfg__pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.frencia-excfg__pair .frencia-stepper,.frencia-excfg__pair .frencia-stepper__row{width:100%}
.frencia-excfg__pair .frencia-stepper__val{flex:1;min-width:0}
.frencia-excfg__pair .frencia-stepper__btn{width:46px}
.frencia-excfg__note{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:var(--radius-md);background:var(--surface-card);border:1px solid var(--border-subtle);font-family:var(--font-sans);font-size:14px;line-height:1.4;color:var(--text-secondary)}
.frencia-excfg__note svg{width:18px;height:18px;flex-shrink:0;color:var(--text-tertiary);margin-top:1px}
.frencia-excfg__chips{display:flex;flex-wrap:wrap;gap:8px}
.frencia-excfg__chips .frencia-tag{min-height:36px;padding:0 14px;font-family:var(--font-mono);font-weight:var(--fw-semibold)}
.frencia-excfg__foot{display:flex;flex-direction:column;gap:12px;margin-top:4px;padding-top:18px;border-top:1px solid var(--divider)}
.frencia-excfg__prev{display:flex;flex-direction:column;gap:6px}
.frencia-excfg__err{font-family:var(--font-sans);font-size:13px;color:var(--text-tertiary)}
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-excfg-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-excfg-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
const RIR_OPTS = [{
  value: 0,
  label: '0'
}, {
  value: 1,
  label: '1'
}, {
  value: 2,
  label: '2'
}, {
  value: 3,
  label: '3'
}, {
  value: 4,
  label: '4+'
}];

/**
 * Segunda cara de ExercisePickerModal: configurar un ejercicio dentro de un
 * día (agregar o editar). Los campos salen de los datos que registra el
 * ejercicio; el peso no se planifica; el descanso no aparece en cardio de
 * una sola serie.
 */
function ExerciseConfig({
  exercise,
  plan = {},
  mode = 'add',
  prefs,
  onBack,
  onSubmit,
  className = '',
  ...rest
}) {
  const NS = window.FrenciaDesignSystem_377129 || {};
  const {
    ExerciseMetrics: M,
    Stepper,
    DurationField,
    DistanceField,
    SegmentedControl,
    Tag,
    Button,
    IconButton,
    ExerciseTypeTag,
    ExerciseSummary
  } = NS;
  const kind = M ? M.KINDS[exercise.kind] : null;
  const defaultScale = kind && kind.intensity === 'required' ? kind.scales[0] : null;
  const [p, setP] = React.useState(() => ({
    sets: plan.sets || 3,
    reps: plan.reps != null ? plan.reps : null,
    tiempo: plan.tiempo != null ? plan.tiempo : null,
    distancia: plan.distancia != null ? plan.distancia : null,
    intensity: plan.intensity !== undefined ? plan.intensity : defaultScale,
    intensityValue: plan.intensityValue != null ? plan.intensityValue : null,
    rest: plan.rest != null ? plan.rest : 90
  }));
  const set = (k, v) => setP(prev => ({
    ...prev,
    [k]: v
  }));
  React.useEffect(() => {
    window.lucide && window.lucide.createIcons();
  });
  if (!M) return null;
  const vol = M.planMetrics(exercise);
  const hasPeso = M.metrics(exercise).includes('peso');
  const restOn = M.restVisible(exercise, p.sets);
  const per = p.sets > 1 ? ' por serie' : '';
  const isCardio = exercise.kind === 'cardio';
  const unit = M.distUnit(exercise, prefs);
  const valid = vol.some(k => p[k] != null && p[k] > 0);
  const scaleOpts = kind.intensity === 'required' ? kind.scales.map(s => ({
    value: s,
    label: s
  })) : [{
    value: 'none',
    label: kind.scales.length > 1 ? 'Sin intensidad' : 'Sin RPE'
  }].concat(kind.scales.map(s => ({
    value: s,
    label: s
  })));
  const setScale = v => setP(prev => ({
    ...prev,
    intensity: v === 'none' ? null : v,
    intensityValue: v === prev.intensity ? prev.intensityValue : v === 'RIR' ? 2 : v === 'RPE' ? isCardio ? 6 : 8 : null
  }));
  const final = {
    ...p,
    rest: restOn ? p.rest : null
  };
  const repsStepper = vol.includes('reps');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['frencia-excfg', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "frencia-excfg__nav"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-left",
    variant: "ghost",
    onClick: onBack,
    "aria-label": "Volver al cat\xE1logo"
  }), /*#__PURE__*/React.createElement("span", {
    className: "frencia-excfg__navt"
  }, mode === 'edit' ? 'Editar ejercicio' : 'Agregar al día')), /*#__PURE__*/React.createElement("div", {
    className: "frencia-excfg__head"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "frencia-excfg__name"
  }, exercise.name), /*#__PURE__*/React.createElement(ExerciseTypeTag, {
    exercise: exercise
  })), /*#__PURE__*/React.createElement("div", {
    className: "frencia-excfg__sec"
  }, repsStepper ? /*#__PURE__*/React.createElement("div", {
    className: "frencia-excfg__pair"
  }, /*#__PURE__*/React.createElement(Stepper, {
    label: "Series",
    value: p.sets,
    onChange: v => set('sets', v),
    min: 1,
    max: 12,
    size: "lg"
  }), /*#__PURE__*/React.createElement(Stepper, {
    label: 'Reps' + per,
    value: p.reps || 0,
    onChange: v => set('reps', v),
    min: 1,
    max: 100,
    size: "lg"
  })) : /*#__PURE__*/React.createElement("div", {
    className: "frencia-excfg__pair"
  }, /*#__PURE__*/React.createElement(Stepper, {
    label: "Series",
    value: p.sets,
    onChange: v => set('sets', v),
    min: 1,
    max: 12,
    size: "lg"
  }), /*#__PURE__*/React.createElement("span", null)), vol.includes('tiempo') ? /*#__PURE__*/React.createElement(DurationField, {
    label: 'Tiempo' + per,
    value: p.tiempo,
    onChange: v => set('tiempo', v),
    step: isCardio ? 60 : 5,
    allowHours: isCardio,
    size: "lg",
    fullWidth: true
  }) : null, vol.includes('distancia') ? /*#__PURE__*/React.createElement(DistanceField, {
    label: 'Distancia' + per,
    value: p.distancia,
    onChange: v => set('distancia', v),
    unit: unit,
    size: "lg",
    fullWidth: true
  }) : null, hasPeso ? /*#__PURE__*/React.createElement("div", {
    className: "frencia-excfg__note"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "info"
  })), /*#__PURE__*/React.createElement("span", null, "El peso no va en el plan: lo eleg\xEDs en cada serie durante la sesi\xF3n.")) : null), /*#__PURE__*/React.createElement("div", {
    className: "frencia-excfg__sec"
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-excfg__cap"
  }, /*#__PURE__*/React.createElement("span", null, "Intensidad"), kind.intensity === 'optional' ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-excfg__opt"
  }, "opcional") : null), scaleOpts.length > 1 ? /*#__PURE__*/React.createElement(SegmentedControl, {
    fullWidth: true,
    value: p.intensity || 'none',
    onChange: setScale,
    options: scaleOpts
  }) : null, p.intensity === 'RIR' ? /*#__PURE__*/React.createElement(SegmentedControl, {
    fullWidth: true,
    value: p.intensityValue,
    onChange: v => set('intensityValue', v),
    options: RIR_OPTS
  }) : p.intensity === 'RPE' ? /*#__PURE__*/React.createElement(Stepper, {
    label: "RPE objetivo",
    value: p.intensityValue || 0,
    onChange: v => set('intensityValue', v),
    min: 1,
    max: 10,
    step: 0.5,
    precision: 1,
    size: "lg"
  }) : null), restOn ? /*#__PURE__*/React.createElement("div", {
    className: "frencia-excfg__sec"
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-excfg__cap"
  }, /*#__PURE__*/React.createElement("span", null, "Descanso entre series")), /*#__PURE__*/React.createElement("div", {
    className: "frencia-excfg__chips",
    role: "radiogroup"
  }, M.REST_OPTIONS.map(r => /*#__PURE__*/React.createElement(Tag, {
    key: r,
    selectable: true,
    selected: p.rest === r,
    role: "radio",
    "aria-checked": p.rest === r,
    onClick: () => set('rest', r)
  }, M.durCompact(r))))) : null, /*#__PURE__*/React.createElement("div", {
    className: "frencia-excfg__foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "frencia-excfg__prev"
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-excfg__cap"
  }, /*#__PURE__*/React.createElement("span", null, "En la lista del d\xEDa")), valid ? /*#__PURE__*/React.createElement(ExerciseSummary, {
    exercise: exercise,
    plan: final,
    prefs: prefs,
    size: "lg"
  }) : /*#__PURE__*/React.createElement("span", {
    className: "frencia-excfg__err"
  }, "Carg\xE1 ", vol.map(k => M.LABELS[k].toLowerCase()).join(' o '), " para seguir.")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    icon: mode === 'edit' ? 'check' : 'plus',
    fullWidth: true,
    disabled: !valid,
    onClick: () => onSubmit && onSubmit(final)
  }, mode === 'edit' ? 'Guardar cambios' : 'Agregar al día')));
}
Object.assign(__ds_scope, { ExerciseConfig });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/log/ExerciseConfig.jsx", error: String((e && e.message) || e) }); }

// components/log/ExerciseMetrics.jsx
try { (() => {
// Fuente única de reglas: qué datos registra un ejercicio, en qué orden van
// las columnas y cómo se formatean tiempo, distancia y resúmenes.

const ORDER = ['peso', 'reps', 'tiempo', 'distancia'];
const KINDS = {
  fuerza: {
    label: 'Fuerza',
    icon: 'dumbbell',
    intensity: 'required',
    scales: ['RIR', 'RPE']
  },
  isometrico: {
    label: 'Isométrico',
    icon: 'hourglass',
    intensity: 'required',
    scales: ['RIR', 'RPE']
  },
  cardio: {
    label: 'Cardio',
    icon: 'heart-pulse',
    intensity: 'optional',
    scales: ['RPE']
  },
  hibrido: {
    label: 'Híbrido',
    icon: 'combine',
    intensity: 'optional',
    scales: ['RIR', 'RPE']
  }
};
const LABELS = {
  peso: 'Peso',
  reps: 'Reps',
  tiempo: 'Tiempo',
  distancia: 'Distancia'
};
const SHORT = {
  peso: 'Peso',
  reps: 'Reps',
  tiempo: 'Tiempo',
  distancia: 'Dist.'
};
const DASH = '—';
const pad = n => String(n).padStart(2, '0');
const isNil = v => v == null || typeof v === 'number' && isNaN(v);

/** Reloj: m:ss por debajo de una hora, h:mm:ss desde una hora. Grillas y campos. */
function clock(sec) {
  if (isNil(sec)) return DASH;
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600),
    m = Math.floor(sec % 3600 / 60),
    s = sec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Compacto para resúmenes: 45 s · 2 min · 1 h · 1 h 15 min · 1:30. */
function durCompact(sec) {
  if (isNil(sec)) return DASH;
  sec = Math.max(0, Math.round(sec));
  if (sec < 60) return `${sec} s`;
  const h = Math.floor(sec / 3600),
    m = Math.floor(sec % 3600 / 60),
    s = sec % 60;
  if (s === 0 && h && !m) return `${h} h`;
  if (s === 0 && h) return `${h} h ${m} min`;
  if (s === 0) return `${m} min`;
  return clock(sec);
}

/** La escala es del ejercicio, no del valor: corta → m siempre; larga → km o mi del usuario. */
function distUnit(ex, prefs) {
  if (ex && ex.distScale === 'corta') return 'm';
  return prefs && prefs.dist || 'km';
}

/** m: entero. km/mi: 2 decimales en grillas, recortados en resúmenes. */
function dist(v, unit, mode) {
  if (isNil(v)) return DASH;
  if (unit === 'm') return String(Math.round(v));
  return mode === 'compact' ? String(Number(v.toFixed(2))) : v.toFixed(2);
}
function weight(v) {
  if (isNil(v)) return DASH;
  return String(Number(Number(v).toFixed(2)));
}

/** Datos que registra el ejercicio, en orden canónico. */
function metrics(ex) {
  return ORDER.filter(k => (ex.metrics || []).includes(k));
}

/** Lo que el plan puede prescribir: todo menos el peso. */
function planMetrics(ex) {
  return metrics(ex).filter(k => k !== 'peso');
}

/** Columnas fijas del ejercicio. La de intensidad existe si el plan eligió escala. */
function columns(ex, prefs, intensity) {
  const cols = metrics(ex).map(k => ({
    key: k,
    label: SHORT[k],
    unit: k === 'peso' ? prefs && prefs.weight || 'kg' : k === 'distancia' ? distUnit(ex, prefs) : ''
  }));
  if (intensity) cols.push({
    key: 'int',
    label: intensity,
    unit: ''
  });
  return cols;
}
function value(key, v, ex, prefs, mode) {
  if (key === 'peso') return weight(v);
  if (key === 'tiempo') return mode === 'compact' ? durCompact(v) : clock(v);
  if (key === 'distancia') return dist(v, distUnit(ex, prefs), mode);
  return isNil(v) ? DASH : String(v);
}

/** El descanso no aparece solo en cardio de una sola serie. */
function restVisible(ex, sets) {
  return !(ex.kind === 'cardio' && sets === 1);
}

/** El prefijo "Nx" se omite en el mismo caso en que se omite el descanso. */
function summary(ex, plan, prefs) {
  const sets = plan.sets || 1;
  const unit = distUnit(ex, prefs);
  const parts = planMetrics(ex).filter(k => !isNil(plan[k])).map(k => {
    if (k === 'reps') return String(plan.reps);
    if (k === 'tiempo') return durCompact(plan.tiempo);
    return `${dist(plan.distancia, unit, 'compact')} ${unit}`;
  });
  const counted = restVisible(ex, sets);
  if (counted && parts.length) parts[0] = `${sets}x${parts[0]}`;
  if (counted && !parts.length) parts.push(`${sets} series`);
  const volume = parts.join(' · ');
  const intensity = plan.intensity && !isNil(plan.intensityValue) ? `${plan.intensity} ${plan.intensityValue}` : null;
  const rest = counted && plan.rest ? durCompact(plan.rest) : null;
  return {
    volume,
    intensity,
    rest,
    text: [volume, intensity, rest].filter(Boolean).join(' · ')
  };
}
const REST_OPTIONS = [30, 60, 90, 120, 180, 300];
const ExerciseMetrics = {
  ORDER,
  KINDS,
  LABELS,
  SHORT,
  DASH,
  REST_OPTIONS,
  clock,
  durCompact,
  distUnit,
  dist,
  weight,
  metrics,
  planMetrics,
  columns,
  value,
  restVisible,
  summary
};
Object.assign(__ds_scope, { ExerciseMetrics });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/log/ExerciseMetrics.jsx", error: String((e && e.message) || e) }); }

// components/log/ExerciseSummary.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-exsum{display:inline-flex;flex-wrap:wrap;align-items:center;column-gap:7px;row-gap:2px;font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:13px;color:var(--text-secondary);font-variant-numeric:tabular-nums}
.frencia-exsum__vol{color:var(--text-primary);font-weight:var(--fw-semibold)}
.frencia-exsum__sep{color:var(--text-disabled)}
.frencia-exsum__int{color:var(--intensity-text);font-weight:var(--fw-semibold)}
.frencia-exsum__rest{display:inline-flex;align-items:center;gap:4px;color:var(--text-tertiary)}
.frencia-exsum__rest svg{width:13px;height:13px;stroke-width:2}
.frencia-exsum--lg{font-size:15px}
.frencia-exsum--lg .frencia-exsum__rest svg{width:15px;height:15px}
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-exsum-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-exsum-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Resumen de una línea del plan: volumen · intensidad · descanso.
 * "4x10 · RIR 2 · 2 min", "3x45 s · RIR 1 · 1 min", "30 min · 5 km · RPE 6", "3x40 m · 1:30".
 * El descanso lleva ícono de reloj para no confundirse con un tiempo de trabajo.
 */
function ExerciseSummary({
  exercise,
  plan,
  prefs,
  size = 'md',
  className = '',
  ...rest
}) {
  const M = (window.FrenciaDesignSystem_377129 || {}).ExerciseMetrics;
  if (!M) return null;
  const s = M.summary(exercise, plan, prefs);
  const sep = k => /*#__PURE__*/React.createElement("span", {
    key: k,
    className: "frencia-exsum__sep"
  }, "\xB7");
  const out = [/*#__PURE__*/React.createElement("span", {
    key: "v",
    className: "frencia-exsum__vol"
  }, s.volume)];
  if (s.intensity) out.push(sep('s1'), /*#__PURE__*/React.createElement("span", {
    key: "i",
    className: "frencia-exsum__int"
  }, s.intensity));
  if (s.rest) out.push(sep('s2'), /*#__PURE__*/React.createElement("span", {
    key: "r",
    className: "frencia-exsum__rest",
    "aria-label": `descanso ${s.rest}`
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "timer"
  })), s.rest));
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['frencia-exsum', size === 'lg' ? 'frencia-exsum--lg' : '', className].filter(Boolean).join(' '),
    title: s.text
  }, rest), out);
}
Object.assign(__ds_scope, { ExerciseSummary });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/log/ExerciseSummary.jsx", error: String((e && e.message) || e) }); }

// components/log/ExerciseTypeTag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-extype{display:inline-flex;align-items:center;gap:6px;min-width:0;flex-wrap:wrap;row-gap:2px}
.frencia-extype__kind{display:inline-flex;align-items:center;gap:5px;font-family:var(--font-sans);font-weight:var(--fw-semibold);font-size:12px;color:var(--text-secondary);white-space:nowrap}
.frencia-extype__kind svg{width:14px;height:14px;stroke-width:2}
.frencia-extype__m{font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:10.5px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary);white-space:nowrap}
.frencia-extype__sep{color:var(--text-disabled);font-size:11px}
.frencia-extype--chip{padding:5px 10px;border-radius:var(--radius-pill);background:var(--surface-chip)}
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-extype-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-extype-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Tipo de ejercicio: ícono + nombre, sin color propio. Con `exercise` agrega
 * los datos que registra ("PESO · DIST.") porque las vistas dependen de eso.
 */
function ExerciseTypeTag({
  kind,
  exercise,
  showMetrics = true,
  variant = 'inline',
  className = '',
  ...rest
}) {
  const M = (window.FrenciaDesignSystem_377129 || {}).ExerciseMetrics;
  if (!M) return null;
  const k = kind || exercise && exercise.kind;
  const info = M.KINDS[k] || {
    label: k,
    icon: 'circle'
  };
  const ms = exercise && showMetrics ? M.metrics(exercise) : [];
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['frencia-extype', variant === 'chip' ? 'frencia-extype--chip' : '', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "frencia-extype__kind"
  }, /*#__PURE__*/React.createElement("span", {
    key: info.icon,
    style: {
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": info.icon
  })), info.label), ms.length ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-extype__sep"
  }, "\xB7") : null, ms.length ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-extype__m"
  }, ms.map(m => M.SHORT[m]).join(' · ')) : null);
}
Object.assign(__ds_scope, { ExerciseTypeTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/log/ExerciseTypeTag.jsx", error: String((e && e.message) || e) }); }

// components/log/IsoTimer.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-iso{display:flex;flex-direction:column;gap:16px;padding:20px;border-radius:var(--radius-xl);background:var(--surface-card-elevated);border:1px solid var(--border-subtle);transition:border-color var(--dur-base) var(--ease-out)}
.frencia-iso--running{border-color:var(--surface-orange-line)}
.frencia-iso__top{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.frencia-iso__cap{font-family:var(--font-mono);font-weight:var(--fw-semibold);font-size:11px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary);display:inline-flex;align-items:center;gap:7px}
.frencia-iso--running .frencia-iso__cap{color:var(--intensity-text)}
.frencia-iso__live{width:8px;height:8px;border-radius:2px;background:var(--intensity)}
.frencia-iso__target{white-space:nowrap;font-family:var(--font-mono);font-size:12px;color:var(--text-tertiary)}
.frencia-iso__target b{color:var(--text-secondary);font-weight:var(--fw-bold)}
.frencia-iso__digits{font-family:var(--font-display);font-size:76px;line-height:.9;letter-spacing:var(--ls-display);color:var(--text-primary);font-variant-numeric:tabular-nums}
.frencia-iso--idle .frencia-iso__digits{color:var(--text-disabled)}
.frencia-iso__bar{position:relative;height:10px;border-radius:var(--radius-pill);background:var(--data-track);overflow:visible}
.frencia-iso__fill{position:absolute;left:0;top:0;bottom:0;border-radius:var(--radius-pill);background:var(--intensity)}
.frencia-iso__tick{position:absolute;top:-5px;bottom:-5px;width:2px;margin-left:-1px;border-radius:1px;background:var(--text-primary)}
.frencia-iso__note{font-family:var(--font-mono);font-size:12px;color:var(--text-secondary);min-height:16px}
.frencia-iso__note--over{color:var(--intensity-text)}
.frencia-iso__btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:56px;border:none;border-radius:var(--radius-md);cursor:pointer;font-family:var(--font-sans);font-weight:var(--fw-bold);font-size:17px;-webkit-tap-highlight-color:transparent;transition:transform var(--dur-fast) var(--ease-spring),background-color var(--dur-fast) var(--ease-out)}
.frencia-iso__btn:active{transform:scale(var(--press-scale))}
.frencia-iso__btn svg{width:20px;height:20px;stroke-width:2.5}
.frencia-iso__btn--go{background:var(--accent);color:var(--text-on-accent)}
.frencia-iso__btn--go:hover{background:var(--accent-hover)}
.frencia-iso__btn--stop{background:var(--text-primary);color:var(--text-inverse)}
.frencia-iso__row{display:flex;gap:10px;align-items:center;justify-content:space-between}
.frencia-iso__link{border:none;background:transparent;color:var(--accent-text);font-family:var(--font-sans);font-weight:var(--fw-semibold);font-size:14px;cursor:pointer;padding:10px 4px;display:inline-flex;align-items:center;gap:6px}
.frencia-iso__link svg{width:16px;height:16px}
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-iso-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-iso-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
const pad = n => String(n).padStart(2, '0');
const clock = sec => {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600),
    m = Math.floor(sec % 3600 / 60),
    s = sec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};
const Ic = ({
  name
}) => /*#__PURE__*/React.createElement("span", {
  key: name,
  style: {
    display: 'inline-flex'
  }
}, /*#__PURE__*/React.createElement("i", {
  "data-lucide": name
}));

/**
 * Cronómetro de esfuerzo para isométricos. Cuenta hacia arriba contra el
 * objetivo del plan; al frenar completa la duración de la serie, que queda
 * editable. Opuesto visual al RestRing: barra y no anillo, sube y no baja,
 * naranja (esfuerzo) y no verde (pausa).
 */
function IsoTimer({
  target,
  value,
  onChange,
  initialPhase = 'idle',
  initialElapsed = 0,
  className = '',
  ...rest
}) {
  const [phase, setPhase] = React.useState(initialPhase);
  const [elapsed, setElapsed] = React.useState(initialElapsed * 1000);
  const startRef = React.useRef(Date.now() - initialElapsed * 1000);
  const [loaded, setLoaded] = React.useState(value != null ? value : initialPhase === 'done' ? initialElapsed : null);
  const set = sec => {
    setLoaded(sec);
    onChange && onChange(sec);
  };
  React.useEffect(() => {
    if (phase !== 'running') return undefined;
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 100);
    return () => clearInterval(id);
  }, [phase]);
  React.useEffect(() => {
    window.lucide && window.lucide.createIcons();
  }, [phase]);
  const start = () => {
    startRef.current = Date.now();
    setElapsed(0);
    setPhase('running');
  };
  const stop = () => {
    const sec = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
    setElapsed(sec * 1000);
    setPhase('done');
    set(sec);
  };
  const DurationField = (window.FrenciaDesignSystem_377129 || {}).DurationField;
  const sec = elapsed / 1000;
  const scale = target ? Math.max(target * 1.2, sec) : 0;
  const fillPct = target ? Math.min(100, sec / scale * 100) : 0;
  const tickPct = target ? target / scale * 100 : 0;
  const over = target && sec >= target;
  let note = '';
  if (phase === 'running' && target) note = over ? `+${clock(sec - target)} sobre el objetivo` : `Faltan ${clock(Math.ceil(target - sec))}`;
  if (phase === 'idle') note = 'Arrancá cuando estés en posición.';
  const cls = ['frencia-iso', `frencia-iso--${phase}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "frencia-iso__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-iso__cap"
  }, phase === 'running' ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-iso__live"
  }) : null, phase === 'running' ? 'Esfuerzo · contando' : phase === 'done' ? 'Esfuerzo · registrado' : 'Esfuerzo'), /*#__PURE__*/React.createElement("span", {
    className: "frencia-iso__target"
  }, "Objetivo ", /*#__PURE__*/React.createElement("b", null, target ? clock(target) : '—'))), phase === 'done' && DurationField ? /*#__PURE__*/React.createElement(DurationField, {
    label: "Duraci\xF3n de la serie",
    value: value != null ? value : loaded,
    onChange: set,
    step: 5,
    size: "lg",
    fullWidth: true
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "frencia-iso__digits",
    "aria-live": "off"
  }, clock(sec)), target ? /*#__PURE__*/React.createElement("div", {
    className: "frencia-iso__bar",
    role: "progressbar",
    "aria-valuemin": 0,
    "aria-valuemax": target,
    "aria-valuenow": Math.floor(sec)
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-iso__fill",
    style: {
      width: fillPct + '%'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "frencia-iso__tick",
    style: {
      left: tickPct + '%'
    }
  })) : null, /*#__PURE__*/React.createElement("span", {
    className: 'frencia-iso__note' + (over && phase === 'running' ? ' frencia-iso__note--over' : '')
  }, note)), phase === 'idle' ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "frencia-iso__btn frencia-iso__btn--go",
    onClick: start
  }, /*#__PURE__*/React.createElement(Ic, {
    name: "play"
  }), "Empezar") : phase === 'running' ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "frencia-iso__btn frencia-iso__btn--stop",
    onClick: stop
  }, /*#__PURE__*/React.createElement(Ic, {
    name: "square"
  }), "Frenar") : /*#__PURE__*/React.createElement("div", {
    className: "frencia-iso__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-iso__note"
  }, "Corregilo si hace falta."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "frencia-iso__link",
    onClick: start
  }, /*#__PURE__*/React.createElement(Ic, {
    name: "rotate-ccw"
  }), "Volver a medir")));
}
Object.assign(__ds_scope, { IsoTimer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/log/IsoTimer.jsx", error: String((e && e.message) || e) }); }

// components/log/RestRing.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  s.id = 'frencia-rest-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
const pad = n => String(n).padStart(2, '0');
const clock = sec => `${Math.floor(sec / 60)}:${pad(sec % 60)}`;

/** Descanso: anillo verde que se vacía, cuenta regresiva. No se registra como dato de la serie. */
function RestRing({
  total = 120,
  remaining,
  running = true,
  next,
  onSkip,
  onDone,
  size = 108,
  className = '',
  ...rest
}) {
  const [left, setLeft] = React.useState(remaining != null ? remaining : total);
  const [tot, setTot] = React.useState(total);
  React.useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setLeft(l => {
      if (l <= 1) {
        clearInterval(id);
        onDone && onDone();
        return 0;
      }
      return l - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running]);
  const stroke = 8,
    r = (size - stroke) / 2,
    c = 2 * Math.PI * r;
  const frac = tot ? left / tot : 0;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['frencia-rest', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "frencia-rest__ring",
    style: {
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--data-track)",
    strokeWidth: stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--accent)",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeDasharray: c,
    strokeDashoffset: c * (1 - frac),
    style: {
      transition: 'stroke-dashoffset 1s linear'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "frencia-rest__num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-rest__digits"
  }, clock(left)), /*#__PURE__*/React.createElement("span", {
    className: "frencia-rest__of"
  }, "de ", clock(tot)))), /*#__PURE__*/React.createElement("div", {
    className: "frencia-rest__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-rest__cap"
  }, "Descanso"), next ? /*#__PURE__*/React.createElement("span", {
    className: "frencia-rest__next"
  }, next) : null, /*#__PURE__*/React.createElement("div", {
    className: "frencia-rest__acts"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "frencia-rest__btn",
    onClick: () => {
      setLeft(l => l + 15);
      setTot(t => t + 15);
    }
  }, "+15 s"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "frencia-rest__btn",
    onClick: onSkip
  }, "Saltar"))));
}
Object.assign(__ds_scope, { RestRing });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/log/RestRing.jsx", error: String((e && e.message) || e) }); }

// components/log/SerieComparativa.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-sc{display:flex;flex-direction:column;gap:6px}
.frencia-sc__title{display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:0 2px}
.frencia-sc__t{font-family:var(--font-mono);font-weight:var(--fw-semibold);font-size:11px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary)}
.frencia-sc__grid{display:grid;align-items:center;column-gap:0;border-radius:var(--radius-lg);background:var(--surface-card);border:1px solid var(--border-subtle);padding:6px}
.frencia-sc__h{font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:10px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary);padding:8px 6px 6px;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.frencia-sc__h small{font-size:10px;color:var(--text-disabled);margin-left:3px;letter-spacing:var(--ls-wide);text-transform:none}
.frencia-sc__rl{font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:11px;letter-spacing:var(--ls-wide);text-transform:uppercase;color:var(--text-tertiary);padding:0 6px;white-space:nowrap}
.frencia-sc__c{font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:15px;color:var(--text-secondary);font-variant-numeric:tabular-nums;text-align:right;padding:10px 6px;white-space:nowrap;border-radius:var(--radius-xs)}
.frencia-sc__c--dash{color:var(--text-disabled)}
.frencia-sc__c--int{color:var(--intensity-text)}
.frencia-sc__band{grid-column:1 / -1;display:contents}
.frencia-sc__today{background:var(--surface-card-elevated)}
.frencia-sc__today.frencia-sc__rl{color:var(--accent-text);font-weight:var(--fw-bold);border-radius:var(--radius-sm) 0 0 var(--radius-sm);align-self:stretch;display:flex;align-items:center}
.frencia-sc__today.frencia-sc__c{font-weight:var(--fw-bold);font-size:17px;color:var(--text-primary);border-radius:0}
.frencia-sc__today.frencia-sc__c--last{border-radius:0 var(--radius-sm) var(--radius-sm) 0}
.frencia-sc__today.frencia-sc__c--dash{color:var(--text-disabled)}
.frencia-sc__today.frencia-sc__c--int{color:var(--intensity-text)}
.frencia-sc__c--active{box-shadow:inset 0 -2px 0 var(--accent)}
.frencia-sc--dense .frencia-sc__c{font-size:14px;padding:10px 3px}
.frencia-sc--dense .frencia-sc__today.frencia-sc__c{font-size:15px}
.frencia-sc--dense .frencia-sc__h{padding:8px 3px 6px}
.frencia-sc--dense .frencia-sc__rl{padding:0 4px}
.frencia-sc--dense .frencia-sc__h small{display:block;margin:2px 0 0}
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-sc-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-sc-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Grilla Plan / Anterior / Hoy de una serie. Las columnas salen de los datos
 * que registra el ejercicio (2 a 4 + intensidad); las unidades van en el
 * encabezado para que las celdas entren en 375 px. El plan nunca trae peso.
 */
function SerieComparativa({
  exercise,
  plan = {},
  previous,
  today = {},
  intensity,
  prefs,
  activeKey,
  title,
  className = '',
  ...rest
}) {
  const M = (window.FrenciaDesignSystem_377129 || {}).ExerciseMetrics;
  if (!M) return null;
  const scale = intensity !== undefined ? intensity : plan.intensity;
  const cols = M.columns(exercise, prefs, scale);
  const pick = (row, k) => row ? k === 'int' ? row.intensityValue : row[k] : null;
  const rows = [{
    key: 'plan',
    label: 'Plan',
    data: plan,
    planRow: true
  }, {
    key: 'prev',
    label: 'Anterior',
    data: previous
  }, {
    key: 'today',
    label: 'Hoy',
    data: today
  }];
  const cls = ['frencia-sc', cols.length >= 4 ? 'frencia-sc--dense' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), title ? /*#__PURE__*/React.createElement("div", {
    className: "frencia-sc__title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-sc__t"
  }, title)) : null, /*#__PURE__*/React.createElement("div", {
    className: "frencia-sc__grid",
    style: {
      gridTemplateColumns: `minmax(62px,auto) repeat(${cols.length}, minmax(0,1fr))`
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-sc__h",
    style: {
      textAlign: 'left'
    }
  }), cols.map(c => /*#__PURE__*/React.createElement("span", {
    key: c.key,
    className: "frencia-sc__h"
  }, c.label, c.unit ? /*#__PURE__*/React.createElement("small", null, c.unit) : null)), rows.map(r => {
    const t = r.key === 'today' ? ' frencia-sc__today' : '';
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: r.key
    }, /*#__PURE__*/React.createElement("span", {
      className: 'frencia-sc__rl' + t
    }, r.label), cols.map((c, i) => {
      const raw = r.planRow && c.key === 'peso' ? null : pick(r.data, c.key);
      const txt = M.value(c.key, raw, exercise, prefs, 'table');
      const dash = txt === M.DASH;
      const k = ['frencia-sc__c', t, dash ? ' frencia-sc__c--dash' : '', !dash && c.key === 'int' ? ' frencia-sc__c--int' : '', i === cols.length - 1 ? ' frencia-sc__c--last' : '', r.key === 'today' && activeKey === c.key ? ' frencia-sc__c--active' : ''].join('');
      return /*#__PURE__*/React.createElement("span", {
        key: c.key,
        className: k
      }, txt);
    }));
  })));
}
Object.assign(__ds_scope, { SerieComparativa });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/log/SerieComparativa.jsx", error: String((e && e.message) || e) }); }

// components/log/SeriesTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.frencia-st{display:grid;align-items:center;column-gap:6px}
.frencia-st__h{font-family:var(--font-mono);font-weight:var(--fw-medium);font-size:10px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-tertiary);padding:0 6px 6px;text-align:right;white-space:nowrap}
.frencia-st__h small{font-size:10px;color:var(--text-disabled);margin-left:3px;text-transform:none}
.frencia-st__i{font-family:var(--font-mono);font-weight:var(--fw-bold);font-size:12px;color:var(--text-tertiary);padding:9px 6px;border-top:1px solid var(--divider)}
.frencia-st__c{font-family:var(--font-mono);font-weight:var(--fw-semibold);font-size:15px;color:var(--text-primary);font-variant-numeric:tabular-nums;text-align:right;padding:9px 6px;white-space:nowrap;border-top:1px solid var(--divider)}
.frencia-st__c--dash{color:var(--text-disabled);font-weight:var(--fw-medium)}
.frencia-st__c--int{color:var(--intensity-text)}
`;
if (typeof document !== 'undefined' && !document.getElementById('frencia-st-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-st-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Series registradas de un ejercicio (historial). Mismas columnas que SerieComparativa. */
function SeriesTable({
  exercise,
  sets = [],
  intensity,
  prefs,
  className = '',
  ...rest
}) {
  const M = (window.FrenciaDesignSystem_377129 || {}).ExerciseMetrics;
  if (!M) return null;
  const cols = M.columns(exercise, prefs, intensity);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['frencia-st', className].filter(Boolean).join(' '),
    style: {
      gridTemplateColumns: `28px repeat(${cols.length}, minmax(0,1fr))`
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "frencia-st__h",
    style: {
      textAlign: 'left'
    }
  }, "#"), cols.map(c => /*#__PURE__*/React.createElement("span", {
    key: c.key,
    className: "frencia-st__h"
  }, c.label, c.unit ? /*#__PURE__*/React.createElement("small", null, c.unit) : null)), sets.map((s, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-st__i"
  }, i + 1), cols.map(c => {
    const txt = M.value(c.key, c.key === 'int' ? s.intensityValue : s[c.key], exercise, prefs, 'table');
    const dash = txt === M.DASH;
    return /*#__PURE__*/React.createElement("span", {
      key: c.key,
      className: 'frencia-st__c' + (dash ? ' frencia-st__c--dash' : c.key === 'int' ? ' frencia-st__c--int' : '')
    }, txt);
  }))));
}
Object.assign(__ds_scope, { SeriesTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/log/SeriesTable.jsx", error: String((e && e.message) || e) }); }

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

// design_handoff_hoy_empty_state/data.js
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
  // Day-by-day schedule — navegable con flechas en la tarjeta de sesión
  todayIndex: 2,
  schedule: [{
    rel: 'Anteayer',
    day: 'Mar · 10 jun',
    routine: 'Pierna · A',
    tags: ['Cuádriceps', 'Glúteo', 'Femoral'],
    exercisesTotal: 6,
    exercisesDone: 6,
    status: 'done',
    volume: '21 050',
    volumeUnit: 'kg'
  }, {
    rel: 'Ayer',
    day: 'Mié · 11 jun',
    routine: 'Tirón · A',
    tags: ['Espalda', 'Bíceps'],
    exercisesTotal: 6,
    exercisesDone: 6,
    status: 'done',
    volume: '14 220',
    volumeUnit: 'kg'
  }, {
    rel: 'Hoy',
    day: 'Jue · 12 jun',
    routine: 'Empuje · A',
    tags: ['Pecho', 'Hombro', 'Tríceps'],
    exercisesTotal: 5,
    exercisesDone: 0,
    status: 'today',
    lastDone: 'hace 3 días'
  }, {
    rel: 'Mañana',
    day: 'Vie · 13 jun',
    routine: 'Pierna · B',
    tags: ['Cuádriceps', 'Pantorrilla'],
    exercisesTotal: 6,
    exercisesDone: 0,
    status: 'planned'
  }, {
    rel: 'Pasado mañana',
    day: 'Sáb · 14 jun',
    routine: 'Descanso',
    tags: ['Movilidad', 'Cardio suave'],
    exercisesTotal: 0,
    exercisesDone: 0,
    status: 'rest'
  }],
  lastPR: {
    exercise: 'Press banca',
    value: '85',
    unit: 'kg',
    date: '09 DE JUNIO',
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
      date: '09 DE JUNIO',
      value: '85',
      unit: 'kg',
      reps: 5,
      est: '98'
    }, {
      date: '26 DE MAYO',
      value: '82.5',
      unit: 'kg',
      reps: 6,
      est: '96'
    }, {
      date: '12 DE MAYO',
      value: '80',
      unit: 'kg',
      reps: 6,
      est: '93'
    }]
  },
  // Routines library
  routines: [{
    name: 'Empuje · A',
    focus: 'Pecho · Hombro · Tríceps',
    exercises: 5,
    sets: 18,
    mins: 55,
    last: 'hace 3 días',
    active: true
  }, {
    name: 'Tirón · A',
    focus: 'Espalda · Bíceps',
    exercises: 6,
    sets: 20,
    mins: 60,
    last: 'hace 5 días',
    active: false
  }, {
    name: 'Pierna · A',
    focus: 'Cuádriceps · Glúteo · Femoral',
    exercises: 6,
    sets: 22,
    mins: 65,
    last: 'hace 7 días',
    active: false
  }, {
    name: 'Full Body · Express',
    focus: 'Cuerpo completo',
    exercises: 4,
    sets: 12,
    mins: 35,
    last: 'hace 2 semanas',
    active: false
  }],
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_hoy_empty_state/data.js", error: String((e && e.message) || e) }); }

// design_handoff_hoy_empty_state/ios-frame.jsx
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_hoy_empty_state/ios-frame.jsx", error: String((e && e.message) || e) }); }

// design_handoff_tipos_de_ejercicio/ui_kits/ios_app/log-fallback.js
try { (() => {
// Respaldo: si el bundle todavía no incluye components/log (recién agregados),
// los transpila desde la fuente. No hace nada cuando el bundle ya los trae.
(function () {
  var NS = window.FrenciaDesignSystem_377129 = window.FrenciaDesignSystem_377129 || {};
  var files = ['ExerciseMetrics', 'DurationField', 'DistanceField', 'IsoTimer', 'RestRing', 'SerieComparativa', 'SeriesTable', 'ExerciseSummary', 'ExerciseTypeTag', 'ExerciseConfig'];
  var base = document.currentScript.getAttribute('data-base') || '../../components/log/';
  if (files.every(function (f) {
    return NS[f];
  })) {
    window.__frenciaLogReady = Promise.resolve();
    return;
  }
  window.__frenciaLogReady = Promise.all(files.map(function (f) {
    return fetch(base + f + '.jsx.txt').then(function (r) {
      return r.text();
    }).then(function (src) {
      return [f, src];
    });
  })).then(function (list) {
    list.forEach(function (pair) {
      var src = pair[1].replace(/^import[^\n]*\n/gm, '').replace(/^export\s+/gm, '');
      var code = Babel.transform(src, {
        presets: ['react']
      }).code;
      NS[pair[0]] = new Function('React', code + '\nreturn ' + pair[0] + ';')(React);
    });
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_tipos_de_ejercicio/ui_kits/ios_app/log-fallback.js", error: String((e && e.message) || e) }); }

// design_handoff_tipos_de_ejercicio/ui_kits/ios_app/tipos.data.js
try { (() => {
// Frencia — catálogo con tipos de ejercicio, planes del día, sesión e historial (mock).
window.FRENCIA_TIPOS = {
  prefs: {
    weight: 'kg',
    dist: 'km'
  },
  exercises: {
    press: {
      id: 'press',
      name: 'Press banca',
      muscle: 'Pecho',
      kind: 'fuerza',
      metrics: ['peso', 'reps']
    },
    plancha: {
      id: 'plancha',
      name: 'Plancha',
      muscle: 'Core',
      kind: 'isometrico',
      metrics: ['tiempo']
    },
    sentIso: {
      id: 'sentIso',
      name: 'Sentadilla isométrica con barra',
      muscle: 'Cuádriceps',
      kind: 'isometrico',
      metrics: ['peso', 'tiempo']
    },
    cinta: {
      id: 'cinta',
      name: 'Cinta',
      muscle: 'Cardio',
      kind: 'cardio',
      metrics: ['tiempo', 'distancia'],
      distScale: 'larga'
    },
    soga: {
      id: 'soga',
      name: 'Soga',
      muscle: 'Cardio',
      kind: 'cardio',
      metrics: ['tiempo']
    },
    granjero: {
      id: 'granjero',
      name: 'Paseo de granjero',
      muscle: 'Agarre · Core',
      kind: 'hibrido',
      metrics: ['peso', 'distancia'],
      distScale: 'corta'
    },
    colgado: {
      id: 'colgado',
      name: 'Colgado en barra con lastre',
      muscle: 'Agarre · Espalda',
      kind: 'hibrido',
      metrics: ['peso', 'tiempo']
    },
    sentadilla: {
      id: 'sentadilla',
      name: 'Sentadilla',
      muscle: 'Cuádriceps',
      kind: 'fuerza',
      metrics: ['peso', 'reps']
    },
    dominadas: {
      id: 'dominadas',
      name: 'Dominadas',
      muscle: 'Espalda',
      kind: 'fuerza',
      metrics: ['peso', 'reps']
    },
    hollow: {
      id: 'hollow',
      name: 'Hollow hold',
      muscle: 'Core',
      kind: 'isometrico',
      metrics: ['tiempo']
    },
    remo: {
      id: 'remo',
      name: 'Remo ergómetro',
      muscle: 'Cardio',
      kind: 'cardio',
      metrics: ['tiempo', 'distancia'],
      distScale: 'corta'
    },
    bici: {
      id: 'bici',
      name: 'Bicicleta fija',
      muscle: 'Cardio',
      kind: 'cardio',
      metrics: ['tiempo', 'distancia'],
      distScale: 'larga'
    },
    trineo: {
      id: 'trineo',
      name: 'Empuje de trineo',
      muscle: 'Piernas',
      kind: 'hibrido',
      metrics: ['peso', 'distancia'],
      distScale: 'corta'
    }
  },
  catalogOrder: ['press', 'sentadilla', 'dominadas', 'plancha', 'hollow', 'sentIso', 'cinta', 'bici', 'remo', 'soga', 'granjero', 'trineo', 'colgado'],
  // Plan de cada ejemplo dentro de un día. Nunca trae peso.
  plans: {
    press: {
      sets: 4,
      reps: 10,
      intensity: 'RIR',
      intensityValue: 2,
      rest: 120
    },
    plancha: {
      sets: 3,
      tiempo: 45,
      intensity: 'RIR',
      intensityValue: 1,
      rest: 60
    },
    sentIso: {
      sets: 4,
      tiempo: 30,
      intensity: 'RIR',
      intensityValue: 2,
      rest: 120
    },
    cinta: {
      sets: 1,
      tiempo: 1800,
      distancia: 5,
      intensity: 'RPE',
      intensityValue: 6,
      rest: null
    },
    soga: {
      sets: 5,
      tiempo: 60,
      intensity: 'RPE',
      intensityValue: 8,
      rest: 30
    },
    granjero: {
      sets: 3,
      distancia: 40,
      intensity: null,
      rest: 90
    },
    colgado: {
      sets: 3,
      tiempo: 30,
      intensity: 'RIR',
      intensityValue: 1,
      rest: 120
    }
  },
  dayOrder: ['press', 'sentIso', 'colgado', 'granjero', 'plancha', 'soga', 'cinta'],
  // Sesión en curso: serie actual, anterior y lo cargado hasta ahora.
  session: {
    plancha: {
      serie: 2,
      previous: {
        tiempo: 42,
        intensityValue: 1
      },
      done: [{
        tiempo: 47,
        intensityValue: 1
      }]
    },
    cinta: {
      serie: 1,
      previous: {
        tiempo: 1800,
        distancia: 4.82,
        intensityValue: 6
      },
      done: []
    },
    granjero: {
      serie: 2,
      previous: {
        peso: 32,
        distancia: 40
      },
      done: [{
        peso: 36,
        distancia: 40
      }]
    }
  },
  // Detalle de historial: sesión con tipos mezclados.
  history: {
    date: 'Jue 12 jun',
    time: '07:42',
    routine: 'Full Body · B',
    duration: 4212,
    items: [{
      ex: 'press',
      intensity: 'RIR',
      sets: [{
        peso: 82.5,
        reps: 10,
        intensityValue: 2
      }, {
        peso: 82.5,
        reps: 10,
        intensityValue: 1
      }, {
        peso: 85,
        reps: 8,
        intensityValue: 1
      }, {
        peso: 85,
        reps: 7,
        intensityValue: 0
      }]
    }, {
      ex: 'colgado',
      intensity: 'RIR',
      sets: [{
        peso: 10,
        tiempo: 32,
        intensityValue: 1
      }, {
        peso: 10,
        tiempo: 30,
        intensityValue: 1
      }, {
        peso: 10,
        tiempo: 26,
        intensityValue: 0
      }]
    }, {
      ex: 'granjero',
      intensity: null,
      sets: [{
        peso: 32,
        distancia: 40
      }, {
        peso: 36,
        distancia: 40
      }, {
        peso: 36,
        distancia: 35
      }]
    }, {
      ex: 'plancha',
      intensity: 'RIR',
      sets: [{
        tiempo: 47,
        intensityValue: 1
      }, {
        tiempo: 45,
        intensityValue: 1
      }, {
        tiempo: 51,
        intensityValue: null
      }]
    }, {
      ex: 'cinta',
      intensity: 'RPE',
      sets: [{
        tiempo: 1815,
        distancia: 5.04,
        intensityValue: 6
      }]
    }]
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_tipos_de_ejercicio/ui_kits/ios_app/tipos.data.js", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/CatalogScreen.jsx
try { (() => {
// Buscador del catálogo (primera cara de ExercisePickerModal) y lista del día.
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function CatalogScreen({
  initialFilter = 'todos',
  initialQuery = '',
  onPick
}) {
  const NS = window.FrenciaDesignSystem_377129;
  const {
    Tag,
    IconButton,
    ExerciseTypeTag,
    ExerciseMetrics: M
  } = NS;
  const D = window.FRENCIA_TIPOS;
  const [q, setQ] = React.useState(initialQuery);
  const [f, setF] = React.useState(initialFilter);
  React.useEffect(() => {
    window.lucide && lucide.createIcons();
  });
  const all = D.catalogOrder.map(k => D.exercises[k]);
  const filters = [{
    v: 'todos',
    label: 'Todos',
    icon: 'list'
  }].concat(Object.keys(M.KINDS).map(k => ({
    v: k,
    label: M.KINDS[k].label,
    icon: M.KINDS[k].icon
  })));
  const count = v => all.filter(e => v === 'todos' || e.kind === v).length;
  const list = all.filter(e => (f === 'todos' || e.kind === f) && norm(e.name + ' ' + e.muscle).includes(norm(q.trim())));
  const active = filters.find(x => x.v === f);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: '4px 20px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      margin: '0 -8px'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "x",
    variant: "ghost",
    "aria-label": "Cerrar"
  }), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Full Body \xB7 B \xB7 D\xEDa 1")), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-title)',
      color: 'var(--text-primary)'
    }
  }, "Agregar ejercicio"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 48,
      padding: '0 14px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-inset)',
      border: '1px solid var(--border-subtle)',
      color: 'var(--text-tertiary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "search",
    style: {
      width: 18,
      height: 18
    }
  })), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Busc\xE1 por nombre o m\xFAsculo",
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 'none',
      background: 'transparent',
      color: 'var(--text-primary)',
      font: 'var(--fw-medium) 16px var(--font-sans)',
      caretColor: 'var(--accent)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    "aria-label": "Filtrar por tipo",
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      margin: '0 -20px',
      padding: '0 20px 2px',
      scrollbarWidth: 'none'
    }
  }, filters.map(x => {
    const on = x.v === f;
    return /*#__PURE__*/React.createElement(Tag, {
      key: x.v,
      selectable: true,
      selected: on,
      role: "radio",
      "aria-checked": on,
      onClick: () => setF(x.v),
      style: {
        flexShrink: 0,
        minHeight: 36,
        padding: '0 14px',
        fontWeight: on ? 700 : 500
      }
    }, /*#__PURE__*/React.createElement("span", {
      key: on ? 'check' : x.icon,
      style: {
        display: 'inline-flex'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": on ? 'check' : x.icon,
      style: {
        width: 15,
        height: 15
      }
    })), x.label, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--fw-medium) 11px var(--font-mono)',
        opacity: 0.75
      }
    }, count(x.v)));
  })), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, list.length, " ", list.length === 1 ? 'ejercicio' : 'ejercicios', f !== 'todos' ? ` · ${active.label}` : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: -6
    }
  }, list.map(e => /*#__PURE__*/React.createElement("div", {
    key: e.id,
    onClick: () => onPick && onPick(e.id),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '13px 0',
      borderBottom: '1px solid var(--divider)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) 16px var(--font-sans)',
      color: 'var(--text-primary)'
    }
  }, e.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(ExerciseTypeTag, {
    exercise: e
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) 13px var(--font-sans)',
      color: 'var(--text-tertiary)',
      textAlign: 'right',
      maxWidth: 92
    }
  }, e.muscle), /*#__PURE__*/React.createElement(IconButton, {
    icon: "plus",
    variant: "surface",
    size: "sm",
    "aria-label": 'Agregar ' + e.name
  }))), list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '28px 0',
      font: 'var(--text-body-sm)',
      color: 'var(--text-tertiary)'
    }
  }, "No hay ejercicios que coincidan. Prob\xE1 con otro nombre o sac\xE1 el filtro.") : null));
}
function DayPlanScreen({
  onEdit
}) {
  const NS = window.FrenciaDesignSystem_377129;
  const {
    Button,
    IconButton,
    ExerciseSummary,
    ExerciseTypeTag
  } = NS;
  const D = window.FRENCIA_TIPOS;
  React.useEffect(() => {
    window.lucide && lucide.createIcons();
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: '4px 20px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      margin: '0 -8px'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-left",
    variant: "ghost",
    "aria-label": "Volver"
  }), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Rutina \xB7 Full Body B")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-title)',
      color: 'var(--text-primary)'
    }
  }, "D\xEDa 1"), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label",
    style: {
      display: 'block',
      marginTop: 4
    }
  }, D.dayOrder.length, " ejercicios")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, D.dayOrder.map((k, i) => {
    const e = D.exercises[k];
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      onClick: () => onEdit && onEdit(k),
      style: {
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        padding: '14px 14px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        font: 'var(--fw-bold) 13px var(--font-mono)',
        color: 'var(--text-tertiary)'
      }
    }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--fw-semibold) 16px var(--font-sans)',
        color: 'var(--text-primary)'
      }
    }, e.name), /*#__PURE__*/React.createElement(ExerciseSummary, {
      exercise: e,
      plan: D.plans[k],
      prefs: D.prefs
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        color: 'var(--text-tertiary)'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "chevron-right",
      style: {
        width: 18,
        height: 18
      }
    })));
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    icon: "plus",
    fullWidth: true
  }, "Agregar ejercicio"));
}
Object.assign(window, {
  CatalogScreen,
  DayPlanScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/CatalogScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/CreateRoutineWizard.jsx
try { (() => {
// Flujo de creación de rutina — wizard "un dato por pantalla".
// Replica el patrón del setup de perfil: header (volver + dots), cuerpo
// centrado (icono + "Paso X de N" + pregunta display + hint), CTA inferior.
// Solo front: al terminar dispara onFinish; volver en el paso 1 dispara onExit.
function CreateRoutineWizard({
  onExit,
  onFinish
}) {
  const {
    IconButton,
    Button,
    Stepper
  } = window.FrenciaDesignSystem_377129;
  const STEPS = [{
    key: 'name',
    icon: 'pencil-line',
    question: '¿Cómo se\u00a0llama tu rutina?',
    hint: 'Ponle un nombre que reconozcas de un vistazo.'
  }, {
    key: 'days',
    icon: 'calendar-days',
    question: '¿Cuántos días por semana?',
    hint: 'Podrás ajustar los días de cada entreno más adelante.'
  }];
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState('');
  const [days, setDays] = React.useState(3);
  const inputRef = React.useRef(null);
  const total = STEPS.length;
  const current = STEPS[step];
  const isLast = step === total - 1;

  // Validación por paso
  const valid = step === 0 ? name.trim().length > 0 : days >= 1 && days <= 7;
  React.useEffect(() => {
    if (current.key === 'name' && inputRef.current) {
      const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [step]);
  const back = () => {
    step === 0 ? onExit && onExit() : setStep(step - 1);
  };
  const next = () => {
    if (!valid) return;
    isLast ? onFinish && onFinish({
      name: name.trim(),
      days
    }) : setStep(step + 1);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-app)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0,
      paddingTop: 52,
      display: 'grid',
      gridTemplateColumns: '44px 1fr 44px',
      alignItems: 'center',
      padding: '52px 16px 8px'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-left",
    variant: "ghost",
    size: "md",
    onClick: back,
    "aria-label": "Volver"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8
    }
  }, STEPS.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: s.key,
    style: {
      height: 7,
      width: i === step ? 22 : 7,
      borderRadius: 999,
      background: i === step ? 'var(--accent)' : i < step ? 'var(--green-deep)' : 'var(--surface-chip)',
      transition: 'all var(--dur-base) var(--ease-out)'
    }
  }))), /*#__PURE__*/React.createElement("span", null)), /*#__PURE__*/React.createElement("div", {
    key: current.key,
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 24px',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 60,
      borderRadius: 18,
      display: 'grid',
      placeItems: 'center',
      background: 'var(--surface-green-soft)',
      border: '1px solid var(--surface-green-line)',
      color: 'var(--accent-text)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": current.icon,
    style: {
      width: 28,
      height: 28
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-data-label)',
      letterSpacing: 'var(--ls-wider)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, "Paso ", step + 1, " de ", total), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--text-display)',
      fontSize: 40,
      lineHeight: 0.98,
      letterSpacing: 'var(--ls-display)',
      textTransform: 'uppercase',
      color: 'var(--text-primary)',
      margin: 0,
      textWrap: 'balance'
    }
  }, current.question), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--text-body-sm)',
      color: 'var(--text-secondary)',
      margin: 0,
      maxWidth: 300,
      textWrap: 'pretty'
    }
  }, current.hint)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, current.key === 'name' ? /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    value: name,
    onChange: e => setName(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') next();
    },
    placeholder: "Push Pull Legs",
    maxLength: 40,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      background: 'var(--surface-inset)',
      border: '1.5px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '16px 18px',
      color: 'var(--text-primary)',
      font: 'var(--fw-semibold) 18px var(--font-sans)',
      outline: 'none',
      caretColor: 'var(--accent)',
      transition: 'border-color var(--dur-fast) var(--ease-out)'
    },
    onFocus: e => {
      e.target.style.borderColor = 'var(--accent)';
    },
    onBlur: e => {
      e.target.style.borderColor = 'var(--border-default)';
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    value: days,
    onChange: setDays,
    min: 1,
    max: 7,
    unit: "d\xEDas",
    size: "lg"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body-sm)',
      color: 'var(--text-tertiary)',
      maxWidth: 130,
      textWrap: 'pretty'
    }
  }, days === 1 ? '1 día por semana' : `${days} días por semana`)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0,
      padding: '12px 20px 30px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    key: 'cta-' + step,
    variant: "primary",
    size: "lg",
    fullWidth: true,
    iconRight: isLast ? undefined : 'arrow-right',
    icon: isLast ? 'check' : undefined,
    disabled: !valid,
    onClick: next
  }, isLast ? 'Crear rutina' : 'Siguiente')));
}
window.CreateRoutineWizard = CreateRoutineWizard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/CreateRoutineWizard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/HistoryDetailScreen.jsx
try { (() => {
// Detalle de una sesión del historial con tipos mezclados.
function HistoryDetailScreen() {
  const NS = window.FrenciaDesignSystem_377129;
  const {
    IconButton,
    StatTile,
    SeriesTable,
    ExerciseSummary,
    ExerciseTypeTag,
    ExerciseMetrics: M
  } = NS;
  const D = window.FRENCIA_TIPOS;
  const H = D.history;
  React.useEffect(() => {
    window.lucide && lucide.createIcons();
  });
  const totalSets = H.items.reduce((n, it) => n + it.sets.length, 0);
  const tonnage = H.items.filter(it => D.exercises[it.ex].kind === 'fuerza').reduce((n, it) => n + it.sets.reduce((m, s) => m + (s.peso || 0) * (s.reps || 0), 0), 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      padding: '4px 20px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      margin: '0 -8px'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-left",
    variant: "ghost",
    "aria-label": "Volver al historial"
  }), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, H.date, " \xB7 ", H.time)), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-title)',
      color: 'var(--text-primary)'
    }
  }, H.routine), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
      gap: 12,
      padding: '16px',
      borderRadius: 'var(--radius-xl)',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    label: "Duraci\xF3n",
    value: M.clock(H.duration),
    size: "sm"
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "Series",
    value: String(totalSets),
    size: "sm"
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "Volumen",
    value: String(tonnage).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    unit: "kg",
    size: "sm"
  })), H.items.map(it => {
    const e = D.exercises[it.ex];
    return /*#__PURE__*/React.createElement("div", {
      key: it.ex,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '16px 14px 10px',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        padding: '0 2px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--fw-bold) 17px var(--font-sans)',
        color: 'var(--text-primary)'
      }
    }, e.name), /*#__PURE__*/React.createElement(ExerciseTypeTag, {
      exercise: e
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "frencia-label"
    }, "Plan"), /*#__PURE__*/React.createElement(ExerciseSummary, {
      exercise: e,
      plan: D.plans[it.ex],
      prefs: D.prefs
    }))), /*#__PURE__*/React.createElement(SeriesTable, {
      exercise: e,
      sets: it.sets,
      intensity: it.intensity,
      prefs: D.prefs
    }));
  }));
}
window.HistoryDetailScreen = HistoryDetailScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/HistoryDetailScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/HomeEmpty.jsx
try { (() => {
// Estado vacío de "Hoy" — cuenta recién creada, sin rutinas ni historial.
// Onboarding editorial: placeholder de sesión + primeros pasos.
function HomeEmpty({
  onCreate
}) {
  const {
    Avatar,
    Badge,
    Button
  } = window.FrenciaDesignSystem_377129;
  const d = window.FRENCIA_DATA;
  const first = d.user.name.split(' ')[0];
  const steps = [{
    n: 1,
    title: 'Crea tu primera rutina',
    sub: 'Define ejercicios, series y repeticiones',
    icon: 'list-plus',
    state: 'active'
  }, {
    n: 2,
    title: 'Registra una sesión',
    sub: 'Anota peso, reps y RIR mientras entrenas',
    icon: 'pencil-line',
    state: 'locked'
  }, {
    n: 3,
    title: 'Sigue tu progreso',
    sub: 'PRs, volumen semanal y 1RM estimado',
    icon: 'trending-up',
    state: 'locked'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '56px 20px 120px',
      display: 'flex',
      flexDirection: 'column',
      gap: 22
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
  }, "Hola, ", first), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Jueves \xB7 12 jun"))), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "D\xEDa 1")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      border: '1.5px dashed var(--border-default)',
      borderRadius: 22,
      background: 'var(--surface-card)',
      padding: '30px 22px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 14,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0.5,
      pointerEvents: 'none',
      background: 'repeating-linear-gradient(135deg, transparent 0 13px, rgba(255,255,255,0.014) 13px 14px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 60,
      borderRadius: 18,
      display: 'grid',
      placeItems: 'center',
      background: 'var(--surface-green-soft)',
      border: '1px solid var(--surface-green-line)',
      color: 'var(--accent-text)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "dumbbell",
    style: {
      width: 28,
      height: 28
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-data-label)',
      letterSpacing: 'var(--ls-wider)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, "Tu sesi\xF3n de hoy"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-display)',
      fontSize: 38,
      color: 'var(--text-primary)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--ls-display)',
      lineHeight: 0.96
    }
  }, "Empieza", /*#__PURE__*/React.createElement("br", null), "aqu\xED"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--text-body-sm)',
      color: 'var(--text-secondary)',
      margin: '2px auto 0',
      maxWidth: 260,
      textWrap: 'pretty'
    }
  }, "A\xFAn no tienes rutinas. Crea la primera y registra cada serie a tu manera.")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      position: 'relative',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    icon: "plus",
    fullWidth: true,
    onClick: onCreate
  }, "Crear primera rutina"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar-off",
    style: {
      width: 13,
      height: 13,
      color: 'var(--text-tertiary)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Sin sesiones programadas"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      padding: '0 2px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Primeros pasos"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-data-label)',
      color: 'var(--text-tertiary)'
    }
  }, "0 / 3")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      borderRadius: 20,
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden'
    }
  }, steps.map((s, i) => {
    const active = s.state === 'active';
    return /*#__PURE__*/React.createElement("div", {
      key: s.n,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 16px',
        borderTop: i === 0 ? 'none' : '1px solid var(--divider)',
        cursor: active ? 'pointer' : 'default',
        opacity: active ? 1 : 0.62
      },
      onClick: active ? onCreate : undefined
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flexShrink: 0,
        width: 34,
        height: 34,
        borderRadius: 11,
        display: 'grid',
        placeItems: 'center',
        background: active ? 'var(--accent)' : 'transparent',
        border: active ? 'none' : '1.5px solid var(--border-default)',
        color: active ? 'var(--text-on-accent)' : 'var(--text-tertiary)',
        font: 'var(--fw-bold) 14px var(--font-mono)'
      }
    }, s.n), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--fw-semibold) 15px var(--font-sans)',
        color: 'var(--text-primary)'
      }
    }, s.title), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--text-body-sm)',
        fontSize: 12.5,
        color: 'var(--text-tertiary)'
      }
    }, s.sub)), /*#__PURE__*/React.createElement("i", {
      "data-lucide": active ? 'chevron-right' : 'lock',
      style: {
        width: 17,
        height: 17,
        color: active ? 'var(--accent-text)' : 'var(--text-disabled)',
        flexShrink: 0
      }
    }));
  }))));
}
window.HomeEmpty = HomeEmpty;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/HomeEmpty.jsx", error: String((e && e.message) || e) }); }

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
    MetricPill,
    IconButton
  } = window.FrenciaDesignSystem_377129;
  const d = window.FRENCIA_DATA;
  const [idx, setIdx] = React.useState(d.todayIndex);
  const sched = d.schedule;
  const day = sched[idx];
  const atStart = idx === 0;
  const atEnd = idx === sched.length - 1;
  const statusBadge = {
    done: /*#__PURE__*/React.createElement(Badge, {
      key: "b-done",
      tone: "green",
      icon: "check"
    }, "Hecho"),
    today: /*#__PURE__*/React.createElement(Badge, {
      key: "b-today",
      tone: "neutral"
    }, "hace 3 d\xEDas"),
    planned: /*#__PURE__*/React.createElement(Badge, {
      key: "b-planned",
      tone: "neutral"
    }, "Planeado"),
    rest: /*#__PURE__*/React.createElement(Badge, {
      key: "b-rest",
      tone: "neutral"
    }, "Descanso")
  }[day.status];
  const action = {
    today: /*#__PURE__*/React.createElement(Button, {
      key: "today",
      variant: "primary",
      size: "lg",
      icon: "play",
      fullWidth: true,
      onClick: onStart
    }, "Empezar entrenamiento"),
    done: /*#__PURE__*/React.createElement(Button, {
      key: "done",
      variant: "secondary",
      size: "lg",
      icon: "list",
      fullWidth: true
    }, "Ver resumen"),
    planned: /*#__PURE__*/React.createElement(Button, {
      key: "planned",
      variant: "secondary",
      size: "lg",
      icon: "play",
      fullWidth: true,
      onClick: onStart
    }, "Empezar antes"),
    rest: /*#__PURE__*/React.createElement(Button, {
      key: "rest",
      variant: "secondary",
      size: "lg",
      icon: "activity",
      fullWidth: true
    }, "Registrar actividad")
  }[day.status];
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
  }, d.user.streak, " d\xEDas")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "elevated",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label",
    style: {
      color: day.status === 'today' ? 'var(--accent-text)' : 'var(--text-tertiary)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, day.rel, " \xB7 ", day.day), /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0
    }
  }, statusBadge)), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-title)',
      color: 'var(--text-primary)',
      marginTop: -4
    }
  }, day.routine), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, day.tags.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    dot: true
  }, t))), day.exercisesTotal > 0 ? /*#__PURE__*/React.createElement(ProgressBar, {
    segments: day.exercisesTotal,
    value: day.exercisesDone,
    label: "Ejercicios",
    showValue: true,
    tone: day.status === 'done' ? 'green' : undefined
  }) : null, day.status === 'done' ? /*#__PURE__*/React.createElement(MetricPill, {
    icon: "dumbbell",
    label: "Volumen",
    value: `${day.volume} ${day.volumeUnit}`,
    tone: "green",
    layout: "inline"
  }) : null, action), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '50%',
      left: -14,
      transform: 'translateY(-50%)',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-left",
    variant: "surface",
    size: "sm",
    round: true,
    disabled: atStart,
    onClick: () => setIdx(i => Math.max(0, i - 1))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '50%',
      right: -14,
      transform: 'translateY(-50%)',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-right",
    variant: "surface",
    size: "sm",
    round: true,
    disabled: atEnd,
    onClick: () => setIdx(i => Math.min(sched.length - 1, i + 1))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6
    }
  }, sched.map((s, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setIdx(i),
    "aria-label": s.day,
    style: {
      width: i === idx ? 18 : 6,
      height: 6,
      borderRadius: 999,
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      background: i === idx ? s.status === 'today' ? 'var(--accent)' : 'var(--text-secondary)' : i === d.todayIndex ? 'var(--accent-text)' : 'var(--border-strong)',
      transition: 'width .18s ease'
    }
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

// ui_kits/ios_app/RoutinesScreen.jsx
try { (() => {
function RoutinesScreen({
  onStart
}) {
  const {
    Card,
    Button,
    Badge,
    Tag
  } = window.FrenciaDesignSystem_377129;
  const routines = window.FRENCIA_DATA.routines;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '56px 20px 120px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Mis rutinas"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-title)',
      color: 'var(--text-primary)',
      marginTop: 4
    }
  }, "Programa")), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, routines.length)), routines.map((r, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    variant: r.active ? 'elevated' : 'default',
    hairline: !r.active,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-bold) 17px var(--font-sans)',
      color: 'var(--text-primary)'
    }
  }, r.name), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label",
    style: {
      display: 'block',
      marginTop: 3
    }
  }, r.focus)), r.active ? /*#__PURE__*/React.createElement(Badge, {
    tone: "orange",
    icon: "flame"
  }, "Activa") : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    dot: true
  }, r.exercises, " ejercicios"), /*#__PURE__*/React.createElement(Tag, {
    dot: true
  }, r.sets, " series"), /*#__PURE__*/React.createElement(Tag, {
    dot: true
  }, "~", r.mins, " min")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "\xDAltima \xB7 ", r.last), /*#__PURE__*/React.createElement(Button, {
    variant: r.active ? 'primary' : 'secondary',
    size: "sm",
    icon: "play",
    onClick: onStart
  }, r.active ? 'Empezar' : 'Iniciar')))), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    icon: "plus",
    fullWidth: true
  }, "Nueva rutina"));
}
window.RoutinesScreen = RoutinesScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/RoutinesScreen.jsx", error: String((e && e.message) || e) }); }

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

// ui_kits/ios_app/SessionTypedScreen.jsx
try { (() => {
// Registro de sesión por datos del ejercicio (no por tipo).
function SessionTypedScreen({
  exKey,
  timerPhase = 'idle',
  timerElapsed = 0,
  index = '5 / 7'
}) {
  const NS = window.FrenciaDesignSystem_377129;
  const {
    Card,
    Button,
    IconButton,
    Stepper,
    SegmentedControl,
    ProgressBar,
    Badge,
    DurationField,
    DistanceField,
    IsoTimer,
    RestRing,
    SerieComparativa,
    SeriesTable,
    ExerciseSummary,
    ExerciseMetrics: M
  } = NS;
  const D = window.FRENCIA_TIPOS;
  const ex = D.exercises[exKey];
  const plan = D.plans[exKey];
  const ses = D.session[exKey];
  const ms = M.metrics(ex);
  const unit = M.distUnit(ex, D.prefs);
  const blank = () => ({
    peso: ms.includes('peso') ? ses.previous && ses.previous.peso : null,
    reps: null,
    tiempo: null,
    distancia: null,
    intensityValue: null
  });
  const [done, setDone] = React.useState(ses.done);
  const [cur, setCur] = React.useState(blank);
  const [resting, setResting] = React.useState(false);
  const [timerKey, setTimerKey] = React.useState(0);
  const set = (k, v) => setCur(c => ({
    ...c,
    [k]: v
  }));
  React.useEffect(() => {
    window.lucide && lucide.createIcons();
  });
  const serie = done.length + 1;
  const finished = done.length >= plan.sets;
  const vol = M.planMetrics(ex);
  const ready = vol.every(k => cur[k] != null && cur[k] > 0) && (!ms.includes('peso') || cur.peso != null);
  const timed = ms.includes('tiempo') && ex.kind !== 'cardio';
  const firstEmpty = ms.find(k => cur[k] == null);
  const register = () => {
    setDone(d => d.concat([cur]));
    setCur(blank());
    setTimerKey(k => k + 1);
    if (M.restVisible(ex, plan.sets) && done.length + 1 < plan.sets) setResting(true);
  };
  const rows = done.concat(Array.from({
    length: Math.max(0, plan.sets - done.length)
  }, () => ({})));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: '4px 20px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Ejercicio ", index, " \xB7 ", ex.muscle), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-title)',
      color: 'var(--text-primary)',
      marginTop: 4
    }
  }, ex.name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Plan"), /*#__PURE__*/React.createElement(ExerciseSummary, {
    exercise: ex,
    plan: plan,
    prefs: D.prefs
  }))), /*#__PURE__*/React.createElement(IconButton, {
    icon: "more-horizontal",
    variant: "surface",
    "aria-label": "M\xE1s opciones"
  })), plan.sets > 1 ? /*#__PURE__*/React.createElement(ProgressBar, {
    segments: plan.sets,
    value: done.length,
    tone: "green"
  }) : null, !finished ? /*#__PURE__*/React.createElement(SerieComparativa, {
    exercise: ex,
    plan: plan,
    previous: ses.previous,
    today: cur,
    prefs: D.prefs,
    activeKey: firstEmpty,
    title: plan.sets > 1 ? `Serie ${serie} de ${plan.sets}` : 'Serie única'
  }) : null, resting ? /*#__PURE__*/React.createElement(RestRing, {
    total: plan.rest,
    next: `Sigue la serie ${serie} de ${plan.sets}.`,
    onSkip: () => setResting(false),
    onDone: () => setResting(false)
  }) : finished ? /*#__PURE__*/React.createElement(Card, {
    variant: "green",
    style: {
      textAlign: 'center',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 28,
      color: 'var(--accent-text)',
      textTransform: 'uppercase'
    }
  }, "Ejercicio completo"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, "Siguiente: Soga")) : /*#__PURE__*/React.createElement(Card, {
    variant: "elevated",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, ms.includes('peso') ? /*#__PURE__*/React.createElement(Stepper, {
    label: "Peso",
    value: cur.peso || 0,
    onChange: v => set('peso', v),
    step: 2,
    precision: 1,
    unit: D.prefs.weight,
    size: "lg"
  }) : null, ms.includes('reps') ? /*#__PURE__*/React.createElement(Stepper, {
    label: "Reps",
    value: cur.reps || 0,
    onChange: v => set('reps', v),
    size: "lg"
  }) : null, timed ? /*#__PURE__*/React.createElement(IsoTimer, {
    key: timerKey,
    target: plan.tiempo,
    value: cur.tiempo,
    onChange: v => set('tiempo', v),
    initialPhase: timerKey === 0 ? timerPhase : 'idle',
    initialElapsed: timerKey === 0 ? timerElapsed : 0,
    style: {
      margin: '0 -8px'
    }
  }) : null, ms.includes('tiempo') && !timed ? /*#__PURE__*/React.createElement(DurationField, {
    label: "Tiempo",
    value: cur.tiempo,
    onChange: v => set('tiempo', v),
    step: 60,
    allowHours: true,
    size: "lg",
    fullWidth: true
  }) : null, ms.includes('distancia') ? /*#__PURE__*/React.createElement(DistanceField, {
    label: "Distancia",
    value: cur.distancia,
    onChange: v => set('distancia', v),
    unit: unit,
    size: "lg",
    fullWidth: true
  }) : null, plan.intensity === 'RIR' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "RIR \xB7 cu\xE1nto te qued\xF3"), /*#__PURE__*/React.createElement(SegmentedControl, {
    fullWidth: true,
    value: cur.intensityValue,
    onChange: v => set('intensityValue', v),
    options: [{
      value: 0,
      label: '0'
    }, {
      value: 1,
      label: '1'
    }, {
      value: 2,
      label: '2'
    }, {
      value: 3,
      label: '3'
    }, {
      value: 4,
      label: '4+'
    }]
  })) : plan.intensity === 'RPE' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "RPE \xB7 qu\xE9 tan duro fue"), /*#__PURE__*/React.createElement(SegmentedControl, {
    fullWidth: true,
    value: cur.intensityValue,
    onChange: v => set('intensityValue', v),
    options: [5, 6, 7, 8, 9, 10].map(n => ({
      value: n,
      label: String(n)
    }))
  })) : null, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    icon: "check",
    fullWidth: true,
    disabled: !ready,
    onClick: register
  }, "Registrar serie")), plan.sets > 1 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Series de hoy"), /*#__PURE__*/React.createElement(SeriesTable, {
    exercise: ex,
    sets: rows,
    intensity: plan.intensity,
    prefs: D.prefs
  })) : null);
}

// Esfuerzo vs descanso, lado a lado.
function TimerCompareScreen() {
  const {
    IsoTimer,
    RestRing
  } = window.FrenciaDesignSystem_377129;
  React.useEffect(() => {
    window.lucide && lucide.createIcons();
  });
  const Row = ({
    t,
    d
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '92px 1fr 1fr',
      gap: 8,
      padding: '9px 0',
      borderTop: '1px solid var(--divider)',
      font: 'var(--fw-regular) 13px/1.35 var(--font-sans)',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, t), /*#__PURE__*/React.createElement("span", null, d[0]), /*#__PURE__*/React.createElement("span", null, d[1]));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: '4px 20px 28px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "frencia-label"
  }, "Mide el esfuerzo"), /*#__PURE__*/React.createElement(IsoTimer, {
    target: 45,
    initialPhase: "running",
    initialElapsed: 38
  }), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label",
    style: {
      marginTop: 6
    }
  }, "Mide la pausa"), /*#__PURE__*/React.createElement(RestRing, {
    total: 60,
    remaining: 42,
    next: "Sigue la serie 3 de 3."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '92px 1fr 1fr',
      gap: 8,
      paddingBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label",
    style: {
      color: 'var(--intensity-text)'
    }
  }, "IsoTimer"), /*#__PURE__*/React.createElement("span", {
    className: "frencia-label",
    style: {
      color: 'var(--accent-text)'
    }
  }, "RestRing")), /*#__PURE__*/React.createElement(Row, {
    t: "Forma",
    d: ['Barra horizontal con marca de objetivo', 'Anillo que se vacía']
  }), /*#__PURE__*/React.createElement(Row, {
    t: "Sentido",
    d: ['Sube desde 0:00', 'Baja hasta 0:00']
  }), /*#__PURE__*/React.createElement(Row, {
    t: "Cifra",
    d: ['Anton grande', 'Mono dentro del anillo']
  }), /*#__PURE__*/React.createElement(Row, {
    t: "Color",
    d: ['Naranja: esfuerzo', 'Verde: pausa']
  }), /*#__PURE__*/React.createElement(Row, {
    t: "Etiqueta",
    d: ['ESFUERZO', 'DESCANSO']
  }), /*#__PURE__*/React.createElement(Row, {
    t: "Resultado",
    d: ['Completa la duración de la serie', 'No se registra']
  })));
}
Object.assign(window, {
  SessionTypedScreen,
  TimerCompareScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/SessionTypedScreen.jsx", error: String((e && e.message) || e) }); }

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
  // Day-by-day schedule — navegable con flechas en la tarjeta de sesión
  todayIndex: 2,
  schedule: [{
    rel: 'Anteayer',
    day: 'Mar · 10 jun',
    routine: 'Pierna · A',
    tags: ['Cuádriceps', 'Glúteo', 'Femoral'],
    exercisesTotal: 6,
    exercisesDone: 6,
    status: 'done',
    volume: '21 050',
    volumeUnit: 'kg'
  }, {
    rel: 'Ayer',
    day: 'Mié · 11 jun',
    routine: 'Tirón · A',
    tags: ['Espalda', 'Bíceps'],
    exercisesTotal: 6,
    exercisesDone: 6,
    status: 'done',
    volume: '14 220',
    volumeUnit: 'kg'
  }, {
    rel: 'Hoy',
    day: 'Jue · 12 jun',
    routine: 'Empuje · A',
    tags: ['Pecho', 'Hombro', 'Tríceps'],
    exercisesTotal: 5,
    exercisesDone: 0,
    status: 'today',
    lastDone: 'hace 3 días'
  }, {
    rel: 'Mañana',
    day: 'Vie · 13 jun',
    routine: 'Pierna · B',
    tags: ['Cuádriceps', 'Pantorrilla'],
    exercisesTotal: 6,
    exercisesDone: 0,
    status: 'planned'
  }, {
    rel: 'Pasado mañana',
    day: 'Sáb · 14 jun',
    routine: 'Descanso',
    tags: ['Movilidad', 'Cardio suave'],
    exercisesTotal: 0,
    exercisesDone: 0,
    status: 'rest'
  }],
  lastPR: {
    exercise: 'Press banca',
    value: '85',
    unit: 'kg',
    date: '09 DE JUNIO',
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
      date: '09 DE JUNIO',
      value: '85',
      unit: 'kg',
      reps: 5,
      est: '98'
    }, {
      date: '26 DE MAYO',
      value: '82.5',
      unit: 'kg',
      reps: 6,
      est: '96'
    }, {
      date: '12 DE MAYO',
      value: '80',
      unit: 'kg',
      reps: 6,
      est: '93'
    }]
  },
  // Routines library
  routines: [{
    name: 'Empuje · A',
    focus: 'Pecho · Hombro · Tríceps',
    exercises: 5,
    sets: 18,
    mins: 55,
    last: 'hace 3 días',
    active: true
  }, {
    name: 'Tirón · A',
    focus: 'Espalda · Bíceps',
    exercises: 6,
    sets: 20,
    mins: 60,
    last: 'hace 5 días',
    active: false
  }, {
    name: 'Pierna · A',
    focus: 'Cuádriceps · Glúteo · Femoral',
    exercises: 6,
    sets: 22,
    mins: 65,
    last: 'hace 7 días',
    active: false
  }, {
    name: 'Full Body · Express',
    focus: 'Cuerpo completo',
    exercises: 4,
    sets: 12,
    mins: 35,
    last: 'hace 2 semanas',
    active: false
  }],
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

// ui_kits/ios_app/design-canvas.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Exports (to window): DesignCanvas, DCSection, DCArtboard, DCPostIt.
// Artboards are reorderable (grip-drag), deletable, labels/titles are
// inline-editable, and any artboard can be opened in a fullscreen focus
// overlay (←/→/Esc). State persists to a .design-canvas.state.json sidecar
// via the host bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>
//
// Artboards are static design frames, not scroll regions — never use
// height: 100% + overflow: auto/scroll on inner elements; size each artboard
// to fit its content (explicit pixel height, or let it grow).
/* END USAGE */

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}',
  // isolation:isolate contains artboard content's z-indexes so a
  // z-indexed child (sticky navbar etc.) can't paint over .dc-header or
  // the .dc-menu popover that drops into the top of the card.
  '.dc-card{isolation:isolate;transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}',
  // Per-artboard header: grip + label on the left, delete/expand on the
  // right. Single flex row; when the artboard's on-screen width is too
  // narrow for both the label yields (ellipsis, then hidden entirely below
  // ~4ch via the container query) and the buttons stay on the row.
  '.dc-header{position:absolute;bottom:100%;left:-4px;margin-bottom:calc(4px * var(--dc-inv-zoom,1));z-index:2;', '  display:flex;align-items:center;container-type:inline-size}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px;flex:1 1 auto;min-width:0}', '.dc-grip{flex:0 0 auto;cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s,opacity .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{flex:1 1 auto;min-width:0;cursor:pointer;border-radius:4px;padding:3px 6px;', '  display:flex;align-items:center;transition:background .12s;overflow:hidden}',
  // Below ~4ch of label room: hide the label entirely, and drop the grip to
  // hover-only (same reveal rule as .dc-btns) so a narrow header is clean
  // until the card is moused.
  '@container (max-width: 110px){', '  .dc-labeltext{display:none}', '  .dc-grip{opacity:0}', '  [data-dc-slot]:hover .dc-grip{opacity:1}', '}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-labeltext .dc-editable{overflow:hidden;text-overflow:ellipsis;max-width:100%}', '.dc-labeltext .dc-editable:focus{overflow:visible;text-overflow:clip}', '.dc-btns{flex:0 0 auto;margin-left:auto;display:flex;gap:2px;opacity:0;transition:opacity .12s}', '[data-dc-slot]:hover .dc-btns,.dc-btns:has(.dc-menu){opacity:1}', '.dc-expand,.dc-kebab{width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center;', '  font:inherit;transition:background .12s,color .12s}', '.dc-expand:hover,.dc-kebab:hover{background:rgba(0,0,0,.06);color:#2a251f}',
  // Slot hosting an open menu floats above later siblings (which otherwise
  // paint on top — same z-index:auto, later DOM order) so the popup isn't
  // clipped by the next card.
  '[data-dc-slot]:has(.dc-menu){z-index:10}', '.dc-menu{position:absolute;top:100%;right:0;margin-top:4px;background:#fff;border-radius:8px;', '  box-shadow:0 8px 28px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.05);padding:4px;min-width:160px;z-index:10}', '.dc-menu button{display:block;width:100%;padding:7px 10px;border:0;background:transparent;', '  border-radius:5px;font-family:inherit;font-size:13px;font-weight:500;line-height:1.2;', '  color:#29261b;cursor:pointer;text-align:left;transition:background .12s;white-space:nowrap}', '.dc-menu button:hover{background:rgba(0,0,0,.05)}', '.dc-menu hr{border:0;border-top:1px solid rgba(0,0,0,.08);margin:4px 2px}', '.dc-menu .dc-danger{color:#c96442}', '.dc-menu .dc-danger:hover{background:rgba(201,100,66,.1)}',
  // Chrome (titles / labels / buttons) counter-scales against the viewport
  // zoom so it stays a constant on-screen size. --dc-inv-zoom is set by
  // DCViewport on every transform update and inherits to all descendants —
  // any overlay inside the world (e.g. a TweaksPanel on an artboard) can use
  // it the same way.
  //
  // The header uses transform:scale (out-of-flow, so layout impact doesn't
  // matter) with its world-space width set to card-width / inv-zoom so that
  // after counter-scaling its on-screen width exactly matches the card's —
  // that's what lets the container query + text-overflow behave against the
  // card's visible edge at every zoom level.
  //
  // The section head uses CSS zoom instead of transform so its layout box
  // grows with the counter-scale, pushing the card row down — otherwise the
  // constant-screen-size title would overflow into the (shrinking) world-
  // space gap and overlap the artboard headers at low zoom.
  '.dc-header{width:calc((100% + 4px) / var(--dc-inv-zoom,1));', '  transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom left}', '.dc-sectionhead{zoom:var(--dc-inv-zoom,1)}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// Recursively unwrap React.Fragment so <>…</> grouping doesn't hide
// DCSection/DCArtboard children from the type-based walks below.
function dcFlatten(children) {
  const out = [];
  React.Children.forEach(children, c => {
    if (c && c.type === React.Fragment) out.push(...dcFlatten(c.props.children));else out.push(c);
  });
  return out;
}

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, hidden
// artboards, focused artboard). Order/titles/labels/hidden persist to a
// .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Fragments are flattened; wrapping in other
  // elements still opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  dcFlatten(children).forEach(sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const abs = [];
    dcFlatten(sec.props.children).forEach(ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (aid) abs.push([aid, ab]);
    });
    // hidden is scoped to one source revision — when the agent regenerates
    // (artboard-ID set changes), prior deletes don't apply to new content.
    const srcKey = abs.map(([k]) => k).join('\x1f');
    const hidden = persisted.srcKey === srcKey ? persisted.hidden || [] : [];
    const srcIds = [];
    abs.forEach(([aid, ab]) => {
      if (hidden.includes(aid)) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  // Persist viewport across reloads so the user lands back where they were
  // after an agent edit or browser refresh. The sandbox origin is already
  // per-project; pathname keeps multiple canvas files in one project apart.
  const tfKey = 'dc-viewport:' + location.pathname;
  const saveT = React.useRef(0);
  const lastPostedScale = React.useRef();
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    // Exposed for zoom-invariant chrome (labels, buttons, TweaksPanel).
    el.style.setProperty('--dc-inv-zoom', String(1 / scale));
    // Keep the host toolbar's % readout in sync with the canvas scale. Pan
    // ticks leave scale unchanged — skip the cross-frame post for those.
    if (lastPostedScale.current !== scale) {
      lastPostedScale.current = scale;
      window.parent.postMessage({
        type: '__dc_zoom',
        scale
      }, '*');
    }
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => {
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    }, 200);
  }, [tfKey]);
  React.useLayoutEffect(() => {
    const flush = () => {
      clearTimeout(saveT.current);
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    };
    try {
      const s = JSON.parse(localStorage.getItem(tfKey) || 'null');
      if (s && Number.isFinite(s.x) && Number.isFinite(s.y) && Number.isFinite(s.scale)) {
        tf.current = {
          x: s.x,
          y: s.y,
          scale: Math.min(maxScale, Math.max(minScale, s.scale))
        };
        apply();
      }
    } catch {}
    // Flush on pagehide and unmount so a reload within the 200ms debounce
    // window doesn't drop the last pan/zoom.
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // --dc-inv-zoom consumers (.dc-sectionhead's CSS zoom, each section's
      // marginBottom) reflow on every scale change, vertically shifting the
      // world layout — so a world point mathematically pinned under the cursor
      // drifts as you zoom (content creeps up on zoom-in, down on zoom-out).
      // Anchor the DOM element under the cursor instead: record its screen Y,
      // apply the transform + --dc-inv-zoom, then cancel whatever vertical
      // drift the reflow introduced so it stays put on screen.
      let marker = null,
        markerY0 = 0;
      if (k !== 1) {
        const hit = document.elementFromPoint(cx, cy);
        marker = hit && hit.closest ? hit.closest('[data-dc-slot],[data-dc-section]') : null;
        if (marker) markerY0 = marker.getBoundingClientRect().top;
      }
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
      if (marker) {
        // A pure zoom around (cx, cy) maps screen Y → cy + (Y - cy) * k. Any
        // departure after the --dc-inv-zoom reflow is the layout drift.
        const drift = marker.getBoundingClientRect().top - (cy + (markerY0 - cy) * k);
        if (Math.abs(drift) > 0.1) {
          t.y -= drift;
          apply();
        }
      }
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if ((e.ctrlKey || e.metaKey) && !isMouseWheel(e)) {
        // trackpad pinch, or ctrl/cmd + smooth-scroll mouse. Notched
        // wheels fall through to the fixed-step branch below.
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };

    // Host-driven zoom (toolbar % menu). Zooms around viewport centre so the
    // visible midpoint stays fixed — matching the host's iframe-zoom feel.
    const onHostMsg = e => {
      const d = e.data;
      if (d && d.type === '__dc_set_zoom' && typeof d.scale === 'number') {
        const r = vp.getBoundingClientRect();
        zoomAt(r.left + r.width / 2, r.top + r.height / 2, d.scale / tf.current.scale);
      } else if (d && d.type === '__dc_probe') {
        // Host's [readyGen] reset asks whether a canvas is present; it
        // fires on the iframe's native 'load', which for canvases with
        // images/fonts is after our mount-time announce, so re-announce.
        // Clear the pan-tick guard so apply() re-posts the current scale
        // even if it's unchanged — the host just reset dcScale to 1.
        window.parent.postMessage({
          type: '__dc_present'
        }, '*');
        lastPostedScale.current = undefined;
        apply();
      }
    };
    window.addEventListener('message', onHostMsg);
    // Announce canvas mode so the host toolbar proxies its % control here
    // instead of scaling the iframe element (which would just shrink the
    // viewport window of an infinite canvas). The apply() that follows emits
    // the initial __dc_zoom so the toolbar % is correct before first pinch.
    // lastPostedScale reset mirrors the __dc_probe handler: the layout
    // effect's restore-path apply() may already have posted the restored
    // scale (before __dc_present), so clear the guard to re-post it in order.
    window.parent.postMessage({
      type: '__dc_present'
    }, '*');
    lastPostedScale.current = undefined;
    apply();
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('message', onHostMsg);
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(dcFlatten(children));
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const sec = ctx && sid && ctx.section(sid) || {};
  // Must match DesignCanvas's srcKey computation exactly (it filters falsy
  // IDs), or onDelete persists a srcKey that DesignCanvas never recognizes.
  const allIds = artboards.map(a => a.props.id ?? a.props.label).filter(Boolean);
  const srcKey = allIds.join('\x1f');
  const hidden = sec.srcKey === srcKey ? sec.hidden || [] : [];
  const srcOrder = allIds.filter(k => !hidden.includes(k));
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));

  // marginBottom counter-scales so the on-screen gap between sections stays
  // constant — otherwise at low zoom the (world-space) gap collapses while
  // the screen-constant sectionhead below it doesn't, and the title reads as
  // belonging to the section above. paddingBottom below is just enough for
  // the 24px artboard-header (abs-positioned above each card) plus ~8px, so
  // the title sits tight against its own row at every zoom.
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 'calc(80px * var(--dc-inv-zoom, 1))',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-sectionhead",
    style: {
      paddingBottom: 36
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onDelete: () => ctx && ctx.patchSection(sid, x => ({
      hidden: [...(x.srcKey === srcKey ? x.hidden || [] : []), k],
      srcKey
    })),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}

// Per-artboard export (kind: 'png' | 'html'). Both paths share the same
// self-contained clone: computed styles baked in, @font-face / <img> /
// inline-style background-image urls inlined as data URIs. PNG wraps the
// clone in foreignObject→canvas at 3× the artboard's natural width×height
// (same pipeline the host uses for page captures); HTML wraps it in a
// minimal standalone document. Both are independent of viewport zoom.
async function dcExport(node, w, h, name, kind) {
  try {
    await document.fonts.ready;
  } catch {}
  const toDataURL = url => fetch(url).then(r => r.blob()).then(b => new Promise(res => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = () => res(url);
    fr.readAsDataURL(b);
  })).catch(() => url);

  // Collect @font-face rules. ss.cssRules throws SecurityError on
  // cross-origin sheets (e.g. fonts.googleapis.com) — in that case fetch
  // the CSS text directly (those endpoints send ACAO:*) and regex-extract
  // the blocks. @import and @media/@supports are walked so nested
  // @font-face rules aren't missed.
  const fontRules = [],
    pending = [],
    seen = new Set();
  const scrapeCss = href => {
    if (seen.has(href)) return;
    seen.add(href);
    pending.push(fetch(href).then(r => r.text()).then(css => {
      for (const m of css.match(/@font-face\s*{[^}]*}/g) || []) fontRules.push({
        css: m,
        base: href
      });
      for (const m of css.matchAll(/@import\s+(?:url\()?['"]?([^'")\s;]+)/g)) scrapeCss(new URL(m[1], href).href);
    }).catch(() => {}));
  };
  const walk = (rules, base) => {
    for (const r of rules) {
      if (r.type === CSSRule.FONT_FACE_RULE) fontRules.push({
        css: r.cssText,
        base
      });else if (r.type === CSSRule.IMPORT_RULE && r.styleSheet) {
        const ibase = r.styleSheet.href || base;
        try {
          walk(r.styleSheet.cssRules, ibase);
        } catch {
          scrapeCss(ibase);
        }
      } else if (r.cssRules) walk(r.cssRules, base);
    }
  };
  for (const ss of document.styleSheets) {
    const base = ss.href || location.href;
    try {
      walk(ss.cssRules, base);
    } catch {
      if (ss.href) scrapeCss(ss.href);
    }
  }
  while (pending.length) await pending.shift();
  const fontCss = (await Promise.all(fontRules.map(async rule => {
    let out = rule.css,
      m;
    const re = /url\((['"]?)([^'")]+)\1\)/g;
    while (m = re.exec(rule.css)) {
      if (m[2].indexOf('data:') === 0) continue;
      let abs;
      try {
        abs = new URL(m[2], rule.base).href;
      } catch {
        continue;
      }
      out = out.split(m[0]).join('url("' + (await toDataURL(abs)) + '")');
    }
    return out;
  }))).join('\n');
  const cloneStyled = src => {
    if (src.nodeType === 8 || src.nodeType === 1 && src.tagName === 'SCRIPT') return document.createTextNode('');
    const dst = src.cloneNode(false);
    if (src.nodeType === 1) {
      const cs = getComputedStyle(src);
      let txt = '';
      for (let i = 0; i < cs.length; i++) txt += cs[i] + ':' + cs.getPropertyValue(cs[i]) + ';';
      dst.setAttribute('style', txt + 'animation:none;transition:none;');
      if (src.tagName === 'CANVAS') try {
        const im = document.createElement('img');
        im.src = src.toDataURL();
        im.setAttribute('style', txt);
        return im;
      } catch {}
    }
    for (let c = src.firstChild; c; c = c.nextSibling) dst.appendChild(cloneStyled(c));
    return dst;
  };
  const clone = cloneStyled(node);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  // Drop the card's own shadow/radius so the export is a flush w×h rect;
  // the artboard's own background (if any) is already in the computed style.
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  const jobs = [];
  clone.querySelectorAll('img').forEach(el => {
    const s = el.getAttribute('src');
    if (s && s.indexOf('data:') !== 0) jobs.push(toDataURL(el.src).then(d => el.setAttribute('src', d)));
  });
  [clone, ...clone.querySelectorAll('*')].forEach(el => {
    const bg = el.style.backgroundImage;
    if (!bg) return;
    let m;
    const re = /url\(["']?([^"')]+)["']?\)/g;
    while (m = re.exec(bg)) {
      const tok = m[0],
        url = m[1];
      if (url.indexOf('data:') === 0) continue;
      jobs.push(toDataURL(url).then(d => {
        el.style.backgroundImage = el.style.backgroundImage.split(tok).join('url("' + d + '")');
      }));
    }
  });
  await Promise.all(jobs);
  const xml = new XMLSerializer().serializeToString(clone);
  const save = (blob, ext) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + '.' + ext;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  if (kind === 'html') {
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>' + name + '</title>' + (fontCss ? '<style>' + fontCss + '</style>' : '') + '</head><body style="margin:0">' + xml + '</body></html>';
    return save(new Blob([html], {
      type: 'text/html'
    }), 'html');
  }

  // PNG: the SVG's own width/height must be the output resolution — an
  // <img>-loaded SVG rasterizes at its intrinsic size, so sizing it at 1×
  // and ctx.scale()-ing up would just upscale a 1× bitmap. viewBox maps the
  // w×h foreignObject onto the px·w × px·h SVG canvas so the browser renders
  // the HTML at full resolution.
  const px = 3;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w * px + '" height="' + h * px + '" viewBox="0 0 ' + w + ' ' + h + '"><foreignObject width="' + w + '" height="' + h + '">' + (fontCss ? '<style><![CDATA[' + fontCss + ']]></style>' : '') + xml + '</foreignObject></svg>';
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = () => rej(new Error('svg load failed'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  const cv = document.createElement('canvas');
  cv.width = w * px;
  cv.height = h * px;
  cv.getContext('2d').drawImage(img, 0, 0);
  cv.toBlob(blob => save(blob, 'png'), 'image/png');
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus,
  onDelete
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);
  const cardRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  // ⋯ menu: close on any outside pointerdown. Two-click delete lives inside
  // the menu — first click arms the row, second commits; closing disarms.
  React.useEffect(() => {
    if (!menuOpen) {
      setConfirming(false);
      return;
    }
    const off = e => {
      if (!menuRef.current || !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [menuOpen]);
  const doExport = kind => {
    setMenuOpen(false);
    if (!cardRef.current) return;
    const name = String(label || id || 'artboard').replace(/[^\w\s.-]+/g, '_');
    dcExport(cardRef.current, width, height, name, kind).catch(e => console.error('[design-canvas] export failed:', e));
  };

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-header",
    "data-omelette-chrome": "",
    style: {
      color: DC.label
    },
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-btns"
  }, /*#__PURE__*/React.createElement("div", {
    ref: menuRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "dc-kebab",
    title: "More",
    onClick: () => setMenuOpen(o => !o)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2.5",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9.5",
    cy: "6",
    r: "1.1"
  }))), menuOpen && /*#__PURE__*/React.createElement("div", {
    className: "dc-menu",
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('png')
  }, "Download PNG"), /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('html')
  }, "Download HTML"), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("button", {
    className: "dc-danger",
    onClick: () => {
      if (confirming) {
        setMenuOpen(false);
        onDelete();
      } else setConfirming(true);
    }
  }, confirming ? 'Click again to delete' : 'Delete'))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))))), /*#__PURE__*/React.createElement("div", {
    ref: cardRef,
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    // Sections whose artboards are all deleted have slotIds:[] — step past
    // them to the next non-empty section so ↑/↓ doesn't dead-end.
    const n = sectionOrder.length;
    for (let i = 1; i < n; i++) {
      const ns = sectionOrder[((secIdx + d * i) % n + n) % n];
      const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
      if (first) {
        ctx.setFocus(`${ns}/${first}`);
        return;
      }
    }
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.filter(sid => sectionMeta[sid].slotIds.length).map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/design-canvas.jsx", error: String((e && e.message) || e) }); }

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

// ui_kits/ios_app/log-fallback.js
try { (() => {
// Respaldo: si el bundle todavía no incluye components/log (recién agregados),
// los transpila desde la fuente. No hace nada cuando el bundle ya los trae.
(function () {
  var NS = window.FrenciaDesignSystem_377129 = window.FrenciaDesignSystem_377129 || {};
  var files = ['ExerciseMetrics', 'DurationField', 'DistanceField', 'IsoTimer', 'RestRing', 'SerieComparativa', 'SeriesTable', 'ExerciseSummary', 'ExerciseTypeTag', 'ExerciseConfig'];
  var base = document.currentScript.getAttribute('data-base') || '../../components/log/';
  if (files.every(function (f) {
    return NS[f];
  })) {
    window.__frenciaLogReady = Promise.resolve();
    return;
  }
  window.__frenciaLogReady = Promise.all(files.map(function (f) {
    return fetch(base + f + '.jsx').then(function (r) {
      return r.text();
    }).then(function (src) {
      return [f, src];
    });
  })).then(function (list) {
    list.forEach(function (pair) {
      var src = pair[1].replace(/^import[^\n]*\n/gm, '').replace(/^export\s+/gm, '');
      var code = Babel.transform(src, {
        presets: ['react']
      }).code;
      NS[pair[0]] = new Function('React', code + '\nreturn ' + pair[0] + ';')(React);
    });
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/log-fallback.js", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/theme-toggle.jsx
try { (() => {
// Conmutador claro/oscuro para las pantallas del kit.
// Escribe data-theme en <html> y lo persiste; expone useTheme() y <ThemeToggle/>.
const FRENCIA_THEME_KEY = 'frencia-theme';
function frenciaReadTheme() {
  try {
    const saved = localStorage.getItem(FRENCIA_THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) {}
  return 'dark';
}
function useTheme() {
  const [theme, setTheme] = React.useState(frenciaReadTheme);
  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(FRENCIA_THEME_KEY, theme);
    } catch (e) {}
  }, [theme]);
  return [theme, setTheme];
}
function ThemeToggle({
  theme,
  onChange
}) {
  const opts = [{
    v: 'light',
    icon: 'sun',
    label: 'Claro'
  }, {
    v: 'dark',
    icon: 'moon',
    label: 'Oscuro'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      gap: 4,
      padding: 4,
      borderRadius: 999,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 4px 14px rgba(0,0,0,0.14)'
    }
  }, opts.map(o => {
    const on = theme === o.v;
    return /*#__PURE__*/React.createElement("button", {
      key: o.v,
      onClick: () => onChange(o.v),
      "aria-pressed": on,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '8px 14px',
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        background: on ? 'var(--accent)' : 'transparent',
        color: on ? 'var(--text-on-accent)' : 'var(--text-secondary)',
        font: 'var(--fw-semibold) 13px var(--font-sans)',
        transition: 'background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": o.icon,
      style: {
        width: 15,
        height: 15
      }
    }), o.label);
  }));
}
Object.assign(window, {
  useTheme,
  ThemeToggle
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/theme-toggle.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios_app/tipos.data.js
try { (() => {
// Frencia — catálogo con tipos de ejercicio, planes del día, sesión e historial (mock).
window.FRENCIA_TIPOS = {
  prefs: {
    weight: 'kg',
    dist: 'km'
  },
  exercises: {
    press: {
      id: 'press',
      name: 'Press banca',
      muscle: 'Pecho',
      kind: 'fuerza',
      metrics: ['peso', 'reps']
    },
    plancha: {
      id: 'plancha',
      name: 'Plancha',
      muscle: 'Core',
      kind: 'isometrico',
      metrics: ['tiempo']
    },
    sentIso: {
      id: 'sentIso',
      name: 'Sentadilla isométrica con barra',
      muscle: 'Cuádriceps',
      kind: 'isometrico',
      metrics: ['peso', 'tiempo']
    },
    cinta: {
      id: 'cinta',
      name: 'Cinta',
      muscle: 'Cardio',
      kind: 'cardio',
      metrics: ['tiempo', 'distancia'],
      distScale: 'larga'
    },
    soga: {
      id: 'soga',
      name: 'Soga',
      muscle: 'Cardio',
      kind: 'cardio',
      metrics: ['tiempo']
    },
    granjero: {
      id: 'granjero',
      name: 'Paseo de granjero',
      muscle: 'Agarre · Core',
      kind: 'hibrido',
      metrics: ['peso', 'distancia'],
      distScale: 'corta'
    },
    colgado: {
      id: 'colgado',
      name: 'Colgado en barra con lastre',
      muscle: 'Agarre · Espalda',
      kind: 'hibrido',
      metrics: ['peso', 'tiempo']
    },
    sentadilla: {
      id: 'sentadilla',
      name: 'Sentadilla',
      muscle: 'Cuádriceps',
      kind: 'fuerza',
      metrics: ['peso', 'reps']
    },
    dominadas: {
      id: 'dominadas',
      name: 'Dominadas',
      muscle: 'Espalda',
      kind: 'fuerza',
      metrics: ['peso', 'reps']
    },
    hollow: {
      id: 'hollow',
      name: 'Hollow hold',
      muscle: 'Core',
      kind: 'isometrico',
      metrics: ['tiempo']
    },
    remo: {
      id: 'remo',
      name: 'Remo ergómetro',
      muscle: 'Cardio',
      kind: 'cardio',
      metrics: ['tiempo', 'distancia'],
      distScale: 'corta'
    },
    bici: {
      id: 'bici',
      name: 'Bicicleta fija',
      muscle: 'Cardio',
      kind: 'cardio',
      metrics: ['tiempo', 'distancia'],
      distScale: 'larga'
    },
    trineo: {
      id: 'trineo',
      name: 'Empuje de trineo',
      muscle: 'Piernas',
      kind: 'hibrido',
      metrics: ['peso', 'distancia'],
      distScale: 'corta'
    }
  },
  catalogOrder: ['press', 'sentadilla', 'dominadas', 'plancha', 'hollow', 'sentIso', 'cinta', 'bici', 'remo', 'soga', 'granjero', 'trineo', 'colgado'],
  // Plan de cada ejemplo dentro de un día. Nunca trae peso.
  plans: {
    press: {
      sets: 4,
      reps: 10,
      intensity: 'RIR',
      intensityValue: 2,
      rest: 120
    },
    plancha: {
      sets: 3,
      tiempo: 45,
      intensity: 'RIR',
      intensityValue: 1,
      rest: 60
    },
    sentIso: {
      sets: 4,
      tiempo: 30,
      intensity: 'RIR',
      intensityValue: 2,
      rest: 120
    },
    cinta: {
      sets: 1,
      tiempo: 1800,
      distancia: 5,
      intensity: 'RPE',
      intensityValue: 6,
      rest: null
    },
    soga: {
      sets: 5,
      tiempo: 60,
      intensity: 'RPE',
      intensityValue: 8,
      rest: 30
    },
    granjero: {
      sets: 3,
      distancia: 40,
      intensity: null,
      rest: 90
    },
    colgado: {
      sets: 3,
      tiempo: 30,
      intensity: 'RIR',
      intensityValue: 1,
      rest: 120
    }
  },
  dayOrder: ['press', 'sentIso', 'colgado', 'granjero', 'plancha', 'soga', 'cinta'],
  // Sesión en curso: serie actual, anterior y lo cargado hasta ahora.
  session: {
    plancha: {
      serie: 2,
      previous: {
        tiempo: 42,
        intensityValue: 1
      },
      done: [{
        tiempo: 47,
        intensityValue: 1
      }]
    },
    cinta: {
      serie: 1,
      previous: {
        tiempo: 1800,
        distancia: 4.82,
        intensityValue: 6
      },
      done: []
    },
    granjero: {
      serie: 2,
      previous: {
        peso: 32,
        distancia: 40
      },
      done: [{
        peso: 36,
        distancia: 40
      }]
    }
  },
  // Detalle de historial: sesión con tipos mezclados.
  history: {
    date: 'Jue 12 jun',
    time: '07:42',
    routine: 'Full Body · B',
    duration: 4212,
    items: [{
      ex: 'press',
      intensity: 'RIR',
      sets: [{
        peso: 82.5,
        reps: 10,
        intensityValue: 2
      }, {
        peso: 82.5,
        reps: 10,
        intensityValue: 1
      }, {
        peso: 85,
        reps: 8,
        intensityValue: 1
      }, {
        peso: 85,
        reps: 7,
        intensityValue: 0
      }]
    }, {
      ex: 'colgado',
      intensity: 'RIR',
      sets: [{
        peso: 10,
        tiempo: 32,
        intensityValue: 1
      }, {
        peso: 10,
        tiempo: 30,
        intensityValue: 1
      }, {
        peso: 10,
        tiempo: 26,
        intensityValue: 0
      }]
    }, {
      ex: 'granjero',
      intensity: null,
      sets: [{
        peso: 32,
        distancia: 40
      }, {
        peso: 36,
        distancia: 40
      }, {
        peso: 36,
        distancia: 35
      }]
    }, {
      ex: 'plancha',
      intensity: 'RIR',
      sets: [{
        tiempo: 47,
        intensityValue: 1
      }, {
        tiempo: 45,
        intensityValue: 1
      }, {
        tiempo: 51,
        intensityValue: null
      }]
    }, {
      ex: 'cinta',
      intensity: 'RPE',
      sets: [{
        tiempo: 1815,
        distancia: 5.04,
        intensityValue: 6
      }]
    }]
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios_app/tipos.data.js", error: String((e && e.message) || e) }); }

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

__ds_ns.DistanceField = __ds_scope.DistanceField;

__ds_ns.DurationField = __ds_scope.DurationField;

__ds_ns.ExerciseConfig = __ds_scope.ExerciseConfig;

__ds_ns.ExerciseMetrics = __ds_scope.ExerciseMetrics;

__ds_ns.ExerciseSummary = __ds_scope.ExerciseSummary;

__ds_ns.ExerciseTypeTag = __ds_scope.ExerciseTypeTag;

__ds_ns.IsoTimer = __ds_scope.IsoTimer;

__ds_ns.RestRing = __ds_scope.RestRing;

__ds_ns.SerieComparativa = __ds_scope.SerieComparativa;

__ds_ns.SeriesTable = __ds_scope.SeriesTable;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.TabBar = __ds_scope.TabBar;

})();
