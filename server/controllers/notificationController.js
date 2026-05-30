import * as notificationService from '../services/notificationService.js';

export async function listNotifications(req, res, next) {
  try {
    const notifications = await notificationService.listNotifications(req.user._id);
    res.json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
}

export async function markRead(req, res, next) {
  try {
    const notification = await notificationService.markNotificationRead(req.user._id, req.params.id);
    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
}

export async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllNotificationsRead(req.user._id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
}

export default { listNotifications, markRead, markAllRead };
