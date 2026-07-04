// Multimedia de la galería (fotos + videos), agrupada por categoría.
// Fuente única de datos, consumida por /galeria (propuesta).

/**
 * @typedef {Object} GaleriaItem
 * @property {'foto'|'video'} tipo
 * @property {string} src
 * @property {string} alt
 * @property {string} categoria
 */

/** @type {GaleriaItem[]} */
export const items = [
  // Jornada - fotos
  { tipo: 'foto', src: '/images/galeria/jornada/IMG_3863.jpg', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'foto', src: '/images/galeria/jornada/IMG_3868.jpg', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'foto', src: '/images/galeria/jornada/IMG_3874.jpg', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'foto', src: '/images/galeria/jornada/IMG_4007.jpg', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'foto', src: '/images/galeria/jornada/IMG_1481.jpg', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'foto', src: '/images/galeria/jornada/IMG_1531.jpg', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'foto', src: '/images/galeria/jornada/IMG_4279.jpg', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'foto', src: '/images/galeria/jornada/IMG_4296.jpg', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'foto', src: '/images/galeria/jornada/IMG_9721.jpg', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'foto', src: '/images/galeria/jornada/IMG_9739.jpg', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  // Jornada - videos
  { tipo: 'video', src: '/images/galeria/jornada/IMG_0024.mp4', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'video', src: '/images/galeria/jornada/IMG_0028.mp4', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'video', src: '/images/galeria/jornada/IMG_0036.mp4', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'video', src: '/images/galeria/jornada/IMG_0038.mp4', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'video', src: '/images/galeria/jornada/IMG_4326.mp4', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'video', src: '/images/galeria/jornada/IMG_4461.mp4', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'video', src: '/images/galeria/jornada/IMG_4477.mp4', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  { tipo: 'video', src: '/images/galeria/jornada/IMG_9852.mp4', alt: 'Jornada Zachin Live', categoria: 'jornada' },
  // Taller - fotos
  { tipo: 'foto', src: '/images/galeria/taller/IMG_2825.jpg', alt: 'Taller de producción', categoria: 'taller' },
  { tipo: 'foto', src: '/images/galeria/taller/IMG_5407.jpg', alt: 'Taller de producción', categoria: 'taller' },
  { tipo: 'foto', src: '/images/galeria/taller/taller.jpg', alt: 'Taller de producción', categoria: 'taller' },
  // Taller - videos
  { tipo: 'video', src: '/images/galeria/taller/IMG_3201.mp4', alt: 'Taller de producción', categoria: 'taller' },
  { tipo: 'video', src: '/images/galeria/taller/IMG_4056.mp4', alt: 'Taller de producción', categoria: 'taller' },
  { tipo: 'video', src: '/images/galeria/taller/IMG_8964.mp4', alt: 'Taller de producción', categoria: 'taller' },
  // Clase - fotos
  { tipo: 'foto', src: '/images/galeria/clase/IMG_4048.jpg', alt: 'Clase de tecnología', categoria: 'clase' },
  { tipo: 'foto', src: '/images/galeria/clase/lean.jpg', alt: 'Clase de tecnología', categoria: 'clase' },
  // Clase - videos
  { tipo: 'video', src: '/images/galeria/clase/IMG_1042.mp4', alt: 'Clase de tecnología', categoria: 'clase' },
  { tipo: 'video', src: '/images/galeria/clase/IMG_9965.mp4', alt: 'Clase de tecnología', categoria: 'clase' },
  // TPs - fotos
  { tipo: 'foto', src: '/images/galeria/tps/IMG_3529.jpg', alt: 'Trabajos prácticos', categoria: 'tps' },
  { tipo: 'foto', src: '/images/galeria/tps/IMG_4073.jpg', alt: 'Trabajos prácticos', categoria: 'tps' },
  { tipo: 'foto', src: '/images/galeria/tps/IMG_4087.jpg', alt: 'Trabajos prácticos', categoria: 'tps' },
  { tipo: 'foto', src: '/images/galeria/tps/IMG_4130.jpg', alt: 'Trabajos prácticos', categoria: 'tps' },
  { tipo: 'foto', src: '/images/galeria/tps/IMG_4131.jpg', alt: 'Trabajos prácticos', categoria: 'tps' },
  { tipo: 'foto', src: '/images/galeria/tps/IMG_5138.jpg', alt: 'Trabajos prácticos', categoria: 'tps' },
  // TPs - videos
  { tipo: 'video', src: '/images/galeria/tps/IMG_0764.mp4', alt: 'Trabajos prácticos', categoria: 'tps' },
  { tipo: 'video', src: '/images/galeria/tps/IMG_0776.mp4', alt: 'Trabajos prácticos', categoria: 'tps' },
  { tipo: 'video', src: '/images/galeria/tps/IMG_0780.mp4', alt: 'Trabajos prácticos', categoria: 'tps' },
  { tipo: 'video', src: '/images/galeria/tps/IMG_0841.mp4', alt: 'Trabajos prácticos', categoria: 'tps' },
  { tipo: 'video', src: '/images/galeria/tps/IMG_9443.mp4', alt: 'Trabajos prácticos', categoria: 'tps' },
];

export const categorias = ['todas', 'jornada', 'taller', 'clase', 'tps'];

/** Cuenta de items por categoría (incluye "todas"). */
export function countByCategoria(list = items) {
  const counts = { todas: list.length };
  for (const cat of categorias.filter((c) => c !== 'todas')) {
    counts[cat] = list.filter((i) => i.categoria === cat).length;
  }
  return counts;
}
