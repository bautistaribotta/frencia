Compact inline metric chip for secondary readouts — rest timer, RIR, pace, heart rate.

```jsx
<MetricPill icon="timer" label="Descanso" value="2:00" tone="green" />
<MetricPill icon="flame" label="RIR" value="1" tone="orange" layout="inline" />
```

`tone` neutral/green/orange, `layout` stack (label over value) or inline. For a hero number use `StatTile`; for a status flag use `Badge`.
