/* Frencia · Hoja de compartir una rutina.
   Dos pasos en la misma hoja, para no perder de vista la rutina:
     1. que recibe la otra persona: una copia o la original vinculada. Arranca
        en Una copia, la opcion que no compromete a nadie.
     2. el link listo: vista previa de lo que se manda, el link para copiar y
        WhatsApp como accion principal. Otras apps abre la hoja del sistema.
   El link se crea recien al tocar Crear link. Va superpuesta (no en un Modal)
   para que el toast de Link copiado, que vive en la raiz, se vea encima: la
   pantalla la monta como ultimo hijo. */

import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import {
  compartirEnOtrasApps,
  copiarLink,
  crearLinkRutina,
  enviarPorWhatsApp,
  linkVisible,
  resumenRutina,
  venceEn,
  type LinkRutina,
  type ModoCompartir,
} from '@/lib/compartir-rutina';
import type { DiaResumen } from '@/lib/rutinas';
import { useToast } from '@/contexts/toast';
import { Hoja } from '@/components/Hoja';

import { Icon, type IconName } from '@/design';
import {
  LumeBadge,
  LumeButton,
  LumeText,
  lumeFuente,
  lumeRadius,
  lumeSpace,
  useLume,
  useLumeStyles,
  type LumePalette,
} from '@/design/lume';

const MODOS: { id: ModoCompartir; icono: IconName; titulo: string; texto: string }[] = [
  {
    id: 'copia',
    icono: 'copy',
    titulo: 'Una copia',
    texto: 'Recibe la rutina como está hoy. Después es suya: la puede editar y tus cambios no le llegan.',
  },
  {
    id: 'original',
    icono: 'link',
    titulo: 'La original',
    texto:
      'Queda vinculada a la tuya. Cuando la edites, se actualiza también para quien la recibió. Esa persona no la puede editar.',
  },
];

export interface HojaCompartirProps {
  visible: boolean;
  onCerrar: () => void;
  rutina: { id: string; name: string; dias: DiaResumen[] };
}

