Pill tag for muscle groups, exercise categories and filter chips.

```jsx
<Tag dot>Pecho</Tag>
<Tag selectable selected>Empuje</Tag>
```

Use `selectable` for tappable filters and `selected` for the active state (emerald tint). `dot` adds a leading color dot. For uppercase status markers use `Badge` instead.

In the exercise catalog, filter chips carry their count in mono (`Pecho 27`) and only one is active at a time; tapping the active one goes back to `Todos`. In an expanded exercise row, the target muscle uses `dot` and the assisting muscles go without it.
