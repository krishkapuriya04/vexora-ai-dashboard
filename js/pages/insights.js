/**
 * VEXORA AI Insights Page
 * Recommendations, risk analysis, forecasting, and BI feed.
 */

import { initApp, registerChart } from '../dashboard-app.js';
import { AI_INSIGHTS, FORECAST_DATA } from '../app-config.js';
import { CHART_DEFAULTS, CHART_COLORS, createGradient } from '../chart-utils.js';

function renderInsightsFeed() {
  const feed = document.getElementById('insights-feed');
  if (!feed) return;

  feed.innerHTML = AI_INSIGHTS.map((insight, i) => `
    <article class="insight-card glass-card glow-border reveal" data-type="${insight.type}" style="transition-delay: ${i * 80}ms">
      <div class="insight-card__glow" aria-hidden="true"></div>
      <header class="insight-card__header">
        <span class="ai-insight-item__tag ai-insight-item__tag--${insight.type === 'forecast' ? 'trend' : insight.type === 'alert' ? 'alert' : insight.type === 'trend' ? 'trend' : 'opportunity'}">${insight.tag}</span>
        <time class="insight-card__time">${insight.time}</time>
      </header>
      <h3 class="insight-card__title">${insight.title}</h3>
      <p class="insight-card__text">${insight.text}</p>
      <footer class="insight-card__footer">
        <div class="insight-card__metric">
          <span class="insight-card__metric-label">Confidence</span>
          <div class="insight-card__confidence">
            <div class="insight-card__confidence-bar" style="width: ${insight.confidence}%"></div>
          </div>
          <span class="insight-card__metric-value">${insight.confidence}%</span>
        </div>
        <span class="insight-card__impact insight-card__impact--${insight.impact.toLowerCase()}">${insight.impact} Impact</span>
      </footer>
    </article>
  `).join('');
}

function renderRiskCards() {
  const container = document.getElementById('risk-cards');
  if (!container) return;

  const risks = [
    { label: 'Churn Risk', value: 12, level: 'warning', desc: '142 accounts flagged' },
    { label: 'Revenue at Risk', value: 8, level: 'danger', desc: '$340K potential loss' },
    { label: 'Compliance Score', value: 96, level: 'success', desc: 'All checks passing' },
    { label: 'Market Volatility', value: 23, level: 'info', desc: 'Moderate exposure' },
  ];

  container.innerHTML = risks.map((r) => `
    <article class="risk-card glass-card reveal">
      <div class="risk-card__ring" data-level="${r.level}" style="--value: ${r.value}">
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <path class="risk-card__ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          <path class="risk-card__ring-fill" stroke-dasharray="${r.value}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        </svg>
        <span class="risk-card__value">${r.value}%</span>
      </div>
      <h4 class="risk-card__label">${r.label}</h4>
      <p class="risk-card__desc">${r.desc}</p>
    </article>
  `).join('');
}

function initForecastChart() {
  const canvas = document.getElementById('chart-forecast');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const { labels, actual, predicted, lower, upper } = FORECAST_DATA;
  const grad = createGradient(ctx, 'rgba(0, 229, 255, 0.15)', 'rgba(0, 229, 255, 0)');

  registerChart(new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Upper Bound',
          data: upper,
          borderColor: 'transparent',
          backgroundColor: 'rgba(108, 99, 255, 0.08)',
          fill: '+1',
          pointRadius: 0,
        },
        {
          label: 'Lower Bound',
          data: lower,
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          fill: false,
          pointRadius: 0,
        },
        {
          label: 'AI Forecast',
          data: predicted,
          borderColor: CHART_COLORS.accent,
          backgroundColor: grad,
          borderWidth: 2,
          borderDash: [6, 4],
          fill: true,
          tension: 0.3,
          pointRadius: 4,
        },
        {
          label: 'Actual',
          data: actual,
          borderColor: CHART_COLORS.primary,
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 5,
          spanGaps: true,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        legend: { display: true, labels: { color: '#94A3B8', boxWidth: 12, filter: (item) => !item.text.includes('Bound'), font: { size: 11 } } },
      },
    },
  }));
}

function initOpportunityChart() {
  const canvas = document.getElementById('chart-opportunity');
  if (!canvas) return;

  registerChart(new Chart(canvas.getContext('2d'), {
    type: 'bubble',
    data: {
      datasets: [{
        label: 'Opportunities',
        data: [
          { x: 85, y: 420, r: 18 },
          { x: 72, y: 180, r: 12 },
          { x: 94, y: 340, r: 22 },
          { x: 60, y: 90, r: 8 },
          { x: 88, y: 280, r: 15 },
        ],
        backgroundColor: 'rgba(108, 99, 255, 0.5)',
        borderColor: CHART_COLORS.primary,
      }],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        tooltip: {
          ...CHART_DEFAULTS.plugins.tooltip,
          callbacks: {
            label: (ctx) => `Impact: $${ctx.raw.y}K | Confidence: ${ctx.raw.x}%`,
          },
        },
      },
      scales: {
        x: { ...CHART_DEFAULTS.scales.x, title: { display: true, text: 'Confidence %', color: '#64748B', font: { size: 11 } } },
        y: { ...CHART_DEFAULTS.scales.y, title: { display: true, text: 'Impact ($K)', color: '#64748B', font: { size: 11 } } },
      },
    },
  }));
}

function initInsights() {
  renderInsightsFeed();
  renderRiskCards();
  initForecastChart();
  initOpportunityChart();
}

initApp({
  activePage: 'insights',
  pageTitle: 'AI Insights',
  onReady: initInsights,
});
