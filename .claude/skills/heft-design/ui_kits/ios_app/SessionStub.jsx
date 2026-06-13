// app-bg colored circle that "cuts" a notch into the ticket
function Notch({ style }) {
  return <div style={{ position: 'absolute', width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-app)', ...style }} />;
}

function StubStat({ label, value, unit, tone }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span className="heft-label" style={{ fontSize: 9 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: tone || 'var(--text-primary)' }}>
        {value}{unit ? <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 2 }}>{unit}</span> : null}
      </span>
    </div>
  );
}

function SessionStub({ onDone }) {
  const { Button, Badge } = window.HeftDesignSystem_377129;
  const s = window.HEFT_DATA.session;
  return (
    <div style={{ padding: '52px 20px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

      {/* ===== Ticket ===== */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 330 }}>
        <div style={{
          position: 'relative', background: 'var(--surface-card-elevated)',
          borderTopLeftRadius: 'var(--radius-2xl)', borderTopRightRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        }}>
          {/* header */}
          <div style={{ padding: '26px 24px 20px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 1, color: 'var(--text-primary)', textTransform: 'uppercase' }}>HEFT</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, lineHeight: 0.92, color: 'var(--accent)', textTransform: 'uppercase' }}>Sesión<br/>completa</div>
            <div style={{ font: '11px var(--font-mono)', letterSpacing: 'var(--ls-wide)', color: 'var(--text-tertiary)', marginTop: 12 }}>
              {s.routine} · {s.date} · {s.time}
            </div>
          </div>

          {/* big duration / volume */}
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '4px 24px 22px', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--text-primary)', lineHeight: 0.9 }}>{s.dur}</div>
              <span className="heft-label" style={{ fontSize: 9 }}>Duración</span>
            </div>
            <div style={{ width: 1, background: 'var(--divider)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--text-primary)', lineHeight: 0.9 }}>{s.volume}</div>
              <span className="heft-label" style={{ fontSize: 9 }}>Volumen · {s.volumeUnit}</span>
            </div>
          </div>

          {/* perforation */}
          <div style={{ position: 'relative', height: 24 }}>
            <Notch style={{ left: -11, top: 1 }} />
            <Notch style={{ right: -11, top: 1 }} />
            <div style={{ position: 'absolute', left: 18, right: 18, top: 12, borderTop: '2px dashed var(--border-default)' }} />
          </div>

          {/* stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: '18px 24px 8px' }}>
            <StubStat label="Ejercicios" value={s.exercises} />
            <StubStat label="Series" value={s.sets} />
            <StubStat label="RIR medio" value={s.rir} tone="var(--accent)" />
          </div>

          {/* exercise log */}
          <div style={{ padding: '12px 24px 4px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {s.log.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < s.log.length - 1 ? '1px solid var(--divider)' : 'none' }}>
                <span style={{ font: '13px var(--font-sans)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ font: '11px var(--font-mono)', color: 'var(--text-tertiary)' }}>{l.sets}</span>
                  {l.name}
                  {l.pr ? <Badge tone="orange-solid">PR</Badge> : null}
                </span>
                <span style={{ font: 'var(--fw-semibold) 13px var(--font-mono)', color: 'var(--text-primary)' }}>{l.top}</span>
              </div>
            ))}
          </div>

          {/* barcode */}
          <div style={{ padding: '20px 24px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: '100%', height: 46,
              backgroundImage: 'repeating-linear-gradient(90deg, var(--ink-100) 0 2px, transparent 2px 4px, var(--ink-100) 4px 5px, transparent 5px 9px, var(--ink-100) 9px 12px, transparent 12px 14px)',
              opacity: 0.92,
            }} />
            <span style={{ font: '11px var(--font-mono)', letterSpacing: 'var(--ls-widest)', color: 'var(--text-tertiary)' }}>{s.id}</span>
          </div>

          {/* scalloped bottom */}
          <div style={{ position: 'relative', height: 14 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: -11, display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-app)' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* actions */}
      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 330 }}>
        <Button variant="secondary" size="lg" icon="share" style={{ flex: 1 }}>Compartir</Button>
        <Button variant="primary" size="lg" icon="check" style={{ flex: 1 }} onClick={onDone}>Hecho</Button>
      </div>

    </div>
  );
}
window.SessionStub = SessionStub;
