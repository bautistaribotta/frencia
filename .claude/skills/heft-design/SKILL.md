---
name: heft-design
description: Use this skill to generate well-branded interfaces and assets for HEFT, either for production or throwaway prototypes/mocks/etc. HEFT is a dark, athletic iOS training-log app (log the routine you already have on paper; track progression; RIR/RPE/AMRAP). Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation
- **Brand:** HEFT — dark-first, athletic, editorial. Warm-black field, emerald green (`#22C55E`) signature, orange (`#FF6D29`) intensity accent. Tagline: "Cada serie cuenta."
- **Tokens:** `styles.css` is the single entry point (`@import`s everything in `tokens/`). Use semantic aliases (`--accent`, `--surface-card`, `--text-primary`, `--glow-green`).
- **Type:** Anton (display/hero numbers, UPPERCASE), Archivo (UI/body), JetBrains Mono (all data labels, RIR/RPE/AMRAP). Loaded from Google Fonts CDN.
- **Components:** compiled to `window.HeftDesignSystem_377129` via `_ds_bundle.js`. See `components/**` and each `*.prompt.md`.
- **UI kit:** `ui_kits/ios_app/` — full interactive iOS app recreation.
- **Copy:** Spanish UI, universal training abbreviations (RIR/RPE/AMRAP/PR). Address the user as **tú**. Numbers lead; mono uppercase data labels.
- **Icons:** Lucide (CDN). 1.75–2px stroke, currentColor; accent only when active.

## Using the bundle in an HTML artifact
```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
<script>const { Button, StatTile, SetRow } = window.HeftDesignSystem_377129;</script>
```
(Adjust relative paths; load React UMD + Babel before the bundle for JSX.)
