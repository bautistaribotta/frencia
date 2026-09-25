import React from 'react';

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
  s.id = 'frencia-excfg-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

const RIR_OPTS = [{ value: 0, label: '0' }, { value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4+' }];

/**
 * Segunda cara de ExercisePickerModal: configurar un ejercicio dentro de un
 * día (agregar o editar). Los campos salen de los datos que registra el
 * ejercicio; el peso no se planifica; el descanso no aparece en cardio de
 * una sola serie.
 */
export function ExerciseConfig({ exercise, plan = {}, mode = 'add', prefs, onBack, onSubmit, className = '', ...rest }) {
  const NS = window.FrenciaDesignSystem_377129 || {};
  const { ExerciseMetrics: M, Stepper, DurationField, DistanceField, SegmentedControl, Tag, Button, IconButton, ExerciseTypeTag, ExerciseSummary } = NS;
  const kind = M ? M.KINDS[exercise.kind] : null;
  const defaultScale = kind && kind.intensity === 'required' ? kind.scales[0] : null;

  const [p, setP] = React.useState(() => ({
    sets: plan.sets || 3,
    reps: plan.reps != null ? plan.reps : null,
    tiempo: plan.tiempo != null ? plan.tiempo : null,
    distancia: plan.distancia != null ? plan.distancia : null,
    intensity: plan.intensity !== undefined ? plan.intensity : defaultScale,
    intensityValue: plan.intensityValue != null ? plan.intensityValue : null,
    rest: plan.rest != null ? plan.rest : 90,
  }));
  const set = (k, v) => setP((prev) => ({ ...prev, [k]: v }));

  React.useEffect(() => { window.lucide && window.lucide.createIcons(); });
  if (!M) return null;

  const vol = M.planMetrics(exercise);
  const hasPeso = M.metrics(exercise).includes('peso');
  const restOn = M.restVisible(exercise, p.sets);
  const per = p.sets > 1 ? ' por serie' : '';
  const isCardio = exercise.kind === 'cardio';
  const unit = M.distUnit(exercise, prefs);
  const valid = vol.some((k) => p[k] != null && p[k] > 0);

  const scaleOpts = kind.intensity === 'required'
    ? kind.scales.map((s) => ({ value: s, label: s }))
    : [{ value: 'none', label: kind.scales.length > 1 ? 'Sin intensidad' : 'Sin RPE' }].concat(kind.scales.map((s) => ({ value: s, label: s })));
  const setScale = (v) => setP((prev) => ({ ...prev, intensity: v === 'none' ? null : v, intensityValue: v === prev.intensity ? prev.intensityValue : (v === 'RIR' ? 2 : v === 'RPE' ? (isCardio ? 6 : 8) : null) }));

  const final = { ...p, rest: restOn ? p.rest : null };
  const repsStepper = vol.includes('reps');

  return (
    <div className={['frencia-excfg', className].filter(Boolean).join(' ')} {...rest}>
      <div className="frencia-excfg__nav">
        <IconButton icon="chevron-left" variant="ghost" onClick={onBack} aria-label="Volver al catálogo" />
        <span className="frencia-excfg__navt">{mode === 'edit' ? 'Editar ejercicio' : 'Agregar al día'}</span>
      </div>

      <div className="frencia-excfg__head">
        <h2 className="frencia-excfg__name">{exercise.name}</h2>
        <ExerciseTypeTag exercise={exercise} />
      </div>

      <div className="frencia-excfg__sec">
        {repsStepper ? (
          <div className="frencia-excfg__pair">
            <Stepper label="Series" value={p.sets} onChange={(v) => set('sets', v)} min={1} max={12} size="lg" />
            <Stepper label={'Reps' + per} value={p.reps || 0} onChange={(v) => set('reps', v)} min={1} max={100} size="lg" />
          </div>
        ) : (
          <div className="frencia-excfg__pair">
            <Stepper label="Series" value={p.sets} onChange={(v) => set('sets', v)} min={1} max={12} size="lg" />
            <span></span>
          </div>
        )}
        {vol.includes('tiempo') ? (
          <DurationField label={'Tiempo' + per} value={p.tiempo} onChange={(v) => set('tiempo', v)}
            step={isCardio ? 60 : 5} allowHours={isCardio} size="lg" fullWidth />
        ) : null}
        {vol.includes('distancia') ? (
          <DistanceField label={'Distancia' + per} value={p.distancia} onChange={(v) => set('distancia', v)} unit={unit} size="lg" fullWidth />
        ) : null}
        {hasPeso ? (
          <div className="frencia-excfg__note"><span style={{ display: 'inline-flex' }}><i data-lucide="info"></i></span>
            <span>El peso no va en el plan: lo elegís en cada serie durante la sesión.</span></div>
        ) : null}
      </div>

      <div className="frencia-excfg__sec">
        <span className="frencia-excfg__cap"><span>Intensidad</span>{kind.intensity === 'optional' ? <span className="frencia-excfg__opt">opcional</span> : null}</span>
        {scaleOpts.length > 1 ? <SegmentedControl fullWidth value={p.intensity || 'none'} onChange={setScale} options={scaleOpts} /> : null}
        {p.intensity === 'RIR' ? (
          <SegmentedControl fullWidth value={p.intensityValue} onChange={(v) => set('intensityValue', v)} options={RIR_OPTS} />
        ) : p.intensity === 'RPE' ? (
          <Stepper label="RPE objetivo" value={p.intensityValue || 0} onChange={(v) => set('intensityValue', v)} min={1} max={10} step={0.5} precision={1} size="lg" />
        ) : null}
      </div>

      {restOn ? (
        <div className="frencia-excfg__sec">
          <span className="frencia-excfg__cap"><span>Descanso entre series</span></span>
          <div className="frencia-excfg__chips" role="radiogroup">
            {M.REST_OPTIONS.map((r) => (
              <Tag key={r} selectable selected={p.rest === r} role="radio" aria-checked={p.rest === r} onClick={() => set('rest', r)}>{M.durCompact(r)}</Tag>
            ))}
          </div>
        </div>
      ) : null}

      <div className="frencia-excfg__foot">
        <div className="frencia-excfg__prev">
          <span className="frencia-excfg__cap"><span>En la lista del día</span></span>
          {valid ? <ExerciseSummary exercise={exercise} plan={final} prefs={prefs} size="lg" /> : <span className="frencia-excfg__err">Cargá {vol.map((k) => M.LABELS[k].toLowerCase()).join(' o ')} para seguir.</span>}
        </div>
        <Button variant="primary" size="lg" icon={mode === 'edit' ? 'check' : 'plus'} fullWidth disabled={!valid} onClick={() => onSubmit && onSubmit(final)}>
          {mode === 'edit' ? 'Guardar cambios' : 'Agregar al día'}
        </Button>
      </div>
    </div>
  );
}
