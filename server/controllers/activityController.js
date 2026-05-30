import * as activityService from '../services/activityService.js';

export async function listActivities(req, res, next) {
  try {
    const activities = await activityService.listActivities(req.organizationId);
    res.json({ success: true, activities });
  } catch (error) {
    next(error);
  }
}

export default { listActivities };
