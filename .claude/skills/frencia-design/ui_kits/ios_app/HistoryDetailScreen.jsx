// Detalle de una sesión del historial con tipos mezclados.
function HistoryDetailScreen() {
  const NS = window.FrenciaDesignSystem_377129;
  const { IconButton, StatTile, SeriesTable, ExerciseSummary, ExerciseTypeTag, ExerciseMetrics: M } = NS;
  const D = window.FRENCIA_TIPOS;
  const H = D.history;
  React.useEffect(() => { window.lucide && lucide.createIcons(); });

  const totalSets = H.items.reduce((n, it) => n + it.sets.length, 0);
  const tonnage = H.items.filter((it) => D.exercises[it.ex].kind === 'fuerza')
    .reduce((n, it) => n + it.sets.reduce((m, s) => m + (s.peso || 0) * (s.reps || 0), 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '4px 20px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 -8px' }}>
        <IconButton icon="chevron-left" variant="ghost" aria-label="Volver al historial" />
        <span className="frencia-label">{H.date} · {H.time}</span>
      </div>
      <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>{H.routine}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, padding: '16px', borderRadius: 'var(--radius-xl)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
        <StatTile label="Duración" value={M.clock(H.duration)} size="sm" />
        <StatTile label="Series" value={String(totalSets)} size="sm" />
        <StatTile label="Volumen" value={String(tonnage).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} unit="kg" size="sm" />
      </div>

      {H.items.map((it) => {
        const e = D.exercises[it.ex];
        return (
          <div key={it.ex} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 14px 10px', borderRadius: 'var(--radius-xl)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '0 2px' }}>
              <span style={{ font: 'var(--fw-bold) 17px var(--font-sans)', color: 'var(--text-primary)' }}>{e.name}</span>
              <ExerciseTypeTag exercise={e} />
              <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 2 }}>
                <span className="frencia-label">Plan</span><ExerciseSummary exercise={e} plan={D.plans[it.ex]} prefs={D.prefs} />
              </span>
            </div>
            <SeriesTable exercise={e} sets={it.sets} intensity={it.intensity} prefs={D.prefs} />
          </div>
        );
      })}
    </div>
  );
}

window.HistoryDetailScreen = HistoryDetailScreen;
