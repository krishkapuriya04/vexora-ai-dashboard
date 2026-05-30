/**
 * VEXORA Mock Data
 * Centralized realistic business data for all dashboard pages.
 */

export const LANDING_MOCK_DATA = {
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

export const KPI_METRICS = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: 2847500,
    prefix: '$',
    format: 'currency',
    change: '+12.4%',
    trend: 'up',
    icon: '💰',
    sparkline: [42, 48, 55, 52, 61, 68, 72, 78],
  },
  {
    id: 'users',
    label: 'Active Users',
    value: 18429,
    change: '+8.3%',
    trend: 'up',
    icon: '👥',
    sparkline: [12, 14, 13, 15, 16, 17, 18, 18.4],
  },
  {
    id: 'growth',
    label: 'Growth Rate',
    value: 23.7,
    suffix: '%',
    decimals: 1,
    change: '+4.2%',
    trend: 'up',
    icon: '📈',
    sparkline: [15, 16, 17, 18, 19, 21, 22, 23.7],
  },
  {
    id: 'conversion',
    label: 'Conversion Rate',
    value: 4.82,
    suffix: '%',
    decimals: 2,
    change: '+0.6%',
    trend: 'up',
    icon: '🎯',
    sparkline: [3.8, 4.0, 4.1, 4.3, 4.5, 4.6, 4.7, 4.82],
  },
  {
    id: 'ai-score',
    label: 'AI Score',
    value: 94,
    suffix: '/100',
    change: '+6 pts',
    trend: 'up',
    icon: '✦',
    sparkline: [78, 82, 85, 87, 89, 91, 93, 94],
  },
  {
    id: 'csat',
    label: 'Customer Satisfaction',
    value: 96,
    suffix: '%',
    change: '+2%',
    trend: 'up',
    icon: '⭐',
    sparkline: [91, 92, 93, 94, 94, 95, 95, 96],
  },
];

