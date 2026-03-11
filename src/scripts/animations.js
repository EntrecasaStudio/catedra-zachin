import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize all GSAP animations.
 * Called on every page load (including view transitions).
 */
export function initAnimations() {
  // Kill previous ScrollTriggers to avoid duplicates on navigation
  ScrollTrigger.getAll().forEach(t => t.kill());

  // --- Scroll Reveal: fade-in + slide up ---
  gsap.utils.toArray('[data-animate]').forEach(el => {
    gsap.set(el, { clearProps: 'all' });
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        }
      }
    );
  });

  // --- Stagger children ---
  gsap.utils.toArray('[data-animate-stagger]').forEach(parent => {
    const children = Array.from(parent.children);
    children.forEach(c => gsap.set(c, { clearProps: 'all' }));
    gsap.fromTo(children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        overwrite: 'auto',
        scrollTrigger: {
          trigger: parent,
          start: 'top 85%',
          once: true,
        }
      }
    );
  });

  // --- Hero: add class to trigger CSS animations ---
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.classList.add('hero--animated');
  }

  // --- Page header: add class to trigger CSS animations ---
  const pageHeader = document.querySelector('.page-header');
  if (pageHeader && !hero) {
    pageHeader.classList.add('page-header--animated');
  }
}
