import Notification from '../models/Notification.js';
import { AppError } from '../utils/errors.js';

export async function listNotifications(userId) {
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50);

  return notifications.map((n) => n.toPublicJSON());
}

export async function markNotificationRead(userId, notificationId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { read: true } },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return notification.toPublicJSON();
}

export async function markAllNotificationsRead(userId) {
  await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
  return { success: true };
}

export async function createNotification(userId, payload) {
  const notification = await Notification.create({
    user: userId,
    title: payload.title,
    message: payload.message,
    type: payload.type || 'default',
    read: payload.read ?? false,
  });

  return notification.toPublicJSON();
}

export default {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
};
