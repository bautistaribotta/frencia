/* Silueta del ticket del resumen como path SVG: esquinas de arriba redondeadas,
   una muesca a cada lado a la altura de la perforacion y el borde de abajo
   festoneado. Los recortes son agujeros de verdad en la forma, no circulos
   pintados encima: asi la sombra sigue el contorno y no dibuja un rectangulo
   debajo de los festones. */

export interface MedidasSilueta {
  ancho: number;
  alto: number;
  /** Radio de las esquinas de arriba. */
  radio: number;
  /** Altura del centro de las muescas laterales, desde arriba. */
  yMuesca: number;
  /** Radio de las muescas y de los festones. */
  radioRecorte: number;
  festones: number;
  /** Margen a cada lado antes del primer y del ultimo feston. */
  margenFestones: number;
}

/** Centros en x de los festones, repartidos como un space-between. */
export function centrosFestones(m: MedidasSilueta): number[] {
  const { ancho, festones, margenFestones, radioRecorte: r } = m;
  if (festones <= 0) return [];
  const primero = margenFestones + r;
  if (festones === 1) return [ancho / 2];
  const paso = (ancho - 2 * primero) / (festones - 1);
  return Array.from({ length: festones }, (_, i) => primero + i * paso);
}

const n = (v: number) => String(Math.round(v * 100) / 100);

/** Path cerrado en sentido horario, empezando por la esquina de arriba a la izquierda. */
export function pathSilueta(m: MedidasSilueta): string {
  const { ancho: w, alto: h, radio: R, yMuesca: y, radioRecorte: r } = m;
  const arco = (x: number, yy: number, radio = r) => `A ${n(radio)} ${n(radio)} 0 0 0 ${n(x)} ${n(yy)}`;
  const esquina = (x: number, yy: number) => `A ${n(R)} ${n(R)} 0 0 1 ${n(x)} ${n(yy)}`;

  const partes = [
    `M 0 ${n(R)}`,
    esquina(R, 0),
    `L ${n(w - R)} 0`,
    esquina(w, R),
    // Muesca derecha: baja por el borde y entra hacia el ticket.
    `L ${n(w)} ${n(y - r)}`,
    arco(w, y + r),
    `L ${n(w)} ${n(h)}`,
  ];

  // Festones de derecha a izquierda, cada uno mordiendo hacia arriba.
  for (const cx of centrosFestones(m).reverse()) {
    partes.push(`L ${n(cx + r)} ${n(h)}`, arco(cx - r, h));
  }

  partes.push(
    `L 0 ${n(h)}`,
    // Muesca izquierda: sube por el borde y entra hacia el ticket.
    `L 0 ${n(y + r)}`,
    arco(0, y - r),
    'Z',
  );
  return partes.join(' ');
}
