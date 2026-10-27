/* Compartir una rutina por link.
   Dos modos: una copia (quien la recibe se lleva la rutina como esta hoy y
   despues es suya) o la original (queda vinculada a la del dueño, que es el
   unico que la edita; los cambios le llegan a quien la sigue).

   PENDIENTE: por ahora todo esto devuelve datos de prueba para poder armar y
   revisar las vistas. Las firmas son las que van a usar las pantallas cuando
   exista el backend (tablas, RLS y la funcion que resuelve el codigo). */

import { Linking, Share } from 'react-native';

import type { DiaResumen } from './rutinas';
import { MESES_CORTO } from './tiempo';

export type ModoCompartir = 'copia' | 'original';

export interface LinkRutina {
  codigo: string;
  modo: ModoCompartir;
  /** null: la original sirve hasta que el dueño deje de compartirla. */
  venceEl: string | null;
}

export interface Autor {
  id: string;
  nombre: string;
  avatarUrl: string | null;
}

/** Alguien que sigue una original. */
export interface PersonaVinculada {
  id: string;
  nombre: string;
  avatarUrl: string | null;
  desde: string;
  entrenoEl: string | null;
}

/** Lo que cambio el dueño desde la ultima vez que entro quien la sigue. */
export interface Novedad {
  fecha: string;
  cambios: string[];
}

/** Como se relaciona una rutina del usuario con el compartir. */
export type VinculoRutina =
  /** codigo: el link de la original mientras se comparte. */
  | { tipo: 'propia'; codigo: string | null; personas: PersonaVinculada[] }
  | { tipo: 'vinculada'; autor: Autor; cambioEl: string; novedad: Novedad | null };

export interface RutinaCompartida {
  codigo: string;
  modo: ModoCompartir;
  autor: Autor;
  nombre: string;
  dias: DiaResumen[];
}

export type ResultadoRutinaCompartida =
  | { estado: 'ok'; rutina: RutinaCompartida }
  | { estado: 'caido' }
  | { estado: 'error' };

/** El dominio de los links. Sin https:// para mostrarlo en la caja. */
const DOMINIO = 'frencia.app';

export function linkVisible(codigo: string): string {
  return `${DOMINIO}/r/${codigo}`;
}

export function linkCompleto(codigo: string): string {
  return `https://${linkVisible(codigo)}`;
}

/** El texto que acompaña al link en WhatsApp y en la hoja del sistema. */
export function mensajeCompartir(nombre: string, codigo: string): string {
  return `Te comparto mi rutina "${nombre}" en Frencia: ${linkCompleto(codigo)}`;
}

export function totalEjercicios(dias: DiaResumen[]): number {
  return dias.reduce((s, d) => s + d.ejercicios, 0);
}

/** "3 días · 18 ejercicios". */
export function resumenRutina(dias: DiaResumen[]): string {
  const n = dias.length;
  const e = totalEjercicios(dias);
  return `${n} ${n === 1 ? 'día' : 'días'} · ${e} ${e === 1 ? 'ejercicio' : 'ejercicios'}`;
}

