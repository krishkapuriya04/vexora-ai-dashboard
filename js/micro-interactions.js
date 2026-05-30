/**
 * VEXORA Micro-Interactions
 * Premium UX: magnetic cards, button press, chart reveal, particles, KPI counters.
 */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Initialize all micro-interactions
 */
export function initMicroInteractions() {
  if (!REDUCED_MOTION) {
    initMagneticCards();
    initParticles();
  }
  initButtonPress();
  initChartReveal();
  initSidebarHover();
  initKPICounters();
}

/**
 * Subtle magnetic hover on cards
 */
function initMagneticCards() {
  const cards = document.querySelectorAll('.magnetic-card, .kpi-card, .widget, .glass-card.float-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      card.style.transform = `translate(${x * 0.02}px, ${y * 0.02}px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/**
 * Button press scale feedback
 */
function initButtonPress() {
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.btn, .topbar__action, .sidebar__link, .command-item');
    if (btn) btn.classList.add('is-pressed');
  });

  document.addEventListener('pointerup', () => {
    document.querySelectorAll('.is-pressed').forEach((el) => el.classList.remove('is-pressed'));
  });

  document.addEventListener('pointercancel', () => {
    document.querySelectorAll('.is-pressed').forEach((el) => el.classList.remove('is-pressed'));
  });
}

/**
 * Stagger chart canvas reveal after page load
 */
function initChartReveal() {
  document.querySelectorAll('.widget__chart canvas, .analytics-preview__chart-area canvas').forEach((canvas, i) => {
    const wrapper = canvas.closest('.widget__chart, .analytics-preview__chart-area, .widget');
    if (wrapper) {
      wrapper.classList.add('chart-loading');
      setTimeout(() => {
        wrapper.classList.remove('chart-loading');
        wrapper.classList.add('chart-revealed');
      }, 400 + i * 120);
    }
  });
}

/**
 * Sidebar link slide indicator
 */
function initSidebarHover() {
  document.querySelectorAll('.sidebar__link').forEach((link) => {
    link.addEventListener('mouseenter', () => link.classList.add('is-hovered'));
    link.addEventListener('mouseleave', () => link.classList.remove('is-hovered'));
  });
}

/**
 * Animate KPI values on dashboard
 */
function initKPICounters() {
  document.querySelectorAll('.kpi-card__value[data-animate]').forEach((el) => {
    const target = parseFloat(el.dataset.animate);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = `${prefix}${decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString()}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(tick);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(el);
  });
}

/**
 * Lightweight particle system — performance-conscious
 */
function initParticles() {
  const container = document.getElementById('particle-canvas');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId = null;
  let visible = true;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.min(35, Math.floor(window.innerWidth / 40));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      o: Math.random() * 0.35 + 0.1,
    }));
  }

  function draw() {
    if (!visible) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(108, 99, 255, ${p.o})`;
      ctx.fill();
    });
    animId = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => { resize(); createParticles(); });
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible && !animId) draw();
    if (!visible && animId) { cancelAnimationFrame(animId); animId = null; }
  });
}

/**
 * Render empty state HTML
 * @param {Object} config
 * @returns {string}
 */
export function renderEmptyState({ icon, title, description, action }) {
  return `
    <div class="empty-state" role="status">
      <div class="empty-state__illustration" aria-hidden="true">${icon}</div>
      <h3 class="empty-state__title">${title}</h3>
      <p class="empty-state__desc">${description}</p>
      ${action ? `<div class="empty-state__action">${action}</div>` : ''}
    </div>
  `;
}
