/* Frencia · Editar perfil.
   Precarga los datos guardados y permite actualizarlos. Ningun campo es
   obligatorio: los vacios se persisten como null. Guardar se habilita solo
   cuando algo cambio. Salir con cambios sin guardar (Atras, Cancelar o el
   gesto) pide confirmar antes de descartarlos. */

import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { guardarDatosPersonales, leerDatosPersonales } from '@/lib/perfil';
import { edadAFechaNacimiento, fechaNacimientoAEdad } from '@/lib/edad';
import { mostrarAltura } from '@/lib/altura';
import { mostrarPeso } from '@/lib/peso';
import { useProfile } from '@/contexts/profile';
import { useSession } from '@/contexts/session';
import { useToast } from '@/contexts/toast';
import { useDescartarAlSalir } from '@/lib/descartar-al-salir';
import { Hoja } from '@/components/Hoja';
import { MeasurePicker } from '@/components/MeasurePicker';

import { Icon, type IconName } from '@/design';
import {
  Campo,
  Cargando,
  Fondo,
  LumeButton,
  LumeText,
  Segmentado,
  lumeLayout,
  lumeRadius,
  lumeSpace,
  useLume,
  useLumeStyles,
  type LumePalette,
  type LumeSombras,
} from '@/design/lume';

// Opciones de sexo: el value coincide con los permitidos en la tabla profiles.
const SEXO_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

// Firma de lo que se persiste, para saber si hay cambios sin guardar.
function firma(campos: string[]): string {
  return JSON.stringify(campos.map((c) => c.trim()));
}

