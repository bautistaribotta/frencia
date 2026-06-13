Primary action button for HEFT — emerald fill + soft glow, black label; use for the one main action on a screen.

```jsx
<Button variant="primary" size="lg" icon="play" fullWidth>Empezar entrenamiento</Button>
```

Variants: `primary` (emerald CTA), `intensity` (orange — PRs/high-effort, use sparingly), `secondary` (outlined surface), `ghost` (text-only). Sizes `sm` / `md` / `lg`. Pass Lucide icon names via `icon` / `iconRight` and run `lucide.createIcons()` after mount. Add `fullWidth` for sheet/footer CTAs.
