import Organization from '../models/Organization.js';
import User from '../models/User.js';
import DashboardMetric from '../models/DashboardMetric.js';
import Activity from '../models/Activity.js';
import Report from '../models/Report.js';
import Notification from '../models/Notification.js';
import {
  DEFAULT_KPI_META,
  DEFAULT_CHARTS,
  DEFAULT_ANALYTICS,
  DEFAULT_METRIC_VALUES,
} from '../utils/metricDefaults.js';

export async function createOrganizationForUser(user, orgName) {
  const organization = await Organization.create({
    name: orgName || `${user.fullName.split(' ')[0]}'s Workspace`,
    industry: 'Technology',
    size: '51-200',
    logo: '',
    owner: user._id,
  });

  user.organization = organization._id;
  await user.save();

  return organization;
}

export async function seedOrganizationData(organizationId, userId) {
  await DashboardMetric.findOneAndUpdate(
    { organization: organizationId },
    {
      $set: {
        ...DEFAULT_METRIC_VALUES,
        kpiMeta: DEFAULT_KPI_META,
        charts: DEFAULT_CHARTS,
        analytics: DEFAULT_ANALYTICS,
      },
    },
    { upsert: true, new: true }
  );

  const existingActivities = await Activity.countDocuments({ organization: organizationId });
  if (existingActivities === 0) {
    const now = Date.now();
    await Activity.insertMany([
      { organization: organizationId, type: 'revenue', title: 'Revenue milestone reached', description: 'Monthly revenue exceeded $2.8M target', icon: '💰', timestamp: new Date(now - 5 * 60000) },
      { organization: organizationId, type: 'user', title: '1,680 new users this week', description: '18.2% growth vs previous week', icon: '👥', timestamp: new Date(now - 22 * 60000) },
      { organization: organizationId, type: 'ai', title: 'AI insight generated', description: 'Enterprise segment opportunity detected', icon: '✦', timestamp: new Date(now - 60 * 60000) },
      { organization: organizationId, type: 'report', title: 'Report exported', description: 'Executive Summary — May 2026 downloaded', icon: '📋', timestamp: new Date(now - 2 * 60 * 60000) },
      { organization: organizationId, type: 'integration', title: 'Salesforce sync complete', description: '12,400 records synchronized', icon: '🔗', timestamp: new Date(now - 3 * 60 * 60000) },
      { organization: organizationId, type: 'alert', title: 'Churn risk flagged', description: '142 accounts require review', icon: '⚠', timestamp: new Date(now - 4 * 60 * 60000) },
    ]);
  }

  const existingReports = await Report.countDocuments({ organization: organizationId });
  if (existingReports === 0) {
    await Report.insertMany([
      { organization: organizationId, title: 'Executive Summary — May 2026', description: 'Monthly executive overview', category: 'Executive', pages: 12, size: '2.4 MB', status: 'ready', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80' },
      { organization: organizationId, title: 'Revenue & Growth Analysis', description: 'Financial performance deep dive', category: 'Financial', pages: 24, size: '1.8 MB', status: 'ready', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80' },
      { organization: organizationId, title: 'Customer Retention Report', description: 'Retention and churn analysis', category: 'Customer', pages: 18, size: '3.1 MB', status: 'ready', thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80' },
      { organization: organizationId, title: 'AI Insights Digest — Q2', description: 'Quarterly AI recommendations', category: 'AI', pages: 8, size: '1.2 MB', status: 'ready', thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80' },
      { organization: organizationId, title: 'Marketing Performance Review', description: 'Campaign ROI and channel mix', category: 'Marketing', pages: 16, size: '2.0 MB', status: 'ready', thumbnail: 'https://images.unsplash.com/photo-1533750349088-cd871a166879?w=400&q=80' },
      { organization: organizationId, title: 'Product Analytics Deep Dive', description: 'Feature adoption and usage', category: 'Product', pages: 32, size: '4.2 MB', status: 'generating', thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80' },
    ]);
  }

  const existingNotifications = await Notification.countDocuments({ user: userId });
  if (existingNotifications === 0) {
    const now = Date.now();
    await Notification.insertMany([
      { user: userId, title: 'Revenue target exceeded', message: 'Monthly revenue surpassed $2.8M target by 4.2%', type: 'success', read: false, createdAt: new Date(now - 5 * 60000) },
      { user: userId, title: 'New AI insight available', message: 'Enterprise segment opportunity detected', type: 'info', read: false, createdAt: new Date(now - 12 * 60000) },
      { user: userId, title: 'Report ready for download', message: 'Executive Summary — May 2026 is ready', type: 'default', read: false, createdAt: new Date(now - 60 * 60000) },
      { user: userId, title: 'Integration sync complete', message: 'Salesforce data synced successfully', type: 'success', read: true, createdAt: new Date(now - 2 * 60 * 60000) },
      { user: userId, title: 'Churn risk alert', message: '142 accounts flagged for review', type: 'warning', read: true, createdAt: new Date(now - 3 * 60 * 60000) },
    ]);
  }
}

export async function ensureUserOrganization(user) {
  if (user.organization) {
    return Organization.findById(user.organization);
  }

  const organization = await createOrganizationForUser(user);
  await seedOrganizationData(organization._id, user._id);
  return organization;
}

export default {
  createOrganizationForUser,
  seedOrganizationData,
  ensureUserOrganization,
};
