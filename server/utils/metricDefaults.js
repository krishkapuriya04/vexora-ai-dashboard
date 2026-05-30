/**
 * Default dashboard metric templates for seeding and new organizations.
 */
export const DEFAULT_KPI_META = {
  revenue: { change: '+12.4%', trend: 'up', icon: '💰', sparkline: [42, 48, 55, 52, 61, 68, 72, 78], format: 'currency' },
  users: { change: '+8.3%', trend: 'up', icon: '👥', sparkline: [12, 14, 13, 15, 16, 17, 18, 18.4] },
  growth: { change: '+4.2%', trend: 'up', icon: '📈', sparkline: [15, 16, 17, 18, 19, 21, 22, 23.7], suffix: '%', decimals: 1 },
  conversion: { change: '+0.6%', trend: 'up', icon: '🎯', sparkline: [3.8, 4.0, 4.1, 4.3, 4.5, 4.6, 4.7, 4.82], suffix: '%', decimals: 2 },
  aiScore: { change: '+6 pts', trend: 'up', icon: '✦', sparkline: [78, 82, 85, 87, 89, 91, 93, 94], suffix: '/100' },
  csat: { change: '+2%', trend: 'up', icon: '⭐', sparkline: [91, 92, 93, 94, 94, 95, 95, 96], suffix: '%' },
};

export const DEFAULT_CHARTS = {
  revenueTrend: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    revenue: [185, 198, 212, 205, 228, 245, 258, 272, 289, 278, 298, 312],
    profit: [42, 48, 55, 52, 61, 68, 72, 78, 85, 82, 91, 98],
  },
  userGrowth: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    newUsers: [820, 940, 1100, 980, 1240, 1380, 1520, 1680],
    returning: [4200, 4350, 4480, 4620, 4780, 4950, 5120, 5340],
  },
  deviceAnalytics: {
    labels: ['Desktop', 'Mobile', 'Tablet', 'Other'],
    values: [42, 38, 14, 6],
  },
  trafficSources: {
    labels: ['Organic', 'Direct', 'Referral', 'Social', 'Paid', 'Email'],
    values: [34, 22, 18, 12, 9, 5],
  },
  conversionFunnel: {
    labels: ['Visitors', 'Sign-ups', 'Trials', 'Activated', 'Paid'],
    values: [100, 68, 42, 28, 18],
  },
  geography: {
    labels: ['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'Other'],
    values: [38, 18, 12, 10, 8, 14],
  },
};

export const DEFAULT_ANALYTICS = {
  trafficOverview: {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    pageViews: [1200, 800, 3400, 5200, 4800, 3600, 2100],
    uniqueVisitors: [890, 620, 2400, 3800, 3500, 2700, 1600],
  },
  engagement: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    bounceRate: [32, 28, 30, 26, 29, 38, 42],
    avgSession: [4.2, 4.8, 4.5, 5.1, 4.9, 3.2, 2.8],
  },
  geography: {
    labels: ['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'Other'],
    values: [38, 18, 12, 10, 8, 14],
  },
  heatmap: {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    hours: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
    values: [
      [12, 45, 78, 92, 68, 34],
      [15, 52, 85, 98, 72, 38],
      [18, 58, 88, 95, 75, 42],
      [14, 55, 82, 100, 78, 45],
      [20, 62, 90, 96, 82, 48],
      [8, 22, 35, 42, 38, 28],
      [6, 18, 28, 32, 30, 22],
    ],
  },
  userBehavior: {
    labels: ['Dashboard', 'Reports', 'Analytics', 'Settings', 'Integrations', 'AI Insights'],
    values: [8920, 6340, 7890, 3210, 4560, 5670],
  },
};

export const DEFAULT_METRIC_VALUES = {
  revenue: 2847500,
  activeUsers: 18429,
  growthRate: 23.7,
  conversionRate: 4.82,
  aiScore: 94,
  customerSatisfaction: 96,
};

export default {
  DEFAULT_KPI_META,
  DEFAULT_CHARTS,
  DEFAULT_ANALYTICS,
  DEFAULT_METRIC_VALUES,
};
