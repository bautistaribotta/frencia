/* Frencia · MaskedView con tipos que entiende React Native 0.88.
   Los tipos de @react-native-masked-view/masked-view (0.3.2, la ultima)
   extienden NativeMethods, que la API estricta de TypeScript de RN 0.87 en
   adelante ya no exporta, y TypeScript deja de aceptarlo como componente. El
   componente nativo es el mismo: aca solo se le dan props tipadas. Cuando el
   paquete publique tipos nuevos, se vuelve a importar directo. */

import MaskedViewNativo from '@react-native-masked-view/masked-view';
import type { ComponentType, ReactElement } from 'react';
import type { ViewProps } from 'react-native';

export interface MaskedViewProps extends ViewProps {
  maskElement: ReactElement;
  androidRenderingMode?: 'software' | 'hardware';
}

export const MaskedView = MaskedViewNativo as unknown as ComponentType<MaskedViewProps>;
