/**
 * VEXORA Reusable UI Components
 * Factory functions for dynamically rendered UI elements.
 * Used for future dashboard pages and modals.
 */

/**
 * Create a KPI metric card element
 * @param {Object} config
 * @param {string} config.label - Metric label
 * @param {string} config.value - Display value
 * @param {string} config.change - Change percentage text
 * @param {'up'|'down'} config.trend - Trend direction
 * @returns {HTMLElement}
 */
export function createMetricCard({ label, value, change, trend = 'up' }) {
  const card = document.createElement('div');
  card.className = 'hero__mini-card';
  card.innerHTML = `
    <div class="hero__mini-card-label">${label}</div>
    <div class="hero__mini-card-value">${value}</div>
    <div class="hero__mini-card-change hero__mini-card-change--${trend}">${change}</div>
  `;
  return card;
}

/**
 * Create an AI insight item element
 * @param {Object} config
 * @param {string} config.tag - Insight category tag
 * @param {'opportunity'|'alert'|'trend'} config.type - Tag styling variant
 * @param {string} config.title - Insight headline
 * @param {string} config.text - Insight description
 * @returns {HTMLElement}
 */
export function createInsightItem({ tag, type, title, text }) {
  const item = document.createElement('article');
  item.className = 'ai-insight-item';
  item.innerHTML = `
    <span class="ai-insight-item__tag ai-insight-item__tag--${type}">${tag}</span>
    <h4 class="ai-insight-item__title">${title}</h4>
    <p class="ai-insight-item__text">${text}</p>
  `;
  return item;
}

/**
 * Create a feature card element
 * @param {Object} config
 * @param {string} config.icon - Emoji or icon character
 * @param {string} config.title - Feature title
 * @param {string} config.description - Feature description
 * @returns {HTMLElement}
 */
export function createFeatureCard({ icon, title, description }) {
  const card = document.createElement('article');
  card.className = 'feature-card glass-card reveal';
  card.innerHTML = `
    <div class="feature-card__icon" aria-hidden="true">${icon}</div>
    <h3 class="feature-card__title">${title}</h3>
    <p class="feature-card__description">${description}</p>
  `;
  return card;
}

/**
 * Create a testimonial card element
 * @param {Object} config
 * @param {string} config.initials - Author initials for avatar
 * @param {string} config.name - Author name
 * @param {string} config.role - Author role and company
 * @param {string} config.quote - Testimonial text
 * @param {number} [config.stars=5] - Star rating count
 * @returns {HTMLElement}
 */
export function createTestimonialCard({ initials, name, role, quote, stars = 5 }) {
  const card = document.createElement('article');
  card.className = 'testimonial-card glass-card reveal';
  card.innerHTML = `
    <div class="testimonial-card__stars" aria-label="${stars} out of 5 stars">${'★'.repeat(stars)}</div>
    <blockquote class="testimonial-card__quote">"${quote}"</blockquote>
    <div class="testimonial-card__author">
      <div class="testimonial-card__avatar" aria-hidden="true">${initials}</div>
      <div>
        <div class="testimonial-card__name">${name}</div>
        <div class="testimonial-card__role">${role}</div>
      </div>
    </div>
  `;
  return card;
}

/**
 * Create a pricing tier card element
 * @param {Object} config
 * @param {string} config.name - Plan name
 * @param {string} config.description - Plan description
 * @param {number} config.price - Monthly price
 * @param {string[]} config.features - List of included features
 * @param {boolean} [config.featured=false] - Highlight as recommended plan
 * @returns {HTMLElement}
 */
export function createPricingCard({ name, description, price, features, featured = false }) {
  const card = document.createElement('article');
  card.className = `pricing-card glass-card reveal${featured ? ' pricing-card--featured' : ''}`;
  card.innerHTML = `
    <h3 class="pricing-card__name">${name}</h3>
    <p class="pricing-card__description">${description}</p>
    <div class="pricing-card__price">
      <span class="pricing-card__amount">$${price}</span>
      <span class="pricing-card__period">/month</span>
    </div>
    <ul class="pricing-card__features">
      ${features.map((f) => `
        <li class="pricing-card__feature">
          <span class="pricing-card__feature-icon" aria-hidden="true">✓</span>
          ${f}
        </li>
      `).join('')}
    </ul>
    <button class="btn ${featured ? 'btn--primary' : 'btn--secondary'} pricing-card__cta">
      Get Started
    </button>
  `;
  return card;
}
