# HEFT — iOS app UI kit

A high-fidelity recreation of the HEFT iOS app: log the routine you already have
on paper, then review history, progress, and effort math (RIR/RPE/AMRAP).

## Run
Open `index.html`. It renders inside an iPhone frame (`ios-frame.jsx`) and is
interactive:
- **Hoy** → tap **Empezar entrenamiento** (or the center ▶ action) to start.
- **Registro** → adjust **Peso / Reps**, pick **RIR**, tap **Registrar serie**
  (advances + shows a rest banner). Tap **Terminar** to finish.
- **Stub** → the workout-receipt summary (the signature artifact). **Hecho**
  returns home.
- Bottom tabs: **Hoy · Historial · Progreso · Perfil** (Perfil shows `Switch` in context).

## Files
- `index.html` — app shell, tab nav + workout flow, plus inline History/Profile screens.
- `data.js` — mock data (plain globals).
- `HomeScreen.jsx` — today's session, week stats, last PR.
- `WorkoutLogScreen.jsx` — active set logging (Steppers, RIR, SetRows, rest timer).
- `ProgressScreen.jsx` — est. 1RM, weekly volume chart, PR history.
- `SessionStub.jsx` — the dark "receipt" session summary.
- `ios-frame.jsx` — device bezel (starter component).

## Composition
Screens compose primitives from `window.HeftDesignSystem_377129` (the compiled
bundle): `Button`, `IconButton`, `Card`, `Badge`, `Tag`, `Avatar`, `StatTile`,
`Stepper`, `SetRow`, `ProgressBar`, `MetricPill`, `SegmentedControl`, `TabBar`,
`Switch`. Each screen file pulls what it needs at the top and attaches itself to
`window`. Icons are Lucide; `lucide.createIcons()` re-runs after every render.

> Recreation built from the user's moodboard (no original HEFT codebase existed).
> The bar chart and barcode are CSS/`div` data renderings, not illustrations.
