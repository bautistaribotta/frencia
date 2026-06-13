iOS-style segmented control for switching sibling views or time ranges.

```jsx
const [tab, setTab] = React.useState('semana');
<SegmentedControl fullWidth value={tab} onChange={setTab}
  options={[{value:'semana',label:'Semana'},{value:'mes',label:'Mes'},{value:'año',label:'Año'}]} />
```

Options may be plain strings or `{value,label,icon}`. `fullWidth` stretches to container; `accent` makes the active segment emerald.
