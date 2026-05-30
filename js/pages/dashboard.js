/**
 * VEXORA Dashboard Page
 * KPI metrics, charts, and product demo video.
 */

import { initApp, registerChart } from '../dashboard-app.js';
import { KPI_METRICS, DASHBOARD_CHARTS, VIDEO_CONFIG, ACTIVITY_TIMELINE, DASHBOARD_AI_FEED } from '../mock-data.js';
import { CHART_DEFAULTS, CHART_COLORS, createGradient, initSparkline } from '../chart-utils.js';
import { bindVideoPreview } from '../shell.js';

function renderKPICards() {
  const grid = document.getElementById('kpi-grid');
  if (!grid) return;

  grid.innerHTML = KPI_METRICS.map((kpi, i) => {
    const displayValue = kpi.format === 'currency'
      ? `$${(kpi.value / 1000000).toFixed(2)}M`
      : kpi.decimals !== undefined
        ? `${kpi.prefix || ''}${kpi.value.toFixed(kpi.decimals)}${kpi.suffix || ''}`
        : `${kpi.prefix || ''}${kpi.value.toLocaleString()}${kpi.suffix || ''}`;

    return `
      <article class="kpi-card glass-card glow-border reveal" style="transition-delay: ${i * 60}ms">
        <div class="kpi-card__header">
          <span class="kpi-card__icon" aria-hidden="true">${kpi.icon}</span>
          <span class="kpi-card__change kpi-card__change--${kpi.trend}">${kpi.change}</span>
        </div>
        <div class="kpi-card__value">${displayValue}</div>
        <div class="kpi-card__label">${kpi.label}</div>
        <div class="kpi-card__sparkline">
          <canvas id="spark-${kpi.id}" aria-hidden="true"></canvas>
        </div>
      </article>
    `;
  }).join('');

  KPI_METRICS.forEach((kpi) => {
    const canvas = document.getElementById(`spark-${kpi.id}`);
    if (canvas) registerChart(initSparkline(canvas, kpi.sparkline));
  });
}

function initRevenueChart() {
  const canvas = document.getElementById('chart-revenue-trend');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const { labels, revenue, profit } = DASHBOARD_CHARTS.revenueTrend;
  const grad = createGradient(ctx, 'rgba(108, 99, 255, 0.3)', 'rgba(108, 99, 255, 0)');

  registerChart(new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Revenue ($K)',
          data: revenue,
          borderColor: CHART_COLORS.primary,
          backgroundColor: grad,
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
        {
          label: 'Profit ($K)',
          data: profit,
          borderColor: CHART_COLORS.accent,
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        legend: { display: true, labels: { color: '#94A3B8', boxWidth: 12, padding: 16, font: { size: 11 } } },
      },
    },
  }));
}

function initUserGrowthChart() {
  const canvas = document.getElementById('chart-user-growth');
  if (!canvas) return;

  const { labels, newUsers, returning } = DASHBOARD_CHARTS.userGrowth;

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'New Users',
          data: newUsers,
          backgroundColor: 'rgba(108, 99, 255, 0.75)',
          borderRadius: 6,
          barPercentage: 0.65,
        },
        {
          label: 'Returning',
          data: returning,
          backgroundColor: 'rgba(0, 229, 255, 0.45)',
          borderRadius: 6,
          barPercentage: 0.65,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        legend: { display: true, labels: { color: '#94A3B8', boxWidth: 12, padding: 16, font: { size: 11 } } },
      },
    },
  }));
}

function initDeviceChart() {
  const canvas = document.getElementById('chart-devices');
  if (!canvas) return;

  const { labels, values } = DASHBOARD_CHARTS.deviceAnalytics;

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: CHART_COLORS.palette,
        borderWidth: 0,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: true, position: 'bottom', labels: { color: '#94A3B8', boxWidth: 10, padding: 12, font: { size: 11 } } },
      },
    },
  }));
}

function initTrafficChart() {
  const canvas = document.getElementById('chart-traffic');
  if (!canvas) return;

  const { labels, values } = DASHBOARD_CHARTS.trafficSources;

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'polarArea',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: CHART_COLORS.palette.map((c) => `${c}99`),
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'right', labels: { color: '#94A3B8', boxWidth: 10, font: { size: 11 } } } },
      scales: { r: { display: false } },
    },
  }));
}

function initFunnelChart() {
  const canvas = document.getElementById('chart-funnel');
  if (!canvas) return;

  const { labels, values } = DASHBOARD_CHARTS.conversionFunnel;

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Conversion %',
        data: values,
        backgroundColor: values.map((_, i) => {
          const opacity = 1 - i * 0.15;
          return `rgba(108, 99, 255, ${opacity})`;
        }),
        borderRadius: 8,
        barPercentage: 0.7,
      }],
    },
    options: {
      indexAxis: 'y',
      ...CHART_DEFAULTS,
      plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
    },
  }));
}

function initGeographyChart() {
  const canvas = document.getElementById('chart-geography-dashboard');
  if (!canvas) return;

  const { labels, values } = DASHBOARD_CHARTS.geography;

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Traffic Share (%)',
        data: values,
        backgroundColor: CHART_COLORS.palette,
        borderRadius: 8,
        barPercentage: 0.65,
      }],
    },
    options: {
      indexAxis: 'y',
      ...CHART_DEFAULTS,
      plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
    },
  }));
}

function renderActivityTimeline() {
  const container = document.getElementById('activity-timeline');
  if (!container) return;

  container.innerHTML = ACTIVITY_TIMELINE.map((item) => `
    <article class="timeline__item">
      <span class="timeline__icon" aria-hidden="true">${item.icon}</span>
      <div class="timeline__content">
        <h3 class="timeline__title">${item.title}</h3>
        <p class="timeline__desc">${item.desc}</p>
        <time class="timeline__time">${item.time}</time>
      </div>
    </article>
  `).join('');
}

function renderAIFeed() {
  const container = document.getElementById('ai-feed-compact');
  if (!container) return;

  container.innerHTML = DASHBOARD_AI_FEED.map((item) => `
    <article class="ai-feed-compact__item">
      <span class="ai-insight-item__tag ai-insight-item__tag--${item.type}">${item.tag}</span>
      <h3 class="ai-feed-compact__title">${item.title}</h3>
      <p class="ai-feed-compact__text">${item.text}</p>
    </article>
  `).join('');
}

function initDashboard() {
  renderKPICards();
  initRevenueChart();
  initUserGrowthChart();
  initDeviceChart();
  initTrafficChart();
  initFunnelChart();
  initGeographyChart();
  renderActivityTimeline();
  renderAIFeed();
  bindVideoPreview('#video-play-btn', VIDEO_CONFIG.videoUrl);
}

initApp({
  activePage: 'dashboard',
  pageTitle: 'Dashboard',
  onReady: initDashboard,
});
