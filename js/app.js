/**
 * VEXORA Application Module
 * Main entry point — initializes charts, navigation, and app state.
 */

import VexoraTheme from './theme.js';
import VexoraAnimations from './animations.js';
import { initMicroInteractions } from './micro-interactions.js';
import { CHART_DEFAULTS, createGradient } from './chart-utils.js';
import { LANDING_MOCK_DATA as MOCK_DATA } from './app-config.js';

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
  initMicroInteractions();
}

document.addEventListener('DOMContentLoaded', init);
