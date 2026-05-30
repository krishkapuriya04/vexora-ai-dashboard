import DashboardMetric from '../models/DashboardMetric.js';
import { AppError } from '../utils/errors.js';
import {
  DEFAULT_KPI_META,
  DEFAULT_CHARTS,
  DEFAULT_ANALYTICS,
  DEFAULT_METRIC_VALUES,
} from '../utils/metricDefaults.js';

function buildKpiArray(doc) {
  const meta = doc.kpiMeta || DEFAULT_KPI_META;

  return [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: doc.revenue,
      prefix: '$',
      format: 'currency',
      change: meta.revenue?.change || '+0%',
      trend: meta.revenue?.trend || 'up',
      icon: meta.revenue?.icon || '💰',
      sparkline: meta.revenue?.sparkline || [],
    },
    {
      id: 'users',
      label: 'Active Users',
      value: doc.activeUsers,
      change: meta.users?.change || '+0%',
      trend: meta.users?.trend || 'up',
      icon: meta.users?.icon || '👥',
      sparkline: meta.users?.sparkline || [],
    },
    {
      id: 'growth',
      label: 'Growth Rate',
      value: doc.growthRate,
      suffix: meta.growth?.suffix || '%',
      decimals: meta.growth?.decimals || 1,
      change: meta.growth?.change || '+0%',
      trend: meta.growth?.trend || 'up',
      icon: meta.growth?.icon || '📈',
      sparkline: meta.growth?.sparkline || [],
    },
    {
      id: 'conversion',
      label: 'Conversion Rate',
      value: doc.conversionRate,
      suffix: meta.conversion?.suffix || '%',
      decimals: meta.conversion?.decimals || 2,
      change: meta.conversion?.change || '+0%',
      trend: meta.conversion?.trend || 'up',
      icon: meta.conversion?.icon || '🎯',
      sparkline: meta.conversion?.sparkline || [],
    },
    {
      id: 'ai-score',
      label: 'AI Score',
      value: doc.aiScore,
      suffix: meta.aiScore?.suffix || '/100',
      change: meta.aiScore?.change || '+0',
      trend: meta.aiScore?.trend || 'up',
      icon: meta.aiScore?.icon || '✦',
      sparkline: meta.aiScore?.sparkline || [],
    },
    {
      id: 'csat',
      label: 'Customer Satisfaction',
      value: doc.customerSatisfaction,
      suffix: meta.csat?.suffix || '%',
      change: meta.csat?.change || '+0%',
      trend: meta.csat?.trend || 'up',
      icon: meta.csat?.icon || '⭐',
      sparkline: meta.csat?.sparkline || [],
    },
  ];
}

export async function getMetrics(organizationId) {
  let doc = await DashboardMetric.findOne({ organization: organizationId });

  if (!doc) {
    doc = await DashboardMetric.create({
      organization: organizationId,
      ...DEFAULT_METRIC_VALUES,
      kpiMeta: DEFAULT_KPI_META,
      charts: DEFAULT_CHARTS,
      analytics: DEFAULT_ANALYTICS,
    });
  }

  return {
    id: doc._id.toString(),
    organization: doc.organization.toString(),
    revenue: doc.revenue,
    activeUsers: doc.activeUsers,
    growthRate: doc.growthRate,
    conversionRate: doc.conversionRate,
    aiScore: doc.aiScore,
    customerSatisfaction: doc.customerSatisfaction,
    kpis: buildKpiArray(doc),
    charts: doc.charts || DEFAULT_CHARTS,
    analytics: doc.analytics || DEFAULT_ANALYTICS,
    updatedAt: doc.updatedAt,
  };
}

export async function upsertMetrics(organizationId, payload) {
  const update = {};

  ['revenue', 'activeUsers', 'growthRate', 'conversionRate', 'aiScore', 'customerSatisfaction'].forEach((field) => {
    if (payload[field] !== undefined) update[field] = payload[field];
  });

  if (payload.kpiMeta) update.kpiMeta = payload.kpiMeta;
  if (payload.charts) update.charts = payload.charts;
  if (payload.analytics) update.analytics = payload.analytics;

  if (Object.keys(update).length === 0) {
    throw new AppError('No metric fields provided to update', 400);
  }

  const doc = await DashboardMetric.findOneAndUpdate(
    { organization: organizationId },
    { $set: update, $setOnInsert: { organization: organizationId } },
    { new: true, upsert: true, runValidators: true }
  );

  return getMetrics(organizationId);
}

export default { getMetrics, upsertMetrics };
