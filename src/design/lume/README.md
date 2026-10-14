# Lume (Frencia 2.0)

Port a React Native del design system **Frencia 2.0** (artifact de tipo Design
System en Claude Design, https://claude.ai/artifact/UUp4wXWL7CrPVELCR42nEX). Ese
artifact es la fuente de verdad; esta carpeta lo sigue.

Lume: cada pantalla flota sobre un **fondo de luces** y su contenido va en
**vidrio**. Hay un solo color, el **lume** (verde lima), para la accion y lo que
esta en curso; el esfuerzo va en tinta. Tipografia: Instrument Sans en tres
anchos y DM Mono solo para sellos.

## Convivencia con el sistema anterior

Lume convive con `src/design/` (Anton / Archivo / esmeralda) mientras las
pantallas se migran de a partes. Una pantalla migrada importa de
`@/design/lume` y monta su propio `<Fondo>`; las demas siguen igual.

Migradas: login, registro, recuperar contraseña, aceptacion de textos legales,
Terminos / Privacidad y el setup del perfil.

## Piezas

| Pieza | Para que |
|---|---|
| `tokens.ts` | Colores de los dos temas, sombras y halos (`boxShadow`), espaciado, radios, movimiento. |
| `tipografia.ts` | `useLumeFonts()` (se carga en el layout raiz) y los roles `lumeTexto`. |
| `useLume()` | Tema activo + Reducir transparencia + Reducir movimiento. |
| `Fondo` | Las luces. `posicion` por pantalla (`cumbre`, `centro`, `flanco`, `base`, `velada`); `animado` solo en el onboarding. |
| `Vidrio` | Panel translucido: `normal`, `fuerte`, `denso` (con blur, solo en el cromo). |
| `LumeText`, `LumeButton`, `Campo`, `Casilla`, `Segmentado`, `Opciones` | Componentes base. |
| `PasoWizard`, `Escala`, `BotonTexto` | El marco comun de los wizards. |
| `Rueda` + `EscenarioRueda` | La edad del setup. |
| `Regla` | Regla recta, mas ancha que la pantalla: la altura del setup. |
| `ReglaCurva` | Arco de vidrio mas ancho que la pantalla que gira bajo una aguja fija: el peso del setup. Se arrastra con un PanGesture. |
| `IconoApp` | El icono de la app como marca de las pantallas de acceso. |

## Que fondo lleva cada pantalla

La tabla completa esta en `entrega/implementacion.md` del design system. Regla
de lectura: si el texto chico cae sobre la luz, se cambia la posicion del
fondo, nunca el texto.

## Diferencias con la web

- El brillo de canto del vidrio (`inset 0 1px 0`) es el borde de arriba en
  `glassHighlight`: RN no tiene sombra interior.
- Las dos reglas (altura y peso) son mas anchas que la pantalla y el borde del
  telefono las corta, sin fundido en los extremos.
