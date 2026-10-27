/* Frencia · Piezas de una rutina original compartida, del lado del dueño.
   FilaCompartida: la fila bajo el nombre que dice con cuantos esta vinculada;
   tocarla abre HojaPersonas, donde se ve con quien y se corta el vinculo de a
   uno o con todos. Quien deja de seguirla no pierde la rutina: se queda con
   una copia de como estaba ese dia. */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { diaMes, haceDias, type PersonaVinculada } from '@/lib/compartir-rutina';
import { Hoja } from '@/components/Hoja';

import { Icon } from '@/design';
import {
  LumeAvatar,
  LumeButton,
  LumeIconButton,
  LumeText,
  lumeFuente,
  lumeRadius,
  lumeSpace,
  useLume,
  useLumeStyles,
  type LumePalette,
} from '@/design/lume';

function personas(n: number): string {
  return `${n} ${n === 1 ? 'persona' : 'personas'}`;
}

/* ---------- Fila "Compartida con N" ---------- */

export interface FilaCompartidaProps {
  personas: PersonaVinculada[];
  onPress: () => void;
}

export function FilaCompartida({ personas: lista, onPress }: FilaCompartidaProps) {
  const { t } = useLume();
  const tema = useLumeStyles(makeStyles);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Compartida con ${personas(lista.length)}`}
      style={({ pressed }) => [styles.fila, tema.vidrio, pressed && styles.presionada]}
    >
      <View style={styles.avatares}>
        {lista.slice(0, 3).map((p, i) => (
          <View key={p.id} style={[styles.avatarApilado, i > 0 && [styles.avatarCorrido, tema.avatarCorrido]]}>
            <LumeAvatar size="xs" ring name={p.nombre} src={p.avatarUrl ?? undefined} />
          </View>
        ))}
      </View>
      <View style={styles.textos}>
        <LumeText rol="bodySm" style={styles.nombre} numberOfLines={1}>
          Compartida con {personas(lista.length)}
        </LumeText>
        <LumeText rol="label" color={t.textTertiary} numberOfLines={1}>
          Vinculada · tus cambios les llegan
        </LumeText>
      </View>
      <Icon name="chevron-right" size={17} strokeWidth={1.75} color={t.textTertiary} />
    </Pressable>
  );
}

/* ---------- Hoja "Con quien la compartiste" ---------- */

export interface HojaPersonasProps {
  visible: boolean;
  onCerrar: () => void;
  personas: PersonaVinculada[];
  onQuitar: (persona: PersonaVinculada) => void;
  onCopiarLink: () => void;
  onDejarConTodos: () => void;
  /** Cortando con todos: el boton carga. */
  cortando?: boolean;
}

export function HojaPersonas({
  visible,
  onCerrar,
  personas: lista,
  onQuitar,
  onCopiarLink,
  onDejarConTodos,
  cortando = false,
}: HojaPersonasProps) {
  const { t } = useLume();
  const tema = useLumeStyles(makeStyles);

  return (
    <Hoja visible={visible} onCerrar={onCerrar} superpuesta>
      <View style={styles.cuerpo}>
        <View style={styles.cabeza}>
          <LumeText rol="label" color={t.textTertiary}>
            Original · vinculada
          </LumeText>
          <LumeText rol="subtitle">Compartida con {personas(lista.length)}</LumeText>
          <LumeText rol="bodySm" color={t.textSecondary}>
            Si dejás de compartirla con alguien, se queda con una copia de cómo estaba ese día.
          </LumeText>
        </View>

        {lista.length > 0 ? (
          <View style={[styles.lista, tema.vidrio]}>
            {lista.map((p, i) => (
              <View key={p.id} style={[styles.persona, i > 0 && tema.conLinea]}>
                <LumeAvatar size="sm" ring name={p.nombre} src={p.avatarUrl ?? undefined} />
                <View style={styles.textos}>
                  <LumeText rol="bodySm" style={styles.nombre} numberOfLines={1}>
                    {p.nombre}
                  </LumeText>
                  <LumeText rol="label" color={t.textTertiary} numberOfLines={1}>
                    Desde {diaMes(p.desde)}
                    {p.entrenoEl ? ` · entrenó ${haceDias(p.entrenoEl)}` : ''}
                  </LumeText>
                </View>
                <LumeIconButton
                  icon="x"
                  variant="ghost"
                  size="sm"
                  onPress={() => onQuitar(p)}
                  accessibilityLabel={`Dejar de compartir con ${p.nombre}`}
                />
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.pie}>
          <LumeButton variant="secondary" size="lg" icon="link" fullWidth disabled={cortando} onPress={onCopiarLink}>
            Copiar el link otra vez
          </LumeButton>
          <LumeButton
            variant="danger"
            size="lg"
            icon="link-2-off"
            fullWidth
            loading={cortando}
            onPress={onDejarConTodos}
          >
            Dejar de compartir con todos
          </LumeButton>
        </View>
      </View>
    </Hoja>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    padding: lumeSpace[4],
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
  },
  presionada: { opacity: 0.6 },
  avatares: { flexDirection: 'row' },
  avatarApilado: { borderRadius: lumeRadius.pill },
  // Cada avatar pisa al anterior con un filo del color de la hoja.
  avatarCorrido: { marginLeft: -lumeSpace[2], borderWidth: 2, margin: -2 },
  textos: { flex: 1, gap: lumeSpace[1] },
  nombre: { fontFamily: lumeFuente.semibold },

  cuerpo: { gap: lumeSpace[5] },
  cabeza: { gap: lumeSpace[2] },
  lista: { borderRadius: lumeRadius.xl, borderWidth: 1, overflow: 'hidden' },
  persona: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    paddingVertical: lumeSpace[4],
    paddingLeft: lumeSpace[5],
    paddingRight: lumeSpace[3],
    minHeight: 60,
  },
  pie: { gap: lumeSpace[3], marginTop: lumeSpace[1] },
});

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    vidrio: { backgroundColor: t.surfaceCard, borderColor: t.glassLine },
    avatarCorrido: { borderColor: t.surfaceRaisedOpaco },
    conLinea: { borderTopWidth: 1, borderTopColor: t.divider },
  });
