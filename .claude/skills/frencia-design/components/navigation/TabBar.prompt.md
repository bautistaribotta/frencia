Translucent iOS bottom navigation with an optional center action FAB.

```jsx
<TabBar value={tab} onChange={setTab}
  items={[
    {value:'home', label:'Hoy', icon:'home'},
    {value:'hist', label:'Historial', icon:'calendar'},
    {value:'prog', label:'Progreso', icon:'trending-up'},
    {value:'perfil', label:'Perfil', icon:'user'},
  ]}
  fab={{ icon:'play', label:'Empezar', onClick: start }} />
```

When `fab` is set, items split evenly left/right of the emerald action button. Labels are mono uppercase; active tab turns emerald.
