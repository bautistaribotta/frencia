/* Frencia · Setup inicial — primer ingreso.
   Pide los datos del perfil de a uno por pantalla. Permite saltar
   cada dato, avanzar al siguiente y volver al anterior. Al terminar
   guarda en profiles solo lo que se haya completado. */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

import {
  Button,
  FrenciaText,
  Icon,
  SegmentedControl,
  colors,
  radius,
  sans,
  sizing,
  space,
  spacing,
} from '@/design';

interface SetupWizardScreenProps {
  userName?: string;
  onComplete?: () => void;
}

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
  { key: 'edad', type: 'number', icon: 'calendar', title: '¿Cuántos años tenés?', hint: 'Lo usamos para ajustar tus referencias.', placeholder: 'Edad', maxLength: 3 },
  { key: 'sexo', type: 'segment', icon: 'user', title: '¿Con qué sexo te identificás?', hint: 'Afina los cálculos de progreso.' },
  { key: 'altura', type: 'number', icon: 'trending-up', title: '¿Cuánto medís?', hint: 'En centímetros.', placeholder: 'Altura (cm)', maxLength: 3 },
  { key: 'peso', type: 'number', icon: 'target', title: '¿Cuánto pesás?', hint: 'En kilogramos. Lo vas a poder actualizar.', placeholder: 'Peso (kg)', maxLength: 6 },
];

export default function SetupWizardScreen({ userName, onComplete }: SetupWizardScreenProps) {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Record<StepKey, string>>({
    edad: '',
    sexo: '',
    altura: '',
    peso: '',
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const current = values[step.key];

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

  // Arma el payload con solo los datos validos cargados.
  async function finish() {
    if (saving) return;
    setSaving(true);
    setErrorMsg('');

    const payload: Record<string, number | string> = {};
    if (isValid('edad', values.edad)) payload.edad = Number(values.edad);
    if (isValid('sexo', values.sexo)) payload.sexo = values.sexo;
    if (isValid('altura', values.altura)) payload.altura = Number(values.altura);
    if (isValid('peso', values.peso)) payload.peso = Number(values.peso);

    // Si no completo nada, no tocamos la base: simplemente seguimos.
    if (Object.keys(payload).length === 0) {
      setSaving(false);
      onComplete?.();
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      setErrorMsg('No pudimos identificar tu sesión. Volvé a ingresar.');
      return;
    }

    const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);

    setSaving(false);

    if (error) {
      setErrorMsg('No pudimos guardar tus datos. Proba de nuevo.');
      return;
    }

    onComplete?.();
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

  // Saltar deja el dato vacio y avanza (o termina si es el ultimo).
  function skip() {
    if (isLast) {
      finish();
      return;
    }
    setErrorMsg('');
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
              {userName ? `${userName}, paso ${index + 1} de ${STEPS.length}` : `Paso ${index + 1} de ${STEPS.length}`}
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
            <View style={styles.field}>
              <Icon name={step.icon} size={20} color={colors.accent} />
              <TextInput
                style={styles.input}
                placeholder={step.placeholder}
                placeholderTextColor={colors.textTertiary}
                value={current}
                onChangeText={setCurrent}
                keyboardType="numeric"
                inputMode="numeric"
                maxLength={step.maxLength}
                autoFocus
              />
            </View>
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

const styles = StyleSheet.create({
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
  title: { fontSize: 40, lineHeight: 46, includeFontPadding: false },
  hint: { maxWidth: 320 },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    height: sizing.controlHLg,
    paddingHorizontal: spacing.padControl,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.surfaceGreenLine,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: sans.regular,
    fontSize: 18,
    padding: 0,
  },

  // Navegacion
  nav: { gap: space[2] },
});