export default function EditProfileScreen() {
  const { t } = useLume();
  const { profile, refresh, savePreferencias } = useProfile();
  const { user } = useSession();
  const userId = user?.id ?? null;
  const { showToast } = useToast();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // Mientras traemos el perfil mostramos un spinner para tapar la demora inicial.
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  // Firma de los datos tal como se cargaron. null hasta terminar la carga.
  const [original, setOriginal] = useState<string | null>(null);
  // Rueda de altura/peso: misma experiencia que el setup inicial. `draft`
  // guarda el valor canonico (cm o kg) mientras la rueda esta abierta. La
  // unidad sale del contexto: la rueda abre en la preferida y cambiarla ahi
  // es lo mismo que tocar el switch del perfil, vale para toda la app.
  const [picker, setPicker] = useState<null | 'age' | 'height' | 'weight'>(null);
  const [draft, setDraft] = useState(0);
  const unidadAltura = profile?.unidadAltura ?? 'cm';
  const unidadPeso = profile?.unidadPeso ?? 'kg';

  function openPicker(kind: 'age' | 'height' | 'weight') {
    const source = kind === 'age' ? edad : kind === 'height' ? altura : peso;
    setDraft(Number(source) || 0);
    setPicker(kind);
  }

  function confirmPicker() {
    if (picker === 'age') setEdad(String(draft));
    else if (picker === 'height') setAltura(String(draft));
    else if (picker === 'weight') setPeso(String(draft));
    setPicker(null);
  }

  // El toggle de la rueda cambia la preferencia global. Se persiste al toque,
  // no con Guardar: es un ajuste, no un dato del perfil.
  async function cambiarUnidad(unit: 'metric' | 'imperial') {
    const ok = await savePreferencias(
      picker === 'height'
        ? { unidadAltura: unit === 'imperial' ? 'ft' : 'cm' }
        : { unidadPeso: unit === 'imperial' ? 'lb' : 'kg' },
    );
    if (!ok) showToast({ message: 'No pudimos guardar la unidad. Probá de nuevo.', type: 'error' });
  }

  // Traemos los datos ya guardados para precompletar los inputs al editar.
  useEffect(() => {
    let activo = true;

    async function cargarPerfil() {
      if (!userId) {
        if (activo) setCargandoPerfil(false);
        return;
      }

      const lectura = await leerDatosPersonales(userId);
      if (!activo) return;
      const data = lectura.estado === 'ok' ? lectura.datos : null;

      const edadCalc = data ? fechaNacimientoAEdad(data.fecha_nacimiento) : null;
      const cargados = [
        data?.name ?? '',
        data?.surname ?? '',
        edadCalc != null ? String(edadCalc) : '',
        data?.sexo ?? '',
        data?.altura != null ? String(data.altura) : '',
        data?.peso != null ? String(data.peso) : '',
      ];
      const [n, a, e, sx, al, p] = cargados;
      setNombre(n);
      setApellido(a);
      setEdad(e);
      setSexo(sx);
      setAltura(al);
      setPeso(p);
      setOriginal(firma(cargados));
      setCargandoPerfil(false);
    }

    cargarPerfil();
    return () => {
      activo = false;
    };
  }, [userId]);

  // Ningun campo es obligatorio: validamos solo el formato de lo que se completa.
  const edadNum = Number(edad);
  const alturaNum = Number(altura);
  const pesoNum = Number(peso);

  const edadValida =
    edad.trim() === '' || (Number.isInteger(edadNum) && edadNum >= 0 && edadNum <= 150);
  const alturaValida = altura.trim() === '' || (Number.isFinite(alturaNum) && alturaNum > 0);
  const pesoValida = peso.trim() === '' || (Number.isFinite(pesoNum) && pesoNum > 0);

  const sucio =
    original !== null && firma([nombre, apellido, edad, sexo, altura, peso]) !== original;
  // Guardar se habilita solo si algo cambio y lo cargado tiene formato valido.
  const canSubmit = sucio && edadValida && alturaValida && pesoValida;

  const salir = useDescartarAlSalir({
    sucio,
    ocupado: loading,
    mensaje: 'Lo que editaste en tu perfil se va a perder.',
    respaldo: '/profile',
  });

  async function handleSave() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setErrorMsg('');


    if (!user) {
      setLoading(false);
      setErrorMsg('No pudimos identificar tu sesión. Volvé a ingresar.');
      return;
    }

    const ok = await guardarDatosPersonales(user.id, {
      name: nombre.trim() === '' ? null : nombre.trim(),
      surname: apellido.trim() === '' ? null : apellido.trim(),
      fecha_nacimiento: edad.trim() === '' ? null : edadAFechaNacimiento(edadNum),
      sexo: SEXO_OPTIONS.some((o) => o.value === sexo) ? sexo : null,
      altura: altura.trim() === '' ? null : alturaNum,
      peso: peso.trim() === '' ? null : pesoNum,
    });

    setLoading(false);

    if (!ok) {
      setErrorMsg('No pudimos guardar tu perfil. Probá de nuevo.');
      return;
    }

    // Releemos el perfil compartido, avisamos con un toast y volvemos al perfil.
    await refresh();
    showToast({ message: 'Perfil actualizado', type: 'success' });
    salir({ sinPreguntar: true });
  }

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="cumbre" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.volver}>
          <LumeButton variant="ghost" size="sm" icon="chevron-left" onPress={() => salir()} disabled={loading}>
            Atrás
          </LumeButton>
        </View>
        {cargandoPerfil ? (
          <View style={styles.carga}>
            <Cargando />
          </View>
        ) : (
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.form}>
                <LumeText rol="title" style={styles.titulo}>
                  Editar perfil
                </LumeText>
                <LumeText rol="bodySm" color={t.textSecondary}>
                  Cambiá los datos de los campos para actualizarlos.
                </LumeText>

                <View style={styles.campos}>
                  <Grupo etiqueta="Nombre">
                    <Campo
                      icono="user"
                      value={nombre}
                      onChangeText={setNombre}
                      placeholder="Tu nombre"
                      autoCapitalize="words"
                      autoComplete="off"
                      maxLength={40}
                      accessibilityLabel="Nombre"
                    />
                  </Grupo>
                  <Grupo etiqueta="Apellido">
                    <Campo
                      icono="user"
                      value={apellido}
                      onChangeText={setApellido}
                      placeholder="Tu apellido"
                      autoCapitalize="words"
                      autoComplete="off"
                      maxLength={40}
                      accessibilityLabel="Apellido"
                    />
                  </Grupo>

                  <Grupo etiqueta="Sexo">
                    <Segmentado opciones={SEXO_OPTIONS} value={sexo} onChange={setSexo} />
                  </Grupo>

                  <CampoSelector
                    etiqueta="Edad"
                    icono="calendar"
                    valor={edad ? `${edad} años` : ''}
                    placeholder="Elegí tu edad"
                    onPress={() => openPicker('age')}
                  />
                  {/* Guardado en cm y kg; se muestra en la unidad preferida. */}
                  <CampoSelector
                    etiqueta="Altura"
                    icono="trending-up"
                    valor={altura ? mostrarAltura(alturaNum, unidadAltura) : ''}
                    placeholder="Elegí tu altura"
                    onPress={() => openPicker('height')}
                  />
                  <CampoSelector
                    etiqueta="Peso"
                    icono="target"
                    valor={peso ? `${mostrarPeso(pesoNum, unidadPeso)} ${unidadPeso}` : ''}
                    placeholder="Elegí tu peso"
                    onPress={() => openPicker('weight')}
                  />
                </View>

                {errorMsg ? (
                  <LumeText rol="bodySm" color={t.dangerText}>
                    {errorMsg}
                  </LumeText>
                ) : null}

                <LumeButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  iconRight="arrow-right"
                  disabled={!canSubmit}
                  loading={loading}
                  onPress={handleSave}
                >
                  Guardar
                </LumeButton>
                <LumeButton
                  variant="secondary"
                  size="lg"
                  fullWidth
                  icon="x"
                  disabled={loading}
                  onPress={() => salir()}
                  style={styles.cancelar}
                >
                  Cancelar
                </LumeButton>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>

      {/* Rueda de edad, altura o peso: la misma del setup inicial. */}
      <Hoja visible={picker !== null} onCerrar={() => setPicker(null)} rueda>
        <LumeText rol="title" style={styles.centrado}>
          {picker === 'age' ? 'Tu edad' : picker === 'height' ? 'Tu altura' : 'Tu peso'}
        </LumeText>
        {picker !== null ? (
          <MeasurePicker
            kind={picker}
            initial={draft}
            onChange={setDraft}
            initialUnit={
              picker === 'height'
                ? unidadAltura === 'ft' ? 'imperial' : 'metric'
                : picker === 'weight'
                  ? unidadPeso === 'lb' ? 'imperial' : 'metric'
                  : 'metric'
            }
            onUnitChange={picker === 'age' ? undefined : cambiarUnidad}
          />
        ) : null}
        <LumeButton variant="primary" size="lg" fullWidth onPress={confirmPicker}>
          Listo
        </LumeButton>
      </Hoja>
    </View>
  );
}

