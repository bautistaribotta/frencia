// Conmutador claro/oscuro para las pantallas del kit.
// Escribe data-theme en <html> y lo persiste; expone useTheme() y <ThemeToggle/>.
const FRENCIA_THEME_KEY = 'frencia-theme';

function frenciaReadTheme() {
  try {
    const saved = localStorage.getItem(FRENCIA_THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) {}
  return 'dark';
}

function useTheme() {
  const [theme, setTheme] = React.useState(frenciaReadTheme);
  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(FRENCIA_THEME_KEY, theme); } catch (e) {}
  }, [theme]);
  return [theme, setTheme];
}

function ThemeToggle({ theme, onChange }) {
  const opts = [
    { v: 'light', icon: 'sun', label: 'Claro' },
    { v: 'dark', icon: 'moon', label: 'Oscuro' },
  ];
  return (
    <div style={{
      display: 'inline-flex', gap: 4, padding: 4, borderRadius: 999,
      background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
      boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
    }}>
      {opts.map((o) => {
        const on = theme === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} aria-pressed={on} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: on ? 'var(--accent)' : 'transparent',
            color: on ? 'var(--text-on-accent)' : 'var(--text-secondary)',
            font: 'var(--fw-semibold) 13px var(--font-sans)',
            transition: 'background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
          }}>
            <i data-lucide={o.icon} style={{ width: 15, height: 15 }}></i>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { useTheme, ThemeToggle });
