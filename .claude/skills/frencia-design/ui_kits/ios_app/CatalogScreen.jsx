// Buscador del catálogo (primera cara de ExercisePickerModal) y lista del día.
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function CatalogScreen({ initialFilter = 'todos', initialQuery = '', onPick }) {
  const NS = window.FrenciaDesignSystem_377129;
  const { Tag, IconButton, ExerciseTypeTag, ExerciseMetrics: M } = NS;
  const D = window.FRENCIA_TIPOS;
  const [q, setQ] = React.useState(initialQuery);
  const [f, setF] = React.useState(initialFilter);
  React.useEffect(() => { window.lucide && lucide.createIcons(); });

  const all = D.catalogOrder.map((k) => D.exercises[k]);
  const filters = [{ v: 'todos', label: 'Todos', icon: 'list' }].concat(Object.keys(M.KINDS).map((k) => ({ v: k, label: M.KINDS[k].label, icon: M.KINDS[k].icon })));
  const count = (v) => all.filter((e) => v === 'todos' || e.kind === v).length;
  const list = all.filter((e) => (f === 'todos' || e.kind === f) && norm(e.name + ' ' + e.muscle).includes(norm(q.trim())));
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

      <div role="radiogroup" aria-label="Filtrar por tipo" style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -20px', padding: '0 20px 2px', scrollbarWidth: 'none' }}>
        {filters.map((x) => {
          const on = x.v === f;
          return (
            <Tag key={x.v} selectable selected={on} role="radio" aria-checked={on} onClick={() => setF(x.v)}
              style={{ flexShrink: 0, minHeight: 36, padding: '0 14px', fontWeight: on ? 700 : 500 }}>
              <span key={on ? 'check' : x.icon} style={{ display: 'inline-flex' }}><i data-lucide={on ? 'check' : x.icon} style={{ width: 15, height: 15 }}></i></span>
              {x.label}
              <span style={{ font: 'var(--fw-medium) 11px var(--font-mono)', opacity: 0.75 }}>{count(x.v)}</span>
            </Tag>
          );
        })}
      </div>

      <span className="frencia-label">{list.length} {list.length === 1 ? 'ejercicio' : 'ejercicios'}{f !== 'todos' ? ` · ${active.label}` : ''}</span>

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: -6 }}>
        {list.map((e) => (
          <div key={e.id} onClick={() => onPick && onPick(e.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--divider)', cursor: 'pointer' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ font: 'var(--fw-semibold) 16px var(--font-sans)', color: 'var(--text-primary)' }}>{e.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <ExerciseTypeTag exercise={e} />
              </span>
            </div>
            <span style={{ font: 'var(--fw-regular) 13px var(--font-sans)', color: 'var(--text-tertiary)', textAlign: 'right', maxWidth: 92 }}>{e.muscle}</span>
            <IconButton icon="plus" variant="surface" size="sm" aria-label={'Agregar ' + e.name} />
          </div>
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
