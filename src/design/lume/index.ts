/* ============================================================
   Frencia · Lume (design system "Frencia 2.0")
   Superficie de importacion unica:
     import { Fondo, Vidrio, LumeButton, useLume } from '@/design/lume';
   Ver README.md en esta carpeta.
   ============================================================ */

export * from './tokens';
export * from './tipografia';
export { POSICIONES, type PosicionFondo, type IntensidadFondo } from './fondos';
export { useLume, useReducirTransparencia, type LumeContexto } from './useLume';

export { Fondo, type FondoProps } from './Fondo';
export { Vidrio, type VidrioProps, type NivelVidrio } from './Vidrio';
export { LumeText, type LumeTextProps } from './LumeText';
export { LumeButton, type LumeButtonProps, type VarianteBoton, type TamanioBoton } from './LumeButton';
export { Campo, type CampoProps } from './Campo';
export { Opciones, type Opcion, type OpcionesProps } from './Opciones';
export { Segmentado, type SegmentadoProps } from './Segmentado';
export { Casilla, type CasillaProps } from './Casilla';
export { Escala, type EscalaProps } from './Escala';
export { PasoWizard, BotonTexto, type PasoWizardProps, type BotonTextoProps } from './PasoWizard';
export { Rueda, EscenarioRueda, RUEDA_ITEM, type RuedaProps } from './Rueda';
export { Regla, type ReglaProps } from './Regla';
export { ReglaCurva, type ReglaCurvaProps } from './ReglaCurva';
export { IconoApp } from './IconoApp';
