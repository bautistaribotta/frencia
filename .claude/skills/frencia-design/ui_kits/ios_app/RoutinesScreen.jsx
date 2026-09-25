function RoutinesScreen({ onStart }) {
  const { Card, Button, Badge, Tag } = window.FrenciaDesignSystem_377129;
  const routines = window.FRENCIA_DATA.routines;
  return (
    <div style={{ padding: '56px 20px 120px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <span className="frencia-label">Mis rutinas</span>
          <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)', marginTop: 4 }}>Programa</div>
        </div>
        <Badge tone="neutral">{routines.length}</Badge>
      </div>

      {routines.map((r, i) => (
        <Card key={i} variant={r.active ? 'elevated' : 'default'} hairline={!r.active}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ font: 'var(--fw-bold) 17px var(--font-sans)', color: 'var(--text-primary)' }}>{r.name}</div>
              <span className="frencia-label" style={{ display: 'block', marginTop: 3 }}>{r.focus}</span>
            </div>
            {r.active ? <Badge tone="orange" icon="flame">Activa</Badge> : null}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag dot>{r.exercises} ejercicios</Tag>
            <Tag dot>{r.sets} series</Tag>
            <Tag dot>~{r.mins} min</Tag>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span className="frencia-label">Última · {r.last}</span>
            <Button variant={r.active ? 'primary' : 'secondary'} size="sm" icon="play" onClick={onStart}>
              {r.active ? 'Empezar' : 'Iniciar'}
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="secondary" size="lg" icon="plus" fullWidth>Nueva rutina</Button>
    </div>
  );
}
window.RoutinesScreen = RoutinesScreen;
