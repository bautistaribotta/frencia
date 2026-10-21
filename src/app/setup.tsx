/* Frencia · Setup del perfil — primer ingreso (Lume).
   Un dato por pantalla con el marco comun de los wizards: contador 01 / 04 y
   escala arriba, la pregunta siempre a la misma altura, Saltar arriba a la
   derecha (lejos de Continuar) y la accion ancha abajo.
     1. Sexo: tres filas con radio.            Fondo cumbre.
     2. Edad: rueda unica en años.             Fondo centro.
     3. Altura: lectura grande y regla.        Fondo centro.
     4. Peso: lectura grande y regla curva.    Fondo centro.
   Es onboarding: las luces derivan y, entre pasos, se desplazan a la
   posicion del paso siguiente.

   Al terminar guarda en profiles solo lo que se haya completado. Altura y
   peso se guardan siempre en metrico; la unidad elegida queda como
   preferencia de toda la app. Mientras ONBOARDING_SIEMPRE este activo no se
   marca onboarding_completed (ver src/lib/onboarding.ts). */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';
import type { TablesUpdate } from '@/lib/database.types';
import { guardarSetup } from '@/lib/perfil';
import { edadAFechaNacimiento } from '@/lib/edad';
import { cmAPiesPulgadas, piesPulgadasACm } from '@/lib/altura';
import { kgALb, lbAKg } from '@/lib/peso';
import { ONBOARDING_SIEMPRE } from '@/lib/onboarding';
import { useProfile } from '@/contexts/profile';

import {
  BotonTexto,
  EscenarioRueda,
  Fondo,
  LumeButton,
  LumeText,
  Opciones,
  PasoWizard,
  Regla,
  ReglaCurva,
  Rueda,
  Segmentado,
  lumeSpace,
  useLume,
  type PosicionFondo,
} from '@/design/lume';

const SEXO_OPCIONES = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

type Dato = 'sexo' | 'edad' | 'altura' | 'peso';
type Unidad = 'metric' | 'imperial';

interface Paso {
  dato: Dato;
  rotulo: string;
  pregunta: string;
  ayuda: string;
  fondo: PosicionFondo;
}

const PASOS: Paso[] = [
  { dato: 'sexo', rotulo: 'Tu perfil · Sexo', pregunta: '¿Con qué sexo te identificás?', ayuda: 'Afina los cálculos de progreso.', fondo: 'cumbre' },
  { dato: 'edad', rotulo: 'Tu perfil · Edad', pregunta: '¿Cuántos años tenés?', ayuda: 'Lo usamos para ajustar tus referencias.', fondo: 'centro' },
  { dato: 'altura', rotulo: 'Tu perfil · Altura', pregunta: '¿Cuál es tu altura?', ayuda: 'Deslizá la regla. Se guarda siempre en centímetros.', fondo: 'centro' },
  { dato: 'peso', rotulo: 'Tu perfil · Peso', pregunta: '¿Cuál es tu peso?', ayuda: 'Deslizá la regla. Lo podés cambiar desde tu perfil.', fondo: 'centro' },
];

// Rangos de los controles.
const EDADES = Array.from({ length: 99 - 13 + 1 }, (_, i) => 13 + i);
const ALTURA_CM = { min: 120, max: 220 };
// Altura imperial en pulgadas totales: de 4' 0" a 7' 11".
const ALTURA_IN = { min: 48, max: 95 };
const PESO_KG = { min: 30, max: 200 };
const PESO_LB = { min: 66, max: 440 };

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

// Valores con los que arrancan los controles si el perfil no tiene dato.
const INICIAL = { edad: 25, altura: 170, peso: 70 };

