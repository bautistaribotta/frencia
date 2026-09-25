// Registro de sesión por datos del ejercicio (no por tipo).
function SessionTypedScreen({ exKey, timerPhase = 'idle', timerElapsed = 0, index = '5 / 7' }) {
  const NS = window.FrenciaDesignSystem_377129;
  const { Card, Button, IconButton, Stepper, SegmentedControl, ProgressBar, Badge,
    DurationField, DistanceField, IsoTimer, RestRing, SerieComparativa, SeriesTable, ExerciseSummary, ExerciseMetrics: M } = NS;
  const D = window.FRENCIA_TIPOS;
  const ex = D.exercises[exKey];
  const plan = D.plans[exKey];
  const ses = D.session[exKey];
  const ms = M.metrics(ex);
  const unit = M.distUnit(ex, D.prefs);

  const blank = () => ({ peso: ms.includes('peso') ? (ses.previous && ses.previous.peso) : null, reps: null, tiempo: null, distancia: null, intensityValue: null });
  const [done, setDone] = React.useState(ses.done);
  const [cur, setCur] = React.useState(blank);
  const [resting, setResting] = React.useState(false);
  const [timerKey, setTimerKey] = React.useState(0);
  const set = (k, v) => setCur((c) => ({ ...c, [k]: v }));
  React.useEffect(() => { window.lucide && lucide.createIcons(); });

  const serie = done.length + 1;
  const finished = done.length >= plan.sets;
  const vol = M.planMetrics(ex);
  const ready = vol.every((k) => cur[k] != null && cur[k] > 0) && (!ms.includes('peso') || cur.peso != null);
  const timed = ms.includes('tiempo') && ex.kind !== 'cardio';
  const firstEmpty = ms.find((k) => cur[k] == null);

  const register = () => {
    setDone((d) => d.concat([cur]));
    setCur(blank()); setTimerKey((k) => k + 1);
    if (M.restVisible(ex, plan.sets) && done.length + 1 < plan.sets) setResting(true);
  };

  const rows = done.concat(Array.from({ length: Math.max(0, plan.sets - done.length) }, () => ({})));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 20px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <span className="frencia-label">Ejercicio {index} · {ex.muscle}</span>
          <div style={{ font: 'var(--text-title)', color: 'var(--text-primary)', marginTop: 4 }}>{ex.name}</div>
          <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="frencia-label">Plan</span><ExerciseSummary exercise={ex} plan={plan} prefs={D.prefs} />
          </div>
        </div>
        <IconButton icon="more-horizontal" variant="surface" aria-label="Más opciones" />
      </div>

      {plan.sets > 1 ? <ProgressBar segments={plan.sets} value={done.length} tone="green" /> : null}

      {!finished ? (
        <SerieComparativa exercise={ex} plan={plan} previous={ses.previous} today={cur} prefs={D.prefs}
          activeKey={firstEmpty} title={plan.sets > 1 ? `Serie ${serie} de ${plan.sets}` : 'Serie única'} />
      ) : null}

      {resting ? (
        <RestRing total={plan.rest} next={`Sigue la serie ${serie} de ${plan.sets}.`} onSkip={() => setResting(false)} onDone={() => setResting(false)} />
      ) : finished ? (
        <Card variant="green" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--accent-text)', textTransform: 'uppercase' }}>Ejercicio completo</div>
          <span style={{ font: 'var(--text-body-sm)', color: 'var(--text-secondary)' }}>Siguiente: Soga</span>
        </Card>
      ) : (
        <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {ms.includes('peso') ? <Stepper label="Peso" value={cur.peso || 0} onChange={(v) => set('peso', v)} step={2} precision={1} unit={D.prefs.weight} size="lg" /> : null}
          {ms.includes('reps') ? <Stepper label="Reps" value={cur.reps || 0} onChange={(v) => set('reps', v)} size="lg" /> : null}
          {timed ? <IsoTimer key={timerKey} target={plan.tiempo} value={cur.tiempo} onChange={(v) => set('tiempo', v)} initialPhase={timerKey === 0 ? timerPhase : 'idle'} initialElapsed={timerKey === 0 ? timerElapsed : 0} style={{ margin: '0 -8px' }} /> : null}
          {ms.includes('tiempo') && !timed ? <DurationField label="Tiempo" value={cur.tiempo} onChange={(v) => set('tiempo', v)} step={60} allowHours size="lg" fullWidth /> : null}
          {ms.includes('distancia') ? <DistanceField label="Distancia" value={cur.distancia} onChange={(v) => set('distancia', v)} unit={unit} size="lg" fullWidth /> : null}
          {plan.intensity === 'RIR' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="frencia-label">RIR · cuánto te quedó</span>
              <SegmentedControl fullWidth value={cur.intensityValue} onChange={(v) => set('intensityValue', v)}
                options={[{ value: 0, label: '0' }, { value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4+' }]} />
            </div>
          ) : plan.intensity === 'RPE' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="frencia-label">RPE · qué tan duro fue</span>
              <SegmentedControl fullWidth value={cur.intensityValue} onChange={(v) => set('intensityValue', v)}
                options={[5, 6, 7, 8, 9, 10].map((n) => ({ value: n, label: String(n) }))} />
            </div>
          ) : null}
          <Button variant="primary" size="lg" icon="check" fullWidth disabled={!ready} onClick={register}>Registrar serie</Button>
        </Card>
      )}

      {plan.sets > 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="frencia-label">Series de hoy</span>
          <SeriesTable exercise={ex} sets={rows} intensity={plan.intensity} prefs={D.prefs} />
        </div>
      ) : null}
    </div>
  );
}

// Esfuerzo vs descanso, lado a lado.
function TimerCompareScreen() {
  const { IsoTimer, RestRing } = window.FrenciaDesignSystem_377129;
  React.useEffect(() => { window.lucide && lucide.createIcons(); });
  const Row = ({ t, d }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr 1fr', gap: 8, padding: '9px 0', borderTop: '1px solid var(--divider)', font: 'var(--fw-regular) 13px/1.35 var(--font-sans)', color: 'var(--text-secondary)' }}>
      <span className="frencia-label">{t}</span><span>{d[0]}</span><span>{d[1]}</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 20px 28px' }}>
      <span className="frencia-label">Mide el esfuerzo</span>
      <IsoTimer target={45} initialPhase="running" initialElapsed={38} />
      <span className="frencia-label" style={{ marginTop: 6 }}>Mide la pausa</span>
      <RestRing total={60} remaining={42} next="Sigue la serie 3 de 3." />
      <div style={{ marginTop: 6 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr 1fr', gap: 8, paddingBottom: 6 }}>
          <span></span><span className="frencia-label" style={{ color: 'var(--intensity-text)' }}>IsoTimer</span><span className="frencia-label" style={{ color: 'var(--accent-text)' }}>RestRing</span>
        </div>
        <Row t="Forma" d={['Barra horizontal con marca de objetivo', 'Anillo que se vacía']} />
        <Row t="Sentido" d={['Sube desde 0:00', 'Baja hasta 0:00']} />
        <Row t="Cifra" d={['Anton grande', 'Mono dentro del anillo']} />
        <Row t="Color" d={['Naranja: esfuerzo', 'Verde: pausa']} />
        <Row t="Etiqueta" d={['ESFUERZO', 'DESCANSO']} />
        <Row t="Resultado" d={['Completa la duración de la serie', 'No se registra']} />
      </div>
    </div>
  );
}

Object.assign(window, { SessionTypedScreen, TimerCompareScreen });
