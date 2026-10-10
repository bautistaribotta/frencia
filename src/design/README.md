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
- `radius`, `shadows`, `motion` — bordes, elevación/glow (aprox. de CSS), duraciones.
  Las sombras cambian con el tema: en componentes usar `useShadows()` o el segundo
  argumento de `useThemedStyles((colors, shadows) => …)`. `shadow` (singular) es la
  del tema oscuro, solo para código fuera del tema.
- `withAlpha(hex, alpha)` — un color del tema con alpha, para degradados que funden
  contra el fondo
- `textRole`, `sans`, `mono`, `display` — roles de texto y familias por peso

### Componentes
core: `Button` `IconButton` `Card` `Badge` `Tag` `Avatar` `FrenciaText`
data: `StatTile` `MetricPill` `ProgressBar` `Stepper` `SetRow`
log: `ExerciseSummary` `SeriesTable` `DurationField` `DistanceField` `NumberField` `IsoTimer` `ExerciseTypeTag`
nav: `SegmentedControl` `TabBar`
feedback: `Switch` `Checkbox`

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
- **IsoTimer:** suma una cuenta regresiva de 3 s cancelable antes de contar, vibra en la
  cuenta, al arrancar y al llegar al objetivo, y mantiene la pantalla encendida mientras
  mide (`expo-keep-awake`). Los dígitos van en mono y no en la display, como el descanso:
  cambian cada segundo y sin ancho fijo el número baila.

El skill original queda como fuente de verdad de diseño en `.claude/skills/frencia-design/`.
