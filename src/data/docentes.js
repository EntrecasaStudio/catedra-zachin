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
  // ── Adjuntos y JTP (cargo más alto primero, luego por nivel) ──
  { nombre: 'Daniela Vulcano', rol: 'Adjunta', nivel: 'Nivel 1', foto: '/images/docentes/Adjunta-Daniela-Vulcano.png' },
  { nombre: 'Leandro Barales', rol: 'Adjunto', nivel: 'Nivel 2', foto: '/images/docentes/Adjunto-Leandro-Barales.png' },
  { nombre: 'Gabriel Gutiérrez', rol: 'JTP', nivel: 'Nivel 1', foto: '/images/docentes/JTP-Gabriel-Gutierrez.jpg' },
  { nombre: 'Paula Rincón', rol: 'JTP', nivel: 'Nivel 1', foto: '/images/docentes/JTP-Paula-Rincon.png' },
  { nombre: 'Julieta Casela', rol: 'JTP', nivel: 'Nivel 2', foto: '/images/docentes/JTP-Julieta-Casela.png' },
  { nombre: 'Karina Kusner', rol: 'JTP', nivel: 'Nivel 2', foto: '/images/docentes/JTP-Karina-Kusner.jpg' },

  // ── Nivel 1 ──────────────────────────────────────────────
  // Docentes (por apellido)
  { nombre: 'Lucas Belfiore', rol: 'Docente', nivel: 'Nivel 1', foto: '/images/docentes/DOCENTE-Lucas-Belfiore.png' },
  { nombre: 'Juan Hileger', rol: 'Docente', nivel: 'Nivel 1', foto: '/images/docentes/DOCENTE-Juan-Hileger.jpeg' },
  { nombre: 'Juan Maffeo', rol: 'Docente', nivel: 'Nivel 1', foto: '/images/docentes/DOCENTE-Juan-Maffeo.png' },
  { nombre: 'Laura Romano', rol: 'Docente', nivel: 'Nivel 1', foto: '/images/docentes/DOCENTE-Laura-Romano.png' },
  { nombre: 'Valentina Scarfo', rol: 'Docente', nivel: 'Nivel 1', foto: '/images/docentes/DOCENTE-Valentina-Scarfo.png' },
  { nombre: 'Camila Vidal Cabrera', rol: 'Docente', nivel: 'Nivel 1', foto: '/images/docentes/DOCENTE-Camila-Vidal-Cabrera.png' },
  // Ayudantes (por apellido)
  { nombre: 'Luciana Billoni', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Luciana-Billoni.png' },
  { nombre: 'Gastón Benz', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Gaston-Benz.png' },
  { nombre: 'Dina Burin', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Dina-Burin.png' },
  { nombre: 'Lucía De Barbieri', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Lucia-DeBarbieri.png' },
  { nombre: 'Luna Jáuregui', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Luna-Jauregui.png' },
  { nombre: 'María Luna May', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Maria-Luna-May.png' },
  { nombre: 'Alondra Márquez', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Alondra-Marquez.png' },
  { nombre: 'Milagros Amarillo', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Milagros-Amarillo.png' },
  { nombre: 'Leila Moreno', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Leila-Moreno.png' },
  { nombre: 'Walter Andrés Olivero', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Walter-Andres-Olivero.png' },
  { nombre: 'Fernanda Orellana', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Fernanda-Orellana.png' },
  { nombre: 'Camila Pernia', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Camila-Pernia.png' },
  { nombre: 'Luciana Saldaño', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Luciana-Saldaño.png' },
  { nombre: 'Luis Sánchez', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Luis-Sanchez.png' },
  { nombre: 'Catalina Vega', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Catalina-Vega.png' },
  { nombre: 'Mariana Vorobioff', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Mariana-Vorobioff.png' },
  { nombre: 'Micaela Ivana Wroceawsky', rol: 'Ayudante', nivel: 'Nivel 1', foto: '/images/docentes/AYUDANTE-Micaela-Ivana-Wroceawsky.png' },

  // ── Nivel 2 ──────────────────────────────────────────────
  // Docentes (por apellido)
  { nombre: 'Daniela Borromeo', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Daniela-Borromeo.jpg' },
  { nombre: 'Josefina Calvo', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Josefina-Calvo.png' },
  { nombre: 'Rocío López Ortiz', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Rocío-Lopez-Ortiz.png' },
  { nombre: 'Emilia Madroñal', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Emilia-Madroñal.png' },
  { nombre: 'Greta Marazzi', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Greta-Marazzi.png' },
  { nombre: 'Romina Molina', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Romina-Molina.png' },
  { nombre: 'Fiorella Nucara', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Fiorella-Nucara.png' },
  { nombre: 'Noelia Fortunato', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Noelia-Fortunato.png' },
  { nombre: 'Antonella Scardino', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Antonella-Scardino.png' },
  { nombre: 'Catalina Somoza', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Catalina-Somoza.png' },
  { nombre: 'Josefina Tamargo', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Josefina-Tamargo.png' },
  { nombre: 'Lucía Tievoli', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Lucía-Tievoli.png' },
  { nombre: 'Zack Zamaro', rol: 'Docente', nivel: 'Nivel 2', foto: '/images/docentes/DOCENTE-Zack-Zamaro.jpeg' },
  // Ayudantes (por apellido)
  { nombre: 'Ana Álvarez', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Ana-Alvarez.png' },
  { nombre: 'Francisco Bontempi', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Francisco-Bontempi.png' },
  { nombre: 'César Flores', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Cesar-Flores.png' },
  { nombre: 'Alexandra García', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Alexandra-Garcia.png' },
  { nombre: 'Sofía Giuliano', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Sofía-Giuliano.png' },
  { nombre: 'Gina Mollo', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Gina-Mollo.png' },
  { nombre: 'Candelaria Moreno', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Candelaria-Moreno.png' },
  { nombre: 'Julieta Rotman', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-julieta-Rotman.png' },
  { nombre: 'Bianca Sforsini', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Bianca-Sforsini.png' },
  { nombre: 'Guadalupe Silva', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Guadalupe-Silva.png' },
  { nombre: 'Maia Bank', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Maia-Bank.png' },
  { nombre: 'Marianne Weder Coppa', rol: 'Ayudante', nivel: 'Nivel 2', foto: '/images/docentes/AYUDANTE-Marianne-Weder-Coppa.png' },
];

// Ajustes de foto para emparejar el set (revisado con dirección de arte).
//  `fix`   → brillo/contraste (empareja exposición; el set es bimodal, no sirve un
//            brillo global). `zoom` + `origin` → reencuadre por CSS (acerca la cabeza).
const ajustesFoto = {
  // Reencuadre (cabeza chica / aire de más), con su corrección de exposición
  'Karina Kusner': { zoom: 1.18, origin: '50% 40%' },
  'Luciana Billoni': { zoom: 1.2, origin: '47% 40%' },
  'Julieta Casela': { zoom: 1.2, origin: '49% 38%' },
  'Luis Sánchez': { zoom: 1.15, origin: '50% 38%' },
  'Leila Moreno': { zoom: 1.18, origin: '50% 40%' },
};
for (const d of docentes) {
  if (ajustesFoto[d.nombre]) Object.assign(d, ajustesFoto[d.nombre]);
}

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