/* ── Rotulo y control, con la separacion del formulario ─── */
function Grupo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  const { t } = useLume();
  return (
    <View style={styles.grupo}>
      <LumeText rol="label" color={t.textTertiary}>
        {etiqueta}
      </LumeText>
      {children}
    </View>
  );
}

/* ── Campo de seleccion: abre la rueda en vez de teclado ─── */
interface CampoSelectorProps {
  icono: IconName;
  etiqueta: string;
  valor: string;
  placeholder: string;
  onPress: () => void;
}

function CampoSelector({ icono, etiqueta, valor, placeholder, onPress }: CampoSelectorProps) {
  const { t } = useLume();
  const tema = useLumeStyles(makeStyles);
  return (
    <Grupo etiqueta={etiqueta}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${etiqueta}: ${valor || placeholder}`}
        style={({ pressed }) => [styles.selector, tema.selector, pressed && tema.selectorPresionado]}
      >
        <Icon name={icono} size={20} color={t.textTertiary} strokeWidth={1.75} />
        <LumeText rol="bodySm" color={valor ? t.textPrimary : t.textTertiary} style={styles.selectorValor}>
          {valor || placeholder}
        </LumeText>
        <Icon name="chevron-right" size={20} color={t.textTertiary} strokeWidth={1.75} />
      </Pressable>
    </Grupo>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  carga: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // El boton ghost trae su propio padding: el margen lo corre 10 px a la
  // izquierda para que el chevron quede alineado con el borde del contenido.
  volver: {
    flexDirection: 'row',
    paddingHorizontal: lumeLayout.padScreen - 10,
    paddingTop: lumeSpace[8],
    paddingBottom: lumeSpace[4],
  },
  // Centrado cuando entra en la pantalla; si no, scrollea desde arriba.
  scroll: {
    flexGrow: 1,
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[5],
    paddingBottom: lumeSpace[8],
    justifyContent: 'center',
  },

  form: { gap: lumeSpace[5] },
  titulo: { marginBottom: -lumeSpace[3] },
  campos: { gap: lumeSpace[4], marginTop: lumeSpace[3] },
  grupo: { gap: lumeSpace[3] },
  // El form separa bloques con gap 5; Cancelar va pegado a Guardar.
  cancelar: { marginTop: -lumeSpace[3] },

  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    height: lumeLayout.controlHLg,
    paddingHorizontal: lumeLayout.padControl,
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
  },
  selectorValor: { flex: 1 },
  centrado: { textAlign: 'center' },
});

const makeStyles = (t: LumePalette, sombras: LumeSombras) =>
  StyleSheet.create({
    selector: {
      backgroundColor: t.surfaceCard,
      borderColor: t.glassLine,
      borderTopColor: t.glassHighlight,
      boxShadow: sombras.glass,
    },
    selectorPresionado: { backgroundColor: t.surfaceCardElevated },
  });
