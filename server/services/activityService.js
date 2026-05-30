import Activity from '../models/Activity.js';

function formatRelativeTime(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export async function listActivities(organizationId, limit = 20) {
  const activities = await Activity.find({ organization: organizationId })
    .sort({ timestamp: -1 })
    .limit(limit);

  return activities.map((item) => ({
    id: item._id.toString(),
    type: item.type,
    title: item.title,
    desc: item.description,
    description: item.description,
    time: formatRelativeTime(item.timestamp),
    icon: item.icon,
    timestamp: item.timestamp,
  }));
}

export async function createActivity(organizationId, payload) {
  const activity = await Activity.create({
    organization: organizationId,
    title: payload.title,
    description: payload.description,
    type: payload.type || 'default',
    icon: payload.icon || '📌',
    timestamp: payload.timestamp || new Date(),
  });

  return activity.toPublicJSON();
}

export default { listActivities, createActivity };
