/* Frencia · Politica de Privacidad.
   Texto legal que muestra la pantalla /privacy. Tiene que reflejar lo que la
   app hace de verdad: si se suma un proveedor (analytics, reporte de errores,
   envio de emails) o un dato nuevo, se actualiza aca, PRIVACIDAD_VIGENCIA y
   PRIVACIDAD_VERSION. Cambiar la version hace que la app vuelva a pedir la
   aceptacion a todos, ver src/app/legal-consent.tsx. */

import { DOMICILIO, EMAIL_CONTACTO, TITULAR, type SeccionLegal } from './legal';

export const PRIVACIDAD_VIGENCIA = '5 de noviembre de 2026';
/** La que se guarda al aceptar. Va de la mano con PRIVACIDAD_VIGENCIA. Un
 *  segundo cambio en el mismo dia suma un sufijo (.2): la app solo compara
 *  por igualdad. */
export const PRIVACIDAD_VERSION = '2026-11-05';

export const PRIVACIDAD: SeccionLegal[] = [
  {
    titulo: '1. Quién es responsable de tus datos',
    bloques: [
      `El responsable de la base de datos y del tratamiento de tus datos personales es ${TITULAR}, con domicilio en ${DOMICILIO} (en adelante, "nosotros"). Podés contactarnos en ${EMAIL_CONTACTO}.`,
      'Esta Política de Privacidad explica qué datos recolecta Frencia, en su aplicación móvil y en su versión web, para qué los usamos, con quién los compartimos y qué derechos tenés. Forma parte de los Términos y Condiciones y se rige por la Ley 25.326 de Protección de los Datos Personales y sus normas complementarias.',
      'Para eliminar tu cuenta de Frencia y tus datos, seguí los pasos de la sección 12.',
    ],
  },
  {
    titulo: '2. Qué datos recolectamos',
    bloques: [
      'Datos de tu cuenta:',
      {
        lista: [
          'Email y contraseña, si te registrás con email. La contraseña se guarda cifrada con un algoritmo de hash y nunca la vemos en texto plano.',
          'Si iniciás sesión con Google: el nombre, el email y un identificador que Google nos comparte.',
          'Nombre, apellido y nombre de usuario.',
          'La constancia de que aceptaste los Términos y Condiciones y esta política: la versión de cada documento y la fecha y hora de la aceptación.',
        ],
      },
      'Datos de tu perfil, que son opcionales:',
      {
        lista: [
          'Foto de perfil, si elegís subir una. La app te pide permiso para acceder a tus fotos, pero solo sube la que seleccionás.',
          'Fecha de nacimiento, sexo, peso y altura.',
          'Preferencias de uso: unidades de peso, altura y distancia (kilómetros o millas), medidor de esfuerzo (RIR o RPE) y tema de la app.',
        ],
      },
      'Datos de tu entrenamiento:',
      {
        lista: [
          'Rutinas, días de entrenamiento y ejercicios que cargás, incluidos el tiempo y la distancia que planificás para los ejercicios de cardio, y el tiempo y el peso opcional que planificás para los ejercicios isométricos.',
          'Sesiones realizadas: fecha, hora, duración, series, pesos, repeticiones e intensidad, en los ejercicios de cardio, el tiempo, la distancia y el esfuerzo percibido (RPE), y en los ejercicios isométricos, como la plancha, el tiempo sostenido, el peso opcional y el esfuerzo percibido (RPE).',
        ],
      },
      'Datos técnicos que se generan al usar el servicio:',
      {
        lista: [
          'Dirección IP, datos técnicos de tu navegador o dispositivo y registros de acceso e inicio de sesión. Los generan nuestros proveedores de infraestructura por razones de seguridad y funcionamiento.',
        ],
      },
      'No recolectamos tu ubicación, tus contactos, audio de tu micrófono ni datos de otras apps de salud. Tampoco usamos cookies ni herramientas de analítica o de seguimiento publicitario. En la web usamos el almacenamiento del navegador, como se explica en la sección 8.',
    ],
  },
  {
    titulo: '3. Datos de salud y tu consentimiento',
    bloques: [
      'Tu fecha de nacimiento, sexo, peso y altura, junto con tus registros de entrenamiento, pueden revelar información sobre tu salud. La ley los considera datos sensibles y nadie está obligado a darlos.',
      {
        lista: [
          'Cargarlos es opcional: podés usar Frencia sin completarlos. Algunas funciones pueden quedar limitadas.',
          'Al cargarlos, nos das tu consentimiento libre, expreso e informado para tratarlos con las finalidades de esta política.',
          'Podés retirar tu consentimiento cuando quieras: borrá o modificá esos datos desde tu perfil, o pedinos que los eliminemos.',
        ],
      },
      'Nunca usamos tus datos de salud con fines publicitarios ni los compartimos con terceros para esos fines.',
    ],
  },
  {
    titulo: '4. Para qué usamos tus datos',
    bloques: [
      {
        lista: [
          'Prestarte el servicio: crear y mantener tu cuenta, guardar tus rutinas y sesiones y sincronizarlas entre tus dispositivos.',
          'Calcular tus estadísticas: historial, racha, volumen, récords y progreso.',
          'Dejar constancia de tu aceptación de los Términos y Condiciones y de esta política, y pedirte que aceptes las versiones nuevas cuando cambien.',
          'Enviarte comunicaciones del servicio: verificación de email, recuperación de contraseña, cambios en los términos o en esta política, y avisos sobre tu cuenta.',
          'Proteger la seguridad de la app, prevenir fraudes y abusos, y hacer cumplir los Términos y Condiciones.',
          'Responder tus consultas y reclamos.',
          'Cumplir obligaciones legales y requerimientos de autoridades competentes.',
        ],
      },
      'No vendemos ni alquilamos tus datos personales. No los usamos para mostrarte publicidad de terceros ni para tomar decisiones automatizadas que te afecten de forma significativa.',
    ],
  },
  {
    titulo: '5. Por qué podemos tratarlos',
    bloques: [
      'Tratamos tus datos sobre las siguientes bases legales:',
      {
        lista: [
          'Tu consentimiento, que prestás al aceptar de forma expresa esta política antes de empezar a usar la app, y al cargar datos opcionales o sensibles.',
          'La ejecución del contrato que aceptaste en los Términos y Condiciones, para prestarte el servicio.',
          'El cumplimiento de obligaciones legales.',
        ],
      },
    ],
  },
  {
    titulo: '6. Con quién compartimos tus datos',
    bloques: [
      'Solo compartimos tus datos en estos casos:',
      {
        lista: [
          'Supabase Inc.: nuestro proveedor de base de datos, autenticación y almacenamiento de archivos. Guarda los datos por cuenta nuestra y no puede usarlos para sus propios fines.',
          'Cloudflare, Inc.: nuestro proveedor de alojamiento de la versión web y del sitio de Frencia. Recibe tu dirección IP y los datos técnicos de tu conexión cuando los visitás.',
          'Google: cuando iniciás sesión con tu cuenta de Google. Esos datos también se rigen por su propia política de privacidad.',
          'El servicio de envío de los emails de tu cuenta, como la verificación y la recuperación de contraseña, solo con los datos necesarios para enviarlos.',
          'Autoridades judiciales o administrativas, cuando una ley o una orden válida nos lo exija.',
          'Un eventual sucesor, si Frencia se transfiere a otra persona o empresa. En ese caso te avisaremos y el sucesor deberá respetar esta política.',
        ],
      },
    ],
  },
  {
    titulo: '7. Transferencia internacional',
    bloques: [
      'Los servidores de Supabase donde se guardan tus datos están en los Estados Unidos. La Agencia de Acceso a la Información Pública no incluye a ese país entre los que tienen un nivel de protección adecuado.',
      'Al aceptar esta política, prestás tu consentimiento expreso para esa transferencia, conforme al artículo 12 de la Ley 25.326. Además, exigimos a nuestros proveedores medidas de seguridad y confidencialidad equivalentes a las de la ley argentina.',
      'Si vivís en el Espacio Económico Europeo o en el Reino Unido, tus datos se transfieren fuera de esa región, a los Estados Unidos y a Argentina. Podés pedirnos información sobre las garantías que se aplican a esas transferencias.',
    ],
  },
  {
    titulo: '8. Datos guardados en tu dispositivo o navegador',
    bloques: [
      'Para funcionar más rápido y sin conexión, la app guarda en tu dispositivo:',
      {
        lista: [
          'Tu sesión iniciada, para que no tengas que ingresar cada vez.',
          'Tu preferencia de tema.',
          'Una copia del catálogo de ejercicios.',
          'Las series que registraste sin conexión, hasta que se sincronizan con el servidor.',
        ],
      },
      'En la web, el almacenamiento del navegador guarda tu sesión, tus preferencias de visualización y los borradores de las rutinas que estás editando.',
      'Tu sesión se borra al cerrar sesión. El resto se borra al desinstalar la app o al borrar los datos del navegador.',
      'En Android, si tenés activada la copia de seguridad de tu cuenta de Google, el sistema puede incluir estos datos en ella. Esa copia se rige por la política de privacidad de Google y puede conservarse después de desinstalar la app.',
      'Si compartís el resumen de una sesión, lo hacés con la opción de compartir de tu dispositivo y el destino lo elegís vos.',
    ],
  },
  {
    titulo: '9. Cuánto tiempo los guardamos',
    bloques: [
      {
        lista: [
          'Mientras tu cuenta esté activa, conservamos tus datos para prestarte el servicio.',
          'Si pedís eliminar tu cuenta, queda programada para borrarse a los 30 días. Durante ese plazo podés recuperarla iniciando sesión. Pasado ese plazo, se eliminan de forma definitiva tu cuenta, tu perfil, tu foto, tus rutinas, tus sesiones y tu historial.',
          'La constancia de tus aceptaciones de los Términos y Condiciones y de esta política se conserva mientras exista tu cuenta y se elimina junto con ella.',
          'Si creás una cuenta y no aceptás los Términos y Condiciones y esta política dentro de los 30 días, la eliminamos de forma definitiva junto con los datos del registro, sin período de recuperación, para no conservarlos sin tu consentimiento.',
          'Las copias de seguridad de nuestro proveedor pueden conservar tus datos por un plazo acotado después de la eliminación, hasta que se sobrescriben. No las usamos para ningún otro fin.',
          'Podemos conservar datos por más tiempo solo si una ley nos obliga o si son necesarios para ejercer o defendernos en un reclamo.',
        ],
      },
    ],
  },
  {
    titulo: '10. Cómo protegemos tus datos',
    bloques: [
      'Aplicamos medidas técnicas y organizativas razonables para proteger tus datos:',
      {
        lista: [
          'Toda la comunicación entre la app y los servidores viaja cifrada.',
          'Las reglas de acceso de la base de datos hacen que cada usuario solo pueda leer y modificar sus propios datos.',
          'Tu foto de perfil se guarda en un almacenamiento privado y solo se accede a ella con enlaces temporales.',
          'Las contraseñas se guardan cifradas con hash.',
        ],
      },
      'Ningún sistema es 100% seguro. Si ocurre un incidente de seguridad que afecte tus datos, te avisaremos y lo informaremos a la autoridad de control según lo exija la ley.',
    ],
  },
  {
    titulo: '11. Tus derechos',
    bloques: [
      'Como titular de tus datos tenés derecho a:',
      {
        lista: [
          'Acceso: saber qué datos tuyos tenemos. Podés ejercerlo gratis a intervalos no menores a 6 meses, salvo que acredites un interés legítimo, y te respondemos dentro de los 10 días corridos.',
          'Rectificación y actualización: corregir datos inexactos o incompletos. Muchos podés cambiarlos vos mismo desde tu perfil.',
          'Supresión: pedir que borremos tus datos. Podés hacerlo eliminando tu cuenta desde Configuración, desde la pantalla de aceptación de estos textos si todavía no los aceptaste, o escribiéndonos.',
          'Retirar tu consentimiento en cualquier momento, sin que eso afecte el tratamiento anterior.',
          'Pedir una copia de tus registros de entrenamiento.',
        ],
      },
      `Para ejercer tus derechos, escribinos a ${EMAIL_CONTACTO} desde el email de tu cuenta. Podemos pedirte información adicional para confirmar tu identidad. Respondemos los pedidos de rectificación y supresión dentro de los 5 días hábiles.`,
      'La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.',
    ],
  },
  {
    titulo: '12. Cómo eliminar tu cuenta de Frencia',
    bloques: [
      'Podés eliminar tu cuenta de Frencia y tus datos de cualquiera de estas dos formas:',
      {
        lista: [
          'Desde la app o la web: entrá a Configuración y elegí "Eliminación de cuenta" en la app o "Eliminar cuenta" en la web.',
          `Sin instalar la app: escribinos a ${EMAIL_CONTACTO} desde el email de tu cuenta, con el asunto "Eliminar mi cuenta de Frencia".`,
        ],
      },
      'La cuenta queda programada para eliminarse a los 30 días y durante ese plazo podés recuperarla iniciando sesión. Pasado ese plazo, se eliminan de forma definitiva tu cuenta, tu perfil, tu foto, tus rutinas, tus sesiones, tu historial y la constancia de tus aceptaciones. Las copias de seguridad de nuestro proveedor pueden conservar esos datos por un plazo acotado, hasta que se sobrescriben.',
    ],
  },
  {
    titulo: '13. Menores de edad',
    bloques: [
      'Frencia es solo para mayores de 18 años. No recolectamos a sabiendas datos de menores. Si detectamos que una cuenta pertenece a una persona menor de edad, la eliminamos junto con sus datos. Si sabés de un caso, avisanos.',
    ],
  },
  {
    titulo: '14. Si usás Frencia desde otro país',
    bloques: [
      'Si vivís fuera de Argentina, la ley de tu país puede darte derechos adicionales sobre tus datos. Los respetamos en la medida en que se apliquen. Podés ejercerlos por los mismos medios que se describen en esta política.',
      'Si vivís en el Espacio Económico Europeo o en el Reino Unido, se aplican además, en lo que corresponda, el Reglamento General de Protección de Datos o su equivalente británico. Tratamos tus datos para ejecutar el contrato que aceptaste, con tu consentimiento explícito para los datos de salud y para cumplir obligaciones legales.',
      'En ese caso tenés derecho a acceder a tus datos, rectificarlos, suprimirlos, limitar su tratamiento, oponerte a él, recibirlos en un formato portable y retirar tu consentimiento. También podés reclamar ante la autoridad de protección de datos de tu país.',
    ],
  },
  {
    titulo: '15. Cambios en esta política',
    bloques: [
      'Podemos actualizar esta política cuando cambie la app, los proveedores que usamos o la ley. La fecha de vigencia siempre figura al principio del texto.',
      'Si los cambios son importantes, te avisaremos dentro de la app o por email con al menos 15 días de anticipación. Cuando una versión nueva entre en vigencia, la app te va a pedir que la aceptes de forma expresa para seguir usándola. Si un cambio implica usar tus datos para una finalidad nueva que requiera tu consentimiento, te lo pediremos antes.',
    ],
  },
  {
    titulo: '16. Contacto',
    bloques: [
      `Para cualquier consulta sobre esta política o sobre tus datos, escribinos a ${EMAIL_CONTACTO}.`,
    ],
  },
];
