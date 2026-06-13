function WorkoutLogScreen({ onFinish }) {
  const { Card, Button, IconButton, StatTile, Stepper, SetRow, SegmentedControl, MetricPill, Badge, ProgressBar } = window.HeftDesignSystem_377129;
  const ex = window.HEFT_DATA.exercise;
  const [sets, setSets] = React.useState(() => ex.sets.map((s) => ({ ...s })));
  const active = sets.findIndex((s) => s.state === 'active');
  const cur = active >= 0 ? sets[active] : null;
  const [peso, setPeso] = React.useState(cur ? cur.load : 85);
  const [reps, setReps] = React.useState(cur ? cur.reps : 6);
  const [rir, setRir] = React.useState('2');
  const [resting, setResting] = React.useState(false);
  const doneCount = sets.filter((s) => s.state === 'done').length;

  const register = () => {
    if (active < 0) return;
    setSets((prev) => prev.map((s, i) => {
      if (i === active) return { ...s, load: peso, reps, rir: Number(rir), state: 'done' };
      if (i === active + 1) return { ...s, state: 'active' };
      return s;
    }));
    const nx = sets[active + 1];
    if (nx) { setPeso(nx.load); setReps(nx.reps); }
    setResting(true);
    setTimeout(() => setResting(false), 2600);
  };

  return (
    <div style={{ padding: '56px 20px 120px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Exercise header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span className="heft-label">Ejercicio 1 / 5 · {ex.muscle}</span>
          <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)', marginTop: 4 }}>{ex.name}</div>
          <div style={{ font: 'var(--text-data)', color: 'var(--text-secondary)', marginTop: 4 }}>
            Objetivo {ex.target} <span style={{ color: 'var(--text-tertiary)' }}>· {ex.note}</span>
          </div>
        </div>
        <IconButton icon="more-horizontal" variant="surface" />
      </div>

      <ProgressBar segments={sets.length} value={doneCount} tone="green" />

      {/* Rest timer banner / current set entry */}
      {resting ? (
        <Card variant="green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <MetricPill icon="timer" label="Descanso" value="2:00" tone="green" />
          <span style={{ font: 'var(--text-body-sm)', color: 'var(--accent-text)' }}>Respira. Siguiente serie pronto.</span>
          <Button variant="ghost" size="sm" onClick={() => setResting(false)}>Saltar</Button>
        </Card>
      ) : cur ? (
        <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ font: 'var(--fw-bold) 18px var(--font-sans)', color: 'var(--text-primary)' }}>Serie {active + 1}</span>
            <Badge tone="green">En curso</Badge>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
            <Stepper label="Peso" value={peso} onChange={setPeso} step={2.5} precision={1} unit="kg" size="lg" />
            <Stepper label="Reps" value={reps} onChange={setReps} step={1} size="lg" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="heft-label">RIR · repeticiones en reserva</span>
            <SegmentedControl fullWidth value={rir} onChange={setRir}
              options={[{value:'0',label:'0'},{value:'1',label:'1'},{value:'2',label:'2'},{value:'3',label:'3'},{value:'4',label:'4+'}]} />
          </div>
          <Button variant="primary" size="lg" icon="check" fullWidth onClick={register}>Registrar serie</Button>
        </Card>
      ) : (
        <Card variant="green" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--accent)', textTransform: 'uppercase' }}>Ejercicio completo</div>
          <span style={{ font: 'var(--text-body-sm)', color: 'var(--text-secondary)' }}>Siguiente: {ex.next}</span>
        </Card>
      )}

      {/* Sets log */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span className="heft-label">Series</span>
        {sets.map((s, i) => (
          <SetRow key={i} index={i + 1} load={s.load} reps={s.reps} rir={s.rir} state={s.state}
            onToggle={() => setSets((prev) => prev.map((x, j) => j === i ? { ...x, state: x.state === 'done' ? 'pending' : 'done' } : x))} />
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <Button variant="secondary" size="lg" icon="arrow-right" style={{ flex: 1 }}>Siguiente</Button>
        <Button variant="intensity" size="lg" icon="flag" onClick={onFinish}>Terminar</Button>
      </div>

    </div>
  );
}
window.WorkoutLogScreen = WorkoutLogScreen;
