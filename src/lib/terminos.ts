/* Frencia · Terminos y Condiciones.
   Texto legal que muestra la pantalla /terms. Vive como datos para que la
   pantalla solo se ocupe de presentarlo. Cualquier cambio de fondo implica
   actualizar TERMINOS_VIGENCIA y TERMINOS_VERSION y avisar a los usuarios
   (ver seccion 16). Cambiar la version hace que la app vuelva a pedir la
   aceptacion a todos, ver src/app/legal-consent.tsx. */

import { EMAIL_CONTACTO, TITULAR, type SeccionLegal } from './legal';

export const TERMINOS_VIGENCIA = '26 de septiembre de 2026';
/** La que se guarda al aceptar. Va de la mano con TERMINOS_VIGENCIA. */
export const TERMINOS_VERSION = '2026-09-26';

export const TERMINOS: SeccionLegal[] = [
  {
    titulo: '1. Aceptación',
    bloques: [
      'Estos Términos y Condiciones regulan el uso de la aplicación Frencia (en adelante, "Frencia" o "la app").',
      'Para usar Frencia tenés que aceptarlos de forma expresa, junto con la Política de Privacidad. Antes de empezar, la app te muestra los dos documentos y solo te deja continuar después de que abras cada uno y confirmes que los aceptás. Al hacerlo, declarás que los leíste, los entendés y los aceptás. Guardamos la versión de cada documento que aceptaste y la fecha y hora en que lo hiciste.',
      `Si no estás de acuerdo con alguno de estos términos, no los aceptes y no uses la app. Podés cerrar sesión desde esa misma pantalla y pedirnos que eliminemos tu cuenta escribiendo a ${EMAIL_CONTACTO}.`,
    ],
  },
  {
    titulo: '2. Quién presta el servicio',
    bloques: [
      `Frencia es desarrollada y ofrecida por ${TITULAR}, persona humana con domicilio en la ciudad de Córdoba, República Argentina (en adelante, "el titular", "nosotros"). Podés contactarnos en ${EMAIL_CONTACTO}.`,
    ],
  },
  {
    titulo: '3. Qué es Frencia',
    bloques: [
      'Frencia es una herramienta para registrar entrenamientos de fuerza. Te permite, entre otras cosas:',
      {
        lista: [
          'Cargar y organizar tus rutinas y días de entrenamiento.',
          'Registrar series, pesos, repeticiones e intensidad (RIR o RPE) durante cada sesión.',
          'Consultar tu historial, tu racha y tu progreso.',
          'Consultar un catálogo de ejercicios con sus grupos musculares e instrucciones.',
        ],
      },
      'Podemos sumar, modificar o quitar funciones con el tiempo, por ejemplo la posibilidad de compartir rutinas con otros usuarios.',
    ],
  },
  {
    titulo: '4. Requisitos para usar la app',
    bloques: [
      'Para usar Frencia tenés que ser mayor de 18 años y tener capacidad legal para contratar. Si detectamos que una cuenta pertenece a una persona menor de edad, podemos suspenderla y eliminarla junto con sus datos.',
    ],
  },
  {
    titulo: '5. Tu cuenta',
    bloques: [
      'Podés registrarte con email y contraseña, o iniciar sesión con Apple o Google. En ese caso, la autenticación también se rige por los términos de ese proveedor.',
      {
        lista: [
          'Los datos que cargues tienen que ser verdaderos y estar actualizados.',
          'Sos responsable de mantener tu contraseña en secreto y de toda la actividad de tu cuenta.',
          'La cuenta es personal e intransferible: no podés venderla, cederla ni compartirla.',
          'Tu nombre de usuario no puede suplantar a otra persona ni ser ofensivo o engañoso, ni infringir derechos de terceros.',
        ],
      },
      `Si sospechás que alguien accedió a tu cuenta sin permiso, escribinos a ${EMAIL_CONTACTO}.`,
    ],
  },
  {
    titulo: '6. Salud y entrenamiento',
    bloques: [
      'Frencia es una herramienta de registro. No es un servicio médico, de nutrición ni de entrenamiento personal, y nada de lo que muestra (catálogo de ejercicios, instrucciones, métricas, estimaciones o sugerencias) es un consejo médico ni reemplaza la consulta con un profesional de la salud.',
      {
        lista: [
          'Antes de empezar o cambiar un plan de entrenamiento, consultá con un médico, sobre todo si tenés alguna condición de salud, lesión o embarazo.',
          'Entrenás bajo tu propia responsabilidad. Respetá tus límites, usá una técnica correcta y buscá supervisión cuando corresponda.',
          'Si sentís dolor, mareo, falta de aire o cualquier malestar, dejá de entrenar y buscá atención médica.',
        ],
      },
      'Los cálculos que hace la app (por ejemplo volumen, récords o estimaciones de repetición máxima) son orientativos y dependen de los datos que cargues.',
    ],
  },
  {
    titulo: '7. Uso aceptable',
    bloques: [
      'Al usar Frencia te comprometés a no:',
      {
        lista: [
          'Usar la app para fines ilegales o contrarios a estos términos.',
          'Subir contenido ilícito, ofensivo, discriminatorio o que infrinja derechos de terceros, incluida la foto de perfil.',
          'Intentar acceder sin autorización a cuentas, datos o sistemas de Frencia o de otros usuarios.',
          'Interferir con el funcionamiento de la app, sobrecargarla o eludir sus medidas de seguridad.',
          'Copiar, descompilar o aplicar ingeniería inversa a la app, salvo en lo que la ley lo permita expresamente.',
          'Extraer datos de forma automatizada (scraping) ni usar la app para crear un producto que compita con ella.',
        ],
      },
    ],
  },
  {
    titulo: '8. Tu contenido',
    bloques: [
      'Las rutinas, sesiones, notas, fotos y demás datos que cargás son tuyos. Para poder prestarte el servicio, nos otorgás una licencia no exclusiva, gratuita y limitada para alojar, copiar, procesar y mostrar ese contenido, solo en la medida necesaria para que la app funcione.',
      'Si en el futuro la app permite compartir rutinas, el contenido que compartas quedará visible para quienes lo reciban, que podrán copiarlo a su propia cuenta. Esa licencia se extiende a esos usuarios para ese contenido.',
      'Podemos quitar contenido que viole estos términos. Sos responsable de tener los derechos sobre lo que subís.',
    ],
  },
  {
    titulo: '9. Propiedad intelectual',
    bloques: [
      'La app, su código, diseño, marca, logo, nombre "Frencia", catálogo de ejercicios, textos e ilustraciones pertenecen al titular o a sus licenciantes y están protegidos por la legislación de propiedad intelectual.',
      'Te otorgamos una licencia personal, limitada, revocable, no exclusiva e intransferible para usar la app en tus dispositivos, con fines personales y no comerciales, de acuerdo con estos términos. No adquirís ningún otro derecho sobre la app.',
    ],
  },
  {
    titulo: '10. Plan gratuito y suscripciones',
    bloques: [
      'Frencia ofrece un plan gratuito y puede ofrecer funciones adicionales mediante una suscripción paga (en adelante, "Suscripción"). Antes de contratar, la app te mostrará el precio, la moneda, la duración del período y lo que incluye.',
      {
        lista: [
          'Cobro: la Suscripción se contrata y se cobra a través de la App Store de Apple o de Google Play, según tu dispositivo, con el medio de pago que tengas configurado ahí. No procesamos ni guardamos los datos de tu tarjeta.',
          'Renovación automática: la Suscripción se renueva sola al final de cada período por el mismo plazo y precio, salvo que la canceles al menos 24 horas antes de que termine el período en curso.',
          'Cancelación: podés cancelarla en cualquier momento desde la configuración de suscripciones de tu cuenta de Apple o Google. Seguís teniendo acceso hasta el final del período ya pagado.',
          'Pruebas gratuitas: si ofrecemos un período de prueba, al terminar se convierte en una Suscripción paga, salvo que la canceles antes. La porción no usada de una prueba se pierde al contratar.',
          'Cambios de precio: te avisaremos con anticipación de cualquier aumento. Si no estás de acuerdo, podés cancelar antes de la siguiente renovación.',
        ],
      },
      `Derecho de revocación: de acuerdo con el artículo 34 de la Ley 24.240 de Defensa del Consumidor y el artículo 1110 del Código Civil y Comercial, podés revocar la contratación dentro de los 10 días corridos desde que la hiciste, sin costo ni responsabilidad. Para hacerlo, pedí el reembolso a Apple o Google, según corresponda, o escribinos a ${EMAIL_CONTACTO} y te ayudamos con el trámite.`,
      'Fuera de ese plazo, los reembolsos se rigen por las políticas de Apple o Google, que son quienes realizan el cobro, sin perjuicio de los derechos que te reconoce la ley.',
      'Eliminar la app o tu cuenta no cancela la Suscripción. Tenés que cancelarla desde la tienda.',
    ],
  },
  {
    titulo: '11. Datos personales',
    bloques: [
      'Para funcionar, Frencia trata datos personales como tu email, nombre, foto de perfil, fecha de nacimiento, sexo, peso, altura y tus registros de entrenamiento. Algunos de estos datos se relacionan con tu salud y los tratamos con especial cuidado.',
      'El tratamiento se rige por la Ley 25.326 de Protección de los Datos Personales y se detalla en nuestra Política de Privacidad, que forma parte de estos términos. Allí se explica qué datos recolectamos, para qué, con quién los compartimos y cómo ejercer tus derechos de acceso, rectificación y supresión.',
    ],
  },
  {
    titulo: '12. Disponibilidad y cambios del servicio',
    bloques: [
      'Hacemos lo posible para que Frencia esté disponible y funcione bien, pero no garantizamos que funcione sin interrupciones ni errores. Puede haber cortes por mantenimiento, fallas técnicas o causas ajenas a nosotros, como problemas en tu conexión o en los proveedores que usamos.',
      'Podemos modificar, suspender o discontinuar la app o parte de ella. Si discontinuamos Frencia, te avisaremos con anticipación razonable y te daremos la posibilidad de pedir una copia de tus datos. Si tenías una Suscripción vigente, se aplicará lo previsto por la ley y por la tienda correspondiente.',
      'Te recomendamos mantener la app actualizada: algunas versiones antiguas pueden dejar de funcionar.',
    ],
  },
  {
    titulo: '13. Eliminación de la cuenta',
    bloques: [
      'Podés eliminar tu cuenta cuando quieras desde Configuración, en la opción "Eliminación de cuenta".',
      {
        lista: [
          'Al solicitarlo, la cuenta queda programada para eliminarse a los 30 días. Durante ese plazo podés recuperarla iniciando sesión.',
          'Pasados los 30 días, se eliminan de forma definitiva tu cuenta, tu perfil, tus rutinas, tus sesiones y tu historial. No se pueden recuperar.',
          'Eliminar la cuenta no cancela una Suscripción activa: cancelala antes desde la tienda.',
        ],
      },
    ],
  },
  {
    titulo: '14. Suspensión por incumplimiento',
    bloques: [
      'Si incumplís estos términos, podemos suspender o cerrar tu cuenta. Salvo en casos graves o cuando la ley lo impida, te avisaremos antes, explicándote el motivo, y podrás responder a través del email de contacto.',
    ],
  },
  {
    titulo: '15. Responsabilidad',
    bloques: [
      'En la medida permitida por la ley, el titular no es responsable por:',
      {
        lista: [
          'Lesiones, daños a la salud o accidentes derivados de la realización de ejercicios o del uso que hagas de la información de la app.',
          'Decisiones que tomes en base a los datos, cálculos o estimaciones de la app.',
          'Interrupciones, demoras o pérdida de datos causadas por fallas de tu dispositivo, tu conexión, las tiendas de aplicaciones o terceros ajenos a nosotros.',
          'El uso indebido de tu cuenta por parte de terceros cuando no hayas cuidado tus credenciales.',
        ],
      },
      'Nada de lo anterior limita los derechos que te reconoce la Ley 24.240 de Defensa del Consumidor ni la responsabilidad que no pueda excluirse según la ley aplicable.',
    ],
  },
  {
    titulo: '16. Cambios en estos términos',
    bloques: [
      'Podemos actualizar estos términos para reflejar cambios en la app, en la ley o en nuestra forma de trabajar. La fecha de vigencia siempre figura al principio del texto.',
      'Si los cambios son importantes, te avisaremos dentro de la app o por email con al menos 15 días de anticipación. Cuando una versión nueva entre en vigencia, la app te va a pedir que la aceptes de forma expresa para seguir usándola, y guardaremos esa nueva aceptación. Si no estás de acuerdo, podés no aceptarla, dejar de usar Frencia y pedirnos que eliminemos tu cuenta.',
    ],
  },
  {
    titulo: '17. Apple y Google',
    bloques: [
      'Si descargaste Frencia desde la App Store, reconocés que estos términos se celebran entre vos y el titular, y no con Apple Inc. Apple no es responsable de la app ni de su contenido, no tiene obligación de brindar mantenimiento ni soporte, y no responde por reclamos relacionados con la app, incluidos los de responsabilidad por producto, incumplimiento legal o regulatorio, o infracción de derechos de propiedad intelectual de terceros. Si la app no cumple con alguna garantía aplicable, podés avisarle a Apple, que podrá reembolsarte el precio pagado, si lo hubiera. Apple y sus subsidiarias son terceros beneficiarios de estos términos y pueden hacerlos valer frente a vos.',
      'Si la descargaste desde Google Play, también se aplican las condiciones de Google Play para el uso de la tienda y los pagos.',
      'En caso de conflicto entre estos términos y las reglas de uso de la tienda desde la que descargaste la app, prevalecen estas últimas en lo que respecta a esa tienda.',
    ],
  },
  {
    titulo: '18. Ley aplicable y jurisdicción',
    bloques: [
      'Estos términos se rigen por las leyes de la República Argentina.',
      'Cualquier controversia se someterá a los tribunales ordinarios de la ciudad de Córdoba, provincia de Córdoba. Si sos consumidor, también podés iniciar tu reclamo ante los tribunales de tu domicilio, conforme al artículo 36 de la Ley 24.240, y ante las autoridades de defensa del consumidor, como la Ventanilla Única Federal de Defensa del Consumidor o la autoridad de tu provincia.',
    ],
  },
  {
    titulo: '19. Disposiciones generales',
    bloques: [
      'Si alguna cláusula de estos términos se considera inválida, el resto sigue vigente. Que no exijamos el cumplimiento de alguna cláusula en un momento dado no implica que renunciemos a hacerlo después.',
      'Estos términos, junto con la Política de Privacidad, constituyen el acuerdo completo entre vos y el titular sobre el uso de Frencia.',
    ],
  },
  {
    titulo: '20. Contacto',
    bloques: [
      `Para consultas, reclamos o para ejercer cualquiera de tus derechos, escribinos a ${EMAIL_CONTACTO}. Respondemos dentro de un plazo razonable, que no supera los 10 días hábiles.`,
    ],
  },
];
