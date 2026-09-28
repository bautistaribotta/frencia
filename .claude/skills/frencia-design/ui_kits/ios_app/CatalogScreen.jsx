// Buscador del catálogo (primera cara de ExercisePickerModal) y lista del día.
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Músculo objetivo: el primero de la lista. Es el único que mira el filtro por
// grupo muscular, para que "Tríceps" no traiga todos los press de pecho.
const primaryMuscle = (e) => e.muscle.split(' · ')[0];

// Fila del catálogo. Plegada: nombre en una línea, músculo objetivo y flecha.
// Desplegada: fondo de tarjeta, nombre completo, músculos (el objetivo con
// punto), equipamiento y el botón Añadir, que recién ahí pasa a configurar.
const CATALOG_CSS = `
.frencia-cat-chips { display: flex; gap: 8px; overflow-x: auto; margin: 0 -20px; padding: 0 20px 2px; scrollbar-width: none; }
.frencia-cat-row { display: flex; flex-direction: column; padding: 13px 0; border-bottom: 1px solid var(--divider); cursor: pointer; }
.frencia-cat-row--open { gap: 16px; margin: 4px -12px; padding: 16px 12px; border-radius: var(--radius-lg); border-bottom-color: transparent; background: var(--surface-card); cursor: default; }
.frencia-cat-head { display: flex; align-items: center; gap: 12px; }
.frencia-cat-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.frencia-cat-name { font: var(--fw-semibold) 16px/22px var(--font-sans); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.frencia-cat-row--open .frencia-cat-name { white-space: normal; }
.frencia-cat-muscle { max-width: 104px; font: var(--fw-regular) 13px var(--font-sans); color: var(--text-tertiary); text-align: right; }
.frencia-cat-chevron { display: inline-flex; color: var(--text-tertiary); }
.frencia-cat-meta { display: flex; align-items: center; gap: 12px; }
.frencia-cat-tags { flex: 1; display: flex; flex-wrap: wrap; gap: 8px; }
.frencia-cat-equipment { font: var(--text-body-sm); color: var(--text-tertiary); }
.frencia-cat-count { font: var(--fw-medium) 11px var(--font-mono); opacity: 0.75; }
.frencia-cat-chip { flex-shrink: 0; min-height: 36px; padding: 0 14px; }
.frencia-cat-chip.frencia-tag--selected { font-weight: var(--fw-bold); }
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-catalog-css')) {
  const st = document.createElement('style');
  st.id = 'frencia-catalog-css'; st.textContent = CATALOG_CSS;
  document.head.appendChild(st);
}

function CatalogRow({ e, open, onToggle, onPick, showType }) {
  const { Tag, Button, ExerciseTypeTag } = window.FrenciaDesignSystem_377129;
  const primary = primaryMuscle(e);
  return (
    <div className={'frencia-cat-row' + (open ? ' frencia-cat-row--open' : '')} role="button" aria-expanded={open}
      aria-label={e.name + ', ' + primary} onClick={open ? undefined : onToggle}>
      <div className="frencia-cat-head" onClick={open ? onToggle : undefined}>
        <div className="frencia-cat-main">
          <span className="frencia-cat-name">{e.name}</span>
          {showType && !open ? <span><ExerciseTypeTag exercise={e} /></span> : null}
        </div>
        {!open ? <span className="frencia-cat-muscle">{primary}</span> : null}
        <span key={open ? 'up' : 'down'} className="frencia-cat-chevron"><i data-lucide={open ? 'chevron-up' : 'chevron-down'} style={{ width: 18, height: 18 }}></i></span>
      </div>
      {open ? (
        <React.Fragment>
          <div className="frencia-cat-meta">
            <div className="frencia-cat-tags">
              <Tag dot>{primary}</Tag>
              {(e.secondary || []).map((m) => <Tag key={m}>{m}</Tag>)}
            </div>
            {e.equipment ? <span className="frencia-cat-equipment">{e.equipment}</span> : null}
          </div>
          <Button variant="primary" icon="plus" fullWidth onClick={() => onPick && onPick(e.id)}>Añadir</Button>
        </React.Fragment>
      ) : null}
    </div>
  );
}

// filterBy: 'musculo' (lo que usa la app hoy, un grupo a la vez) o 'tipo'
// (fuerza / isométrico / cardio / híbrido, para cuando el catálogo los tenga).
function CatalogScreen({ initialFilter = 'todos', initialQuery = '', initialOpen = null, filterBy = 'tipo', onPick }) {
  const NS = window.FrenciaDesignSystem_377129;
  const { Tag, IconButton, ExerciseMetrics: M } = NS;
  const D = window.FRENCIA_TIPOS;
  const [q, setQ] = React.useState(initialQuery);
  const [f, setF] = React.useState(initialFilter);
  const [open, setOpen] = React.useState(initialOpen);
  React.useEffect(() => { window.lucide && lucide.createIcons(); });

  const all = D.catalogOrder.map((k) => D.exercises[k]);
  const byMuscle = filterBy === 'musculo';
  const keyOf = (e) => (byMuscle ? primaryMuscle(e) : e.kind);
  const muscles = Array.from(new Set(all.map(primaryMuscle)));
  const filters = [{ v: 'todos', label: 'Todos', icon: 'list' }].concat(byMuscle
    ? muscles.map((m) => ({ v: m, label: m }))
    : Object.keys(M.KINDS).map((k) => ({ v: k, label: M.KINDS[k].label, icon: M.KINDS[k].icon })));
  // El conteo es sobre el catálogo entero: los chips no bailan mientras se escribe.
  const count = (v) => all.filter((e) => v === 'todos' || keyOf(e) === v).length;
  const list = all.filter((e) => (f === 'todos' || keyOf(e) === f) && norm(e.name + ' ' + e.muscle).includes(norm(q.trim())));
  const active = filters.find((x) => x.v === f);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 20px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 -8px' }}>
        <IconButton icon="x" variant="ghost" aria-label="Cerrar" />
        <span className="frencia-label">Full Body · B · Día 1</span>
      </div>
      <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>Agregar ejercicio</div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-inset)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}>
        <span style={{ display: 'inline-flex' }}><i data-lucide="search" style={{ width: 18, height: 18 }}></i></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscá por nombre o músculo"
          style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', color: 'var(--text-primary)', font: 'var(--fw-medium) 16px var(--font-sans)', caretColor: 'var(--accent)' }} />
      </label>

      {/* Por músculo, tocar el chip activo lo suelta y vuelve a Todos. Los
         chips de músculo no llevan ícono: el nombre alcanza. */}
      <div role="radiogroup" aria-label={byMuscle ? 'Filtrar por grupo muscular' : 'Filtrar por tipo'} className="frencia-cat-chips">
        {filters.map((x) => {
          const on = x.v === f;
          const glyph = on && !byMuscle ? 'check' : x.icon;
          return (
            <Tag key={x.v} selectable selected={on} role="radio" aria-checked={on} className="frencia-cat-chip"
              onClick={() => setF(byMuscle && on ? 'todos' : x.v)}>
              {glyph ? <span key={glyph} style={{ display: 'inline-flex' }}><i data-lucide={glyph} style={{ width: 15, height: 15 }}></i></span> : null}
              {x.label}
              <span className="frencia-cat-count">{count(x.v)}</span>
            </Tag>
          );
        })}
      </div>

      <span className="frencia-label">{list.length} {list.length === 1 ? 'ejercicio' : 'ejercicios'}{f !== 'todos' ? ` · ${active.label}` : ''}</span>

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: -6 }}>
        {/* Una sola fila desplegada a la vez. */}
        {list.map((e) => (
          <CatalogRow key={e.id} e={e} open={open === e.id} showType={!byMuscle} onPick={onPick}
            onToggle={() => setOpen(open === e.id ? null : e.id)} />
        ))}
        {list.length === 0 ? <div style={{ padding: '28px 0', font: 'var(--text-body-sm)', color: 'var(--text-tertiary)' }}>No hay ejercicios que coincidan. Probá con otro nombre o sacá el filtro.</div> : null}
      </div>
    </div>
  );
}

function DayPlanScreen({ onEdit }) {
  const NS = window.FrenciaDesignSystem_377129;
  const { Button, IconButton, ExerciseSummary, ExerciseTypeTag } = NS;
  const D = window.FRENCIA_TIPOS;
  React.useEffect(() => { window.lucide && lucide.createIcons(); });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 20px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 -8px' }}>
        <IconButton icon="chevron-left" variant="ghost" aria-label="Volver" />
        <span className="frencia-label">Rutina · Full Body B</span>
      </div>
      <div>
        <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>Día 1</div>
        <span className="frencia-label" style={{ display: 'block', marginTop: 4 }}>{D.dayOrder.length} ejercicios</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {D.dayOrder.map((k, i) => {
          const e = D.exercises[k];
          return (
            <div key={k} onClick={() => onEdit && onEdit(k)} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 14px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
              <span style={{ width: 26, font: 'var(--fw-bold) 13px var(--font-mono)', color: 'var(--text-tertiary)' }}>{String(i + 1).padStart(2, '0')}</span>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ font: 'var(--fw-semibold) 16px var(--font-sans)', color: 'var(--text-primary)' }}>{e.name}</span>
                <ExerciseSummary exercise={e} plan={D.plans[k]} prefs={D.prefs} />
              </div>
              <span style={{ display: 'inline-flex', color: 'var(--text-tertiary)' }}><i data-lucide="chevron-right" style={{ width: 18, height: 18 }}></i></span>
            </div>
          );
        })}
      </div>
      <Button variant="secondary" size="lg" icon="plus" fullWidth>Agregar ejercicio</Button>
    </div>
  );
}

Object.assign(window, { CatalogScreen, DayPlanScreen });
