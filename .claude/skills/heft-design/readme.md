# HEFT — Design System

> **HEFT** is an iOS training-log app. You bring the routine you already wrote on
> paper; HEFT turns it into a living record. It does **not** generate routines.
> It logs sets, tracks progression over time, and does the effort math athletes
> actually use — **RIR, RPE, AMRAP, 1RM estimates, tonnage**.
>
> Tagline: **"Cada serie cuenta."** (Every set counts.)

The product voice is athletic and editorial; the surface is dark, fast, and
data-dense. Think a stopwatch crossed with a training journal — built for the
30 seconds between sets, in a dim gym, with one thumb.

---

## Product context

HEFT is a single product today: a **native-feeling iOS app**. Core jobs:

1. **Log** — enter the routine you already have (exercises, sets, target reps/load)
   and check off each set as you complete it, capturing reps · load · RIR.
2. **Review** — a history of every session, browsable and searchable.
3. **Progress** — see progression curves per exercise (load, est. 1RM, tonnage),
   PR markers, and trend over weeks.
4. **Compute** — quick calculators for RIR↔RPE, AMRAP → est. 1RM, plate math,
   and target-load suggestions based on last session.

The signature artifact is the **workout stub** — a finished session rendered like
a receipt/ticket (scalloped edge, barcode of the date, the session's numbers).
This came directly from a reference the user loved; we kept the *form* and
rebuilt the *skin* in HEFT's dark + green + orange language.

### Source material (provided by the user)
The system was designed from a moodboard, not a codebase. Inputs:
- `uploads/colores.jpg` — orange-branding palette card ("audacity and boldness").
- `uploads/Captura ...031648.png` — "Zone", a green-on-black gym app (dark iOS UI reference).
- `uploads/2.jpg` — "FROM THE FIRST SQUAT TO FOREVER" — gritty B&W athletic poster, bold condensed type.
- `uploads/90714...jpg` — a white ticket/receipt (the **form factor** the user loved).
- `uploads/89ee40...jpg` — editorial running-stats overlay, technical mono data labels.
- `uploads/ffdc...jpg` & `Which Apple Watch...jpg` — Nike Run Club on Apple Watch — neon green on black, raw energy.
- `uploads/2b2afb...mp4` — motion reference (not transcribed).

> The user liked the **ticket form** but **not** its colors/type. The requested
> palette: black + green + orange. Greens skew **emerald** (`#22C55E` family),
> not Nike lime — honored throughout.

---

## CONTENT FUNDAMENTALS — how HEFT writes

**Language.** UI copy is **Spanish** (the product's audience). Technical training
abbreviations stay in their universal form: **RIR, RPE, AMRAP, PR, 1RM**.

**Voice.** Coach-in-your-corner, never a hype machine. Short, declarative,
present tense. We address the user as **tú** ("Registra tu serie", "Vas a paso de PR").
We speak as a quiet system, not "I".

**Casing.**
- **Data labels** are `UPPERCASE` mono with wide tracking: `VOLUMEN`, `RIR MEDIO`, `SERIES`.
- **Headings / titles** are sentence case in Archivo: "Sesión de hoy", "Press banca".
- **Poster / hero moments** (empty states, session-complete) use **ALL-CAPS Anton**: "SESIÓN COMPLETA", "NUEVO PR".
- **Buttons** are sentence case verbs: "Empezar", "Registrar serie", "Terminar".

**Numbers lead.** Whenever a number is the message, it is the biggest thing on
screen. `82.5 kg`, `RIR 2`, `+5 kg`. Units are smaller and muted, set in mono,
trailing the value.

**Tone examples**
- CTA: **"Empezar entrenamiento"** · **"Registrar serie"** · **"Terminar"**
- Encouragement (sparing): **"Vas a paso de PR."** · **"Una más que la última vez."**
- Empty state: **"Sin sesiones aún. Pega tu rutina y empieza."**
- Effort prompt: **"¿Cuántas te quedaron en el tanque?"** (RIR capture)
- Session done: **"SESIÓN COMPLETA"** + the stub.

**Don't.** No exclamation spam, no emoji in product chrome, no motivational-poster
clichés in functional copy, no fabricated stats. Keep it honest — this app records
what *actually* happened.

---

## VISUAL FOUNDATIONS

**Overall vibe.** Dark, athletic, editorial-technical. The screen is a black
field; data glows. Energy comes from one or two vivid accents on near-black, bold
condensed numerals, and tight technical mono captions — never from gradients or
decoration.

**Color.**
- Base is **warm black** `--ink-900 #161317` (app bg), with `--ink-950` for deep
  insets and `#000` reserved for OLED edges. Surfaces step up in lightness
  (`--surface-card #221E24`, elevated `#29242B`) rather than relying on shadow.
- **Emerald green `--green-500 #22C55E`** is the signature: primary actions,
  success, completed sets, positive progression, the active CTA glow.
- **Orange `--orange-500 #FF6D29`** is the intensity accent: PRs, high effort /
  low RIR, AMRAP markers, alerts, "push" states. Used sparingly — it means *heat*.
- Text is an **off-white `--ink-100 #E8E4E9`** primary, stepping down through
  `--ink-300` (secondary) and `--ink-400` (tertiary). Pure white is rare.
- **Black sits on the accents** (`--text-on-accent` is `#000`) — green and orange
  fills carry black labels, exactly like the Nike/Zone references.

**Type.** Three families, each with one job:
- **Anton** (`--font-display`) — ultra-bold condensed, UPPERCASE. Hero numbers and
  poster headlines only. The "EARN THE BURN" energy.
- **Archivo** (`--font-sans`) — modern grotesque. All UI and body, weights 400–900.
- **JetBrains Mono** (`--font-mono`) — every data label, stat value, RIR/RPE/AMRAP
  readout, timestamp, and metadata. Uppercase + wide tracking for captions.

> ⚠️ **Font substitution:** fonts load from **Google Fonts CDN** (no binaries were
> provided). Anton/Archivo/JetBrains Mono were chosen to match the moodboard's
> condensed-athletic + technical-mono pairing. If you have licensed brand fonts,
> send them and we'll swap the `@font-face` block in `tokens/fonts.css`.

**Spacing & layout.** 8px grid (`tokens/spacing.css`). Screen gutters 20px.
Generous vertical rhythm; data grouped into cards with clear internal padding
(`--pad-card 20px`). Bottom tab bar 84px (with home-indicator safe area). Min
hit target 44px, always.

**Corner radii.** Generously rounded, iOS-native: buttons/inputs `--radius-md 14px`,
chips `--radius-lg 18px`, cards `--radius-xl 24px`, sheets/hero `--radius-2xl 30px`,
pills fully round. The stub component uses scalloped circular notches, not radius.

**Cards.** Flat `--surface-card` fill, no drop shadow by default; separated from
the bg by lightness and an optional hairline `--border-subtle`. Elevated/active
cards step to `--surface-card-elevated` and may carry a tinted border
(`--surface-green-line`). Reserve real shadow (`--shadow-lg`) for floating sheets.

**Borders & dividers.** Hairlines are subtle: `--border-subtle` between sibling
surfaces, `--divider rgba(255,255,255,.07)` inside lists. Accent borders
(green/orange at ~28–32% alpha) mark selection and state.

**Shadows & glow.** Dark UI minimizes drop shadow. The brand's lighting effect is
a **green glow** on the primary CTA and active timer (`--glow-green`) — a soft
neon halo, never a blur-heavy material shadow. Orange has a matching `--glow-orange`
for PR/intensity moments.

**Transparency & blur.** Used for chrome over content: nav bars and the tab bar
use a translucent `--bg-app` with `backdrop-filter: blur()`; bottom sheets dim the
field behind them. Tinted soft surfaces (`--surface-green-soft` at ~10% alpha) wash
a card when it's in an accent state.

**Imagery.** When photography appears (hero/empty states, exercise thumbnails) it's
**desaturated, gritty, high-grain B&W or cool-toned**, echoing the squat poster and
trail-run references — never bright stock-gym imagery. Data and type overlay it in
white + mono. Use placeholders (`image-slot`) for real photos; never generate them.

**Motion.** Quick and tactile. Default `--ease-out` over `--dur-base 200ms`.
Presses **shrink** to `--press-scale 0.97` with a spring (`--ease-spring`). State
changes (set completed) **fade + slide** subtly. The active rest-timer ring is the
only continuous animation. No bounce-heavy or decorative loops. Respect
`prefers-reduced-motion`.

**Interaction states.**
- **Hover** (where applicable): accent lifts one step (`--green-500` → `--green-400`);
  surfaces lighten one step.
- **Press:** scale 0.97 + step to the darker accent (`--accent-press`).
- **Selected:** tinted soft fill + accent hairline border + accent text.
- **Disabled:** `--text-disabled` on `--ink-700`, no glow, 0.5 effective contrast.
- **Completed set:** green check, value locks, row tints `--surface-green-soft`.

---

## ICONOGRAPHY

HEFT uses **Lucide** (https://lucide.dev) — clean, consistent line icons at a
medium stroke. No codebase icon set was provided, so this is a **flagged
substitution**: Lucide was picked for its athletic/clarity fit and complete
fitness vocabulary (`dumbbell`, `activity`, `trending-up`, `timer`, `flame`,
`zap`, `check`, `plus`, `minus`, `chevron-*`, `bar-chart-3`, `repeat`, `target`).

**Usage rules.**
- **Stroke:** 1.75–2px, `currentColor`. Inherit text color; accent only when the
  icon *is* the action (green) or signals intensity (orange flame/zap).
- **Sizes:** 16 (inline/labels), 20 (controls/tabs), 24 (primary nav), 28 (feature).
- **Don't** mix filled and line icons; don't recolor decoratively; don't use emoji
  in product chrome. Emoji from references (🎉 on the old ticket) are **removed** —
  HEFT marks completion with type + green check, not emoji.
- **Unicode** used only for a few inline glyphs: `×` (multiply, in "weight × reps"),
  `↑ ↓` (delta arrows), `·` (separator). Everything else is Lucide.

Loaded from CDN in specimen/kit HTML:
`<script src="https://unpkg.com/lucide@latest"></script>` then `lucide.createIcons()`.
See `assets/` for the brand wordmark and any captured imagery.

---

## INDEX — what's in this system

**Root**
- `styles.css` — global entry point (import list only). Consumers link this.
- `readme.md` — this file.
- `SKILL.md` — Agent-Skill front-matter wrapper.

**`tokens/`** — design tokens (`@import`ed by `styles.css`)
- `fonts.css` · `colors.css` · `typography.css` · `spacing.css` · `radius.css` · `base.css`

**`guidelines/`** — foundation specimen cards (Design System tab: Type · Colors · Spacing · Brand)

**`assets/`** — wordmark + brand imagery

**`components/`** — reusable React primitives (namespace `window.HeftDesignSystem_377129`)
- `core/` — `Button`, `IconButton`, `Card`, `Badge`, `Tag`, `Avatar`
- `data/` — `StatTile`, `MetricPill`, `ProgressBar`, `Stepper`, `SetRow`
- `navigation/` — `SegmentedControl`, `TabBar`
- `feedback/` — `Switch`

**`ui_kits/ios_app/`** — HEFT iOS app recreation
- `index.html` (interactive) + `Home`, `WorkoutLog`, `Progress`, `SessionStub` screens

---

*Generated artifacts (`_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`)
are produced by the compiler — do not edit by hand.*
