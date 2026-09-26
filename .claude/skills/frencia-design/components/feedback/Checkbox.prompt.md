Square checkbox — soft green fill and green check when checked, neutral border when empty.

```jsx
const [ok, setOk] = React.useState(false);
<Checkbox checked={ok} onChange={setOk} />
<Checkbox checked />  {/* static indicator, no onChange */}
```

Controlled via `checked`/`onChange`. Without `onChange` it is a read-only indicator that the parent marks (e.g. the legal consent screen checks each document after the user opens it). Use for confirmations inside a list; for binary settings use `Switch`.
