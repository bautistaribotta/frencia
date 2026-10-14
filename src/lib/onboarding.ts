/* Frencia · Onboarding en modo prueba.
   Mientras se prueba el onboarding de Frencia 2.0 (rama frencia-new-design),
   el setup del perfil se muestra en cada ingreso a la app aunque la cuenta ya
   lo haya completado, y al terminarlo NO se marca profiles.onboarding_completed:
   los datos (sexo, edad, altura, peso y unidades) se guardan igual.
   Es un cambio solo de codigo: el esquema de la base no se toca.
   Para volver al comportamiento normal, poner esto en false. */

export const ONBOARDING_SIEMPRE = true;
