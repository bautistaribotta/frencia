/* Frencia · Ruta raiz.
   Pantalla puente: el gate de auth del layout decide a donde ir
   (login, setup o home). Mientras tanto mostramos un spinner sobre el
   fondo de la app para no parpadear. */

import { StyleSheet, View } from 'react-native';

import { useColors } from '@/design';
import { Cargando } from '@/design/lume';

export default function IndexScreen() {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.bgApp }]}>
      <Cargando />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
