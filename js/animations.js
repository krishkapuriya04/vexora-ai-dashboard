/**
 * VEXORA Animations Module
 * Scroll reveals, counter animations, and intersection observer utilities.
 */

const VexoraAnimations = (() => {
  let revealObserver = null;
  let counterObserver = null;

  /**
   * Initialize scroll-triggered reveal animations
   */
  function initRevealAnimations() {
    const elements = document.querySelectorAll('.reveal');

    if (!elements.length) return;

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => revealObserver.observe(el));
  }

  /**
   * Animate numeric counters when they enter the viewport
   */
  function initCounterAnimations() {
    const counters = document.querySelectorAll('[data-count]');

    if (!counters.length) return;

    counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => counterObserver.observe(el));
  }

  /**
   * Animate a single counter element to its target value
   * @param {HTMLElement} element
   */
  function animateCounter(element) {
    const target = parseFloat(element.dataset.count);
    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';
    const decimals = parseInt(element.dataset.decimals || '0', 10);
    const duration = parseInt(element.dataset.duration || '2000', 10);
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      element.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * Hide loading screen after page assets are ready
   */
  function initLoader() {
    const loader = document.getElementById('loader');

    if (!loader) return;

    const minDisplayTime = 1800;
    const startTime = performance.now();

    window.addEventListener('load', () => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        loader.classList.add('is-hidden');
        document.body.style.overflow = '';
      }, remaining);
    });
  }

  /**
   * Smooth scroll for anchor links
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');

        if (targetId === '#') return;

        const target = document.querySelector(targetId);

        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });

          const mobileMenu = document.getElementById('mobile-menu');
          const toggle = document.querySelector('.navbar__toggle');

          if (mobileMenu?.classList.contains('is-open')) {
            mobileMenu.classList.remove('is-open');
            toggle?.classList.remove('is-active');
          }
        }
      });
    });
  }

  /**
   * Initialize all animation modules
   */
  function init() {
    initLoader();
    initRevealAnimations();
    initCounterAnimations();
    initSmoothScroll();
  }

  return { init, animateCounter };
})();

export default VexoraAnimations;
