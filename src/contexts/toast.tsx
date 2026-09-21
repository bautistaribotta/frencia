/* Frencia · Contexto de toast.
   Notificacion efimera, no bloqueante, montada una sola vez en la raiz
   para sobrevivir a cambios de ruta (ej. se dispara al guardar y se ve
   tras cerrar el modal). Una sola visible a la vez: un toast nuevo
   reemplaza al anterior. Auto-descarta y se puede tocar para cerrar. */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  FrenciaText,
  Icon,
  shadow,
  radius,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type IconName,
  type Palette,
} from '@/design';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
}

interface ToastState extends ToastOptions {
  id: number;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

// Duracion antes de auto-descartar (ms). Estandar: ~3.5s sin accion.
const TOAST_DURATION = 3500;

const ICON_BY_TYPE: Record<ToastType, IconName> = {
  success: 'check',
  error: 'alert-triangle',
  info: 'info',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast(null);
  }, []);

  const showToast = useCallback(({ message, type = 'success' }: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ id: Date.now(), message, type });
    timerRef.current = setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const accentByType: Record<ToastType, string> = {
    success: colors.success,
    error: colors.danger,
    info: colors.info,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Capa superior: deja pasar los toques salvo sobre el toast. */}
      <View style={styles.overlay}>
        {toast ? (
          <Animated.View
            key={toast.id}
            entering={FadeInDown.duration(240)}
            exiting={FadeOutDown.duration(180)}
            style={[styles.toast, { marginBottom: insets.bottom + space[4] }]}
          >
            <Pressable
              onPress={dismiss}
              accessibilityRole="button"
              accessibilityLabel="Cerrar notificacion"
              style={styles.pressable}
            >
              <Icon name={ICON_BY_TYPE[toast.type]} size={20} color={accentByType[toast.type]} />
              <FrenciaText role="bodySm" color={colors.textPrimary} style={styles.message}>
                {toast.message}
              </FrenciaText>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    overlay: {
      pointerEvents: 'box-none',
      ...StyleSheet.absoluteFill,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: spacing.padScreen,
    },
    toast: {
      maxWidth: 480,
      width: '100%',
      backgroundColor: colors.surfaceCardElevated,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      ...shadow.lg,
    },
    pressable: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[4],
    },
    message: { flex: 1 },
  });
