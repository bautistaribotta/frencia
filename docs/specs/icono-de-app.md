# Icono de la app

Estado: implementado
Fecha: 2026-09-22

## 1. Decision

El icono es el wordmark "FREN / CIA" con un punto. Hay dos versiones y
se muestra una u otra segun el tema:

| Tema   | Archivo                            | Fondo     | Letras    |
| ------ | ---------------------------------- | --------- | --------- |
| Claro  | `assets/images/app-icon-light.png` | `#F9F9F9` | `#000000` |
| Oscuro | `assets/images/app-icon-dark.png`  | `#161317` | `#E8E4E9` |

El punto va del mismo color que las letras en las dos versiones (sin verde).
**Por defecto se usa el claro.** El icono
verde con la "F" negra queda descartado y sus assets se borraron.

## 2. Donde se aplica

- **iOS** (`ios.icon` en `app.json`): `light` y `dark`. iOS 18+ elige solo
  segun la apariencia del sistema. En versiones anteriores se ve el claro.
- **Android** (`android.adaptiveIcon`): Android no cambia el icono del
  launcher segun el tema, asi que se usa el claro (`foregroundImage` sobre
  `backgroundColor #F9F9F9`). El `monochromeImage` es la misma marca en
  blanco y la usa Android 13+ con "iconos tematicos" activados.
- **Icono general** (`icon`): el claro.
- **Web** (`favicon.png`): el claro reducido a 64px.
- **Splash** (plugin `expo-splash-screen`): marca sin fondo sobre `bgApp` de
  cada tema (claro `#E4E7E4`, oscuro `#161317`), con variante `dark`.
  `AnimatedSplashOverlay` usa el mismo `bgApp` para no dar un salto de color.

## 3. Limites

El icono sigue al **tema del sistema**, no a la preferencia de tema de la app
(`profiles.tema`). Cambiarlo segun la preferencia interna requiere iconos
alternativos (`setAlternateIconName` en iOS), y iOS muestra un alerta cada vez
que se cambia. Por eso se descarto.

## 4. Assets derivados

`android-icon-foreground.png`, `android-icon-monochrome.png`,
`splash-icon-light.png`, `splash-icon-dark.png` y `favicon.png` salen de los
dos PNG de 1024px. En el adaptive icon la marca se escala al 62% para que
entre en el circulo seguro (66dp de 108dp). Si cambia el diseno, hay que
regenerarlos.
