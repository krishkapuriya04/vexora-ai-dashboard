/**
 * VEXORA Chart Utilities
 * Shared Chart.js configuration and helper functions.
 */

/** Premium tooltip styling */
export const CHART_TOOLTIP = {
  enabled: true,
  backgroundColor: 'rgba(11, 16, 32, 0.96)',
  titleColor: '#F8FAFC',
  titleFont: { size: 12, weight: '600', family: 'Inter' },
  bodyColor: '#94A3B8',
  bodyFont: { size: 11, family: 'Inter' },
  borderColor: 'rgba(108, 99, 255, 0.25)',
  borderWidth: 1,
  padding: 14,
  cornerRadius: 10,
  displayColors: true,
  boxWidth: 8,
  boxHeight: 8,
  boxPadding: 4,
  usePointStyle: true,
  caretSize: 6,
};

/** Smooth chart entrance animation */
export const CHART_ANIMATION = {
  duration: 1200,
  easing: 'easeOutQuart',
};

/** Default Chart.js options for dark-theme dashboards */
export const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: CHART_ANIMATION,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: CHART_TOOLTIP,
  },
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
      ticks: { color: '#64748B', font: { size: 11, family: 'Inter' }, padding: 8 },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
      ticks: { color: '#64748B', font: { size: 11, family: 'Inter' }, padding: 8 },
      border: { display: false },
    },
  },
};

/** Chart color palette aligned with design tokens */
export const CHART_COLORS = {
  primary: '#6C63FF',
  secondary: '#8B5CF6',
  accent: '#00E5FF',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  palette: ['#6C63FF', '#8B5CF6', '#00E5FF', '#22C55E', '#F59E0B', '#EF4444'],
};

/**
 * Standard legend configuration
 * @param {'top'|'bottom'|'left'|'right'} [position='bottom']
 * @returns {Object}
 */
export function getLegendOptions(position = 'bottom') {
  return {
    display: true,
    position,
    labels: {
      color: '#94A3B8',
      boxWidth: 10,
      boxHeight: 10,
      padding: 16,
      font: { size: 11, family: 'Inter' },
      usePointStyle: true,
      pointStyle: 'circle',
    },
  };
}

/**
 * Hover highlight for bar/line datasets
 * @param {string} [color=CHART_COLORS.primary]
 * @returns {Object}
 */
export function getHoverOptions(color = CHART_COLORS.primary) {
  return {
    mode: 'index',
    intersect: false,
  };
}

/**
 * Create a vertical gradient fill for area/line charts
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} colorStart
 * @param {string} colorEnd
 * @param {number} [height=300]
 * @returns {CanvasGradient}
 */
export function createGradient(ctx, colorStart, colorEnd, height = 300) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
}

/**
 * Merge Chart.js options with defaults
 * @param {Object} overrides
 * @returns {Object}
 */
export function mergeChartOptions(overrides = {}) {
  return {
    ...CHART_DEFAULTS,
    ...overrides,
    plugins: { ...CHART_DEFAULTS.plugins, ...overrides.plugins },
    scales: overrides.scales || CHART_DEFAULTS.scales,
  };
}

/**
 * Format a numeric value for display
 * @param {number} value
 * @param {'currency'|'percent'|'number'} [format='number']
 * @returns {string}
 */
export function formatValue(value, format = 'number') {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (format === 'percent') {
    return `${value}%`;
  }
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Initialize a sparkline mini chart on a canvas element
 * @param {HTMLCanvasElement} canvas
 * @param {number[]} data
 * @param {string} [color='#6C63FF']
 * @returns {Chart|undefined}
 */
export function initSparkline(canvas, data, color = CHART_COLORS.primary) {
  if (!canvas || typeof Chart === 'undefined') return undefined;

  const ctx = canvas.getContext('2d');
  const gradient = createGradient(ctx, `${color}40`, `${color}00`, 48);

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data,
        borderColor: color,
        backgroundColor: gradient,
        borderWidth: 1.5,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false },
      },
      animation: { duration: 900, easing: 'easeOutQuart' },
    },
  });
}
