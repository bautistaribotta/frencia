// Flujo de creación de rutina — wizard "un dato por pantalla".
// Replica el patrón del setup de perfil: header (volver + dots), cuerpo
// centrado (icono + "Paso X de N" + pregunta display + hint), CTA inferior.
// Solo front: al terminar dispara onFinish; volver en el paso 1 dispara onExit.
function CreateRoutineWizard({ onExit, onFinish }) {
  const { IconButton, Button, Stepper } = window.FrenciaDesignSystem_377129;

  const STEPS = [
    {
      key: 'name',
      icon: 'pencil-line',
      question: '¿Cómo se\u00a0llama tu rutina?',
      hint: 'Ponle un nombre que reconozcas de un vistazo.',
    },
    {
      key: 'days',
      icon: 'calendar-days',
      question: '¿Cuántos días por semana?',
      hint: 'Podrás ajustar los días de cada entreno más adelante.',
    },
  ];

  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState('');
  const [days, setDays] = React.useState(3);
  const inputRef = React.useRef(null);

  const total = STEPS.length;
  const current = STEPS[step];
  const isLast = step === total - 1;

  // Validación por paso
  const valid = step === 0 ? name.trim().length > 0 : days >= 1 && days <= 7;

  React.useEffect(() => {
    if (current.key === 'name' && inputRef.current) {
      const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [step]);

  const back = () => { step === 0 ? onExit && onExit() : setStep(step - 1); };
  const next = () => {
    if (!valid) return;
    isLast ? onFinish && onFinish({ name: name.trim(), days }) : setStep(step + 1);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>

      {/* HEADER: volver + dots de progreso */}
      <div style={{
        flexShrink: 0, paddingTop: 52,
        display: 'grid', gridTemplateColumns: '44px 1fr 44px', alignItems: 'center',
        padding: '52px 16px 8px',
      }}>
        <IconButton icon="chevron-left" variant="ghost" size="md" onClick={back} aria-label="Volver" />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          {STEPS.map((s, i) => (
            <span key={s.key} style={{
              height: 7,
              width: i === step ? 22 : 7,
              borderRadius: 999,
              background: i === step ? 'var(--accent)' : (i < step ? 'var(--green-deep)' : 'var(--surface-chip)'),
              transition: 'all var(--dur-base) var(--ease-out)',
            }} />
          ))}
        </div>
        <span />
      </div>

      {/* CUERPO centrado — key por paso: remonta el subárbol entero y evita
          que React intente remover nodos que Lucide ya convirtió a <svg>. */}
      <div key={current.key} style={{
        flex: 1, minHeight: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 24px', gap: 22,
      }}>
        {/* icono en recuadro de acento */}
        <div style={{
          width: 60, height: 60, borderRadius: 18, display: 'grid', placeItems: 'center',
          background: 'var(--surface-green-soft)', border: '1px solid var(--surface-green-line)',
          color: 'var(--accent-text)',
        }}>
          <i data-lucide={current.icon} style={{ width: 28, height: 28 }}></i>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{
            font: 'var(--text-data-label)', letterSpacing: 'var(--ls-wider)',
            textTransform: 'uppercase', color: 'var(--text-tertiary)',
          }}>
            Paso {step + 1} de {total}
          </span>

          <h1 style={{
            font: 'var(--text-display)', fontSize: 40, lineHeight: 0.98,
            letterSpacing: 'var(--ls-display)', textTransform: 'uppercase',
            color: 'var(--text-primary)', margin: 0, textWrap: 'balance',
          }}>
            {current.question}
          </h1>

          <p style={{
            font: 'var(--text-body-sm)', color: 'var(--text-secondary)',
            margin: 0, maxWidth: 300, textWrap: 'pretty',
          }}>
            {current.hint}
          </p>
        </div>

        {/* control del paso */}
        <div style={{ marginTop: 6 }}>
          {current.key === 'name' ? (
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') next(); }}
              placeholder="Push Pull Legs"
              maxLength={40}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--surface-inset)',
                border: '1.5px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 18px',
                color: 'var(--text-primary)',
                font: 'var(--fw-semibold) 18px var(--font-sans)',
                outline: 'none',
                caretColor: 'var(--accent)',
                transition: 'border-color var(--dur-fast) var(--ease-out)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Stepper value={days} onChange={setDays} min={1} max={7} unit="días" size="lg" />
              <span style={{ font: 'var(--text-body-sm)', color: 'var(--text-tertiary)', maxWidth: 130, textWrap: 'pretty' }}>
                {days === 1 ? '1 día por semana' : `${days} días por semana`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CTA inferior full-width */}
      <div style={{ flexShrink: 0, padding: '12px 20px 30px' }}>
        <Button
          key={'cta-' + step}
          variant="primary" size="lg" fullWidth
          iconRight={isLast ? undefined : 'arrow-right'}
          icon={isLast ? 'check' : undefined}
          disabled={!valid}
          onClick={next}
        >
          {isLast ? 'Crear rutina' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
}
window.CreateRoutineWizard = CreateRoutineWizard;
