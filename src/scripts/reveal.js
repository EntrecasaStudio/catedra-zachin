/**
 * reveal.js — aparición en cascada por scroll (IntersectionObserver + CSS).
 *
 * Progresivo: el contenido es visible por defecto. Sólo se oculta-y-revela si
 * <html> tiene `.pz-reveal-ready` (que el layout setea pre-paint, salvo
 * prefers-reduced-motion). Si el JS no corre, todo se ve igual.
 *
 * Uso declarativo:
 *  - `data-reveal` en el elemento a revelar.
 *  - `data-reveal-group` en un contenedor: sus hijos directos con `data-reveal`
 *    reciben un delay escalonado (cascada).
 */
export function initReveal() {
  const root = document.documentElement;
  if (!root.classList.contains('pz-reveal-ready')) return; // reduced-motion / no-JS
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  // Delays escalonados a los hijos directos de cada grupo
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    group.querySelectorAll(':scope > [data-reveal]').forEach((child, i) => {
      child.style.setProperty('--pz-reveal-delay', `${i * 70}ms`);
    });
  });

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-revealed');
        obs.unobserve(e.target); // se revela una vez
      });
    },
    // threshold 0: revela apenas cualquier parte entra (los elementos altos,
    // como el grid de galería, con 0.15 no llegaban al umbral hasta scrollear).
    { threshold: 0, rootMargin: '0px 0px -10% 0px' }
  );

  els.forEach((el) => io.observe(el));
  document.addEventListener('astro:before-swap', () => io.disconnect(), { once: true });
}