export function HojaCompartir({ visible, onCerrar, rutina }: HojaCompartirProps) {
  const { t } = useLume();
  const tema = useLumeStyles(makeStyles);
  const { showToast } = useToast();

  const [modo, setModo] = useState<ModoCompartir>('copia');
  const [link, setLink] = useState<LinkRutina | null>(null);
  const [creando, setCreando] = useState(false);

  // Al cerrarla se vuelve al paso 1 con Una copia: la proxima vez arranca de nuevo.
  function cerrar() {
    onCerrar();
    setModo('copia');
    setLink(null);
  }

  function elegir(m: ModoCompartir) {
    if (m === modo) return;
    Haptics.selectionAsync();
    setModo(m);
  }

  async function crear() {
    setCreando(true);
    const nuevo = await crearLinkRutina(rutina.id, modo);
    setCreando(false);
    if (nuevo) setLink(nuevo);
    else showToast({ message: 'No pudimos crear el link. Probá de nuevo.', type: 'error' });
  }

  async function copiar() {
    if (!link) return;
    const ok = await copiarLink(link.codigo);
    showToast(ok ? { message: 'Link copiado', type: 'success' } : { message: 'No pudimos copiar el link.', type: 'error' });
  }

  return (
    <Hoja visible={visible} onCerrar={cerrar} superpuesta>
      {!link ? (
        <View style={styles.cuerpo}>
          <View style={styles.textos}>
            <LumeText rol="label" color={t.textTertiary}>
              Compartir rutina
            </LumeText>
            <LumeText rol="subtitle" numberOfLines={2}>
              {rutina.name}
            </LumeText>
            <LumeText rol="bodySm" color={t.textSecondary}>
              Elegí qué recibe la otra persona.
            </LumeText>
          </View>

          <View style={styles.modos} accessibilityRole="radiogroup">
            {MODOS.map((m) => {
              const sel = m.id === modo;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => elegir(m.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: sel }}
                  accessibilityLabel={m.titulo}
                  accessibilityHint={m.texto}
                  style={[styles.modo, sel ? tema.modoElegido : tema.modo]}
                >
                  <View style={[styles.modoIcono, tema.pozo]}>
                    <Icon name={m.icono} size={20} strokeWidth={1.75} color={t.textPrimary} />
                  </View>
                  <View style={styles.modoTextos}>
                    <LumeText rol="body" style={styles.modoTitulo}>
                      {m.titulo}
                    </LumeText>
                    <LumeText rol="bodySm" color={t.textSecondary}>
                      {m.texto}
                    </LumeText>
                  </View>
                  <View style={[styles.radio, sel ? tema.radioElegido : tema.radio]}>
                    {sel ? <View style={[styles.radioPunto, tema.radioPunto]} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.pie}>
            <LumeButton variant="primary" size="lg" icon="link" fullWidth loading={creando} onPress={crear}>
              Crear link
            </LumeButton>
          </View>
        </View>
      ) : (
        <View style={styles.cuerpo}>
          <View style={styles.cabeza}>
            <LumeButton variant="ghost" size="sm" icon="chevron-left" onPress={() => setLink(null)}>
              Atrás
            </LumeButton>
            <LumeBadge tone="neutral" icon={link.modo === 'original' ? 'link' : 'copy'}>
              {link.modo === 'original' ? 'Original' : 'Copia'}
            </LumeBadge>
          </View>

          <View style={styles.textos}>
            <LumeText rol="subtitle">Link listo</LumeText>
            <LumeText rol="bodySm" color={t.textSecondary}>
              {link.modo === 'original'
                ? 'Quien lo abra va a seguir tu rutina. Lo que cambies le llega solo.'
                : 'Quien lo abra se lleva una copia de la rutina tal como está ahora.'}
            </LumeText>
          </View>

          {/* Vista previa de lo que se manda. */}
          <View style={[styles.previa, tema.previa]}>
            <View style={styles.previaTextos}>
              <LumeText rol="subtitle" numberOfLines={1}>
                {rutina.name}
              </LumeText>
              <LumeText rol="label" color={t.textTertiary}>
                {resumenRutina(rutina.dias)}
              </LumeText>
            </View>
            {rutina.dias.length > 0 ? (
              <View style={styles.chips}>
                {rutina.dias.map((d) => (
                  <View key={d.id} style={[styles.chip, tema.pozo]}>
                    <LumeText rol="bodySm" style={styles.chipTexto} numberOfLines={1}>
                      {d.name}
                    </LumeText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* El link: un pozo sin vidrio, con el codigo en mono. */}
          <View style={[styles.linkCaja, tema.pozo]}>
            <Icon name="link-2" size={18} strokeWidth={1.75} color={t.textTertiary} />
            <LumeText rol="bodySm" style={styles.linkTexto} numberOfLines={1} selectable>
              {linkVisible(link.codigo)}
            </LumeText>
            <Pressable
              onPress={copiar}
              accessibilityRole="button"
              accessibilityLabel="Copiar link"
              hitSlop={4}
              style={({ pressed }) => [styles.copiar, pressed && styles.presionada]}
            >
              <Icon name="copy" size={16} strokeWidth={1.75} color={t.signalText} />
              <LumeText rol="bodySm" color={t.signalText} style={styles.copiarTexto}>
                Copiar
              </LumeText>
            </Pressable>
          </View>

          <View style={styles.aviso}>
            <Icon name={link.modo === 'original' ? 'users' : 'clock'} size={14} strokeWidth={1.75} color={t.textTertiary} />
            <LumeText rol="label" color={t.textTertiary} style={styles.avisoTexto}>
              {link.venceEl
                ? `${venceEn(link.venceEl)} · se puede usar varias veces`
                : 'Sirve hasta que dejes de compartirla'}
            </LumeText>
          </View>

          <View style={styles.pie}>
            <LumeButton
              variant="primary"
              size="lg"
              icon="message-circle"
              fullWidth
              onPress={() => enviarPorWhatsApp(rutina.name, link.codigo)}
            >
              Enviar por WhatsApp
            </LumeButton>
            <LumeButton
              variant="secondary"
              size="lg"
              icon="share"
              fullWidth
              onPress={() => compartirEnOtrasApps(rutina.name, link.codigo)}
            >
              Otras apps
            </LumeButton>
          </View>
        </View>
      )}
    </Hoja>
  );
}

const styles = StyleSheet.create({
  cuerpo: { gap: lumeSpace[5] },
  textos: { gap: lumeSpace[2] },

  // El boton ghost trae su propio padding: el margen corre el chevron al
  // borde del contenido, como el Atras de las pantallas.
  cabeza: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    marginLeft: -10,
    marginVertical: -lumeSpace[2],
  },

  modos: { gap: lumeSpace[3] },
  modo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: lumeSpace[4],
    padding: lumeSpace[5],
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
  },
  modoIcono: {
    width: 40,
    height: 40,
    borderRadius: lumeRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modoTextos: { flex: 1, gap: lumeSpace[1] },
  modoTitulo: { fontFamily: lumeFuente.semibold, lineHeight: 22 },
  radio: {
    width: 20,
    height: 20,
    marginTop: 1,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioPunto: { width: 10, height: 10, borderRadius: 5 },

  previa: {
    gap: lumeSpace[4],
    padding: lumeSpace[5],
    borderRadius: lumeRadius.xl,
    borderWidth: 1,
  },
  previaTextos: { gap: lumeSpace[1] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: lumeSpace[2] },
  chip: {
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: lumeSpace[3],
    borderRadius: lumeRadius.pill,
    borderWidth: 1,
  },
  chipTexto: { fontFamily: lumeFuente.medium, fontSize: 13, lineHeight: 16 },

  linkCaja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[3],
    height: 52,
    paddingLeft: lumeSpace[4],
    paddingRight: lumeSpace[2],
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
  },
  linkTexto: { flex: 1, fontFamily: lumeFuente.monoRegular },
  copiar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[2],
    height: 36,
    paddingHorizontal: lumeSpace[3],
    borderRadius: lumeRadius.md,
  },
  copiarTexto: { fontFamily: lumeFuente.semibold },
  presionada: { opacity: 0.6 },

  // Pegado a la caja del link: resta parte del gap de la hoja.
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[2],
    marginTop: -lumeSpace[2],
    paddingHorizontal: lumeSpace[1],
  },
  avisoTexto: { flex: 1 },

  pie: { gap: lumeSpace[3], marginTop: lumeSpace[1] },
});

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    modo: { backgroundColor: t.surfaceCard, borderColor: t.glassLine },
    modoElegido: { backgroundColor: t.surfaceCardElevated, borderColor: t.accent },
    pozo: { backgroundColor: t.surfaceInset, borderColor: t.glassLine },
    radio: { borderColor: t.borderStrong },
    radioElegido: { borderColor: t.accent },
    radioPunto: { backgroundColor: t.accent },
    previa: { backgroundColor: t.surfaceCard, borderColor: t.glassLine },
  });
