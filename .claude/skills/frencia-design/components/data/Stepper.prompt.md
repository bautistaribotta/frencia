Numeric stepper for logging reps and load — tabular mono value, ± controls, 44px+ targets.

```jsx
const [peso, setPeso] = React.useState(82.5);
<Stepper label="Peso" value={peso} onChange={setPeso} step={2.5} precision={1} unit="kg" size="lg" />
```

Controlled via `value`/`onChange`. Use `step={2.5}` + `precision={1}` for plate-friendly load; `step={1}` for reps. `min`/`max` clamp and auto-disable the buttons.

`format` swaps the number for a label: the effort stepper uses `min={-1}` and `format={(v) => v < 0 ? 'Fallo' : String(v)}` so failure sits one step below 0 RIR. `fullWidth` stretches it to its container (used in the exercise config, where series and reps sit side by side).
