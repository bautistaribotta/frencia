# Frencia Design System — React Native

Port nativo del design system web (`.claude/skills/frencia-design/`). Mismos tokens y
componentes, pero en `View`/`Text`/`StyleSheet` — usables directo en la app Expo.

## Uso

```tsx
import { Button, StatTile, Card, colors, spacing, useFrenciaFonts } from '@/design';
```

### Fuentes (obligatorio)
Las fuentes (Anton · Archivo · JetBrains Mono) cargan desde `@expo-google-fonts/*`.
Ya están cableadas en `src/app/_layout.tsx` con `useFrenciaFonts()` — la app no renderiza
hasta que cargan. Si creás otro root, hacé lo mismo.

### Tokens
- `colors` — aliases semánticos (`colors.accent`, `colors.surfaceCard`, `colors.textPrimary`…)
- `palette` — escala cruda (`palette.green500`, `palette.ink800`…)
- `spacing` / `space` / `sizing` — grid 8px, gutters, alturas de control
- `radius`, `shadow`, `motion` — bordes, elevación/glow (aprox. de CSS), duraciones
- `textRole`, `sans`, `mono`, `display` — roles de texto y familias por peso

### Componentes
core: `Button` `IconButton` `Card` `Badge` `Tag` `Avatar` `FrenciaText`
data: `StatTile` `MetricPill` `ProgressBar` `Stepper` `SetRow`
log: `ExerciseSummary` `SeriesTable`
nav: `SegmentedControl` `TabBar`
feedback: `Switch`

```tsx
<Card variant="green" hairline>
  <StatTile label="VOLUMEN" value="6.39" unit="t" size="lg" tone="green" delta="+5 kg" />
</Card>

<Button variant="primary" icon="play" fullWidth>Empezar entrenamiento</Button>

<SetRow index={1} load={82.5} reps={8} rir={2} state="done" onToggle={() => {}} />
```

### Iconos
`Icon` envuelve `lucide-react-native`. Acepta nombre kebab (`icon="check"`). El set
está en `Icon.tsx` (`REGISTRY`) — si falta uno, importalo ahí y agregalo al mapa.

## Diferencias vs web (a propósito)
- **Glow / sombras:** CSS usa box-shadow multicapa; RN no. `shadow.glow*` aproxima con
  `shadowColor`/`elevation`. Para halo neón real, poné una `View` absoluta detrás o
  usá `expo-linear-gradient`.
- **Blur del TabBar:** el web usa `backdrop-filter`. Acá es fill sólido translúcido.
  Para blur real, meté `expo-blur` (`<BlurView>`) detrás del `TabBar`.
- **letter-spacing:** CSS en `em`, RN en px. Convertido en `tracking`.
- **Hover:** no existe en touch; sólo se portó `press`/`active`/`selected`/`disabled`.

El skill original queda como fuente de verdad de diseño en `.claude/skills/frencia-design/`.
