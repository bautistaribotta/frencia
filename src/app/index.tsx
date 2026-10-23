/* Frencia · Ruta raiz.
   Pantalla puente: el gate de auth del layout decide a donde ir
   (login, setup o home). Mientras tanto mostramos un spinner sobre el
   fondo de la app para no parpadear. */

import { StyleSheet, View } from 'react-native';

import { useThemedStyles, type Palette } from '@/design';
import { Cargando } from '@/design/lume';

export default function IndexScreen() {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      <Cargando />
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgApp },
  });
