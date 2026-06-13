HEFT's signature big-number stat — Anton numerals over a mono caption, with an optional progression delta.

```jsx
<StatTile label="Volumen total" value="12 480" unit="kg" size="lg" delta="+640" deltaDir="up" />
<StatTile label="RIR medio" value="1.8" tone="green" size="md" />
```

Sizes `sm`/`md`/`lg`/`xl` (xl = hero). `tone` colors the number emerald or orange. Pass `delta` + `deltaDir` for a trend chip (renders a Lucide arrow — run `lucide.createIcons()`).
