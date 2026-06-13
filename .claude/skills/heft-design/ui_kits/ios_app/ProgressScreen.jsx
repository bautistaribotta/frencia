function ProgressScreen() {
  const { Card, StatTile, SegmentedControl, Badge, Tag } = window.HeftDesignSystem_377129;
  const p = window.HEFT_DATA.progress;
  const [range, setRange] = React.useState('mes');
  const maxV = Math.max(...p.bars.map((b) => b.v));

  return (
    <div style={{ padding: '56px 20px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div>
        <span className="heft-label">Progreso</span>
        <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)', marginTop: 4 }}>{p.exercise}</div>
      </div>

      <SegmentedControl fullWidth value={range} onChange={setRange}
        options={[{value:'semana',label:'Semana'},{value:'mes',label:'Mes'},{value:'año',label:'Año'}]} />

      {/* 1RM hero + chart */}
      <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <StatTile label="1RM estimado" value={p.oneRM} unit="kg" size="lg" tone="green" delta={p.oneRMDelta} deltaDir="up" />
          <Badge tone="green-solid" icon="trending-up">+18% / 6 sem</Badge>
        </div>
        {/* bar chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120, paddingTop: 8 }}>
          {p.bars.map((b) => (
            <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{
                width: '100%', height: `${(b.v / maxV) * 100}%`,
                background: b.pr ? 'var(--intensity)' : 'var(--accent)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: b.pr ? 'var(--glow-orange)' : 'none',
                transition: 'height var(--dur-slow) var(--ease-out)',
              }} />
              <span style={{ font: '10px var(--font-mono)', color: b.pr ? 'var(--intensity-text)' : 'var(--text-tertiary)', letterSpacing: 'var(--ls-wide)' }}>{b.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* PR history */}
      <div>
        <span className="heft-label" style={{ display: 'block', marginBottom: 10 }}>Historial de récords</span>
        <Card variant="inset" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}>
          {p.prs.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderBottom: i < p.prs.length - 1 ? '1px solid var(--divider)' : 'none',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ font: 'var(--fw-bold) 17px var(--font-mono)', color: 'var(--text-primary)' }}>{r.value} <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{r.unit} × {r.reps}</span></span>
                <span className="heft-label" style={{ marginTop: 2 }}>{r.date} · est. {r.est} kg</span>
              </div>
              {i === 0 ? <Badge tone="orange-solid" icon="flame">PR</Badge> : <span style={{ font: '11px var(--font-mono)', color: 'var(--text-tertiary)' }}>—</span>}
            </div>
          ))}
        </Card>
      </div>

    </div>
  );
}
window.ProgressScreen = ProgressScreen;
