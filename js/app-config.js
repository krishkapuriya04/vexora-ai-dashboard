/**
 * VEXORA Static App Configuration
 * UI-only constants (navigation, settings, landing demos, insights placeholders).
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

export const AI_INSIGHTS = [
  { id: 1, type: 'opportunity', tag: 'Opportunity', title: 'Enterprise segment showing 34% uplift', text: 'Accounts with 50+ seats upgraded 34% faster this quarter. Recommend targeted enterprise campaign in Q3.', confidence: 92, impact: 'High', time: '2 min ago' },
  { id: 2, type: 'alert', tag: 'Risk Alert', title: 'Churn risk in Segment B accounts', text: '142 accounts exhibit engagement patterns matching previously churned customers. Proactive outreach recommended within 7 days.', confidence: 87, impact: 'Critical', time: '15 min ago' },
  { id: 3, type: 'trend', tag: 'Trend', title: 'Mobile conversion gap widening', text: 'Mobile traffic is 58% of total but converts at 2.1% vs 6.4% desktop. UX optimization could recover ~$180K MRR.', confidence: 94, impact: 'Medium', time: '1 hr ago' },
  { id: 4, type: 'forecast', tag: 'Forecast', title: 'Q3 revenue projected at $3.2M', text: 'Based on current pipeline velocity and seasonality models, Q3 revenue forecast exceeds target by 8.2%.', confidence: 89, impact: 'High', time: '2 hrs ago' },
  { id: 5, type: 'opportunity', tag: 'Opportunity', title: 'Cross-sell potential in existing base', text: '2,340 accounts use only 1 of 4 available modules. AI-identified cross-sell could add $420K ARR.', confidence: 85, impact: 'High', time: '3 hrs ago' },
  { id: 6, type: 'alert', tag: 'Anomaly', title: 'Unusual API usage spike detected', text: 'API calls increased 340% from 3 enterprise accounts. Verify legitimate usage or investigate potential abuse.', confidence: 78, impact: 'Medium', time: '5 hrs ago' },
];

export const FORECAST_DATA = {
  labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  actual: [258, 272, 289, null, null, null],
  predicted: [258, 272, 289, 305, 322, 340],
  lower: [258, 272, 289, 290, 305, 318],
  upper: [258, 272, 289, 320, 340, 365],
};

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

export const VIDEO_CONFIG = {
  thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
  videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1',
  title: 'VEXORA Product Walkthrough',
  duration: '3:42',
};

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
