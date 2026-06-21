/* Frencia · Setup inicial — primer ingreso.
   Pide los datos del perfil de a uno por pantalla. Permite saltar
   cada dato, avanzar al siguiente y volver al anterior. Al terminar
   guarda en profiles solo lo que se haya completado. */

import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { useProfile } from '@/contexts/profile';
import { MeasurePicker } from '@/components/MeasurePicker';

import {
  Button,
  FrenciaText,
  Icon,
  SegmentedControl,
  useColors,
  useThemedStyles,
  radius,
  space,
  spacing,
  type Palette,
} from '@/design';

const SEXO_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

type StepKey = 'edad' | 'sexo' | 'altura' | 'peso';
type StepType = 'number' | 'segment';

interface StepDef {
  key: StepKey;
  type: StepType;
  title: string;
  hint: string;
  icon: string;
  placeholder?: string;
  maxLength?: number;
}

const STEPS: StepDef[] = [
  { key: 'sexo', type: 'segment', icon: 'user', title: '¿Con qué sexo te identificás?', hint: 'Afina los cálculos de progreso.' },
  { key: 'edad', type: 'number', icon: 'calendar', title: '¿Cuántos años tenés?', hint: 'Lo usamos para ajustar tus referencias.', placeholder: 'Edad', maxLength: 3 },
  { key: 'altura', type: 'number', icon: 'trending-up', title: '¿Cuál es tu altura?', hint: 'Deslizá la rueda para elegirla.' },
  { key: 'peso', type: 'number', icon: 'target', title: '¿Cuál es tu peso?', hint: 'Deslizá la rueda para elegirlo.' },
];

