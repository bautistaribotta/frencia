iOS toggle switch — emerald track when on, black thumb.

```jsx
const [on, setOn] = React.useState(true);
<Switch checked={on} onChange={setOn} />
```

Controlled via `checked`/`onChange`. Use for binary settings (e.g. "Avisar al terminar el descanso").
