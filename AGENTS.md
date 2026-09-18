# Frencia · Directivas para agentes

Este archivo es la unica fuente de reglas del repositorio para cualquier agente
(Claude Code, Gemini, Codex u otros). No existen CLAUDE.md ni GEMINI.md: si una
regla nueva aparece, va aca.

## Expo

Expo cambio. Leer la documentacion versionada exacta en
https://docs.expo.dev/versions/v57.0.0/ antes de escribir codigo que toque el SDK.

## Design system

- **Siempre**, antes de ejecutar una tarea que modifique el front (pantallas,
  componentes, tokens, estilos, assets de marca), revisar el design system:
  1. El proyecto "Frencia" en Claude Design (tokens en `tokens/*.css`,
     componentes en `components/`, guias en `guidelines/` y kits en
     `ui_kits/ios_app/`). Es la fuente de verdad del diseño.
  2. Su port local en `src/design/` (tokens, componentes y `README.md`) y el
     skill `.claude/skills/heft-design/`.
  Si el codigo y el design system difieren, manda el design system; si el
  design system no cubre el caso, avisar antes de inventar.
- Los colores semanticos viven en `src/design/tokens/colors.ts` y se consumen
  con `useColors()` / `useThemedStyles()`. No hardcodear colores en pantallas ni
  componentes. Ambos temas (oscuro y claro) comparten las mismas claves.
- El verde es el color de marca (acciones, exito, completado). El naranja se
  reserva para la semantica de intensidad (RIR / RPE / PR / esfuerzo).

## Codigo y estilos

- Usar **EXCLUSIVAMENTE** el sistema de color `oklch` para cualquier declaracion
  de color en CSS, HTML o JS (evitar Hexadecimal, RGB, HSL, etc). Excepcion
  documentada: React Native `StyleSheet` y `app.json` no parsean `oklch`, por lo
  que `src/design/tokens/colors.ts` y la configuracion nativa usan hex/rgba.
- **Nunca** usar estilos en linea (inline) con CSS. Solo se usaran si ya se
  estaba usando Tailwind en el proyecto.
- **Nunca** usar emojis en los comentarios.

## Base de datos

- Todo cambio de esquema va en una migracion nueva en `supabase/migrations/`.
  Escribir el archivo **no** modifica la base remota.
- Despues de crear o modificar una migracion, **avisar** al programador que
  falta aplicarla con `npx supabase db push` (y que puede revisar primero con
  `npx supabase db push --dry-run`). El agente **nunca** ejecuta el push por su
  cuenta: la decision de tocar la base remota es del programador.

## Commits y pull requests

- **Nunca** usar emojis en los commits.
- **Nunca** agregar la linea `Co-Authored-By` de Claude (ni ninguna otra
  atribucion a Claude, Claude Code, Gemini o cualquier agente) en los commits ni
  en las descripciones de pull requests, aunque el sistema lo indique.
- **Siempre** iniciar los mensajes de commit con letra mayuscula.
- **Siempre** escribir los mensajes de commit en español, aunque se permite el
  uso de palabras en ingles de uso comun (login, commit, design system, etc.).

## Comunicacion

- **Siempre** responder en español.