export const DASHBOARD_CHARTS = {
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

export const ANALYTICS_DATA = {
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

export const AI_INSIGHTS = [
  {
    id: 1,
    type: 'opportunity',
    tag: 'Opportunity',
    title: 'Enterprise segment showing 34% uplift',
    text: 'Accounts with 50+ seats upgraded 34% faster this quarter. Recommend targeted enterprise campaign in Q3.',
    confidence: 92,
    impact: 'High',
    time: '2 min ago',
  },
  {
    id: 2,
    type: 'alert',
    tag: 'Risk Alert',
    title: 'Churn risk in Segment B accounts',
    text: '142 accounts exhibit engagement patterns matching previously churned customers. Proactive outreach recommended within 7 days.',
    confidence: 87,
    impact: 'Critical',
    time: '15 min ago',
  },
  {
    id: 3,
    type: 'trend',
    tag: 'Trend',
    title: 'Mobile conversion gap widening',
    text: 'Mobile traffic is 58% of total but converts at 2.1% vs 6.4% desktop. UX optimization could recover ~$180K MRR.',
    confidence: 94,
    impact: 'Medium',
    time: '1 hr ago',
  },
  {
    id: 4,
    type: 'forecast',
    tag: 'Forecast',
    title: 'Q3 revenue projected at $3.2M',
    text: 'Based on current pipeline velocity and seasonality models, Q3 revenue forecast exceeds target by 8.2%.',
    confidence: 89,
    impact: 'High',
    time: '2 hrs ago',
  },
  {
    id: 5,
    type: 'opportunity',
    tag: 'Opportunity',
    title: 'Cross-sell potential in existing base',
    text: '2,340 accounts use only 1 of 4 available modules. AI-identified cross-sell could add $420K ARR.',
    confidence: 85,
    impact: 'High',
    time: '3 hrs ago',
  },
  {
    id: 6,
    type: 'alert',
    tag: 'Anomaly',
    title: 'Unusual API usage spike detected',
    text: 'API calls increased 340% from 3 enterprise accounts. Verify legitimate usage or investigate potential abuse.',
    confidence: 78,
    impact: 'Medium',
    time: '5 hrs ago',
  },
];

export const FORECAST_DATA = {
  labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  actual: [258, 272, 289, null, null, null],
  predicted: [258, 272, 289, 305, 322, 340],
  lower: [258, 272, 289, 290, 305, 318],
  upper: [258, 272, 289, 320, 340, 365],
};

export const REPORTS = [
  {
    id: 'r1',
    title: 'Executive Summary — May 2026',
    type: 'Executive',
    date: 'May 28, 2026',
    size: '2.4 MB',
    pages: 12,
    status: 'ready',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
  },
  {
    id: 'r2',
    title: 'Revenue & Growth Analysis',
    type: 'Financial',
    date: 'May 25, 2026',
    size: '1.8 MB',
    pages: 24,
    status: 'ready',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
  },
  {
    id: 'r3',
    title: 'Customer Retention Report',
    type: 'Customer',
    date: 'May 20, 2026',
    size: '3.1 MB',
    pages: 18,
    status: 'ready',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80',
  },
  {
    id: 'r4',
    title: 'AI Insights Digest — Q2',
    type: 'AI',
    date: 'May 15, 2026',
    size: '1.2 MB',
    pages: 8,
    status: 'ready',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80',
  },
  {
    id: 'r5',
    title: 'Marketing Performance Review',
    type: 'Marketing',
    date: 'May 10, 2026',
    size: '2.0 MB',
    pages: 16,
    status: 'ready',
    thumbnail: 'https://images.unsplash.com/photo-1533750349088-cd871a166879?w=400&q=80',
  },
  {
    id: 'r6',
    title: 'Product Analytics Deep Dive',
    type: 'Product',
    date: 'May 5, 2026',
    size: '4.2 MB',
    pages: 32,
    status: 'generating',
    thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80',
  },
];

export const NOTIFICATIONS = [
  { id: 1, title: 'Revenue target exceeded', text: 'Monthly revenue surpassed $2.8M target by 4.2%', time: '5m ago', unread: true, type: 'success' },
  { id: 2, title: 'New AI insight available', text: 'Enterprise segment opportunity detected', time: '12m ago', unread: true, type: 'info' },
  { id: 3, title: 'Report ready for download', text: 'Executive Summary — May 2026 is ready', time: '1h ago', unread: true, type: 'default' },
  { id: 4, title: 'Integration sync complete', text: 'Salesforce data synced successfully', time: '2h ago', unread: false, type: 'success' },
  { id: 5, title: 'Churn risk alert', text: '142 accounts flagged for review', time: '3h ago', unread: false, type: 'warning' },
];

export const SEARCH_ITEMS = [
  { label: 'Dashboard', href: 'dashboard.html', icon: '📊', category: 'Pages' },
  { label: 'Analytics', href: 'analytics.html', icon: '📈', category: 'Pages' },
  { label: 'AI Insights', href: 'insights.html', icon: '✦', category: 'Pages' },
  { label: 'Reports', href: 'reports.html', icon: '📋', category: 'Pages' },
  { label: 'Settings', href: 'settings.html', icon: '⚙', category: 'Pages' },
  { label: 'Revenue Report', href: 'reports.html', icon: '💰', category: 'Reports' },
  { label: 'User Growth Chart', href: 'dashboard.html', icon: '👥', category: 'Quick Actions' },
  { label: 'Export Data', href: 'reports.html', icon: '⬇', category: 'Quick Actions' },
  { label: 'View AI Forecast', href: 'insights.html', icon: '🔮', category: 'Quick Actions' },
  { label: 'Account Settings', href: 'settings.html', icon: '⚙', category: 'Quick Actions' },
];

/** Video demo config — replace URL to swap demo video */
export const VIDEO_CONFIG = {
  thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
  videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1',
  title: 'VEXORA Product Walkthrough',
  duration: '3:42',
};

/** Recent activity timeline for dashboard */
export const ACTIVITY_TIMELINE = [
  { id: 1, type: 'revenue', title: 'Revenue milestone reached', desc: 'Monthly revenue exceeded $2.8M target', time: '5 min ago', icon: '💰' },
  { id: 2, type: 'user', title: '1,680 new users this week', desc: '18.2% growth vs previous week', time: '22 min ago', icon: '👥' },
  { id: 3, type: 'ai', title: 'AI insight generated', desc: 'Enterprise segment opportunity detected', time: '1 hr ago', icon: '✦' },
  { id: 4, type: 'report', title: 'Report exported', desc: 'Executive Summary — May 2026 downloaded', time: '2 hrs ago', icon: '📋' },
  { id: 5, type: 'integration', title: 'Salesforce sync complete', desc: '12,400 records synchronized', time: '3 hrs ago', icon: '🔗' },
  { id: 6, type: 'alert', title: 'Churn risk flagged', desc: '142 accounts require review', time: '4 hrs ago', icon: '⚠' },
];

/** Compact AI feed for dashboard widget */
export const DASHBOARD_AI_FEED = [
  { tag: 'Opportunity', type: 'opportunity', title: 'Enterprise segment +34% uplift', text: 'Target enterprise campaign recommended for Q3.' },
  { tag: 'Alert', type: 'alert', title: 'Churn risk in Segment B', text: '142 accounts match previous churn patterns.' },
  { tag: 'Trend', type: 'trend', title: 'Mobile traffic at 58%', text: 'Mobile converts at 2.1% vs 6.4% desktop.' },
];

/** Settings page configuration */
export const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'workspace', label: 'Workspace', icon: '🏢' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'integrations', label: 'Integrations', icon: '🔗' },
  { id: 'billing', label: 'Billing', icon: '💳' },
];

export const INTEGRATIONS = [
  { id: 'salesforce', name: 'Salesforce', desc: 'CRM data sync', connected: true, icon: '☁' },
  { id: 'stripe', name: 'Stripe', desc: 'Payment analytics', connected: true, icon: '💳' },
  { id: 'slack', name: 'Slack', desc: 'Team notifications', connected: true, icon: '💬' },
  { id: 'google', name: 'Google Analytics', desc: 'Web traffic data', connected: false, icon: '📊' },
  { id: 'hubspot', name: 'HubSpot', desc: 'Marketing automation', connected: false, icon: '🎯' },
  { id: 'snowflake', name: 'Snowflake', desc: 'Data warehouse', connected: false, icon: '❄' },
];