/** "12 oct". Fecha local, sin Intl (ver fechaCorta en rutinas.ts). */
export function diaMes(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MESES_CORTO[d.getMonth()]}`;
}

/** "hoy", "ayer", "hace 3 días". */
export function haceDias(iso: string): string {
  const inicio = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((inicio(new Date()) - inicio(new Date(iso))) / 86_400_000);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  return `hace ${dias} días`;
}

/** "Vence en 7 días". */
export function venceEn(iso: string): string {
  const dias = Math.max(1, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
  return `Vence en ${dias} ${dias === 1 ? 'día' : 'días'}`;
}

/* ---------- Datos de prueba ---------- */

const esperar = (ms = 450) => new Promise<void>((r) => setTimeout(r, ms));

const AUTOR_DEMO: Autor = { id: 'demo-autor', nombre: 'Bautista Ribotta', avatarUrl: null };

const DIAS_DEMO: DiaResumen[] = [
  { id: 'demo-push', name: 'Push', weekdays: [0, 3], ejercicios: 6 },
  { id: 'demo-pull', name: 'Pull', weekdays: [1, 4], ejercicios: 5 },
  { id: 'demo-legs', name: 'Legs', weekdays: [2, 5], ejercicios: 7 },
];

const PERSONAS_DEMO: PersonaVinculada[] = [
  { id: 'demo-1', nombre: 'Lucía Ferreyra', avatarUrl: null, desde: '2026-10-12', entrenoEl: hace(1) },
  { id: 'demo-2', nombre: 'Martín Gómez', avatarUrl: null, desde: '2026-10-03', entrenoEl: null },
  { id: 'demo-3', nombre: 'Sofía Paz', avatarUrl: null, desde: '2026-09-28', entrenoEl: null },
];

function hace(dias: number): string {
  return new Date(Date.now() - dias * 86_400_000).toISOString();
}

function codigoDemo(): string {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pedazo = () => Array.from({ length: 4 }, () => letras[Math.floor(Math.random() * letras.length)]).join('');
  return `${pedazo()}-${pedazo()}`;
}

/** Estados para revisar las vistas en desarrollo: routine?id=…&demo=… */
export type DemoVinculo = 'compartida' | 'vinculada' | 'novedad';

export function vinculoDemo(demo: DemoVinculo): VinculoRutina {
  if (demo === 'compartida') return { tipo: 'propia', codigo: 'ORIG-K7Q2', personas: PERSONAS_DEMO };
  return {
    tipo: 'vinculada',
    autor: AUTOR_DEMO,
    cambioEl: hace(2),
    novedad:
      demo === 'novedad'
        ? { fecha: '2026-10-21', cambios: ['Push · suma Fondos en paralelas', 'Legs · el descanso pasa a 2:30'] }
        : null,
  };
}

/* ---------- Del lado del dueño ---------- */

export async function cargarVinculo(_rutinaId: string): Promise<VinculoRutina> {
  return { tipo: 'propia', codigo: null, personas: [] };
}

/** Crea el link recien al tocar Crear link. La copia vence a los 7 dias. */
export async function crearLinkRutina(_rutinaId: string, modo: ModoCompartir): Promise<LinkRutina | null> {
  await esperar();
  return {
    codigo: codigoDemo(),
    modo,
    venceEl: modo === 'copia' ? new Date(Date.now() + 7 * 86_400_000).toISOString() : null,
  };
}

/** Quien deja de seguirla se queda con una copia de como estaba ese dia. */
export async function dejarDeCompartirCon(_rutinaId: string, _personaId: string): Promise<boolean> {
  await esperar(250);
  return true;
}

export async function dejarDeCompartirConTodos(_rutinaId: string): Promise<boolean> {
  await esperar();
  return true;
}

/* ---------- Del lado de quien la recibe ---------- */

/** VENCIDO devuelve el link caido; un codigo con ORIG, la original. */
export async function cargarRutinaCompartida(codigo: string): Promise<ResultadoRutinaCompartida> {
  await esperar();
  const c = codigo.toUpperCase();
  if (c === 'VENCIDO') return { estado: 'caido' };
  return {
    estado: 'ok',
    rutina: {
      codigo: c,
      modo: c.includes('ORIG') ? 'original' : 'copia',
      autor: AUTOR_DEMO,
      nombre: 'Push Pull Legs',
      dias: DIAS_DEMO,
    },
  };
}

/** Devuelve el id de la rutina nueva en las del usuario. */
export async function agregarRutinaCompartida(
  _codigo: string,
  _opciones: { enCurso: boolean },
): Promise<string | null> {
  await esperar();
  return null;
}

/** Desvincula la rutina y la vuelve del usuario, editable. */
export async function hacerCopiaEditable(_rutinaId: string): Promise<boolean> {
  await esperar();
  return true;
}

/** Deja de seguir la original: la rutina sale de las del usuario. */
export async function dejarDeSeguir(_rutinaId: string): Promise<boolean> {
  await esperar();
  return true;
}

/* ---------- Mandar el link ---------- */

/** PENDIENTE: copiar necesita expo-clipboard. Hoy no copia nada. */
export async function copiarLink(_codigo: string): Promise<boolean> {
  return true;
}

/** Abre WhatsApp con el mensaje armado; si falla, la hoja del sistema.
 *  wa.me y no whatsapp://: no pide declarar el esquema en iOS y sin la app
 *  instalada abre WhatsApp Web. */
export async function enviarPorWhatsApp(nombre: string, codigo: string): Promise<void> {
  const url = `https://wa.me/?text=${encodeURIComponent(mensajeCompartir(nombre, codigo))}`;
  try {
    await Linking.openURL(url);
  } catch {
    await compartirEnOtrasApps(nombre, codigo);
  }
}

export async function compartirEnOtrasApps(nombre: string, codigo: string): Promise<void> {
  try {
    await Share.share({ message: mensajeCompartir(nombre, codigo) });
  } catch {
    // Cerrar la hoja del sistema no es un error para el usuario.
  }
}
