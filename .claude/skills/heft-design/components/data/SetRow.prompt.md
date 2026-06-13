One logged set in a workout — index · load × reps · RIR · completion check. The atomic unit of HEFT logging.

```jsx
<SetRow index={1} load={82.5} reps={8} rir={2} state="done" onToggle={fn} />
<SetRow index={2} load={82.5} reps={8} state="active" onToggle={fn} />
```

States: `pending`, `active` (emerald hairline), `done` (green wash + filled check). Pass `rir` to show an orange reps-in-reserve chip. Stack rows inside a `Card` per exercise.
