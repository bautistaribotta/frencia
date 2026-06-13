Progress / completion bar — continuous fill or discrete segments (e.g. sets completed).

```jsx
<ProgressBar label="Volumen objetivo" value={68} showValue />
<ProgressBar segments={4} value={3} label="Series" showValue tone="green" />
```

`tone` green/orange, `size` sm/md/lg. Use `segments` to render set-by-set completion; otherwise `value`/`max` drive a continuous bar.
