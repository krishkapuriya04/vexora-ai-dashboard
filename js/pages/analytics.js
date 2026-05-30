/**
 * VEXORA Analytics Page
 * Advanced charts, heatmap, traffic, and geography analytics — data from API.
 */

import { initApp, registerChart } from '../dashboard-app.js';
import { fetchDashboardMetrics } from '../api-client.js';
import { CHART_DEFAULTS, CHART_COLORS, createGradient } from '../chart-utils.js';

let analyticsData = {};

function initTrafficChart() {
  const canvas = document.getElementById('chart-traffic-overview');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const { labels, pageViews, uniqueVisitors } = analyticsData.trafficOverview || { labels: [], pageViews: [], uniqueVisitors: [] };
  const grad = createGradient(ctx, 'rgba(108, 99, 255, 0.25)', 'rgba(108, 99, 255, 0)');

  registerChart(new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Page Views', data: pageViews, borderColor: CHART_COLORS.primary, backgroundColor: grad, borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 3 },
        { label: 'Unique Visitors', data: uniqueVisitors, borderColor: CHART_COLORS.accent, backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, pointRadius: 3 },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: { ...CHART_DEFAULTS.plugins, legend: { display: true, labels: { color: '#94A3B8', boxWidth: 12, padding: 16, font: { size: 11 } } } },
    },
  }));
}

function initEngagementChart() {
  const canvas = document.getElementById('chart-engagement');
  if (!canvas) return;

  const { labels, bounceRate, avgSession } = analyticsData.engagement || { labels: [], bounceRate: [], avgSession: [] };

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Bounce Rate (%)', data: bounceRate, backgroundColor: 'rgba(239, 68, 68, 0.6)', borderRadius: 6, yAxisID: 'y' },
        { label: 'Avg Session (min)', data: avgSession, type: 'line', borderColor: CHART_COLORS.success, backgroundColor: 'transparent', borderWidth: 2.5, tension: 0.4, pointRadius: 4, yAxisID: 'y1' },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        x: CHART_DEFAULTS.scales.x,
        y: { ...CHART_DEFAULTS.scales.y, position: 'left', title: { display: true, text: 'Bounce %', color: '#64748B', font: { size: 11 } } },
        y1: { position: 'right', grid: { display: false }, ticks: { color: '#64748B' }, border: { display: false } },
      },
      plugins: { ...CHART_DEFAULTS.plugins, legend: { display: true, labels: { color: '#94A3B8', boxWidth: 12, font: { size: 11 } } } },
    },
  }));
}

function initGeographyChart() {
  const canvas = document.getElementById('chart-geography');
  if (!canvas) return;

  const { labels, values } = analyticsData.geography || { labels: [], values: [] };

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Traffic Share (%)', data: values, backgroundColor: CHART_COLORS.palette, borderRadius: 8, barPercentage: 0.6 }] },
    options: { indexAxis: 'y', ...CHART_DEFAULTS },
  }));
}

function initBehaviorChart() {
  const canvas = document.getElementById('chart-behavior');
  if (!canvas) return;

  const { labels, values } = analyticsData.userBehavior || { labels: [], values: [] };

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'radar',
    data: {
      labels,
      datasets: [{ label: 'Page Views', data: values, backgroundColor: 'rgba(108, 99, 255, 0.2)', borderColor: CHART_COLORS.primary, borderWidth: 2, pointBackgroundColor: CHART_COLORS.primary }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          ticks: { display: false, backdropColor: 'transparent' },
          pointLabels: { color: '#94A3B8', font: { size: 11 } },
        },
      },
    },
  }));
}

function renderHeatmap() {
  const container = document.getElementById('heatmap-grid');
  if (!container) return;

  const { days, hours, values } = analyticsData.heatmap || { days: [], hours: [], values: [] };
  const maxVal = Math.max(...values.flat(), 1);

  let html = '<div class="heatmap__corner"></div>';
  hours.forEach((h) => { html += `<div class="heatmap__hour-label">${h}</div>`; });

  days.forEach((day, di) => {
    html += `<div class="heatmap__day-label">${day}</div>`;
    (values[di] || []).forEach((val, hi) => {
      const intensity = val / maxVal;
      html += `<div class="heatmap__cell" style="--intensity: ${intensity}" title="${day} ${hours[hi]}: ${val}% activity" role="gridcell" aria-label="${day} ${hours[hi]} ${val} percent"></div>`;
    });
  });

  container.innerHTML = html;
}

async function initAnalytics() {
  const metrics = await fetchDashboardMetrics();
  analyticsData = metrics.analytics || {};

  initTrafficChart();
  initEngagementChart();
  initGeographyChart();
  initBehaviorChart();
  renderHeatmap();
}

initApp({
  activePage: 'analytics',
  pageTitle: 'Analytics',
  onReady: initAnalytics,
});
