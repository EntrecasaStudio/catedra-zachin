// Plantel docente de la Cátedra Zachin.
// Fuente única de datos, consumida por /equipo (propuesta) y reutilizable en el sitio.

/**
 * @typedef {Object} Docente
 * @property {string} nombre
 * @property {string} rol
 * @property {string} nivel
 * @property {string} foto
 */

/** @type {Docente[]} */
export const docentes = [
  // Adjuntos
  { nombre: 'Daniela Vulcano', rol: 'Adjunta', nivel: 'Nivel 1', foto: '/images/docentes/Adjunta-Daniela-Vulcano.png' },
  { nombre: 'Leandro Barales', rol: 'Adjunto', nivel: 'Nivel 2', foto: '/images/docentes/Adjunto-Leandro-Barales.png' },
  // JTPs
  { nombre: 'Paula Rincón', rol: 'JTP', nivel: 'Nivel 1', foto: '/images/docentes/JTP-Paula-Rincon.png' },
  { nombre: 'Gabriel Gutiérrez', rol: 'JTP', nivel: 'Nivel 1', foto: '/images/docentes/JTP-Gabriel-Gutierrez.jpg' },
  { nombre: 'Julieta Casela', rol: 'JTP', nivel: 'Nivel 2', foto: '/images/docentes/JTP-Julieta-Casela.png' },
  { nombre: 'Karina Kusner', rol: 'JTP', nivel: 'Nivel 2', foto: '/images/docentes/JTP-Karina-Kusner.png' },
  // Docentes - Nivel 1
  { nombre: 'Azul Moreno', rol: 'Docente', nivel: 'Nivel 1', foto: '/images/docentes/DOCENTE-Azul-Moreno.png', oculto: true },
  { nombre: 'Camila Vidal Cabrera', rol: 'Docente', nivel: 'Nivel 1', foto: '/images/docentes/DOCENTE-Camila-Vidal-Cabrera.png' },
  { nombre: 'Juan Hileger', rol: 'Docente', nivel: 'Nivel 1', foto: '/images/docentes/DOCENTE-Juan-Hileger.png' },
  { nombre: 'Juan Maffeo', rol: 'Docente', nivel: 'Nivel 1', foto: '/images/docentes/DOCENTE-Juan-Maffeo.png' },
  { nombre: 'Laura Romano', rol: 'Docente', nivel: 'Nivel 1', foto: '/images/docentes/DOCENTE-Laura-Romano.png' },
  { nombre: 'Lucas Belfiore', rol: 'Docente', nivel: 'Nivel 1', foto: '/images/docentes/DOCENTE-Lucas-Belfiore.png' },
  { nombre: 'Valentina Scarfo', rol: 'Docente', nivel: 'Nivel 1', foto: '/images/docentes/DOCENTE-Valentina-Scarfo.png' },
  // Docentes - Nivel 2
  { nombre: 'Antonella Scardino', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Antonella-Scardino.png' },
  { nombre: 'Catalina Somoza', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Catalina-Somoza.png' },
  { nombre: 'Emilia Madroñal', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Emilia-Madroñal.png' },
  { nombre: 'Fiorella Nucara', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Fiorella-Nucara.png' },
  { nombre: 'Greta Marazzi', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Greta-Marazzi.png' },
  { nombre: 'Josefina Calvo', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Josefina-Calvo.png' },
  { nombre: 'Josefina Tamargo', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Josefina-Tamargo.png' },
  { nombre: 'Lucía Tievoli', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Lucía-Tievoli.png' },
  { nombre: 'Noelia Fortunato', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Noelia-Fortunato.png' },
  { nombre: 'Rocío López Ortiz', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Rocío-Lopez-Ortiz.png' },
  { nombre: 'Romina Molina', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Romina-Molina.png' },
  // Ayudantes - Nivel 1
  { nombre: 'Alondra Márquez', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Alondra-Marquez.png' },
  { nombre: 'Iara Pizarro', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Iara-Pizarro.png' },
  { nombre: 'Leila Moreno', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Leila-Moreno.png' },
  { nombre: 'Lucía De Barbieri', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Lucia-DeBarbieri.png' },
  { nombre: 'Luciana Billoni', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Luciana-Billoni.png' },
  { nombre: 'Luis Sánchez', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Luis-Sanchez.png' },
  { nombre: 'Maite Primante', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Maite-Primante.png' },
  { nombre: 'Valeria López Matos', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Valeria-Lopez-Matos.png' },
  // Ayudantes - Nivel 2
  { nombre: 'Ana Álvarez', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Ana-Alvarez.png' },
  { nombre: 'Celeste Díaz', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Celeste-Diaz.png' },
  { nombre: 'César Flores', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Cesar-Flores.png' },
  { nombre: 'Francisco Bontempi', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Francisco-Bontempi.png' },
  { nombre: 'Guadalupe Silva', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Guadalupe-Silva.png' },
  { nombre: 'Julieta Rotman', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-julieta-Rotman.png' },
  { nombre: 'Sofía Giuliano', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Sofía-Giuliano.png' },
];

/** Agrupa el plantel por rol, respetando el orden jerárquico.
 *  Adjuntos y JTP van juntos: son pocos (2 + 4) y así llenan una sola fila en
 *  desktop (grilla de 6) en vez de dos filas semivacías. En mobile envuelven solos. */
export function groupDocentes(list = docentes) {
  // `oculto: true` esconde a alguien sin borrarlo del dato (se puede reactivar).
  const visibles = list.filter((d) => !d.oculto);
  return [
    { label: 'Adjuntos y JTP', members: visibles.filter((d) => d.rol.startsWith('Adjunt') || d.rol === 'JTP') },
    { label: 'Docentes', members: visibles.filter((d) => d.rol === 'Docente') },
    { label: 'Ayudantes', members: visibles.filter((d) => d.rol === 'Ayudante') },
  ].filter((g) => g.members.length > 0);
}