export default function SetupWizardScreen() {
  const router = useRouter();
  const { refresh, profile } = useProfile();
  const [indice, setIndice] = useState(0);

  // Lo elegido en cada paso. Altura en cm y peso en kg, siempre: la unidad
  // solo cambia como se muestra. null = el usuario salto el dato.
  // Si el usuario ya tenia datos cargados (volvio a entrar al setup), arranca
  // con ellos para no pisar lo guardado con los valores iniciales. El gate
  // solo manda al setup con el perfil ya leido.
  const [sexo, setSexo] = useState<string | null>(profile?.sexo ?? null);
  const [edad, setEdad] = useState<number | null>(profile?.edad != null ? clamp(profile.edad, 13, 99) : INICIAL.edad);
  const [altura, setAltura] = useState<number | null>(profile?.altura ?? INICIAL.altura);
  const [peso, setPeso] = useState<number | null>(profile?.peso ?? INICIAL.peso);
  const [unidadAltura, setUnidadAltura] = useState<Unidad>(profile?.unidadAltura === 'ft' ? 'imperial' : 'metric');
  const [unidadPeso, setUnidadPeso] = useState<Unidad>(profile?.unidadPeso === 'lb' ? 'imperial' : 'metric');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const paso = PASOS[indice];
  const ultimo = indice === PASOS.length - 1;
  const valorDelPaso = { sexo, edad, altura, peso }[paso.dato];
  const completo = valorDelPaso != null && valorDelPaso !== '';

  // Arma el payload con lo completado. Recibe los valores de forma explicita
  // porque saltar el ultimo dato lo limpia justo antes de cerrar y el estado
  // todavia no esta actualizado en ese tick.
  async function finalizar(valores = { sexo, edad, altura, peso }) {
    if (guardando) return;
    setGuardando(true);
    setError('');

    const payload: TablesUpdate<'profiles'> = {
      // Preferencias de unidad: se guardan siempre, aunque se salte el dato.
      unidad_altura: unidadAltura === 'imperial' ? 'ft' : 'cm',
      unidad_peso: unidadPeso === 'imperial' ? 'lb' : 'kg',
    };
    // En modo prueba el setup no se da por terminado: vuelve en cada ingreso.
    if (!ONBOARDING_SIEMPRE) payload.onboarding_completed = true;
    if (valores.sexo) payload.sexo = valores.sexo;
    if (valores.edad != null) {
      const fecha = edadAFechaNacimiento(valores.edad);
      if (fecha) payload.fecha_nacimiento = fecha;
    }
    if (valores.altura != null) payload.altura = valores.altura;
    if (valores.peso != null) payload.peso = valores.peso;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setGuardando(false);
      setError('No pudimos identificar tu sesión. Volvé a ingresar.');
      return;
    }

    const ok = await guardarSetup(user.id, payload);

    setGuardando(false);

    if (!ok) {
      setError('No pudimos guardar tus datos. Probá de nuevo.');
      return;
    }

    await refresh();
    router.replace('/home');
  }

  function siguiente() {
    if (ultimo) {
      finalizar();
      return;
    }
    setError('');
    setIndice((i) => i + 1);
  }

  function anterior() {
    if (indice === 0) return;
    setError('');
    setIndice((i) => i - 1);
  }

  // Saltar limpia el dato del paso y avanza, o termina si es el ultimo.
  function saltar() {
    setError('');
    const limpio = { sexo, edad, altura, peso, [paso.dato]: null };
    if (paso.dato === 'sexo') setSexo(null);
    if (paso.dato === 'edad') setEdad(null);
    if (paso.dato === 'altura') setAltura(null);
    if (paso.dato === 'peso') setPeso(null);
    if (ultimo) {
      finalizar(limpio);
      return;
    }
    setIndice((i) => i + 1);
  }

  return (
    <View style={styles.pantalla}>
      <Fondo posicion={paso.fondo} animado />
      <PasoWizard
        actual={indice}
        total={PASOS.length}
        volver="Atrás"
        volverOff={indice === 0}
        onVolver={anterior}
        derecha={<BotonTexto onPress={saltar}>Saltar</BotonTexto>}
        rotulo={paso.rotulo}
        pregunta={paso.pregunta}
        ayuda={paso.ayuda}
        pie={
          <>
            {error ? <ErrorPie texto={error} /> : null}
            <LumeButton
              variant="primary"
              size="lg"
              fullWidth
              icon={ultimo ? 'check' : undefined}
              iconRight={ultimo ? undefined : 'arrow-right'}
              disabled={!completo}
              loading={ultimo && guardando}
              onPress={siguiente}
            >
              {ultimo ? 'Finalizar' : 'Siguiente'}
            </LumeButton>
          </>
        }
      >
        {paso.dato === 'sexo' ? (
          <Opciones opciones={SEXO_OPCIONES} value={sexo ?? ''} onChange={setSexo} />
        ) : null}

        {paso.dato === 'edad' ? (
          <EscenarioRueda unidad="años">
            <Rueda
              valores={EDADES}
              indice={EDADES.indexOf(edad ?? INICIAL.edad)}
              onIndice={(i) => setEdad(EDADES[i])}
            />
          </EscenarioRueda>
        ) : null}

        {paso.dato === 'altura' ? (
          <SelectorAltura
            cm={altura ?? INICIAL.altura}
            onCm={setAltura}
            unidad={unidadAltura}
            onUnidad={setUnidadAltura}
          />
        ) : null}

        {paso.dato === 'peso' ? (
          <SelectorPeso kg={peso ?? INICIAL.peso} onKg={setPeso} unidad={unidadPeso} onUnidad={setUnidadPeso} />
        ) : null}
      </PasoWizard>
    </View>
  );
}

