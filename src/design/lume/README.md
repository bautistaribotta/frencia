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
Terminos / Privacidad, el setup del perfil, Inicio (`(main)/home`), la barra de pestañas y las listas de
Rutinas e Historial (con `SwipeableRow` y `src/components/EstadosPestania.tsx`), Perfil,
Editar perfil y Configuracion. Tambien estan en Lume las piezas globales: el
dialogo de confirmacion (`Dialogo` y el modal de alerta), el toast, la hoja
inferior (`src/components/Hoja.tsx`) y la rueda (`src/components/MeasurePicker.tsx`).
Editar rutina y Editar dia tambien, con sus piezas compartidas: `DayEditor`,
`DraggableRowList` y el selector de ejercicios (`ExercisePickerModal`).
La sesion (`session`) tambien: la cabecera en pildora con la escala cortada por
ejercicio, la grilla de la serie (`SerieComparativa`), la esfera del descanso
(`RestRing`), el cronometro del isometrico (`IsoTimer`), el menu del ejercicio
en una hoja y el resumen (`ResumenSesion`).
El wizard de crear rutina tambien, con el marco de `PasoWizard`: el nombre sobre
una linea con sugerencias y la cantidad de dias en siete numeros.
Y las dos pantallas de estado de cuenta (`account-recovery` y `profile-error`),
que comparten el marco de `src/components/EstadoCuenta.tsx`.

Las piezas compartidas se migran en su mismo archivo, no en copias: si una
pantalla todavia vieja las usa, queda
mezclada hasta que le toque. Asi pasaron a Lume en `src/design/components/`
`Stepper`, `DurationField`, `DistanceField`, `NumberField`, `Tag`,
`ExerciseTypeTag` y `ExerciseSummary`; y `Campo` suma `iconoAcento` y `lg`. El
indicador de carga (`Cargando`) ya reemplaza a `ActivityIndicator` en toda la
app, tambien en las pantallas que siguen en el sistema anterior.

## Piezas

| Pieza | Para que |
|---|---|
| `tokens.ts` | Colores de los dos temas, sombras y halos (`boxShadow`), espaciado, radios, movimiento. |
| `tipografia.ts` | `useLumeFonts()` (se carga en el layout raiz) y los roles `lumeTexto`. |
| `useLume()` | Tema activo + Reducir transparencia + Reducir movimiento. |
| `Fondo` | Las luces. `posicion` por pantalla (`cumbre`, `centro`, `flanco`, `base`, `velada`); `animado` solo en el onboarding. |
| `Vidrio` | Panel translucido: `normal`, `fuerte`, `denso` (con blur, solo en el cromo). |
| `LumeText`, `LumeButton`, `Campo`, `Casilla`, `Segmentado`, `Opciones` | Componentes base. |
| `Cargando` | El anillo de carga: pista en data-track, un cuarto en tinta, una vuelta cada 1,2 s (3,6 s con Reducir movimiento). `sm` 16 en botones, `md` 20 en pantallas y listas, `lg` 28 para arrastrar y actualizar. Reemplaza a `ActivityIndicator` en toda la app. |
| `LumeIconButton`, `LumeBadge`, `LumeAvatar` | Boton de icono (primary, surface, ghost), insignia (neutral, signal, intensity, danger) y avatar (foto o beam con la cara en bg-app sobre el accent). |
| `LumeMetricPill` | Chip de metrica sobre vidrio: icono, rotulo y valor (`stack` o `inline`; neutral, signal, intensity). |
| `LumeSwitch` | Interruptor: pista en accent encendido, perilla en text-on-accent. |
| `LumeTabBar` | La barra de pestañas: vidrio denso, la activa con el icono en signal y una marca de 2 px arriba; el boton central cuadrado en accent. Va debajo de la pantalla, sin blur. |
| `Semana` | La tira de lunes a domingo: dato en tinta en la home, eleccion en accent con `editor`. |
| `PasoWizard`, `Escala`, `BotonTexto` | El marco comun de los wizards. |
| `Rueda` + `EscenarioRueda` | La edad del setup. |
| `Regla` | Regla recta, mas ancha que la pantalla: la altura del setup. |
| `ReglaCurva` | Arco de vidrio mas ancho que la pantalla que gira bajo una aguja fija: el peso del setup. Se arrastra con un PanGesture. |
| `IconoApp` | El icono de la app (FREN / CIA con el punto). Ya no va en el acceso: login y registro llevan solo el nombre `FRENCIA.` (`Marca` en `src/components/Acceso.tsx`), blanco en oscuro y negro en claro. |

## Que fondo lleva cada pantalla

La tabla completa esta en `entrega/implementacion.md` del design system. Regla
de lectura: si el texto chico cae sobre la luz, se cambia la posicion del
fondo, nunca el texto.

## Diferencias con la web

- El brillo de canto del vidrio (`inset 0 1px 0`) es el borde de arriba en
  `glassHighlight`: RN no tiene sombra interior.
- El vidrio normal y el fuerte no llevan sombra lejana (`shadow-glass` queda
  transparente): sin el `backdrop-filter` de la web, la sombra de una tarjeta
  se veia a traves del vidrio de la de abajo como una franja oscura (issue
  #29). Solo el vidrio denso, que flota, conserva su sombra.
- Las dos reglas (altura y peso) son mas anchas que la pantalla y el borde del
  telefono las corta, sin fundido en los extremos.
