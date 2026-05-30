import Organization from '../models/Organization.js';
import * as dashboardService from './dashboardService.js';
import * as activityService from './activityService.js';
import * as reportService from './reportService.js';
import * as notificationService from './notificationService.js';
import { AppError } from '../utils/errors.js';

/**
 * Collect all organization-scoped export data from MongoDB.
 */
export async function collectExportData(organizationId, userId) {
  const organization = await Organization.findById(organizationId);

  if (!organization) {
    throw new AppError('Organization not found', 404);
  }

  const [metrics, activities, reports, notifications] = await Promise.all([
    dashboardService.getMetrics(organizationId),
    activityService.listActivities(organizationId, 50),
    reportService.listReports(organizationId),
    notificationService.listNotifications(userId),
  ]);

  const exportDate = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return {
    organization: organization.toPublicJSON(),
    exportDate,
    metrics,
    activities,
    reports,
    notifications,
    chartsSummary: buildChartsSummary(metrics.charts),
  };
}

function buildChartsSummary(charts = {}) {
  const summary = [];

  if (charts.revenueTrend) {
    const { labels, revenue } = charts.revenueTrend;
    const lastIdx = revenue?.length ? revenue.length - 1 : 0;
    summary.push({
      name: 'Revenue Trend',
      detail: `${labels?.[lastIdx] || 'Latest'}: $${revenue?.[lastIdx] || 0}K`,
    });
  }

  if (charts.userGrowth) {
    const { labels, newUsers } = charts.userGrowth;
    const lastIdx = newUsers?.length ? newUsers.length - 1 : 0;
    summary.push({
      name: 'User Growth',
      detail: `${labels?.[lastIdx] || 'Latest'}: ${newUsers?.[lastIdx] || 0} new users`,
    });
  }

  if (charts.deviceAnalytics) {
    const { labels, values } = charts.deviceAnalytics;
    summary.push({
      name: 'Device Analytics',
      detail: labels?.map((l, i) => `${l} ${values?.[i] || 0}%`).join(', ') || 'N/A',
    });
  }

  if (charts.trafficSources) {
    const top = charts.trafficSources.labels?.[0];
    const topVal = charts.trafficSources.values?.[0];
    summary.push({
      name: 'Top Traffic Source',
      detail: top ? `${top}: ${topVal}%` : 'N/A',
    });
  }

  if (charts.conversionFunnel) {
    const { labels, values } = charts.conversionFunnel;
    summary.push({
      name: 'Conversion Funnel',
      detail: `${labels?.[0] || 'Visitors'} → ${labels?.[labels.length - 1] || 'Paid'}: ${values?.[0] || 0}% → ${values?.[values.length - 1] || 0}%`,
    });
  }

  if (charts.geography) {
    const { labels, values } = charts.geography;
    summary.push({
      name: 'Geography',
      detail: `${labels?.[0] || 'Top region'}: ${values?.[0] || 0}% traffic share`,
    });
  }

  return summary;
}

export default { collectExportData };
