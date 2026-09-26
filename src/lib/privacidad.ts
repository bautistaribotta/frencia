/* Frencia · Politica de Privacidad.
   Texto legal que muestra la pantalla /privacy. Tiene que reflejar lo que la
   app hace de verdad: si se suma un proveedor (analytics, reporte de errores,
   envio de emails) o un dato nuevo, se actualiza aca, PRIVACIDAD_VIGENCIA y
   PRIVACIDAD_VERSION. Cambiar la version hace que la app vuelva a pedir la
   aceptacion a todos, ver src/app/legal-consent.tsx. */

import { EMAIL_CONTACTO, TITULAR, type SeccionLegal } from './legal';

export const PRIVACIDAD_VIGENCIA = '22 de septiembre de 2026';
/** La que se guarda al aceptar. Va de la mano con PRIVACIDAD_VIGENCIA. */
export const PRIVACIDAD_VERSION = '2026-09-22';

export const PRIVACIDAD: SeccionLegal[] = [
  {
    titulo: '1. Quién es responsable de tus datos',
    bloques: [
      `El responsable de la base de datos y del tratamiento de tus datos personales es ${TITULAR}, persona humana con domicilio en la ciudad de Córdoba, República Argentina (en adelante, "nosotros"). Podés contactarnos en ${EMAIL_CONTACTO}.`,
      'Esta Política de Privacidad explica qué datos recolecta la aplicación Frencia, para qué los usamos, con quién los compartimos y qué derechos tenés. Forma parte de los Términos y Condiciones y se rige por la Ley 25.326 de Protección de los Datos Personales y sus normas complementarias.',
    ],
  },
  {
    titulo: '2. Qué datos recolectamos',
    bloques: [
      'Datos de tu cuenta:',
      {
        lista: [
          'Email y contraseña, si te registrás con email. La contraseña se guarda cifrada con un algoritmo de hash y nunca la vemos en texto plano.',
          'Si iniciás sesión con Apple o Google: el nombre, el email y un identificador que ese proveedor nos comparte. Si usás "Ocultar mi email" de Apple, recibimos una dirección de reenvío y no tu email real.',
          'Nombre, apellido y nombre de usuario.',
        ],
      },
      'Datos de tu perfil, que son opcionales:',
      {
        lista: [
          'Foto de perfil, si elegís subir una. La app solo accede a la foto que seleccionás, no a tu galería completa.',
          'Fecha de nacimiento, sexo, peso y altura.',
          'Preferencias de uso: unidades de peso y altura, medidor de esfuerzo (RIR o RPE) y tema de la app.',
        ],
      },
      'Datos de tu entrenamiento:',
      {
        lista: [
          'Rutinas, días de entrenamiento y ejercicios que cargás.',
          'Sesiones realizadas: fecha, hora, duración, series, pesos, repeticiones e intensidad.',
        ],
      },
      'Datos técnicos que se generan al usar el servicio:',
      {
        lista: [
          'Dirección IP, tipo de dispositivo, sistema operativo, versión de la app y registros de acceso e inicio de sesión. Los generan nuestros servidores por razones de seguridad y funcionamiento.',
        ],
      },
      'Datos de la suscripción: si contratás una, Apple o Google nos informan el estado de tu Suscripción (plan, vigencia, renovación). No recibimos ni guardamos los datos de tu tarjeta ni de tu medio de pago.',
      'No recolectamos tu ubicación, tus contactos, tu micrófono ni datos de Apple Health o Google Fit. Tampoco usamos cookies ni herramientas de seguimiento publicitario.',
    ],
  },
  {
    titulo: '3. Datos de salud y tu consentimiento',
    bloques: [
      'Tu fecha de nacimiento, sexo, peso y altura, junto con tus registros de entrenamiento, pueden revelar información sobre tu salud. La ley los considera datos sensibles y nadie está obligado a darlos.',
      {
        lista: [
          'Cargarlos es opcional: podés usar Frencia sin completarlos. Algunas funciones, como la conversión de unidades o futuras métricas relativas a tu peso corporal, pueden quedar limitadas.',
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
          'Gestionar tu Suscripción y darte acceso a las funciones que incluye.',
          'Enviarte comunicaciones del servicio: verificación de email, recuperación de contraseña, cambios en los términos o en esta política, y avisos sobre tu cuenta o tu Suscripción.',
          'Enviarte novedades y promociones de Frencia por email o notificaciones. Podés darte de baja en cualquier momento desde el mismo mensaje, desde los ajustes de notificaciones de tu dispositivo o escribiéndonos. Darte de baja no afecta las comunicaciones del servicio.',
          'Proteger la seguridad de la app, prevenir fraudes y abusos, y hacer cumplir los Términos y Condiciones.',
          'Responder tus consultas y reclamos.',
          'Mejorar la app a partir de información agregada, que no te identifica.',
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
          'Tu consentimiento, que prestás al aceptar esta política y al cargar datos opcionales o sensibles.',
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
          'Apple y Google: cuando iniciás sesión con ellos o contratás una Suscripción a través de sus tiendas. Esos datos también se rigen por sus propias políticas de privacidad.',
          'Proveedores de envío de emails o notificaciones, solo con los datos necesarios para enviarte los mensajes. Si sumamos uno nuevo, lo informaremos acá.',
          'Otros usuarios: si en el futuro la app permite compartir rutinas, quien reciba una rutina tuya podrá ver tu nombre de usuario y el contenido de esa rutina. Nunca tus datos de perfil ni tu historial.',
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
    ],
  },
  {
    titulo: '8. Datos guardados en tu dispositivo',
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
      'Tu sesión se borra del dispositivo al cerrar sesión. El resto se borra al desinstalar la app.',
    ],
  },
  {
    titulo: '9. Cuánto tiempo los guardamos',
    bloques: [
      {
        lista: [
          'Mientras tu cuenta esté activa, conservamos tus datos para prestarte el servicio.',
          'Si pedís eliminar tu cuenta, queda programada para borrarse a los 30 días. Durante ese plazo podés recuperarla iniciando sesión. Pasado ese plazo, se eliminan de forma definitiva tu cuenta, tu perfil, tu foto, tus rutinas, tus sesiones y tu historial.',
          'Las copias de seguridad de nuestro proveedor pueden conservar tus datos por un plazo acotado después de la eliminación, hasta que se sobrescriben. No las usamos para ningún otro fin.',
          'Podemos conservar datos por más tiempo solo si una ley nos obliga o si son necesarios para ejercer o defendernos en un reclamo.',
          'La información agregada que no te identifica puede conservarse sin límite de tiempo.',
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
          'Supresión: pedir que borremos tus datos. Podés hacerlo eliminando tu cuenta desde Configuración o escribiéndonos.',
          'Retirar tu consentimiento en cualquier momento, sin que eso afecte el tratamiento anterior.',
          'Oponerte a recibir comunicaciones de marketing.',
          'Pedir una copia de tus registros de entrenamiento.',
        ],
      },
      `Para ejercer tus derechos, escribinos a ${EMAIL_CONTACTO} desde el email de tu cuenta. Podemos pedirte información adicional para confirmar tu identidad. Respondemos los pedidos de rectificación y supresión dentro de los 5 días hábiles.`,
      'La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.',
    ],
  },
  {
    titulo: '12. Menores de edad',
    bloques: [
      'Frencia es solo para mayores de 18 años. No recolectamos a sabiendas datos de menores. Si detectamos que una cuenta pertenece a una persona menor de edad, la eliminamos junto con sus datos. Si sabés de un caso, avisanos.',
    ],
  },
  {
    titulo: '13. Si usás Frencia desde otro país',
    bloques: [
      'Si vivís fuera de Argentina, la ley de tu país puede darte derechos adicionales sobre tus datos. Los respetamos en la medida en que se apliquen. Podés ejercerlos por los mismos medios que se describen en esta política.',
    ],
  },
  {
    titulo: '14. Cambios en esta política',
    bloques: [
      'Podemos actualizar esta política cuando cambie la app, los proveedores que usamos o la ley. La fecha de vigencia siempre figura al principio del texto.',
      'Si los cambios son importantes, te avisaremos dentro de la app o por email con al menos 15 días de anticipación. Si un cambio implica usar tus datos para una finalidad nueva que requiera tu consentimiento, te lo pediremos antes.',
    ],
  },
  {
    titulo: '15. Contacto',
    bloques: [
      `Para cualquier consulta sobre esta política o sobre tus datos, escribinos a ${EMAIL_CONTACTO}.`,
    ],
  },
];
