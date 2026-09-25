function HomeScreen({ onStart }) {
  const { Avatar, Badge, Card, Button, StatTile, ProgressBar, Tag, MetricPill, IconButton } = window.FrenciaDesignSystem_377129;
  const d = window.FRENCIA_DATA;
  const [idx, setIdx] = React.useState(d.todayIndex);
  const sched = d.schedule;
  const day = sched[idx];
  const atStart = idx === 0;
  const atEnd = idx === sched.length - 1;

  const statusBadge = {
    done:    <Badge key="b-done" tone="green" icon="check">Hecho</Badge>,
    today:   <Badge key="b-today" tone="neutral">hace 3 días</Badge>,
    planned: <Badge key="b-planned" tone="neutral">Planeado</Badge>,
    rest:    <Badge key="b-rest" tone="neutral">Descanso</Badge>,
  }[day.status];

  const action = {
    today:   <Button key="today" variant="primary" size="lg" icon="play" fullWidth onClick={onStart}>Empezar entrenamiento</Button>,
    done:    <Button key="done" variant="secondary" size="lg" icon="list" fullWidth>Ver resumen</Button>,
    planned: <Button key="planned" variant="secondary" size="lg" icon="play" fullWidth onClick={onStart}>Empezar antes</Button>,
    rest:    <Button key="rest" variant="secondary" size="lg" icon="activity" fullWidth>Registrar actividad</Button>,
  }[day.status];

  return (
    <div style={{ padding: '56px 20px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={d.user.name} size="md" ring />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ font: 'var(--text-subtitle)', color: 'var(--text-primary)' }}>Hola, {d.user.name.split(' ')[0]}</span>
            <span className="frencia-label">Jueves · 12 jun</span>
          </div>
        </div>
        <Badge tone="orange" icon="flame">{d.user.streak} días</Badge>
      </div>

      {/* Today's session — navegable por día */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span className="frencia-label" style={{ color: day.status === 'today' ? 'var(--accent-text)' : 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{day.rel} · {day.day}</span>
              <div style={{ flexShrink: 0 }}>{statusBadge}</div>
            </div>
            <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)', marginTop: -4 }}>{day.routine}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {day.tags.map((t) => <Tag key={t} dot>{t}</Tag>)}
            </div>
            {day.exercisesTotal > 0
              ? <ProgressBar segments={day.exercisesTotal} value={day.exercisesDone}
                  label="Ejercicios" showValue tone={day.status === 'done' ? 'green' : undefined} />
              : null}
            {day.status === 'done'
              ? <MetricPill icon="dumbbell" label="Volumen" value={`${day.volume} ${day.volumeUnit}`} tone="green" layout="inline" />
              : null}
            {action}
          </Card>

          <div style={{ position: 'absolute', top: '50%', left: -14, transform: 'translateY(-50%)', zIndex: 5 }}>
            <IconButton icon="chevron-left" variant="surface" size="sm" round
              disabled={atStart} onClick={() => setIdx((i) => Math.max(0, i - 1))} />
          </div>
          <div style={{ position: 'absolute', top: '50%', right: -14, transform: 'translateY(-50%)', zIndex: 5 }}>
            <IconButton icon="chevron-right" variant="surface" size="sm" round
              disabled={atEnd} onClick={() => setIdx((i) => Math.min(sched.length - 1, i + 1))} />
          </div>
        </div>

        {/* Indicador de día */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          {sched.map((s, i) => (
            <button key={i} onClick={() => setIdx(i)} aria-label={s.day}
              style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer',
                background: i === idx ? (s.status === 'today' ? 'var(--accent)' : 'var(--text-secondary)')
                  : (i === d.todayIndex ? 'var(--accent-text)' : 'var(--border-strong)'),
                transition: 'width .18s ease' }} />
          ))}
        </div>
      </div>

      {/* Last PR */}
      <Card variant="orange" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="frencia-label" style={{ color: 'var(--intensity-text)' }}>Último PR · {d.lastPR.date}</span>
          <div style={{ font: 'var(--fw-bold) 18px var(--font-sans)', color: 'var(--text-primary)', marginTop: 4 }}>{d.lastPR.exercise}</div>
        </div>
        <StatTile value={d.lastPR.value} unit={d.lastPR.unit} size="md" tone="orange" />
      </Card>

    </div>
  );
}
window.HomeScreen = HomeScreen;