function ErrorPie({ texto }: { texto: string }) {
  const { t } = useLume();
  return (
    <LumeText rol="bodySm" color={t.dangerText} style={styles.error} accessibilityLiveRegion="polite">
      {texto}
    </LumeText>
  );
}

/* ---- Altura: cm o pies y pulgadas. Lo que se guarda es siempre cm. ---- */
function SelectorAltura({
  cm,
  onCm,
  unidad,
  onUnidad,
}: {
  cm: number;
  onCm: (cm: number) => void;
  unidad: Unidad;
  onUnidad: (u: Unidad) => void;
}) {
  const { pies, pulgadas } = cmAPiesPulgadas(cm);
  return (
    <View style={styles.medida}>
      <Segmentado
        accent
        style={styles.toggle}
        opciones={[
          { value: 'metric', label: 'cm' },
          { value: 'imperial', label: 'ft' },
        ]}
        value={unidad}
        onChange={(u) => onUnidad(u as Unidad)}
      />
      {unidad === 'metric' ? (
        <Regla
          key="cm"
          min={ALTURA_CM.min}
          max={ALTURA_CM.max}
          valor={clamp(Math.round(cm), ALTURA_CM.min, ALTURA_CM.max)}
          onChange={onCm}
          unidad="cm"
          mayor={10}
          media={5}
          accessibilityLabel="Altura en centímetros"
        />
      ) : (
        <Regla
          key="in"
          min={ALTURA_IN.min}
          max={ALTURA_IN.max}
          valor={clamp(pies * 12 + pulgadas, ALTURA_IN.min, ALTURA_IN.max)}
          onChange={(totalIn) => onCm(piesPulgadasACm(Math.floor(totalIn / 12), totalIn % 12))}
          mayor={12}
          media={6}
          fmt={(v) => `${v / 12}′`}
          lectura={(totalIn) => <LecturaPies pies={Math.floor(totalIn / 12)} pulgadas={totalIn % 12} />}
          accessibilityLabel="Altura en pies y pulgadas"
        />
      )}
    </View>
  );
}

function LecturaPies({ pies, pulgadas }: { pies: number; pulgadas: number }) {
  return (
    <>
      <LumeText rol="hero" style={styles.lecturaNum}>
        {pies}
      </LumeText>
      <LumeText rol="subtitle" style={styles.lecturaUnidad}>
        ft
      </LumeText>
      <LumeText rol="hero" style={styles.lecturaNum}>
        {pulgadas}
      </LumeText>
      <LumeText rol="subtitle" style={styles.lecturaUnidad}>
        in
      </LumeText>
    </>
  );
}

/* ---- Peso: regla curva, kg de a 0,5 o lb de a 1. Lo que se guarda es
   siempre kg. ---- */
function SelectorPeso({
  kg,
  onKg,
  unidad,
  onUnidad,
}: {
  kg: number;
  onKg: (kg: number) => void;
  unidad: Unidad;
  onUnidad: (u: Unidad) => void;
}) {
  return (
    <View style={styles.medida}>
      <Segmentado
        accent
        style={styles.toggle}
        opciones={[
          { value: 'metric', label: 'kg' },
          { value: 'imperial', label: 'lb' },
        ]}
        value={unidad}
        onChange={(u) => onUnidad(u as Unidad)}
      />
      {unidad === 'metric' ? (
        <ReglaCurva
          key="kg"
          min={PESO_KG.min}
          max={PESO_KG.max}
          paso={0.5}
          valor={clamp(Math.round(kg * 2) / 2, PESO_KG.min, PESO_KG.max)}
          onChange={onKg}
          unidad="kg"
          decimales={1}
          mayor={10}
          media={2}
          accessibilityLabel="Peso en kilos"
        />
      ) : (
        <ReglaCurva
          key="lb"
          min={PESO_LB.min}
          max={PESO_LB.max}
          paso={1}
          valor={clamp(Math.round(kgALb(kg)), PESO_LB.min, PESO_LB.max)}
          onChange={(lb) => onKg(Math.round(lbAKg(lb) * 10) / 10)}
          unidad="lb"
          decimales={0}
          mayor={10}
          media={5}
          accessibilityLabel="Peso en libras"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Las reglas son mas anchas que la pantalla: el borde las corta.
  pantalla: { flex: 1, overflow: 'hidden' },
  error: { textAlign: 'center' },
  medida: { alignItems: 'center', gap: lumeSpace[7] },
  toggle: { minWidth: 160 },
  lecturaNum: { fontSize: 88, lineHeight: 92, letterSpacing: -4 },
  lecturaUnidad: { fontSize: 18, lineHeight: 22 },
});
