/**
 * VEXORA Application Module
 * Main entry point — initializes charts, navigation, and app state.
 */

import VexoraTheme from './theme.js';
import VexoraAnimations from './animations.js';

/** Shared Chart.js defaults for consistent dark-theme styling */
const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(19, 26, 46, 0.95)',
      titleColor: '#F8FAFC',
      bodyColor: '#94A3B8',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.04)' },
      ticks: { color: '#64748B', font: { size: 11 } },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.04)' },
      ticks: { color: '#64748B', font: { size: 11 } },
      border: { display: false },
    },
  },
};

/**
 * Mock data for landing page charts
 */
const MOCK_DATA = {
  revenue: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [42, 48, 55, 52, 61, 68, 72, 78, 85, 82, 91, 98],
  },
  analytics: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    sessions: [12400, 14200, 13800, 15600, 16200, 9800, 8400],
    conversions: [420, 510, 480, 580, 620, 340, 290],
  },
  aiTrends: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    predicted: [72, 78, 85, 94],
    actual: [70, 76, 82, 88],
  },
  dashboard: {
    labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
    values: [35, 28, 18, 12, 7],
  },
};

/**
 * Create gradient fill for line/area charts
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} colorStart
 * @param {string} colorEnd
 * @returns {CanvasGradient}
 */
function createGradient(ctx, colorStart, colorEnd) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
}

/**
 * Initialize showcase revenue chart (Product Showcase section)
 */
function initShowcaseChart() {
  const canvas = document.getElementById('showcase-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const gradient = createGradient(ctx, 'rgba(108, 99, 255, 0.35)', 'rgba(108, 99, 255, 0)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: MOCK_DATA.revenue.labels,
      datasets: [{
        label: 'Revenue ($K)',
        data: MOCK_DATA.revenue.values,
        borderColor: '#6C63FF',
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#6C63FF',
      }],
    },
    options: {
      ...CHART_DEFAULTS,
      interaction: { intersect: false, mode: 'index' },
    },
  });
}

/**
 * Initialize analytics preview dual-axis chart
 */
function initAnalyticsChart() {
  const canvas = document.getElementById('analytics-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MOCK_DATA.analytics.labels,
      datasets: [
        {
          label: 'Sessions',
          data: MOCK_DATA.analytics.sessions,
          backgroundColor: 'rgba(108, 99, 255, 0.7)',
          borderRadius: 6,
          barPercentage: 0.6,
        },
        {
          label: 'Conversions',
          data: MOCK_DATA.analytics.conversions,
          type: 'line',
          borderColor: '#00E5FF',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#00E5FF',
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        x: CHART_DEFAULTS.scales.x,
        y: {
          ...CHART_DEFAULTS.scales.y,
          position: 'left',
          title: { display: true, text: 'Sessions', color: '#64748B', font: { size: 11 } },
        },
        y1: {
          position: 'right',
          grid: { display: false },
          ticks: { color: '#64748B', font: { size: 11 } },
          border: { display: false },
          title: { display: true, text: 'Conversions', color: '#64748B', font: { size: 11 } },
        },
      },
      plugins: {
        ...CHART_DEFAULTS.plugins,
        legend: {
          display: true,
          labels: { color: '#94A3B8', boxWidth: 12, padding: 16, font: { size: 11 } },
        },
      },
    },
  });
}

/**
 * Initialize AI insights comparison chart
 */
function initAIInsightsChart() {
  const canvas = document.getElementById('ai-insights-chart');
  if (!canvas) return;

  new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: MOCK_DATA.aiTrends.labels,
      datasets: [
        {
          label: 'AI Predicted',
          data: MOCK_DATA.aiTrends.predicted,
          borderColor: '#00E5FF',
          backgroundColor: 'rgba(0, 229, 255, 0.08)',
          borderWidth: 2,
          borderDash: [6, 4],
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#00E5FF',
        },
        {
          label: 'Actual',
          data: MOCK_DATA.aiTrends.actual,
          borderColor: '#6C63FF',
          backgroundColor: 'rgba(108, 99, 255, 0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#6C63FF',
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        legend: {
          display: true,
          labels: { color: '#94A3B8', boxWidth: 12, padding: 16, font: { size: 11 } },
        },
      },
    },
  });
}

/**
 * Initialize dashboard preview charts (line + doughnut)
 */
function initDashboardCharts() {
  const lineCanvas = document.getElementById('dashboard-line-chart');
  const doughnutCanvas = document.getElementById('dashboard-doughnut-chart');

  if (lineCanvas) {
    const ctx = lineCanvas.getContext('2d');
    const gradient = createGradient(ctx, 'rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: MOCK_DATA.revenue.labels.slice(0, 7),
        datasets: [{
          label: 'KPI Trend',
          data: MOCK_DATA.revenue.values.slice(0, 7),
          borderColor: '#8B5CF6',
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        }],
      },
      options: CHART_DEFAULTS,
    });
  }

  if (doughnutCanvas) {
    new Chart(doughnutCanvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: MOCK_DATA.dashboard.labels,
        datasets: [{
          data: MOCK_DATA.dashboard.values,
          backgroundColor: ['#6C63FF', '#8B5CF6', '#00E5FF', '#22C55E', '#F59E0B'],
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: { color: '#94A3B8', boxWidth: 10, padding: 12, font: { size: 11 } },
          },
        },
      },
    });
  }
}

/**
 * Initialize sticky navbar scroll behavior
 */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.querySelector('.navbar__toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('is-active');
      mobileMenu.classList.toggle('is-open');
    });
  }
}

/**
 * Initialize analytics sidebar tab switching
 */
function initAnalyticsTabs() {
  const items = document.querySelectorAll('.analytics-preview__sidebar-item');

  items.forEach((item) => {
    item.addEventListener('click', () => {
      items.forEach((i) => i.classList.remove('is-active'));
      item.classList.add('is-active');
    });
  });
}

/**
 * Application bootstrap
 */
function init() {
  VexoraTheme.init();
  VexoraAnimations.init();
  initNavbar();
  initAnalyticsTabs();
  initShowcaseChart();
  initAnalyticsChart();
  initAIInsightsChart();
  initDashboardCharts();
}

document.addEventListener('DOMContentLoaded', init);