export default function SetupWizardScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { refresh, profile } = useProfile();
  const [index, setIndex] = useState(0);
  // Altura y peso arrancan en un valor por defecto: la rueda siempre muestra
  // algo seleccionado. Si el usuario salta el dato, se limpia (ver skip).
  const [values, setValues] = useState<Record<StepKey, string>>({
    edad: '25',
    sexo: '',
    altura: '170',
    peso: '70',
  });

  // Si el usuario ya tenia datos cargados (volvio a entrar al setup), los
  // precargamos para no mostrar los defaults ni pisar lo guardado con ellos.
  // Mantenemos el default donde el perfil no tiene dato.
  useEffect(() => {
    if (!profile) return;
    setValues((prev) => ({
      edad: profile.edad != null ? String(profile.edad) : prev.edad,
      sexo: profile.sexo ?? prev.sexo,
      altura: profile.altura != null ? String(profile.altura) : prev.altura,
      peso: profile.peso != null ? String(profile.peso) : prev.peso,
    }));
  }, [profile]);
  // Sistema de medicion elegido en los pasos de altura y peso. Se guarda como
  // preferencia (el valor del dato se persiste siempre en metrico).
  const [unitHeight, setUnitHeight] = useState<'metric' | 'imperial'>('metric');
  const [unitWeight, setUnitWeight] = useState<'metric' | 'imperial'>('metric');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const current = values[step.key];

  // Tras guardar (o saltar) volvemos a la app. Releemos el perfil para que
  // el saludo y los datos queden frescos.
  async function goHome() {
    await refresh();
    router.replace('/home');
  }

  // Valida el dato del paso actual segun las restricciones de profiles.
  function isValid(key: StepKey, raw: string): boolean {
    const v = raw.trim();
    if (v === '') return false;
    if (key === 'sexo') return SEXO_OPTIONS.some((o) => o.value === v);
    if (key === 'edad') {
      const n = Number(v);
      return Number.isInteger(n) && n >= 0 && n <= 150;
    }
    const n = Number(v);
    return Number.isFinite(n) && n > 0;
  }

  const currentValid = isValid(step.key, current);

  function setCurrent(raw: string) {
    setValues((prev) => ({ ...prev, [step.key]: raw }));
  }

  // Arma el payload con solo los datos validos cargados. Recibe los valores de
  // forma explicita porque skip() limpia el ultimo dato justo antes de cerrar y
  // el estado todavia no esta actualizado en ese tick.
  async function finish(vals: Record<StepKey, string> = values) {
    if (saving) return;
    setSaving(true);
    setErrorMsg('');

    // Marcamos el setup como completado aunque no haya cargado ningun dato:
    // asi el wizard no vuelve a aparecer en los proximos ingresos.
    const payload: Record<string, number | string | boolean> = {
      onboarding_completed: true,
      // Preferencias de unidad: se guardan siempre, aunque se salte el dato.
      unidad_altura: unitHeight === 'imperial' ? 'ft' : 'cm',
      unidad_peso: unitWeight === 'imperial' ? 'lb' : 'kg',
    };
    if (isValid('edad', vals.edad)) payload.edad = Number(vals.edad);
    if (isValid('sexo', vals.sexo)) payload.sexo = vals.sexo;
    if (isValid('altura', vals.altura)) payload.altura = Number(vals.altura);
    if (isValid('peso', vals.peso)) payload.peso = Number(vals.peso);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      setErrorMsg('No pudimos identificar tu sesión. Volvé a ingresar.');
      return;
    }

    // Upsert por id en vez de update: garantiza que la fila exista y, con
    // .select(), confirma que se escribio. Un update sin select que matchea 0
    // filas devuelve exito silencioso y dejaba el onboarding sin marcar (el
    // wizard reaparecia en cada ingreso y no se guardaba ningun dato).
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...payload }, { onConflict: 'id' })
      .select('id')
      .maybeSingle();

    setSaving(false);

    if (error || !data) {
      setErrorMsg('No pudimos guardar tus datos. Proba de nuevo.');
      return;
    }

    goHome();
  }

  function goNext() {
    if (isLast) {
      finish();
      return;
    }
    setErrorMsg('');
    setIndex((i) => i + 1);
  }

  function goBack() {
    if (index === 0) return;
    setErrorMsg('');
    setIndex((i) => i - 1);
  }

  // Saltar limpia el dato del paso (incluye los que arrancan con default) y
  // avanza, o termina si es el ultimo.
  function skip() {
    const cleared = { ...values, [step.key]: '' };
    setValues(cleared);
    setErrorMsg('');
    if (isLast) {
      finish(cleared);
      return;
    }
    setIndex((i) => i + 1);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Progreso: paso actual + puntos */}
        <View style={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            icon="chevron-left"
            disabled={index === 0}
            onPress={goBack}
          >
            Atrás
          </Button>
          <View style={styles.dots}>
            {STEPS.map((s, i) => (
              <View
                key={s.key}
                style={[styles.dot, i === index ? styles.dotActive : styles.dotIdle]}
              />
            ))}
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Cuerpo: un unico dato ocupando la pantalla */}
        <View style={styles.body}>
          <View style={styles.iconWrap}>
            <Icon name={step.icon} size={32} color={colors.accentText} />
          </View>

          <View style={styles.titleBlock}>
            <FrenciaText role="dataLabel" color={colors.textTertiary}>
              Paso {index + 1} de {STEPS.length}
            </FrenciaText>
            <FrenciaText role="display" style={styles.title}>
              {step.title}
            </FrenciaText>
            <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.hint}>
              {step.hint}
            </FrenciaText>
          </View>

          {step.type === 'segment' ? (
            <SegmentedControl
              fullWidth
              options={SEXO_OPTIONS}
              value={current}
              onChange={setCurrent}
            />
          ) : (
            <MeasurePicker
              kind={step.key === 'edad' ? 'age' : step.key === 'altura' ? 'height' : 'weight'}
              initial={Number(current) || 0}
              onChange={(n) => setCurrent(String(n))}
              initialUnit={step.key === 'altura' ? unitHeight : step.key === 'peso' ? unitWeight : 'metric'}
              onUnitChange={
                step.key === 'altura' ? setUnitHeight : step.key === 'peso' ? setUnitWeight : undefined
              }
            />
          )}

          {errorMsg ? (
            <FrenciaText role="bodySm" color={colors.dangerText}>
              {errorMsg}
            </FrenciaText>
          ) : null}
        </View>

        {/* Navegacion */}
        <View style={styles.nav}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            iconRight={isLast ? undefined : 'arrow-right'}
            disabled={!currentValid}
            loading={isLast && saving}
            onPress={goNext}
          >
            {isLast ? 'Finalizar' : 'Siguiente'}
          </Button>
          <Button variant="ghost" size="md" fullWidth onPress={skip}>
            {isLast ? 'Omitir y finalizar' : 'Saltar este dato'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgApp },
  flex: { flex: 1, paddingHorizontal: spacing.padScreen, paddingVertical: space[5] },

  // Header / progreso
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  dot: { height: 6, borderRadius: radius.pill },
  dotActive: { width: 22, backgroundColor: colors.accent },
  dotIdle: { width: 6, backgroundColor: colors.surfaceChip },
  headerSpacer: { width: 72 },

  // Cuerpo
  body: { flex: 1, justifyContent: 'center', gap: space[6] },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceOrangeSoft,
    borderWidth: 1,
    borderColor: colors.surfaceOrangeLine,
  },
  titleBlock: { gap: space[3] },
  title: { fontSize: 40, lineHeight: 52 },
  hint: { maxWidth: 320 },

  // Navegacion
  nav: { gap: space[2] },
});
