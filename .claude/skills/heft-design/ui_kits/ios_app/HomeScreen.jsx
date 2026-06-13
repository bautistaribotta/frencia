function HomeScreen({ onStart }) {
  const { Avatar, Badge, Card, Button, StatTile, ProgressBar, Tag, MetricPill } = window.HeftDesignSystem_377129;
  const d = window.HEFT_DATA;
  return (
    <div style={{ padding: '56px 20px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={d.user.name} size="md" ring />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ font: 'var(--text-subtitle)', color: 'var(--text-primary)' }}>Hola, {d.user.name.split(' ')[0]}</span>
            <span className="heft-label">Jueves · 12 jun</span>
          </div>
        </div>
        <Badge tone="orange" icon="flame">{d.user.streak} días</Badge>
      </div>

      {/* Today's session — hero card */}
      <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="heft-label">Sesión de hoy</span>
            <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)', marginTop: 4 }}>{d.today.routine}</div>
          </div>
          <Badge tone="neutral">Última {d.today.lastDone}</Badge>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {d.today.tags.map((t) => <Tag key={t} dot>{t}</Tag>)}
        </div>
        <ProgressBar segments={d.today.exercisesTotal} value={d.today.exercisesDone} label="Ejercicios" showValue />
        <Button variant="primary" size="lg" icon="play" fullWidth onClick={onStart}>Empezar entrenamiento</Button>
      </Card>

      {/* Quick stats */}
      <div>
        <span className="heft-label" style={{ display: 'block', marginBottom: 10 }}>Esta semana</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Card hairline style={{ padding: 14 }}>
            <StatTile label="Volumen" value={d.weekStats.volume} unit={d.weekStats.volumeUnit} size="sm" />
          </Card>
          <Card hairline style={{ padding: 14 }}>
            <StatTile label="Sesiones" value={d.weekStats.sessions} size="sm" tone="green" />
          </Card>
          <Card hairline style={{ padding: 14 }}>
            <StatTile label="RIR medio" value={d.weekStats.rir} size="sm" />
          </Card>
        </div>
      </div>

      {/* Last PR */}
      <Card variant="orange" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="heft-label" style={{ color: 'var(--intensity-text)' }}>Último PR · {d.lastPR.date}</span>
          <div style={{ font: 'var(--fw-bold) 18px var(--font-sans)', color: 'var(--text-primary)', marginTop: 4 }}>{d.lastPR.exercise}</div>
        </div>
        <StatTile value={d.lastPR.value} unit={d.lastPR.unit} size="md" tone="orange" />
      </Card>

    </div>
  );
}
window.HomeScreen = HomeScreen;
