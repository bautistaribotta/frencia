// Estado vacío de "Hoy" — cuenta recién creada, sin rutinas ni historial.
// Onboarding editorial: placeholder de sesión + primeros pasos.
function HomeEmpty({ onCreate }) {
  const { Avatar, Badge, Button } = window.FrenciaDesignSystem_377129;
  const d = window.FRENCIA_DATA;
  const first = d.user.name.split(' ')[0];

  const steps = [
    { n: 1, title: 'Crea tu primera rutina', sub: 'Define ejercicios, series y repeticiones', icon: 'list-plus', state: 'active' },
    { n: 2, title: 'Registra una sesión', sub: 'Anota peso, reps y RIR mientras entrenas', icon: 'pencil-line', state: 'locked' },
    { n: 3, title: 'Sigue tu progreso', sub: 'PRs, volumen semanal y 1RM estimado', icon: 'trending-up', state: 'locked' },
  ];

  return (
    <div style={{ padding: '56px 20px 120px', display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Saludo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={d.user.name} size="md" ring />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ font: 'var(--text-subtitle)', color: 'var(--text-primary)' }}>Hola, {first}</span>
            <span className="frencia-label">Jueves · 12 jun</span>
          </div>
        </div>
        <Badge tone="neutral">Día 1</Badge>
      </div>

      {/* Placeholder de la sesión de hoy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{
          position: 'relative',
          border: '1.5px dashed var(--border-default)',
          borderRadius: 22,
          background: 'var(--surface-card)',
          padding: '30px 22px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 14,
          overflow: 'hidden',
        }}>
          {/* sutil veta de fondo */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none',
            background: 'repeating-linear-gradient(135deg, transparent 0 13px, rgba(255,255,255,0.014) 13px 14px)',
          }} />

          <div style={{
            width: 60, height: 60, borderRadius: 18, display: 'grid', placeItems: 'center',
            background: 'var(--surface-green-soft)', border: '1px solid var(--surface-green-line)',
            color: 'var(--accent-text)', position: 'relative',
          }}>
            <i data-lucide="dumbbell" style={{ width: 28, height: 28 }}></i>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
            <span style={{ font: 'var(--text-data-label)', letterSpacing: 'var(--ls-wider)', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              Tu sesión de hoy
            </span>
            <div style={{ font: 'var(--text-display)', fontSize: 38, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-display)', lineHeight: 0.96 }}>
              Empieza<br />aquí
            </div>
            <p style={{ font: 'var(--text-body-sm)', color: 'var(--text-secondary)', margin: '2px auto 0', maxWidth: 260, textWrap: 'pretty' }}>
              Aún no tienes rutinas. Crea la primera y registra cada serie a tu manera.
            </p>
          </div>

          <div style={{ width: '100%', position: 'relative', marginTop: 4 }}>
            <Button variant="primary" size="lg" icon="plus" fullWidth onClick={onCreate}>Crear primera rutina</Button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7 }}>
          <i data-lucide="calendar-off" style={{ width: 13, height: 13, color: 'var(--text-tertiary)' }}></i>
          <span className="frencia-label">Sin sesiones programadas</span>
        </div>
      </div>

      {/* Primeros pasos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 2px' }}>
          <span className="frencia-label">Primeros pasos</span>
          <span style={{ font: 'var(--text-data-label)', color: 'var(--text-tertiary)' }}>0 / 3</span>
        </div>

        <div style={{
          background: 'var(--surface-card)', borderRadius: 20,
          border: '1px solid var(--border-subtle)', overflow: 'hidden',
        }}>
          {steps.map((s, i) => {
            const active = s.state === 'active';
            return (
              <div key={s.n} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 16px',
                borderTop: i === 0 ? 'none' : '1px solid var(--divider)',
                cursor: active ? 'pointer' : 'default',
                opacity: active ? 1 : 0.62,
              }} onClick={active ? onCreate : undefined}>
                <div style={{
                  flexShrink: 0, width: 34, height: 34, borderRadius: 11, display: 'grid', placeItems: 'center',
                  background: active ? 'var(--accent)' : 'transparent',
                  border: active ? 'none' : '1.5px solid var(--border-default)',
                  color: active ? 'var(--text-on-accent)' : 'var(--text-tertiary)',
                  font: 'var(--fw-bold) 14px var(--font-mono)',
                }}>
                  {s.n}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ font: 'var(--fw-semibold) 15px var(--font-sans)', color: 'var(--text-primary)' }}>{s.title}</span>
                  <span style={{ font: 'var(--text-body-sm)', fontSize: 12.5, color: 'var(--text-tertiary)' }}>{s.sub}</span>
                </div>
                <i data-lucide={active ? 'chevron-right' : 'lock'} style={{ width: 17, height: 17, color: active ? 'var(--accent-text)' : 'var(--text-disabled)', flexShrink: 0 }}></i>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
window.HomeEmpty = HomeEmpty;
