/**
 * VEXORA Dashboard Page
 * KPI metrics, charts, and product demo video — data loaded from API.
 */

import { initApp, registerChart } from '../dashboard-app.js';
import { fetchDashboardMetrics, fetchActivities } from '../api-client.js';
import { VIDEO_CONFIG } from '../app-config.js';
import { CHART_DEFAULTS, CHART_COLORS, createGradient, initSparkline, getLegendOptions } from '../chart-utils.js';
import { bindVideoPreview } from '../shell.js';

let kpiMetrics = [];
let dashboardCharts = {};

function renderKPICards() {
  const grid = document.getElementById('kpi-grid');
  if (!grid) return;

  grid.innerHTML = kpiMetrics.map((kpi, i) => {
    const animateVal = kpi.format === 'currency' ? (kpi.value / 1000000) : kpi.value;
    const animateSuffix = kpi.format === 'currency' ? 'M' : (kpi.suffix || '');
    const animatePrefix = kpi.format === 'currency' ? '$' : (kpi.prefix || '');
    const decimals = kpi.format === 'currency' ? 2 : (kpi.decimals || 0);

    return `
      <article class="kpi-card glass-card glow-border magnetic-card reveal" style="transition-delay: ${i * 60}ms">
        <div class="kpi-card__header">
          <span class="kpi-card__icon" aria-hidden="true">${kpi.icon}</span>
          <span class="kpi-card__change kpi-card__change--${kpi.trend}">${kpi.change}</span>
        </div>
        <div class="kpi-card__value"
             data-animate="${animateVal}"
             data-prefix="${animatePrefix}"
             data-suffix="${animateSuffix}"
             data-decimals="${decimals}">${animatePrefix}0${animateSuffix}</div>
        <div class="kpi-card__label">${kpi.label}</div>
        <div class="kpi-card__sparkline">
          <canvas id="spark-${kpi.id}" aria-hidden="true"></canvas>
        </div>
      </article>
    `;
  }).join('');

  kpiMetrics.forEach((kpi) => {
    const canvas = document.getElementById(`spark-${kpi.id}`);
    if (canvas) registerChart(initSparkline(canvas, kpi.sparkline));
  });
}

function initRevenueChart() {
  const canvas = document.getElementById('chart-revenue-trend');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const { labels, revenue, profit } = dashboardCharts.revenueTrend || { labels: [], revenue: [], profit: [] };
  const grad = createGradient(ctx, 'rgba(108, 99, 255, 0.3)', 'rgba(108, 99, 255, 0)');

  registerChart(new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Revenue ($K)', data: revenue, borderColor: CHART_COLORS.primary, backgroundColor: grad, borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5 },
        { label: 'Profit ($K)', data: profit, borderColor: CHART_COLORS.accent, backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, pointRadius: 0 },
      ],
    },
    options: { ...CHART_DEFAULTS, plugins: { ...CHART_DEFAULTS.plugins, legend: getLegendOptions('top') } },
  }));
}

function initUserGrowthChart() {
  const canvas = document.getElementById('chart-user-growth');
  if (!canvas) return;

  const { labels, newUsers, returning } = dashboardCharts.userGrowth || { labels: [], newUsers: [], returning: [] };

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'New Users', data: newUsers, backgroundColor: 'rgba(108, 99, 255, 0.75)', borderRadius: 6, barPercentage: 0.65 },
        { label: 'Returning', data: returning, backgroundColor: 'rgba(0, 229, 255, 0.45)', borderRadius: 6, barPercentage: 0.65 },
      ],
    },
    options: { ...CHART_DEFAULTS, plugins: { ...CHART_DEFAULTS.plugins, legend: getLegendOptions('top') } },
  }));
}

function initDeviceChart() {
  const canvas = document.getElementById('chart-devices');
  if (!canvas) return;

  const { labels, values } = dashboardCharts.deviceAnalytics || { labels: [], values: [] };

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: CHART_COLORS.palette, borderWidth: 0, hoverOffset: 6 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: { legend: { display: true, position: 'bottom', labels: { color: '#94A3B8', boxWidth: 10, padding: 12, font: { size: 11 } } } },
    },
  }));
}

function initTrafficChart() {
  const canvas = document.getElementById('chart-traffic');
  if (!canvas) return;

  const { labels, values } = dashboardCharts.trafficSources || { labels: [], values: [] };

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'polarArea',
    data: { labels, datasets: [{ data: values, backgroundColor: CHART_COLORS.palette.map((c) => `${c}99`), borderWidth: 0 }] },
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

  const { labels, values } = dashboardCharts.conversionFunnel || { labels: [], values: [] };

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Conversion %',
        data: values,
        backgroundColor: values.map((_, i) => `rgba(108, 99, 255, ${1 - i * 0.15})`),
        borderRadius: 8,
        barPercentage: 0.7,
      }],
    },
    options: { indexAxis: 'y', ...CHART_DEFAULTS, plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } } },
  }));
}

function initGeographyChart() {
  const canvas = document.getElementById('chart-geography-dashboard');
  if (!canvas) return;

  const { labels, values } = dashboardCharts.geography || { labels: [], values: [] };

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Traffic Share (%)', data: values, backgroundColor: CHART_COLORS.palette, borderRadius: 8, barPercentage: 0.65 }] },
    options: { indexAxis: 'y', ...CHART_DEFAULTS, plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } } },
  }));
}

function renderActivityTimeline(activities) {
  const container = document.getElementById('activity-timeline');
  if (!container) return;

  if (!activities.length) {
    container.innerHTML = '<p class="settings-row__hint">No recent activity.</p>';
    return;
  }

  container.innerHTML = activities.map((item) => `
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

function renderAIFeed(activities) {
  const container = document.getElementById('ai-feed-compact');
  if (!container) return;

  const aiItems = activities
    .filter((item) => item.type === 'ai' || item.type === 'alert')
    .slice(0, 3)
    .map((item) => ({
      tag: item.type === 'ai' ? 'Opportunity' : 'Alert',
      type: item.type === 'ai' ? 'opportunity' : 'alert',
      title: item.title,
      text: item.desc,
    }));

  if (!aiItems.length) {
    container.innerHTML = '<p class="settings-row__hint">No AI insights yet.</p>';
    return;
  }

  container.innerHTML = aiItems.map((item) => `
    <article class="ai-feed-compact__item">
      <span class="ai-insight-item__tag ai-insight-item__tag--${item.type}">${item.tag}</span>
      <h3 class="ai-feed-compact__title">${item.title}</h3>
      <p class="ai-feed-compact__text">${item.text}</p>
    </article>
  `).join('');
}

async function initDashboard() {
  const [metrics, activities] = await Promise.all([
    fetchDashboardMetrics(),
    fetchActivities(),
  ]);

  kpiMetrics = metrics.kpis || [];
  dashboardCharts = metrics.charts || {};

  renderKPICards();
  initRevenueChart();
  initUserGrowthChart();
  initDeviceChart();
  initTrafficChart();
  initFunnelChart();
  initGeographyChart();
  renderActivityTimeline(activities);
  renderAIFeed(activities);
  bindVideoPreview('#video-play-btn', VIDEO_CONFIG.videoUrl);
}

initApp({
  activePage: 'dashboard',
  pageTitle: 'Dashboard',
  onReady: initDashboard,
});
