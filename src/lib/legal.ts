/* Frencia · Textos legales.
   Tipos y datos del titular que comparten los Terminos y Condiciones
   (terminos.ts) y la Politica de Privacidad (privacidad.ts). */

export const TITULAR = 'Bautista Ribotta';
export const EMAIL_CONTACTO = 'bautistaribotta@hotmail.com';

export type BloqueLegal = string | { lista: string[] };

export interface SeccionLegal {
  titulo: string;
  bloques: BloqueLegal[];
}
