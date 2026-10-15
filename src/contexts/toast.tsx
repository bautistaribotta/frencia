/* Frencia · Contexto de toast.
   Notificacion efimera, no bloqueante, montada una sola vez en la raiz
   para sobrevivir a cambios de ruta (ej. se dispara al guardar y se ve
   tras cerrar el modal). Una sola visible a la vez: un toast nuevo
   reemplaza al anterior. Auto-descarta y se puede tocar para cerrar.
   Va en Lume: bg-app al 92 % con borde glass-line; el icono de exito en
   signal, el de error en carmin y el de info en texto secundario. */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/design';
import { LumeText, lumeFuente, lumeLayout, lumeRadius, lumeSpace, useLume } from '@/design/lume';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  /** Boton a la derecha del mensaje, por ejemplo "Deshacer". Tocarlo corre
   *  la accion y cierra el toast. */
  action?: { label: string; onPress: () => void };
}

interface ToastState extends ToastOptions {
  id: number;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

// Duracion antes de auto-descartar (ms). Estandar: ~3.5s sin accion; con
// accion un poco mas, para que de tiempo a leer y decidir.
const TOAST_DURATION = 3500;
const TOAST_DURATION_ACCION = 5000;

const ICON_BY_TYPE: Record<ToastType, IconName> = {
  success: 'check',
  error: 'alert-triangle',
  info: 'info',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { t, sombras } = useLume();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast(null);
  }, []);

  const showToast = useCallback(({ message, type = 'success', action }: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ id: Date.now(), message, type, action });
    timerRef.current = setTimeout(
      () => setToast(null),
      action ? TOAST_DURATION_ACCION : TOAST_DURATION,
    );
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const accentByType: Record<ToastType, string> = {
    success: t.signal,
    error: t.dangerText,
    info: t.textSecondary,
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
            exiting={FadeOutUp.duration(180)}
            style={[
              styles.toast,
              {
                marginTop: insets.top + lumeSpace[4],
                backgroundColor: t.surfaceToast,
                borderColor: t.glassLine,
                boxShadow: sombras.lg,
              },
            ]}
          >
            <View style={styles.fila}>
              <Pressable
                onPress={dismiss}
                accessibilityRole="button"
                accessibilityLabel="Cerrar notificacion"
                style={styles.pressable}
              >
                <Icon name={ICON_BY_TYPE[toast.type]} size={20} color={accentByType[toast.type]} />
                <LumeText rol="bodySm" color={t.textPrimary} style={styles.message}>
                  {toast.message}
                </LumeText>
              </Pressable>
              {/* Hermano y no hijo del de cerrar: un boton adentro de otro no
                 lo alcanza VoiceOver. */}
              {toast.action ? (
                <Pressable
                  onPress={() => {
                    toast.action?.onPress();
                    dismiss();
                  }}
                  accessibilityRole="button"
                  hitSlop={8}
                  style={({ pressed }) => [styles.accion, pressed && styles.accionPresionada]}
                >
                  <LumeText rol="bodySm" color={t.signalText} style={styles.accionTexto}>
                    {toast.action.label}
                  </LumeText>
                </Pressable>
              ) : null}
            </View>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  overlay: {
    pointerEvents: 'box-none',
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: lumeLayout.padScreen,
  },
  toast: {
    maxWidth: 480,
    width: '100%',
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
  },
  fila: { flexDirection: 'row', alignItems: 'center' },
  accion: { paddingHorizontal: lumeSpace[4], paddingVertical: lumeSpace[4] },
  accionPresionada: { opacity: 0.6 },
  accionTexto: { fontFamily: lumeFuente.semibold },
  pressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[3],
    paddingHorizontal: lumeSpace[4],
    paddingVertical: lumeSpace[4],
  },
  message: { flex: 1 },
});
